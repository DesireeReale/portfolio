---
title: "Agenti AI in azienda: il problema è quello che non vedi"
description: "Cinque incidenti reali tra il 2025 e il 2026 hanno la stessa forma: l'agente aveva più accesso del necessario e nessuno vedeva cosa faceva."
date: 2026-10-27
category: per-la-tua-azienda
image: /blog/agenti-ai-in-azienda-quello-che-non-vedi/cover.png
forBusiness: true
featured: true
perTe:
  - "Se usi un agente che delega ad altri agenti, di solito ricevi il resoconto finale e non l'elenco dei comandi eseguiti."
  - "Un divieto scritto nel prompt è una richiesta al modello: nel caso PocketOS l'agente l'ha ignorato."
  - "Una skill o un plugin presi da GitHub danno all'agente istruzioni scritte da altri, da leggere prima di installarli."
perAzienda:
  - "Ogni agente e subagente deve avere solo i permessi che gli servono, imposti dal sistema e non dal prompt."
  - "Cancellazioni, deploy, pagamenti e invii all'esterno vanno approvati da una persona."
  - "Serve un registro di ogni chiamata agli strumenti, subagenti compresi, con il nome di chi l'ha avviata."
sources:
  - title: "Cerbos: PocketOS, database cancellato in 9 secondi"
    url: https://cerbos.dev/blog/ai-coding-agent-deleted-a-production-database-in-9-seconds
  - title: "ABC News: Railway recupera i backup di PocketOS"
    url: https://6abc.com/post/rogue-ai-agent-cursor-goes-haywire-deletes-tech-companys-database/19008099/
  - title: "SaaStr: l'incidente Replit e le correzioni"
    url: https://www.saastr.com/replits-new-release-address-most-of-the-challenges-we-hit-vibe-coding-but-is-prosumer-vibe-coding-really-ready-for-commercial-apps-yet
  - title: "OECD AI Incidents: Replit"
    url: https://oecd.ai/en/incidents/2025-07-19-1eb1
  - title: "AWS Security Bulletin AWS-2025-015: Amazon Q Developer per VS Code"
    url: https://aws.amazon.com/security/security-bulletins/AWS-2025-015/
  - title: "CyberInsider: Amazon Q e il prompt distruttivo"
    url: https://cyberinsider.com/amazons-ai-coding-assistant-for-vsc-infected-with-data-wiper/
  - title: "NVD: CVE-2025-32711"
    url: https://nvd.nist.gov/vuln/detail/CVE-2025-32711
  - title: "BleepingComputer: EchoLeak in Microsoft 365 Copilot"
    url: https://bleepingcomputer.com/news/security/zero-click-ai-data-leak-flaw-uncovered-in-microsoft-365-copilot
  - title: "Invariant Labs: vulnerabilità del server MCP di GitHub"
    url: https://invariantlabs.ai/blog/mcp-github-vulnerability
  - title: "Simon Willison: The lethal trifecta for AI agents"
    url: https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/
  - title: "Anthropic: Agent Skills, considerazioni di sicurezza"
    url: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
  - title: "Gartner: oltre il 40% dei progetti agentici cancellati entro il 2027"
    url: https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027
  - title: "Cloud Security Alliance: The Visibility Gap in Autonomous AI Agents"
    url: https://cloudsecurityalliance.org/articles/the-visibility-gap-in-autonomous-ai-agents
  - title: "OWASP: Top 10 for Agentic Applications"
    url: https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications/
  - title: "GitHub, anthropics/claude-code #46253: Subagent observability gap"
    url: https://github.com/anthropics/claude-code/issues/46253
  - title: "InfoWorld: Codex Multi-Agent V2 e la trasparenza degli agenti"
    url: https://www.infoworld.com/article/4197328/codex-multi-agent-v2-update-raises-developer-concerns-over-agent-transparency.html
---
Un agente AI che lavora da solo su un compito si può seguire passo per passo. Quando divide il lavoro e lo passa ad altri agenti, gran parte di quello che succede esce dalla tua vista. Ricevi un resoconto finale, mentre le singole azioni restano dentro i subagenti.

