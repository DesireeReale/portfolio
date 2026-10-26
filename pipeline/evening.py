import gzip
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from html.parser import HTMLParser

import common
import slop

MAX_PICKS = 3
SOURCE_CHARS = 8000
TELEGRAM_LIMIT = 4000
DEFAULT_WINDOW = timedelta(hours=24)
MAX_WINDOW = timedelta(hours=72)
AI_ACRONYM = re.compile(r'\b(?:AI|IA)\b')
AI_WORDS = re.compile(r'intelligenza artificiale|artificial intelligence|chatgpt|openai|anthropic|claude|gemini|copilot|'
                      r'deepseek|mistral|grok|perplexity|chatbot|\bllm', re.I)
ATOM = '{http://www.w3.org/2005/Atom}'

STYLE = """Scrivi in italiano semplice, per lettori comuni che non sono tecnici. Dai del tu al lettore.
Regole di stile, tutte obbligatorie:
- Frasi brevi, al massimo 25 parole.
- Niente introduzione di riscaldamento e niente conclusione che riassume: parti dal fatto e fermati quando i fatti finiscono.
- Ogni paragrafo contiene un fatto concreto preso dalla fonte: cos'è, cosa cambia per chi legge, come si usa.
- Usa solo fatti, numeri, date e nomi presenti nel testo della fonte. Se un'informazione manca, non inventarla e non stimarla.
- Vietati: aggettivi enfatici (rivoluzionario, incredibile, straordinario), domande retoriche, la formula "non solo... ma anche", elenchi di tre aggettivi, incisi tra trattini lunghi, punti esclamativi, emoji.
- Vietate anche frasi fatte come "in un mondo in continua evoluzione", "è fondamentale", "scopriamo insieme", "in conclusione", "un passo avanti", "a portata di mano", "in questo articolo".
- Lunghezza del corpo: tra 300 e 550 parole."""

PICK_PROMPT = f"""Sei la redazione di un blog italiano di notizie sull'intelligenza artificiale per il grande pubblico.
Ricevi una lista di notizie numerate. Scegli al massimo {MAX_PICKS} notizie davvero utili a un lettore italiano comune:
qualcosa che può usare, che cambia un servizio che usa già, o che lo riguarda per sicurezza, privacy o costi.
Scarta: ricerca senza ricadute pratiche, annunci per soli sviluppatori, eventi, nomine, finanziamenti, partnership generiche, servizi non disponibili in Italia.
Zero notizie è una risposta valida e frequente.
Rispondi solo con JSON: {{"scelte": [{{"id": 0, "motivo": "una frase"}}]}}"""

DRAFT_PROMPT = f"""Sei la redazione di un blog italiano di notizie sull'intelligenza artificiale per il grande pubblico.
Scrivi un articolo sulla notizia che ricevi, basandoti solo sul testo della fonte.

{STYLE}

Rispondi solo con JSON con queste chiavi:
- "title": titolo in italiano, al massimo 80 caratteri, descrittivo.
- "description": una frase che dice cosa cambia per il lettore.
- "category": una tra {', '.join(c for c in common.CATEGORIES if c != 'funziona-davvero')}.
- "forBusiness": true se la notizia interessa anche piccole aziende e professionisti, altrimenti false.
- "perTe": da 2 a 4 frasi brevi su cosa cambia per il lettore.
- "perAzienda": da 0 a 3 frasi brevi su cosa cambia per una piccola azienda; lista vuota se non c'entra.
- "body": il corpo in Markdown, con titoletti "## ", senza ripetere il titolo e senza link."""


class TextParser(HTMLParser):
    SKIP = {'script', 'style', 'noscript', 'svg', 'nav', 'footer', 'header', 'form'}

    def __init__(self):
        super().__init__()
        self.parts, self.depth = [], 0

    def handle_starttag(self, tag, attrs):
        if tag in self.SKIP:
            self.depth += 1

    def handle_endtag(self, tag):
        if tag in self.SKIP and self.depth:
            self.depth -= 1

    def handle_data(self, data):
        if not self.depth and data.strip():
            self.parts.append(data.strip())


def html_text(html):
    p = TextParser()
    p.feed(html)
    return ' '.join(p.parts)


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (blog news bot)'})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = r.read()
        if r.headers.get('Content-Encoding') == 'gzip':
            data = gzip.decompress(data)
        return data.decode(r.headers.get_content_charset() or 'utf-8', 'replace')


