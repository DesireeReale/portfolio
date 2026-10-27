import re

BANNED = [
    'in un mondo in continua evoluzione', 'in un mondo sempre più', 'è fondamentale', 'è essenziale', 'è cruciale',
    'è importante sottolineare', 'è importante notare', 'vale la pena sottolineare', 'va sottolineato',
    'scopriamo insieme', 'vediamo insieme', 'in conclusione', 'per concludere', 'in sintesi', 'in definitiva',
    'rivoluzion', 'game changer', 'game-changer', 'senza precedenti', "nell'era dell'intelligenza artificiale",
    "nell'era dell'ai", "nell'era digitale", 'un passo avanti', 'a portata di mano', 'a portata di clic',
    'non solo', 'non è solo', 'non soltanto', 'immergiamoci', 'esploriamo', 'in questo articolo', 'nel panorama', 'all\'avanguardia',
    'svolta epocale', 'a 360 gradi', 'sfruttare il potenziale', 'il potenziale dell', 'straordinari',
    'incredibil', 'cambia le regole del gioco', 'il futuro è qui', 'senza dubbio', 'potente strumento',
    'strumento potente', 'apre nuove possibilità', 'nuove frontiere', 'tuffiamoci',
    'scopri', 'ecco come', 'ecco perché', 'ecco cosa', 'preparati a', "di' addio", 'dì addio', 'sei pronto',
    'non perdere', 'da non perdere', 'tutto quello che devi sapere', 'tutto ciò che devi sapere', 'il segreto per',
]
OPENER = re.compile(r"\s*(?:ecco|immagina|preparati|pronti|pronto|vuoi|finalmente|addio|basta|novità)\b")
ADJ = re.compile(r'(?:ale|ali|ile|ili|iv[oaie]|os[oaie]|ante|anti|ente|enti|ic[oaie]|iche|abile|ibile|evole|ari[oae]?)$')
ADJ_STEMS = {'semplic', 'veloc', 'sicur', 'potent', 'facil', 'modern', 'complet', 'rapid', 'nuov', 'chiar', 'innovativ'}
TRIAD = re.compile(r"\b([a-zà-ù]+), ([a-zà-ù]+),? e ([a-zà-ù]+)\b")
EMOJI = re.compile('[\U0001F000-\U0001FAFF☀-➿⭐⬆↔-↪]')
MAX_WORDS_SENTENCE = 30
MIN_WORDS, MAX_WORDS = 250, 600
CODE_BLOCK = re.compile(r'```[^\n]*\n(.*?)```', re.S)
INLINE_CODE = re.compile(r'`[^`\n]+`')
ALERT = re.compile(r'^[ \t]*>[ \t]*\[!(?:PUNTO|REGOLE|ATTENZIONE)\][ \t]*$', re.M)
LICENCE = re.compile(r'licenz|licens|\b(a?gpl|mit|apache|bsd)\b', re.I)
GENERIC_HEADING = re.compile(r"(cos'è|cosa cambia|perché (è|conta|importa)|panoramica|il contesto|in breve|i vantaggi|vantaggi"
                             r"|cosa (c'è da |devi )?sapere|cosa significa|le novità|introduzione|conclusion|i dettagli)\b", re.I)
PROMO_VERB = r'(?:abbona|iscriv|subscri|sottoscriv)'
PROMO = re.compile(r'(?:^|[.:]\s+|-\s+)abbonati\b|\biscriviti\b|\biscriversi\b|\bnewsletter di\b'
                   r'|\bsegui(?:ci|teci|te)?\b[^.\n]{0,40}?\bsu\b|\bsenza pubblicità\b', re.M)
HOWTO_HEADING =re.compile(r'install|scaric|come (si )?(usa|prova|avvi)|come usarl|come provarl|primi passi|avvio', re.I)


def plain(text):
    text = re.sub(r'\]\([^)]*\)', ']', text)
    return text.replace('’', "'").replace('‘', "'").replace('\xa0', ' ').replace(' ', ' ')


def sentences(text):
    for line in plain(text).splitlines():
        line = re.sub(r'^\s*(?:#+|[-*>]|\d+\.)\s*', '', line)
        yield from (s for s in re.split(r'(?<=[.!?])\s+', line) if s.strip())


