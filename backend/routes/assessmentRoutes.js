import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://mziglrjymkuebzdrgayp.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_b8Wr6uPqsPLvdJQS7rpTSg_MlZeKXxN';

function getScopedClient(req) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false }
    });
  }
  return supabaseAdmin;
}

// Helper to normalize academic year strings
function normalizeAcademicYear(yearInput) {
  if (!yearInput) return '1st Year';
  const str = String(yearInput).trim().toLowerCase();
  if (str.includes('1') || str.includes('first')) return '1st Year';
  if (str.includes('2') || str.includes('second')) return '2nd Year';
  if (str.includes('3') || str.includes('third')) return '3rd Year';
  if (str.includes('4') || str.includes('fourth')) return '4th Year';
  return '1st Year';
}

// Helper to resolve student's academic year from user_metadata or semester in DB
async function getStudentAcademicYear(userId, reqUser) {
  if (reqUser?.user_metadata?.academic_year) {
    return normalizeAcademicYear(reqUser.user_metadata.academic_year);
  }

  try {
    const { data: profile } = await supabaseAdmin
      .from('student_profiles')
      .select('semester')
      .eq('user_id', userId)
      .maybeSingle();

    if (profile?.semester) {
      const sem = Number(profile.semester);
      if (sem >= 7) return '4th Year';
      if (sem >= 5) return '3rd Year';
      if (sem >= 3) return '2nd Year';
      return '1st Year';
    }
  } catch (err) {
    console.warn('[AssessmentRoutes] Warning resolving student semester:', err.message);
  }

  return '1st Year';
}

// Helper to calculate rank based on percentage score
function calculateRank(percentage) {
  const pct = Number(percentage) || 0;
  if (pct >= 85.0) return 'Platinum';
  if (pct >= 70.0) return 'Gold';
  return 'Silver';
}

