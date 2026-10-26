import gzip
import html
import json
import os
import re
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from html.parser import HTMLParser

import common
import slop

MAX_PICKS = 3
MIN_PICKS = 2
RANK_SIZE = 6
PICK_TOKENS = 8000
SOURCE_CHARS = 8000
DRAFT_TOKENS = 6000
MIN_SOURCE = 600
TELEGRAM_LIMIT = 4000
DEFAULT_WINDOW = timedelta(hours=24)
MAX_WINDOW = timedelta(hours=72)
CHOICE_NOTE = 'La scelta viene letta dal giro del mattino.'
HF_SKIP = re.compile(r'uncensor|nsfw|nude|porn|undress|hentai', re.I)
ROUNDUP = re.compile(r'gift guide|round-?up|\b(hottest|best|top)\b.*\b(gadgets|devices|wearables|deals|gifts)\b'
                     r'|\b(gadgets?|devices?) (for|to buy)\b|you should know|\btop \d+\b'
                     r'|^\d+ (ways|reasons|things|tools|apps|gadgets|tips|tricks|best|ai)\b', re.I)
REPO_CHARS = 12000
REPO_SECTIONS = re.compile(r'feature|what it does|overview|about|highlight|demo|install|setup|getting started|quick ?start'
                           r'|usage|how to use|run|download|requirement|prerequisite|hardware|system|gpu|caratteristic|installa|requisit|uso', re.I)
REPO_HINT = """Questa fonte è un progetto open source su GitHub o Hugging Face e il testo è il suo README o la sua scheda, in Markdown.
Spiega cosa fa il progetto in concreto, funzione per funzione, e se una persona comune può usarlo:
se c'è un'app, un sito o una demo pronta, dillo e spiega come aprirla.
Installazione e uso:
- Se la fonte contiene i passi per installarlo o usarlo, scrivi una sezione con i passi veri come elenco numerato.
  Metti i comandi in blocchi di codice ``` copiandoli esattamente dalla fonte, senza modificarli e senza aggiungerne.
  Subito prima dei passi elenca i requisiti scritti nella fonte: sistema operativo, scheda video e memoria video, spazio su disco.
- Se la fonte non contiene i passi, non scrivere nessuna sezione su installazione o uso e non dire genericamente "si scarica" o "serve il terminale"."""
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
Ricevi una lista di notizie numerate. Ordinale per interesse e restituisci le {RANK_SIZE} migliori, dalla più interessante.
Il blog pubblica ogni sera: le prime {MIN_PICKS} della tua classifica diventano articoli, quindi metti in cima le migliori disponibili anche se nessuna è perfetta.
Conta di più quello che un lettore italiano curioso di tecnologia vorrebbe leggere:
qualcosa che può usare o provare, che cambia un servizio che usa già, che lo riguarda per sicurezza, privacy, lavoro o costi, o di cui sentirà parlare.
Metti in fondo o lascia fuori: ricerca senza ricadute pratiche, eventi, nomine, finanziamenti, partnership generiche, opinioni senza fatti nuovi.
Preferisci una singola notizia precisa o un progetto concreto a liste del tipo "i migliori", "X cose da sapere" o raccolte di prodotti.
Scarta sempre le rassegne di gadget e prodotti di consumo da comprare.
Le voci [GitHub] e [Hugging Face] sono progetti open source di tendenza: sceglili se riguardano l'intelligenza artificiale e si possono spiegare
in parole semplici, cosa fanno e chi può provarli, anche se per installarli serve un minimo di pratica.
Esempi graditi: un robot open source da costruire, un modello che si prova nel browser, uno strumento che gira sul proprio computer.
Formato della risposta: solo un oggetto JSON, senza testo prima o dopo, con due chiavi.
- "nessuna_ai": true solo se nessuna notizia della lista riguarda l'intelligenza artificiale, altrimenti false.
- "classifica": una lista di almeno {MIN_PICKS} e al massimo {RANK_SIZE} oggetti, dal più interessante. Ogni oggetto ha:
  "id", il numero della notizia nella lista ricevuta;
  "motivo", perché interessa a un lettore italiano, scritto da te con il fatto concreto della notizia;
  "consigliata", true se merita davvero un articolo, altrimenti false.