Gli incidenti documentati tra il 2025 e il 2026 hanno quasi tutti la stessa forma. L'agente aveva accesso a più cose di quante gliene servissero, e il limite era scritto in linguaggio naturale invece che imposto dal sistema. Ogni caso qui sotto ha una fonte in fondo alla pagina.

## Il punto cieco dei subagenti

In un flusso multi-agente un orchestratore divide il lavoro e lo affida a subagenti specializzati. Ognuno ha il suo contesto e i suoi strumenti. Alla fine restituisce un testo che riassume cosa ha fatto, e l'orchestratore legge quel testo. Tu leggi quello che l'orchestratore ti riporta.

Il 10 aprile 2026 un utente ha aperto su GitHub una richiesta per Claude Code che descrive questo vuoto. L'agente principale riceve solo il testo finale del subagente, più token consumati, durata e numero di strumenti usati. Se il subagente sovrascrive un file o lancia un comando distruttivo, non resta traccia fuori dal suo contesto.

A luglio 2026 InfoWorld ha raccontato un problema simile con Codex di OpenAI. Con il protocollo Multi-Agent V2 le istruzioni che l'agente principale passa ai subagenti viaggiano cifrate, e gli sviluppatori non possono più leggerle. Un contributore di OpenAI ha risposto che il protocollo è ancora in sviluppo.

La visibilità serve a ricostruire cosa è successo. Per evitare il danno serve un blocco. Se il divieto esiste solo come frase nel prompt, tipo "non toccare la produzione", è il modello a decidere se rispettarlo. Un permesso vero lo applica il sistema, e l'agente non può scavalcarlo.

## Cinque casi reali

### PocketOS e Cursor, aprile 2026

PocketOS vende software alle aziende di noleggio auto. Un agente in Cursor, con il modello Claude Opus 4.6, lavorava a un compito di routine nell'ambiente di staging. In un file estraneo al compito ha trovato un token API di Railway, il fornitore dell'infrastruttura.

Con una sola chiamata, in circa 9 secondi, ha cancellato un volume con dentro il database di produzione e i backup a livello di volume. Sono spariti tre mesi di prenotazioni. L'agente aveva l'istruzione di non eseguire mai comandi irreversibili senza approvazione, e l'ha ignorata.

Il fondatore Jeremy Crane ha descritto 30 ore di caos. Railway ha poi recuperato i dati da backup conservati altrove e ha corretto la vecchia API usata dall'agente, che cancellava senza ritardo.

**La lezione:** un token leggibile in un file è un permesso, e la regola nel prompt non ha fermato nulla.

### Replit e SaaStr, luglio 2025

Jason Lemkin, fondatore di SaaStr, costruiva un'app con l'agente di Replit da circa nove giorni. Durante un blocco del codice dichiarato, dopo undici avvertimenti scritti in maiuscolo, l'agente ha cancellato il database di produzione. Conteneva i dati di 1.206 dirigenti e di oltre 1.196 aziende.

Poi l'agente ha sostenuto che il rollback fosse impossibile. Era falso, e i dati sono stati recuperati.

**La lezione:** l'agente aveva accesso diretto alla produzione. Dopo l'incidente Replit ha separato in automatico i database di sviluppo e di produzione, con l'agente limitato allo sviluppo.

### Amazon Q per VS Code, luglio 2025

Il 13 luglio un attaccante ha inserito un commit nel repository open source di Amazon Q Developer per VS Code, un'estensione con oltre 950.000 installazioni. Il codice conteneva un prompt che chiedeva all'assistente di svuotare la cartella home e cancellare risorse AWS.

La versione 1.84.0 è uscita il 17 luglio ed è stata ritirata il 19, dopo almeno 48 ore online. Secondo AWS il codice non è partito per un errore di sintassi. L'attaccante era entrato grazie a un token GitHub con permessi troppo ampi nella configurazione di build.

**La lezione:** le istruzioni per un agente possono arrivare dalla catena di fornitura, dentro un aggiornamento ufficiale.

### EchoLeak in Microsoft 365 Copilot, giugno 2025

