export const TARGET_ROLES = [
  {
    id: 'ai-engineer',
    title: 'AI Engineer',
    category: 'Artificial Intelligence',
    description: 'Design and deploy state-of-the-art machine learning models, LLMs, neural networks, and scalable AI infrastructure.',
    medianSalary: '$148,000 / yr',
    openPositions: '34,200+ Openings',
    difficulty: 'Advanced',
    icon: 'Cpu',
    color: 'from-purple-500 to-indigo-600',
    requiredSkills: [
      { name: 'Python', priority: 'High', industryImportance: 'Crucial (Core Language)' },
      { name: 'Data Structures', priority: 'High', industryImportance: 'Foundational' },
      { name: 'Machine Learning', priority: 'High', industryImportance: 'High Demand' },
      { name: 'PyTorch', priority: 'High', industryImportance: 'Exploding (+48% YoY)' },
      { name: 'LangChain', priority: 'High', industryImportance: 'Exploding (+120% YoY)' },
      { name: 'NumPy', priority: 'Medium', industryImportance: 'Core Tooling' },
      { name: 'Pandas', priority: 'Medium', industryImportance: 'Data Processing' },
      { name: 'Docker', priority: 'Medium', industryImportance: 'Deployment Standard' },
      { name: 'Git', priority: 'Medium', industryImportance: 'Collaboration' },
      { name: 'Vector Databases', priority: 'High', industryImportance: 'Critical for RAG' }
    ],
    industryBenchmark: {
      'Python & ML': 88,
      'System Architecture': 72,
      'Data Modeling': 82,
      'Cloud & Deployment': 65,
      'Prompt Engineering': 80
    }
  },
  {
    id: 'full-stack-dev',
    title: 'Full Stack Developer',
    category: 'Software Engineering',
    description: 'Build complete, scalable web applications from responsive modern frontends to high-throughput cloud backend services.',
    medianSalary: '$126,000 / yr',
    openPositions: '58,400+ Openings',
    difficulty: 'Intermediate',
    icon: 'Layers',
    color: 'from-blue-500 to-cyan-600',
    requiredSkills: [
      { name: 'HTML', priority: 'High', industryImportance: 'Core Web Standard' },
      { name: 'CSS', priority: 'High', industryImportance: 'Visual Styling' },
      { name: 'JavaScript', priority: 'High', industryImportance: 'Core Language' },
      { name: 'React', priority: 'High', industryImportance: 'Leading UI Library' },
      { name: 'Node.js', priority: 'High', industryImportance: 'Runtime Standard' },
      { name: 'Express.js', priority: 'Medium', industryImportance: 'Backend Framework' },
      { name: 'SQL', priority: 'High', industryImportance: 'Relational Database' },
      { name: 'MongoDB', priority: 'Medium', industryImportance: 'Document Database' },
      { name: 'Git', priority: 'Medium', industryImportance: 'Version Control' },
      { name: 'REST APIs', priority: 'High', industryImportance: 'Client-Server Standard' }
    ],
    industryBenchmark: {
      'Frontend (React/UI)': 90,
      'Backend & APIs': 78,
      'Database Architecture': 74,
      'DevOps & Cloud': 68,
      'Testing & Security': 70
    }
  },
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    category: 'Core Engineering',
    description: 'Master algorithms, data structures, distributed systems, and clean software craftsmanship for high-impact tech companies.',
    medianSalary: '$135,000 / yr',
    openPositions: '62,000+ Openings',
    difficulty: 'Intermediate',
    icon: 'Code2',
    color: 'from-emerald-500 to-teal-600',
    requiredSkills: [
      { name: 'Data Structures', priority: 'High', industryImportance: 'Interview Benchmark' },
      { name: 'Algorithms', priority: 'High', industryImportance: 'Core Problem Solving' },
      { name: 'Java', priority: 'High', industryImportance: 'Enterprise Backbone' },
      { name: 'C++', priority: 'Medium', industryImportance: 'High Performance' },
      { name: 'System Design', priority: 'High', industryImportance: 'Scalability Standard' },
      { name: 'SQL', priority: 'High', industryImportance: 'Data Persistence' },
      { name: 'Object-Oriented Design', priority: 'High', industryImportance: 'Clean Architecture' },
      { name: 'Git', priority: 'Medium', industryImportance: 'Collaboration' },
      { name: 'Linux', priority: 'Medium', industryImportance: 'OS & Server Basics' },
      { name: 'Concurrency', priority: 'High', industryImportance: 'Multi-threaded Systems' }
    ],
    industryBenchmark: {
      'Data Structures & Algos': 85,
      'Object Oriented Design': 82,
      'System Design': 75,
      'Concurrency': 70,
      'Database Performance': 78
    }
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    category: 'Data & Analytics',
    description: 'Transform complex petabyte-scale data into actionable business intelligence using statistical analysis, predictive modeling, and visualization.',
    medianSalary: '$132,000 / yr',
    openPositions: '28,900+ Openings',
    difficulty: 'Advanced',
    icon: 'BarChart3',
    color: 'from-amber-500 to-orange-600',
    requiredSkills: [
      { name: 'Python', priority: 'High', industryImportance: 'Core Language' },
      { name: 'SQL', priority: 'High', industryImportance: 'Data Extraction' },
      { name: 'Pandas', priority: 'High', industryImportance: 'Wrangling & Cleaning' },
      { name: 'Statistics', priority: 'High', industryImportance: 'Inference & Hypotheses' },
      { name: 'Machine Learning', priority: 'High', industryImportance: 'Predictive Modeling' },
      { name: 'Matplotlib', priority: 'Medium', industryImportance: 'Visualization' },
      { name: 'Scikit-Learn', priority: 'High', industryImportance: 'ML Modeling Standard' },
      { name: 'Tableau', priority: 'Medium', industryImportance: 'Business Dashboards' },
      { name: 'Big Data', priority: 'Medium', industryImportance: 'Spark & BigQuery' },
      { name: 'A/B Testing', priority: 'High', industryImportance: 'Product Experimentation' }
    ],
    industryBenchmark: {
      'Statistics & Math': 86,
      'SQL & Data Wrangling': 90,
      'Predictive Modeling': 76,
      'Data Storytelling': 80,
      'Big Data Tools': 64
    }
  },
  {
    id: 'cloud-engineer',
    title: 'Cloud Engineer',
    category: 'DevOps & Infrastructure',
    description: 'Architect resilient, scalable, and secure cloud environments across AWS, Azure, or GCP using modern Infrastructure as Code.',
    medianSalary: '$138,000 / yr',
    openPositions: '41,000+ Openings',
    difficulty: 'Intermediate',
    icon: 'Cloud',
    color: 'from-sky-500 to-indigo-600',
    requiredSkills: [
      { name: 'Linux', priority: 'High', industryImportance: 'Server Administration' },
      { name: 'AWS', priority: 'High', industryImportance: 'Market Leader Cloud' },
      { name: 'Docker', priority: 'High', industryImportance: 'Containerization Standard' },
      { name: 'Kubernetes', priority: 'High', industryImportance: 'Orchestration Standard' },
      { name: 'Terraform', priority: 'High', industryImportance: 'Infrastructure as Code' },
      { name: 'Networking', priority: 'Medium', industryImportance: 'VPC, DNS, Subnets' },
      { name: 'CI/CD', priority: 'High', industryImportance: 'Automated Deployment' },
      { name: 'Python', priority: 'Medium', industryImportance: 'Automation Scripting' },
      { name: 'Git', priority: 'Medium', industryImportance: 'Version Control' },
      { name: 'Security', priority: 'High', industryImportance: 'IAM & Cloud Compliance' }
    ],
    industryBenchmark: {
      'Cloud Architecture': 84,
      'Infrastructure as Code': 80,
      'Container Orchestration': 78,
      'Networking & Security': 82,
      'Site Reliability': 72
    }
  },
  {
    id: 'cybersecurity-analyst',
    title: 'Cybersecurity Analyst',
    category: 'Security & Compliance',
    description: 'Defend organizational networks, systems, and sensitive digital assets from sophisticated cyber threats and unauthorized breaches.',
    medianSalary: '$128,000 / yr',
    openPositions: '31,500+ Openings',
    difficulty: 'Advanced',
    icon: 'ShieldCheck',
    color: 'from-rose-500 to-red-600',
    requiredSkills: [
      { name: 'Networking', priority: 'High', industryImportance: 'TCP/IP & Packet Analysis' },
      { name: 'Linux', priority: 'High', industryImportance: 'OS & Security Tooling' },
      { name: 'SIEM', priority: 'High', industryImportance: 'Threat Monitoring' },
      { name: 'Cryptography', priority: 'High', industryImportance: 'Data Encryption' },
      { name: 'Penetration Testing', priority: 'Medium', industryImportance: 'Vulnerability Assessment' },
      { name: 'Python', priority: 'Medium', industryImportance: 'Security Scripting' },
      { name: 'Incident Response', priority: 'High', industryImportance: 'Forensics & Containment' },
      { name: 'Firewalls', priority: 'Medium', industryImportance: 'Perimeter Defense' },
      { name: 'Identity Management', priority: 'High', industryImportance: 'Zero-Trust Controls' },
      { name: 'Cloud Security', priority: 'High', industryImportance: 'AWS/Azure Posture' }
    ],
    industryBenchmark: {
      'Network Security': 88,
      'Vulnerability Assessment': 82,
      'Incident Response': 76,
      'Cryptography': 74,
      'Compliance & Audit': 80
    }
  }
];