// Helper to safely parse question options into an array
function safeParseOptions(opts) {
  if (Array.isArray(opts)) return opts;
  if (!opts) return [];
  if (typeof opts === 'string') {
    try {
      const parsed = JSON.parse(opts);
      if (Array.isArray(parsed)) return parsed;
      if (typeof parsed === 'string') {
        const doubleParsed = JSON.parse(parsed);
        if (Array.isArray(doubleParsed)) return doubleParsed;
      }
    } catch (e) {
      return opts.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  if (typeof opts === 'object') return Object.values(opts);
  return [];
}

// Helper to extract clean domain category (e.g. 'Aptitude', 'Technical', etc.)
function extractDomainCategory(categoryStr) {
  if (!categoryStr) return 'Aptitude';
  if (categoryStr.includes(' | ')) {
    return categoryStr.split(' | ')[1] || 'Aptitude';
  }
  const clean = categoryStr.trim();
  if (clean === '1st Year' || clean === '2nd Year' || clean === '3rd Year' || clean === '4th Year') {
    return 'Aptitude';
  }
  return clean;
}

const activeAttemptsMap = new Map();

// Default Question Bank Fallback if DB questions are unpopulated
const DEFAULT_QUESTION_BANK = [
  {
    id: 'q1',
    academic_year: 'All',
    category: 'Technical',
    question_text: 'What is the time complexity of searching an element in a balanced Binary Search Tree (BST)?',
    options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
    correct_option_index: 1,
    explanation: 'Searching in a balanced BST takes O(log N) time because half the remaining nodes are eliminated at each step.'
  },
  {
    id: 'q2',
    academic_year: 'All',
    category: 'Technical',
    question_text: 'Which data structure follows the Last-In, First-Out (LIFO) principle?',
    options: ['Queue', 'Stack', 'Array', 'Linked List'],
    correct_option_index: 1,
    explanation: 'A Stack strictly follows the LIFO principle where the last pushed element is popped first.'
  },
  {
    id: 'q3',
    academic_year: 'All',
    category: 'Aptitude',
    question_text: 'If a train 150m long passes a pole in 15 seconds, what is the speed of the train in km/h?',
    options: ['36 km/h', '40 km/h', '45 km/h', '50 km/h'],
    correct_option_index: 0,
    explanation: 'Speed = 150m / 15s = 10 m/s. 10 * (18/5) = 36 km/h.'
  },
  {
    id: 'q4',
    academic_year: 'All',
    category: 'Problem Solving',
    question_text: 'Which HTTP status code represents "Internal Server Error"?',
    options: ['200', '400', '404', '500'],
    correct_option_index: 3,
    explanation: 'HTTP status code 500 indicates a generic server error.'
  },
  {
    id: 'q5',
    academic_year: 'All',
    category: 'Communication',
    question_text: 'Which communication approach is most effective when explaining technical trade-offs to non-technical stakeholders?',
    options: ['Use deep technical jargon', 'Use clear analogies and business value impact', 'Avoid trade-off discussion', 'Send raw code diffs'],
    correct_option_index: 1,
    explanation: 'Clear analogies and articulating business impact bridge the gap with non-technical stakeholders.'
  }
];

// GET /api/assessment/current
// Returns current year-specific assessment & questions WITH ANSWER KEYS STRIPPED
router.get('/current', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Authoritatively resolve academic year for student
    const academicYear = await getStudentAcademicYear(userId, req.user);

    // 2. Query questions from database safely
    let { data: allQuestions, error: qError } = await supabaseAdmin
      .from('readiness_questions')
      .select('*')
      .order('created_at', { ascending: true });

    if (qError) {
      console.error('[AssessmentRoutes] Error fetching readiness questions:', qError.message);
      return res.status(500).json({ success: false, message: 'Failed to fetch assessment questions from database.' });
    }

    // Filter questions matching academicYear safely in JS
    let questions = (allQuestions || []).filter(q => {
      if (q.academic_year && String(q.academic_year).toLowerCase().includes(academicYear.toLowerCase())) return true;
      if (q.category && String(q.category).toLowerCase().includes(academicYear.toLowerCase())) return true;
      return false;
    });

    // Fallback: If no questions for exact year, use available questions or default bank
    if (!questions || questions.length === 0) {
      questions = (allQuestions && allQuestions.length > 0) ? allQuestions.slice(0, 15) : DEFAULT_QUESTION_BANK;
    }

    // 3. SECURE STRIPPING: Ensure no answer keys or explanations are exposed in response
    const sanitizedQuestions = questions.map((q) => {
      const domain = extractDomainCategory(q.category);
      return {
        id: q.id,
        category: domain,
        question: q.question_text || q.question || 'Assessment Question',
        options: safeParseOptions(q.options),
        academicYear
      };
    });

    // 4. Check for active or completed attempt
    const { data: attempts } = await supabaseAdmin
      .from('readiness_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    let activeAttempt = null;
    let latestResult = null;

    if (attempts && attempts.length > 0) {
      const latest = attempts[0];
      if (latest.category && latest.category.includes('IN_PROGRESS')) {
        const elapsed = Math.floor((Date.now() - new Date(latest.created_at).getTime()) / 1000);
        const durationSeconds = 20 * 60;
        if (elapsed < durationSeconds + 60) {
          activeAttempt = {
            attemptId: latest.id,
            startedAt: latest.created_at,
            elapsedSeconds: elapsed,
            remainingSeconds: Math.max(0, durationSeconds - elapsed)
          };
        } else {
          // Attempt expired - auto-mark in DB
          await supabaseAdmin
            .from('readiness_attempts')
            .update({ category: `${academicYear} | EXPIRED` })
            .eq('id', latest.id);
        }
      }

      // Find latest completed attempt
      const completed = attempts.find((a) => a.category && a.category.includes('SUBMITTED'));
      if (completed) {
        const parts = completed.category.split(' | ');
        const savedYear = parts[0] || academicYear;
        const savedRank = parts[1] || calculateRank(completed.score);
        const score = Number(completed.score) || 0;
        const correctCount = completed.correct_count || Math.round((score / 100) * (completed.total_questions || 15));
        const totalQuestions = completed.total_questions || 15;

        latestResult = {
          taken: true,
          attemptId: completed.id,
          academicYear: savedYear,
          score,
          percentage: score,
          rank: savedRank,
          correctCount,
          totalQuestions,
          submittedAt: completed.created_at,
          aptitudeScore: Math.min(100, Math.max(40, score + 5)),
          techScore: Math.min(100, Math.max(30, score - 5)),
          commScore: Math.min(100, Math.max(40, score)),
          problemSolvingScore: Math.min(100, Math.max(35, score + 2)),
          strengths: [
            score >= 70 ? 'Quantitative Logic & Structural Reasoning' : 'Basic Problem Solving',
            score >= 70 ? 'Domain Technical Competency' : 'Foundational Computing',
            'Professional Communication'
          ],
          weaknesses: [
            score < 85 ? 'Advanced Combinatorics & Edge Cases' : 'Niche System Optimization',
            score < 70 ? 'Technical Architecture Depth' : 'Distributed System Trade-offs'
          ],
          recommendations: [
            'Review target role roadmap milestones and practice core algorithmic patterns',
            'Engage with peer mock interviews to refine structured technical responses',
            'Deploy capstone technical projects demonstrating production-ready code quality'
          ]
        };
      }
    }

    return res.status(200).json({
      success: true,
      assessment: {
        title: `${academicYear} Career & Technical Readiness Assessment`,
        description: `Official standardized assessment tailored specifically for ${academicYear} engineering candidates.`,
        academicYear,
        durationMinutes: 20,
        totalQuestions: sanitizedQuestions.length,
        platinumThreshold: 85,
        goldThreshold: 70
      },
      questions: sanitizedQuestions,
      activeAttempt,
      latestResult
    });
  } catch (err) {
    console.error('[AssessmentRoutes] Error in GET /api/assessment/current:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving assessment.' });
  }
});

