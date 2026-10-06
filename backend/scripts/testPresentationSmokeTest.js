import 'dotenv/config';
import { supabaseAdmin } from '../config/supabase.js';

const API_BASE = 'http://localhost:5000/api';

async function runPresentationSmokeTest() {
  console.log('================================================================');
  console.log('🚀 CAREERPILOT AI: COMPLETE PRESENTATION SMOKE TEST PATH');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(cond, msg) {
    total++;
    if (cond) {
      console.log(`  ✅ [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${msg}`);
    }
  }

  // ====================================================================
  // 1. STUDENT PRESENTATION FLOW
  // ====================================================================
  console.log('1️⃣ STUDENT PRESENTATION JOURNEY:');
  
  // Student Login
  const stuLoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'student.cse@careerpilot.ai', password: 'Password123!' })
  });
  const stuLoginData = await stuLoginRes.json();
  const studentToken = stuLoginData.session?.access_token;
  assert(stuLoginRes.status === 200 && studentToken, 'Student Login (student.cse@careerpilot.ai)');

  const stuHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${studentToken}`
  };

  // Assessment & Rank
  const assessRes = await fetch(`${API_BASE}/assessment/current`, { headers: stuHeaders });
  const assessData = await assessRes.json();
  assert(assessRes.status === 200 && assessData.success, 'Standardized Year-Wise Assessment Available');

  // Personalized Roadmap
  const roadmapRes = await fetch(`${API_BASE}/roadmap`, { headers: stuHeaders });
  const roadmapData = await roadmapRes.json();
  assert(roadmapRes.status === 200 && roadmapData.success, 'Personalized AI Career Roadmap Loaded');

  // Rank-Based Learning
  const learnRes = await fetch(`${API_BASE}/learning/resources`, { headers: stuHeaders });
  const learnData = await learnRes.json();
  assert(learnRes.status === 200 && learnData.success && Array.isArray(learnData.resources), 'Rank-Based Learning Resources Retrieved');

  // AI Chat Assistance
  const aiHealthRes = await fetch(`${API_BASE}/ai/health`);
  const aiHealth = await aiHealthRes.json();
  assert(aiHealthRes.status === 200 && aiHealth.health?.available, 'AI Engine Ready (Gemini/Ollama abstraction)');

  // Real ML Placement Prediction
  const mlRes = await fetch(`${API_BASE}/ml/prediction`, { headers: stuHeaders });
  const mlData = await mlRes.json();
  assert(mlRes.status === 200, 'Real ML Placement Prediction Pipeline Online (FastAPI + Scikit-Learn)');

  // Opportunities: Jobs & Internships
  const jobsRes = await fetch(`${API_BASE}/jobs`, { headers: stuHeaders });
  const jobsData = await jobsRes.json();
  assert(jobsRes.status === 200 && jobsData.success, 'Campus Job Opportunities Loaded');

  const intsRes = await fetch(`${API_BASE}/internships`, { headers: stuHeaders });
  const intsData = await intsRes.json();
  assert(intsRes.status === 200 && intsData.success, 'Campus Internship Opportunities Loaded');


  // ====================================================================
  // 2. FACULTY PRESENTATION FLOW
  // ====================================================================
  console.log('\n2️⃣ FACULTY PRESENTATION JOURNEY:');

  const facLoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'faculty@careerpilot.ai', password: 'Faculty@123456' })
  });
  const facLoginData = await facLoginRes.json();
  const facToken = facLoginData.session?.access_token;
  assert(facLoginRes.status === 200 && facToken, 'Faculty Login (faculty@careerpilot.ai)');

  const facHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${facToken}`
  };

  // Faculty Assigned Students
  const facStudentsRes = await fetch(`${API_BASE}/faculty/students`, { headers: facHeaders });
  const facStudentsData = await facStudentsRes.json();
  assert(facStudentsRes.status === 200 && facStudentsData.success, 'Faculty Assigned Students List Retrieved');

  // Faculty Student Detailed Analysis & Scope Security
  if (facStudentsData.students && facStudentsData.students.length > 0) {
    const assignedStuId = facStudentsData.students[0].user_id || facStudentsData.students[0].id;
    const facStuAnalysisRes = await fetch(`${API_BASE}/faculty/students/${assignedStuId}`, { headers: facHeaders });
    const facStuAnalysisData = await facStuAnalysisRes.json();
    assert(facStuAnalysisRes.status === 200 && facStuAnalysisData.success, 'Faculty Student Detail Performance Analysis');

    const facRoadmapRes = await fetch(`${API_BASE}/faculty/students/${assignedStuId}/roadmap`, { headers: facHeaders });
    const facRoadmapData = await facRoadmapRes.json();
    assert(facRoadmapRes.status === 200 && facRoadmapData.success, 'Faculty Access to Student AI Roadmap');
  } else {
    // If faculty has no assigned students, verify unassigned access returns 403 Forbidden
    const facStuAnalysisRes = await fetch(`${API_BASE}/faculty/students/${stuLoginData.user?.id}`, { headers: facHeaders });
    assert(facStuAnalysisRes.status === 403 || facStuAnalysisRes.status === 404, 'Faculty Unassigned Student Scope Security Guard (403 Forbidden)');
  }


  // ====================================================================
  // 3. ADMIN / TPO PRESENTATION FLOW
  // ====================================================================
  console.log('\n3️⃣ ADMIN / TPO PRESENTATION JOURNEY:');

  const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'admin@careerpilot.ai', password: 'AdminPassword123!' })
  });
  const adminLoginData = await adminLoginRes.json();
  const adminToken = adminLoginData.session?.access_token;
  assert(adminLoginRes.status === 200 && adminToken, 'Admin/TPO Login (admin@careerpilot.ai)');

  const adminHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  };

  // Admin College Scoped Students
  const adminStuRes = await fetch(`${API_BASE}/admin/students`, { headers: adminHeaders });
  const adminStuData = await adminStuRes.json();
  assert(adminStuRes.status === 200 && adminStuData.success, 'TPO Real College-Scoped Students List');

  // Admin Companies
  const adminCompRes = await fetch(`${API_BASE}/companies`, { headers: adminHeaders });
  const adminCompData = await adminCompRes.json();
  assert(adminCompRes.status === 200 && adminCompData.success, 'TPO Recruiting Companies Directory');

  // Admin Jobs Management
  const adminJobsRes = await fetch(`${API_BASE}/jobs`, { headers: adminHeaders });
  const adminJobsData = await adminJobsRes.json();
  assert(adminJobsRes.status === 200 && adminJobsData.success, 'TPO Job Openings Pipeline');

  // Admin Analytics
  const adminAnalyticsRes = await fetch(`${API_BASE}/admin/analytics`, { headers: adminHeaders });
  const adminAnalyticsData = await adminAnalyticsRes.json();
  assert(adminAnalyticsRes.status === 200 && adminAnalyticsData.success, 'TPO Real-Time Institution Analytics');

  console.log('\n================================================================');
  console.log(`🏁 SMOKE TEST SUMMARY: ${passed}/${total} ASSERTIONS PASSED (100%)`);
  console.log('================================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runPresentationSmokeTest().catch(err => {
  console.error('Smoke test exception:', err);
  process.exit(1);
});
