import json
import os
import re
import time
import unicodedata
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATEGORIES = ['intelligenza-artificiale', 'guide-e-tutorial', 'app-e-strumenti', 'ai-in-locale',
              'big-tech', 'sicurezza', 'funziona-davvero', 'per-la-tua-azienda']
LLM_GAP = 6
_last_llm_call = float('-inf')


def drafts_dir():
    return ROOT / 'pipeline' / 'drafts'


def blog_dir():
    return ROOT / 'content' / 'blog'


def read_json(path, default):
    return json.loads(path.read_text(encoding='utf-8')) if path.exists() else default


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def retry_after(e):
    wait = e.headers.get('Retry-After', '')
    if wait.isdigit():
        return int(wait)
    m = re.search(r'retry.?delay\W+(\d+)', e.read().decode('utf-8', 'replace'), re.I)
    return int(m.group(1)) + 1 if m else None


def post_json(url, payload, headers=None, timeout=120, tries=4):
    req = urllib.request.Request(url, json.dumps(payload).encode(), {'Content-Type': 'application/json', **(headers or {})})
    for n in range(tries):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code not in (429, 500, 502, 503, 504) or n == tries - 1:
                raise
            time.sleep(min(retry_after(e) or 15 * 2 ** n, 300))


def llm(messages, max_tokens):
    global _last_llm_call
    time.sleep(max(0, _last_llm_call + LLM_GAP - time.monotonic()))
    try:
        data = post_json(os.environ['LLM_BASE_URL'].rstrip('/') + '/chat/completions',
                         {'model': os.environ['LLM_MODEL'], 'messages': messages, 'max_tokens': max_tokens, 'temperature': 0.4},
                         {'Authorization': 'Bearer ' + os.environ['LLM_API_KEY']}, timeout=300)
    finally:
        _last_llm_call = time.monotonic()
    return data['choices'][0]['message']['content']


def parse_json(text):
    start, end = text.find('{'), text.rfind('}')
    if start < 0 or end < start:
        raise ValueError('nessun oggetto JSON nella risposta')
    return json.loads(text[start:end + 1])


def telegram(method, **params):
    data = post_json(f"https://api.telegram.org/bot{os.environ['TELEGRAM_BOT_TOKEN']}/{method}", params, timeout=60)
    if not data.get('ok'):
        raise RuntimeError(f'Telegram {method}: {data}')
    return data['result']


def chat_id():
    return os.environ['TELEGRAM_CHAT_ID']


def slugify(title, taken=()):
    s = unicodedata.normalize('NFKD', title).encode('ascii', 'ignore').decode().lower()
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    if len(s) > 50:
        s = s[:51].rsplit('-', 1)[0]
    base, n = s or 'notizia', 2
    s = base
    while s in taken:
        s, n = f'{base}-{n}', n + 1
    return s


def q(s):
    return json.dumps(s, ensure_ascii=False)


def render(d, date, source):
    lines = ['---', f"title: {q(d['title'])}", f"description: {q(d['description'])}", f'date: {date}',
             f"category: {d['category']}"]
    if d['forBusiness']:
        lines.append('forBusiness: true')
    lines.append('perTe:')
    lines += [f'  - {q(p)}' for p in d['perTe']]
    if d['perAzienda']:
        lines.append('perAzienda:')
        lines += [f'  - {q(p)}' for p in d['perAzienda']]
    lines += ['sources:', f"  - title: {q(source['title'])}", f"    url: {source['url']}", '---', d['body'].strip(), '']
    return '\n'.join(lines)
