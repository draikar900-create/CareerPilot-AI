-- ====================================================================
-- CAREERPILOT AI - MIGRATION 08: YEAR-WISE ASSESSMENTS & RANKING ENGINE
-- ====================================================================

-- 1. Create assessments table for Year-Specific Configurations
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  academic_year TEXT NOT NULL UNIQUE CHECK (academic_year IN ('1st Year', '2nd Year', '3rd Year', '4th Year')),
  duration_minutes INTEGER DEFAULT 20,
  total_questions INTEGER DEFAULT 15,
  platinum_threshold NUMERIC(5, 2) DEFAULT 85.00,
  gold_threshold NUMERIC(5, 2) DEFAULT 70.00,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Extend readiness_questions table
ALTER TABLE public.readiness_questions 
  ADD COLUMN IF NOT EXISTS assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS academic_year TEXT DEFAULT '1st Year',
  ADD COLUMN IF NOT EXISTS marks INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- 3. Extend readiness_attempts table
ALTER TABLE public.readiness_attempts
  ADD COLUMN IF NOT EXISTS assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS academic_year TEXT DEFAULT '1st Year',
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'timed_out', 'expired')),
  ADD COLUMN IF NOT EXISTS percentage NUMERIC(5, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rank TEXT CHECK (rank IN ('Platinum', 'Gold', 'Silver')),
  ADD COLUMN IF NOT EXISTS category_scores JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS time_spent_seconds INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tab_switch_count INTEGER DEFAULT 0;

-- 4. Extend readiness_answers table
ALTER TABLE public.readiness_answers
  ADD COLUMN IF NOT EXISTS marks_awarded NUMERIC(5, 2) DEFAULT 0;

-- Enable RLS & Policies
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_answers ENABLE ROW LEVEL SECURITY;

-- Service role policies & public read policies
DROP POLICY IF EXISTS "Assessments viewable by authenticated" ON public.assessments;
CREATE POLICY "Assessments viewable by authenticated" ON public.assessments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Questions viewable by authenticated" ON public.readiness_questions;
CREATE POLICY "Questions viewable by authenticated" ON public.readiness_questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Attempts manage by owner" ON public.readiness_attempts;
CREATE POLICY "Attempts manage by owner" ON public.readiness_attempts FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Answers manage by attempt owner" ON public.readiness_answers;
CREATE POLICY "Answers manage by attempt owner" ON public.readiness_answers FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.readiness_attempts 
    WHERE readiness_attempts.id = readiness_answers.attempt_id 
    AND readiness_attempts.user_id = auth.uid()
  )
);

-- ====================================================================
-- SEED ASSESSMENTS (1st Year, 2nd Year, 3rd Year, 4th Year)
-- ====================================================================
INSERT INTO public.assessments (title, description, academic_year, duration_minutes, total_questions, platinum_threshold, gold_threshold)
VALUES
  ('Year 1 Foundation & Quantitative Assessment', 'Evaluates fundamental mathematics, basic logical reasoning, introduction to programming concepts, and workplace communication basics.', '1st Year', 20, 15, 85.00, 70.00),
  ('Year 2 Data Structures & Systems Assessment', 'Evaluates core data structures, Object-Oriented Programming principles, DBMS fundamentals, and professional communication.', '2nd Year', 20, 15, 85.00, 70.00),
  ('Year 3 Algorithms & System Concepts Assessment', 'Evaluates algorithmic complexity, operating system concepts, SQL optimization, advanced logic, and technical interview communication.', '3rd Year', 20, 15, 85.00, 70.00),
  ('Year 4 Senior Engineering & System Design Assessment', 'Evaluates distributed system design, microservices, complex quantitative logic, code architecture, and executive technical presentation.', '4th Year', 20, 15, 85.00, 70.00)
ON CONFLICT (academic_year) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  duration_minutes = EXCLUDED.duration_minutes,
  total_questions = EXCLUDED.total_questions,
  platinum_threshold = EXCLUDED.platinum_threshold,
  gold_threshold = EXCLUDED.gold_threshold;

