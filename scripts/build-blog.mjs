/*
 * Genera il blog statico in dist/ (da eseguire dopo `vite build`).
 *
 * Un file Markdown per articolo in content/blog/<slug>.md; il nome del file è lo slug dell'URL /blog/<slug>/.
 * Frontmatter (YAML semplice: `chiave: valore`, liste con `  - voce`, stringhe con o senza virgolette):
 *
 *   ---
 *   title: Titolo dell'articolo
 *   description: Sottotitolo, usato anche come meta description
 *   date: 2026-10-26            (oppure 2026-10-26T07:00:00+01:00)
 *   category: intelligenza-artificiale
 *   image: /blog/<slug>/cover.jpg (facoltativo, file in public/, largo almeno 600px; senza, copertina col titolo)
 *   imageCredit: Fonte         (facoltativo, mostrato sotto l'immagine)
 *   imageCreditUrl: https://...
 *   forBusiness: true           (facoltativo, mostra l'articolo nel blocco "Per la tua azienda")
 *   featured: true              (facoltativo, articolo d'apertura della home)
 *   verdict: meta               (facoltativo, si | no | meta, solo per funziona-davvero)
 *   perTe:
 *     - Punto "cosa cambia per te"
 *   perAzienda:                 (facoltativo)
 *     - Punto "e per la tua azienda"
 *   sources:
 *     - title: Nome della fonte
 *       url: https://...
 *   ---
 *   Corpo in Markdown.
 *
 * Categorie: intelligenza-artificiale, guide-e-tutorial, app-e-strumenti, ai-in-locale,
 * big-tech, sicurezza, funziona-davvero, per-la-tua-azienda.
 */
import { readFileSync, readdirSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = process.env.BLOG_CONTENT || join(ROOT, 'content', 'blog');
const DIST = process.env.BLOG_DIST || join(ROOT, 'dist');
const STATIC = process.env.BLOG_STATIC || join(ROOT, 'public');
const MIN_IMAGE_WIDTH = 600;
const SITE = 'https://desireereale.netlify.app';
const AUTHOR = 'Desirèe Reale';
const GITHUB = 'https://github.com/desireereale';
const OG_IMAGE = `${SITE}/og.svg`;

const CATEGORIES = {
  'intelligenza-artificiale': { name: 'Intelligenza artificiale', intro: "Le novità sull'intelligenza artificiale spiegate in modo semplice." },
  'guide-e-tutorial': { name: 'Guide e tutorial', intro: "Guide passo per passo per usare l'AI nella vita di tutti i giorni." },
  'app-e-strumenti': { name: 'App e strumenti', intro: 'Le app e gli strumenti AI provati e confrontati.' },
  'ai-in-locale': { name: 'AI in locale', intro: "Usare l'AI sul tuo computer, senza mandare i dati nel cloud." },
  'big-tech': { name: 'Big Tech', intro: 'Cosa fanno le grandi aziende tecnologiche e cosa cambia per te.' },
  'sicurezza': { name: 'Sicurezza', intro: "Truffe, privacy e sicurezza nell'era dell'AI." },
  'funziona-davvero': { name: 'Funziona davvero?', intro: "La rubrica che mette alla prova le promesse dell'AI, con un verdetto chiaro." },
  'per-la-tua-azienda': { name: 'Per la tua azienda', intro: "L'AI applicata al lavoro: strumenti, costi, regole e casi reali." },
};
const VERDICTS = { si: ['Sì', 'v-yes'], no: ['No', 'v-no'], meta: ['A metà', 'v-mid'] };

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function scalar(raw) {
  const v = raw.trim();
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v.startsWith('"') && v.endsWith('"') && v.length > 1) return JSON.parse(v);
  if (v.startsWith("'") && v.endsWith("'") && v.length > 1) return v.slice(1, -1).replace(/''/g, "'");
  return v;
}

