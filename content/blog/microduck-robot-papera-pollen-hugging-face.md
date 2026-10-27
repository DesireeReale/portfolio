---
title: "Microduck, la papera robot di Hugging Face che impara a camminare in simulazione"
description: "Pollen Robotics, il team robotica di Hugging Face, vende in preordine a 399 dollari un bipede di 25 cm. Il software è aperto: si possono riaddestrare i movimenti sul proprio computer e caricarli sul robot."
date: 2026-10-27
category: app-e-strumenti
image: /blog/microduck-robot-papera-pollen-hugging-face/cover.jpg
imageCredit: "Pollen Robotics, press kit di Microduck"
imageCreditUrl: https://pollen-robotics.com/microduck/press-kit/
perTe:
  - "Microduck costa 399 dollari in preordine, tasse e spedizione escluse, con le prime consegne previste prima di Natale 2026."
  - "Arriva montato e si usa subito con il controller: cammina, si siede, calcia una palla, raccoglie oggetti col becco e si rialza da solo."
  - "Il software è open source con licenza Apache 2.0, l'hardware no: non è un robot da stampare in 3D e costruire da soli."
  - "Per addestrare movimenti nuovi serve una scheda video NVIDIA, oppure si usano i server di Hugging Face Jobs."
sources:
  - title: "Pollen Robotics: Meet Microduck"
    url: https://pollen-robotics.com/microduck/blog/introducing-microduck/
    note: "l'annuncio ufficiale"
  - title: "Pollen Robotics: pagina di Microduck"
    url: https://pollen-robotics.com/microduck
    note: "prezzo e preordine"
  - title: "Pollen Robotics: press kit e scheda tecnica di Microduck"
    url: https://pollen-robotics.com/microduck/press-kit/
    note: "scheda tecnica e immagini ufficiali"
  - title: "GitHub, pollen-robotics/microduck"
    url: https://github.com/pollen-robotics/microduck
    note: "il software del robot"
  - title: "GitHub, pollen-robotics/microduck_rl"
    url: https://github.com/pollen-robotics/microduck_rl
    note: "il codice per addestrare i movimenti"
  - title: "GitHub, microduck: FAQ"
    url: https://github.com/pollen-robotics/microduck/blob/main/docs/faq.md
    note: "le domande frequenti del progetto"
  - title: "Hugging Face Spaces: simulatore di Microduck"
    url: https://huggingface.co/spaces/pollen-robotics/microduck-simulator
    note: "il simulatore da provare nel browser"
---
Il 27 agosto 2026 Pollen Robotics ha aperto i preordini di Microduck, un ==robot bipede alto 25 centimetri== con la forma di una papera. Pollen è il team di robotica di Hugging Face, con sede a Bordeaux, ed è entrato nell'azienda nell'aprile 2025.

Il robot costa ==399 dollari==, prezzo di lancio senza tasse e spedizione. Le prime consegne sono previste prima di Natale 2026 in Nord America, Europa e Regno Unito.

Il codice che fa muovere il robot è su GitHub dal 29 luglio. A fine ottobre il repository `microduck` ha circa ==12.600 stelle==.

## Cosa c'è dentro

Microduck è largo 14 centimetri e pesa meno di 800 grammi. Ha ==15 motori== tra gambe, collo e testa, e un becco articolato che afferra piccoli oggetti.

Il computer di bordo è una scheda Radxa Zero 3 con processore Rockchip RK3566, un piccolo acceleratore per l'AI, 1 GB di RAM e 32 GB di memoria. Si collega in Wi-Fi e Bluetooth.

Per orientarsi ha una telecamera frontale, due sensori di movimento (uno nel corpo e uno nella testa) e un sensore di profondità a 8×8 punti. Quando la telecamera è accesa si accende una spia, come il REC delle vecchie videocamere.

Non parla. Emette ==versi suoi==: ogni robot genera la propria voce alla prima accensione e la tiene per sempre.

La batteria è quella delle videocamere, una NP-F550 da 2.600 mAh che si toglie e si cambia. Pollen indica ==circa un'ora di autonomia==, a seconda dell'uso.

> [!ATTENZIONE]
> Pollen scrive nel press kit che alcuni dati non sono definitivi: risoluzione della telecamera, portata del sensore di profondità, versioni delle radio e un'eventuale età consigliata.

## Cosa fa appena acceso

Nella scatola ci sono robot, batteria, cavo USB-C e un controller da videogioco. Si usa ==senza scrivere codice==.

Escono di fabbrica sette movimenti addestrati. Cammina guidato dal controller, si siede e si rialza, calcia una palla, abbassa il becco a terra per prendere un oggetto e si rimette in piedi se cade. Con le rotelle sotto i piedi ==va sui pattini==.

Pollen dice che può anche seguire il puntino di un laser e reagire a quello che ha intorno.

