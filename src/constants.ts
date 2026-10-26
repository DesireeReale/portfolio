import { Project, Experience, SkillGroup } from './types';

export const PROFILE = {
  name: 'Desirèe Reale',
  title: 'AI & LLM Engineer',
  bio: 'Costruisco sistemi AI che automatizzano processi aziendali: agenti LLM, pipeline RAG e workflow che girano in autonomia. Lavoro in Python e integro modelli open-source in contesti di produzione.',
  email: 'desysir@yahoo.it',
  linkedin: 'https://www.linkedin.com/in/desiree-reale-2a92952a6',
  github: 'https://github.com/desireereale',
  location: 'Siracusa → Rovigo, Italy',
};

export const PROJECTS: Project[] = [
  {
    id: 'doc-rag',
    title: 'Classificatore Documenti Intelligente',
    description: 'Sistema di classificazione documentale basato su AI. Estrazione automatica dei metadati, validazione umana con accessi per ruolo e tracciamento completo delle modifiche.',
    image: '/card1.png',
    tags: ['AI Extraction', 'RAG Pipeline', 'Workflow Automation'],
    tech: ['LLM', 'RAG', 'Python', 'PostgreSQL', 'n8n'],
    link: '#',
    features: [
      'Estrazione metadati strutturati',
      'Controllo accessi per ruolo',
      'Audit trail granulare',
      'Workflow zero intervento manuale'
    ],
    problem: 'Ingestione quotidiana di centinaia di documenti eterogenei, con classificazione e indicizzazione manuali. Metadati incoerenti, nessuna normalizzazione e retrieval inefficiente sull\'archivio.',
    solution: 'Una pipeline estrae i metadati da ogni documento con un modello linguistico e popola automaticamente il database. Un\'interfaccia di revisione mostra a ciascun operatore solo i documenti di sua competenza; ogni modifica viene registrata campo per campo, con valore precedente e successivo.',
    whyInteresting: 'Classificazione manuale eliminata. Documenti reperibili e tracciabili, con storico completo di ogni intervento.'
  },
  {
    id: 'drive-monitor',
    title: 'Monitoring Google Drive Folder',
    description: 'Agente event-driven che monitora cartelle cloud in tempo reale e gestisce l\'approvazione delle modifiche via Telegram, con registro automatico di ogni decisione.',
    image: '/card2.png',
    tags: ['Event-Driven', 'Telegram Bot', 'Real-Time Automation'],
    tech: ['n8n', 'Telegram Bot API', 'Google Drive API', 'Python'],
    link: '#',
    features: [
      'Monitoraggio cloud in tempo reale',
      'Approvazione multi-step via Telegram',
      'Callback stateful',
      'Registro automatico decisioni'
    ],
    problem: 'Nessun meccanismo di change detection sui file condivisi: le modifiche non generavano eventi e il flusso di approvazione era gestito in modo asincrono e non tracciato, tra email e messaggistica.',
    solution: 'Un agente sorveglia le cartelle cloud e, a ogni modifica rilevante, notifica il responsabile su Telegram con i dettagli del file. L\'approvazione avviene nella chat, con motivazione guidata, e il registro si aggiorna automaticamente.',
    whyInteresting: 'Ogni modifica intercettata in tempo reale e ogni approvazione tracciata, senza aprire alcun gestionale.'
  },
  {
    id: 'invoice-agent',
    title: 'Agente AI per la Fatturazione',
    description: 'Pipeline che trasforma i dati di fatturato grezzi in report PowerPoint direzionali, generati e distribuiti automaticamente a ogni nuovo dato.',
    image: '/card3.png',
    tags: ['Python', 'Data Pipeline', 'Generative Automation'],
    tech: ['Python', 'python-pptx', 'n8n', 'Docker', 'LLM'],
    link: '#',
    features: [
      'Normalizzazione multi-sorgente',
      'Generazione report PowerPoint',
      'Distribuzione automatica',
      'Trigger-based, zero touch'
    ],
    problem: 'Consolidamento manuale di dati da sorgenti multiple con schemi disomogenei, seguito da reportistica compilata a mano nel template PowerPoint: processo non riproducibile e soggetto a errori.',
    solution: 'All\'arrivo dei nuovi dati la pipeline li normalizza e uno script Python genera il PowerPoint da zero: grafici, tabelle, confronti con l\'anno precedente e layout aziendale. Il report viene quindi archiviato e inviato ai destinatari.',
    whyInteresting: 'Dal dato al report distribuito in pochi minuti, senza intervento manuale. Un report puntuale ogni mese, privo di errori di copiatura.'
  },
  {
    id: 'tender-monitor',
    title: 'Monitoraggio Bandi con Categorizzazione AI',
    description: 'Monitoraggio automatico dei bandi di gara con categorizzazione tramite modello linguistico. Servizio containerizzato, esecuzione schedulata giornaliera e integrazione con l\'archivio documentale esistente.',
    image: '/card4.svg',
    tags: ['In Produzione', 'AI Categorization', 'Scheduled Automation'],
    tech: ['Python', 'LLM', 'RAG', 'Docker', 'Scheduler'],
    link: '#',
    features: [
      'Monitoraggio bandi automatico',
      'Categorizzazione AI dei documenti',
      'Esecuzione schedulata giornaliera',
      'Deploy containerizzato in produzione'
    ],
    problem: 'Polling manuale delle fonti dei bandi, senza filtraggio né classificazione automatica: copertura non garantita e latenza elevata nell\'individuare le gare pertinenti.',
    solution: 'Ogni giorno il servizio raccoglie i nuovi bandi, ne fa analizzare categoria e pertinenza a un modello AI e li archivia già ordinati. Gira in un container avviato da uno scheduler e riusa le categorie dell\'archivio documentale aziendale.',
    whyInteresting: 'Presidio dei bandi automatizzato e attivo in produzione, operativo ogni giorno senza intervento.'
  },
  {
    id: 'legacy-rebuild',
    title: 'Ricostruzione di un Registro Dati Critico',
    description: 'Ricostruzione di un registro dati critico, prima gestito da un workflow no-code che produceva oltre metà delle righe errate, riscritto come applicativo Python affidabile e ripetibile.',
    image: '/card5.svg',
    tags: ['Affidabilità', 'Legacy Migration', 'Python'],
    tech: ['Python', 'PostgreSQL', 'Data Validation'],
    link: '#',
    features: [
      'Analisi del sistema legacy esistente',
      'Riscrittura in Python locale',
      'Validazione dei dati campo per campo',
      'Da oltre 50% di righe rotte a elaborazione affidabile'
    ],
    problem: 'Pipeline no-code stratificata e priva di validazione: oltre il 50% dei record prodotti risultava errato o incompleto, senza gestione degli errori né idempotenza, con riconciliazione manuale a ogni esecuzione.',
    solution: 'Analisi dell\'output atteso e riscrittura da zero in Python: logica esplicita, validazione dei dati a ogni passaggio e risultati ripetibili. Nessuna dipendenza da servizi esterni.',
    whyInteresting: 'Da oltre il 50% di righe errate a un\'elaborazione affidabile e verificabile, senza più correzioni manuali.'
  },
  {
    id: 'ai-command-center',
    title: 'Dashboard Progetti + Assistente AI',
    description: 'Dashboard che raccoglie lo stato dei progetti, affiancata da un assistente AI su modello locale e da un server MCP dedicato. Realizzata con la sola libreria standard di Python.',
    image: '/card6.svg',
    tags: ['MCP', 'Local LLM', 'Full-Stack'],
    tech: ['Python', 'MCP', 'Local LLM', 'HTML/JS'],
    link: '#',
    features: [
      'Dashboard live dello stato progetti',
      'Agente AI su modello locale (chat sulla knowledge base)',
      'Server MCP custom per assistenti di coding',
      'Solo standard library, nessuna dipendenza esterna'
    ],
    problem: 'Stato dei progetti frammentato su file e note eterogenee, senza un layer di aggregazione né un\'interfaccia interrogabile a livello di programma.',
    solution: 'Una dashboard aggrega i progetti e il loro stato. Un assistente collegato a un modello locale risponde interrogando la knowledge base, mentre un server MCP dedicato espone gli stessi dati agli strumenti di sviluppo. Tutto in locale, con limitazione delle richieste verso il gateway e senza dipendenze esterne.',
    whyInteresting: 'Stato dei progetti consultabile a colpo d\'occhio e interrogabile in linguaggio naturale, con un sistema avviabile senza alcuna installazione.'
  }
];

