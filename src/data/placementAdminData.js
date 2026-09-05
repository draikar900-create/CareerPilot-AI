// Placement Team Admin Portal initial data and storage helpers

export const INITIAL_BRANCH_DATA = [
  { branch: 'CSE', fullName: 'Computer Science & Eng', students: 420, fill: '#6366f1' },
  { branch: 'ISE', fullName: 'Information Science & Eng', students: 260, fill: '#8b5cf6' },
  { branch: 'AIML', fullName: 'Artificial Intelligence & ML', students: 190, fill: '#06b6d4' },
  { branch: 'ECE', fullName: 'Electronics & Communication', students: 210, fill: '#3b82f6' },
  { branch: 'EEE', fullName: 'Electrical & Electronics', students: 90, fill: '#f59e0b' },
  { branch: 'Mechanical', fullName: 'Mechanical Engineering', students: 65, fill: '#10b981' },
  { branch: 'Civil', fullName: 'Civil Engineering', students: 45, fill: '#ec4899' }
];

export const INITIAL_OVERVIEW_METRICS = {
  totalStudents: 1280,
  totalCompanies: 84,
  totalJobs: 142,
  totalResources: 320,
  studentsRegistered: 1280,
  studentsProfileCompleted: 1142,
  studentsPlacementReady: 876
};

export const INITIAL_STUDENTS = [
  {
    id: 'std-1',
    name: 'Aditi Rao',
    branch: 'CSE',
    cgpa: 9.42,
    careerGoal: 'Full Stack Developer',
    readinessScore: 92,
    projectsCount: 5,
    certificatesCount: 4,
    resumeScore: 94
  },
  {
    id: 'std-2',
    name: 'Rahul Sharma',
    branch: 'AIML',
    cgpa: 8.85,
    careerGoal: 'AI Engineer',
    readinessScore: 88,
    projectsCount: 4,
    certificatesCount: 3,
    resumeScore: 89
  },
  {
    id: 'std-3',
    name: 'Priya Nair',
    branch: 'ISE',
    cgpa: 9.10,
    careerGoal: 'Cloud Architect',
    readinessScore: 90,
    projectsCount: 6,
    certificatesCount: 5,
    resumeScore: 91
  },
  {
    id: 'std-4',
    name: 'Vikram Sen',
    branch: 'ECE',
    cgpa: 8.35,
    careerGoal: 'Embedded Systems Engineer',
    readinessScore: 78,
    projectsCount: 3,
    certificatesCount: 2,
    resumeScore: 82
  },
  {
    id: 'std-5',
    name: 'Sneha Patil',
    branch: 'CSE',
    cgpa: 9.60,
    careerGoal: 'Data Scientist',
    readinessScore: 95,
    projectsCount: 5,
    certificatesCount: 6,
    resumeScore: 96
  },
  {
    id: 'std-6',
    name: 'Karthik Verma',
    branch: 'AIML',
    cgpa: 7.92,
    careerGoal: 'MLOps Engineer',
    readinessScore: 74,
    projectsCount: 3,
    certificatesCount: 2,
    resumeScore: 76
  },
  {
    id: 'std-7',
    name: 'Ananya Deshmukh',
    branch: 'ISE',
    cgpa: 8.70,
    careerGoal: 'Cybersecurity Specialist',
    readinessScore: 84,
    projectsCount: 4,
    certificatesCount: 3,
    resumeScore: 85
  },
  {
    id: 'std-8',
    name: 'Rohan Kulkarni',
    branch: 'EEE',
    cgpa: 8.15,
    careerGoal: 'IoT Solutions Developer',
    readinessScore: 72,
    projectsCount: 2,
    certificatesCount: 2,
    resumeScore: 75
  },
  {
    id: 'std-9',
    name: 'Tanvi Iyer',
    branch: 'CSE',
    cgpa: 9.25,
    careerGoal: 'Backend Systems Engineer',
    readinessScore: 89,
    projectsCount: 4,
    certificatesCount: 4,
    resumeScore: 90
  },
  {
    id: 'std-10',
    name: 'Arjun Mehta',
    branch: 'Mechanical',
    cgpa: 7.65,
    careerGoal: 'Robotics & Automation',
    readinessScore: 68,
    projectsCount: 3,
    certificatesCount: 1,
    resumeScore: 71
  },
  {
    id: 'std-11',
    name: 'Divya Reddy',
    branch: 'ECE',
    cgpa: 8.90,
    careerGoal: 'VLSI Design Engineer',
    readinessScore: 86,
    projectsCount: 4,
    certificatesCount: 3,
    resumeScore: 88
  },
  {
    id: 'std-12',
    name: 'Gaurav Joshi',
    branch: 'Civil',
    cgpa: 7.80,
    careerGoal: 'BIM & Structural Analyst',
    readinessScore: 65,
    projectsCount: 2,
    certificatesCount: 1,
    resumeScore: 69
  }
];