export const ROADMAPS_BY_ROLE = {
  'ai-engineer': [
    {
      semester: 'Phase 1: Mathematics & Python Programming Core',
      estimatedDuration: '8 Weeks',
      status: 'in-progress',
      topics: [
        { id: 'm1', title: 'Multivariable Calculus & Linear Algebra', hours: 25, completed: false },
        { id: 'm2', title: 'Python for Scientific Computing (NumPy, SciPy)', hours: 20, completed: false },
        { id: 'm3', title: 'Data Cleaning & Exploratory Analysis (Pandas)', hours: 18, completed: false }
      ]
    },
    {
      semester: 'Phase 2: Machine Learning Fundamentals',
      estimatedDuration: '10 Weeks',
      status: 'upcoming',
      topics: [
        { id: 'm4', title: 'Supervised Learning (Regression, Classification, SVMs)', hours: 24, completed: false },
        { id: 'm5', title: 'Unsupervised Learning (Clustering, PCA, t-SNE)', hours: 16, completed: false },
        { id: 'm6', title: 'Evaluation Metrics (ROC-AUC, Precision/Recall, Cross-Val)', hours: 14, completed: false }
      ]
    },
    {
      semester: 'Phase 3: Deep Learning & Neural Networks',
      estimatedDuration: '12 Weeks',
      status: 'upcoming',
      topics: [
        { id: 'm7', title: 'PyTorch Tensors, Autograd & Architecture Construction', hours: 30, completed: false },
        { id: 'm8', title: 'Convolutional Neural Networks for Computer Vision', hours: 26, completed: false },
        { id: 'm9', title: 'Transformers, Self-Attention & LLM Foundations', hours: 32, completed: false }
      ]
    },
    {
      semester: 'Phase 4: Generative AI, RAG & MLOps Deployment',
      estimatedDuration: '10 Weeks',
      status: 'upcoming',
      topics: [
        { id: 'm10', title: 'LangChain, Vector Stores (Chroma/Pinecone) & RAG Systems', hours: 28, completed: false },
        { id: 'm11', title: 'Fine-tuning Open-Source Models with LoRA / QLoRA', hours: 22, completed: false },
        { id: 'm12', title: 'Containerization, FastAPI inference & AWS SageMaker', hours: 26, completed: false }
      ]
    }
  ],
  'full-stack-dev': [
    {
      semester: 'Phase 1: Modern Web Foundations',
      estimatedDuration: '6 Weeks',
      status: 'in-progress',
      topics: [
        { id: 'fs1', title: 'Semantic HTML5, Accessibility & Tailwind CSS', hours: 16, completed: false },
        { id: 'fs2', title: 'Modern JavaScript (ES6+, Async/Await, Closures)', hours: 22, completed: false },
        { id: 'fs3', title: 'Git Workflows, Branching & GitHub Collaboration', hours: 12, completed: false }
      ]
    },
    {
      semester: 'Phase 2: React.js & State Architecture',
      estimatedDuration: '8 Weeks',
      status: 'upcoming',
      topics: [
        { id: 'fs4', title: 'Component Lifecycle, Hooks (useState, useEffect, useMemo)', hours: 20, completed: false },
        { id: 'fs5', title: 'State Management (Zustand / Redux Toolkit / Context)', hours: 18, completed: false },
        { id: 'fs6', title: 'Next.js App Router, SSR, Server Actions', hours: 24, completed: false }
      ]
    },
    {
      semester: 'Phase 3: Backend & Database Engineering',
      estimatedDuration: '10 Weeks',
      status: 'upcoming',
      topics: [
        { id: 'fs7', title: 'Node.js & Express / NestJS Architecture', hours: 25, completed: false },
        { id: 'fs8', title: 'Relational Databases (PostgreSQL, Prisma ORM, Indexing)', hours: 22, completed: false },
        { id: 'fs9', title: 'JWT Authentication, OAuth 2.0 & Role-Based Access', hours: 18, completed: false }
      ]
    },
    {
      semester: 'Phase 4: Production Cloud Deployment & Caching',
      estimatedDuration: '8 Weeks',
      status: 'upcoming',
      topics: [
        { id: 'fs10', title: 'Redis Caching & Message Queues (BullMQ / RabbitMQ)', hours: 20, completed: false },
        { id: 'fs11', title: 'Docker Containers & Automated GitHub Actions CI/CD', hours: 18, completed: false },
        { id: 'fs12', title: 'Monitoring, Sentry Error Tracking & Vercel/AWS Hosting', hours: 16, completed: false }
      ]
    }
  ],
  'software-engineer': [
    {
      semester: 'Phase 1: Data Structures Mastery',
      estimatedDuration: '8 Weeks',
      status: 'in-progress',
      topics: [
        { id: 'se1', title: 'Arrays, Linked Lists, Stacks, Queues & HashMaps', hours: 24, completed: false },
        { id: 'se2', title: 'Binary Search, Two Pointers & Sliding Window', hours: 20, completed: false },
        { id: 'se3', title: 'Trees, Binary Search Trees & Heap / Priority Queue', hours: 22, completed: false }
      ]
    },
    {
      semester: 'Phase 2: Advanced Algorithms',
      estimatedDuration: '10 Weeks',
      status: 'upcoming',
      topics: [
        { id: 'se4', title: 'Graphs (BFS, DFS, Dijkstra, Topological Sort)', hours: 26, completed: false },
        { id: 'se5', title: 'Dynamic Programming (1D, 2D & Knapsack patterns)', hours: 30, completed: false },
        { id: 'se6', title: 'Bit Manipulation & Greedy Algorithms', hours: 15, completed: false }
      ]
    },
    {
      semester: 'Phase 3: Object-Oriented & Low-Level Design (LLD)',
      estimatedDuration: '8 Weeks',
      status: 'upcoming',
      topics: [
        { id: 'se7', title: 'SOLID Principles & GoF Design Patterns', hours: 22, completed: false },
        { id: 'se8', title: 'Thread Safety, Mutexes & Concurrency in Java/C++', hours: 20, completed: false },
        { id: 'se9', title: 'Designing Clean Extensible APIs & Database Schemas', hours: 18, completed: false }
      ]
    },
    {
      semester: 'Phase 4: High-Level System Design (HLD)',
      estimatedDuration: '10 Weeks',
      status: 'upcoming',
      topics: [
        { id: 'se10', title: 'Load Balancing, Horizontal Scaling & CDN Caching', hours: 24, completed: false },
        { id: 'se11', title: 'Database Sharding, Replication & CAP Theorem', hours: 22, completed: false },
        { id: 'se12', title: 'Designing Uber / Netflix / URL Shortener scale systems', hours: 28, completed: false }
      ]
    }
  ]
};