// POST /api/assessment/start
// Creates or resumes a server-authoritative assessment attempt
router.post('/start', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const academicYear = await getStudentAcademicYear(userId, req.user);

    // Check for existing active IN_PROGRESS attempt
    const { data: attempts } = await supabaseAdmin
      .from('readiness_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (attempts && attempts.length > 0) {
      const latest = attempts[0];
      if (latest.category && latest.category.includes('IN_PROGRESS')) {
        const elapsed = Math.floor((Date.now() - new Date(latest.created_at).getTime()) / 1000);
        const durationSeconds = 20 * 60;
        if (elapsed < durationSeconds + 60) {
          // Resume existing active attempt
          return res.status(200).json({
            success: true,
            message: 'Resuming active assessment attempt.',
            attemptId: latest.id,
            startedAt: latest.created_at,
            academicYear,
            durationMinutes: 20,
            remainingSeconds: Math.max(0, durationSeconds - elapsed)
          });
        } else {
          // Old attempt timed out - mark expired
          await supabaseAdmin
            .from('readiness_attempts')
            .update({ category: `${academicYear} | EXPIRED` })
            .eq('id', latest.id);
        }
      }
    }

    // Create a new attempt record
    const categoryTag = `${academicYear} | IN_PROGRESS`;
    const attemptId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : '00000000-0000-4000-a000-' + Date.now().toString(16).padStart(12, '0');
    const nowIso = new Date().toISOString();

    let newAttempt = null;
    const dbClient = getScopedClient(req);
    const { data: dbAttempt, error: createError } = await dbClient
      .from('readiness_attempts')
      .insert({
        id: attemptId,
        user_id: userId,
        category: categoryTag,
        score: 0,
        total_questions: 15,
        correct_count: 0
      })
      .select()
      .maybeSingle();

    if (createError || !dbAttempt) {
      console.warn('[AssessmentRoutes] Notice creating attempt in DB (using resilient fallback):', createError?.message);
      newAttempt = {
        id: attemptId,
        user_id: userId,
        category: categoryTag,
        created_at: nowIso
      };
      activeAttemptsMap.set(attemptId, newAttempt);
    } else {
      newAttempt = dbAttempt;
      activeAttemptsMap.set(newAttempt.id, newAttempt);
    }

    return res.status(201).json({
      success: true,
      message: 'Assessment attempt created.',
      attemptId: newAttempt.id,
      startedAt: newAttempt.created_at,
      academicYear,
      durationMinutes: 20,
      remainingSeconds: 20 * 60
    });
  } catch (err) {
    console.error('[AssessmentRoutes] Error in POST /api/assessment/start:', err);
    return res.status(500).json({ success: false, message: 'Server error starting assessment.' });
  }
});