export const INITIAL_COMPANIES = [
  {
    id: 'cmp-1',
    name: 'Google',
    description: 'Global technology leader specializing in internet-related services, search, cloud computing, and AI hardware.',
    availableRoles: ['Software Engineer', 'Associate Cloud Engineer', 'Data Analyst Intern']
  },
  {
    id: 'cmp-2',
    name: 'Microsoft',
    description: 'Leading provider of enterprise software, cloud infrastructure (Azure), productivity solutions, and AI platforms.',
    availableRoles: ['Software Development Engineer', 'Support Engineer', 'Security Analyst']
  },
  {
    id: 'cmp-3',
    name: 'Salutex AI',
    description: 'Next-generation AI research and enterprise agentic systems company creating autonomous intelligence architectures.',
    availableRoles: ['AI/ML Engineer', 'Full Stack Developer', 'NLP Research Associate']
  },
  {
    id: 'cmp-4',
    name: 'Amazon',
    description: 'Global e-commerce and cloud giant delivering hyperscale infrastructure, logistics, and web services worldwide.',
    availableRoles: ['SDE-1', 'Operations Analyst', 'Cloud Support Associate']
  },
  {
    id: 'cmp-5',
    name: 'Cisco',
    description: 'Worldwide leader in networking hardware, telecommunications equipment, cybersecurity, and IoT frameworks.',
    availableRoles: ['Network Software Engineer', 'Systems Engineer', 'Cybersecurity Trainee']
  },
  {
    id: 'cmp-6',
    name: 'Qualcomm',
    description: 'Pioneer in wireless telecommunications, 5G chipsets, digital signal processing, and mobile semiconductors.',
    availableRoles: ['Embedded Software Engineer', 'Hardware Verification Engineer', 'Firmware Developer']
  },
  {
    id: 'cmp-7',
    name: 'Infosys',
    description: 'Multinational information technology company providing business consulting, IT services, and digital transformation.',
    availableRoles: ['Systems Engineer Specialist', 'Power Programmer', 'Digital Specialist Engineer']
  }
];

export const INITIAL_JOBS = [
  {
    id: 'job-1',
    role: 'Graduate Software Engineer',
    company: 'Google',
    location: 'Bangalore, India',
    salary: '₹24 - 28 LPA',
    applyLink: 'https://careers.google.com/jobs/results'
  },
  {
    id: 'job-2',
    role: 'AI / Machine Learning Engineer',
    company: 'Salutex AI',
    location: 'Hyderabad, India (Hybrid)',
    salary: '₹18 - 22 LPA',
    applyLink: 'https://salutex.ai/careers'
  },
  {
    id: 'job-3',
    role: 'Cloud Infrastructure Associate',
    company: 'Microsoft',
    location: 'Bangalore, India',
    salary: '₹16 - 20 LPA',
    applyLink: 'https://careers.microsoft.com'
  },
  {
    id: 'job-4',
    role: 'Software Development Engineer (SDE-1)',
    company: 'Amazon',
    location: 'Hyderabad / Chennai',
    salary: '₹22 - 26 LPA',
    applyLink: 'https://amazon.jobs/en'
  },
  {
    id: 'job-5',
    role: 'Embedded Systems & Firmware Engineer',
    company: 'Qualcomm',
    location: 'Bangalore, India',
    salary: '₹17 - 21 LPA',
    applyLink: 'https://qualcomm.wd5.myworkdayjobs.com'
  },
  {
    id: 'job-6',
    role: 'Network Security Developer',
    company: 'Cisco',
    location: 'Bangalore, India',
    salary: '₹15 - 19 LPA',
    applyLink: 'https://jobs.cisco.com'
  },
  {
    id: 'job-7',
    role: 'Specialist Programmer (Digital)',
    company: 'Infosys',
    location: 'Pune / Bangalore, India',
    salary: '₹9.5 - 12 LPA',
    applyLink: 'https://career.infosys.com'
  }
];

