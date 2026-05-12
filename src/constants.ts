import { Project, Experience, Skill } from './types';

export const PROFILE = {
  name: 'Desirèe Reale',
  title: 'AI & LLM Engineer',
  bio: 'Trasformo processi manuali in sistemi intelligenti. Costruisco agenti LLM autonomi, pipeline RAG e workflow orchestrati che lavorano 24/7 senza intervento umano. Dallo sviluppo Python all\'integrazione di modelli open-source — il mio obiettivo è creare AI che risolvono problemi reali.',
  email: 'desiree.reale@email.com',
  linkedin: 'https://www.linkedin.com/in/desiree-reale-2a92952a6',
  github: 'https://github.com/desireereale',
  location: 'Siracusa → Rovigo, Italy',
};

export const PROJECTS: Project[] = [
  {
    id: 'doc-rag',
    title: 'Classificatore Documenti Intelligente',
    description: 'Pipeline AI che ingerisce documenti grezzi, estrae metadati strutturati tramite LLM e li archivia in database con controllo accessi per ruolo e audit trail granulare — zero intervento manuale.',
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
    problem: 'Centinaia di documenti aziendali che arrivano ogni giorno, classificati a mano, archiviati male, impossibili da trovare. Un lavoro ripetitivo che nessuno dovrebbe fare nel 2025.',
    solution: 'Un sistema end-to-end dove i documenti entrano grezzi ed escono classificati, codificati e archiviati — senza che nessuno tocchi nulla. Un modello AI legge ogni documento, capisce di cosa si tratta, estrae i metadati rilevanti e popola automaticamente un database strutturato. Poi parte un workflow di revisione con interfaccia web dedicata: gli operatori vedono solo i documenti di loro competenza, possono validare o correggere ogni campo, e ogni modifica viene tracciata campo per campo con valore prima e dopo. Zero documenti persi. Zero classificazioni sbagliate che passano inosservate. Storico completo di tutto.',
    whyInteresting: 'Non è un semplice "upload e basta". C\'è un\'architettura multi-layer con controllo accessi per ruolo, pipeline AI con prompt engineering per l\'estrazione strutturata, e un sistema di audit trail granulare. Il tutto orchestrato con automazione no-code/low-code su infrastruttura cloud.'
  },
  {
    id: 'drive-monitor',
    title: 'Monitoring Google Drive Folder',
    description: 'Agente event-driven che monitora cartelle cloud in tempo reale, gestisce flussi di approvazione multi-step direttamente via Telegram con callback stateful, e mantiene un registro automatico di ogni decisione.',
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
    problem: 'Le modifiche sui file aziendali succedono. Il problema è che nessuno se ne accorge in tempo — e quando se ne accorgono, il processo di approvazione è un disastro tra email, telefonate e "me lo mandi su WhatsApp".',
    solution: 'Un agente di sorveglianza sempre attivo che monitora le cartelle cloud in tempo reale. Appena rileva una modifica rilevante, notifica il responsabile direttamente su Telegram con tutti i dettagli del file. Il responsabile può approvare o rifiutare con un tap — e se approva, il bot gli chiede subito la motivazione con una selezione guidata. Il registro si aggiorna automaticamente, l\'audit trail è completo, e non è stato aperto nessun gestionale. L\'intero flusso di approvazione vive dentro una chat.',
    whyInteresting: 'Gestione stateful di conversazioni Telegram con callback multi-step, ottimizzazione dei payload entro i limiti del protocollo, sincronizzazione tra eventi asincroni su Drive e risposte utente in tempo reale. Un sistema che sembra semplice da usare ma ha una logica di orchestrazione tutt\'altro che banale sotto.'
  },
  {
    id: 'invoice-agent',
    title: 'Agente AI per la Fatturazione',
    description: 'Pipeline end-to-end che trasforma dati di fatturato grezzi in report PowerPoint direzionali — normalizzazione multi-sorgente, generazione programmatica con python-pptx e distribuzione automatica. Trigger-based, zero touch.',
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
    problem: 'Ogni mese, ore perse a raccogliere dati da fonti diverse, normalizzarli, copiarli nel template, aggiornare grafici e tabelle, sistemare il layout, mandare il file. Un processo noioso, lento e — inevitabilmente — fonte di errori umani.',
    solution: 'Un agente autonomo che si attiva da solo quando arrivano i nuovi dati. Scarica il file, lo elabora, lo normalizza, lo passa a uno script Python che costruisce il PowerPoint da zero — grafici, tabelle, confronti con l\'anno precedente, layout aziendale incluso. Poi carica il report su Drive e lo invia ai destinatari. Dal caricamento dei dati al report distribuito: pochi minuti, zero intervento umano. Il commerciale apre la mail e trova il cruscotto già pronto. Ogni mese. Sempre.',
    whyInteresting: 'Generazione programmatica di presentazioni complesse con python-pptx, pipeline di normalizzazione dati multi-sorgente, trigger event-driven su cloud storage, e orchestrazione dell\'intero flusso con gestione errori e fallback. Non è "manda una mail automatica" — è una pipeline di produzione dati completa.'
  }
];

export const EXPERIENCES: Experience[] = [
  {
    id: 'exp-ciscra',
    role: 'Artificial Intelligence Engineer',
    company: 'Ciscra S.p.A.',
    period: 'Feb 2026 - Presente',
    description: 'Progetto e costruisco sistemi AI end-to-end: da agenti LLM autonomi a pipeline RAG con retrieval contestuale, passando per workflow orchestrati con n8n e LangFlow. Prompt engineering avanzato per output strutturati, orchestrazione di API e integrazione di modelli open-source (Qwen, Llama, Mistral) in contesti produttivi. Il mio obiettivo? Trasformare processi manuali in sistemi intelligenti che lavorano da soli.',
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