<figure class="figure"><img src="/blog/microduck-robot-papera-pollen-hugging-face/calcio.jpg" alt="Tre Microduck di colori diversi su un campo da gioco, accanto a una palla"><figcaption>Immagine: <a href="https://pollen-robotics.com/microduck/press-kit/" rel="noopener">Pollen Robotics, press kit di Microduck</a></figcaption></figure>

Oltre al robot ci sono tre pacchetti a parte:

- **Charger pack, 39 dollari:** caricatore doppio e due batterie.
- **Accessory pack, 39 dollari:** puntatore laser, due rotelle, una palla e dieci tag NFC.
- **Dev pack, 119 dollari:** tre motori di ricambio, cavi, batterie, caricatore, cacciavite, viti e credito su Hugging Face.

## Come impara a camminare

Microduck non segue movimenti programmati a mano. Ogni comportamento è una ==rete neurale== addestrata con l'apprendimento per rinforzo: il robot virtuale prova, cade, riceve un punteggio e a forza di tentativi trova il modo di stare in piedi.

L'addestramento avviene nel simulatore fisico MuJoCo, con l'algoritmo PPO. Il codice è in un secondo repository, `microduck_rl`.

Il passaggio difficile è ==dalla simulazione al robot vero==, che i ricercatori chiamano sim2real. Nel README Pollen scrive che a questa scala la differenza sta soprattutto nei motori: servomotori piccoli che muovono un corpo di 800 grammi.

Per questo il simulatore riproduce i servomotori Dynamixel XL330 nei dettagli, fino all'attrito e al calo di tensione della batteria sotto sforzo. Esistono anche versioni degli esercizi con ==un grado di gioco negli ingranaggi==, come capita sui motori reali.

Durante l'addestramento migliaia di copie del robot girano in parallelo con condizioni leggermente diverse. Il README indica ==1-2 ore== per ottenere un'andatura utilizzabile con 4.096 copie su una scheda video NVIDIA.

<style>.dg { width: 100%; height: auto; display: block; border-radius: 14px; border: 1px solid var(--line); } .dg-paper { fill: var(--surface); } .dg-line { fill: none; stroke: var(--muted); stroke-width: 1.5; } .dg-mk { fill: var(--muted); } .dg-lab { font: 500 12px var(--mono); letter-spacing: 0.08em; fill: var(--muted); } .dg-node { fill: var(--surface); stroke: var(--muted); } .dg-chip-a { fill: var(--accent-soft); stroke: var(--accent); } .dg-name { font: 600 16px var(--text); fill: var(--fg); } .dg-sub { font: 400 12px var(--mono); fill: var(--muted); } .dg-tag, .dg-tag-a { font: 600 11px var(--mono); letter-spacing: 0.12em; fill: var(--muted); } .dg-tag-a { fill: var(--accent); } .dg-narrow { max-width: 480px; margin-inline: auto; }</style>
<figure class="figure">
<svg class="dg dg-narrow" viewBox="0 0 440 472" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="md-title md-desc">
<title id="md-title">Dal simulatore al robot</title>
<desc id="md-desc">Un movimento si addestra in MuJoCo, si esporta in un file ONNX, si pubblica su Hugging Face e si installa sul robot, che lo esegue 50 volte al secondo.</desc>
<defs>
<marker id="md-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" class="dg-mk"/></marker>
</defs>
<rect width="440" height="472" class="dg-paper"/>
<line x1="120" y1="104" x2="120" y2="140" class="dg-line" marker-end="url(#md-arrow)"/>
<line x1="120" y1="220" x2="120" y2="256" class="dg-line" marker-end="url(#md-arrow)"/>
<line x1="120" y1="336" x2="120" y2="372" class="dg-line" marker-end="url(#md-arrow)"/>
<rect x="132" y="110" width="80" height="24" class="dg-paper"/>
<text x="140" y="127" class="dg-lab">EXPORT</text>
<rect x="132" y="226" width="96" height="24" class="dg-paper"/>
<text x="140" y="243" class="dg-lab">PUBLISH</text>
<rect x="132" y="342" width="200" height="24" class="dg-paper"/>
<text x="140" y="359" class="dg-lab">ROBOTCTL POLICY ADD</text>
<rect x="24" y="24" width="392" height="80" rx="6" class="dg-node"/>
<text x="40" y="46" class="dg-tag">MICRODUCK_RL · TUO PC O HF JOBS</text>
<text x="40" y="70" class="dg-name">Addestramento in MuJoCo</text>
<text x="40" y="92" class="dg-sub">PPO, migliaia di copie in parallelo</text>
<rect x="24" y="140" width="392" height="80" rx="6" class="dg-node"/>
<text x="40" y="162" class="dg-tag">FILE</text>
<text x="40" y="186" class="dg-name">Rete neurale in formato ONNX</text>
<text x="40" y="208" class="dg-sub">un file per ogni movimento</text>
<rect x="24" y="256" width="392" height="80" rx="6" class="dg-node"/>
<text x="40" y="278" class="dg-tag">HUGGING FACE HUB</text>
<text x="40" y="302" class="dg-name">Movimento condiviso</text>
<text x="40" y="324" class="dg-sub">repository privato, se non scegli altro</text>
<rect x="24" y="372" width="392" height="80" rx="6" class="dg-chip-a"/>
<text x="40" y="394" class="dg-tag-a">MICRODUCK · ROBOTD</text>
<text x="40" y="418" class="dg-name">Il robot esegue il movimento</text>
<text x="40" y="440" class="dg-sub">50 volte al secondo, a bordo</text>
</svg>
<figcaption>Schema basato sui README di <a href="https://github.com/pollen-robotics/microduck_rl" rel="noopener">microduck_rl</a> e <a href="https://github.com/pollen-robotics/microduck" rel="noopener">microduck</a></figcaption>
</figure>

