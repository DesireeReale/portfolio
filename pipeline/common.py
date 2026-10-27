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
LLM_TIMEOUT = 90
LLM_MAX_WAIT = 60
LLM_CALL_CAP = 240
MIN_CALL_SECONDS = 20
RETRY_CODES = (429, 500, 502, 503, 504)
_last_llm_call = float('-inf')
_deadline = float('inf')


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
            if e.code not in RETRY_CODES or n == tries - 1:
                raise
            time.sleep(min(retry_after(e) or 15 * 2 ** n, 300))


class LLMError(RuntimeError):
    pass


class BudgetExceeded(LLMError):
    pass


def set_budget(seconds):
    global _deadline
    _deadline = time.monotonic() + seconds


def time_left():
    return _deadline - time.monotonic()


def llm(messages, max_tokens, model=None, tries=2, json_mode=False):
    """Return the model's text; raise LLMError after `tries` failed attempts or LLM_CALL_CAP seconds,
    BudgetExceeded when the run's time budget (set_budget) is about to run out."""
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
    start = time.monotonic()
    cap = min(start + LLM_CALL_CAP, _deadline)
    url, headers = base + '/chat/completions', {'Authorization': 'Bearer ' + os.environ['LLM_API_KEY']}
    problem, pause = 'nessun tentativo', 0
    for n in range(1, tries + 1):
        wait = max(pause, _last_llm_call + LLM_GAP - time.monotonic())
        left = cap - time.monotonic() - wait
        if left < MIN_CALL_SECONDS:
            error = BudgetExceeded if cap == _deadline else LLMError
            raise error(f'tempo finito per il modello {model} dopo {time.monotonic() - start:.0f}s: {problem}')
        time.sleep(wait)
        t0 = time.monotonic()
        try:
            data = post_json(url, payload, headers, timeout=min(LLM_TIMEOUT, left), tries=1)
        except urllib.error.HTTPError as e:
            if e.code not in RETRY_CODES:
                raise
            problem, pause = f'HTTP {e.code}', min(retry_after(e) or LLM_GAP, LLM_MAX_WAIT)
        except OSError as e:
            problem, pause = f'nessuna risposta ({e})', 0
        else:
            choice = (data.get('choices') or [{}])[0]
            content = ((choice.get('message') or {}).get('content') or '').strip()
            reason = choice.get('finish_reason')
            if content and reason != 'length':
                print(f"modello {data.get('model', model)}: {len(content)} caratteri, "
                      f"{(data.get('usage') or {}).get('completion_tokens')} token, {time.monotonic() - t0:.0f}s, tentativo {n}/{tries}")
                return content
            problem = 'risposta troncata (finish_reason=length)' if content else f'risposta vuota (finish_reason={reason})'
            if data.get('error'):
                problem += f", errore: {str(data['error'])[:200]}"
            pause = 0
        finally:
            _last_llm_call = time.monotonic()
        print(f'modello {model}: tentativo {n}/{tries} non riuscito dopo {time.monotonic() - t0:.0f}s: {problem}')
    raise LLMError(f'{problem} dal modello {model} dopo {tries} tentativi in {time.monotonic() - start:.0f}s; '
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


MIN_IMAGE_WIDTH = 600
MAX_IMAGE_BYTES = 8_000_000
IMAGE_TYPES = {'png': 'png', 'gif': 'gif', 'jpeg': 'jpg', 'webp': 'webp'}


def image_size(data):
    """Return (kind, width, height) from the first bytes of a PNG, GIF, JPEG or WebP, else None."""
    if data[:8] == b'\x89PNG\r\n\x1a\n' and len(data) >= 24:
        return 'png', int.from_bytes(data[16:20], 'big'), int.from_bytes(data[20:24], 'big')
    if data[:6] in (b'GIF87a', b'GIF89a') and len(data) >= 10:
        return 'gif', int.from_bytes(data[6:8], 'little'), int.from_bytes(data[8:10], 'little')
    if data[:4] == b'RIFF' and data[8:12] == b'WEBP' and len(data) >= 30:
        chunk = data[12:16]
        if chunk == b'VP8 ':
            return 'webp', int.from_bytes(data[26:28], 'little') & 0x3FFF, int.from_bytes(data[28:30], 'little') & 0x3FFF
        if chunk == b'VP8L':
            b = int.from_bytes(data[21:25], 'little')
            return 'webp', (b & 0x3FFF) + 1, ((b >> 14) & 0x3FFF) + 1
        if chunk == b'VP8X':
            return 'webp', int.from_bytes(data[24:27], 'little') + 1, int.from_bytes(data[27:30], 'little') + 1
    if data[:2] == b'\xff\xd8':
        i = 2
        while i + 9 < len(data):
            if data[i] != 0xFF:
                i += 1
                continue
            marker = data[i + 1]
            if marker in (0xD8, 0x01) or 0xD0 <= marker <= 0xD7:
                i += 2
                continue
            if 0xC0 <= marker <= 0xCF and marker not in (0xC4, 0xC8, 0xCC):
                return 'jpeg', int.from_bytes(data[i + 7:i + 9], 'big'), int.from_bytes(data[i + 5:i + 7], 'big')
            i += 2 + int.from_bytes(data[i + 2:i + 4], 'big')
    return None


def fetch_bytes(url, limit=None):
    headers = {'User-Agent': 'Mozilla/5.0 (blog news bot)'}
    if limit:
        headers['Range'] = f'bytes=0-{limit - 1}'
    with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=30) as r:
        return r.read(limit or MAX_IMAGE_BYTES + 1)


def remote_image_size(url):
    try:
        return image_size(fetch_bytes(url, 131072))
    except Exception:
        return None


def download_image(url, folder):
    """Save url as folder/cover.<ext> when it is a wide enough image; return the file name or None."""
    try:
        data = fetch_bytes(url)
    except Exception:
        return None
    info = image_size(data)
    if not info or info[1] < MIN_IMAGE_WIDTH or len(data) > MAX_IMAGE_BYTES:
        return None
    folder.mkdir(parents=True, exist_ok=True)
    name = f'cover.{IMAGE_TYPES[info[0]]}'
    (folder / name).write_bytes(data)
    return name


def localize_image(md, slug, static_root):
    """Download the draft's remote image to static_root/blog/<slug>/; drop the image fields if that fails."""
    m = re.search(r'^image: (https?://\S+)$', md, re.M)
    if not m:
        return md
    name = download_image(m.group(1), static_root / 'blog' / slug)
    if name:
        return md.replace(m.group(0), f'image: /blog/{slug}/{name}')
    return re.sub(r'^image(?:Credit|CreditUrl)?: .*\n', '', md, flags=re.M)


def render(d, date, source, image=None):
    lines = ['---', f"title: {q(d['title'])}", f"description: {q(d['description'])}", f'date: {date}',
             f"category: {d['category']}"]
    if image:
        lines += [f"image: {image['url']}", f"imageCredit: {q(image['credit'])}", f"imageCreditUrl: {image['creditUrl']}"]
    if d['forBusiness']:
        lines.append('forBusiness: true')
    lines.append('perTe:')
    lines += [f'  - {q(p)}' for p in d['perTe']]
    if d['perAzienda']:
        lines.append('perAzienda:')
        lines += [f'  - {q(p)}' for p in d['perAzienda']]
    lines += ['sources:', f"  - title: {q(source['title'])}", f"    url: {source['url']}", '---', d['body'].strip(), '']
    return '\n'.join(lines)