function parseFrontmatter(src, file) {
  const m = src.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error(`${file}: frontmatter mancante`);
  const data = {};
  let key = null;
  let item = null;
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    let r;
    if ((r = line.match(/^([A-Za-z]\w*):\s*(.*)$/))) {
      key = r[1];
      item = null;
      data[key] = r[2].trim() === '' ? [] : scalar(r[2]);
    } else if ((r = line.match(/^\s+-\s+(.*)$/)) && Array.isArray(data[key])) {
      const kv = key === 'sources' && r[1].match(/^(\w+):\s*(.*)$/);
      item = kv ? { [kv[1]]: scalar(kv[2]) } : null;
      data[key].push(item ?? scalar(r[1]));
    } else if ((r = line.match(/^\s+(\w+):\s*(.*)$/)) && item) {
      item[r[1]] = scalar(r[2]);
    } else {
      throw new Error(`${file}: riga non valida nel frontmatter: ${line}`);
    }
  }
  return { data, body: m[2] };
}

function loadArticles() {
  if (!existsSync(CONTENT)) return [];
  return readdirSync(CONTENT)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const { data, body } = parseFrontmatter(readFileSync(join(CONTENT, f), 'utf8'), f);
      for (const k of ['title', 'description', 'date', 'category']) {
        if (typeof data[k] !== 'string' || !data[k]) throw new Error(`${f}: campo "${k}" mancante`);
      }
      if (!CATEGORIES[data.category]) throw new Error(`${f}: categoria sconosciuta "${data.category}"`);
      if (data.verdict && (!VERDICTS[data.verdict] || data.category !== 'funziona-davvero')) {
        throw new Error(`${f}: verdict valido solo per funziona-davvero (si | no | meta)`);
      }
      const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(data.date) ? `${data.date}T12:00:00Z` : data.date);
      if (Number.isNaN(date.getTime())) throw new Error(`${f}: data non valida "${data.date}"`);
      const sources = data.sources ?? [];
      if (!Array.isArray(sources) || sources.some((s) => !s?.title || !s?.url)) throw new Error(`${f}: sources deve essere una lista di {title, url}`);
      const words = body.replace(/<(style|svg)[\s\S]*?<\/\1>/g, '').split(/\s+/).filter(Boolean).length;
      return {
        ...data,
        slug: f.replace(/\.md$/, ''),
        date,
        image: localImage(data, f),
        perTe: [].concat(data.perTe ?? []),
        perAzienda: [].concat(data.perAzienda ?? []),
        sources,
        minutes: Math.max(1, Math.round(words / 200)),
        html: marked.parse(body),
      };
    })
    .sort((a, b) => b.date - a.date || a.title.localeCompare(b.title));
}

const fmt = (d, opts) => new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', ...opts }).format(d);
const dayMonth = (d) => fmt(d, { day: 'numeric', month: 'long' });
const fullDate = (d) => fmt(d, { day: 'numeric', month: 'long', year: 'numeric' });
const url = (a) => `/blog/${a.slug}/`;
const catUrl = (c) => `/blog/categoria/${c}/`;

function imageWidth(file) {
  const b = readFileSync(file);
  if (b.readUInt32BE(0) === 0x89504e47) return b.readUInt32BE(16);
  if (b.toString('latin1', 0, 3) === 'GIF') return b.readUInt16LE(6);
  if (b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WEBP') {
    const chunk = b.toString('latin1', 12, 16);
    if (chunk === 'VP8 ') return b.readUInt16LE(26) & 0x3fff;
    if (chunk === 'VP8L') return (b.readUInt32LE(21) & 0x3fff) + 1;
    if (chunk === 'VP8X') return b.readUIntLE(24, 3) + 1;
  }
  if (b[0] === 0xff && b[1] === 0xd8) {
    for (let i = 2; i + 9 < b.length;) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1];
      if (m === 0xd8 || m === 0x01 || (m >= 0xd0 && m <= 0xd7)) { i += 2; continue; }
      if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return b.readUInt16BE(i + 7);
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  return 0;
}

function localImage(a, f) {
  if (!a.image) return null;
  const file = join(STATIC, a.image);
  if (!a.image.startsWith('/') || !existsSync(file)) {
    console.warn(`${f}: immagine "${a.image}" non trovata in ${STATIC}, uso la copertina`);
    return null;
  }
  return imageWidth(file) >= MIN_IMAGE_WIDTH ? a.image : null;
}

const cover = (a) => `<div class="thumb cover" aria-hidden="true"><span class="cat">${esc(CATEGORIES[a.category].name)}</span><b>${esc(a.title)}</b></div>`;
const thumb = (a) => a.image ? `<div class="thumb"><img src="${esc(a.image)}" alt="" loading="lazy"></div>` : cover(a);
const figure = (a) => a.image
  ? `<figure class="figure"><img src="${esc(a.image)}" alt="">${a.imageCredit ? `<figcaption>Immagine: ${a.imageCreditUrl ? `<a href="${esc(a.imageCreditUrl)}" rel="noopener">${esc(a.imageCredit)}</a>` : esc(a.imageCredit)}</figcaption>` : ''}</figure>`
  : cover(a);


