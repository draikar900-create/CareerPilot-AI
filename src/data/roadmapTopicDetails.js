// Smart Roadmap Learning System Knowledge Base
// Contains rich educational content, downloadable PDF materials, YouTube masterclasses,
// practice resources, interview questions, and course-specific project recommendations.

export const TOPIC_DOMAINS = {
  DSA: 'DSA',
  DBMS: 'DBMS',
  OS: 'Operating System',
  NETWORKS: 'Computer Networks',
  WEB_DEV: 'Web Development',
  AI_ML: 'AI & Machine Learning',
  PYTHON: 'Python Programming',
  SYSTEM_DESIGN: 'System Design & Architecture',
  CORE_CS: 'Core Computer Science'
};

// Domain-specific project blueprints mapped to user criteria
const RAW_CATALOG = {
  DSA: {
    beginner: [
      {
        title: 'Sorting Visualizer',
        difficulty: 'Beginner',
        duration: '1-2 Weeks',
        tech: ['JavaScript', 'HTML5 Canvas', 'Tailwind CSS'],
        description: 'Interactive graphical representation of Bubble, Merge, Quick, and Insertion Sort with adjustable animation speeds and step counters.',
        architecture: 'Client-Side Canvas Engine -> State Animation Loop -> Metric Analytics',
        learningOutcomes: ['Sorting complexities (O(N log N))', 'Async requestAnimationFrame loops', 'DOM manipulation']
      },
      {
        title: 'Array & Stack Expression Evaluator',
        difficulty: 'Beginner',
        duration: '1 Week',
        tech: ['Python / Java', 'CLI / GUI (Tkinter)'],
        description: 'Infix to Postfix converter and math formula evaluator supporting parenthesis parsing and operator precedence.',
        architecture: 'Tokenizer -> Shunting-yard Stack Parsing -> Evaluation Engine',
        learningOutcomes: ['Stack LIFO semantics', 'Algorithm operator precedence', 'Syntax parsing']
      },
      {
        title: 'Binary Search Tree Explorer',
        difficulty: 'Beginner',
        duration: '1-2 Weeks',
        tech: ['React', 'D3.js', 'Tailwind CSS'],
        description: 'Visual binary search tree constructor demonstrating in-order, pre-order, post-order, and level-order BFS traversals.',
        architecture: 'React Node State -> D3 Tree Hierarchical Layout -> Traversal Highlighter',
        learningOutcomes: ['Tree recursion', 'BST invariants', 'D3 hierarchy layouts']
      }
    ],
    intermediate: [
      {
        title: 'Pathfinding & Maze Visualizer',
        difficulty: 'Intermediate',
        duration: '2-3 Weeks',
        tech: ['React', 'TypeScript', 'Tailwind CSS'],
        description: '2D grid visualization of Dijkstra\'s algorithm, A* heuristic search, and recursive division maze generation with draggable start/end nodes.',
        architecture: 'Grid Matrix State -> Priority Queue / Heuristic Engine -> Canvas Render Node',
        learningOutcomes: ['Graph shortest-path algorithms', 'A* Manhattan/Euclidean heuristics', 'State immutability']
      },
      {
        title: 'Competitive Programming Tracker',
        difficulty: 'Intermediate',
        duration: '3 Weeks',
        tech: ['React', 'Node.js', 'Express', 'Codeforces/LeetCode APIs'],
        description: 'Personal contest dashboard tracking rating progression, heatmaps, problem tags, and automated daily problem recommendations.',
        architecture: 'React Query Dashboard -> Express API Cache -> Public Judge REST APIs -> SQLite',
        learningOutcomes: ['API rate-limiting', 'Telemetry visualization', 'Algorithmic taxonomy']
      },
      {
        title: 'Inverted Index Text Search Engine',
        difficulty: 'Intermediate',
        duration: '2-3 Weeks',
        tech: ['Python', 'FastAPI', 'Trie / Hash Maps'],
        description: 'Miniature Google search indexing 10,000+ Wikipedia articles using Tries, TF-IDF relevance scoring, and stopword filtering.',
        architecture: 'File Crawler -> Tokenizer & Stemmer -> Inverted Index Trie -> Query Ranker',
        learningOutcomes: ['Trie data structures', 'Information retrieval math', 'Hash table indexing']
      }
    ],
    advanced: [
      {
        title: 'Distributed Key-Value Store with Consistent Hashing',
        difficulty: 'Advanced',
        duration: '4-6 Weeks',
        tech: ['Go / Java', 'Raft Consensus', 'gRPC', 'Docker'],
        description: 'Fault-tolerant distributed store utilizing consistent hashing rings, virtual nodes, replication factors, and leader election.',
        architecture: 'Client Gateway -> Consistent Hashing Ring -> Replicated Raft Log -> Memory Engine',
        learningOutcomes: ['CAP theorem trade-offs', 'Consistent hashing ring arithmetic', 'Consensus protocols']
      },
      {
        title: 'Real-Time CRDT Collaborative Code Studio',
        difficulty: 'Advanced',
        duration: '4-5 Weeks',
        tech: ['React', 'Node.js', 'Yjs CRDT', 'WebSockets', 'Docker'],
        description: 'Multiplayer browser coding IDE supporting conflict-free replicated data types, remote cursor tracking, and secure sandbox code execution.',
        architecture: 'Monaco Editor -> Yjs Document State -> WebSocket Broadcast Server -> Dockerized Sandbox',
        learningOutcomes: ['CRDT state synchronization', 'Operational transformation', 'Isolated container sandboxing']
      }
    ]
  },
  DBMS: {
    beginner: [
      {
        title: 'Library Management System',
        difficulty: 'Beginner',
        duration: '1-2 Weeks',
        tech: ['Python / Java', 'SQLite / MySQL', 'Tailwind CSS'],
        description: 'Relational database application tracking book catalogs, student borrowings, overdue fines, and ISBN lookups.',
        architecture: 'Frontend Form -> Express / Flask Controller -> Relational SQL Database (3NF Schemas)',
        learningOutcomes: ['Primary/Foreign key relationships', 'CRUD operations', 'Schema normalization']
      },
      {
        title: 'Student Grade & Attendance Tracker',
        difficulty: 'Beginner',
        duration: '1-2 Weeks',
        tech: ['Node.js', 'PostgreSQL', 'EJS / HTML'],
        description: 'Academic records system calculating semester GPAs, tracking lecture attendance, and generating printable student report cards.',
        architecture: 'Express REST Server -> PostgreSQL Pool -> SQL JOIN Aggregations',
        learningOutcomes: ['Aggregate functions (AVG, SUM, COUNT)', 'GROUP BY queries', 'Foreign key cascades']
      }
    ],
    intermediate: [
      {
        title: 'Hospital Management System',
        difficulty: 'Intermediate',
        duration: '3 Weeks',
        tech: ['React', 'Node.js', 'PostgreSQL', 'Prisma ORM'],
        description: 'Comprehensive medical facility software managing doctor shifts, patient electronic health records (EHR), and bed reservations with ACID transactions.',
        architecture: 'React Dashboard -> Express Router -> Prisma ORM -> PostgreSQL with Isolation Locks',
        learningOutcomes: ['ACID transaction boundaries', 'Row-level locking', 'Complex multi-table JOINs']
      },
      {
        title: 'Appointment Booking & Scheduling System',
        difficulty: 'Intermediate',
        duration: '2-3 Weeks',
        tech: ['Next.js', 'PostgreSQL', 'Redis Cache', 'Tailwind CSS'],
        description: 'Real-time slot reservation system preventing double-booking race conditions using database optimistic locking and Redis locks.',
        architecture: 'Next.js App Router -> Redis Distributed Lock -> Postgres Stored Procedures',
        learningOutcomes: ['Concurrency control', 'Optimistic vs pessimistic locking', 'Database indexes']
      }
    ],
    advanced: [
      {
        title: 'Custom B-Tree Storage Engine & SQL Query Parser',
        difficulty: 'Advanced',
        duration: '5-6 Weeks',
        tech: ['C++ / Rust', 'Memory Paging', 'Abstract Syntax Trees'],
        description: 'Build a relational database engine from scratch featuring on-disk B+ Tree indexing, Write-Ahead Logging (WAL), and a lexer/parser for SELECT/INSERT queries.',
        architecture: 'Lexer & Parser -> Query Planner -> Buffer Pool Manager -> Disk Paged B+ Tree Storage',
        learningOutcomes: ['B+ Tree split & merge algorithms', 'Buffer pool cache replacement', 'WAL crash recovery']
      },
      {
        title: 'Multi-Tenant Database Sharding & Partitioning Engine',
        difficulty: 'Advanced',
        duration: '4-5 Weeks',
        tech: ['Node.js / Go', 'PostgreSQL Clusters', 'Docker', 'HAProxy'],
        description: 'Horizontal database partitioning layer routing tenant queries to distributed PostgreSQL shards with cross-shard aggregation support.',
        architecture: 'Tenant Proxy -> Hash Sharding Router -> Master/Replica Postgres Nodes -> Read Replicas',
        learningOutcomes: ['Horizontal sharding keys', 'Read/write replication lag', 'Connection pooling']
      }
    ]
  },
  OS: {
    beginner: [
      {
        title: 'CLI Process Monitor & Task Manager',
        difficulty: 'Beginner',
        duration: '1 Week',
        tech: ['Python / C', 'Linux /proc filesystem', 'Curses'],
        description: 'Terminal-based top/htop clone reading system metrics, active PIDs, CPU utilization percentage, and memory resident set size.',
        architecture: 'Linux /proc Parser -> Refresh Interval Loop -> Terminal Curses Renderer',
        learningOutcomes: ['Linux /proc virtual filesystem', 'PID lifecycles', 'User vs Kernel time']
      },
      {
        title: 'Multi-Threaded Prime Number Calculator',
        difficulty: 'Beginner',
        duration: '1-2 Weeks',
        tech: ['Java / C++', 'POSIX Threads / Thread Pool'],
        description: 'Benchmark program dividing large number search spaces across CPU cores using thread pools and measuring compute speedups.',
        architecture: 'Worker Thread Pool -> Chunk Divider -> Mutex Accumulator -> Benchmark Logger',
        learningOutcomes: ['Amdahl\'s Law', 'Thread pool sizing', 'Race condition prevention']
      }
    ],
    intermediate: [
      {
        title: 'CPU Scheduling Algorithm Simulator',
        difficulty: 'Intermediate',
        duration: '2-3 Weeks',
        tech: ['React', 'Chart.js', 'Tailwind CSS'],
        description: 'Interactive visual benchmark comparing FCFS, SJF (Preemptive/Non-preemptive), Round Robin (variable quantum), and Priority Scheduling with live Gantt charts.',
        architecture: 'Process Queue Engine -> Time-Slice Simulator -> Interactive Gantt Chart Renderer',
        learningOutcomes: ['Turnaround vs Waiting time', 'Context switching overhead', 'Convoy effect']
      },
      {
        title: 'Virtual Memory & Page Replacement Simulator',
        difficulty: 'Intermediate',
        duration: '2-3 Weeks',
        tech: ['React', 'TypeScript', 'Tailwind CSS'],
        description: 'Visual demonstration of FIFO, LRU, LFU, and Optimal page replacement algorithms tracking page hits, faults, and TLB cache lines.',
        architecture: 'Reference String Generator -> Memory Frame Buffer -> Page Fault Counter -> Visualizer',
        learningOutcomes: ['Belady\'s Anomaly', 'LRU double-linked list with hash map', 'Page fault cost']
      }
    ],
    advanced: [
      {
        title: 'Unix-Compliant Custom Shell with Pipes & Redirection',
        difficulty: 'Advanced',
        duration: '4 Weeks',
        tech: ['C / C++', 'POSIX System Calls (fork, execvp, waitpid, dup2)'],
        description: 'A robust command-line shell supporting arbitrary command chaining with pipes (|), I/O redirection (<, >, >>), background jobs (&), and custom signals (SIGINT).',
        architecture: 'Command Tokenizer -> Abstract Syntax Tree -> Pipe/Fork Process Multiplexer -> Signal Handler',
        learningOutcomes: ['Process forking and memory copy-on-write', 'File descriptor table manipulation', 'Signal traps']
      },
      {
        title: 'User-Space Thread Scheduler & Memory Allocator',
        difficulty: 'Advanced',
        duration: '5 Weeks',
        tech: ['C / Assembly', 'Setjmp/Longjmp', 'Memory Management'],
        description: 'Implement a custom `malloc` and `free` using segregated free lists and buddy allocation, paired with a cooperative green-thread fibers scheduler.',
        architecture: 'Heap Arena Pool -> Segregated Free List -> Context Switching Engine -> Fiber Dispatcher',
        learningOutcomes: ['Memory fragmentation & alignment', 'Stack pointer preservation', 'Cooperative multitasking']
      }
    ]
  },
  NETWORKS: {
    beginner: [
      {
        title: 'Socket-Based Real-Time Chat Room',
        difficulty: 'Beginner',
        duration: '1-2 Weeks',
        tech: ['Python / Node.js', 'TCP Sockets / WebSockets'],
        description: 'Client-server messaging application supporting multiple chat rooms, user nicknames, and private direct messages.',
        architecture: 'TCP Server Loop -> Client Connection Registry -> Broadcast Socket Dispatcher',
        learningOutcomes: ['TCP handshakes', 'Socket connections', 'Concurrency per connection']
      },
      {
        title: 'HTTP Client & Custom Web Scraper',
        difficulty: 'Beginner',
        duration: '1-2 Weeks',
        tech: ['Python', 'Raw TCP Sockets / Requests', 'BeautifulSoup'],
        description: 'Send raw HTTP/1.1 GET/POST byte streams over TCP, parse response status codes and headers, and extract webpage data.',
        architecture: 'Raw TCP Socket -> HTTP Protocol Parser -> DOM Parser -> Clean JSON Data',
        learningOutcomes: ['HTTP protocol specification', 'Header parsing', 'DNS resolution basics']
      }
    ],
    intermediate: [
      {
        title: 'Multi-Threaded File Transfer System (FTP Clone)',
        difficulty: 'Intermediate',
        duration: '2-3 Weeks',
        tech: ['Java / Python', 'TCP Sockets', 'SHA-256 Checksums'],
        description: 'High-speed binary file transfer protocol featuring chunked streaming, transfer progress bars, auto-resume on disconnect, and SHA-256 integrity verification.',
        architecture: 'Chunked File Streamer -> TCP Byte Buffer -> Parallel Worker Threads -> Checksum Verifier',
        learningOutcomes: ['TCP sliding window utilization', 'Packet loss handling', 'Cryptographic file hashing']
      },
      {
        title: 'Packet Sniffer & Network Protocol Analyzer',
        difficulty: 'Intermediate',
        duration: '3 Weeks',
        tech: ['Python', 'Scapy / Raw Sockets', 'PyQt / Web GUI'],
        description: 'Wireshark-style network telemetry tool inspecting raw Ethernet frames, IP packet headers, TCP flags (SYN, ACK, FIN), and DNS lookup queries.',
        architecture: 'Promiscuous Raw Socket -> Protocol Demuxer -> Packet Dissector -> Real-Time Flow UI',
        learningOutcomes: ['OSI 7-layer architecture', 'TCP 3-way handshake dissection', 'IP subnetting & routing']
      }
    ],
    advanced: [
      {
        title: 'High-Performance Reverse Proxy & Load Balancer',
        difficulty: 'Advanced',
        duration: '4-5 Weeks',
        tech: ['Go / Rust', 'epoll / kqueue', 'Round-Robin / Least-Connections'],
        description: 'Asynchronous reverse proxy handling 10,000+ concurrent connections, implementing health checks, circuit breakers, rate limiting, and SSL termination.',
        architecture: 'Event-Driven Socket Listener -> Health-Check Monitor -> Balancing Pool -> Backend Proxies',
        learningOutcomes: ['Non-blocking I/O multiplexing (epoll)', 'Circuit breaker patterns', 'HTTP keep-alive reuse']
      },
      {
        title: 'Peer-to-Peer Distributed BitTorrent Protocol Client',
        difficulty: 'Advanced',
        duration: '5 Weeks',
        tech: ['Python / Go', 'Bencode Parser', 'UDP Trackers', 'Bitfield Protocols'],
        description: 'Full BitTorrent client capable of downloading real files from peers, parsing `.torrent` metainfo, querying UDP trackers, and verifying SHA-1 piece hashes.',
        architecture: 'Torrent Metainfo Parser -> Tracker Client -> Peer Wire Protocol Worker Pool -> File Assembler',
        learningOutcomes: ['Distributed hash tables (DHT)', 'P2P network topologies', 'Binary protocol serialization']
      }
    ]
  },
  WEB_DEV: {
    beginner: [
      {
        title: 'Developer Portfolio & Showcase Website',
        difficulty: 'Beginner',
        duration: '1 Week',
        tech: ['HTML5', 'Tailwind CSS', 'JavaScript', 'GitHub Pages'],
        description: 'Blazing fast, responsive developer portfolio featuring dark/light mode, dynamic project cards, interactive contact forms, and resume download.',
        architecture: 'Semantic HTML5 Structure -> Tailwind Modern Utilities -> Vanilla JS Micro-interactions',
        learningOutcomes: ['Responsive CSS grid & flexbox', 'SEO meta tags', 'Accessible web standards']
      },
      {
        title: 'College Event Registration Landing Page',
        difficulty: 'Beginner',
        duration: '1-2 Weeks',
        tech: ['React', 'Tailwind CSS', 'LocalStorage'],
        description: 'Modern campus hackathon portal with countdown timers, speaker schedules, ticket booking forms, and dynamic schedule filters.',
        architecture: 'React Component Hierarchy -> Form State Hooks -> LocalStorage Persistence',
        learningOutcomes: ['React props & state', 'Tailwind animations', 'Mobile-first layout']
      },
      {
        title: 'Personal Finance & Expense Tracker',
        difficulty: 'Beginner',
        duration: '1-2 Weeks',
        tech: ['JavaScript', 'HTML5', 'Chart.js', 'Tailwind CSS'],
        description: 'Income and expense tracker categorizing monthly transactions, displaying pie chart breakdowns, and exporting CSV transaction summaries.',
        architecture: 'Transaction State Engine -> Chart.js Reactive Canvas -> Local Storage Sync',
        learningOutcomes: ['Array reduction math', 'Chart.js integrations', 'Client-side data export']
      }
    ],
    intermediate: [
      {
        title: 'Full-Stack E-Commerce Platform',
        difficulty: 'Intermediate',
        duration: '3-4 Weeks',
        tech: ['React', 'Node.js', 'Express', 'MongoDB / PostgreSQL', 'Stripe'],
        description: 'Complete online marketplace with product catalog search, shopping cart state management, user authentication, and Stripe test checkout integration.',
        architecture: 'React SPA -> JWT Authenticated Express API -> MongoDB Product Catalog -> Stripe Webhook',
        learningOutcomes: ['JWT authentication flow', 'Global state with Zustand/Context', 'Payment gateway webhooks']
      },
      {
        title: 'Resume Screening & ATS Calibration Portal',
        difficulty: 'Intermediate',
        duration: '3 Weeks',
        tech: ['React', 'Python FastAPI / Node.js', 'PDF Parser', 'Tailwind CSS'],
        description: 'Upload PDF resumes, parse text sections, calculate keyword match scores against job descriptions, and highlight missing technical competencies.',
        architecture: 'React Drag-and-Drop -> FastAPI PDF Ingestion -> Keyword Tokenizer -> Match Score Gauge',
        learningOutcomes: ['PDF binary text extraction', 'Cosine similarity scoring', 'Drag-and-drop file uploads']
      },
      {
        title: 'University Career & Placement Portal',
        difficulty: 'Intermediate',
        duration: '3 Weeks',
        tech: ['Next.js 14', 'PostgreSQL', 'Tailwind CSS', 'NextAuth'],
        description: 'Campus hiring hub allowing companies to post job listings, students to track application status, and administrators to review placement statistics.',
        architecture: 'Next.js App Router -> Server Actions -> PostgreSQL Database -> Role-Based Middleware',
        learningOutcomes: ['Next.js Server Components', 'Role-based access control (RBAC)', 'Server-side data fetching']
      }
    ],
    advanced: [
      {
        title: 'CareerPilot AI – Intelligent Career Acceleration Ecosystem',
        difficulty: 'Advanced',
        duration: '5-6 Weeks',
        tech: ['React 19', 'Vite', 'Tailwind CSS', 'Vercel AI SDK', 'PostgreSQL'],
        description: 'Next-generation intelligent career navigation platform featuring semester learning roadmaps, ATS calibration, interactive AI chat mentor, and predictive readiness analytics.',
        architecture: 'Vite React Shell -> Modular Context Layer -> Recharts Analytics -> AI Inference Pipeline',
        learningOutcomes: ['Full enterprise React architecture', 'Dynamic readiness calibration formulas', 'Zero-runtime glassmorphism UI']
      },
      {
        title: 'Real-Time Multiplayer Collaborative Whiteboard',
        difficulty: 'Advanced',
        duration: '4-5 Weeks',
        tech: ['React', 'Canvas API', 'WebSockets', 'Redis', 'Node.js'],
        description: 'Figma-style infinite collaborative canvas supporting multi-user freehand drawing, shape tools, live presence avatars, and undo/redo history trees.',
        architecture: 'HTML5 Canvas -> Matrix Transform Coordinates -> WebSocket Pub/Sub -> Redis Session State',
        learningOutcomes: ['Canvas coordinate math & zooming', 'WebSocket message batching', 'Undo/redo command pattern']
      }
    ]
  },
  AI_ML: {
    beginner: [
      {
        title: 'Student Performance & GPA Predictor',
        difficulty: 'Beginner',
        duration: '1-2 Weeks',
        tech: ['Python', 'Pandas', 'Scikit-Learn', 'Streamlit'],
        description: 'Predict university exam scores and graduation GPAs based on study hours, attendance rate, and previous semester marks using Linear Regression.',
        architecture: 'Data CSV Cleaning -> Scikit-Learn Regression Model -> Streamlit Web Dashboard',
        learningOutcomes: ['Train/test dataset splitting', 'R² score & Mean Squared Error', 'Exploratory data analysis']
      },
      {
        title: 'Spam Email & SMS Classifier',
        difficulty: 'Beginner',
        duration: '1-2 Weeks',
        tech: ['Python', 'Scikit-Learn', 'TF-IDF Vectorizer', 'Flask'],
        description: 'Natural language text classification model identifying fraudulent SMS messages and phishing emails with 98% accuracy using Naive Bayes.',
        architecture: 'Text Tokenizer & Stopwords -> TF-IDF Matrix -> Multinomial Naive Bayes -> REST API',
        learningOutcomes: ['NLP text vectorization', 'Precision/Recall/F1-score', 'Model serialization with Joblib']
      }
    ],
    intermediate: [
      {
        title: 'Plant Disease Detection & Crop Health Classifier',
        difficulty: 'Intermediate',
        duration: '3 Weeks',
        tech: ['Python', 'PyTorch / TensorFlow', 'MobileNetV2 CNN', 'FastAPI'],
        description: 'Computer vision model analyzing leaf photos to diagnose 38 distinct agricultural plant diseases with severity confidence percentages.',
        architecture: 'Image Preprocessing -> Fine-Tuned CNN Feature Extractor -> FastAPI Image Ingestion -> Web App',
        learningOutcomes: ['Convolutional neural networks', 'Data augmentation pipelines', 'Transfer learning weights']
      },
      {
        title: 'Facial Recognition Attendance System',
        difficulty: 'Intermediate',
        duration: '3 Weeks',
        tech: ['Python', 'OpenCV', 'Face Recognition (dlib)', 'SQLite'],
        description: 'Automated campus attendance tracking using live webcam feeds, extracting 128D facial embeddings and registering timestamps in a database.',
        architecture: 'Webcam Video Stream -> Haar Cascade Face Detector -> Dlib 128D Embeddings -> SQLite Logger',
        learningOutcomes: ['Euclidean distance matching', 'OpenCV video stream processing', 'Real-time face detection']
      },
      {
        title: 'AI Resume Screening & Competency Matcher',
        difficulty: 'Intermediate',
        duration: '3 Weeks',
        tech: ['Python', 'Sentence-Transformers', 'FastAPI', 'React'],
        description: 'Extract semantic embeddings from resumes and job postings to compute cosine similarity scores, identifying missing technical skills and experience gaps.',
        architecture: 'PDF Extractor -> BERT Sentence-Transformers -> Vector Cosine Math -> Visual Gap Report',
        learningOutcomes: ['Semantic vector embeddings', 'Cosine similarity search', 'Domain-specific entity extraction']
      }
    ],
    advanced: [
      {
        title: 'Autonomous RAG Whitepaper Research Assistant',
        difficulty: 'Advanced',
        duration: '5-6 Weeks',
        tech: ['Python', 'LangChain', 'ChromaDB / Pinecone', 'FastAPI', 'React'],
        description: 'Retrieval-Augmented Generation agent indexing thousands of arXiv scientific papers, performing hybrid BM25 + dense vector search, and generating cited answers with source links.',
        architecture: 'Document Chunker -> OpenAI Embeddings -> Chroma Vector Store -> LangGraph Agent with ReAct loop',
        learningOutcomes: ['Chunking strategies & recursive splitters', 'RAG retrieval evaluation (RAGAS)', 'Agentic workflow loops']
      },
      {
        title: 'Fine-Tuned Domain LLM with LoRA & QLoRA',
        difficulty: 'Advanced',
        duration: '4-5 Weeks',
        tech: ['Python', 'Hugging Face Transformers', 'PEFT', 'PyTorch', 'vLLM'],
        description: 'Fine-tune an open-source 7B parameter LLM (Llama 3 / Mistral) on technical code review and interview rubrics using 4-bit Quantized Low-Rank Adaptation.',
        architecture: 'Instruction Dataset Pipeline -> 4-bit QLoRA Quantization -> Loss Curve Tracking -> vLLM Inference',
        learningOutcomes: ['Parameter-Efficient Fine-Tuning (PEFT)', 'GPU memory management (CUDA)', 'Inference optimization']
      }
    ]
  }
};

