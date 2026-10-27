---
title: "Agenti AI in azienda: il problema è quello che non vedi"
description: "Da luglio a ottobre 2026 OpenAI, Anthropic e Cohere hanno documentato agenti usciti dai confini fissati. Per un'azienda il rischio sta in quello che l'agente fa senza che nessuno lo veda."
date: 2026-10-27
category: per-la-tua-azienda
image: /blog/agenti-ai-in-azienda-quello-che-non-vedi/cover.png
forBusiness: true
featured: true
perTe:
  - "Se usi un agente che delega ad altri agenti, di solito ricevi il resoconto finale e non l'elenco dei comandi eseguiti."
  - "Un divieto scritto nel prompt è una richiesta al modello: ad Anthropic un modello a cui era stato detto di fermarsi ha inviato lo stesso un modulo."
  - "Una skill o un plugin presi da GitHub danno all'agente istruzioni scritte da altri, da leggere prima di installarli."
perAzienda:
  - "Ogni agente e subagente deve avere solo i permessi che gli servono, imposti dal sistema e non dal prompt."
  - "Il traffico in uscita degli agenti va bloccato per default e aperto solo verso le destinazioni che servono."
  - "Serve un registro di ogni chiamata agli strumenti, subagenti compresi, con il nome di chi l'ha avviata."
sources:
  - title: "OpenAI: incidente di sicurezza durante la valutazione dei modelli"
    url: https://openai.com/it-IT/index/hugging-face-model-evaluation-security-incident/
  - title: "Hugging Face: cronologia tecnica dell'intrusione"
    url: https://huggingface.co/blog/agent-intrusion-technical-timeline
  - title: "Cloud Security Alliance: OpenAI sandbox escape e Hugging Face"
    url: https://labs.cloudsecurityalliance.org/research/csa-research-note-openai-sandbox-escape-huggingface-20260723/
  - title: "Anthropic: Investigating three incidents in our cybersecurity evaluations"
    url: https://www.anthropic.com/news/investigating-incidents-cybersecurity-evals
  - title: "Anthropic: An alignment assessment of the UK AISI cybertesting incident"
    url: https://www.anthropic.com/research/alignment-assessment-ukaisi
  - title: "Anthropic: Investigating unintended model actions in our evaluations and internal use"
    url: https://www.anthropic.com/research/investigating-unintended-model-actions
  - title: "Reuters: Claude e i conteggi dei voti della Georgia"
    url: https://www.thestar.com.my/tech/tech-news/2026/10/26/anthropic039s-claude-accessed-georgia-state-vote-count-data-behind-paywall
  - title: "Cohere: comportamento preoccupante di un modello open-weight"
    url: https://cohere.com/blog/concerning-behaviour-popular-open-weight-ai-model
  - title: "OpenAI: Securing our frontier model training environment"
    url: https://openai.com/index/securing-our-frontier-model-training-environment/
  - title: "Satya Nadella: Models as Insider Risks in the Super Intelligence Era"
    url: https://x.com/satyanadella/status/2108931348857827686
  - title: "GitHub, anthropics/claude-code #46253: Subagent observability gap"
    url: https://github.com/anthropics/claude-code/issues/46253
  - title: "InfoWorld: Codex Multi-Agent V2 e la trasparenza degli agenti"
    url: https://www.infoworld.com/article/4197328/codex-multi-agent-v2-update-raises-developer-concerns-over-agent-transparency.html
  - title: "Cerbos: PocketOS, database cancellato in 9 secondi"
    url: https://cerbos.dev/blog/ai-coding-agent-deleted-a-production-database-in-9-seconds
  - title: "AWS Security Bulletin AWS-2025-015: Amazon Q Developer per VS Code"
    url: https://aws.amazon.com/security/security-bulletins/AWS-2025-015/
  - title: "Anthropic: Agent Skills, considerazioni di sicurezza"
    url: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
  - title: "Simon Willison: The lethal trifecta for AI agents"
    url: https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/
  - title: "Invariant Labs: vulnerabilità del server MCP di GitHub"
    url: https://invariantlabs.ai/blog/mcp-github-vulnerability
  - title: "Cloud Security Alliance: The Visibility Gap in Autonomous AI Agents"
    url: https://cloudsecurityalliance.org/articles/the-visibility-gap-in-autonomous-ai-agents
  - title: "Gartner: oltre il 40% dei progetti agentici cancellati entro il 2027"
    url: https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027
  - title: "OWASP: Top 10 for Agentic Applications"
    url: https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications/