export const getRoadmapForRole = (roleId) => {
  if (ROADMAPS_BY_ROLE[roleId]) {
    return ROADMAPS_BY_ROLE[roleId];
  }
  return ROADMAPS_BY_ROLE['full-stack-dev'];
};

export const RESUME_FOUNDATION_MODULES = [
  {
    id: 'rf1',
    title: 'Resume Basics & ATS Compatibility',
    summary: 'Master the single-page formatting standards required by automated Applicant Tracking Systems.',
    tips: [
      'Strictly maintain a 1-page PDF document with clean 0.5-0.75 inch margins.',
      'Use standard headings (Education, Technical Skills, Projects, Experience).',
      'Avoid multi-column tables, text boxes, or non-parseable graphic bars.'
    ],
    checklist: ['Single column layout', 'ATS-friendly fonts (Inter/Calibri/Arial)', 'Contact info with clickable GitHub/LinkedIn']
  },
  {
    id: 'rf2',
    title: 'Impact-Driven Resume Structure',
    summary: 'Structure each section in optimal hierarchy for junior and first-semester candidates.',
    tips: [
      'For 1st & 2nd semester students, place Education & Skills at the top.',
      'Quantify results using Google\'s X-Y-Z formula: Accomplished [X] as measured by [Y], by doing [Z].',
      'Include expected graduation month and relevant coursework.'
    ],
    checklist: ['Contact Header', 'Education with expected graduation year', 'Categorized Technical Skills', 'Academic or Personal Projects']
  },
  {
    id: 'rf3',
    title: 'Projects Section Highlighting',
    summary: 'Showcase hands-on code capability even before having industry corporate experience.',
    tips: [
      'Include 2 to 3 substantive GitHub projects with live deployed URLs.',
      'List the exact tech stack used in brackets next to the project title.',
      'Write 2-3 bullet points per project focusing on technical challenges solved.'
    ],
    checklist: ['GitHub repo link provided', 'Live demo deployment linked', 'Tech stack highlighted in each entry']
  },
  {
    id: 'rf4',
    title: 'Skills Section Categorization',
    summary: 'Organize your growing programming languages, tools, and libraries effectively.',
    tips: [
      'Group into: Languages, Frameworks/Libraries, Developer Tools, Databases.',
      'Never use arbitrary percentage bars (e.g., "Python 85%") which confusingly penalize ATS score.',
      'List skills in order of highest proficiency.'
    ],
    checklist: ['Categorized groupings', 'No arbitrary rating bars', 'Verified proficiency for interview questions']
  }
];