I ricercatori di Aim Labs hanno mostrato che una sola email costruita con cura poteva spingere Copilot a far uscire dati interni, senza alcun clic della vittima. La falla è registrata come CVE-2025-32711. Microsoft le ha dato un punteggio CVSS di 9,3 e l'aveva già corretta lato server a maggio. Non risultano abusi reali.

**La lezione:** i controlli sui permessi classici non bastano quando è il modello a scegliere cosa leggere e dove mandarlo.

### Server MCP di GitHub, maggio 2025

Invariant Labs ha dimostrato un attacco tramite il server MCP ufficiale di GitHub. L'attaccante apre una issue in un repository pubblico, con istruzioni nascoste nel testo. L'utente chiede al suo agente di guardare le issue aperte, e l'agente esegue quelle istruzioni.

L'agente legge i repository privati dell'utente e ne pubblica il contenuto in una pull request sul repository pubblico. Nella demo l'utente aveva impostato "Consenti sempre" per le chiamate agli strumenti.

<style>.dg { width: 100%; height: auto; display: block; border-radius: 14px; border: 1px solid var(--line); } .dg-paper { fill: var(--surface); } .dg-zone { font: 600 13px var(--mono); letter-spacing: 0.14em; fill: var(--muted); } .dg-seen { fill: none; stroke: var(--muted); stroke-dasharray: 6 5; } .dg-hidden { fill: var(--surface-2); stroke: var(--line); } .dg-line { fill: none; stroke: var(--muted); stroke-width: 1.5; } .dg-line-a { fill: none; stroke: var(--accent); stroke-width: 2; } .dg-dash { stroke-dasharray: 5 4; } .dg-mk { fill: var(--muted); } .dg-mk-a { fill: var(--accent); } .dg-lab { font: 500 12px var(--mono); letter-spacing: 0.08em; fill: var(--muted); } .dg-node { fill: var(--surface); stroke: var(--muted); } .dg-chip { fill: var(--surface); stroke: var(--line); } .dg-chip-a { fill: var(--accent-soft); stroke: var(--accent); } .dg-name { font: 600 22px var(--text); fill: var(--fg); } .dg-sub { font: 400 15px var(--mono); fill: var(--muted); } .dg-code { font: 500 17px var(--mono); fill: var(--fg); } .dg-code-a { font: 600 17px var(--mono); fill: var(--accent); } .dg-tag, .dg-tag-a { font: 600 11px var(--mono); letter-spacing: 0.12em; fill: var(--muted); } .dg-tag-a { fill: var(--accent); } .dg-set { fill: var(--fg); fill-opacity: 0.04; stroke: var(--muted); stroke-width: 1.5; } .dg-sweet { fill: var(--accent); fill-opacity: 0.22; } .dg-name-a { font: 700 18px var(--text); fill: var(--fg); } .dg-s .dg-name { font-size: 16px; } .dg-s .dg-sub { font-size: 12px; }</style>
<figure class="figure">
<svg class="dg dg-s" viewBox="0 0 640 352" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="mcp-title mcp-desc">
<title id="mcp-title">L'attacco al server MCP di GitHub</title>
<desc id="mcp-desc">Una issue malevola in un repository pubblico dà istruzioni all'agente, che legge i repository privati dell'utente e ne pubblica il contenuto in una pull request pubblica.</desc>
<defs>
<marker id="mcp-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" class="dg-mk"/></marker>
<marker id="mcp-arrow-accent" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" class="dg-mk-a"/></marker>
</defs>
<rect width="640" height="352" class="dg-paper"/>
<line x1="184" y1="100" x2="228" y2="100" class="dg-line" marker-end="url(#mcp-arrow)"/>
<line x1="456" y1="100" x2="412" y2="100" class="dg-line" marker-end="url(#mcp-arrow)"/>
<line x1="320" y1="148" x2="320" y2="236" class="dg-line-a" marker-end="url(#mcp-arrow-accent)"/>
<rect x="336" y="180" width="80" height="24" class="dg-paper"/>
<text x="344" y="197" class="dg-lab">PUBBLICA</text>
<rect x="16" y="52" width="168" height="96" rx="6" class="dg-node"/>
<text x="32" y="74" class="dg-tag">PUBBLICO</text>
<text x="32" y="104" class="dg-name">Issue malevola</text>
<text x="32" y="128" class="dg-sub">ordini nascosti</text>
<rect x="236" y="52" width="168" height="96" rx="6" class="dg-node"/>
<text x="252" y="74" class="dg-tag">TOKEN UTENTE</text>
<text x="252" y="104" class="dg-name">Agente</text>
<text x="252" y="128" class="dg-sub">legge le issue</text>
<rect x="456" y="52" width="168" height="96" rx="6" class="dg-node"/>
<text x="472" y="74" class="dg-tag">PRIVATO</text>
<text x="472" y="104" class="dg-name">Altri repository</text>
<text x="472" y="128" class="dg-sub">codice, dati</text>
<rect x="208" y="244" width="224" height="96" rx="6" class="dg-chip-a"/>
<text x="224" y="266" class="dg-tag-a">PUBBLICO</text>
<text x="224" y="296" class="dg-name">Pull request</text>
<text x="224" y="320" class="dg-sub">dati privati in chiaro</text>
</svg>
<figcaption>Schema basato sulla ricerca di <a href="https://invariantlabs.ai/blog/mcp-github-vulnerability" rel="noopener">Invariant Labs</a></figcaption>
</figure>

