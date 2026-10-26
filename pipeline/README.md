# Notizie automatiche del blog

Ogni sera `evening.py` legge i feed in `feeds.json`, fa ordinare al modello le notizie uscite dopo la corsa precedente e prende sempre le prime 2 della classifica, 3 se la terza è consigliata (le motivazioni finiscono nel log della corsa); considera le notizie uscite (al massimo 72 ore prima, 24 ore al primo avvio), scrive le bozze in `drafts/` e te le manda su Telegram con i pulsanti **Approva** e **Scarta**. Ogni mattina `morning.py` legge le tue risposte: le bozze approvate passano in `content/blog/`, quelle scartate vengono cancellate, quelle senza risposta restano un altro giorno e poi vengono cancellate.

Oltre ai feed, legge i progetti di tendenza del giorno su <https://github.com/trending> e gli Spaces e i modelli di tendenza su Hugging Face (API pubblica, senza token; la fonte è il README o la scheda del modello). Le rassegne di gadget e le liste "i migliori" vengono scartate prima della scelta. Il modello propone solo quelli legati all'AI e utili a chi non programma, e la bozza spiega cosa fa il progetto e se puoi usarlo. Le chiamate al modello sono distanziate di qualche secondo per restare nei limiti dei piani gratuiti; se `LLM_DRAFT_MODEL` non risponde (errore, tempo scaduto o risposta vuota), quella bozza viene scritta con `LLM_MODEL`; se non si riesce a scriverla nemmeno così, la notizia viene riprovata la sera dopo. Se Telegram non risponde, le bozze restano in `drafts/` e vengono rimandate la sera dopo.

I pulsanti non danno una risposta subito: la scelta viene letta dal giro del mattino, che poi toglie i pulsanti, aggiunge "Approvata" o "Scartata" al messaggio e ti manda un riepilogo di cosa è stato pubblicato, scartato o è ancora in attesa.

Se rispondi (con "Rispondi") al messaggio di una bozza, il tuo testo finisce in cima all'articolo come nota personale. Rispondi prima di premere Approva oppure entro la mattina dopo.

Immagini: per i progetti GitHub e Hugging Face la bozza prende la prima immagine vera del README o della scheda (niente badge né loghi; per gli Spaces senza immagini, l'anteprima della pagina), per i blog ufficiali segnati con `"immagini": "og"` in `feeds.json` l'immagine di anteprima della pagina; per le testate giornalistiche nessuna immagine, e il blog mostra una copertina col titolo. La sera salva solo l'indirizzo e il credito; la mattina, all'approvazione, l'immagine viene scaricata in `public/blog/<slug>/`. Sotto i 600px di larghezza si usa la copertina.

Anteprima delle bozze: `python pipeline/preview.py CARTELLA [--skip SLUG ...]` costruisce in `CARTELLA` (fuori dal repository) il blog come se tutte le bozze fossero approvate, con i problemi da controllare in cima a ogni articolo, e stampa l'elenco dei file da pubblicare come artifact.

Le bozze marcate **DA CONTROLLARE** hanno problemi di stile rimasti dopo la riscrittura, oppure numeri e nomi che non compaiono nella fonte: leggi l'elenco in cima al messaggio prima di approvare.

## Attivazione

1. **Chiave LLM gratuita.** Una a scelta, tutte con endpoint compatibile OpenAI:
   - Groq: crea una chiave su <https://console.groq.com/keys>. `LLM_BASE_URL` = `https://api.groq.com/openai/v1`, `LLM_MODEL` per esempio `llama-3.3-70b-versatile`.
   - Gemini: chiave su <https://aistudio.google.com/apikey>. `LLM_BASE_URL` = `https://generativelanguage.googleapis.com/v1beta/openai`, `LLM_MODEL` per esempio `gemini-flash-lite-latest`.
   - OpenRouter: chiave su <https://openrouter.ai/keys>. `LLM_BASE_URL` = `https://openrouter.ai/api/v1`, `LLM_MODEL` un modello con suffisso `:free`.
2. **Bot Telegram.** Su Telegram scrivi a `@BotFather`, invia `/newbot`, scegli nome e username. Il token che ti risponde è `TELEGRAM_BOT_TOKEN`.
3. **Chat id.** Scrivi un messaggio qualsiasi al tuo bot, poi apri nel browser `https://api.telegram.org/bot<TOKEN>/getUpdates`. Il numero in `"chat":{"id": ...}` è `TELEGRAM_CHAT_ID`. Il bot accetta risposte solo da questa chat.
4. **Secret su GitHub.** Nel repository: Settings → Secrets and variables → Actions → New repository secret. Crea `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`. Facoltativo: `LLM_DRAFT_MODEL`, un modello più capace usato solo per scrivere le bozze (per esempio `gemini-3.8-flash`); se manca, si usa `LLM_MODEL` anche per le bozze.
5. **Workflow.** I workflow programmati partono solo dal branch principale del repository: unisci questo lavoro su `main`. Per una prova subito: Actions → "Notizie della sera" → Run workflow.

Ogni push dei workflow fa ripartire il deploy su Netlify, quindi un articolo approvato è online pochi minuti dopo la corsa del mattino.

## Orari

Il cron di GitHub usa l'ora UTC e non segue l'ora legale. La sera parte alle 18:30 UTC (19:30 d'inverno, 20:30 d'estate), la mattina alle 05:30 UTC (06:30 d'inverno, 07:30 d'estate). GitHub può partire con qualche minuto di ritardo.