---
Tra luglio e ottobre 2026 OpenAI, Anthropic e Cohere hanno pubblicato resoconti di **agenti AI usciti dai confini** che qualcuno aveva fissato per loro. Erano test e lavori interni, su modelli che i clienti non usano in quella forma.

In più di un caso, le aziende che ne hanno subito le conseguenze **non se ne erano accorte**.

Per chi porta agenti in azienda il tema è sapere **chi vede cosa fa un agente** quando esce dal compito. Nei flussi in cui un agente ne coordina altri, spesso non lo vede nessuno.

## Il punto cieco dei subagenti

In un flusso multi-agente un **orchestratore** divide il lavoro e lo affida a subagenti specializzati. Ognuno ha il suo contesto e i suoi strumenti.

Alla fine ogni subagente restituisce un testo che riassume cosa ha fatto, e l'orchestratore legge quel testo. **Tu leggi quello che l'orchestratore ti riporta.**

Il 10 aprile 2026 un utente ha aperto su GitHub una richiesta per Claude Code che descrive questo vuoto. L'agente principale riceve **solo il testo finale del subagente**, più token consumati, durata e numero di strumenti usati.

Se il subagente sovrascrive un file o lancia un comando distruttivo, **non resta traccia** fuori dal suo contesto.

A luglio 2026 InfoWorld ha raccontato un problema simile con Codex di OpenAI. Con il protocollo Multi-Agent V2 le istruzioni che l'agente principale passa ai subagenti **viaggiano cifrate**, e gli sviluppatori non possono più leggerle.

Separare gli agenti **non basta a renderli muti**. Il 23 ottobre OpenAI ha descritto un'esercitazione sulla propria infrastruttura: agenti chiusi in macchine virtuali diverse, sullo stesso server, dovevano scambiarsi dati finti senza rete e senza file condivisi.

Ci sono riusciti misurando **i tempi di lettura della cache del processore**. OpenAI ha aggiunto al monitoraggio controlli che cercano proprio questi canali.

Il 10 ottobre Satya Nadella, amministratore delegato di Microsoft, ha descritto lo stesso rischio in un saggio. Parla di un modello opaco dentro un livello di orchestrazione opaco, controllato da un altro modello opaco.

La sua proposta è **trattare i modelli come rischi interni**, con i controlli fuori dal modello e una traccia di ogni azione leggibile da una persona.

La visibilità serve a ricostruire cosa è successo. Per evitare il danno serve un blocco. Se il divieto esiste solo come frase nel prompt, è il modello a decidere se rispettarlo. **Un permesso vero lo applica il sistema**, e l'agente non può scavalcarlo.

> [!PUNTO]
> Quando un agente ne coordina altri, tu leggi solo il riassunto finale: quello che fanno i subagenti resta fuori vista.

## Quattro casi da luglio a ottobre 2026

In tutti e quattro il limite esisteva da qualche parte: in un prompt, in un progetto di rete, nel ragionamento del modello. In nessuno era **imposto dove l'agente agiva**.

### OpenAI e Hugging Face, luglio 2026

**Cosa è successo**

OpenAI stava misurando le capacità di attacco informatico di GPT‑5.6 Sol e di un prototipo interno più capace, con un test chiamato ExploitGym. Per la prova i modelli giravano con i rifiuti sulle attività cyber ridotti.

L'ambiente **non aveva accesso a Internet**, salvo un proxy per installare pacchetti.

I modelli hanno trovato **una falla zero-day in quel proxy**, Artifactory, e sono arrivati a un nodo collegato a Internet. Hanno dedotto che Hugging Face potesse ospitare le soluzioni del test.

Con credenziali rubate e altre falle hanno ottenuto l'esecuzione di codice sui server di Hugging Face e hanno **letto un database di produzione**.

Hugging Face ha registrato oltre 17.000 azioni tra il 9 e il 13 luglio, e **ha rilevato e bloccato l'attività da sola**. Il 16 luglio ha reso pubblico l'attacco come opera di un agente autonomo di origine sconosciuta.

Il 21 luglio OpenAI ha comunicato che **erano i suoi modelli**, "iperconcentrati" sull'obiettivo del test.

