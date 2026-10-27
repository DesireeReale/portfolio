import re
import sys
from datetime import date, datetime, timezone

import common

NOTE_CHARS = 500
KEEP_DAYS = 1
TELEGRAM_MAX = 4096
LABELS = {'ok': 'Approvata: online dopo il deploy', 'no': 'Scartata'}


def answers(updates, pending):
    """Return ({slug: ('ok'|'no', message)}, {slug: note}) from updates sent by the owner's chat."""
    owner = str(common.chat_id())
    by_message = {m: slug for slug, p in pending.items() for m in p['messages']}
    decisions, notes = {}, {}
    for u in updates:
        cb, msg = u.get('callback_query'), u.get('message')
        if cb and str(cb.get('message', {}).get('chat', {}).get('id')) == owner:
            action, _, slug = cb.get('data', '').partition(':')
            if action in ('ok', 'no') and slug in pending:
                decisions[slug] = (action, cb['message'])
        elif msg and str(msg.get('chat', {}).get('id')) == owner and msg.get('text'):
            slug = by_message.get((msg.get('reply_to_message') or {}).get('message_id'))
            if slug:
                notes[slug] = msg['text']
    return decisions, notes


def recorded(decisions_path, pending):
    """Return ({slug: ('ok'|'no', None)}, {slug: note}) saved by the Telegram webhook."""
    saved = common.read_json(decisions_path, {})
    decisions = {s: (d['decision'], None) for s, d in saved.items() if s in pending and d.get('decision') in ('ok', 'no')}
    notes = {s: d['note'] for s, d in saved.items() if s in pending and d.get('note')}
    return decisions, notes


def add_note(md, note):
    note = ' '.join(note.split())[:NOTE_CHARS]
    head, sep, body = md.partition('\n---\n')
    return f'{head}{sep}> **La mia nota:** {note}\n\n{body}'


def mark(slug, action, message):
    text = message.get('text', '')
    label = f'\n\n{LABELS[action]}'
    try:
        common.telegram('editMessageText', chat_id=common.chat_id(), message_id=message['message_id'],
                        text=text[:TELEGRAM_MAX - len(label)] + label, disable_web_page_preview=True,
                        reply_markup={'inline_keyboard': []})
    except Exception as e:
        print(f'messaggio di {slug} non aggiornato: {e}', file=sys.stderr)


def drop_buttons(slug, message_id):
    try:
        common.telegram('editMessageReplyMarkup', chat_id=common.chat_id(), message_id=message_id,
                        reply_markup={'inline_keyboard': []})
    except Exception as e:
        print(f'pulsanti di {slug} non rimossi: {e}', file=sys.stderr)


def summary(done):
    names = {'ok': 'Pubblicate', 'no': 'Scartate', 'wait': 'In attesa di risposta', 'old': 'Scadute senza risposta'}
    lines = ['Giro del mattino']
    for key, title in names.items():
        if done[key]:
            lines += ['', f'{title}:'] + [f'- {s}' for s in done[key]]
    return '\n'.join(lines)


def publish(slug, note, today):
    md = (common.drafts_dir() / f'{slug}.md').read_text(encoding='utf-8')
    md = re.sub(r'^date: .*$', f'date: {today}', md, count=1, flags=re.M)
    if note:
        md = add_note(md, note)
    taken = {p.stem for p in common.blog_dir().glob('*.md')}
    target = common.blog_dir() / f'{common.slugify(slug, taken)}.md'
    target.write_text(common.localize_image(md, target.stem, common.ROOT / 'public'), encoding='utf-8')
    return target


def run(today=None):
    today = today or datetime.now(timezone.utc).date()
    pending_path = common.drafts_dir() / 'pending.json'
    pending = common.read_json(pending_path, {})
    decisions_path = common.ROOT / 'pipeline' / 'state' / 'decisions.json'
    state_path = common.ROOT / 'pipeline' / 'state' / 'morning.json'
    state = common.read_json(state_path, {})
    webhook = common.telegram('getWebhookInfo').get('url')
    # The offset confirms the previous run's updates only once that run's commit is in the repository.
    offset = {'offset': state['offset']} if state.get('offset') else {}
    updates = [] if webhook else common.telegram('getUpdates', allowed_updates=['message', 'callback_query'], **offset)
    print(f"Telegram: {len(updates)} aggiornamenti" + (f" ({updates[0]['update_id']}-{updates[-1]['update_id']})" if updates else '')
          + (' (webhook attivo)' if webhook else ''))
    decisions, notes = answers(updates, pending)
    saved_decisions, saved_notes = recorded(decisions_path, pending)
    decisions.update(saved_decisions)
    notes.update(saved_notes)
    common.blog_dir().mkdir(parents=True, exist_ok=True)
    done = {'ok': [], 'no': [], 'wait': [], 'old': []}
    for slug in list(pending):
        draft = common.drafts_dir() / f'{slug}.md'
        action, message = decisions.get(slug, (None, None))
        if action == 'ok' and draft.exists():
            done['ok'].append(publish(slug, notes.get(slug), today.isoformat()).stem)
        elif action is None and draft.exists() and (today - date.fromisoformat(pending[slug]['day'])).days <= KEEP_DAYS:
            done['wait'].append(slug)
            continue
        elif action == 'no':
            done['no'].append(slug)
        else:
            done['old'].append(slug)
            if pending[slug]['messages']:
                drop_buttons(slug, pending[slug]['messages'][-1])
        if action and message:
            mark(slug, action, message)
        draft.unlink(missing_ok=True)
        del pending[slug]
    common.write_json(pending_path, pending)
    if decisions_path.exists():
        common.write_json(decisions_path, {s: d for s, d in common.read_json(decisions_path, {}).items() if s in pending})
    if any(done.values()):
        try:
            common.telegram('sendMessage', chat_id=common.chat_id(), text=summary(done))
        except Exception as e:
            print(f'riepilogo non inviato: {e}', file=sys.stderr)
    if updates:
        state['offset'] = max(u['update_id'] for u in updates) + 1
    common.write_json(state_path, dict(state, day=today.isoformat()))


if __name__ == '__main__':
    run()