const CSS = `
:root {
  --bg: #fafaf9; --surface: #ffffff; --surface-2: #f5f5f4; --line: rgba(0,0,0,0.08);
  --fg: #1c1917; --muted: #78716c; --accent: #d97706; --accent-soft: rgba(245,158,11,0.12); --on-accent: #1c1917;
  --yes: #15803d; --no: #b91c1c; --mid: #b45309;
  --display: "Plus Jakarta Sans", system-ui, sans-serif;
  --text: "Inter", system-ui, sans-serif;
  --mono: "JetBrains Mono", ui-monospace, monospace;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --bg: #020617; --surface: #0f172a; --surface-2: #111c33; --line: rgba(255,255,255,0.08);
  --fg: #f8fafc; --muted: #94a3b8; --accent: #38bdf8; --accent-soft: rgba(56,189,248,0.12); --on-accent: #020617;
  --yes: #4ade80; --no: #f87171; --mid: #fbbf24; color-scheme: dark } }
:root[data-theme="dark"] {
  --bg: #020617; --surface: #0f172a; --surface-2: #111c33; --line: rgba(255,255,255,0.08);
  --fg: #f8fafc; --muted: #94a3b8; --accent: #38bdf8; --accent-soft: rgba(56,189,248,0.12); --on-accent: #020617;
  --yes: #4ade80; --no: #f87171; --mid: #fbbf24; color-scheme: dark }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--fg); font: 16px/1.6 var(--text); }
a { color: inherit; text-decoration: none; }
a:hover h3, a:hover h2 { color: var(--accent); }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 6px; }
.wrap { max-width: 1200px; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
h1, h2, h3 { font-family: var(--display); letter-spacing: -0.02em; line-height: 1.15; margin: 0; text-wrap: balance; }
.cat { font: 500 12px/1 var(--mono); color: var(--accent); letter-spacing: 0.04em; }
.meta { font-size: 13px; color: var(--muted); }
.verdict { display: inline-flex; align-items: center; gap: 6px; font: 700 13px/1 var(--display); padding: 6px 10px; border-radius: 999px; border: 1.5px solid currentColor; }
.verdict::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
.v-yes { color: var(--yes); } .v-no { color: var(--no); } .v-mid { color: var(--mid); }
.tags { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.cats .biz-link { color: var(--accent); font-weight: 600; }
.biz { margin-top: 44px; background: var(--surface); border: 1px solid var(--line); border-radius: 18px; padding: 26px; }
.biz-head { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 8px 16px; margin-bottom: 18px; }
.biz-head h2 { font-size: 24px; }
.biz-head p { margin: 0; color: var(--muted); font-size: 15px; }
.biz-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
.biz-grid a { display: grid; gap: 6px; align-content: start; padding: 16px; border-radius: 12px; background: var(--surface-2); }
.biz-grid h3 { font-size: 17px; }
.biz-grid p { margin: 0; color: var(--muted); font-size: 14px; }
.impact.work { background: var(--surface-2); border: 1px solid var(--line); }
@media (max-width: 760px) { .biz-grid { grid-template-columns: 1fr; } }
header { position: sticky; top: env(safe-area-inset-top, 0px); z-index: 5; background: var(--bg); border-bottom: 1px solid var(--line); }
body::before { content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 10; background: var(--bg); }
.bar { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding-block: 14px; }
.logo { display: flex; align-items: center; gap: 10px; font: 800 18px var(--display); }
.logo i { width: 34px; height: 34px; border-radius: 9px; background: var(--accent); color: var(--on-accent); display: grid; place-items: center; font: 700 15px var(--mono); font-style: normal; }
.cats { display: flex; gap: 22px; font-size: 14px; color: var(--muted); overflow-x: auto; padding-bottom: 12px; scrollbar-width: none; }
.cats a { white-space: nowrap; }
.cats a:hover, .cats a.on { color: var(--fg); }
.btn { display: inline-flex; align-items: center; justify-content: center; min-height: 40px; padding: 0 18px; border-radius: 999px; background: var(--accent); color: var(--on-accent); font-weight: 600; font-size: 14px; border: 0; cursor: pointer; font-family: inherit; }
.ticker { display: flex; gap: 14px; align-items: center; padding-block: 12px; border-bottom: 1px solid var(--line); font-size: 14px; overflow: hidden; }
.ticker b { font: 500 12px var(--mono); color: var(--accent); white-space: nowrap; }
.ticker span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ticker a:hover span { color: var(--accent); }
.home { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 48px; padding-block: 36px 64px; }
.lead { display: grid; grid-template-columns: 1.1fr 1fr; gap: 28px; align-items: center; padding-bottom: 32px; border-bottom: 1px solid var(--line); }
.lead h2 { font-size: clamp(26px, 3vw, 38px); margin: 10px 0 12px; }
.lead p { color: var(--muted); margin: 0 0 12px; }
.thumb { aspect-ratio: 16 / 10; border-radius: 14px; background: var(--surface-2); border: 1px solid var(--line); display: grid; place-items: center; overflow: hidden; }
.thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.cover { container-type: inline-size; place-items: start; align-content: space-between; padding: 7cqi; background: var(--surface); }
.cover b { font: 800 22px/1.08 var(--display); font-size: 8.5cqi; letter-spacing: -0.03em; color: var(--fg); text-wrap: balance; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
.cover .cat { font-size: max(9px, 3.4cqi); }
.figure { margin: 26px 0; }
.figure img { width: 100%; height: auto; border-radius: 14px; border: 1px solid var(--line); display: block; }
.figure figcaption { margin-top: 8px; font-size: 13px; color: var(--muted); }
.figure figcaption a { text-decoration: underline; }
.list { display: grid; gap: 0; }
.item { display: grid; grid-template-columns: 140px minmax(0, 1fr); gap: 20px; padding-block: 22px; border-bottom: 1px solid var(--line); }
.item .thumb { border-radius: 10px; }
.item h3 { font-size: 19px; margin: 6px 0; }
.item p { margin: 0 0 6px; color: var(--muted); font-size: 15px; }
.section-title { font: 800 20px var(--display); margin: 40px 0 4px; }
.cat-head h1 { font-size: clamp(28px, 3.6vw, 40px); margin-bottom: 10px; }
.cat-head p { margin: 0 0 8px; color: var(--muted); }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.empty { color: var(--muted); padding-block: 22px; }
aside { display: flex; flex-direction: column; gap: 28px; }
.box { background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 22px; }
.box h2 { font-size: 17px; margin-bottom: 14px; }
.news p { margin: 0 0 14px; color: var(--muted); font-size: 14px; }
.news form { display: grid; gap: 10px; }
.news input { min-height: 42px; border-radius: 10px; border: 1px solid var(--line); background: var(--bg); color: var(--fg); padding: 0 12px; font: inherit; }
.start a:hover { color: var(--accent); }
.start a { display: block; padding-block: 9px; border-bottom: 1px solid var(--line); font-size: 15px; }
.start a:last-child { border: 0; }
.article { max-width: 720px; margin: 0 auto; padding-block: 36px 72px; }
.back { font-size: 14px; color: var(--muted); }
.article h1 { font-size: clamp(30px, 4.4vw, 46px); margin: 14px 0 16px; }
.article .dek { font-size: 19px; color: var(--muted); margin: 0 0 18px; }
.article .cover { margin: 26px 0; }
.article h2 { font-size: 24px; margin: 34px 0 10px; }
.article h3 { font-size: 19px; margin: 26px 0 8px; }
.article p, .article li { font-size: 17px; line-height: 1.7; }
.body a { color: var(--accent); text-decoration: underline; }
.body code { font: 14px var(--mono); background: var(--surface-2); padding: 2px 6px; border-radius: 6px; }
.body pre { background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 16px; overflow-x: auto; }
.body pre code { background: none; padding: 0; }
.body blockquote { margin: 22px 0; padding-left: 18px; border-left: 3px solid var(--accent); color: var(--muted); }
.impact { background: var(--accent-soft); border-radius: 14px; padding: 20px 22px; margin: 26px 0; }
.impact h2 { margin-top: 0; font-size: 19px; }
.impact ul { margin: 0; padding-left: 20px; }
.sources { font-size: 14px; color: var(--muted); border-top: 1px solid var(--line); padding-top: 16px; margin-top: 34px; }
.sources a { text-decoration: underline; }
.author { display: flex; gap: 12px; align-items: center; margin-top: 28px; padding: 18px; border-radius: 14px; background: var(--surface); border: 1px solid var(--line); font-size: 14px; }
.author i { width: 44px; height: 44px; border-radius: 50%; background: var(--accent); color: var(--on-accent); display: grid; place-items: center; font: 700 16px var(--display); font-style: normal; flex: none; }
footer { border-top: 1px solid var(--line); padding-block: 28px; font-size: 14px; color: var(--muted); }
footer .wrap { display: flex; flex-wrap: wrap; gap: 12px 24px; justify-content: space-between; }
footer a:hover { color: var(--fg); }
@media (max-width: 900px) {
  .home { grid-template-columns: 1fr; gap: 36px; }
  .lead { grid-template-columns: 1fr; }
}
@media (max-width: 520px) {
  .item { grid-template-columns: 1fr; gap: 10px; }
  .item .thumb { display: none; }
  .bar .btn { padding: 0 14px; }
}
@media (prefers-reduced-motion: no-preference) { a h3, a h2 { transition: color .2s; } }
`.trim();

const FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 56 56'%3E%3Crect width='56' height='56' rx='14' fill='%2338bdf8'/%3E%3Cpath d='M18 20 l10 8 l-10 8 M32 38 h10' stroke='%230b1220' stroke-width='4' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

function page({ title, description, path, type = 'website', jsonLd, active, noindex, main, image = OG_IMAGE }) {
  const canonical = SITE + path;
  const nav = Object.entries(CATEGORIES)
    .map(([slug, c]) => {
      const cls = [slug === 'per-la-tua-azienda' && 'biz-link', active === slug && 'on'].filter(Boolean).join(' ');
      return `<a${cls ? ` class="${cls}"` : ''} href="${catUrl(slug)}"${active === slug ? ' aria-current="page"' : ''}>${esc(c.name)}</a>`;
    })
    .join('\n        ');
  return `<!doctype html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="author" content="${AUTHOR}">
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${canonical}">`}
<meta name="theme-color" content="#020617">
<link rel="icon" href="${FAVICON}">
<link rel="alternate" type="application/rss+xml" title="Blog di ${AUTHOR}" href="${SITE}/blog/rss.xml">
<meta property="og:type" content="${type}">
<meta property="og:locale" content="it_IT">
<meta property="og:site_name" content="${AUTHOR}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${esc(image)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(image)}">
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>\n` : ''}<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&family=Plus+Jakarta+Sans:wght@700;800&display=swap">
<style>
${CSS}
</style>
</head>
<body>
<header>
  <div class="wrap">
    <div class="bar">
      <a class="logo" href="/"><i>&gt;_</i> ${AUTHOR}</a>
      <a class="btn" href="/blog/#newsletter">Newsletter</a>
    </div>
    <nav class="cats" aria-label="Categorie">
        <a${active === 'home' ? ' class="on" aria-current="page"' : ''} href="/blog/">Tutti</a>
        ${nav}
    </nav>
  </div>
</header>
<main class="wrap">
${main}
</main>
<footer><div class="wrap"><span>© ${new Date().getFullYear()} ${AUTHOR}</span><span><a href="/blog/">Notizie</a> · <a href="${catUrl('guide-e-tutorial')}">Guide</a> · <a href="${catUrl('app-e-strumenti')}">App</a> · <a href="/blog/#newsletter">Newsletter</a> · <a href="/blog/rss.xml">RSS</a></span><span><a href="/">Portfolio</a> · <a href="${GITHUB}" rel="me">GitHub</a></span></div></footer>
</body>
</html>
`;
}

