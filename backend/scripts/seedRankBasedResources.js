import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('\n❌ Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in backend/.env file.');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const RESOURCES_SEED = [
  // ==========================================
  // STANDARD ACCESS RESOURCES (Silver, Gold, Platinum)
  // ==========================================
  {
    title: 'Data Structures & Algorithms Starter Handbook',
    category: 'Documentation',
    description: 'Comprehensive introduction to Big-O analysis, arrays, linked lists, stacks, queues, and tree traversals with visual diagrams.',
    url: 'https://github.com/jwasham/coding-interview-university',
    is_free: true,
    access_level: 'Standard',
    content_type: 'Notes',
    academic_year: 'All',
    author: 'CareerPilot Staff',
    is_published: true
  },
  {
    title: 'Introduction to Web Architecture & HTTP/2 Protocols',
    category: 'Videos',
    description: 'Foundational video walkthrough explaining client-server interaction, DNS resolution, TLS handshakes, and RESTful API principles.',
    url: 'https://www.youtube.com/watch?v=0bHoB3etfZE',
    is_free: true,
    access_level: 'Standard',
    content_type: 'Video',
    academic_year: '1st Year',
    author: 'Department Faculty',
    is_published: true
  },
  {
    title: 'Git & Open Source Collaboration Cheat Sheet',
    category: 'Documentation',
    description: 'Practical guide to Git branching, rebase strategies, PR code reviews, and open-source contribution workflows.',
    url: 'https://education.github.com/git-cheat-sheet-data.pdf',
    is_free: true,
    access_level: 'Standard',
    content_type: 'Notes',
    academic_year: 'All',
    author: 'Staff Engineer',
    is_published: true
  },

  // ==========================================
  // FACULTY ACCESS RESOURCES (Silver, Gold, Platinum)
  // ==========================================
  {
    title: 'Database Management Systems & SQL Optimization Lecture Notes',
    category: 'Blogs',
    description: 'Curated university faculty slides covering relational algebra, B+ Tree indexing, normalization (1NF-BCNF), and execution plan analysis.',
    url: 'https://db-book.com/slides-dir/',
    is_free: true,
    access_level: 'Faculty',
    content_type: 'Lecture',
    academic_year: '2nd Year',
    author: 'Department Senior Professor',
    is_published: true
  },
  {
    title: 'Operating Systems & Concurrency Lab Manual',
    category: 'Courses',
    description: 'Faculty-authored lab exercises on mutex locks, semaphores, deadlock detection, CPU scheduling algorithms, and memory paging.',
    url: 'https://pages.cs.wisc.edu/~remzi/OSTEP/',
    is_free: true,
    access_level: 'Faculty',
    content_type: 'Class',
    academic_year: '2nd Year',
    author: 'OS Faculty Lead',
    is_published: true
  },
  {
    title: 'Computer Networks & Socket Programming Guide',
    category: 'Documentation',
    description: 'Departmental guide to TCP/IP stack implementation, Socket APIs in C/Python, sliding window protocol simulation, and packet sniffing.',
    url: 'https://beej.us/guide/bgnet/',
    is_free: true,
    access_level: 'Faculty',
    content_type: 'Notes',
    academic_year: '3rd Year',
    author: 'Networks Lab Coordinator',
    is_published: true
  },

  // ==========================================
  // PREMIUM ACCESS RESOURCES (Gold & Platinum ONLY)
  // ==========================================
  {
    title: 'FAANG Algorithmic Patterns & System Coding Vault',
    category: 'Practice Platforms',
    description: 'High-yield placement prep guide detailing Two Pointers, Sliding Window, Fast/Slow Pointers, Dynamic Programming tabulation, and Monotonic Queue patterns.',
    url: 'https://neetcode.io/roadmap',
    is_free: false,
    access_level: 'Premium',
    content_type: 'Notes',
    academic_year: '3rd Year',
    author: 'Senior Placement Mentor',
    is_published: true
  },
  {
    title: 'High-Scale System Design Architecture Blueprints',
    category: 'Documentation',
    description: 'Architectural teardown of distributed caching (Redis/Memcached), message queues (Kafka), database sharding, and consistent hashing rings.',
    url: 'https://github.com/donnemartin/system-design-primer',
    is_free: false,
    access_level: 'Premium',
    content_type: 'Notes',
    academic_year: '4th Year',
    author: 'Principal Architect',
    is_published: true
  },
  {
    title: 'Production Microservices & Cloud Native Resilience Blueprint',
    category: 'Videos',
    description: 'Deep-dive lecture on circuit breakers, rate limiting algorithms (Token Bucket), API Gateway authentication, and Kubernetes pod autoscaling.',
    url: 'https://microservices.io/patterns/index.html',
    is_free: false,
    access_level: 'Premium',
    content_type: 'Lecture',
    academic_year: '4th Year',
    author: 'Cloud Systems Specialist',
    is_published: true
  },

  // ==========================================
  // EXPERT ACCESS RESOURCES (Platinum ONLY)
  // ==========================================
  {
    title: 'Staff Engineer System Architecture Masterclass & Teardowns',
    category: 'Videos',
    description: 'Exclusive 1-on-1 masterclass detailing zero-downtime database migrations, consensus algorithms (Raft/Paxos), multi-region replication, and P99 latency optimization.',
    url: 'https://bytebytego.com/',
    is_free: false,
    access_level: 'Expert',
    content_type: 'Lecture',
    academic_year: '4th Year',
    author: 'Staff Software Engineer (FAANG Ex-Google)',
    is_published: true
  },
  {
    title: 'Executive Technical Presentation & Product Strategy Vault',
    category: 'Blogs',
    description: 'Expert guide on delivering C-level architectural proposals, trade-off communication, business ROI presentation, and technical interview leadership.',
    url: 'https://staffeng.com/guides/',
    is_free: false,
    access_level: 'Expert',
    content_type: 'Notes',
    academic_year: 'All',
    author: 'VP of Engineering',
    is_published: true
  },
  {
    title: 'Advanced Machine Learning & LLM Infrastructure Teardown',
    category: 'Courses',
    description: 'Expert deep-dive into distributed GPU training clusters, vector database indexing (HNSW), RAG pipeline optimizations, and model quantization.',
    url: 'https://fullstackdeeplearning.com/',
    is_free: false,
    access_level: 'Expert',
    content_type: 'Class',
    academic_year: '4th Year',
    author: 'AI Research Director',
    is_published: true
  }
];