def parse_date(s):
    s = (s or '').strip()
    try:
        d = parsedate_to_datetime(s)
    except (TypeError, ValueError):
        try:
            d = datetime.fromisoformat(s.replace('Z', '+00:00'))
        except ValueError:
            return None
    return d if d.tzinfo else d.replace(tzinfo=timezone.utc)


def parse_feed(xml, source):
    root = ET.fromstring(xml.lstrip())
    items = []
    for it in root.iter('item'):
        items.append({'title': it.findtext('title', ''), 'link': it.findtext('link', '').strip(),
                      'date': parse_date(it.findtext('pubDate')), 'summary': html_text(it.findtext('description', ''))})
    for e in root.iter(ATOM + 'entry'):
        link = next((l.get('href') for l in e.findall(ATOM + 'link') if l.get('rel', 'alternate') == 'alternate'), '')
        items.append({'title': e.findtext(ATOM + 'title', ''), 'link': link or '',
                      'date': parse_date(e.findtext(ATOM + 'published') or e.findtext(ATOM + 'updated')),
                      'summary': html_text(e.findtext(ATOM + 'summary') or e.findtext(ATOM + 'content') or '')})
    return [dict(i, source=source, title=i['title'].strip()) for i in items if i['link'] and i['date']]


def about_ai(item):
    text = f"{item['title']} {item['summary']}"
    return bool(AI_ACRONYM.search(text) or AI_WORDS.search(text))


def since(now, last_run):
    try:
        last = datetime.fromisoformat(last_run)
    except (TypeError, ValueError):
        return now - DEFAULT_WINDOW
    return min(max(last, now - MAX_WINDOW), now - timedelta(hours=1))


def collect(start, now, seen):
    feeds = common.read_json(common.ROOT / 'pipeline' / 'feeds.json', [])
    items = []
    for f in feeds:
        try:
            got = parse_feed(fetch(f['url']), f['name'])
        except Exception as e:
            print(f"feed {f['name']} non letto: {e}", file=sys.stderr)
            continue
        items += [i for i in got if about_ai(i)] if f.get('soloAI') else got
    fresh = {i['link']: i for i in items if i['link'] not in seen and start <= i['date'] <= now}
    return list(fresh.values())


def pick(items):
    if not items:
        return []
    listing = '\n'.join(f"{n}. [{i['source']}] {i['title']}: {i['summary'][:300]}" for n, i in enumerate(items))
    try:
        data = common.parse_json(common.llm([{'role': 'system', 'content': PICK_PROMPT},
                                                     {'role': 'user', 'content': listing}], max_tokens=400))
        ids = [c['id'] for c in data['scelte']]
    except (ValueError, KeyError, TypeError) as e:
        print(f'scelta non valida: {e}', file=sys.stderr)
        return []
    ids = [n for n in dict.fromkeys(ids) if isinstance(n, int) and 0 <= n < len(items)]
    return [items[n] for n in ids[:MAX_PICKS]]


def validate(d):
    d = {k: d.get(k) for k in ('title', 'description', 'category', 'forBusiness', 'perTe', 'perAzienda', 'body')}
    for k in ('title', 'description', 'body'):
        if not isinstance(d[k], str) or not d[k].strip():
            raise ValueError(f'campo "{k}" mancante')
        d[k] = d[k].strip()
    if d['category'] not in common.CATEGORIES or d['category'] == 'funziona-davvero':
        raise ValueError(f"categoria non valida: {d['category']}")
    d['perAzienda'] = d['perAzienda'] or []
    for k in ('perTe', 'perAzienda'):
        if not isinstance(d[k], list) or not all(isinstance(p, str) and p.strip() for p in d[k]):
            raise ValueError(f'"{k}" deve essere una lista di frasi')
        d[k] = [p.strip() for p in d[k]]
    if not 2 <= len(d['perTe']) <= 4:
        raise ValueError('"perTe" deve avere da 2 a 4 punti')
    d['forBusiness'] = bool(d['forBusiness']) or d['category'] == 'per-la-tua-azienda'
    return d