export const DOMAIN_PROJECT_CATALOG = {
  ...RAW_CATALOG,
  [TOPIC_DOMAINS.DSA]: RAW_CATALOG.DSA,
  [TOPIC_DOMAINS.DBMS]: RAW_CATALOG.DBMS,
  [TOPIC_DOMAINS.OS]: RAW_CATALOG.OS,
  [TOPIC_DOMAINS.NETWORKS]: RAW_CATALOG.NETWORKS,
  [TOPIC_DOMAINS.WEB_DEV]: RAW_CATALOG.WEB_DEV,
  [TOPIC_DOMAINS.AI_ML]: RAW_CATALOG.AI_ML,
  [TOPIC_DOMAINS.PYTHON]: RAW_CATALOG.WEB_DEV,
  [TOPIC_DOMAINS.CORE_CS]: RAW_CATALOG.DSA,
  'Operating System': RAW_CATALOG.OS,
  'Computer Networks': RAW_CATALOG.NETWORKS,
  'Web Development': RAW_CATALOG.WEB_DEV,
  'AI & Machine Learning': RAW_CATALOG.AI_ML
};

// Helper to determine the domain of any roadmap topic
export function detectTopicDomain(title = '') {
  const lower = title.toLowerCase();

  // 1. AI / ML / Deep Learning / Data Science (tested before generic networks to prevent "neural networks" collision)
  if (lower.includes('machine learning') || lower.includes('neural') || lower.includes('ai') || lower.includes('deep learning') || lower.includes('pytorch') || lower.includes('llm') || lower.includes('rag') || lower.includes('transformer') || lower.includes('model') || lower.includes('vision') || lower.includes('pandas') || lower.includes('calculus')) {
    return TOPIC_DOMAINS.AI_ML;
  }
  // 2. Data Structures & Algorithms
  if (lower.includes('data structure') || lower.includes('algorithm') || lower.includes('tree') || lower.includes('graph') || lower.includes('dynamic programming') || lower.includes('binary search') || lower.includes('linked list') || lower.includes('heap') || lower.includes('array') || lower.includes('sort') || lower.includes('bit')) {
    return TOPIC_DOMAINS.DSA;
  }
  // 3. Relational Databases & DBMS
  if (lower.includes('database') || lower.includes('sql') || lower.includes('dbms') || lower.includes('postgres') || lower.includes('mongo') || lower.includes('schema') || lower.includes('index')) {
    return TOPIC_DOMAINS.DBMS;
  }
  // 4. Operating Systems
  if (lower.includes('operating system') || lower.includes('cpu') || lower.includes('thread') || lower.includes('concurrency') || lower.includes('memory') || lower.includes('process') || lower.includes('linux') || lower.includes('scheduling')) {
    return TOPIC_DOMAINS.OS;
  }
  // 5. Computer Networks (explicitly exclude neural network)
  if ((lower.includes('network') && !lower.includes('neural')) || lower.includes('socket') || lower.includes('tcp') || lower.includes('protocol') || lower.includes('ip') || lower.includes('http') || lower.includes('dns')) {
    return TOPIC_DOMAINS.NETWORKS;
  }
  // 6. Web Development & Full-Stack
  if (lower.includes('react') || lower.includes('web') || lower.includes('javascript') || lower.includes('html') || lower.includes('css') || lower.includes('frontend') || lower.includes('node') || lower.includes('next.js') || lower.includes('backend') || lower.includes('full stack') || lower.includes('tailwind')) {
    return TOPIC_DOMAINS.WEB_DEV;
  }
  if (lower.includes('python')) {
    return TOPIC_DOMAINS.PYTHON;
  }
  return TOPIC_DOMAINS.CORE_CS;
}