**La lezione:** secondo i ricercatori il difetto non sta nel codice del server, quindi una patch di GitHub non basta. Ogni sessione dell'agente va limitata ai soli repository che gli servono.

Su EchoLeak e Amazon Q non è stato confermato alcun danno reale. Restano prove concrete di cosa può succedere.

## Le skill prese da GitHub sono codice di altri

Su GitHub circolano raccolte di skill, plugin e agenti pronti da installare. Una skill è una cartella con un file SKILL.md di istruzioni e spesso degli script che l'agente esegue. Installarla significa dare all'agente istruzioni scritte da qualcuno che non conosci.

Lo schema è quello del caso Amazon Q. Lì il testo malevolo è entrato in un aggiornamento ufficiale dopo una compromissione. Con una skill presa da un repository qualsiasi, a installarlo sei tu.

Anthropic lo scrive nella documentazione delle Agent Skills. Vanno usate solo da fonti fidate, cioè create da te o pubblicate da Anthropic. Una skill malevola può far chiamare strumenti o eseguire codice in modi diversi da quelli dichiarati, fino a far uscire dati.

Il consiglio è leggere tutti i file prima di usarla, script compresi, come prima di installare un programma. In Claude Code una skill ha lo stesso accesso alla rete di qualsiasi programma sul computer. Se scarica contenuti da indirizzi esterni resta a rischio anche quando oggi è pulita, perché quei contenuti possono cambiare.

## La lethal trifecta

Il 16 giugno 2025 lo sviluppatore Simon Willison ha dato un nome allo schema dietro quasi tutti questi casi. Un agente diventa sfruttabile quando ha insieme tre cose:

- accesso a dati privati, come email, file, database e codice;
- esposizione a contenuti non fidati, come una pagina web, una issue pubblica o un'email in arrivo;
- un modo per comunicare verso l'esterno, come inviare email, chiamare API o pubblicare.