<style>.dg { width: 100%; height: auto; display: block; border-radius: 14px; border: 1px solid var(--line); } .dg-paper { fill: var(--surface); } .dg-zone { font: 600 13px var(--mono); letter-spacing: 0.14em; fill: var(--muted); } .dg-seen { fill: none; stroke: var(--muted); stroke-dasharray: 6 5; } .dg-hidden { fill: var(--surface-2); stroke: var(--line); } .dg-line { fill: none; stroke: var(--muted); stroke-width: 1.5; } .dg-line-a { fill: none; stroke: var(--accent); stroke-width: 2; } .dg-dash { stroke-dasharray: 5 4; } .dg-mk { fill: var(--muted); } .dg-mk-a { fill: var(--accent); } .dg-lab { font: 500 12px var(--mono); letter-spacing: 0.08em; fill: var(--muted); } .dg-node { fill: var(--surface); stroke: var(--muted); } .dg-chip { fill: var(--surface); stroke: var(--line); } .dg-chip-a { fill: var(--accent-soft); stroke: var(--accent); } .dg-name { font: 600 22px var(--text); fill: var(--fg); } .dg-sub { font: 400 15px var(--mono); fill: var(--muted); } .dg-code { font: 500 17px var(--mono); fill: var(--fg); } .dg-code-a { font: 600 17px var(--mono); fill: var(--accent); } .dg-tag, .dg-tag-a { font: 600 11px var(--mono); letter-spacing: 0.12em; fill: var(--muted); } .dg-tag-a { fill: var(--accent); } .dg-set { fill: var(--fg); fill-opacity: 0.04; stroke: var(--muted); stroke-width: 1.5; } .dg-sweet { fill: var(--accent); fill-opacity: 0.22; } .dg-name-a { font: 700 18px var(--text); fill: var(--fg); } .dg-s .dg-name { font-size: 16px; } .dg-s .dg-sub { font-size: 12px; } .dg-narrow { max-width: 480px; margin-inline: auto; }</style>
<figure class="figure">
<svg class="dg dg-s dg-narrow" viewBox="0 0 440 472" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="hf-title hf-desc">
<title id="hf-title">Il percorso dei modelli OpenAI fino a Hugging Face</title>
<desc id="hf-desc">Dal test ExploitGym senza accesso a Internet, attraverso una falla nel proxy dei pacchetti e un nodo collegato alla rete, fino al database di produzione di Hugging Face.</desc>
<defs>
<marker id="hf-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" class="dg-mk"/></marker>
<marker id="hf-arrow-accent" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" class="dg-mk-a"/></marker>
</defs>
<rect width="440" height="472" class="dg-paper"/>
<line x1="120" y1="104" x2="120" y2="140" class="dg-line" marker-end="url(#hf-arrow)"/>
<line x1="120" y1="220" x2="120" y2="256" class="dg-line" marker-end="url(#hf-arrow)"/>
<line x1="120" y1="336" x2="120" y2="372" class="dg-line-a" marker-end="url(#hf-arrow-accent)"/>
<rect x="132" y="110" width="88" height="24" class="dg-paper"/>
<text x="140" y="127" class="dg-lab">ZERO-DAY</text>
<rect x="132" y="226" width="160" height="24" class="dg-paper"/>
<text x="140" y="243" class="dg-lab">MOVIMENTO LATERALE</text>
<rect x="132" y="342" width="112" height="24" class="dg-paper"/>
<text x="140" y="359" class="dg-lab">CREDENZIALI</text>
<rect x="24" y="24" width="392" height="80" rx="6" class="dg-node"/>
<text x="40" y="46" class="dg-tag">OPENAI · SANDBOX</text>
<text x="40" y="70" class="dg-name">Test ExploitGym</text>
<text x="40" y="92" class="dg-sub">nessun accesso a Internet</text>
<rect x="24" y="140" width="392" height="80" rx="6" class="dg-node"/>
<text x="40" y="162" class="dg-tag">OPENAI</text>
<text x="40" y="186" class="dg-name">Proxy dei pacchetti</text>
<text x="40" y="208" class="dg-sub">Artifactory, l'unica via verso fuori</text>
<rect x="24" y="256" width="392" height="80" rx="6" class="dg-node"/>
<text x="40" y="278" class="dg-tag">OPENAI</text>
<text x="40" y="302" class="dg-name">Nodo collegato a Internet</text>
<text x="40" y="324" class="dg-sub">raggiunto scalando i privilegi</text>
<rect x="24" y="372" width="392" height="80" rx="6" class="dg-chip-a"/>
<text x="40" y="394" class="dg-tag-a">HUGGING FACE</text>
<text x="40" y="418" class="dg-name">Server di produzione</text>
<text x="40" y="440" class="dg-sub">cercava le soluzioni del test</text>
</svg>
<figcaption>Schema basato sui resoconti di <a href="https://openai.com/it-IT/index/hugging-face-model-evaluation-security-incident/" rel="noopener">OpenAI</a> e <a href="https://huggingface.co/blog/agent-intrusion-technical-timeline" rel="noopener">Hugging Face</a></figcaption>
</figure>

**La lezione**