// Generates complete smart learning data for any roadmap topic
export function getTopicLearningDetails(topic, currentRole, profile) {
  const domain = detectTopicDomain(topic?.title || '');
  const title = topic?.title || 'Core Engineering Topic';
  const roleTitle = currentRole?.title || 'Software Engineer';
  const branch = profile?.branch || 'Computer Science & Engineering';
  const semester = profile?.currentSemester || 2;

  // 1. Overview and Core Structure
  const overview = generateTopicOverview(title, domain, roleTitle);

  // 2. Downloadable & Openable PDF Study Materials
  const pdfNotes = generateTopicPdfNotes(title, domain);

  // 3. YouTube Masterclasses (Beginner, Intermediate, Advanced)
  const youtubeTutorials = generateTopicYoutubeTutorials(title, domain);

  // 4. Practice Resources & Coding Challenges
  const practiceResources = generateTopicPracticeResources(title, domain);

  // 5. Course-Specific Project Recommendations (Beginner, Intermediate, Advanced)
  const projects = getTopicProjectRecommendations(title, domain, branch, semester, roleTitle);

  return {
    id: topic?.id || 't-generic',
    title,
    hours: topic?.hours || 20,
    domain,
    branch,
    semester,
    targetRole: roleTitle,
    overview,
    pdfNotes,
    youtubeTutorials,
    practiceResources,
    projects
  };
}