-- Clean existing seed questions to refresh with authentic academic questions
DELETE FROM public.readiness_questions WHERE academic_year IN ('1st Year', '2nd Year', '3rd Year', '4th Year');

-- ====================================================================
-- SEED QUESTIONS - YEAR 1 (15 Questions)
-- ====================================================================
INSERT INTO public.readiness_questions (academic_year, category, question_text, options, correct_option_index, explanation, difficulty, marks, order_index)
VALUES
-- Aptitude (Year 1)
('1st Year', 'Aptitude', 'If a train traveling at 60 km/h crosses a pole in 9 seconds, what is the length of the train in meters?', '["120m", "150m", "180m", "200m"]', 1, 'Speed = 60 * (5/18) = 50/3 m/s. Length = Speed * Time = (50/3) * 9 = 150 meters.', 'Easy', 1, 1),
('1st Year', 'Aptitude', 'What is the sum of the first 20 even positive integers?', '["200", "210", "420", "400"]', 2, 'Sum of first n even numbers is n(n + 1). For n=20, 20 * 21 = 420.', 'Easy', 1, 2),
('1st Year', 'Aptitude', 'A product marked at $80 is sold for $68. What is the percentage discount offered?', '["12%", "15%", "18%", "20%"]', 1, 'Discount = 80 - 68 = 12. Percentage = (12 / 80) * 100 = 15%.', 'Easy', 1, 3),
('1st Year', 'Aptitude', 'If 5 workers build a wall in 12 days, how many days will 10 workers take to build the same wall?', '["3 days", "6 days", "8 days", "10 days"]', 1, 'Workers * Days = Constant. 5 * 12 = 60 worker-days. Days for 10 workers = 60 / 10 = 6 days.', 'Easy', 1, 4),

-- Technical (Year 1)
('1st Year', 'Technical', 'Which data type is typically used to store a single character in C / C++ / Java?', '["string", "char", "float", "boolean"]', 1, 'The char primitive keyword represents a single 8-bit or 16-bit character unit.', 'Easy', 1, 5),
('1st Year', 'Technical', 'What is the binary representation of the decimal number 13?', '["1011", "1100", "1101", "1110"]', 2, '13 in binary: 8 + 4 + 0 + 1 = 1101_2.', 'Easy', 1, 6),
('1st Year', 'Technical', 'Which component of a computer system executes arithmetic and logic operations?', '["RAM", "Control Unit", "ALU", "Cache"]', 2, 'The Arithmetic Logic Unit (ALU) performs arithmetic calculations and logical decisions.', 'Easy', 1, 7),
('1st Year', 'Technical', 'In programming, what is a loop that never terminates called?', '["Recursive Loop", "Infinite Loop", "Deadlock", "Stack Overflow"]', 1, 'A loop whose exit condition is never satisfied is an infinite loop.', 'Easy', 1, 8),

-- Communication (Year 1)
('1st Year', 'Communication', 'Choose the sentence with correct subject-verb agreement:', '["Each of the students are attending", "Each of the students is attending", "Each of the students have attended", "Each of the students were attending"]', 1, '`Each` is a singular indefinite pronoun requiring the singular verb `is`.', 'Easy', 1, 9),
('1st Year', 'Communication', 'When emailing a professor or recruiter, what is the most professional subject line?', '["Hey check this out", "Inquiry Regarding Internship Application - John Doe", "Help needed urgently!!!", "Application"]', 1, 'A clear, structured subject line detailing purpose and full name is professional.', 'Easy', 1, 10),
('1st Year', 'Communication', 'What does active listening primarily involve during a professional interaction?', '["Planning your response while the other speaks", "Nodding, maintaining eye contact, and clarifying key points", "Interrupting to correct minor errors", "Remaining completely silent without feedback"]', 1, 'Active listening involves focused engagement, non-verbal cues, and reflective clarification.', 'Easy', 1, 11),

