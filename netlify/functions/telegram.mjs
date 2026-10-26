// Webhook del bot Telegram: conferma subito i pulsanti Approva/Scarta e le note,
// e registra le scelte in pipeline/state/decisions.json sul repository GitHub.

const TELEGRAM_MAX = 4096;
const NOTE_CHARS = 500;
const DECISIONS = 'pipeline/state/decisions.json';
const PENDING = 'pipeline/drafts/pending.json';
const ACTIONS = {
  ok: { decision: 'ok', toast: 'Ricevuto: approvata', label: 'Approvata, esce domattina' },
  no: { decision: 'no', toast: 'Ricevuto: scartata', label: 'Scartata' },
};

const env = (k) => process.env[k];

async function telegram(method, params) {
  const r = await fetch(`https://api.telegram.org/bot${env('TELEGRAM_BOT_TOKEN')}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await r.json();
  if (!data.ok) throw new Error(`Telegram ${method}: ${data.description}`);
  return data.result;
}

function github(path, init = {}) {
  return fetch(`https://api.github.com/repos/${env('GITHUB_REPO')}/contents/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env('GITHUB_TOKEN')}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'blog-telegram-webhook',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
}

async function readJson(path) {
  const r = await github(`${path}?ref=${encodeURIComponent(env('GITHUB_BRANCH'))}`);
  if (r.status === 404) return { data: {}, sha: undefined };
  if (!r.ok) throw new Error(`GitHub GET ${path}: ${r.status}`);
  const file = await r.json();
  return { data: JSON.parse(Buffer.from(file.content, 'base64').toString('utf8') || '{}'), sha: file.sha };
}

async function record(slug, fields, what) {
  for (let n = 0; n < 2; n++) {
    const { data, sha } = await readJson(DECISIONS);
    data[slug] = { ...data[slug], ...fields, time: new Date().toISOString() };
    const r = await github(DECISIONS, {
      method: 'PUT',
      body: JSON.stringify({
        message: `Telegram: ${what} ${slug} [skip netlify]`,
        content: Buffer.from(JSON.stringify(data, null, 2) + '\n').toString('base64'),
        branch: env('GITHUB_BRANCH'),
        ...(sha ? { sha } : {}),
      }),
    });
    if (r.ok) return;
    if (r.status !== 409 || n === 1) throw new Error(`GitHub PUT ${DECISIONS}: ${r.status}`);
  }
}

async function onButton(cb) {
  const [key, ...rest] = (cb.data || '').split(':');
  const action = ACTIONS[key];
  const slug = rest.join(':');
  if (!action || !slug) return;
  try {
    await record(slug, { decision: action.decision }, key === 'ok' ? 'approvata' : 'scartata');
  } catch (e) {
    console.error(e.message);
    await telegram('answerCallbackQuery', { callback_query_id: cb.id, text: 'Non salvata, riprova tra poco', show_alert: true });
    return;
  }
  await telegram('answerCallbackQuery', { callback_query_id: cb.id, text: action.toast });
  const label = `\n\n${action.label}`;
  await telegram('editMessageText', {
    chat_id: cb.message.chat.id,
    message_id: cb.message.message_id,
    text: (cb.message.text || '').slice(0, TELEGRAM_MAX - label.length) + label,
    disable_web_page_preview: true,
    reply_markup: { inline_keyboard: [] },
  });
}

async function onReply(msg) {
  const replyTo = msg.reply_to_message?.message_id;
  if (!replyTo || !msg.text) return;
  const { data: pending } = await readJson(PENDING);
  const slug = Object.keys(pending).find((s) => (pending[s].messages || []).includes(replyTo));
  if (!slug) return;
  await record(slug, { note: msg.text.slice(0, NOTE_CHARS) }, 'nota per');
  await telegram('sendMessage', { chat_id: msg.chat.id, text: 'Nota salvata', reply_to_message_id: msg.message_id });
}

export default async (req) => {
  const secret = env('TELEGRAM_WEBHOOK_SECRET');
  if (req.method !== 'POST' || !secret || req.headers.get('x-telegram-bot-api-secret-token') !== secret) {
    return new Response('forbidden', { status: 403 });
  }
  const update = await req.json().catch(() => ({}));
  const owner = String(env('TELEGRAM_CHAT_ID'));
  try {
    const cb = update.callback_query;
    if (cb && String(cb.message?.chat?.id) === owner) await onButton(cb);
    else if (update.message && String(update.message.chat?.id) === owner) await onReply(update.message);
  } catch (e) {
    console.error(e.message);
  }
  return new Response('ok');
};