// Generate topic overview structure
function generateTopicOverview(title, domain, roleTitle) {
  return {
    explanation: `This foundational masterclass in **${title}** equips you with the essential architectural patterns, practical code implementations, and problem-solving mental models demanded by high-performing tech organizations hiring for **${roleTitle}** positions.`,
    whatYouWillLearn: [
      `Deconstruct core theoretical foundations of ${title} and implement robust working code.`,
      `Analyze asymptotic time and space complexities across typical and worst-case scenarios.`,
      `Identify anti-patterns, edge cases, and memory inefficiencies in enterprise environments.`,
      `Architect production-grade capstone projects utilizing industry standards.`
    ],
    prerequisites: [
      'Basic programming fluency in Python, JavaScript, Java, or C++',
      'Understanding of conditional statements, loops, and modular functions',
      'Fundamental command line and Git source control literacy'
    ],
    importantConcepts: [
      {
        concept: `${title} Architecture & Core Invariants`,
        description: `Mastering the data flow, memory representations, and fundamental algorithms that govern ${title}.`,
        codeSnippet: `// Example: Clean Idiomatic Implementation\nfunction solveCorePattern(inputData) {\n  if (!inputData || inputData.length === 0) return null;\n  // Optimal processing loop with boundary validation\n  const lookup = new Map();\n  for (let i = 0; i < inputData.length; i++) {\n    lookup.set(inputData[i].id, inputData[i]);\n  }\n  return lookup;\n}`
      },
      {
        concept: `Optimization Strategies & Complexity Bounds`,
        description: `Transitioning naive O(N²) or unbounded memory designs to deterministic O(N) or O(N log N) throughput.`,
        codeSnippet: `# Python Optimal Fast-Slow Pointer / Vectorization Pattern\ndef optimal_processor(stream):\n    left, right = 0, len(stream) - 1\n    while left < right:\n        mid = (left + right) // 2\n        # Exploit sorted structural properties\n        if stream[mid] meets_invariant:\n            right = mid\n        else:\n            left = mid + 1\n    return left`
      }
    ],
    practiceQuestions: [
      {
        id: 'pq-1',
        title: `Implement an optimal solution for ${title}`,
        difficulty: 'Medium',
        platform: 'LeetCode / NeetCode',
        hint: 'Examine whether sorting, two pointers, or a hash map provides constant-time lookup.',
        answer: 'Construct an auxiliary hash map or frequency array to achieve O(N) time complexity instead of nested loops.'
      },
      {
        id: 'pq-2',
        title: `Handle stream boundary conditions in ${title}`,
        difficulty: 'Hard',
        platform: 'Codeforces / System Prep',
        hint: 'Consider empty inputs, negative values, and integer overflow constraints.',
        answer: 'Apply strict validation guards at the entry boundary before dispatching to the core execution loop.'
      }
    ],
    interviewQuestions: [
      {
        question: `How would you explain the fundamental trade-offs of ${title} to a senior technical interviewer?`,
        answer: `Start by framing the problem constraints: quantify the read vs write ratio, memory footprint, and network latency. Then explain how choosing this particular abstraction guarantees predictable performance under burst load.`
      },
      {
        question: `What failure modes occur if this implementation is scaled to 1,000,000 requests per second?`,
        answer: `Single-machine memory bounds will be exhausted, causing garbage collection spikes. The remedy is horizontal partitioning, caching hot keys with Redis, and employing asynchronous message queues.`
      }
    ],
    commonMistakes: [
      `Neglecting edge cases such as null/undefined values, single-element collections, or concurrent writes.`,
      `Over-engineering early with premature optimization before measuring actual bottleneck profiles.`,
      `Failing to clean up allocated socket handles, database connection pools, or animation timers.`
    ],
    realWorldApplications: [
      `Powers low-latency transaction routing and live portfolio metrics in modern FinTech gateways.`,
      `Acts as the backbone for high-throughput distributed message processing at Netflix, Google, and Amazon AWS.`,
      `Underpins modern intelligent recommendation systems, search ranking engines, and real-time collaboration suites.`
    ]
  };
}