-- Problem Solving (Year 1)
('1st Year', 'Problem Solving', 'Look at the series: 2, 6, 12, 20, 30, ... What is the next number in the pattern?', '["36", "40", "42", "48"]', 2, 'Differences: +4, +6, +8, +10. Next difference is +12, so 30 + 12 = 42.', 'Medium', 1, 12),
('1st Year', 'Problem Solving', 'All cats are mammals. All mammals have lungs. Which statement is logically valid?', '["All mammals are cats", "All cats have lungs", "No cats have lungs", "Some mammals do not have lungs"]', 1, 'If A ⊂ B and B ⊂ C, then A ⊂ C (Transitive property of sets).', 'Medium', 1, 13),
('1st Year', 'Problem Solving', 'If RED is coded as 18-5-4, how is BLUE coded using letter positions in the alphabet?', '["2-12-21-5", "2-11-20-5", "3-12-21-6", "2-12-22-5"]', 0, 'B=2, L=12, U=21, E=5.', 'Easy', 1, 14),
('1st Year', 'Problem Solving', 'A algorithm processes 10 items in 2 seconds. Assuming linear time complexity O(N), how long will it take for 50 items?', '["5 seconds", "10 seconds", "15 seconds", "25 seconds"]', 1, 'O(N) linear ratio: 50 / 10 = 5x input -> 2 * 5 = 10 seconds.', 'Easy', 1, 15);


-- ====================================================================
-- SEED QUESTIONS - YEAR 2 (15 Questions)
-- ====================================================================
INSERT INTO public.readiness_questions (academic_year, category, question_text, options, correct_option_index, explanation, difficulty, marks, order_index)
VALUES
-- Aptitude (Year 2)
('2nd Year', 'Aptitude', 'Two pipes A and B can fill a tank in 20 and 30 minutes respectively. If both are opened together, how long will it take to fill?', '["10 minutes", "12 minutes", "15 minutes", "25 minutes"]', 1, 'Combined rate = (1/20) + (1/30) = (3+2)/60 = 5/60 = 1/12. Time = 12 minutes.', 'Medium', 1, 1),
('2nd Year', 'Aptitude', 'In how many different ways can the letters of the word "CANVAS" be arranged?', '["360", "720", "180", "120"]', 0, 'CANVAS has 6 letters with 2 A''s. Permutations = 6! / 2! = 720 / 2 = 360.', 'Medium', 1, 2),
('2nd Year', 'Aptitude', 'A card is drawn from a well-shuffled deck of 52 cards. What is the probability of drawing a Spade or an Ace?', '["16/52", "4/13", "17/52", "9/26"]', 0, 'Spades = 13, Aces = 4, Ace of Spades = 1. P(Spade ∪ Ace) = (13 + 4 - 1)/52 = 16/52 = 4/13.', 'Medium', 1, 3),
('2nd Year', 'Aptitude', 'The average age of a group of 8 students is 21 years. If a teacher aged 39 joins, what is the new average age?', '["22 years", "23 years", "24 years", "25 years"]', 1, 'Sum = 8 * 21 = 168. New Sum = 168 + 39 = 207. New Average = 207 / 9 = 23 years.', 'Medium', 1, 4),

-- Technical (Year 2)
('2nd Year', 'Technical', 'Which data structure operates on a Last In First Out (LIFO) protocol?', '["Queue", "Stack", "LinkedList", "Binary Tree"]', 1, 'Stack data structure enforces Last-In-First-Out access via push and pop.', 'Easy', 1, 5),
('2nd Year', 'Technical', 'What is the primary characteristic of Object-Oriented Encapsulation?', '["Creating new classes from existing ones", "Bundling data and methods while restricting direct access", "Allowing one function name to have multiple forms", "Executing tasks concurrently"]', 1, 'Encapsulation restricts direct state access by enclosing attributes with access modifiers/getters.', 'Easy', 1, 6),
('2nd Year', 'Technical', 'In SQL, which command is used to remove a table and its structure permanently from the database?', '["DELETE", "REMOVE", "DROP", "TRUNCATE"]', 2, '`DROP TABLE` deletes both data and the schema definition, whereas `TRUNCATE` removes only rows.', 'Easy', 1, 7),
('2nd Year', 'Technical', 'What is the average time complexity of searching for an element in a balanced Binary Search Tree (BST)?', '["O(1)", "O(log N)", "O(N)", "O(N log N)"]', 1, 'A balanced BST halves the search space at each step, yielding logarithmic O(log N) time.', 'Medium', 1, 8),

