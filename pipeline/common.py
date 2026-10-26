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


class LLMError(RuntimeError):
    pass


def llm(messages, max_tokens, model=None, tries=2, json_mode=False):
    """Return the model's text; raise LLMError after `tries` timeouts, empty or truncated answers."""
    global _last_llm_call
    model = model or os.environ['LLM_MODEL']
    base = os.environ['LLM_BASE_URL'].rstrip('/')
    models = [m.strip() for m in model.split(',') if m.strip()]
    if 'openrouter.ai' in base and not all(m.endswith(':free') for m in models):
        raise LLMError(f'su OpenRouter sono ammessi solo modelli gratuiti (":free"), non {model}')
    model = models[0]
    payload = {'model': model, 'messages': messages, 'max_tokens': max_tokens, 'temperature': 0.4}
    if len(models) > 1:
        payload['models'] = models
    if json_mode:
        payload['response_format'] = {'type': 'json_object'}
    if 'generativelanguage.googleapis.com' in base and 'lite' not in model:
        payload['reasoning_effort'] = 'low'
    if 'openrouter.ai' in base:
        payload['reasoning'] = {'effort': 'low'}
    for n in range(tries):
        time.sleep(max(0, _last_llm_call + LLM_GAP - time.monotonic()))
        try:
            data = post_json(base + '/chat/completions', payload, {'Authorization': 'Bearer ' + os.environ['LLM_API_KEY']}, timeout=180)
        except urllib.error.HTTPError:
            raise
        except (TimeoutError, urllib.error.URLError) as e:
            if n == tries - 1:
                raise LLMError(f'nessuna risposta dal modello {model} dopo {tries} tentativi: {e}') from e
            continue
        finally:
            _last_llm_call = time.monotonic()
        choice = (data.get('choices') or [{}])[0]
        content = ((choice.get('message') or {}).get('content') or '').strip()
        reason = choice.get('finish_reason')
        answered = data.get('model', model)
        if content and reason != 'length':
            print(f'modello {answered}: {len(content)} caratteri, {(data.get("usage") or {}).get("completion_tokens")} token')
            return content
        problem = 'troncata (finish_reason=length)' if content else f'vuota (finish_reason={reason})'
        if data.get('error'):
            problem += f", errore: {str(data['error'])[:200]}"
    raise LLMError(f'risposta {problem} dal modello {answered} dopo {tries} tentativi; '
                   f'se è "length", ragionamento e testo hanno superato max_tokens={max_tokens}')


def parse_json(text):
    """Return the largest JSON object in text, skipping code fences and any reasoning around it."""
    decoder, found = json.JSONDecoder(), []
    for m in re.finditer(r'\{', text):
        try:
            obj, end = decoder.raw_decode(text, m.start())
        except ValueError:
            continue
        if isinstance(obj, dict):
            found.append((end - m.start(), obj))
    if not found:
        raise ValueError(f'nessun oggetto JSON nella risposta ({len(text)} caratteri, inizio: {text[:80]!r})')
    return max(found, key=lambda f: f[0])[1]


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
