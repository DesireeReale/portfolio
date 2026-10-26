# Notizie automatiche del blog

Ogni sera `evening.py` legge i feed in `feeds.json`, sceglie al massimo 3 notizie uscite dopo la corsa precedente (al massimo 72 ore prima, 24 ore al primo avvio), scrive le bozze in `drafts/` e te le manda su Telegram con i pulsanti **Approva** e **Scarta**. Ogni mattina `morning.py` legge le tue risposte: le bozze approvate passano in `content/blog/`, quelle scartate vengono cancellate, quelle senza risposta restano un altro giorno e poi vengono cancellate.

Oltre ai feed, legge i progetti di tendenza del giorno su <https://github.com/trending>: il modello propone solo quelli legati all'AI e utili a chi non programma, e la bozza spiega cosa fa il progetto e se puoi usarlo. Le chiamate al modello sono distanziate di qualche secondo per restare nei limiti dei piani gratuiti; se una bozza non si riesce a scrivere, la notizia viene riprovata la sera dopo. Se Telegram non risponde, le bozze restano in `drafts/` e vengono rimandate la sera dopo.

Se rispondi (con "Rispondi") al messaggio di una bozza, il tuo testo finisce in cima all'articolo come nota personale. Rispondi prima di premere Approva oppure entro la mattina dopo.

Le bozze marcate **DA CONTROLLARE** hanno problemi di stile rimasti dopo la riscrittura, oppure numeri e nomi che non compaiono nella fonte: leggi l'elenco in cima al messaggio prima di approvare.

## Attivazione

1. **Chiave LLM gratuita.** Una a scelta, tutte con endpoint compatibile OpenAI:
   - Groq: crea una chiave su <https://console.groq.com/keys>. `LLM_BASE_URL` = `https://api.groq.com/openai/v1`, `LLM_MODEL` per esempio `llama-3.3-70b-versatile`.
   - Gemini: chiave su <https://aistudio.google.com/apikey>. `LLM_BASE_URL` = `https://generativelanguage.googleapis.com/v1beta/openai`, `LLM_MODEL` per esempio `gemini-flash-lite-latest`.
   - OpenRouter: chiave su <https://openrouter.ai/keys>. `LLM_BASE_URL` = `https://openrouter.ai/api/v1`, `LLM_MODEL` un modello con suffisso `:free`.
2. **Bot Telegram.** Su Telegram scrivi a `@BotFather`, invia `/newbot`, scegli nome e username. Il token che ti risponde è `TELEGRAM_BOT_TOKEN`.
3. **Chat id.** Scrivi un messaggio qualsiasi al tuo bot, poi apri nel browser `https://api.telegram.org/bot<TOKEN>/getUpdates`. Il numero in `"chat":{"id": ...}` è `TELEGRAM_CHAT_ID`. Il bot accetta risposte solo da questa chat.
4. **Secret su GitHub.** Nel repository: Settings → Secrets and variables → Actions → New repository secret. Crea `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.
5. **Workflow.** I workflow programmati partono solo dal branch principale del repository: unisci questo lavoro su `main`. Per una prova subito: Actions → "Notizie della sera" → Run workflow.

Ogni push dei workflow fa ripartire il deploy su Netlify, quindi un articolo approvato è online pochi minuti dopo la corsa del mattino.

## Orari

Il cron di GitHub usa l'ora UTC e non segue l'ora legale. La sera parte alle 18:30 UTC (19:30 d'inverno, 20:30 d'estate), la mattina alle 05:30 UTC (06:30 d'inverno, 07:30 d'estate). GitHub può partire con qualche minuto di ritardo.