Alla fine la rete viene salvata in un file ONNX e caricata sul robot. A bordo un programma la esegue ==50 volte al secondo== e manda i comandi ai motori.

Tutti i movimenti leggono gli stessi 61 valori dai sensori e comandano gli stessi 14 motori di gambe, collo e testa. Così il robot può ==passare da un movimento all'altro== in qualsiasi momento, per esempio dalla camminata al rialzarsi dopo una caduta.

> [!PUNTO]
> Ogni movimento è un file che si addestra in simulazione e si sostituisce sul robot, senza cambiare il resto del software.

## Cosa serve per insegnargli qualcosa di nuovo

Per addestrare in locale serve un computer con ==una scheda video NVIDIA==, perché il simulatore gira su CUDA. Chi non ce l'ha può aggiungere `--hf-jobs` al comando e far girare l'addestramento sui server di Hugging Face Jobs.

Per provare senza robot c'è un ==simulatore nel browser== su Hugging Face Spaces. Lo script `duck-sim` del repository fa girare il vero software del robot contro un corpo simulato.

Un movimento nuovo si pubblica sull'Hub di Hugging Face con un comando, `publish`. Prima di caricarlo il programma controlla che la rete abbia il formato giusto e che non restituisca valori non validi o sempre uguali. Il repository resta ==privato, se non scegli altro==.

Chi ha un Microduck lo installa con `robotctl policy add` e lo lancia dal robot. Pollen vuole che i movimenti si condividano ==come oggi si condividono i modelli== sull'Hub.

Per modelli troppo pesanti per la scheda di bordo, la FAQ indica di farli girare altrove: un Space di Hugging Face riceve il video della telecamera e manda indietro i comandi. Se il collegamento passa da un relay, il piano gratuito ha ==10 GB al mese== e un video a 720p ne consuma circa uno all'ora.

## Il software è aperto, l'hardware no

Il repository `microduck` è il cervello del robot. È scritto in Rust e contiene il ciclo di controllo dei motori, la gestione di radio e telecamera, il collegamento con il controller e gli aggiornamenti.

Gli aggiornamenti sono ==firmati e reversibili==: se dopo l'installazione il robot non si avvia bene, il sistema torna alla versione precedente.

Codice e strumenti di addestramento hanno licenza ==Apache 2.0==, che permette anche l'uso commerciale. I modelli 3D del robot usati nel simulatore hanno invece una licenza Creative Commons non commerciale.

Il press kit chiede in modo esplicito di non chiamarlo hardware open source: ==i progetti meccanici ed elettronici non sono pubblici==. Microduck si compra montato, non si stampa in 3D a casa.

## Perché una papera piccola

Pollen ha già venduto oltre 10.000 Reachy Mini, un robot da scrivania pensato per parlare e interagire. Microduck parte dall'altro lato: ==muoversi nel mondo==.

Le dimensioni contano. Su un umanoide grande un tentativo sbagliato può rompere qualcosa o essere pericoloso. Qui di solito finisce con ==una papera per terra==, che si rialza da sola.

Il 23 ottobre Pollen ha pubblicato due articoli tecnici. Il robot calcola dove si trova contando i passi e usando i sensori di movimento, con un errore di ==pochi centimetri per metro==. Con il sensore di profondità costruisce una mappa della stanza, tutto a bordo.

> [!PUNTO] In sintesi
> - Microduck è un bipede di 25 cm a 399 dollari, in preordine, con consegne previste prima di Natale 2026.
> - Si usa subito con il controller; per insegnargli movimenti nuovi servono una scheda video NVIDIA o Hugging Face Jobs.
> - Ogni movimento è una rete neurale addestrata in MuJoCo, che si pubblica e si installa come un modello.
> - Il software è aperto con licenza Apache 2.0, i progetti dell'hardware no.
