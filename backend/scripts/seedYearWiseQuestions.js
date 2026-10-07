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

const supabaseAnon = createClient(supabaseUrl, process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

let dbClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const ALL_YEAR_QUESTIONS = [
  // ==========================================
  // YEAR 1 (15 QUESTIONS)
  // ==========================================
  {
    year: '1st Year',
    domain: 'Aptitude',
    question_text: 'If a train traveling at 60 km/h crosses a pole in 9 seconds, what is the length of the train in meters?',
    options: ['120m', '150m', '180m', '200m'],
    correct_option_index: 1,
    explanation: 'Speed = 60 * (5/18) = 50/3 m/s. Length = Speed * Time = (50/3) * 9 = 150 meters.'
  },
  {
    year: '1st Year',
    domain: 'Aptitude',
    question_text: 'What is the sum of the first 20 even positive integers?',
    options: ['200', '210', '420', '400'],
    correct_option_index: 2,
    explanation: 'Sum of first n even numbers is n(n + 1). For n=20, 20 * 21 = 420.'
  },
  {
    year: '1st Year',
    domain: 'Aptitude',
    question_text: 'A product marked at $80 is sold for $68. What is the percentage discount offered?',
    options: ['12%', '15%', '18%', '20%'],
    correct_option_index: 1,
    explanation: 'Discount = 80 - 68 = 12. Percentage = (12 / 80) * 100 = 15%.'
  },
  {
    year: '1st Year',
    domain: 'Aptitude',
    question_text: 'If 5 workers build a wall in 12 days, how many days will 10 workers take to build the same wall?',
    options: ['3 days', '6 days', '8 days', '10 days'],
    correct_option_index: 1,
    explanation: 'Workers * Days = Constant. 5 * 12 = 60 worker-days. Days for 10 workers = 60 / 10 = 6 days.'
  },
  {
    year: '1st Year',
    domain: 'Technical',
    question_text: 'Which primitive data type is used to store a single character in C / C++ / Java?',
    options: ['string', 'char', 'float', 'boolean'],
    correct_option_index: 1,
    explanation: 'The `char` keyword represents a single character code unit.'
  },
  {
    year: '1st Year',
    domain: 'Technical',
    question_text: 'What is the binary representation of the decimal number 13?',
    options: ['1011', '1100', '1101', '1110'],
    correct_option_index: 2,
    explanation: '13 in binary: 8 + 4 + 0 + 1 = 1101_2.'
  },
  {
    year: '1st Year',
    domain: 'Technical',
    question_text: 'Which component of a computer CPU executes arithmetic and logical operations?',
    options: ['RAM', 'Control Unit', 'ALU', 'Cache'],
    correct_option_index: 2,
    explanation: 'The Arithmetic Logic Unit (ALU) performs arithmetic calculations and logical decisions.'
  },
  {
    year: '1st Year',
    domain: 'Technical',
    question_text: 'In programming logic, what is a loop that never satisfies an exit condition called?',
    options: ['Recursive Loop', 'Infinite Loop', 'Deadlock', 'Stack Overflow'],
    correct_option_index: 1,
    explanation: 'A loop whose exit condition is never satisfied executes endlessly as an infinite loop.'
  },
  {
    year: '1st Year',
    domain: 'Communication',
    question_text: 'Choose the sentence with correct subject-verb agreement:',
    options: ['Each of the students are attending', 'Each of the students is attending', 'Each of the students have attended', 'Each of the students were attending'],
    correct_option_index: 1,
    explanation: '`Each` is a singular indefinite pronoun requiring the singular verb `is`.'
  },
  {
    year: '1st Year',
    domain: 'Communication',
    question_text: 'When emailing a professor or recruiter, what is the most professional subject line structure?',
    options: ['Hey check this out', 'Inquiry Regarding Internship Application - John Doe', 'Help needed urgently!!!', 'Application'],
    correct_option_index: 1,
    explanation: 'A clear, structured subject line detailing purpose and full name is professional.'
  },
  {
    year: '1st Year',
    domain: 'Communication',
    question_text: 'What does active listening primarily involve during a professional engineering interaction?',
    options: ['Planning your response while the other speaks', 'Nodding, maintaining eye contact, and clarifying key points', 'Interrupting to correct minor errors', 'Remaining completely silent without feedback'],
    correct_option_index: 1,
    explanation: 'Active listening involves focused engagement, non-verbal cues, and reflective clarification.'
  },
  {
    year: '1st Year',
    domain: 'Problem Solving',
    question_text: 'Look at the series: 2, 6, 12, 20, 30, ... What is the next number in the pattern?',
    options: ['36', '40', '42', '48'],
    correct_option_index: 2,
    explanation: 'Differences: +4, +6, +8, +10. Next difference is +12, so 30 + 12 = 42.'
  },
  {
    year: '1st Year',
    domain: 'Problem Solving',
    question_text: 'All cats are mammals. All mammals have lungs. Which statement is logically valid?',
    options: ['All mammals are cats', 'All cats have lungs', 'No cats have lungs', 'Some mammals do not have lungs'],
    correct_option_index: 1,
    explanation: 'If A ⊂ B and B ⊂ C, then A ⊂ C (Transitive property of sets).'
  },
  {
    year: '1st Year',
    domain: 'Problem Solving',
    question_text: 'If RED is coded as 18-5-4, how is BLUE coded using letter positions in the alphabet?',
    options: ['2-12-21-5', '2-11-20-5', '3-12-21-6', '2-12-22-5'],
    correct_option_index: 0,
    explanation: 'B=2, L=12, U=21, E=5.'
  },
  {
    year: '1st Year',
    domain: 'Problem Solving',
    question_text: 'An algorithm processes 10 items in 2 seconds. Assuming linear time complexity O(N), how long will it take for 50 items?',
    options: ['5 seconds', '10 seconds', '15 seconds', '25 seconds'],
    correct_option_index: 1,
    explanation: 'O(N) linear ratio: 50 / 10 = 5x input -> 2 * 5 = 10 seconds.'
  },

  // ==========================================
  // YEAR 2 (15 QUESTIONS)
  // ==========================================
  {
    year: '2nd Year',
    domain: 'Aptitude',
    question_text: 'Two pipes A and B can fill a tank in 20 and 30 minutes respectively. If both are opened together, how long will it take to fill?',
    options: ['10 minutes', '12 minutes', '15 minutes', '25 minutes'],
    correct_option_index: 1,
    explanation: 'Combined rate = (1/20) + (1/30) = 5/60 = 1/12. Time = 12 minutes.'
  },
  {
    year: '2nd Year',
    domain: 'Aptitude',
    question_text: 'In how many different ways can the letters of the word "CANVAS" be arranged?',
    options: ['360', '720', '180', '120'],
    correct_option_index: 0,
    explanation: 'CANVAS has 6 letters with 2 A\'s. Permutations = 6! / 2! = 720 / 2 = 360.'
  },
  {
    year: '2nd Year',
    domain: 'Aptitude',
    question_text: 'A card is drawn from a deck of 52 cards. What is the probability of drawing a Spade or an Ace?',
    options: ['16/52', '4/13', '17/52', '9/26'],
    correct_option_index: 0,
    explanation: 'Spades = 13, Aces = 4, Ace of Spades = 1. P(Spade ∪ Ace) = (13 + 4 - 1)/52 = 16/52.'
  },
  {
    year: '2nd Year',
    domain: 'Aptitude',
    question_text: 'The average age of 8 students is 21 years. If a teacher aged 39 joins, what is the new average age?',
    options: ['22 years', '23 years', '24 years', '25 years'],
    correct_option_index: 1,
    explanation: 'Sum = 8 * 21 = 168. New Sum = 168 + 39 = 207. New Average = 207 / 9 = 23 years.'
  },
  {
    year: '2nd Year',
    domain: 'Technical',
    question_text: 'Which core data structure operates on a Last In First Out (LIFO) protocol?',
    options: ['Queue', 'Stack', 'LinkedList', 'Binary Tree'],
    correct_option_index: 1,
    explanation: 'Stack data structure enforces Last-In-First-Out access via push and pop.'
  },
  {
    year: '2nd Year',
    domain: 'Technical',
    question_text: 'What is the primary characteristic of Object-Oriented Encapsulation?',
    options: ['Creating new classes from existing ones', 'Bundling data and methods while restricting direct access', 'Allowing one function name to have multiple forms', 'Executing tasks concurrently'],
    correct_option_index: 1,
    explanation: 'Encapsulation restricts direct state access by enclosing attributes with access modifiers.'
  },
  {
    year: '2nd Year',
    domain: 'Technical',
    question_text: 'In SQL, which DDL command is used to remove a table and its structure permanently?',
    options: ['DELETE', 'REMOVE', 'DROP', 'TRUNCATE'],
    correct_option_index: 2,
    explanation: '`DROP TABLE` deletes both data and schema definition permanently.'
  },
  {
    year: '2nd Year',
    domain: 'Technical',
    question_text: 'What is the average time complexity of searching for an element in a balanced Binary Search Tree (BST)?',
    options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
    correct_option_index: 1,
    explanation: 'A balanced BST halves the search space at each step, yielding logarithmic O(log N) time.'
  },
  {
    year: '2nd Year',
    domain: 'Communication',
    question_text: 'What does the STAR technique stand for when answering behavioral interview questions?',
    options: ['System, Task, Action, Result', 'Situation, Task, Action, Result', 'Strategy, Theory, Analysis, Review', 'Statement, Test, Application, Reaction'],
    correct_option_index: 1,
    explanation: 'STAR stands for Situation, Task, Action, and Result.'
  },
  {
    year: '2nd Year',
    domain: 'Communication',
    question_text: 'Identify the most constructive response when receiving critical feedback on code review:',
    options: ['Defend your code aggressively', 'Thank the reviewer, ask clarifying questions, and address valid points', 'Ignore the comments and merge your branch', 'Refuse to take further assignments'],
    correct_option_index: 1,
    explanation: 'Constructive feedback handling demonstrates emotional intelligence and engineering maturity.'
  },
  {
    year: '2nd Year',
    domain: 'Communication',
    question_text: 'Which tone is most suitable when detailing a system post-mortem report to cross-functional leaders?',
    options: ['Blameless, objective, and solution-focused', 'Emotional and apologetic', 'Highly academic with undefined jargon', 'Dismissive of user impact'],
    correct_option_index: 0,
    explanation: 'Post-mortems require blameless objectivity, precise metrics, and actionable prevention steps.'
  },
  {
    year: '2nd Year',
    domain: 'Problem Solving',
    question_text: 'A linked list has a cycle. Which algorithm detects this cycle in O(N) time and O(1) space?',
    options: ['Dijkstra Algorithm', 'Floyds Cycle Detection (Fast & Slow Pointers)', 'Binary Search', 'Kruskal Algorithm'],
    correct_option_index: 1,
    explanation: 'Floyd\'s Tortoise and Hare algorithm detects linked list cycles using two pointers.'
  },
  {
    year: '2nd Year',
    domain: 'Problem Solving',
    question_text: 'Which sorting algorithm guarantees O(N log N) time complexity in the worst-case scenario?',
    options: ['Quick Sort', 'Bubble Sort', 'Merge Sort', 'Insertion Sort'],
    correct_option_index: 2,
    explanation: 'Merge Sort consistently divides and merges arrays in O(N log N) time regardless of input order.'
  },
  {
    year: '2nd Year',
    domain: 'Problem Solving',
    question_text: 'Given array [4, 1, 2, 1, 2], where every element appears twice except one. Which bitwise operator identifies the single element in O(N) time?',
    options: ['AND (&)', 'OR (|)', 'XOR (^)', 'NOT (~)'],
    correct_option_index: 2,
    explanation: 'XORing identical numbers yields 0 (A ^ A = 0), leaving only the unique element.'
  },
  {
    year: '2nd Year',
    domain: 'Problem Solving',
    question_text: 'A hash table encounters a collision. Which collision resolution method probes sequential memory slots?',
    options: ['Separate Chaining', 'Open Addressing with Linear Probing', 'Double Hashing', 'Re-hashing'],
    correct_option_index: 1,
    explanation: 'Linear probing searches consecutive array locations upon hash collision.'
  },

  // ==========================================
  // YEAR 3 (15 QUESTIONS)
  // ==========================================
  {
    year: '3rd Year',
    domain: 'Aptitude',
    question_text: 'A seller marks up an item by 40% above cost price and then gives a discount of 25%. What is the net profit or loss percentage?',
    options: ['5% profit', '5% loss', '10% profit', '15% profit'],
    correct_option_index: 0,
    explanation: 'Cost = 100. Marked = 140. Selling = 140 * 0.75 = 105. Net Profit = 5%.'
  },
  {
    year: '3rd Year',
    domain: 'Aptitude',
    question_text: 'At what time between 3 o\'clock and 4 o\'clock will the hands of a clock overlap?',
    options: ['3:15', '3:16 4/11 minutes', '3:18 minutes', '3:20 minutes'],
    correct_option_index: 1,
    explanation: 'Time = 15 / (11/12) = 180/11 = 16 4/11 mins past 3.'
  },
  {
    year: '3rd Year',
    domain: 'Aptitude',
    question_text: 'A container has 80 liters of pure milk. 8 liters are replaced with water, and this operation is performed twice in total. How much milk remains?',
    options: ['64.8 liters', '65.2 liters', '66.0 liters', '72.0 liters'],
    correct_option_index: 0,
    explanation: 'Remaining Milk = 80 * (1 - 8/80)^2 = 80 * 0.81 = 64.8 liters.'
  },
  {
    year: '3rd Year',
    domain: 'Aptitude',
    question_text: 'How many 4-digit numbers divisible by 4 can be formed using digits 1, 2, 3, 4, 5 without repetition?',
    options: ['24', '32', '16', '20'],
    correct_option_index: 0,
    explanation: 'Divisibility by 4 requires last 2 digits: 12, 24, 32, 52 (4 choices * 6 = 24).'
  },
  {
    year: '3rd Year',
    domain: 'Technical',
    question_text: 'What does ACID stand for in Database Transaction Management?',
    options: ['Atomicity, Consistency, Isolation, Durability', 'Access, Control, Integrity, Security', 'Asynchronous, Concurrent, Indexed, Distributed', 'Authentication, Authorization, Encryption, Auditing'],
    correct_option_index: 0,
    explanation: 'ACID parameters guarantee reliable relational database transaction processing.'
  },
  {
    year: '3rd Year',
    domain: 'Technical',
    question_text: 'Which CPU scheduling algorithm can lead to starvation for low-priority processes?',
    options: ['Round Robin', 'First-Come First-Served', 'Shortest Job First (SJF)', 'Priority Scheduling without Aging'],
    correct_option_index: 3,
    explanation: 'Priority scheduling without aging keeps executing higher priority tasks, starving lower priority ones.'
  },
  {
    year: '3rd Year',
    domain: 'Technical',
    question_text: 'What is the primary difference between a process and a thread in an Operating System?',
    options: ['Processes share memory space; threads do not', 'Threads share the memory space of their parent process', 'Processes are managed by application code; threads by hardware', 'Threads cannot execute concurrently'],
    correct_option_index: 1,
    explanation: 'Threads share heap, code, and global memory within a single parent process boundary.'
  },
  {
    year: '3rd Year',
    domain: 'Technical',
    question_text: 'What is the worst-case time complexity of QuickSort when using naive pivot selection on an already sorted array?',
    options: ['O(N)', 'O(N log N)', 'O(N^2)', 'O(2^N)'],
    correct_option_index: 2,
    explanation: 'Unbalanced partitions on pre-sorted input result in recursive depth of N, yielding quadratic O(N^2) complexity.'
  },
  {
    year: '3rd Year',
    domain: 'Communication',
    question_text: 'During an architectural design review, an engineer disagrees with your database choice. What is the most effective approach?',
    options: ['Concede immediately to avoid conflict', 'Present empirical benchmarks, trade-off analysis, and listen to alternative proposals objectively', 'Tell them your decision is final', 'Escalate to management without debate'],
    correct_option_index: 1,
    explanation: 'Engineers evaluate choices using benchmark data, trade-off analysis, and constructive active listening.'
  },
  {
    year: '3rd Year',
    domain: 'Communication',
    question_text: 'What is the core purpose of an Executive Summary in an engineering design document?',
    options: ['To list all source code line numbers', 'To provide a concise overview of problem, proposed solution, cost, and business impact', 'To document user login credentials', 'To serve as a user manual'],
    correct_option_index: 1,
    explanation: 'Executive summaries convey high-level objectives, architectural choices, and business impacts succinctly.'
  },
  {
    year: '3rd Year',
    domain: 'Communication',
    question_text: 'When delivering a technical presentation to non-technical business leaders, which practice should be avoided?',
    options: ['Using real-world analogies', 'Overloading slides with dense low-level code snippets and un-explained acronyms', 'Highlighting key ROI and user experience metrics', 'Inviting interactive questions'],
    correct_option_index: 1,
    explanation: 'Avoid dense code snippets and un-explained jargon when communicating with non-technical leaders.'
  },
  {
    year: '3rd Year',
    domain: 'Problem Solving',
    question_text: 'What dynamic programming approach solves the classic 0/1 Knapsack problem in O(N * W) time?',
    options: ['Sliding Window', 'Bottom-up Tabulation / Memoization', 'Greedy Choice Strategy', 'Two Pointers'],
    correct_option_index: 1,
    explanation: '0/1 Knapsack requires dynamic programming (tabulation/memoization) to check overlapping subproblems.'
  },
  {
    year: '3rd Year',
    domain: 'Problem Solving',
    question_text: 'In graph theory, which algorithm finds single-source shortest paths in a weighted graph with non-negative edge weights?',
    options: ['Dijkstra Algorithm', 'Bellman-Ford Algorithm', 'Floyd-Warshall Algorithm', 'Kruskal Algorithm'],
    correct_option_index: 0,
    explanation: 'Dijkstra\'s algorithm uses a priority queue to determine shortest single-source non-negative paths.'
  },
  {
    year: '3rd Year',
    domain: 'Problem Solving',
    question_text: 'Which relational algebra operation corresponds to combining rows from two tables based on a related column?',
    options: ['Projection', 'Selection', 'Join', 'Union'],
    correct_option_index: 2,
    explanation: 'JOIN operators correlate tuples across relational entities based on join predicates.'
  },
  {
    year: '3rd Year',
    domain: 'Problem Solving',
    question_text: 'What is the maximum number of nodes in a full binary tree of height H (where root height = 0)?',
    options: ['2^H', '2^(H+1) - 1', '2^H + 1', '2^(H-1)'],
    correct_option_index: 1,
    explanation: 'Sum of geometric progression 1 + 2 + 4 + ... + 2^H = 2^(H+1) - 1.'
  },

  // ==========================================
  // YEAR 4 (15 QUESTIONS)
  // ==========================================
  {
    year: '4th Year',
    domain: 'Aptitude',
    question_text: 'A sum of money compounded annually doubles in 4 years. In how many years will it become 8 times original principal?',
    options: ['8 years', '12 years', '16 years', '20 years'],
    correct_option_index: 1,
    explanation: 'P becomes 2P in 4 yrs. (2P)^3 = 8P takes 4 * 3 = 12 years.'
  },
  {
    year: '4th Year',
    domain: 'Aptitude',
    question_text: 'Three dice are rolled simultaneously. What is the probability that the sum of the numbers shown is equal to 15?',
    options: ['10/216', '12/216', '15/216', '18/216'],
    correct_option_index: 0,
    explanation: 'Outcomes for sum 15: (6,6,3)[3], (6,5,4)[6], (5,5,5)[1]. Total favorable = 10. P = 10/216.'
  },
  {
    year: '4th Year',
    domain: 'Aptitude',
    question_text: 'A and B run a 1 km race. A beats B by 100 meters or 20 seconds. What is A\'s time to complete the race?',
    options: ['160 seconds', '180 seconds', '200 seconds', '220 seconds'],
    correct_option_index: 1,
    explanation: 'B covers 100m in 20s -> B speed = 5 m/s. B total time = 200s. A time = 200 - 20 = 180s.'
  },
  {
    year: '4th Year',
    domain: 'Aptitude',
    question_text: 'Find the remainder when 3^100 is divided by 7.',
    options: ['1', '2', '3', '4'],
    correct_option_index: 3,
    explanation: '3^6 ≡ 1 (mod 7). 100 = 6*16 + 4. 3^4 = 81. 81 mod 7 = 4.'
  },
  {
    year: '4th Year',
    domain: 'Technical',
    question_text: 'In distributed systems architecture, what does CAP Theorem state you must choose between during a network partition?',
    options: ['Consistency or Availability', 'Latency or Throughput', 'Security or Performance', 'Storage or Computation'],
    correct_option_index: 0,
    explanation: 'CAP Theorem states a distributed system can guarantee at most two of Consistency, Availability, Partition Tolerance.'
  },
  {
    year: '4th Year',
    domain: 'Technical',
    question_text: 'Which architectural strategy decouples microservice communication by emitting domain events to an intermediary broker?',
    options: ['Monolithic Shared Memory', 'Event-Driven Architecture with Message Brokers', 'Synchronous REST Polling', 'Direct Database Mirroring'],
    correct_option_index: 1,
    explanation: 'Event-Driven Architecture uses brokers (Kafka/RabbitMQ) for asynchronous decoupled domain event publishing.'
  },
  {
    year: '4th Year',
    domain: 'Technical',
    question_text: 'What mechanism is commonly used in API Gateways to prevent DDoS attacks and enforce service quotas per client?',
    options: ['Database Normalization', 'Distributed Rate Limiting (Token Bucket / Leaky Bucket)', 'Circuit Breaker Pattern', 'Cache Invalidation'],
    correct_option_index: 1,
    explanation: 'Rate limiting algorithms throttle request volumes to protect API availability.'
  },
  {
    year: '4th Year',
    domain: 'Technical',
    question_text: 'In microservices design, what is the core purpose of the Circuit Breaker pattern?',
    options: ['To encrypt network traffic', 'To prevent cascading failures when a downstream dependency is degraded or unreachable', 'To balance load evenly across instances', 'To auto-scale container replicas'],
    correct_option_index: 1,
    explanation: 'Circuit Breakers fail-fast when downstream services experience high error rates, protecting upstream caller threads.'
  },
  {
    year: '4th Year',
    domain: 'Communication',
    question_text: 'You are presenting an architectural proposal to C-level executives. What is the optimal structure for your deck?',
    options: ['50 slides of un-formatted source code', 'Executive Summary & Business ROI -> High-level System Architecture -> Risk & Mitigation -> Benchmark Comparison', 'Deep dive into variable naming conventions', 'Personal stories without metrics'],
    correct_option_index: 1,
    explanation: 'Executive decks lead with business impact/ROI, system architecture, risks/mitigations, and cost benchmarks.'
  },
  {
    year: '4th Year',
    domain: 'Communication',
    question_text: 'How should a Senior Tech Lead handle a critical P0 production outage call with client leadership?',
    options: ['Deny any responsibility', 'Provide calm, transparent updates on status, immediate containment steps, estimated resolution ETA, and commit to post-mortem', 'Blame the junior developer who pushed code', 'Mute the line and wait for it to self-heal'],
    correct_option_index: 1,
    explanation: 'Senior engineering leaders communicate transparently with containment steps, status, and realistic ETAs.'
  },
  {
    year: '4th Year',
    domain: 'Communication',
    question_text: 'When conducting a technical interview as a senior peer, what is the key responsibility of the interviewer?',
    options: ['Trick the candidate with obscure trivia', 'Create a welcoming environment, give clear problem statements, and evaluate problem-solving thought process', 'Talk for 80% of the interview time', 'Show off your own coding skills'],
    correct_option_index: 1,
    explanation: 'Interviewers create an encouraging environment to objectively evaluate candidate problem-solving and reasoning.'
  },
  {
    year: '4th Year',
    domain: 'Problem Solving',
    question_text: 'Which caching strategy updates the cache and the backing database synchronously in a single transaction before returning success?',
    options: ['Write-Through Cache', 'Write-Behind (Write-Back) Cache', 'Cache-Aside (Lazy Loading)', 'Read-Through Cache'],
    correct_option_index: 0,
    explanation: 'Write-Through cache synchronously writes data to both cache layer and persistent DB store.'
  },
  {
    year: '4th Year',
    domain: 'Problem Solving',
    question_text: 'Which consensus protocol is widely used in distributed key-value stores like etcd and Consul for leader election?',
    options: ['Raft Consensus Protocol', 'Round Robin Routing', 'Consistent Hashing', 'LRU Eviction'],
    correct_option_index: 0,
    explanation: 'Raft provides strong consistency and fault-tolerant leader election in distributed systems.'
  },
  {
    year: '4th Year',
    domain: 'Problem Solving',
    question_text: 'In consistent hashing, what technique prevents hot-spotting and ensures uniform key distribution across physical nodes?',
    options: ['Virtual Nodes (Vnodes)', 'B-Tree Indexing', 'Double Hashing', 'Linear Probing'],
    correct_option_index: 0,
    explanation: 'Virtual nodes map multiple tokens on the hash ring to each physical node, smoothing load distribution.'
  },
  {
    year: '4th Year',
    domain: 'Problem Solving',
    question_text: 'To find the median of a continuous stream of integers in O(1) time per query, which data structure pair is optimal?',
    options: ['Two Heaps (Max-Heap for lower half, Min-Heap for upper half)', 'Single Stack', 'Unsorted Array', 'Binary Search Tree without balancing'],
    correct_option_index: 0,
    explanation: 'Two balanced heaps (Max-Heap and Min-Heap) keep track of upper and lower halves to yield median in O(1) time.'
  }
];

export async function seedQuestions() {
  console.log('\n=============================================================');
  console.log('🚀 CAREERPILOT AI: Seeding Year-Wise Assessment Question Bank');
  console.log('=============================================================\n');

  try {
    const { data: authData, error: authErr } = await supabaseAnon.auth.signInWithPassword({
      email: process.env.DEV_ADMIN_EMAIL || 'admin.test@careerpilot.local',
      password: process.env.DEV_ADMIN_PASSWORD || 'DevAdmin@2026!Pass'
    });

    if (!authErr && authData?.session?.access_token) {
      dbClient = createClient(supabaseUrl, process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${authData.session.access_token}` } }
      });
      console.log('  ✅ Authenticated as Admin user for seeding.');
    }

    // Clear test/existing questions first
    const { error: delError } = await dbClient
      .from('readiness_questions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (delError) {
      console.warn('  ⚠️ Note during cleanup:', delError.message);
    }

    let insertedCount = 0;
    for (const q of ALL_YEAR_QUESTIONS) {
      const categoryTag = `${q.year} | ${q.domain}`;
      const payload = {
        category: categoryTag,
        question_text: q.question_text,
        options: q.options,
        correct_option_index: q.correct_option_index,
        explanation: q.explanation
      };

      const { error } = await dbClient.from('readiness_questions').insert(payload);
      if (error) {
        console.error(`  ❌ Error inserting (${categoryTag}):`, error.message);
      } else {
        insertedCount++;
      }
    }

    console.log(`\n🎉 Seeded ${insertedCount} / ${ALL_YEAR_QUESTIONS.length} year-specific questions into Supabase successfully!`);
    return true;
  } catch (err) {
    console.error('❌ Exception in seedQuestions:', err);
    return false;
  }
}

seedQuestions().then(() => process.exit(0));