export const INITIAL_SKILLS = [
  {
    id: 'skl-1',
    name: 'Data Structures & Algorithms',
    category: 'Core Computer Science',
    usage: ['Resume Detection', 'Job Matching', 'Skill Gap Analysis']
  },
  {
    id: 'skl-2',
    name: 'React.js & Modern Frontend',
    category: 'Frontend Development',
    usage: ['Resume Detection', 'Job Matching']
  },
  {
    id: 'skl-3',
    name: 'Python & PyTorch Machine Learning',
    category: 'AI & Data Science',
    usage: ['Resume Detection', 'Job Matching', 'Skill Gap Analysis']
  },
  {
    id: 'skl-4',
    name: 'Node.js & Express REST APIs',
    category: 'Backend Development',
    usage: ['Job Matching', 'Skill Gap Analysis']
  },
  {
    id: 'skl-5',
    name: 'AWS Cloud Services & Docker',
    category: 'DevOps & Cloud',
    usage: ['Resume Detection', 'Job Matching', 'Skill Gap Analysis']
  },
  {
    id: 'skl-6',
    name: 'SQL & Database Design',
    category: 'Databases',
    usage: ['Resume Detection', 'Skill Gap Analysis']
  },
  {
    id: 'skl-7',
    name: 'Embedded C & Microcontrollers',
    category: 'Hardware & IoT',
    usage: ['Job Matching', 'Skill Gap Analysis']
  },
  {
    id: 'skl-8',
    name: 'System Design & Distributed Arch',
    category: 'System Architecture',
    usage: ['Resume Detection', 'Job Matching', 'Skill Gap Analysis']
  }
];

export const INITIAL_RESOURCES = [
  {
    id: 'res-1',
    title: 'Cracking the Coding Interview & DSA Blueprint',
    skillsCovered: ['Data Structures', 'Algorithms', 'Big-O', 'System Design'],
    resourceType: 'PDF',
    level: 'Intermediate',
    provider: 'CareerPilot Placement Cell',
    url: 'https://github.com/jwasham/coding-interview-university'
  },
  {
    id: 'res-2',
    title: 'Enterprise Full Stack React & Node Masterclass',
    skillsCovered: ['React.js', 'Node.js', 'PostgreSQL', 'TailwindCSS'],
    resourceType: 'Course',
    level: 'Advanced',
    provider: 'Coursera Enterprise',
    url: 'https://coursera.org'
  },
  {
    id: 'res-3',
    title: 'Modern Generative AI & LLM Systems Engineering',
    skillsCovered: ['PyTorch', 'HuggingFace', 'LangChain', 'Vector DBs'],
    resourceType: 'Video',
    level: 'Intermediate',
    provider: 'DeepLearning.AI',
    url: 'https://deeplearning.ai'
  },
  {
    id: 'res-4',
    title: 'Cloud Architecture & AWS Solution Design Docs',
    skillsCovered: ['AWS EC2', 'S3', 'Lambda', 'Docker Containerization'],
    resourceType: 'Documentation',
    level: 'Beginner',
    provider: 'AWS Academy',
    url: 'https://aws.amazon.com/training'
  },
  {
    id: 'res-5',
    title: 'Placement Technical Aptitude & Core Quant Drills',
    skillsCovered: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability'],
    resourceType: 'PDF',
    level: 'Beginner',
    provider: 'Campus Training Cell',
    url: 'https://indiabix.com'
  }
];

