import { Project, Experience, Skill, Service } from './types';

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

export const SERVICES: Service[] = [
  {
    icon: 'FileText',
    title: 'Automazione documentale',
    description: 'Classificazione, estrazione dati e archiviazione dei documenti in automatico. Meno lavoro manuale e informazioni sempre reperibili.'
  },
  {
    icon: 'LineChart',
    title: 'Pipeline dati e reportistica',
    description: 'Dai dati grezzi al report pronto, senza passaggi manuali: normalizzazione da più sorgenti e generazione programmata.'
  },
  {
    icon: 'Bot',
    title: 'Agenti e assistenti AI',
    description: 'Agenti LLM e sistemi RAG su misura, che rispondono sulla tua base di conoscenza e agiscono con strumenti dedicati.'
  },
  {
    icon: 'Workflow',
    title: 'Integrazione e bonifica',
    description: 'Integrazione dell\'AI nei sistemi che già usi e sostituzione di workflow fragili con codice affidabile.'
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

export const SKILLS: Skill[] = [
  // AI & LLM
  { name: 'Python', icon: 'Code', category: 'core' },
  { name: 'RAG', icon: 'Database', category: 'core' },
  { name: 'LLM Agents', icon: 'Cpu', category: 'core' },
  { name: 'Prompt Engineering', icon: 'MessageSquare', category: 'core' },
  { name: 'Local LLM', icon: 'Brain', category: 'core' },
  // Workflow & Automation
  { name: 'n8n', icon: 'Network', category: 'core' },
  { name: 'LangFlow', icon: 'GitBranch', category: 'core' },
  { name: 'API Integration', icon: 'Plug', category: 'core' },
  // Programming
  { name: 'Java', icon: 'Code', category: 'core' },
  { name: 'JavaScript', icon: 'Code', category: 'core' },
  { name: 'SQL', icon: 'Database', category: 'core' },
  { name: 'MongoDB', icon: 'Database', category: 'core' },
  { name: 'MySQL', icon: 'Database', category: 'tools' },
  { name: 'Spring', icon: 'Box', category: 'tools' },
  // Industrial
  { name: 'SCADA', icon: 'Monitor', category: 'tools' },
  { name: 'PLC', icon: 'Cpu', category: 'tools' },
  { name: 'HMI', icon: 'LayoutTemplate', category: 'tools' },
  // Other
  { name: 'Docker', icon: 'Container', category: 'tools' },
  { name: 'MATLAB', icon: 'BarChart3', category: 'tools' },
  { name: 'C', icon: 'Terminal', category: 'tools' },
];