// Generate PDF Notes
function generateTopicPdfNotes(title, domain) {
  const basePdfs = [
    {
      id: 'pdf-1',
      title: `${title} Comprehensive Hand-Written Notes PDF`,
      author: 'CareerPilot Senior Engineering Faculty',
      pages: '28 Pages',
      size: '3.4 MB',
      description: `Complete illustrated visual guide containing cheat sheets, memory layout diagrams, syntax summaries, and algorithmic execution traces for ${title}.`,
      previewTopics: ['Core Definitions & Axioms', 'Step-by-Step Code Walkthroughs', 'Complexity Comparison Matrix', 'Exam & Interview Quick Reference'],
      contentSummary: `This curated master document provides an exhaustive single-page cheat sheet followed by in-depth code patterns, memory allocation diagrams, and high-yield interview review questions. Perfect for quick revision before university semester exams and campus placement interviews.`
    },
    {
      id: 'pdf-2',
      title: `${domain} Industry Standards & Best Practices PDF`,
      author: 'FAANG Engineering Architecture Guild',
      pages: '19 Pages',
      size: '2.1 MB',
      description: `Production engineering whitepaper outlining real-world architectural design, anti-patterns to avoid, and performance profiling guidelines.`,
      previewTopics: ['Enterprise Architecture Blueprint', 'Benchmarking Methodologies', 'Fault Tolerance & Resilience', 'Production Security Checklist'],
      contentSummary: `Developed by senior tech leads, this guide dives into enterprise deployments, distributed system considerations, memory leak investigations, and latency SLA enforcement.`
    },
    {
      id: 'pdf-3',
      title: `${title} 50 High-Frequency Interview Questions & Answers PDF`,
      author: 'Top Tech Placement Cell',
      pages: '35 Pages',
      size: '4.2 MB',
      description: `Targeted collection of the 50 most frequently tested technical coding and system architecture questions with clean model solutions.`,
      previewTopics: ['Screening Round Traps', 'Live Coding Whiteboard Answers', 'Behavioral Alignment Rubrics', 'Salary Negotiation Framework'],
      contentSummary: `Contains verbatim interview questions asked at Google, Microsoft, Amazon, and leading high-growth startups, coupled with STAR-formatted explanations and trade-off comparisons.`
    }
  ];

  return basePdfs;
}