export const PERSONAL_PROJECTS: Project[] = [
  {
    id: 'studymap',
    title: 'StudyMap',
    description: 'App web installabile (PWA) per studenti universitari: carichi appunti, PDF o foto e l\'AI genera mappe concettuali, flashcard, quiz e riassunti, con una chat che risponde sul documento.',
    image: '/card9.svg',
    tags: ['In Beta', 'PWA', 'AI per lo studio'],
    tech: ['Next.js', 'TypeScript', 'Supabase', 'LLM', 'Vercel'],
    link: 'https://aistudymap.vercel.app',
    features: [
      'Mappe concettuali modificabili generate dall\'AI',
      'Flashcard con ripetizione dilazionata e quiz',
      'Chat con il documento e riferimenti alle pagine',
      'Trascrizione di PDF scansionati e foto di appunti'
    ],
    problem: 'Preparare un esame vuol dire trasformare a mano dispense, slide e appunti in schemi, domande e ripassi: lavoro lungo che toglie tempo allo studio vero.',
    solution: 'Lo studente carica il materiale e l\'AI, in background, ne ricava mappa, flashcard, quiz e riassunto. Fallback automatico tra modelli, quote e limiti per piano lato server, sicurezza a livello di riga su tutti i dati e test end-to-end.',
    whyInteresting: 'Online in beta: dal documento al materiale di ripasso in pochi minuti, da qualsiasi dispositivo.'
  },
  {
    id: 'summarize-extension',
    title: 'Recap',
    description: 'Estensione Chrome che riassume con un clic la pagina web o il PDF che stai leggendo, usando modelli gratuiti (Gemini, Groq, OpenRouter) o in locale con Ollama.',
    image: '/card7.svg',
    tags: ['Chrome Extension', 'Multi-Provider', 'Privacy'],
    tech: ['JavaScript', 'Manifest V3', 'pdf.js', 'LLM'],
    link: 'https://github.com/desireereale/resume_extension',
    features: [
      'Riassunto di pagine web e PDF',
      'Sei provider, anche gratuiti o in locale',
      'OCR dei PDF scansionati con Gemini Vision',
      'Chiave API salvata solo nel browser',
      'Richiesta nel service worker, sopravvive alla chiusura del popup'
    ],
    problem: 'Articoli lunghi e PDF richiedono tempo per capire se valgono la lettura, e gli strumenti di riassunto spesso sono a pagamento o mandano i dati a servizi terzi.',
    solution: 'L\'estensione estrae il testo della pagina o del PDF e lo invia al modello scelto dall\'utente, con la sua chiave salvata in locale. Supporta provider gratuiti e Ollama per lavorare completamente offline; i PDF scansionati vengono letti con l\'OCR.',
    whyInteresting: 'Un riassunto in un clic, gratis e con il controllo totale su dove finiscono i dati.'
  },
  {
    id: 'github-radar',
    title: 'GitHub Radar',
    description: 'Script che legge i repository di tendenza su GitHub e chiede a un LLM di valutarli in base al mio profilo, con voto, riassunto e idee di progetti da costruirci sopra.',
    image: '/card8.svg',
    tags: ['In Sviluppo', 'LLM Scoring', 'Automazione Personale'],
    tech: ['Python', 'OpenRouter', 'GitHub API'],
    link: '#',
    features: [
      'Lettura dei trending di GitHub',
      'Valutazione personalizzata con un LLM',
      'Idee concrete di progetti per ogni repo',
      'Report Markdown giornaliero, solo libreria standard'
    ],
    problem: 'Ogni giorno su GitHub escono decine di progetti interessanti, ma scorrerli tutti e capire quali valga la pena provare richiede troppo tempo.',
    solution: 'Lo script scarica i trending, legge il README di ogni repository e chiede a un modello economico un JSON con voto, riassunto, difficoltà e idee, calibrato su un profilo di interessi. Il risultato è un report ordinato per voto.',
    whyInteresting: 'Ancora in lavorazione: un radar personale che filtra il rumore e propone solo quello che fa per me.'
  }
];