def is_adj(w):
    return bool(ADJ.search(w)) or w[:-1] in ADJ_STEMS


def text_problems(text, short):
    low = text.lower()
    problems = [f'frase vietata: "{p}"' for p in BANNED if re.search(r'(?<!\w)' + re.escape(p), low)]
    opener = OPENER.match(low)
    if short and opener:
        problems.append(f'apertura da pubblicità: "{opener.group(0).strip()}"')
    if '!' in text:
        problems.append(f"punti esclamativi: {text.count('!')}")
    if EMOJI.search(text):
        problems.append('emoji presenti')
    for line in text.splitlines():
        if '?' in line and not line.lstrip().startswith('#'):
            problems.append(f'domanda retorica: "{line.strip()[:80]}"')
    for m in TRIAD.finditer(low):
        if all(is_adj(w) for w in m.groups()):
            problems.append(f'tripletta di aggettivi: "{m.group(0)}"')
    for s in sentences(text):
        n = len(re.findall(r'\w+', s))
        if n > MAX_WORDS_SENTENCE:
            problems.append(f'frase troppo lunga ({n} parole): "{s[:60]}…"')
    return problems


def promo_problems(text, outlet=None):
    low = plain(text).lower()
    problems = [f'promozione della fonte: "{m.group(0)}"' for m in PROMO.finditer(low)]
    if outlet:
        name = re.escape(outlet.lower())
        for m in re.finditer(rf'{name}\W+(?:\w+\W+){{0,4}}?{PROMO_VERB}|{PROMO_VERB}\w*\W+(?:\w+\W+){{0,4}}?{name}', low):
            problems.append(f'promozione di {outlet}: "{m.group(0)}"')
    return list(dict.fromkeys(problems))


def check(draft, outlet=None):
    """Return the list of style problems in a draft dict (title, description, perTe, perAzienda, body)."""
    fields = [('titolo', draft['title']), ('descrizione', draft['description']),
              *(('perTe', p) for p in draft['perTe']), *(('perAzienda', p) for p in draft['perAzienda']), ('corpo', draft['body'])]
    problems = []
    for field, text in fields:
        problems += [f'{field}: {p}' for p in text_problems(plain(prose(text)), field != 'corpo')]
    full = '\n'.join(text for _, text in fields)
    if full.count('—') > 1:
        problems.append(f"troppi trattini lunghi (—): {full.count('—')}")
    words = len(re.findall(r'\w+', plain(prose(draft['body']))))
    if not MIN_WORDS <= words <= MAX_WORDS:
        problems.append(f'lunghezza del testo {words} parole (servono {MIN_WORDS}-{MAX_WORDS})')
    problems += [f'perAzienda: la licenza non è un uso aziendale: "{p[:60]}"' for p in draft['perAzienda'] if LICENCE.search(p)]
    return problems + structure_problems(draft['body']) + promo_problems(full, outlet)


def prose(text):
    return ALERT.sub('', INLINE_CODE.sub('', CODE_BLOCK.sub('', text)))


def structure_problems(body):
    problems = []
    for section in re.split(r'^(?=## )', body, flags=re.M):
        heading, _, content = section.partition('\n')
        if not heading.startswith('## '):
            continue
        heading = heading[3:].strip()
        if GENERIC_HEADING.match(heading):
            problems.append(f'titoletto generico: "{heading}"')
        if HOWTO_HEADING.search(heading) and not (re.search(r'^\s*\d+\.\s', content, re.M) or '```' in content):
            problems.append(f'titoletto "{heading}" senza passi numerati o comandi')
        if '[!PUNTO]' not in content:
            problems.append(f'sezione "{heading}" senza il riquadro [!PUNTO] finale')
    return problems