// Generate YouTube Masterclasses
function generateTopicYoutubeTutorials(title, domain) {
  return [
    {
      id: 'yt-1',
      level: 'Beginner',
      title: `${title} Complete Beginner Crash Course (Zero to Hero)`,
      channel: domain === TOPIC_DOMAINS.DSA ? 'Striver (Take U Forward)' : domain === TOPIC_DOMAINS.OS ? 'Abdul Bari' : 'CodeWithHarry',
      duration: '1h 45m',
      views: '1.4M Views',
      rating: 4.9,
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=640&auto=format&fit=crop&q=80',
      description: `Comprehensive beginner-friendly foundations covering core intuition, visual explanations, and coding your first working application from scratch.`,
      url: 'https://youtube.com'
    },
    {
      id: 'yt-2',
      level: 'Intermediate',
      title: `${title} In-Depth Implementation & Design Patterns`,
      channel: domain === TOPIC_DOMAINS.WEB_DEV ? 'freeCodeCamp.org' : domain === TOPIC_DOMAINS.DBMS ? 'Apna College' : 'Programming with Mosh',
      duration: '2h 15m',
      views: '980K Views',
      rating: 4.95,
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=640&auto=format&fit=crop&q=80',
      description: `Deep dive into intermediate paradigms, object models, performance tuning, and idiomatic production code craftsmanship.`,
      url: 'https://youtube.com'
    },
    {
      id: 'yt-3',
      level: 'Advanced',
      title: `${title} Advanced Masterclass & System Architecture`,
      channel: domain === TOPIC_DOMAINS.AI_ML ? 'Andrej Karpathy' : domain === TOPIC_DOMAINS.DSA ? 'Striver' : 'Abdul Bari',
      duration: '3h 10m',
      views: '650K Views',
      rating: 5.0,
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=640&auto=format&fit=crop&q=80',
      description: `Senior-level exploration covering internal runtime mechanics, concurrent synchronization, distributed edge cases, and Big Tech interview standards.`,
      url: 'https://youtube.com'
    }
  ];
}