-- Communication (Year 2)
('2nd Year', 'Communication', 'In technical discussions, what does the STAR technique stand for when answering behavioral interview questions?', '["System, Task, Action, Result", "Situation, Task, Action, Result", "Strategy, Theory, Analysis, Review", "Statement, Test, Application, Reaction"]', 1, 'STAR stands for Situation, Task, Action, and Result.', 'Easy', 1, 9),
('2nd Year', 'Communication', 'Identify the most constructive response when receiving critical feedback on code review:', '["Defense your code aggressively", "Thank the reviewer, ask clarifying questions, and address valid points", "Ignore the comments and merge your branch", "Refuse to take further assignments"]', 1, 'Constructive feedback handling demonstrates emotional intelligence and engineering maturity.', 'Easy', 1, 10),
('2nd Year', 'Communication', 'Which tone is most suitable when detailing a system post-mortem report to cross-functional leaders?', '["Blameless, objective, and solution-focused", "Emotional and apologetic", "Highly academic with undefined jargon", "Dismissive of user impact"]', 0, 'Post-mortems require blameless objectivity, precise metrics, and actionable prevention steps.', 'Medium', 1, 11),

-- Problem Solving (Year 2)
('2nd Year', 'Problem Solving', 'A linked list has a loop. Which algorithm detects this loop in O(N) time and O(1) auxiliary memory space?', '["Dijkstra Algorithm", "Floyds Cycle Detection (Fast & Slow Pointers)", "Binary Search", "Kruskal Algorithm"]', 1, 'Floyd''s Tortoise and Hare algorithm detects linked list cycles using two pointers.', 'Medium', 1, 12),
('2nd Year', 'Problem Solving', 'Which sorting algorithm guarantees O(N log N) time complexity in the worst-case scenario?', '["Quick Sort", "Bubble Sort", "Merge Sort", "Insertion Sort"]', 2, 'Merge Sort consistently divides and merges arrays in O(N log N) time regardless of input order.', 'Medium', 1, 13),
('2nd Year', 'Problem Solving', 'Given array [4, 1, 2, 1, 2], where every element appears twice except for one. Which bitwise operator identifies the single element in O(N) time and O(1) space?', '["AND (&)", "OR (|)", "XOR (^)", "NOT (~)"]', 2, 'XORing identical numbers yields 0 (A ^ A = 0), leaving only the unique element.', 'Medium', 1, 14),
('2nd Year', 'Problem Solving', 'A hash table encounters a collision. What is the collision resolution method that probes sequential memory slots?', '["Separate Chaining", "Open Addressing with Linear Probing", "Double Hashing", "Re-hashing"]', 1, 'Linear probing searches consecutive array locations (i+1, i+2...) upon hash collision.', 'Medium', 1, 15);


-- ====================================================================
-- SEED QUESTIONS - YEAR 3 (15 Questions)
-- ====================================================================
INSERT INTO public.readiness_questions (academic_year, category, question_text, options, correct_option_index, explanation, difficulty, marks, order_index)
VALUES
-- Aptitude (Year 3)
('3rd Year', 'Aptitude', 'A seller marks up an item by 40% above cost price and then gives a discount of 25%. What is the net profit or loss percentage?', '["5% profit", "5% loss", "10% profit", "15% profit"]', 0, 'Cost = 100. Marked = 140. Selling = 140 * 0.75 = 105. Net Profit = (105 - 100)/100 = 5% profit.', 'Medium', 1, 1),
('3rd Year', 'Aptitude', 'At what time between 3 o''clock and 4 o''clock will the hands of a clock overlap?', '["3:15", "3:16 4/11 minutes", "3:18 minutes", "3:20 minutes"]', 1, 'At 3:00, hands are 15 minute spaces apart. Relative speed = 55/60 = 11/12 min spaces/min. Time = 15 / (11/12) = 180/11 = 16 4/11 mins past 3.', 'Hard', 1, 2),
('3rd Year', 'Aptitude', 'A container has 80 liters of pure milk. 8 liters are replaced with water, and this operation is performed twice in total. How much milk remains?', '["64.8 liters", "65.2 liters", "66.0 liters", "72.0 liters"]', 0, 'Remaining Milk = Initial * (1 - x/V)^n = 80 * (1 - 8/80)^2 = 80 * (0.9)^2 = 80 * 0.81 = 64.8 liters.', 'Hard', 1, 3),
('3rd Year', 'Aptitude', 'How many 4-digit numbers can be formed using digits 1, 2, 3, 4, 5 without repetition such that the number is divisible by 4?', '["24", "32", "16", "20"]', 0, 'Divisibility by 4 requires last 2 digits to be divisible by 4: 12, 24, 32, 52 (4 possibilities). For each, remaining 2 digits can be filled in 3 * 2 = 6 ways. Total = 4 * 6 = 24.', 'Hard', 1, 4),

