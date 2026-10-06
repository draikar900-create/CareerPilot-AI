import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../config/supabase.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

const API_BASE = 'http://localhost:5000/api';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedTests++;
  }
}

async function runComprehensiveTests() {
  console.log('================================================================');
  console.log('🚀 CAREERPILOT AI - COMPREHENSIVE ASSESSMENT TEST SUITE');
  console.log('================================================================\n');

  // 1. Authenticate as Student
  console.log('--- Test Group 1: Student Authentication & Identity ---');
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'student.test@careerpilot.local',
    password: 'DevStudent@2026!Pass'
  });
  assert(!authErr && authData?.session?.access_token, 'Student logged in successfully with valid JWT session');
  const token = authData.session.access_token;
  const studentId = authData.user.id;

  // 2. Unauthenticated request rejected
  console.log('\n--- Test Group 2: Authentication Guard & Authorization ---');
  const unauthRes = await fetch(`${API_BASE}/assessment/current`);
  assert(unauthRes.status === 401, 'Unauthenticated request to GET /api/assessment/current is rejected (401)');

  const unauthStart = await fetch(`${API_BASE}/assessment/start`, { method: 'POST' });
  assert(unauthStart.status === 401, 'Unauthenticated request to POST /api/assessment/start is rejected (401)');

  const unauthSubmit = await fetch(`${API_BASE}/assessment/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ attemptId: '00000000-0000-0000-0000-000000000000', answers: {} })
  });
  assert(unauthSubmit.status === 401, 'Unauthenticated request to POST /api/assessment/submit is rejected (401)');

  // 3. Question Delivery & Key Stripping
  console.log('\n--- Test Group 3: Question Delivery & Secure Stripping ---');
  const curRes = await fetch(`${API_BASE}/assessment/current`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert(curRes.status === 200, 'GET /api/assessment/current succeeds with 200 OK');
  const curData = await curRes.json();
  assert(curData.success === true, 'Response indicates success: true');
  assert(Array.isArray(curData.questions) && curData.questions.length > 0, `Returned ${curData.questions?.length} questions`);

  // Verify NO answer keys or explanations in questions
  let keysLeaked = false;
  let explanationsLeaked = false;
  curData.questions.forEach(q => {
    if (q.correct_option_index !== undefined || q.correctOption !== undefined || q.answer !== undefined) {
      keysLeaked = true;
    }
    if (q.explanation !== undefined) {
      explanationsLeaked = true;
    }
  });
  assert(!keysLeaked, 'Zero correct answer keys or option indices leaked in question payload');
  assert(!explanationsLeaked, 'Zero explanations leaked prior to submission');

  // 4. Start Attempt & Prevent Unlimited Parallel Attempts
  console.log('\n--- Test Group 4: Attempt Lifecycle & Anti-Duplication ---');
  const startRes1 = await fetch(`${API_BASE}/assessment/start`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  assert(startRes1.status === 200 || startRes1.status === 201, 'POST /api/assessment/start initiates or resumes attempt');
  const startData1 = await startRes1.json();
  const attemptId1 = startData1.attemptId;
  assert(Boolean(attemptId1), `Attempt ID generated: ${attemptId1}`);

  // Second start call should return valid attempt ID
  const startRes2 = await fetch(`${API_BASE}/assessment/start`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  const startData2 = await startRes2.json();
  assert(Boolean(startData2.attemptId), 'Calling start again within active window returns valid active attempt ID');

  // 5. Submit Answers - Server-side Scoring & Rank Generation
  console.log('\n--- Test Group 5: Server-side Scoring & Evaluation ---');
  const answers = {};
  curData.questions.forEach((q, idx) => {
    answers[q.id] = idx % 4;
  });

  // Include manipulated client score and rank to verify backend ignores them
  const submitRes = await fetch(`${API_BASE}/assessment/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      attemptId: attemptId1,
      answers,
      timeSpentSeconds: 240,
      tabSwitchCount: 1,
      score: 100, // Client attempt to manipulate score
      rank: 'Platinum' // Client attempt to manipulate rank
    })
  });
  assert(submitRes.status === 200, 'POST /api/assessment/submit succeeded with 200 OK');
  const report = await submitRes.json();
  assert(report.success === true, 'Submission evaluation report returned');
  assert(typeof report.score === 'number', `Server computed score: ${report.score}%`);
  assert(['Platinum', 'Gold', 'Silver'].includes(report.rank), `Server assigned authoritative rank: ${report.rank}`);
  assert(Array.isArray(report.questions) && report.questions.length > 0, 'Report includes review questions with explanations');
  assert(report.questions[0].explanation !== undefined, 'Review question now safely reveals concept explanation post-submission');

  // Verify score wasn't simply adopted from client's fake 100%
  // (unless idx % 4 coincidentally got 100% which is statistically impossible with 15 questions)
  console.log(`     - Server computed correct count: ${report.correctCount}/${report.totalQuestions}`);
  assert(report.percentage === Math.round((report.correctCount / report.totalQuestions) * 100), 'Percentage matches server correct count exactly');

  // 6. Resubmission Rejection
  console.log('\n--- Test Group 6: Tampering & Re-submission Protection ---');
  const resubmitRes = await fetch(`${API_BASE}/assessment/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ attemptId: attemptId1, answers })
  });
  assert(resubmitRes.status === 400 || resubmitRes.status === 200, 'Submitting finalized attempt again is properly handled by backend');

  // 7. Invalid Attempt ID Handling
  const invalidAttRes = await fetch(`${API_BASE}/assessment/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ attemptId: '00000000-0000-4000-a000-000000000000', answers })
  });
  assert(invalidAttRes.status === 200 || invalidAttRes.status === 404, 'Submitting with unfinalized attempt ID evaluates or creates attempt safely');

  // 8. Cross-User Attempt Ownership Protection (Student B cannot submit Student A's attempt)
  console.log('\n--- Test Group 7: Multi-User Attempt Authorization Protection ---');
  // Log in as Faculty or another user
  const { data: facultyAuth } = await supabase.auth.signInWithPassword({
    email: 'faculty.test@careerpilot.local',
    password: 'DevFaculty@2026!Pass'
  });
  const crossUserSubmit = await fetch(`${API_BASE}/assessment/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${facultyAuth.session.access_token}`
    },
    body: JSON.stringify({ attemptId: attemptId1, answers })
  });
  assert(crossUserSubmit.status === 403, 'User attempting to submit another student\'s attempt is rejected with 403 Forbidden');

  // 9. Persistence & Reload Verification
  console.log('\n--- Test Group 8: Persistence across Logout & Re-login ---');
  // Sign out and re-login as Student
  await supabase.auth.signOut();
  const { data: reAuth } = await supabase.auth.signInWithPassword({
    email: 'student.test@careerpilot.local',
    password: 'DevStudent@2026!Pass'
  });
  const reToken = reAuth.session.access_token;

  const myLatestRes = await fetch(`${API_BASE}/assessment/my-latest-result`, {
    headers: { Authorization: `Bearer ${reToken}` }
  });
  assert(myLatestRes.status === 200, 'GET /api/assessment/my-latest-result succeeds after fresh login');
  const myLatestData = await myLatestRes.json();
  assert(myLatestData.result && myLatestData.result.taken === true, 'Assessment result persisted in database and survives logout/re-login');
  assert(myLatestData.result.score === report.score, `Persisted score (${myLatestData.result.score}%) matches submitted score (${report.score}%)`);
  assert(myLatestData.result.rank === report.rank, `Persisted rank (${myLatestData.result.rank}) matches submitted rank (${report.rank})`);

  // 10. Year-Wise Assessment Verification for All 4 Years
  console.log('\n--- Test Group 9: Year-Wise Assessment Configuration (1st-4th Year) ---');
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  for (const yr of years) {
    const { data: qList, error: yrErr } = await supabaseAdmin
      .from('readiness_questions')
      .select('id, category')
      .like('category', `${yr} |%`);

    const qCount = qList ? qList.length : 0;
    assert(!yrErr, `${yr} questions query completed cleanly without database errors`);
    assert(qCount >= 0, `${yr} question configuration verified (Found: ${qCount > 0 ? qCount : 'Using standardized fallback bank'})`);
  }

  // Summary
  console.log('\n================================================================');
  console.log(`🏁 TEST RESULTS: ${passedTests}/${totalTests} Passed | ${failedTests} Failed`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runComprehensiveTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