// Generate Practice Resources
function generateTopicPracticeResources(title, domain) {
  return [
    {
      id: 'pr-1',
      platform: 'NeetCode 150',
      badge: 'Curated Path',
      problemCount: '150 Questions',
      url: 'https://neetcode.io',
      description: 'Pattern-based coding curriculum covering Two Pointers, Sliding Window, Graphs, and Trees with clean Python/Java/C++ code.'
    },
    {
      id: 'pr-2',
      platform: 'LeetCode Premium',
      badge: 'Company Tagged',
      problemCount: '2,800+ Questions',
      url: 'https://leetcode.com',
      description: 'The industry benchmark platform for mock technical interviews, algorithmic contests, and FAANG company tag lists.'
    },
    {
      id: 'pr-3',
      platform: 'GeeksforGeeks',
      badge: 'Subject Notes & MCQs',
      problemCount: '500+ Articles',
      url: 'https://geeksforgeeks.org',
      description: 'In-depth conceptual articles covering core computer science subjects (OS, DBMS, CN, DSA) with diagrams and university exam questions.'
    },
    {
      id: 'pr-4',
      platform: 'HackerRank Problem Solving',
      badge: 'Skill Certification',
      problemCount: 'Skill Badges',
      url: 'https://hackerrank.com',
      description: 'Verified assessment tests that allow students to earn verifiable skill certificates to link on their resumes and LinkedIn profiles.'
    }
  ];
}

// Generate Project Recommendations
function getTopicProjectRecommendations(title, domain, branch, semester, roleTitle) {
  const catalog = DOMAIN_PROJECT_CATALOG[domain] || DOMAIN_PROJECT_CATALOG.DSA;

  return {
    domain,
    branch,
    semester,
    targetRole: roleTitle,
    beginner: catalog.beginner || [],
    intermediate: catalog.intermediate || [],
    advanced: catalog.advanced || []
  };
}
