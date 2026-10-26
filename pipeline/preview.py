"""Build the blog as if every pending draft were approved, as a multi-file folder ready for an artifact.

Usage: python pipeline/preview.py OUT_DIR [--skip SLUG ...]
Prints the JSON files map (published path -> path relative to OUT_DIR) for the Artifact tool.
"""
import html
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import common

SITE = 'https://desireereale.netlify.app'
BANNER_CSS = """
.draft { border: 2px solid var(--accent); border-radius: 14px; padding: 16px 20px; margin: 0 0 22px; background: var(--accent-soft); font-size: 15px; }
.draft strong { font: 700 13px/1 var(--mono); letter-spacing: 0.08em; color: var(--accent); }
.draft ul { margin: 10px 0 0; padding-left: 20px; }
.draft li { margin: 4px 0; }
"""


def banner(problems):
    if not problems:
        return '<div class="draft"><strong>BOZZA</strong><p style="margin:8px 0 0">Nessun problema segnalato dai controlli.</p></div>'
    items = ''.join(f'<li>{html.escape(p)}</li>' for p in problems)
    return f'<div class="draft"><strong>BOZZA · DA CONTROLLARE</strong><ul>{items}</ul></div>'


def relink(page, prefix, slugs):
    def fix(m):
        attr, path = m.group(1), m.group(2)
        slug = path.removeprefix('/blog/').strip('/')
        if path == '/blog/':
            return f'{attr}="{prefix}index.html"'
        if slug in slugs:
            return f'{attr}="{prefix}{slug}/index.html"'
        if re.fullmatch(r'/blog/[^/]+/[^/]+\.\w+', path) and path.split('/')[2] in slugs:
            return f'{attr}="{prefix}{path.removeprefix("/blog/")}"'
        return f'{attr}="{SITE}{path}"'
    return re.sub(r'\b(href|src)="(/[^"]*)"', fix, page)


def build(out, skip):
    tmp = Path(tempfile.mkdtemp())
    content, static, dist = tmp / 'content', tmp / 'static', tmp / 'dist'
    content.mkdir()
    if (common.ROOT / 'public' / 'blog').exists():
        shutil.copytree(common.ROOT / 'public' / 'blog', static / 'blog')
    for f in common.blog_dir().glob('*.md'):
        shutil.copy(f, content)
    pending = common.read_json(common.drafts_dir() / 'pending.json', {})
    drafts = [f for f in sorted(common.drafts_dir().glob('*.md')) if f.stem not in skip]
    for f in drafts:
        md = common.localize_image(f.read_text(encoding='utf-8'), f.stem, static)
        (content / f.name).write_text(md, encoding='utf-8')
    env = dict(os.environ, BLOG_CONTENT=str(content), BLOG_DIST=str(dist), BLOG_STATIC=str(static))
    subprocess.run(['node', str(common.ROOT / 'scripts' / 'build-blog.mjs')], env=env, check=True)

    slugs = {f.stem for f in content.glob('*.md')}
    marks = ''.join(f'a[href="{d.stem}/index.html"] h2::before, a[href="{d.stem}/index.html"] h3::before'
                    f' {{ content: "BOZZA · "; color: var(--accent); }}\n' for d in drafts)
    files = {}
    for slug in slugs:
        page = relink((dist / 'blog' / slug / 'index.html').read_text(encoding='utf-8'), '../', slugs)
        page = page.replace('</style>', BANNER_CSS + '</style>', 1)
        if slug in {d.stem for d in drafts}:
            page = page.replace('<article class="article">', '<article class="article">\n  '
                                + banner((pending.get(slug) or {}).get('problems', [])), 1)
        (out / slug).mkdir(parents=True, exist_ok=True)
        (out / slug / 'index.html').write_text(page, encoding='utf-8')
        files[f'{slug}/index.html'] = f'{slug}/index.html'
        for img in (static / 'blog' / slug).glob('*') if (static / 'blog' / slug).exists() else []:
            shutil.copy(img, out / slug)
            files[f'{slug}/{img.name}'] = f'{slug}/{img.name}'

    home = relink((dist / 'blog' / 'index.html').read_text(encoding='utf-8'), '', slugs)
    head = re.search(r'<head>(.*?)</head>', home, re.S).group(1)
    head = re.sub(r'<meta (charset|name="viewport")[^>]*>\s*', '', head)
    head = re.sub(r'<title>.*?</title>', '<title>Bozze del blog</title>', head, flags=re.S)
    head = head.replace('</style>', BANNER_CSS + marks + '</style>', 1)
    body = re.search(r'<body[^>]*>(.*)</body>', home, re.S).group(1)
    body = re.sub(r'<form ([^>]*)action="[^"]*"', r'<form \1onsubmit="return false"', body)
    (out / 'index.html').write_text(head.strip() + '\n' + body.strip() + '\n', encoding='utf-8')
    shutil.rmtree(tmp)
    return files


if __name__ == '__main__':
    args = sys.argv[1:]
    out = Path(args[0])
    skip = set(args[args.index('--skip') + 1:]) if '--skip' in args else set()
    print(json.dumps(build(out, skip), indent=2))