export const EXPERIENCES: Experience[] = [
  {
    id: 'exp-ciscra',
    role: 'Artificial Intelligence Engineer',
    company: 'Ciscra S.p.A.',
    period: 'Feb 2026 - Presente',
    description: 'Progettazione e sviluppo di sistemi AI in produzione: agenti LLM, pipeline RAG con retrieval contestuale e workflow orchestrati con n8n e LangFlow. Prompt engineering per output strutturati, integrazione di API e di modelli open-source (Qwen, Llama, Mistral).',
    tags: ['LLM Agents', 'RAG', 'Prompt Engineering', 'n8n', 'LangFlow', 'Qwen', 'Llama', 'Mistral']
  },
  {
    id: 'exp-aiem',
    role: 'Ingegnere Informatico',
    company: 'Aiem Automation Srl',
    period: 'Set 2024 - Mar 2026',
    description: 'Automazione industriale e data processing: sviluppo Python per automazione di monitoraggio, estrazione dati e reportistica automatizzata. Querying avanzato su database industriali per analisi temporali e dashboard decisionali. Sviluppo SCADA e progettazione HMI per controllo real-time di impianti. Integrazione sistemi tramite protocolli di comunicazione con PLC e dispositivi IoT di campo.',
    tags: ['Python', 'SCADA', 'Data Processing', 'HMI', 'PLC', 'IoT', 'SQL']
  },
  {
    id: 'exp-academy',
    role: 'Software Engineer Academy – Full Stack Developer',
    company: 'BestEngage / Sistemi Informativi (IBM)',
    period: 'Gen 2024 - Mag 2024',
    description: 'Formazione intensiva in sviluppo full stack: framework Spring, MongoDB, React.js, REST, JDBC, JUnit, JAX-RS.',
    tags: ['Spring', 'MongoDB', 'React.js', 'REST', 'JUnit', 'JAX-RS']
  },
  {
    id: 'exp-degree',
    role: 'Laurea Triennale in Ingegneria Informatica',
    company: 'Università di Catania',
    period: '2018 - 2022',
    description: 'Formazione accademica in ambito ingegneristico con focus su sistemi intelligenti, programmazione, analisi dati e competenze analitiche.',
    tags: ['Ingegneria Informatica', 'Analisi Dati', 'Sistemi Intelligenti']
  }
];

export const SKILL_GROUPS: SkillGroup[] = [
  { title: 'AI & LLM', items: ['Python', 'LLM Agents', 'RAG', 'Prompt Engineering', 'Local LLM', 'MCP'] },
  { title: 'Automazione', items: ['n8n', 'LangFlow', 'API Integration', 'Docker'] },
  { title: 'Sviluppo', items: ['Java', 'Spring', 'JavaScript', 'TypeScript', 'React', 'C', 'MATLAB'] },
  { title: 'Dati', items: ['SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Supabase'] },
  { title: 'Industriale', items: ['SCADA', 'PLC', 'HMI', 'IoT'] },
];