-- Technical (Year 3)
('3rd Year', 'Technical', 'What does ACID stand for in Database Transaction Management?', '["Atomicity, Consistency, Isolation, Durability", "Access, Control, Integrity, Security", "Asynchronous, Concurrent, Indexed, Distributed", "Authentication, Authorization, Encryption, Auditing"]', 0, 'ACID parameters guarantee reliable relational database transaction processing.', 'Easy', 1, 5),
('3rd Year', 'Technical', 'Which CPU scheduling algorithm can lead to starvation for long processes?', '["Round Robin", "First-Come First-Served", "Shortest Job First (SJF)", "Priority Scheduling without Aging"]', 3, 'Priority scheduling without aging keeps executing higher priority tasks, starving lower priority ones indefinitely.', 'Medium', 1, 6),
('3rd Year', 'Technical', 'What is the primary difference between a process and a thread in an Operating System?', '["Processes share memory space; threads do not", "Threads share the memory space of their parent process", "Processes are managed by application code; threads by hardware", "Threads cannot execute concurrently"]', 1, 'Threads share heap, code, and global memory within a single parent process boundary.', 'Medium', 1, 7),
('3rd Year', 'Technical', 'What is the tightest worst-case time complexity of QuickSort when using a naive pivot selection (e.g. always first element) on an already sorted array?', '["O(N)", "O(N log N)", "O(N^2)", "O(2^N)"]', 2, 'Unbalanced partitions on pre-sorted input result in recursive depth of N, yielding quadratic O(N^2) complexity.', 'Medium', 1, 8),

-- Communication (Year 3)
('3rd Year', 'Communication', 'During an architectural design review, an engineer disagrees with your choice of database. What is the most effective approach?', '["Concede immediately to avoid conflict", "Present empirical benchmarks, trade-off analysis, and listen to alternative proposals objectively", "Tell them your decision is final", "Escalate to management without debate"]', 1, 'Engineers evaluate choices using benchmark data, trade-off analysis, and constructive active listening.', 'Medium', 1, 9),
('3rd Year', 'Communication', 'What is the core purpose of a Executive Summary in an engineering design document?', '["To list all source code line numbers", "To provide a concise, high-level overview of the problem, proposed solution, cost, and business impact for stakeholders", "To document user login credentials", "To serve as a user manual"]', 1, 'Executive summaries convey high-level objectives, architectural choices, and business impacts succinctly.', 'Easy', 1, 10),
('3rd Year', 'Communication', 'When delivering an technical talk to non-technical business leaders, which practice should be avoided?', '["Using real-world analogies", "Overloading slides with dense low-level code snippets and un-explained acronyms", "Highlighting key ROI and user experience metrics", "Inviting interactive questions"]', 1, 'Avoid dense code snippets and un-explained jargon when communicating with non-technical leaders.', 'Easy', 1, 11),

