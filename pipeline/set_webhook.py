"""Point the Telegram bot at the Netlify function, or remove the webhook with --remove.

Needs TELEGRAM_BOT_TOKEN and, without --remove, TELEGRAM_WEBHOOK_SECRET.
"""
import os
import sys

import common

URL = 'https://desireereale.netlify.app/.netlify/functions/telegram'

if __name__ == '__main__':
    if '--remove' in sys.argv[1:]:
        common.telegram('deleteWebhook')
        print('Webhook rimosso: il giro del mattino torna a leggere le risposte con getUpdates.')
    else:
        common.telegram('setWebhook', url=URL, secret_token=os.environ['TELEGRAM_WEBHOOK_SECRET'],
                        allowed_updates=['message', 'callback_query'])
        print(f'Webhook impostato su {URL}')
    info = common.telegram('getWebhookInfo')
    print(f"Stato: url={info.get('url') or '(nessuno)'}, in attesa={info.get('pending_update_count', 0)}"
          + (f", ultimo errore: {info['last_error_message']}" if info.get('last_error_message') else ''))