export const READINESS_QUIZ_QUESTIONS = [
  // Aptitude
  {
    id: 1,
    section: 'Aptitude',
    question: 'A train 240 meters long passes a pole in 24 seconds. How long will it take to pass a platform 650 meters long at the same speed?',
    options: ['65 seconds', '89 seconds', '72 seconds', '85 seconds'],
    answer: 1,
    explanation: 'Speed of train = 240m / 24s = 10 m/s. Total distance to cross platform = 240 + 650 = 890m. Time = 890 / 10 = 89 seconds.'
  },
  {
    id: 2,
    section: 'Aptitude',
    question: 'If 8 workers can complete a coding sprint project in 15 days working 6 hours a day, how many days will 10 workers take working 8 hours a day?',
    options: ['9 days', '10 days', '8 days', '11 days'],
    answer: 0,
    explanation: 'Total man-hours required = 8 * 15 * 6 = 720 hours. With 10 workers working 8 hours/day (80 hrs/day), Days = 720 / 80 = 9 days.'
  },
  {
    id: 3,
    section: 'Aptitude',
    question: 'A bag contains 5 red, 4 blue, and 3 green marbles. If 2 marbles are drawn at random without replacement, what is the probability that both are red?',
    options: ['5/33', '10/33', '5/22', '2/11'],
    answer: 0,
    explanation: 'P(First red) = 5/12. P(Second red) = 4/11. Total Probability = (5/12) * (4/11) = 20/132 = 5/33.'
  },
  {
    id: 4,
    section: 'Aptitude',
    question: 'Find the next number in the sequence: 4, 9, 25, 49, 121, 169, ___',
    options: ['225', '256', '289', '361'],
    answer: 2,
    explanation: 'The numbers are squares of consecutive prime numbers: 2², 3², 5², 7², 11², 13², and next prime is 17² = 289.'
  },
  {
    id: 5,
    section: 'Aptitude',
    question: 'If "CLOUD" is coded as "ENQWF", how is "PILOT" coded in that same cipher?',
    options: ['RKNRV', 'RKNQV', 'SKMRW', 'QLMPU'],
    answer: 1,
    explanation: 'Each letter is shifted by +2 positions in the English alphabet: P+2=R, I+2=K, L+2=N, O+2=Q, T+2=V -> RKNQV.'
  },
  // Technical MCQs
  {
    id: 6,
    section: 'Technical MCQs',
    question: 'What is the average time complexity of searching for an element in an unsorted array vs a Balanced Binary Search Tree (AVL/Red-Black)?',
    options: ['O(1) vs O(N)', 'O(N) vs O(log N)', 'O(log N) vs O(1)', 'O(N²) vs O(N log N)'],
    answer: 1,
    explanation: 'Searching an unsorted array requires scanning up to N elements (O(N)), while a balanced BST partitions elements in half at each step (O(log N)).'
  },
  {
    id: 7,
    section: 'Technical MCQs',
    question: 'In React 18/19, what is the primary purpose of the `useMemo` hook?',
    options: [
      'To automatically trigger a re-render when external props mutate',
      'To cache the result of an expensive calculation between renders',
      'To handle side effects such as data fetching and DOM manipulation',
      'To manage global application state across unmounted components'
    ],
    answer: 1,
    explanation: '`useMemo` caches the calculated value of a function across renders, only recalculating when designated dependencies in the dependency array change.'
  },
  {
    id: 8,
    section: 'Technical MCQs',
    question: 'Which of the following database isolation levels completely prevents "Phantom Reads"?',
    options: ['Read Uncommitted', 'Read Committed', 'Repeatable Read', 'Serializable'],
    answer: 3,
    explanation: '`Serializable` is the highest isolation level in ACID transactions and prevents dirty reads, non-repeatable reads, and phantom reads.'
  },
  {
    id: 9,
    section: 'Technical MCQs',
    question: 'What does the `CAP` theorem in distributed systems state about network partitions (P)?',
    options: [
      'You can achieve Consistency, Availability, and Partition Tolerance simultaneously with modern SSDs',
      'When a network partition occurs, a system must choose between Consistency (C) and Availability (A)',
      'Partition tolerance is unnecessary when running inside a single cloud availability zone',
      'Consistency is always guaranteed over eventual availability in asynchronous messaging'
    ],
    answer: 1,
    explanation: 'Because network partitions are an inevitable physical reality of distributed systems, a system can either be CP (consistent but rejecting requests) or AP (available but serving potentially stale data).'
  },
  {
    id: 10,
    section: 'Technical MCQs',
    question: 'In modern machine learning and LLMs, what is the key innovation of the "Transformer" architecture over traditional RNNs/LSTMs?',
    options: [
      'It discards matrix multiplication in favor of decision trees',
      'It allows parallel processing of sequence tokens using Self-Attention mechanisms without sequential bottlenecks',
      'It requires zero training data and relies purely on heuristic logic',
      'It can only run on CPU memory and does not use GPU acceleration'
    ],
    answer: 1,
    explanation: 'Self-attention mechanisms allow Transformers to weigh dependencies across all positions in a sequence in parallel during training, overcoming the slow step-by-step recurrent bottle-neck of RNNs.'
  },
  // Communication
  {
    id: 11,
    section: 'Communication',
    question: 'During a sprint planning meeting, a teammate disagrees with your architectural approach. How should you professionally respond?',
    options: [
      'Immediately escalate to the engineering director to overrule their opinion',
      'Acknowledge their points, ask clarifying questions to understand their constraints, and evaluate both solutions with data or benchmarks',
      'Ignore their comments and build your version quietly on a separate branch',
      'Insist louder until the team agrees with your original proposal'
    ],
    answer: 1,
    explanation: 'Constructive engineering communication focuses on objective criteria, listening to constraints, and comparing trade-offs with data rather than personal authority.'
  },
  {
    id: 12,
    section: 'Communication',
    question: 'You realize that a major bug you introduced caused an outage in the production environment. What is the best immediate course of action?',
    options: [
      'Roll back your commit secretly and hope monitoring does not attribute the error to your pull request',
      'Post transparently in the incident response channel, assist in rolling back or hotfixing immediately, and participate in a blameless postmortem',
      'Wait for the quality assurance (QA) team to notice and report it in the next weekly meeting',
      'Blame the automated continuous integration (CI) pipeline for failing to catch the bug'
    ],
    answer: 1,
    explanation: 'High-performing engineering cultures value swift transparency, accountability, rapid mitigation, and blameless learning postmortems.'
  },
  {
    id: 13,
    section: 'Communication',
    question: 'When asked in a behavioral interview "Tell me about a time you failed", what is the most effective storytelling structure?',
    options: [
      'Describe how your previous company was poorly managed and that everyone failed',
      'Claim you have never failed because you maintain 100% perfection in all coding projects',
      'Use the STAR method: describe the Situation, Task, your Action, the Result, and most importantly, what you learned and implemented since',
      'Focus exclusively on defending your reasoning without admitting any personal mistake'
    ],
    answer: 2,
    explanation: 'The STAR (Situation, Task, Action, Result) method anchored with self-awareness and lessons learned demonstrates growth mindset and emotional intelligence.'
  },
  {
    id: 14,
    section: 'Communication',
    question: 'You are explaining a complex technical refactoring to a non-technical product manager. How should you frame the discussion?',
    options: [
      'Use deep jargon like AST transformations and memory heap allocations to impress them',
      'Tell them that code quality is an engineer-only concern that they do not need to understand',
      'Translate technical debt into business impact: explain how the refactor improves user loading speed, reduces crashes, and speeds up future feature delivery',
      'Postpone refactoring forever because business stakeholders only value visual UI buttons'
    ],
    answer: 2,
    explanation: 'Effective technical communicators align engineering initiatives with business outcomes (velocity, stability, cost reduction, and user experience).'
  },
  {
    id: 15,
    section: 'Communication',
    question: 'How do you handle writing code reviews on a junior developer\'s pull request?',
    options: [
      'Leave comments saying "This is bad code, rewrite everything"',
      'Approve without reading to save time and be nice',
      'Provide constructive feedback explaining the "why" behind best practices, commend good implementations, and offer code snippet suggestions',
      'Merge the pull request and then rewrite their code yourself after hours'
    ],
    answer: 2,
    explanation: 'Great code reviews empower growth through clear explanations, positive reinforcement, and actionable guidance.'
  }
];