Gli "id" devono essere numeri presenti nella lista, tutti diversi."""

DRAFT_PROMPT = f"""Sei la redazione di un blog italiano di notizie sull'intelligenza artificiale per il grande pubblico.
Scrivi un articolo sulla notizia che ricevi, basandoti solo sul testo della fonte.
Il testo della fonte può contenere parti del sito che non sono la notizia: ignora promozioni, abbonamenti, newsletter, inviti a seguire
il sito sui social, biografie degli autori, link e titoli di altri articoli, menu e avvisi sui cookie.
Non parlare mai delle offerte, degli abbonamenti o dei podcast del sito che pubblica la notizia, a meno che la notizia sia proprio quella.

{STYLE}

Titoletti:
- Ogni titoletto "## " dice esattamente cosa c'è nel paragrafo sotto, con la cosa concreta: "Clona una voce da 10 secondi di audio", non "Cosa cambia per te".
- Vietati i titoletti generici: "Cos'è", "Cosa cambia per...", "Perché è importante", "Panoramica", "Il contesto", "In breve", "I vantaggi", "Cosa sapere".
- Se scrivi un titoletto su installazione o uso, sotto devono esserci passi numerati o comandi in un blocco di codice.

Aziende:
- "perAzienda" contiene solo usi concreti per una piccola azienda o un professionista: un lavoro preciso che può fare con questo strumento,
  oppure un costo, un rischio o un obbligo di legge che lo riguarda.
- Non sono usi aziendali: la licenza del software, "si può integrare nei flussi di lavoro", "può aumentare la produttività" e frasi simili.
- Se non c'è un uso concreto scritto nella fonte, "perAzienda" è una lista vuota e "forBusiness" è false.