-- Problem Solving (Year 3)
('3rd Year', 'Problem Solving', 'What dynamic programming pattern solves the classic 0/1 Knapsack problem in O(N * W) pseudo-polynomial time?', '["Sliding Window", "Bottom-up Tabulation / Memoization", "Greedy Choice Strategy", "Two Pointers"]', 1, '0/1 Knapsack requires dynamic programming (tabulation/memoization) to check overlapping subproblems.', 'Medium', 1, 12),
('3rd Year', 'Problem Solving', 'In graph theory, which algorithm finds the shortest path from a single source node to all other nodes in a weighted graph with non-negative edge weights?', '["Dijkstra Algorithm", "Bellman-Ford Algorithm", "Floyd-Warshall Algorithm", "Kruskal Algorithm"]', 0, 'Dijkstra''s algorithm uses a priority queue to determine shortest single-source non-negative paths.', 'Medium', 1, 13),
('3rd Year', 'Problem Solving', 'Which relational algebra operation corresponds to combining rows from two tables based on a related column?', '["Projection", "Selection", "Join", "Union"]', 2, 'JOIN operators correlate tuples across relational entities based on join predicates.', 'Easy', 1, 14),
('3rd Year', 'Problem Solving', 'What is the maximum number of nodes in a full binary tree of height H (where root height = 0)?', '["2^H", "2^(H+1) - 1", "2^H + 1", "2^(H-1)"]', 1, 'Sum of geometric progression 1 + 2 + 4 + ... + 2^H = 2^(H+1) - 1.', 'Medium', 1, 15);


-- ====================================================================
-- SEED QUESTIONS - YEAR 4 (15 Questions)
-- ====================================================================
INSERT INTO public.readiness_questions (academic_year, category, question_text, options, correct_option_index, explanation, difficulty, marks, order_index)
VALUES
-- Aptitude (Year 4)
('4th Year', 'Aptitude', 'A sum of money compounded annually doubles in 4 years. In how many years will it become 8 times the original principal?', '["8 years", "12 years", "16 years", "20 years"]', 1, 'P becomes 2P in 4 yrs. (2P)^3 = 8P takes 4 * 3 = 12 years.', 'Hard', 1, 1),
('4th Year', 'Aptitude', 'Three dice are rolled simultaneously. What is the probability that the sum of the numbers shown is equal to 15?', '["10/216", "12/216", "15/216", "18/216"]', 0, 'Combinations for sum 15 with 3 dice: (6,6,3)[3], (6,5,4)[6], (5,5,5)[1]. Total favorable outcomes = 3 + 6 + 1 = 10. Probability = 10 / 216.', 'Hard', 1, 2),
('4th Year', 'Aptitude', 'A and B run a 1 km race. A beats B by 100 meters or 20 seconds. What is A''s time to complete the race?', '["160 seconds", "180 seconds", "200 seconds", "220 seconds"]', 1, 'B covers 100m in 20s -> B''s speed = 5 m/s. B takes 1000/5 = 200s for 1km. A''s time = 200 - 20 = 180 seconds.', 'Hard', 1, 3),
('4th Year', 'Aptitude', 'Find the remainder when 3^100 is divided by 7.', '["1", "2", "3", "4"]', 1, 'By Fermat''s Little Theorem: 3^6 ≡ 1 (mod 7). 100 = 6 * 16 + 4. 3^100 ≡ (3^6)^16 * 3^4 ≡ 1 * 81 ≡ 81 (mod 7) = 4 * 7 + 4? Wait 81 = 11*7 + 4? 3^4 = 81. 81 / 7 = 11 remainder 4. Let''s check: 3^1=3, 3^2=2, 3^3=6, 3^4=4. 3^100 = (3^3)^33 * 3 = (-1)^33 * 3 = -3 ≡ 4 (mod 7). Correct option is 4 (index 3).', 'Hard', 1, 4),

