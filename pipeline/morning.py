import re
from datetime import date, datetime, timezone

import common

NOTE_CHARS = 500
KEEP_DAYS = 1


def answers(updates, pending):
    """Return ({slug: 'ok'|'no'}, {slug: note}) from updates sent by the owner's chat."""
    owner = str(common.chat_id())
    by_message = {m: slug for slug, p in pending.items() for m in p['messages']}
    decisions, notes = {}, {}
    for u in updates:
        cb, msg = u.get('callback_query'), u.get('message')
        if cb and str(cb.get('message', {}).get('chat', {}).get('id')) == owner:
            action, _, slug = cb.get('data', '').partition(':')
            if action in ('ok', 'no') and slug in pending:
                decisions[slug] = action
        elif msg and str(msg.get('chat', {}).get('id')) == owner and msg.get('text'):
            slug = by_message.get((msg.get('reply_to_message') or {}).get('message_id'))
            if slug:
                notes[slug] = msg['text']
    return decisions, notes


def add_note(md, note):
    note = ' '.join(note.split())[:NOTE_CHARS]
    head, sep, body = md.partition('\n---\n')
    return f'{head}{sep}> **La mia nota:** {note}\n\n{body}'


def publish(slug, note, today):
    md = (common.drafts_dir() / f'{slug}.md').read_text(encoding='utf-8')
    md = re.sub(r'^date: .*$', f'date: {today}', md, count=1, flags=re.M)
    if note:
        md = add_note(md, note)
    taken = {p.stem for p in common.blog_dir().glob('*.md')}
    target = common.blog_dir() / f'{common.slugify(slug, taken)}.md'
    target.write_text(md, encoding='utf-8')
    return target


def run(today=None):
    today = today or datetime.now(timezone.utc).date()
    pending_path = common.drafts_dir() / 'pending.json'
    pending = common.read_json(pending_path, {})
    updates = common.telegram('getUpdates', allowed_updates=['message', 'callback_query'])
    decisions, notes = answers(updates, pending)
    common.blog_dir().mkdir(parents=True, exist_ok=True)
    for slug in list(pending):
        draft = common.drafts_dir() / f'{slug}.md'
        action = decisions.get(slug)
        if action == 'ok' and draft.exists():
            print(f'pubblicato {publish(slug, notes.get(slug), today.isoformat()).name}')
        elif action is None and draft.exists() and (today - date.fromisoformat(pending[slug]['day'])).days <= KEEP_DAYS:
            continue
        draft.unlink(missing_ok=True)
        del pending[slug]
    common.write_json(pending_path, pending)
    if updates:
        common.telegram('getUpdates', offset=max(u['update_id'] for u in updates) + 1, timeout=0)


if __name__ == '__main__':
    run()