def write_draft(item, text):
    messages = [{'role': 'system', 'content': DRAFT_PROMPT},
                {'role': 'user', 'content': f"Fonte: {item['source']}\nTitolo: {item['title']}\nURL: {item['link']}\n\nTesto della fonte:\n{text}"}]
    answer = common.llm(messages, max_tokens=2000)
    draft = validate(common.parse_json(answer))
    problems = slop.check(draft)
    if problems:
        messages += [{'role': 'assistant', 'content': answer},
                     {'role': 'user', 'content': 'Riscrivi l\'articolo correggendo questi problemi, stesso formato JSON:\n- ' + '\n- '.join(problems)}]
        try:
            draft = validate(common.parse_json(common.llm(messages, max_tokens=2000)))
            problems = slop.check(draft)
        except (ValueError, TypeError) as e:
            problems.append(f'riscrittura non valida: {e}')
    missing = slop.facts(draft, text)
    if missing:
        problems.append('non trovati nella fonte: ' + ', '.join(missing))
    return draft, problems


def chunks(text):
    out = []
    while len(text) > TELEGRAM_LIMIT:
        cut = text.rfind('\n\n', 0, TELEGRAM_LIMIT)
        cut = cut if cut > 0 else TELEGRAM_LIMIT
        out.append(text[:cut])
        text = text[cut:].lstrip('\n')
    return out + [text]


def send_draft(slug, md, problems):
    head = ('DA CONTROLLARE\n' + '\n'.join(f'- {p}' for p in problems) if problems else 'BOZZA') + f'\n{slug}\n\n'
    parts = chunks(head + md)
    buttons = {'inline_keyboard': [[{'text': 'Approva', 'callback_data': f'ok:{slug}'},
                                    {'text': 'Scarta', 'callback_data': f'no:{slug}'}]]}
    ids = []
    for n, part in enumerate(parts):
        extra = {'reply_markup': buttons} if n == len(parts) - 1 else {}
        ids.append(common.telegram('sendMessage', chat_id=common.chat_id(), text=part,
                                   disable_web_page_preview=True, **extra)['message_id'])
    return ids


def try_send(slug, md, problems):
    try:
        return send_draft(slug, md, problems)
    except Exception as e:
        print(f'Telegram non raggiungibile, bozza {slug} tenuta per il prossimo invio: {e}', file=sys.stderr)
        return []


def run(now=None):
    now = now or datetime.now(timezone.utc)
    seen_path = common.ROOT / 'pipeline' / 'state' / 'seen.json'
    pending_path = common.drafts_dir() / 'pending.json'
    last_run_path = common.ROOT / 'pipeline' / 'state' / 'last_run.txt'
    seen, pending = common.read_json(seen_path, []), common.read_json(pending_path, {})
    common.drafts_dir().mkdir(parents=True, exist_ok=True)
    for slug, p in pending.items():
        draft = common.drafts_dir() / f'{slug}.md'
        if not p['messages'] and draft.exists():
            p['messages'] = try_send(slug, draft.read_text(encoding='utf-8'), p.get('problems', []))
            p['day'] = now.date().isoformat()
    last_run = last_run_path.read_text(encoding='utf-8').strip() if last_run_path.exists() else None
    items = collect(since(now, last_run), now, set(seen))
    picks = pick(items)
    taken = {p.stem for p in common.blog_dir().glob('*.md')} | set(pending)
    for item in picks:
        try:
            text = html_text(fetch(item['link']))[:SOURCE_CHARS]
            draft, problems = write_draft(item, text)
        except Exception as e:
            print(f"bozza non scritta per {item['link']}: {e}", file=sys.stderr)
            continue
        slug = common.slugify(draft['title'], taken)
        taken.add(slug)
        md = common.render(draft, now.date().isoformat(), {'title': f"{item['source']}: {item['title']}", 'url': item['link']})
        (common.drafts_dir() / f'{slug}.md').write_text(md, encoding='utf-8')
        pending[slug] = {'messages': try_send(slug, md, problems), 'day': now.date().isoformat(), 'problems': problems}
        common.write_json(pending_path, pending)
    if not picks:
        try:
            common.telegram('sendMessage', chat_id=common.chat_id(), text=f'Nessuna notizia scelta stasera ({len(items)} candidate).')
        except Exception as e:
            print(f'Telegram non raggiungibile: {e}', file=sys.stderr)
    common.write_json(pending_path, pending)
    common.write_json(seen_path, (seen + [i['link'] for i in items])[-1000:])
    last_run_path.write_text(now.isoformat() + '\n', encoding='utf-8')


if __name__ == '__main__':
    run()