const verdict = (a) => (a.verdict ? `<span class="verdict ${VERDICTS[a.verdict][1]}">${VERDICTS[a.verdict][0]}</span>` : '');
const tags = (a) => `<div class="tags"><span class="cat">${esc(CATEGORIES[a.category].name)}</span>${verdict(a)}</div>`;

const item = (a) => `<a class="item" href="${url(a)}">${thumb(a)}<div>${tags(a)}<h3>${esc(a.title)}</h3><p>${esc(a.description)}</p><span class="meta">${dayMonth(a.date)} · ${a.minutes} min</span></div></a>`;

const list = (items) => (items.length ? `<div class="list">\n${items.map(item).join('\n')}\n</div>` : '<p class="empty">Nessun articolo, per ora.</p>');

function sidebar(articles) {
  const start = articles.filter((a) => a.category === 'guide-e-tutorial').slice(0, 3);
  return `<aside>
  <section class="box news" id="newsletter">
    <h2>La newsletter del sabato</h2>
    <p>Le notizie AI della settimana spiegate semplici, in 5 minuti.</p>
    <form name="newsletter" method="POST" action="/blog/grazie/" data-netlify="true" netlify-honeypot="bot-field">
      <input type="hidden" name="form-name" value="newsletter">
      <p hidden><label>Non compilare questo campo: <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
      <label class="meta" for="email">La tua email</label>
      <input id="email" name="email" type="email" required placeholder="nome@email.it" autocomplete="email">
      <button class="btn" type="submit">Iscriviti</button>
    </form>
  </section>
  ${start.length ? `<section class="box start">
    <h2>Inizia da qui</h2>
    ${start.map((a) => `<a href="${url(a)}">${esc(a.title)}</a>`).join('\n    ')}
  </section>` : ''}
</aside>`;
}

