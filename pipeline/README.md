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

## Conferme immediate

Con il webhook attivo, quando premi Approva o Scarta Telegram ti risponde subito ("Ricevuto: approvata"), i pulsanti spariscono e sotto il messaggio compare "Approvata, esce domattina" o "Scartata"; se rispondi a una bozza, il bot ti scrive "Nota salvata". La funzione `netlify/functions/telegram.mjs` salva le scelte in `pipeline/state/decisions.json` con un commit `[skip netlify]` (niente deploy a ogni pulsante), e il giro del mattino le legge da lì. Senza webhook resta tutto come prima (`getUpdates`).

Da creare, una volta sola:

1. **Token GitHub.** Su GitHub: Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token. Repository access: "Only select repositories" → `DesireeReale/portfolio`. Permissions → Repository permissions → Contents: "Read and write". Nient'altro.
2. **Segreto del webhook.** Una stringa casuale (solo lettere, numeri, `_` e `-`), per esempio con `python -c "import secrets; print(secrets.token_urlsafe(32))"`.
3. **Variabili su Netlify.** Nel sito su Netlify: Site configuration → Environment variables → Add a variable, con scope "Functions":
   - `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID`, gli stessi dei secret su GitHub;
   - `TELEGRAM_WEBHOOK_SECRET`, il segreto del punto 2;
   - `GITHUB_TOKEN`, il token del punto 1;
   - `GITHUB_REPO` = `DesireeReale/portfolio`;
   - `GITHUB_BRANCH` = `main`.
4. **Attivazione.** Quando questo lavoro è su `main` e il deploy su Netlify è finito (la funzione deve esistere), dal tuo computer:
   `TELEGRAM_BOT_TOKEN=... TELEGRAM_WEBHOOK_SECRET=... python pipeline/set_webhook.py`
   Lo script stampa lo stato del webhook. Per tornare a `getUpdates`: `python pipeline/set_webhook.py --remove`.

Le risposte arrivate prima dell'attivazione restano leggibili solo con `getUpdates`: attiva il webhook dopo un giro del mattino.

## Orari

Il cron di GitHub usa l'ora UTC e non segue l'ora legale. La sera parte alle 18:30 UTC (19:30 d'inverno, 20:30 d'estate), la mattina alle 05:30 UTC (06:30 d'inverno, 07:30 d'estate). GitHub può partire in ritardo anche di ore, o saltare una corsa: per questo c'è una seconda partenza di riserva due ore dopo (20:30 e 07:30 UTC), che esce subito se la corsa di quel giorno è già stata fatta (`state/last_run.txt` per la sera, `state/morning.json` per la mattina). Le corse lanciate a mano partono sempre.

## Tempi

Ogni corsa ha 35 minuti. La sera ne usa al massimo 25 (`EVENING_BUDGET_MIN` per cambiarli): quando ne restano meno di 5 smette di scrivere bozze, salva quelle già fatte e mette le altre in `state/retry.json` per la sera dopo. Ogni chiamata al modello aspetta al massimo 90 secondi per risposta, 60 secondi dopo un 429 e 4 minuti in tutto; il log mostra modello, secondi e tentativi di ogni chiamata e la durata di ogni fase.

## Risposte su Telegram

Senza webhook le risposte restano su Telegram finché qualcuno chiama `getUpdates` con un `offset` più alto: da quel momento sono cancellate. Lo fa solo `morning.py`, e solo alla corsa successiva, con l'offset salvato in `state/morning.json`, cioè dopo che la corsa precedente ha fatto il commit. Non chiamare mai `getUpdates` con `offset` a mano o da altri script (`offset=-1` cancella tutte le risposte tranne l'ultima); aprire `getUpdates` senza `offset` nel browser è innocuo. Telegram tiene le risposte 24 ore: se non parte nessun giro del mattino entro 24 ore dal pulsante, la scelta si perde e va ripremuta.