ALWAYS_OK = {'AI', 'IA', 'Italia', 'Europa', 'UE', 'Ue', 'Unione Europea'}
TRANSLATIONS = {
    'Stati Uniti': ['United States', 'US', 'U.S.', 'America'], 'USA': ['US', 'U.S.', 'United States'],
    'Regno Unito': ['United Kingdom', 'UK', 'Britain'], 'Cina': ['China'], 'Giappone': ['Japan'],
    'Germania': ['Germany'], 'Francia': ['France'], 'Spagna': ['Spain'], 'Corea': ['Korea'], 'Svizzera': ['Switzerland'],
    'Paesi Bassi': ['Netherlands', 'Dutch'], 'Olanda': ['Netherlands', 'Holland', 'Dutch'], 'Londra': ['London'],
    'Parigi': ['Paris'], 'Pechino': ['Beijing'], 'Bruxelles': ['Brussels'], 'Ginevra': ['Geneva'],
    'Casa Bianca': ['White House'], 'Nazioni Unite': ['United Nations', 'UN'], 'ONU': ['UN', 'United Nations'],
    'Commissione Europea': ['European Commission'], 'Parlamento Europeo': ['European Parliament'],
    'Banca Centrale Europea': ['European Central Bank', 'ECB'], 'BCE': ['ECB'], 'PIL': ['GDP'],
    'Università': ['University'], 'Governo': ['government'], 'Ministero': ['Ministry', 'Department'],
    'Dipartimento': ['Department'], 'Congresso': ['Congress'], 'Senato': ['Senate'], 'Corte Suprema': ['Supreme Court'],
    'Presidente': ['President', 'chair'], 'CEO': ['CEO', 'chief executive'], 'Borsa': ['stock', 'exchange', 'IPO'],
}
NAME = re.compile(r"[A-ZÀ-ÖØ-Þ][\wÀ-ÖØ-öø-ÿ]*")
EDGE = '.,;:()[]"«»“”\''
NUMBER = re.compile(r'\d+(?:[.,]\d+)*')


def number_forms(n):
    return {n, n.replace(',', '.'), n.replace('.', ','), n.replace('.', '').replace(',', '')}


def facts(draft, source_text):
    """Return numbers and capitalised names in the draft that do not appear in the source text."""
    raw = plain('\n'.join([draft['title'], draft['description'], *draft['perTe'], *draft['perAzienda'], draft['body']]))
    lines = list(sentences(re.sub(r'[*_`]', '', prose(raw))))
    source_text = plain(source_text)
    flat = ' '.join(source_text.split())
    code = [l for block in CODE_BLOCK.findall(raw) for l in block.splitlines()]
    code += [c.strip('`') for c in INLINE_CODE.findall(CODE_BLOCK.sub('', raw))]
    missing = [f'comando "{c}"' for c in dict.fromkeys(' '.join(l.split()) for l in code) if c and c not in flat]
    for n in dict.fromkeys(NUMBER.findall('\n'.join(lines))):
        if not any(re.search(rf'(?<![\d.,]){re.escape(f)}(?![\d]|[.,]\d)', source_text) for f in number_forms(n)):
            missing.append(n)
    for s in lines:
        for words, at_start in name_runs(s):
            missing += [w for w in unknown_names(words, at_start, source_text) if w not in missing]
    return missing


def name_runs(sentence):
    """Yield runs of consecutive capitalised words, and whether the run opens the sentence."""
    run, at_start = [], False
    for k, tok in enumerate(sentence.split()):
        core = tok.strip(EDGE)
        tail = core.split("'")[-1]
        m = NAME.match(tail)
        if run and (not m or tail != core):
            yield run, at_start
            run = []
        if not m:
            continue
        if not run:
            at_start = k == 0 and tail == core
        run.append(m.group(0))
        if m.group(0) != tail or tok.rstrip(EDGE) != tok:
            yield run, at_start
            run = []
    if run:
        yield run, at_start


def known(phrase, source_text):
    low = source_text.lower()
    return phrase in ALWAYS_OK or phrase in source_text or any(t.lower() in low for t in TRANSLATIONS.get(phrase, []))


def unknown_names(words, at_start, source_text):
    out, i = [], 0
    while i < len(words):
        j = next((j for j in range(len(words), i, -1) if known(' '.join(words[i:j]), source_text)), None)
        if j:
            i = j
            continue
        if not (i == 0 and at_start):
            out.append(words[i])
        i += 1
    return out