export async function seedRankBasedResources() {
  console.log('\n=============================================================');
  console.log('🚀 CAREERPILOT AI: Seeding Rank-Based Learning Resources');
  console.log('=============================================================\n');

  try {
    // 1. Clear existing generic test resources
    const { error: delError } = await supabaseAdmin
      .from('resources')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (delError) {
      console.warn('  ⚠️ Note during cleanup:', delError.message);
    }

    // 2. Insert new rank-based learning resources
    let inserted = 0;
    for (const item of RESOURCES_SEED) {
      const { data, error } = await supabaseAdmin.from('resources').insert(item).select();
      if (error) {
        // Fallback for minimal table schema if access_level column doesn't exist yet
        if (error.message.includes('column')) {
          const minimal = {
            title: item.title,
            category: item.category,
            description: JSON.stringify({
              desc: item.description,
              access_level: item.access_level,
              content_type: item.content_type,
              academic_year: item.academic_year,
              author: item.author
            }),
            url: item.url,
            is_free: item.is_free
          };
          await supabaseAdmin.from('resources').insert(minimal);
          inserted++;
        } else {
          console.warn(`  ⚠️ Error inserting [${item.title}]:`, error.message);
        }
      } else {
        inserted++;
      }
    }

    console.log(`\n🎉 Seeded ${inserted} / ${RESOURCES_SEED.length} rank-based learning resources into Supabase successfully!`);
    return true;
  } catch (err) {
    console.error('❌ Exception in seedRankBasedResources:', err);
    return false;
  }
}

seedRankBasedResources().then(() => process.exit(0));