Rispondi solo con JSON con queste chiavi:
- "title": titolo in italiano, al massimo 80 caratteri, descrittivo.
- "description": una frase che dice cosa cambia per il lettore.
- "category": una tra {', '.join(c for c in common.CATEGORIES if c != 'funziona-davvero')}.
- "forBusiness": true solo se "perAzienda" non è vuota, altrimenti false.
- "perTe": da 2 a 4 frasi brevi su cosa cambia per il lettore.
- "perAzienda": da 0 a 3 frasi brevi con usi aziendali concreti, secondo le regole sopra; lista vuota negli altri casi.
- "body": il corpo in Markdown, con titoletti "## ", senza ripetere il titolo e senza link."""


JUNK_ATTR = re.compile(r'subscri|newsletter|promo|related|share|sharing|comment|cookie|paywall|social|advert|sponsor|signup'
                       r'|(?:^|[\s_-])ads?(?:$|[\s_-])', re.I)
CTA_LINE = re.compile(r'\b(subscribe|sign up|newsletter|follow us|follow topics|read more|abbonati|iscriviti|ad-free)\b'
                      r'|\bsubscribers? (get|can|have|receive)\b|^(image|photo|illustration|credit)s?( by)?:', re.I)
CTA_MAX = 300
IMAGE_TRIES = 8
NOT_PICTURE = re.compile(r'shields\.io|badgen|badge|travis-ci|codecov|/workflows/|star-history|contrib\.rocks|logo|icon'
                         r'|avatar|sponsor|favicon|emoji|\.svg(?:$|\?)', re.I)
END_MARKER = re.compile(r'(most popular|popular|trending|related( articles| stories)?|latest in .{1,30}|more from .{1,40}'
                        r'|read next|topics|recommended|you might also like|leggi anche)', re.I)


class TextParser(HTMLParser):
    SKIP = {'script', 'style', 'noscript', 'svg', 'nav', 'footer', 'header', 'form', 'aside', 'figure', 'figcaption',
            'button', 'iframe', 'template', 'dialog'}
    VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr', 'param'}
    BLOCK = {'p', 'div', 'section', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'td', 'article', 'main', 'tr'}

    def __init__(self):
        super().__init__()
        self.stack, self.chunks, self.count = [], [], 0

    def handle_starttag(self, tag, attrs):
        if tag in self.VOID:
            return
        a = dict(attrs)
        skip = tag in self.SKIP or bool(JUNK_ATTR.search(f"{a.get('class') or ''} {a.get('id') or ''}"))
        self.count += 1
        self.stack.append((tag, self.count, skip))

    def handle_endtag(self, tag):
        for n in range(len(self.stack) - 1, -1, -1):
            if self.stack[n][0] == tag:
                del self.stack[n:]
                return

    def handle_data(self, data):
        if not data.strip() or any(skip for _, _, skip in self.stack):
            return
        ids = lambda name: [i for t, i, _ in self.stack if t == name]
        block = next((i for t, i, _ in reversed(self.stack) if t in self.BLOCK), 0)
        para = next((n for n in range(len(self.stack) - 1, -1, -1) if self.stack[n][0] == 'p'), None)
        holder = self.stack[para - 1][1] if para else None
        self.chunks.append({'text': data, 'block': block, 'article': (ids('article') or [None])[-1],
                            'main': (ids('main') or [None])[0], 'holder': holder})


def html_text(html):
    """Return the article body as lines: the largest <article>, else <main>, else the largest block of paragraphs."""
    p = TextParser()
    p.feed(html)
    chunks = p.chunks
    for key in ('article', 'main', 'holder'):
        sizes = {}
        for c in chunks:
            if c[key] is not None:
                sizes[c[key]] = sizes.get(c[key], 0) + len(c['text'])
        if sizes:
            best = max(sizes, key=sizes.get)
            chunks = [c for c in chunks if c[key] == best]
            break
    lines, last = [], None
    for c in chunks:
        if c['block'] != last or not lines:
            lines.append('')
            last = c['block']
        lines[-1] += c['text']
    lines = [l for l in (' '.join(l.split()) for l in lines) if l and not (len(l) < CTA_MAX and CTA_LINE.search(l))]
    total, before = sum(map(len, lines)), 0
    for n, l in enumerate(lines):
        if before > total * 0.3 and END_MARKER.fullmatch(l):
            lines = lines[:n]
            break
        before += len(l)
    return '\n'.join(lines)


def fetch(url, headers=None, raw=False):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (blog news bot)', **(headers or {})})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = r.read()
        if r.headers.get('Content-Encoding') == 'gzip':
            data = gzip.decompress(data)
        return data if raw else data.decode(r.headers.get_content_charset() or 'utf-8', 'replace')


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
    return [dict(i, source=source, title=' '.join(html.unescape(i['title']).split())) for i in items if i['link'] and i['date']]


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


def parse_hf(data, source, now, kind):
    items = []
    for d in json.loads(data):
        repo = d.get('id', '')
        if not repo or HF_SKIP.search(repo):
            continue
        card = d.get('cardData') or {}
        base = f'https://huggingface.co/spaces/{repo}' if kind == 'spaces' else f'https://huggingface.co/{repo}'
        about = card.get('short_description') or card.get('title') or d.get('pipeline_tag') or ''
        items.append({'title': repo, 'link': base, 'date': now, 'source': source, 'kind': 'repo',
                      'readme': f'{base}/raw/main/README.md', 'summary': f"{about} ({d.get('likes', 0)} like)"})
    return items


def card_text(readme):
    readme = re.sub(r'\A---\n.*?\n---\n', '', readme.replace('\r\n', '\n'), count=1, flags=re.S)
    return readme.replace('Check out the configuration reference at https://huggingface.co/docs/hub/spaces-config-reference', '')


def readme_text(md, limit=REPO_CHARS):
    """Return the README as Markdown: the intro plus the feature, install, usage and requirement sections first."""
    md = re.sub(r'<!--.*?-->', '', md, flags=re.S)
    md = re.sub(r'\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)|!\[[^\]]*\]\([^)]*\)', '', md)
    md = re.sub(r'<[^>]+>', '', md)
    md = re.sub(r'\n{3,}', '\n\n', md).strip()
    parts, fence = [[]], False
    for line in md.split('\n'):
        fence ^= line.lstrip().startswith('```')
        if not fence and re.match(r'#{1,6} ', line) and parts[-1]:
            parts.append([])
        parts[-1].append(line)
    sections = ['\n'.join(p).strip() for p in parts]
    keep = [0] + [n for n, s in enumerate(sections) if n and REPO_SECTIONS.search(s.split('\n', 1)[0])]
    keep += [n for n in range(len(sections)) if n not in keep]
    out, used = {}, 0
    for n in keep:
        s = sections[n][:4000]
        if used + len(s) > limit:
            continue
        out[n], used = s, used + len(s) + 2
    return '\n\n'.join(out[n] for n in sorted(out))


def readme_image(md, base):
    """Return the first README image at least MIN_IMAGE_WIDTH wide, skipping badges and logos."""
    found = re.findall(r'!\[[^\]]*\]\(\s*<?([^)\s>]+)', md) + re.findall(r'<img[^>]+src=["\']([^"\']+)', md, re.I)
    order = sorted(found, key=lambda u: md.find(u))
    urls = [urllib.parse.urljoin(base, src) for src in dict.fromkeys(order)]
    for url in [u for u in urls if u.startswith('http') and not NOT_PICTURE.search(u)][:IMAGE_TRIES]:
        url = re.sub(r'^https://github\.com/([^/]+/[^/]+)/blob/', r'https://raw.githubusercontent.com/\1/', url)
        size = common.remote_image_size(url)
        if size and size[1] >= common.MIN_IMAGE_WIDTH:
            return url
    return None


def og_image(page, base):
    m = re.search(r'<meta[^>]+(?:property|name)=["\'](?:og:image|twitter:image)["\'][^>]*>', page, re.I)
    src = m and re.search(r'content=["\']([^"\']+)', m.group(0))
    url = urllib.parse.urljoin(base, html.unescape(src.group(1))) if src else None
    size = url and common.remote_image_size(url)
    return url if size and size[1] >= common.MIN_IMAGE_WIDTH else None


def credit(item, url):
    return {'url': url, 'credit': f"{item['source']}: {item['title']}" if item.get('kind') == 'repo' else item['source'],
            'creditUrl': item['link']} if url else None


def source_text(item):
    """Return (text for the model, image dict or None)."""
    if item.get('readme'):
        md = card_text(fetch(item['readme']))
        base = item['link'] + '/resolve/main/'
        url = readme_image(md, base)
        if not url and '/spaces/' in item['link']:
            try:
                url = og_image(fetch(item['link']), item['link'])
            except Exception:
                url = None
        return f"{item['title']}: {item['summary']}\n\n{readme_text(md)}", credit(item, url)
    if item.get('kind') == 'repo':
        md = fetch(f"https://api.github.com/repos/{item['title']}/readme", {'Accept': 'application/vnd.github.raw'})
        url = readme_image(md, f"https://raw.githubusercontent.com/{item['title']}/HEAD/")
        return f"{item['title']}: {item['summary']}\n\n{readme_text(md)}", credit(item, url)
    page = fetch(item['link'])
    url = og_image(page, item['link']) if item.get('images') == 'og' else None
    return html_text(page)[:SOURCE_CHARS], credit(item, url)


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
            tipo = f.get('tipo', '')
            page = fetch(f['url'], raw=not tipo)
            if tipo == 'github-trending':
                items += parse_trending(page, f['name'], now)
            elif tipo.startswith('hf-'):
                items += parse_hf(page, f['name'], now, tipo[3:])
            else:
                items += [dict(i, images=f.get('immagini')) for i in parse_feed(page, f['name'])]
        except Exception as e:
            print(f"feed {f['name']} non letto: {e}", file=sys.stderr)
    fresh = {i['link']: i for i in items
             if i['link'] not in seen and start <= i['date'] <= now and not ROUNDUP.search(i['title'])}
    return list(fresh.values())


def rank_ids(ranking, size):
    """Return [(id, entry)] for valid, distinct ids in model order."""
    out, ids = [], set()
    for c in ranking if isinstance(ranking, list) else []:
        n = c.get('id') if isinstance(c, dict) else None
        if isinstance(n, str) and n.strip().isdigit():
            n = int(n)
        if isinstance(n, int) and 0 <= n < size and n not in ids:
            ids.add(n)
            out.append((n, c))
    return out


def pick(items, slots):
    """Return the chosen items, or None when the model gave no usable answer."""
    if not items:
        return []
    listing = '\n'.join(f"{n}. [{i['source']}] {i['title']}: {i['summary'][:300]}" for n, i in enumerate(items))
    messages = [{'role': 'system', 'content': PICK_PROMPT}, {'role': 'user', 'content': listing}]
    need = min(MIN_PICKS, slots, len(items))
    for attempt in range(2):
        try:
            answer = common.llm(messages, max_tokens=PICK_TOKENS, json_mode=True)
            data = common.parse_json(answer)
        except Exception as e:
            print(f'scelta non riuscita: {e}', file=sys.stderr)
            return None
        if data.get('nessuna_ai') is True:
            print('scelta: il modello dice che nessuna notizia riguarda l\'AI')
            return []
        ranking = rank_ids(data.get('classifica'), len(items))
        if len(ranking) >= need or attempt:
            break
        print(f'classifica con {len(ranking)} notizie valide, chiedo di nuovo', file=sys.stderr)
        messages += [{'role': 'assistant', 'content': answer},
                     {'role': 'user', 'content': f'La classifica deve avere almeno {MIN_PICKS} notizie con "id" diversi presi dalla lista. Rispondi di nuovo, solo JSON.'}]
    if not ranking:
        print('scelta non riuscita: classifica vuota senza "nessuna_ai"', file=sys.stderr)
        return None
    seen, chosen = set(), []
    for n, c in ranking:
        seen.add(n)
        take = len(chosen) < min(MIN_PICKS, slots) or (c.get('consigliata') is True and len(chosen) < slots)
        print(f"{'SCELTA ' if take else 'scartata'} #{len(seen)} [{items[n]['source']}] {items[n]['title']}: {c.get('motivo', '')}")
        if take:
            chosen.append(items[n])
    return chosen


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
    d['forBusiness'] = bool(d['perAzienda'])
    return d


def draft_llm(messages):
    model = os.environ.get('LLM_DRAFT_MODEL')
    if model and model != os.environ.get('LLM_MODEL'):
        try:
            return common.llm(messages, max_tokens=DRAFT_TOKENS, model=model, tries=1, json_mode=True)
        except Exception as e:
            print(f'{model} non ha risposto ({e}), uso {os.environ.get("LLM_MODEL")} per questa bozza', file=sys.stderr)
    return common.llm(messages, max_tokens=DRAFT_TOKENS, json_mode=True)


def write_draft(item, text):
    hint = REPO_HINT + '\n\n' if item.get('kind') == 'repo' else ''
    messages = [{'role': 'system', 'content': DRAFT_PROMPT},
                {'role': 'user', 'content': f"{hint}Fonte: {item['source']}\nTitolo: {item['title']}\nURL: {item['link']}\n\nTesto della fonte:\n{text}"}]
    answer = draft_llm(messages)
    draft = validate(common.parse_json(answer))
    problems = slop.check(draft, item['source'])
    if problems:
        messages += [{'role': 'assistant', 'content': answer},
                     {'role': 'user', 'content': 'Riscrivi l\'articolo correggendo questi problemi, stesso formato JSON:\n- ' + '\n- '.join(problems)}]
        try:
            draft = validate(common.parse_json(draft_llm(messages)))
            problems = slop.check(draft, item['source'])
        except Exception as e:
            problems.append(f'riscrittura non riuscita: {e}')
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
    parts[-1] += f'\n\n{CHOICE_NOTE}'
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
            text, image = source_text(item)
            if len(text) < MIN_SOURCE:
                print(f"fonte troppo corta per {item['link']} ({len(text)} caratteri), notizia saltata", file=sys.stderr)
                written.append(item['link'])
                continue
            draft, problems = write_draft(item, text)
        except Exception as e:
            print(f"bozza non scritta per {item['link']}, riprovo alla prossima corsa: {e}", file=sys.stderr)
            failed.append(item)
            continue
        written.append(item['link'])
        slug = common.slugify(draft['title'], taken)
        taken.add(slug)
        md = common.render(draft, now.date().isoformat(), {'title': f"{item['source']}: {item['title']}", 'url': item['link']}, image)
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