// POST /api/assessment/submit
// Evaluates answers server-side, calculates percentage and rank, persists attempt, returns report with explanations
router.post('/submit', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    let { attemptId, answers, score: legacyScore, category: legacyCategory, timeSpentSeconds, tabSwitchCount } = req.body;

    if (!answers || typeof answers !== 'object') {
      answers = {};
    }

    // 1. Fetch attempt and verify ownership
    let attempt = null;

    if (attemptId) {
      const { data: dbAttempt } = await supabaseAdmin
        .from('readiness_attempts')
        .select('*')
        .eq('id', attemptId)
        .maybeSingle();

      if (dbAttempt) {
        attempt = dbAttempt;
      } else if (activeAttemptsMap.has(attemptId)) {
        attempt = activeAttemptsMap.get(attemptId);
      }
    }

    // Auto-create attempt if missing or not passed in body
    if (!attempt) {
      const academicYear = await getStudentAcademicYear(userId, req.user);
      const isUuid = (id) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      attemptId = isUuid(attemptId) ? attemptId : ((typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : '00000000-0000-4000-a000-' + Date.now().toString(16).padStart(12, '0'));
      const nowIso = new Date().toISOString();

      const { data: createdAttempt } = await supabaseAdmin
        .from('readiness_attempts')
        .insert({
          id: attemptId,
          user_id: userId,
          category: `${academicYear} | IN_PROGRESS`,
          score: Number(legacyScore) || 0,
          total_questions: 15,
          correct_count: 0
        })
        .select('*')
        .maybeSingle();

      attempt = createdAttempt || {
        id: attemptId,
        user_id: userId,
        category: `${academicYear} | IN_PROGRESS`,
        score: Number(legacyScore) || 0,
        created_at: nowIso
      };
      activeAttemptsMap.set(attempt.id, attempt);
    }

    // Authorization: Attempt must belong to authenticated student
    if (attempt.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized attempt submission.' });
    }

    // Attempt must not be already finalized
    if (attempt.category && attempt.category.includes('SUBMITTED')) {
      return res.status(400).json({ success: false, message: 'This assessment attempt has already been submitted and finalized.' });
    }

    // Check expiry: 20-minute limit + 5-minute network latency grace period
    const elapsedSeconds = Math.floor((Date.now() - new Date(attempt.created_at).getTime()) / 1000);
    const maxAllowedSeconds = 25 * 60;
    if (elapsedSeconds > maxAllowedSeconds) {
      const yearPrefix = attempt.category.split(' | ')[0] || '1st Year';
      await supabaseAdmin
        .from('readiness_attempts')
        .update({ category: `${yearPrefix} | EXPIRED` })
        .eq('id', attemptId);
      return res.status(400).json({
        success: false,
        message: 'Assessment attempt has expired. The time limit of 20 minutes was exceeded.'
      });
    }

    // 2. Fetch questions with answer keys directly from DB for the attempt's year
    const attemptAcademicYear = attempt.category.split(' | ')[0] || await getStudentAcademicYear(userId, req.user);
    let { data: allQuestions, error: qError } = await supabaseAdmin
      .from('readiness_questions')
      .select('*')
      .order('created_at', { ascending: true });

    let questions = (allQuestions || []).filter(q => {
      if (q.academic_year && String(q.academic_year).toLowerCase().includes(attemptAcademicYear.toLowerCase())) return true;
      if (q.category && String(q.category).toLowerCase().includes(attemptAcademicYear.toLowerCase())) return true;
      return false;
    });

    if (!questions || questions.length === 0) {
      questions = (allQuestions && allQuestions.length > 0) ? allQuestions.slice(0, 15) : DEFAULT_QUESTION_BANK;
    }

    // 3. SERVER-SIDE SCORING: Evaluate each answer strictly on the backend
    let correctCount = 0;
    const categoryBreakdown = {
      Aptitude: { correct: 0, total: 0 },
      Technical: { correct: 0, total: 0 },
      Communication: { correct: 0, total: 0 },
      'Problem Solving': { correct: 0, total: 0 }
    };
    const answerRecords = [];
    const questionReviewList = [];

    questions.forEach((q) => {
      const domain = extractDomainCategory(q.category);
      if (!categoryBreakdown[domain]) {
        categoryBreakdown[domain] = { correct: 0, total: 0 };
      }
      categoryBreakdown[domain].total += 1;

      const userSelected = answers[q.id];
      const isCorrect = userSelected !== undefined && Number(userSelected) === Number(q.correct_option_index);

      if (isCorrect) {
        correctCount += 1;
        categoryBreakdown[domain].correct += 1;
      }

      answerRecords.push({
        attempt_id: attemptId,
        question_id: q.id,
        selected_option_index: userSelected !== undefined ? Number(userSelected) : -1,
        is_correct: isCorrect
      });

      // Prepare question review with concept explanations ONLY post-submission
      questionReviewList.push({
        id: q.id,
        category: domain,
        question: q.question_text || q.question || 'Assessment Question',
        options: safeParseOptions(q.options),
        selectedOption: userSelected !== undefined ? Number(userSelected) : null,
        correctOption: q.correct_option_index,
        explanation: q.explanation || 'Review standard concepts for this topic.',
        isCorrect
      });
    });

    const totalQuestions = questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const rank = calculateRank(percentage);

    // Compute domain percentage scores
    const domainScores = {};
    Object.keys(categoryBreakdown).forEach((d) => {
      const item = categoryBreakdown[d];
      domainScores[d] = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
    });

    // 4. Update attempt in Supabase Database if valid UUID
    const finalCategoryTag = `${attemptAcademicYear} | ${rank} | SUBMITTED | ${percentage}%`;
    const dbClient = getScopedClient(req);
    try {
      await dbClient
        .from('readiness_attempts')
        .update({
          score: percentage,
          total_questions: totalQuestions,
          correct_count: correctCount,
          category: finalCategoryTag
        })
        .eq('id', attemptId);
    } catch (updateErr) {
      console.warn('[AssessmentRoutes] Notice updating attempt record:', updateErr.message);
    }

    // 5. Persist answer records safely
    if (answerRecords.length > 0) {
      try {
        await dbClient
          .from('readiness_answers')
          .insert(answerRecords);
      } catch (ansEx) {
        console.warn('[AssessmentRoutes] Notice logging answer records:', ansEx.message);
      }
    }

    // 6. Build Comprehensive Server Evaluation Report
    const report = {
      success: true,
      taken: true,
      attemptId,
      academicYear: attemptAcademicYear,
      score: percentage,
      percentage,
      rank,
      correctCount,
      totalQuestions,
      submittedAt: new Date().toISOString(),
      timeSpentSeconds: timeSpentSeconds || 0,
      tabSwitchCount: tabSwitchCount || 0,
      aptitudeScore: domainScores.Aptitude ?? percentage,
      techScore: domainScores.Technical ?? percentage,
      commScore: domainScores.Communication ?? percentage,
      problemSolvingScore: domainScores['Problem Solving'] ?? percentage,
      strengths: [
        (domainScores.Aptitude || 0) >= 70 ? 'Quantitative Deduction & Problem Solving' : 'Analytical Aptitude Fundamentals',
        (domainScores.Technical || 0) >= 70 ? 'Core Computer Science & Architecture' : 'Foundational Technical Computing',
        (domainScores.Communication || 0) >= 70 ? 'Professional Communication & STAR Technique' : 'Constructive Communication'
      ],
      weaknesses: [
        (domainScores.Aptitude || 0) < 70 ? 'Speed Math & Probability Formulations' : 'Edge-case Combinatorics',
        (domainScores.Technical || 0) < 70 ? 'ACID Boundaries & Database Optimization' : 'High-Scale Distributed Systems',
        (domainScores.Communication || 0) < 70 ? 'Executive Summaries & Stakeholder Presentation' : 'Cross-functional Alignment'
      ],
      recommendations: [
        'Focus practice on targeted algorithmic patterns corresponding to your target dream role',
        'Review the System Design Primer and database transaction isolation trade-offs',
        'Build and deploy a production-ready capstone project to highlight software engineering craftsmanship'
      ],
      questions: questionReviewList
    };

    return res.status(200).json(report);
  } catch (err) {
    console.error('[AssessmentRoutes] Error in POST /api/assessment/submit:', err);
    return res.status(500).json({ success: false, message: 'Server error scoring assessment attempt.' });
  }
});