const isBusiness = (a) => a.forBusiness === true || a.category === 'per-la-tua-azienda';

function homePage(articles) {
  const lead = articles.find((a) => a.featured) ?? articles[0];
  const latest = articles.find((a) => a !== lead);
  const biz = articles.filter((a) => isBusiness(a) && a !== lead && a !== latest).slice(0, 3);
  const rest = articles.filter((a) => a !== lead && a !== latest && !biz.includes(a)).slice(0, 12);
  const main = !lead
    ? `<div class="home"><div><p class="empty">Nessun articolo, per ora.</p></div>${sidebar(articles)}</div>`
    : `${latest ? `<a class="ticker" href="${url(latest)}"><b>Ultim'ora · ${dayMonth(latest.date)}</b><span>${esc(latest.title)}</span></a>` : ''}
<div class="home">
  <div>
    <h1 class="sr-only">Blog di ${AUTHOR}</h1>
    <a class="lead" href="${url(lead)}">
      <div>
        ${tags(lead)}
        <h2>${esc(lead.title)}</h2>
        <p>${esc(lead.description)}</p>
        <span class="meta">${dayMonth(lead.date)} · ${lead.minutes} min di lettura</span>
      </div>
      ${thumb(lead)}
    </a>
    ${rest.length ? `<h2 class="section-title">Ultime notizie</h2>
    ${list(rest)}` : ''}
    ${biz.length ? `<section class="biz" id="azienda">
      <div class="biz-head">
        <h2><a href="${catUrl('per-la-tua-azienda')}">Per la tua azienda</a></h2>
        <p>${CATEGORIES['per-la-tua-azienda'].intro}</p>
      </div>
      <div class="biz-grid">
        ${biz.map((a) => `<a href="${url(a)}">${tags(a)}<h3>${esc(a.title)}</h3><p>${esc(a.description)}</p></a>`).join('\n        ')}
      </div>
    </section>` : ''}
  </div>
  ${sidebar(articles)}
</div>`;
  return page({
    title: `Blog – ${AUTHOR}`,
    description: "Notizie, guide e strumenti sull'intelligenza artificiale spiegati in modo semplice, per te e per la tua azienda.",
    path: '/blog/',
    active: 'home',
    main,
  });
}

function categoryPage(slug, articles) {
  const c = CATEGORIES[slug];
  const items = articles.filter((a) => (slug === 'per-la-tua-azienda' ? isBusiness(a) : a.category === slug));
  return page({
    title: `${c.name} – Blog di ${AUTHOR}`,
    description: c.intro,
    path: catUrl(slug),
    active: slug,
    main: `<div class="home">
  <div>
    <div class="cat-head"><h1>${esc(c.name)}</h1><p>${esc(c.intro)}</p></div>
    ${list(items)}
  </div>
  ${sidebar(articles)}
</div>`,
  });
}

const bullets = (title, items, cls) => (items.length ? `<div class="${cls}">
    <h2>${title}</h2>
    <ul>
      ${items.map((t) => `<li>${esc(t)}</li>`).join('\n      ')}
    </ul>
  </div>` : '');

function articlePage(a) {
  const path = url(a);
  const ogImage = a.image ? SITE + a.image : OG_IMAGE;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': a.category === 'guide-e-tutorial' ? 'Article' : 'NewsArticle',
    headline: a.title,
    description: a.description,
    datePublished: a.date.toISOString(),
    dateModified: a.date.toISOString(),
    inLanguage: 'it-IT',
    articleSection: CATEGORIES[a.category].name,
    image: [ogImage],
    mainEntityOfPage: SITE + path,
    author: { '@type': 'Person', name: AUTHOR, url: `${SITE}/` },
    publisher: { '@type': 'Person', name: AUTHOR, url: `${SITE}/` },
  };
  return page({
    title: `${a.title} – ${AUTHOR}`,
    description: a.description,
    path,
    type: 'article',
    jsonLd,
    image: ogImage,
    active: a.category,
    main: `<article class="article">
  <a class="back" href="/blog/">← Tutti gli articoli</a>
  <div style="margin-top:18px">${tags(a)}</div>
  <h1>${esc(a.title)}</h1>
  <p class="dek">${esc(a.description)}</p>
  <span class="meta">${AUTHOR} · <time datetime="${a.date.toISOString()}">${fullDate(a.date)}</time> · ${a.minutes} min di lettura</span>
  ${figure(a)}
  ${bullets('In breve, cosa cambia per te', a.perTe, 'impact')}
  <div class="body">
${a.html}
  </div>
  ${bullets('E per la tua azienda', a.perAzienda, 'impact work')}
  ${a.sources.length ? `<p class="sources">Fonti: ${a.sources.map((s) => `<a href="${esc(s.url)}" rel="noopener">${esc(s.title)}</a>`).join(' · ')}</p>` : ''}
  <div class="author"><i>DR</i><div><strong>${AUTHOR}</strong><br><span class="meta">AI &amp; LLM Engineer. Spiego l'intelligenza artificiale in modo semplice e costruisco agenti e automazioni.</span></div></div>
</article>`,
  });
}

const thanksPage = () => page({
  title: `Iscrizione ricevuta – ${AUTHOR}`,
  description: 'Grazie per esserti iscritto alla newsletter del sabato.',
  path: '/blog/grazie/',
  noindex: true,
  main: `<article class="article"><h1>Grazie!</h1><p class="dek">La tua iscrizione alla newsletter del sabato è arrivata.</p><a class="btn" href="/blog/">Torna al blog</a></article>`,
});

function rss(articles) {
  const items = articles.slice(0, 30).map((a) => `  <item>
    <title>${esc(a.title)}</title>
    <link>${SITE}${url(a)}</link>
    <guid isPermaLink="true">${SITE}${url(a)}</guid>
    <description>${esc(a.description)}</description>
    <category>${esc(CATEGORIES[a.category].name)}</category>
    <pubDate>${a.date.toUTCString()}</pubDate>
  </item>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Blog di ${AUTHOR}</title>
  <link>${SITE}/blog/</link>
  <description>Notizie, guide e strumenti sull'intelligenza artificiale spiegati in modo semplice.</description>
  <language>it-it</language>
  <atom:link href="${SITE}/blog/rss.xml" rel="self" type="application/rss+xml"/>
${articles[0] ? `  <lastBuildDate>${articles[0].date.toUTCString()}</lastBuildDate>\n` : ''}${items}
</channel>
</rss>
`;
}

function sitemap(articles) {
  const last = articles[0]?.date.toISOString().slice(0, 10);
  const entries = [
    ['/', null],
    ['/blog/', last],
    ...Object.keys(CATEGORIES).map((c) => [catUrl(c), null]),
    ...articles.map((a) => [url(a), a.date.toISOString().slice(0, 10)]),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(([p, d]) => `  <url><loc>${SITE}${p}</loc>${d ? `<lastmod>${d}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`;
}

function write(rel, content) {
  const file = join(DIST, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

const articles = loadArticles();
write('blog/index.html', homePage(articles));
for (const slug of Object.keys(CATEGORIES)) write(`blog/categoria/${slug}/index.html`, categoryPage(slug, articles));
for (const a of articles) write(`blog/${a.slug}/index.html`, articlePage(a));
write('blog/grazie/index.html', thanksPage());
write('blog/rss.xml', rss(articles));
write('sitemap.xml', sitemap(articles));
console.log(`Blog: ${articles.length} articoli generati in dist/blog/`);