export const INITIAL_ELIGIBILITY_RULES = [
  {
    id: 'rul-1',
    companyName: 'Google',
    jobRole: 'Graduate Software Engineer',
    minCgpa: 8.5,
    eligibleBranches: ['CSE', 'ISE', 'AIML'],
    maxBacklogs: 0,
    requiredSkills: 'DSA, System Design, C++/Java, Git'
  },
  {
    id: 'rul-2',
    companyName: 'Salutex AI',
    jobRole: 'AI / Machine Learning Engineer',
    minCgpa: 8.0,
    eligibleBranches: ['CSE', 'ISE', 'AIML', 'ECE'],
    maxBacklogs: 0,
    requiredSkills: 'Python, PyTorch, Deep Learning, REST APIs'
  },
  {
    id: 'rul-3',
    companyName: 'Microsoft',
    jobRole: 'Cloud Infrastructure Associate',
    minCgpa: 7.75,
    eligibleBranches: ['CSE', 'ISE', 'AIML', 'ECE', 'EEE'],
    maxBacklogs: 1,
    requiredSkills: 'Networking, Linux, Cloud Fundamentals, Python'
  },
  {
    id: 'rul-4',
    companyName: 'Amazon',
    jobRole: 'Software Development Engineer (SDE-1)',
    minCgpa: 8.0,
    eligibleBranches: ['CSE', 'ISE', 'AIML', 'ECE'],
    maxBacklogs: 0,
    requiredSkills: 'Algorithms, Object Oriented Design, Java/Python'
  },
  {
    id: 'rul-5',
    companyName: 'Qualcomm',
    jobRole: 'Embedded Systems & Firmware Engineer',
    minCgpa: 7.5,
    eligibleBranches: ['ECE', 'EEE', 'CSE'],
    maxBacklogs: 0,
    requiredSkills: 'Embedded C, Microcontrollers, RTOS, Verilog'
  },
  {
    id: 'rul-6',
    companyName: 'Infosys',
    jobRole: 'Specialist Programmer (Digital)',
    minCgpa: 7.0,
    eligibleBranches: ['CSE', 'ISE', 'AIML', 'ECE', 'EEE', 'Mechanical', 'Civil'],
    maxBacklogs: 2,
    requiredSkills: 'Core Java/Python, Problem Solving, Web Basics'
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Placement Drive Announcement: Google 2026 Batch',
    message: 'Google registration portal is now open for Final Year & Pre-Final Year students with CGPA >= 8.5. Complete your resume upload before Friday 5:00 PM.',
    sentDate: '2026-09-04 11:30 AM',
    recipients: 'All Registered Students',
    status: 'Delivered'
  },
  {
    id: 'notif-2',
    title: 'New Internship Available: Salutex AI Research Fellowship',
    message: 'Salutex AI is hiring Summer AI Research Interns (₹45,000/month stipend). Eligible branches: CSE, ISE, AIML, ECE. Check Jobs section to apply directly.',
    sentDate: '2026-09-03 02:15 PM',
    recipients: 'All Registered Students',
    status: 'Delivered'
  },
  {
    id: 'notif-3',
    title: 'Hackathon Registration Open: National Smart Tech 2026',
    message: 'Registrations are active for the Inter-College Smart Tech Hackathon. Cash prize pool: ₹5 Lakhs. Students can form teams of up to 4 members.',
    sentDate: '2026-09-01 09:00 AM',
    recipients: 'All Registered Students',
    status: 'Delivered'
  },
  {
    id: 'notif-4',
    title: 'New Company Added: Qualcomm Hardware & VLSI Drive',
    message: 'Qualcomm campus hiring drive rules have been published. Minimum CGPA required is 7.5 for ECE, EEE, and CSE streams.',
    sentDate: '2026-08-28 04:45 PM',
    recipients: 'All Registered Students',
    status: 'Delivered'
  }
];

// Helper functions for LocalStorage persistence
export function getSavedPlacementData(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(`Error loading ${key} from storage:`, e);
  }
  return fallback;
}

export function savePlacementData(key, data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}