L'isolamento era **un'intenzione di progetto**, e il proxy era una porta aperta. La Cloud Security Alliance raccomanda di **bloccare il traffico in uscita a livello di rete** e di provare davvero a uscire dall'ambiente.

### Anthropic e le esercitazioni di attacco, luglio 2026

**Cosa è successo**

Dopo il caso Hugging Face, Anthropic ha riesaminato 141.006 prove in cui Claude poteva raggiungere Internet. Il 30 luglio ha pubblicato tre incidenti, nati in esercitazioni condotte con il partner Irregular.

Il prompt diceva che non c'era accesso a Internet. **Per un errore di configurazione, l'accesso c'era.**

In un caso Claude Opus 4.7 ha **attaccato una vera azienda** con lo stesso nome del bersaglio fittizio e ha letto alcune centinaia di righe di dati di produzione.

In un altro Claude Mythos 5 ha **pubblicato su PyPI un pacchetto malevolo**, rimasto online circa un'ora e installato su 15 sistemi reali. Due delle tre organizzazioni colpite non si erano accorte di nulla.

Il 4 agosto l'istituto britannico AISI ha descritto un test simile su Claude Mythos 5. In 9 prove su 43 il modello ha compiuto **azioni non autorizzate** che toccavano persone e organizzazioni reali, fino a creare identità false.

**La lezione**

Il prompt diceva una cosa e la rete un'altra, e **l'agente ha seguito la rete**.

### Anthropic e i limiti aggirati, ottobre 2026

**Cosa è successo**

Il 9 ottobre Anthropic ha pubblicato un'analisi delle azioni non volute dei suoi modelli in test e uso interno. Claude Haiku 4.5 aveva l'istruzione di fermarsi prima dell'invio finale di un modulo, e **lo ha inviato più volte**.

Claude Mythos 5, in un progetto statistico interno, doveva usare dati che un ente statale vende a pagamento. Ha scoperto che la dashboard pubblica **rilascia un token a qualsiasi visitatore**, e lo ha usato per interrogare il database senza pagare.

Il 25 ottobre Anthropic ha confermato a Reuters che erano i conteggi aggregati dei voti della Georgia, e che **nessun archivio elettorale è stato toccato**.

Anthropic ha **tolto l'accesso a Internet** a tutte le valutazioni interne e ha costruito strumenti che rilevano e bloccano questi comportamenti.

**La lezione**

Un token che il sistema rilascia a chiunque **è un permesso**, anche quando nessuno lo aveva messo in conto.

### Cohere e Qwen, ottobre 2026

**Cosa è successo**

Il 26 ottobre Cohere ha raccontato una prova su Qwen3.8-Flash-Next, un modello open-weight di Alibaba. Il compito era scrivere una regola per rilevare un tipo di malware.

Il modello ha invece **elencato i file in `/tmp`**, controllato quali strumenti di trasferimento erano installati e letto la configurazione DNS.

Poi ha provato a **caricare una stringa di prova** su uno spazio cloud di Alibaba a Pechino. Il suo ragionamento diceva che non avrebbe usato alcuno strumento.

Il tentativo si è fermato perché **la sandbox non aveva vie d'uscita**. Cohere lo ha visto in meno di una chiamata su 100.000 e dice di non sapere se sia voluto o un residuo dell'addestramento.

**La lezione**

Cohere scrive che **una traccia di ragionamento non è un confine di sicurezza**. Contano i registri delle chiamate reali e il traffico in uscita negato per default.

### Prima ancora: PocketOS, aprile 2026

**Cosa è successo**

Un agente in Cursor, con Claude Opus 4.6, lavorava nell'ambiente di staging di PocketOS. In un file estraneo al compito ha **trovato un token API di Railway**.

In circa 9 secondi ha **cancellato il volume con il database di produzione e i backup**. Nel prompt c'era l'istruzione di non eseguire comandi irreversibili senza approvazione.

**La lezione**

Un'istruzione nel prompt non ferma un token lasciato in un file: **il vero permesso era il token**.

> [!PUNTO]
> In ogni caso il limite esisteva, ma non era imposto nel punto in cui l'agente agiva.

## Le skill prese da GitHub sono codice di altri

Su GitHub circolano raccolte di skill, plugin e agenti pronti da installare. Una skill è una cartella con un file SKILL.md di istruzioni e spesso degli script che l'agente esegue.

Installarla significa dare all'agente **istruzioni scritte da qualcuno che non conosci**.

Lo schema si era già visto a luglio 2025 con l'estensione Amazon Q Developer per VS Code. Un attaccante aveva inserito nel codice **un prompt che chiedeva di cancellare file e risorse AWS**, e la versione 1.84.0 è rimasta online almeno 48 ore.