-- Technical (Year 4)
('4th Year', 'Technical', 'In distributed systems architecture, what does CAP Theorem state you must choose between during a network partition?', '["Consistency or Availability", "Latency or Throughput", "Security or Performance", "Storage or Computation"]', 0, 'CAP Theorem states a distributed system can guarantee at most two of Consistency, Availability, Partition Tolerance.', 'Hard', 1, 5),
('4th Year', 'Technical', 'Which architectural strategy decouples microservice communication by emitting domain events to an intermediary event bus?', '["Monolithic Shared Memory", "Event-Driven Architecture with Message Brokers", "Synchronous REST Polling", "Direct Database Mirroring"]', 1, 'Event-Driven Architecture uses brokers (Kafka/RabbitMQ) for asynchronous decoupled domain event publishing.', 'Medium', 1, 6),
('4th Year', 'Technical', 'What mechanism is commonly used in API Gateways to prevent DDoS attacks and enforce service quotas per client?', '["Database Normalization", "Distributed Rate Limiting (Token Bucket / Leaky Bucket)", "Circuit Breaker Pattern", "Cache Invalidation"]', 1, 'Rate limiting algorithms (Token Bucket/Leaky Bucket) throttle request volumes to protect API availability.', 'Medium', 1, 7),
('4th Year', 'Technical', 'In microservices design, what is the purpose of the Circuit Breaker pattern (e.g. Resilience4j)?', '["To encrypt network traffic", "To prevent cascading failures when a downstream dependency is degraded or unreachable", "To balance load evenly across instances", "To auto-scale container replicas"]', 1, 'Circuit Breakers fail-fast when downstream services experience high error rates, protecting upstream caller threads.', 'Hard', 1, 8),

-- Communication (Year 4)
('4th Year', 'Communication', 'You are presenting an architectural proposal to C-level executives. What is the optimal structure for your deck?', '["50 slides of un-formatted source code", "Executive Summary & Business ROI -> High-level System Architecture -> Risk & Mitigation -> Benchmark Comparison", "Deep dive into variable naming conventions", "Personal stories without metrics"]', 1, 'Executive decks lead with business impact/ROI, system architecture, risks/mitigations, and cost benchmarks.', 'Medium', 1, 9),
('4th Year', 'Communication', 'How should a Senior Tech Lead handle a critical P0 production outage call with client leadership?', '["Deny any responsibility", "Provide calm, transparent updates on status, immediate containment steps, estimated resolution ETA, and commit to post-mortem", "Blame the junior developer who pushed code", "Mute the line and wait for it to self-heal"]', 1, 'Senior engineering leaders communicate transparently with containment steps, status, and realistic ETAs.', 'Medium', 1, 10),
('4th Year', 'Communication', 'When conducting a technical interview as a senior peer, what is the key responsibility of the interviewer?', '["Trick the candidate with obscure trivia", "Create a welcoming environment, give clear problem statements, and evaluate problem-solving thought process", "Talk for 80% of the interview time", "Show off your own coding skills"]', 1, 'Interviewers create an encouraging environment to objectively evaluate candidate problem-solving and reasoning.', 'Easy', 1, 11),

-- Problem Solving (Year 4)
('4th Year', 'Problem Solving', 'Which caching strategy updates the cache and the backing database synchronously in a single transaction before returning success?', '["Write-Through Cache", "Write-Behind (Write-Back) Cache", "Cache-Aside (Lazy Loading)", "Read-Through Cache"]', 0, 'Write-Through cache synchronously writes data to both cache layer and persistent DB store.', 'Hard', 1, 12),
('4th Year', 'Problem Solving', 'Which consensus protocol is widely used in distributed key-value stores like etcd and Consul for leader election?', '["Raft Consensus Protocol", "Round Robin Routing", "Consistent Hashing", "LRU Eviction"]', 0, 'Raft provides strong consistency and fault-tolerant leader election in distributed systems.', 'Hard', 1, 13),
('4th Year', 'Problem Solving', 'In consistent hashing, what technique prevents hot-spotting and ensures uniform distribution of keys across physical nodes?', '["Virtual Nodes (Vnodes)", "B-Tree Indexing", "Double Hashing", "Linear Probing"]', 0, 'Virtual nodes map multiple tokens on the hash ring to each physical node, smoothing load distribution.', 'Hard', 1, 14),
('4th Year', 'Problem Solving', 'To find the median of a continuous stream of integers in O(1) time per query, which data structure pair is optimal?', '["Two Heaps (Max-Heap for lower half, Min-Heap for upper half)", "Single Stack", "Unsorted Array", "Binary Search Tree without balancing"]', 0, 'Two balanced heaps (Max-Heap and Min-Heap) keep track of upper and lower halves to yield median in O(1) time.', 'Hard', 1, 15);

-- Link question foreign keys to their assessment IDs
UPDATE public.readiness_questions q
SET assessment_id = a.id
FROM public.assessments a
WHERE q.academic_year = a.academic_year;

