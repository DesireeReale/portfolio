---
title: "OpenAI dichiara il 97,9% nella migrazione del COBOL, gli esperti frenano"
description: "Il 19 ottobre OpenAI ha pubblicato test in cui GPT-6.1 Sol traduce programmi COBOL in linguaggi moderni. I docenti sentiti da The Verge ricordano che sostituire un sistema richiede molto di più."
date: 2026-10-27
category: intelligenza-artificiale
forBusiness: true
perTe:
  - "Nei test di OpenAI GPT-6.1 Sol migra il 97,9% dei programmi COBOL quando ragiona più a lungo."
  - "Il COBOL è nato nel 1959 e regge ancora il 95% delle transazioni ai bancomat, secondo i dati IBM citati da OpenAI."
  - "Per i docenti sentiti da The Verge la parte difficile è capire il vecchio sistema e dividerlo in pezzi sostituibili."
perAzienda:
  - "Prima di migrare servono test che facciano girare gli stessi flussi sul vecchio e sul nuovo sistema e ne confrontino i risultati."
  - "Arrotondamenti e gestione dei record mancanti vanno documentati, perché una riscrittura può cambiarli senza dare errori."
  - "Conviene partire da un solo componente con confini chiari, come consiglia anche la guida di Anthropic."
sources:
  - title: "The Verge: Can AI help solve the COBOL code crisis?"
    url: https://www.theverge.com/ai-artificial-intelligence/1018434/cobol-migration-legacy-code-openai-anthropic
  - title: "OpenAI: Progressi nella programmazione con linguaggi a risorse limitate"
    url: https://openai.com/it-IT/index/low-resource-programming-languages/
  - title: "Anthropic: COBOL Modernization with AI"
    url: https://claude.com/blog/how-ai-helps-break-cost-barrier-cobol-modernization
---
## Dove gira ancora il COBOL

Il COBOL è nato nel 1959 e regge ancora molta infrastruttura finanziaria. Secondo i dati IBM citati da OpenAI è alla base di ==oltre il 40% dei sistemi bancari online==. Gestisce l'80% dei pagamenti con carta fatti di persona e il 95% delle operazioni ai bancomat.

Negli Stati Uniti gira anche nei sistemi pubblici, dalla previdenza sociale al fisco. Una stima approssimativa riportata da The Verge mette il costo delle sue inefficienze per il PIL statunitense intorno a ==105 miliardi di dollari l'anno==.

## I test pubblicati da OpenAI il 19 ottobre

OpenAI ha chiesto ai suoi modelli di migrare programmi COBOL verso C++, Java, Kotlin, Python o Rust. Una migrazione conta solo se in test nascosti ==l'output coincide byte per byte== con quello del programma originale.

GPT-6.1 Sol ha superato l'86,6% dei casi con poco ragionamento, contro il 5,4% di GPT-5.6 Sol, a un costo inferiore del 39%. Lasciandolo ragionare più a lungo è arrivato al ==97,9%==.

Il punto delicato è l'aritmetica. Il COBOL scarta le cifre decimali in eccesso se il programma non chiede di arrotondare. Una versione riscritta che arrotonda ==gira senza errori e dà risultati finanziari diversi==.

OpenAI stessa scrive che in produzione servono ancora la revisione di esperti e test sulle regole di business. Ha pubblicato su GitHub i test dell'altra prova, MultiLangBench, ma non quelli della migrazione COBOL. Il portavoce Oscar Haines ha detto a The Verge che il codice legacy è ancora ==lontano dall'essere un problema risolto==.

## La guida di Anthropic e il crollo di IBM

Il 23 febbraio Anthropic aveva proposto Claude Code per portare il COBOL verso Java o Python, con una guida passo per passo. Non ha pubblicato misure dei risultati e ha scritto che ==l'economia della modernizzazione del COBOL è cambiata==.

Le azioni di IBM, che guadagna anche aiutando le aziende a mantenere i sistemi legacy, sono crollate dopo l'annuncio.

## Cosa rispondono i docenti sentiti da The Verge

Vadim Zaytsev, dell'Università di Twente, ricorda che ==riscrivere il codice non equivale a sostituire un sistema==. Il più grande che ha visto aveva 250 milioni di righe di COBOL. Oltre al codice ci sono dati in formati diversi e integrazioni con altri sistemi.

Arie van Deursen, della Delft University of Technology, ha definito "superficiale" il resoconto di OpenAI. Secondo lui i test lasciano fuori la parte difficile: ==spezzare un sistema in unità da sostituire una alla volta==.

Per Alastair Donaldson, dell'Imperial College di Londra, il primo ostacolo è capire come funziona il sistema, perché pochi sanno ancora programmare in COBOL. Propone di far girare gli stessi flussi sul vecchio e sul nuovo sistema e di ==confrontare i risultati==.

Jacopo Mauro, dell'Università della Danimarca Meridionale, indica la verifica formale, che controlla il codice con metodi matematici. Applicarla al codice legacy richiederebbe però ==un'enorme quantità di lavoro==, e fino ad allora serve la verifica umana.

> [!ATTENZIONE] L'1% che resta
> Zaytsev fa il conto: se uno strumento gestisce il 99% del codice, l'1% rimasto può valere un milione di righe sparse in tutto il sistema.