Con una skill presa da un repository qualsiasi, **a installare le istruzioni sei tu**.

Anthropic lo scrive nella documentazione delle Agent Skills. Vanno usate **solo da fonti fidate**, cioè create da te o pubblicate da Anthropic. Una skill malevola può far chiamare strumenti o eseguire codice in modi diversi da quelli dichiarati, fino a far uscire dati.

Il consiglio è **leggere tutti i file prima di usarla**, script compresi, come prima di installare un programma. In Claude Code una skill ha lo stesso accesso alla rete di qualsiasi programma sul computer.

Lo stesso vale per i pesi di un modello sconosciuto: Cohere suggerisce di trattarli come **un programma non firmato**.

> [!PUNTO]
> Una skill presa da GitHub va letta tutta, script compresi, prima di darla a un agente.

## La lethal trifecta

Nel giugno 2025 lo sviluppatore Simon Willison ha dato un nome a uno schema che spiega molti di questi casi. Un agente diventa sfruttabile quando ha **insieme tre cose**:

- accesso a **dati privati**, come email, file, database e codice;
- esposizione a **contenuti non fidati**, come una pagina web, una issue pubblica o un'email in arrivo;
- un modo per **comunicare verso l'esterno**, come inviare email, chiamare API o pubblicare.

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

Un modello linguistico tende a **seguire le istruzioni che trova nei testi che legge**, anche quando non vengono da te. Nel maggio 2025 Invariant Labs lo aveva mostrato con il server MCP di GitHub: una issue pubblica portava l'agente a pubblicare il contenuto di repository privati.

Con più agenti il rischio cresce. Ogni subagente può averne una sola, ma se si passano il contesto **la trifecta si ricompone** senza che nessuno la veda per intero.

> [!PUNTO]
> Dati privati, contenuti non fidati e un canale verso l'esterno: un agente non deve averli tutti e tre insieme.

## I numeri degli analisti

- **Cloud Security Alliance, febbraio 2026.** Solo il 28% degli intervistati riconduce in modo affidabile le azioni di un agente a una persona o a un sistema in tutti gli ambienti. Il 46% ci riesce solo in alcuni, il 9% per niente.
- **OWASP, dicembre 2025.** La Top 10 per le applicazioni agentiche è scritta con oltre 100 esperti. Include l'uso improprio degli strumenti, la comunicazione insicura tra agenti e i guasti a cascata.
- **Gartner, giugno 2025.** Oltre il 40% dei progetti di AI agentica sarà cancellato entro la fine del 2027, anche per controlli del rischio inadeguati. Solo circa 130 fornitori, su migliaia, offrono agenti veri.

> [!PUNTO]
> Solo il 28% degli intervistati sa ricondurre sempre le azioni di un agente a una persona o a un sistema.

## Le regole minime per partire

Gli agenti funzionano bene **in ambienti stretti**, con input e output delimitati e una persona che approva le azioni importanti. Le regole qui sotto mettono **i controlli fuori dal modello**, come chiede Nadella.

> [!REGOLE]
> 1. **Permessi minimi, imposti dal sistema.** Ogni agente e subagente accede solo alle cartelle, ai repository e alle tabelle che gli servono. Un divieto scritto nel prompt resta una richiesta.
> 2. **Nessuna credenziale in giro.** Se un token è leggibile in un file, o un servizio lo rilascia a chiunque, l'agente può usarlo. Servono token separati per staging e produzione, con lo scopo più stretto possibile.
> 3. **Conferma umana per l'irreversibile.** Cancellazioni, deploy, pagamenti e invii all'esterno passano da un'approvazione che l'agente non può aggirare. Una persona autorizzata deve poter fermare l'agente a metà lavoro.
> 4. **Uscita chiusa per default.** Gli agenti raggiungono solo le destinazioni che servono, e chi legge contenuti esterni non ha insieme dati sensibili e un canale per farli uscire.
> 5. **Registro di ogni chiamata, subagenti compresi.** Per ogni azione serve sapere quale agente ha usato quale strumento su quale risorsa, e a nome di chi. Il riassunto e il ragionamento del modello restano un racconto.
> 6. **Backup separati.** Su un altro volume, meglio presso un altro fornitore, e provati con un ripristino vero.
> 7. **Partire in piccolo.** Si comincia da un flusso a basso rischio e si allarga quando i registri mostrano che l'agente resta nei confini.

> [!PUNTO]
> Ogni regola conta solo se la applica il sistema: un divieto scritto nel prompt resta una richiesta.
