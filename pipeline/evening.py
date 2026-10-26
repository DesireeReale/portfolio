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
REPO_HINT = """Questa fonte è un progetto open source su GitHub e il testo è il suo README.
Spiega cosa fa il progetto, per chi è utile e se una persona comune può usarlo:
se c'è un'app o un sito pronto, oppure se serve installarlo e saper usare il terminale."""
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
Ricevi una lista di notizie numerate. Scegli da 1 a {MAX_PICKS} notizie che un lettore italiano curioso di tecnologia vorrebbe leggere:
qualcosa che può usare o provare, che cambia un servizio che usa già, che lo riguarda per sicurezza, privacy, lavoro o costi, o di cui sentirà parlare.
Scarta: ricerca senza ricadute pratiche, eventi, nomine, finanziamenti, partnership generiche, opinioni senza fatti nuovi.
Le voci [GitHub] sono progetti open source di tendenza: sceglili se riguardano l'intelligenza artificiale e si possono spiegare
in parole semplici, cosa fanno e chi può provarli, anche se per installarli serve un minimo di pratica.
Rispondi con zero notizie solo se nessuna riguarda l'intelligenza artificiale.
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


def fetch(url, headers=None):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (blog news bot)', **(headers or {})})
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


def parse_trending(html, source, now):
    items = []
    for block in html.split('<article class="Box-row">')[1:]:
        name = re.search(r'<h2[^>]*>\s*<a[^>]*href="/([^"/]+/[^"/]+)"', block)
        if not name:
            continue
        repo = name.group(1)
        desc = re.search(r'<p class="col-9[^"]*">(.*?)</p>', block, re.S)
        total = re.search(rf'href="/{re.escape(repo)}/stargazers"[^>]*>.*?([\d,]+)\s*</a>', block, re.S)
        today = re.search(r'([\d,]+) stars today', block)
        stars = ', '.join(s for s in [f'{today.group(1)} stelle oggi' if today else '', f'{total.group(1)} in totale' if total else ''] if s)
        items.append({'title': repo, 'link': f'https://github.com/{repo}', 'date': now, 'source': source, 'kind': 'repo',
                      'summary': f"{html_text(desc.group(1)) if desc else ''} ({stars})"})
    return items


def source_text(item):
    if item.get('kind') == 'repo':
        readme = fetch(f"https://api.github.com/repos/{item['title']}/readme", {'Accept': 'application/vnd.github.raw'})
        return f"{item['title']}: {item['summary']}\n\n{html_text(readme)}"[:SOURCE_CHARS]
    return html_text(fetch(item['link']))[:SOURCE_CHARS]


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
            page = fetch(f['url'])
            items += parse_trending(page, f['name'], now) if f.get('tipo') == 'github-trending' else parse_feed(page, f['name'])
        except Exception as e:
            print(f"feed {f['name']} non letto: {e}", file=sys.stderr)
    fresh = {i['link']: i for i in items if i['link'] not in seen and start <= i['date'] <= now}
    return list(fresh.values())


def pick(items, slots):
    """Return the chosen items, or None when the model gave no usable answer."""
    if not items:
        return []
    listing = '\n'.join(f"{n}. [{i['source']}] {i['title']}: {i['summary'][:300]}" for n, i in enumerate(items))
    try:
        data = common.parse_json(common.llm([{'role': 'system', 'content': PICK_PROMPT},
                                             {'role': 'user', 'content': listing}], max_tokens=400))
        ids = [c['id'] for c in data['scelte']]
    except Exception as e:
        print(f'scelta non riuscita: {e}', file=sys.stderr)
        return None
    ids = [n for n in dict.fromkeys(ids) if isinstance(n, int) and 0 <= n < len(items)]
    return [items[n] for n in ids[:slots]]


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
    hint = REPO_HINT + '\n\n' if item.get('kind') == 'repo' else ''
    messages = [{'role': 'system', 'content': DRAFT_PROMPT},
                {'role': 'user', 'content': f"{hint}Fonte: {item['source']}\nTitolo: {item['title']}\nURL: {item['link']}\n\nTesto della fonte:\n{text}"}]
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
    retry_path = common.ROOT / 'pipeline' / 'state' / 'retry.json'
    seen, pending = common.read_json(seen_path, []), common.read_json(pending_path, {})
    common.drafts_dir().mkdir(parents=True, exist_ok=True)
    for slug, p in pending.items():
        draft = common.drafts_dir() / f'{slug}.md'
        if not p['messages'] and draft.exists():
            p['messages'] = try_send(slug, draft.read_text(encoding='utf-8'), p.get('problems', []))
            p['day'] = now.date().isoformat()
    retry = [dict(i, date=datetime.fromisoformat(i['date'])) for i in common.read_json(retry_path, [])]
    retry = [i for i in retry if i['link'] not in seen and now - i['date'] <= MAX_WINDOW][:MAX_PICKS]
    last_run = last_run_path.read_text(encoding='utf-8').strip() if last_run_path.exists() else None
    retry_links = {i['link'] for i in retry}
    items = [i for i in collect(since(now, last_run), now, set(seen)) if i['link'] not in retry_links]
    slots = MAX_PICKS - len(retry)
    picks = pick(items, slots) if slots else None
    taken = {p.stem for p in common.blog_dir().glob('*.md')} | set(pending)
    written, failed = [], []
    for item in retry + (picks or []):
        try:
            draft, problems = write_draft(item, source_text(item))
        except Exception as e:
            print(f"bozza non scritta per {item['link']}, riprovo alla prossima corsa: {e}", file=sys.stderr)
            failed.append(item)
            continue
        written.append(item['link'])
        slug = common.slugify(draft['title'], taken)
        taken.add(slug)
        md = common.render(draft, now.date().isoformat(), {'title': f"{item['source']}: {item['title']}", 'url': item['link']})
        (common.drafts_dir() / f'{slug}.md').write_text(md, encoding='utf-8')
        pending[slug] = {'messages': try_send(slug, md, problems), 'day': now.date().isoformat(), 'problems': problems}
        common.write_json(pending_path, pending)
    if picks == [] and not retry:
        try:
            common.telegram('sendMessage', chat_id=common.chat_id(), text=f'Nessuna notizia scelta stasera ({len(items)} candidate).')
        except Exception as e:
            print(f'Telegram non raggiungibile: {e}', file=sys.stderr)
    failed_links = {i['link'] for i in failed}
    if picks is not None:
        written += [i['link'] for i in items if i['link'] not in failed_links]
        last_run_path.write_text(now.isoformat() + '\n', encoding='utf-8')
    common.write_json(pending_path, pending)
    common.write_json(seen_path, (seen + list(dict.fromkeys(written)))[-1000:])
    common.write_json(retry_path, [dict(i, date=i['date'].isoformat()) for i in failed])


if __name__ == '__main__':
    run()