// GET /api/assessment/my-latest-result & /api/assessment/results
const getAssessmentResultsHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const dbClient = getScopedClient(req);

    const { data: attempts } = await dbClient
      .from('readiness_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const completed = attempts?.find((a) => a.category && a.category.includes('SUBMITTED'));

    if (!completed) {
      return res.status(200).json({ success: true, result: null, attempts: attempts || [] });
    }

    const parts = completed.category.split(' | ');
    const academicYear = parts[0] || '1st Year';
    const rank = parts[1] || calculateRank(completed.score);
    const score = Number(completed.score) || 0;

    return res.status(200).json({
      success: true,
      attempts: attempts || [],
      result: {
        taken: true,
        attemptId: completed.id,
        academicYear,
        score,
        percentage: score,
        rank,
        correctCount: completed.correct_count || Math.round((score / 100) * (completed.total_questions || 15)),
        totalQuestions: completed.total_questions || 15,
        submittedAt: completed.created_at,
        aptitudeScore: Math.min(100, Math.max(40, score + 5)),
        techScore: Math.min(100, Math.max(30, score - 5)),
        commScore: Math.min(100, Math.max(40, score)),
        problemSolvingScore: Math.min(100, Math.max(35, score + 2)),
        strengths: ['Quantitative Logic & Structural Reasoning', 'Domain Technical Competency', 'Professional Communication'],
        weaknesses: ['Advanced Optimization & Architecture', 'Edge Case Systems'],
        recommendations: [
          'Practice target role roadmap milestones and advanced algorithmic patterns',
          'Deploy full-stack projects demonstrating software mastery'
        ]
      }
    });
  } catch (err) {
    console.error('[AssessmentRoutes] Error fetching assessment results:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching assessment results.' });
  }
};

router.get('/my-latest-result', authenticateUser, getAssessmentResultsHandler);
router.get('/results', authenticateUser, getAssessmentResultsHandler);
router.get('/history', authenticateUser, getAssessmentResultsHandler);

export default router;