export const RECOMMENDED_PROJECTS = [];

export const RECOMMENDED_INTERNSHIPS = [];

export const RECOMMENDED_CERTIFICATES = [];

export const LEARNING_RESOURCES = [];

export const INITIAL_ADMIN_USERS = [
  { id: 'u1', name: 'Harshitha K Y', email: 'harshitha@college.edu', role: 'Student', semester: 2, status: 'Active', readinessScore: 78, targetRole: 'AI Engineer' },
  { id: 'u2', name: 'Aarav Sharma', email: 'aarav.sharma@techuniv.edu', role: 'Student', semester: 1, status: 'Active', readinessScore: 62, targetRole: 'Full Stack Developer' },
  { id: 'u3', name: 'Elena Rostova', email: 'elena.r@stanford.edu', role: 'Student', semester: 4, status: 'Active', readinessScore: 89, targetRole: 'Software Engineer' },
  { id: 'u4', name: 'Dr. Vikram Patel', email: 'v.patel@careerpilot.ai', role: 'Mentor', semester: '-', status: 'Active', readinessScore: 98, targetRole: 'Faculty Director' },
  { id: 'u5', name: 'Sarah Jenkins', email: 'sarah.j@recruiter.com', role: 'Recruiter', semester: '-', status: 'Active', readinessScore: 94, targetRole: 'Google Recruiter' },
  { id: 'u6', name: 'David Kim', email: 'david.kim@mit.edu', role: 'Student', semester: 3, status: 'Pending Review', readinessScore: 71, targetRole: 'Cloud Engineer' }
];

export const PLATFORM_USAGE_DATA = [
  { month: 'Apr', students: 1200, testsTaken: 890, resumesCalibrated: 640 },
  { month: 'May', students: 1900, testsTaken: 1400, resumesCalibrated: 1100 },
  { month: 'Jun', students: 3100, testsTaken: 2600, resumesCalibrated: 1850 },
  { month: 'Jul', students: 4800, testsTaken: 4100, resumesCalibrated: 2900 },
  { month: 'Aug', students: 6900, testsTaken: 5800, resumesCalibrated: 4400 },
  { month: 'Sep', students: 9400, testsTaken: 8200, resumesCalibrated: 6100 }
];