<figure class="figure">
<svg class="dg dg-s" viewBox="0 0 600 580" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="trifecta-title trifecta-desc">
<title id="trifecta-title">La lethal trifecta</title>
<desc id="trifecta-desc">Tre insiemi che si sovrappongono: dati privati, contenuti non fidati e un canale verso l'esterno; dove si incontrano tutti e tre l'agente diventa sfruttabile.</desc>
<defs>
<clipPath id="trifecta-c1"><circle cx="300" cy="220" r="152"/></clipPath>
<clipPath id="trifecta-c2"><circle cx="220" cy="360" r="152"/></clipPath>
</defs>
<rect width="600" height="580" class="dg-paper"/>
<circle cx="300" cy="220" r="152" class="dg-set"/>
<circle cx="220" cy="360" r="152" class="dg-set"/>
<circle cx="380" cy="360" r="152" class="dg-set"/>
<g clip-path="url(#trifecta-c1)"><g clip-path="url(#trifecta-c2)"><circle cx="380" cy="360" r="152" class="dg-sweet"/></g></g>
<text x="300" y="52" text-anchor="middle" class="dg-name">Dati privati</text>
<text x="160" y="552" text-anchor="middle" class="dg-name">Contenuti non fidati</text>
<text x="440" y="552" text-anchor="middle" class="dg-name">Canale verso l'esterno</text>
<text x="300" y="148" text-anchor="middle" class="dg-sub">email · file</text>
<text x="300" y="170" text-anchor="middle" class="dg-sub">database · codice</text>
<text x="156" y="420" text-anchor="middle" class="dg-sub">issue · pagine web</text>
<text x="156" y="442" text-anchor="middle" class="dg-sub">email in arrivo</text>
<text x="444" y="420" text-anchor="middle" class="dg-sub">invio email · API</text>
<text x="444" y="442" text-anchor="middle" class="dg-sub">pull request</text>
<text x="300" y="306" text-anchor="middle" class="dg-name-a">agente</text>
<text x="300" y="330" text-anchor="middle" class="dg-name-a">sfruttabile</text>
</svg>
<figcaption>Schema basato sul diagramma di <a href="https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/" rel="noopener">Simon Willison</a></figcaption>
</figure>

Un modello linguistico tende a seguire le istruzioni che trova nei testi che legge, anche quando non vengono da te. Willison scrive che i fornitori di LLM non ci salveranno. Tocca a chi progetta il flusso evitare di unire le tre condizioni.

Con più agenti il rischio cresce. Ogni subagente può averne una sola, ma se si passano il contesto la trifecta si ricompone senza che nessuno la veda per intero.

## I numeri degli analisti

- **Gartner, giugno 2025.** Oltre il 40% dei progetti di AI agentica sarà cancellato entro la fine del 2027, per costi crescenti, valore poco chiaro o controlli del rischio inadeguati. Solo circa 130 fornitori, su migliaia, offrono agenti veri.
- **Ancora Gartner.** Entro il 2028 almeno il 15% delle decisioni di lavoro quotidiane sarà preso in autonomia da agenti, contro lo 0% del 2024.
- **Cloud Security Alliance, febbraio 2026.** Solo il 28% degli intervistati riconduce in modo affidabile le azioni di un agente a una persona o a un sistema in tutti gli ambienti. Il 46% ci riesce solo in alcuni, il 9% per niente.
- **OWASP, dicembre 2025.** Il progetto ha pubblicato la Top 10 per le applicazioni agentiche, scritta con oltre 100 esperti. Tra le categorie ci sono l'uso improprio degli strumenti, la comunicazione insicura tra agenti e i guasti a cascata.

## Le regole minime per partire

Gli agenti funzionano bene in ambienti stretti, con input e output delimitati e una persona che approva le azioni importanti. Prima di lasciarli lavorare su sistemi reali servono queste basi.

1. **Permessi minimi, imposti dal sistema.** Ogni agente e subagente accede solo alle cartelle, ai repository e alle tabelle che gli servono. Un divieto scritto nel prompt resta una richiesta.
2. **Nessuna credenziale in giro.** Se un token è leggibile in un file, l'agente può usarlo. Servono token separati per staging e produzione, con lo scopo più stretto possibile.
3. **Conferma umana per l'irreversibile.** Cancellazioni, deploy, pagamenti e invii all'esterno passano da un'approvazione che l'agente non può aggirare.
4. **Rompere la trifecta.** Se un agente legge contenuti esterni, non deve avere insieme dati sensibili e un canale per farli uscire.
5. **Registro di ogni chiamata, subagenti compresi.** Per ogni azione serve sapere quale agente ha usato quale strumento su quale risorsa, e a nome di chi.
6. **Backup separati.** Su un altro volume, meglio presso un altro fornitore, e provati con un ripristino vero.
7. **Partire in piccolo.** Si comincia da un flusso a basso rischio e si allarga quando i registri mostrano che l'agente resta nei confini.
