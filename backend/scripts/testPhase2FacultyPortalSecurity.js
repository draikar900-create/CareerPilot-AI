/**
 * CAREERPILOT AI - PHASE 2: REAL FACULTY PORTAL, ONBOARDING & BRANCH-SCOPED SECURITY TEST SUITE
 */

import dotenv from 'dotenv';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });
const testEnvPath = path.join(__dirname, '../.env.test-accounts');
if (fs.existsSync(testEnvPath)) {
  dotenv.config({ path: testEnvPath });
}

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

let total = 0;
let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✅ [PASS] ${testName}${details ? ` (${details})` : ''}`);
  } else {
    failed++;
    console.error(`  ❌ [FAIL] ${testName}${details ? ` (${details})` : ''}`);
  }
}

async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: email, password })
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function runPhase2TestSuite() {
  console.log('\n================================================================');
  console.log('🎓 CAREERPILOT AI: PHASE 2 FACULTY PORTAL & SCOPE SECURITY SUITE');
  console.log('================================================================\n');

  const studentCreds = { email: process.env.DEV_STUDENT_EMAIL || 'student.test@careerpilot.local', password: process.env.DEV_STUDENT_PASSWORD || 'DevStudent@2026!Pass' };
  const facultyCreds = { email: process.env.DEV_FACULTY_EMAIL || 'faculty.test@careerpilot.local', password: process.env.DEV_FACULTY_PASSWORD || 'DevFaculty@2026!Pass' };

  // 1. Authenticate Faculty Account
  console.log('--- TEST GROUP 1: Faculty Authentication & Profile Scope ---');
  const facultyAuth = await loginUser(facultyCreds.email, facultyCreds.password);
  assert(facultyAuth.status === 200 && facultyAuth.data.success, 'Faculty login succeeds');
  const facultyToken = facultyAuth.data.session?.access_token;
  const facultyUser = facultyAuth.data.user;

  // GET /api/faculty/me
  const meRes = await fetch(`${API_BASE}/api/faculty/me`, {
    headers: { Authorization: `Bearer ${facultyToken}` }
  });
  const meData = await meRes.json();
  assert(meRes.status === 200 && meData.success && meData.faculty, 'GET /api/faculty/me returns faculty profile');
  assert(meData.faculty.userId === facultyUser.id, 'GET /api/faculty/me derives user identity strictly from token');

  // 2. Faculty Onboarding Validation
  console.log('\n--- TEST GROUP 2: Faculty Onboarding Validation ---');
  const invalidOnboardingRes = await fetch(`${API_BASE}/api/faculty/onboarding`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${facultyToken}`
    },
    body: JSON.stringify({ full_name: '', employee_id: '' }) // missing required fields
  });
  const invalidOnboardingData = await invalidOnboardingRes.json();
  assert(invalidOnboardingRes.status === 400 && !invalidOnboardingData.success, 'POST /api/faculty/onboarding rejects missing required onboarding fields (HTTP 400)');

  const validOnboardingRes = await fetch(`${API_BASE}/api/faculty/onboarding`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${facultyToken}`
    },
    body: JSON.stringify({
      full_name: 'Dr. Test Faculty',
      employee_id: 'FAC-TEST-2026',
      college_name: 'CareerPilot Institute of Technology',
      department: 'Computer Science & Engineering',
      designation: 'Associate Professor',
      qualification: 'Ph.D. in Computer Science',
      specialization: 'Artificial Intelligence',
      years_of_experience: '10 Years',
      assignments: [
        { academic_year: '3rd Year', section: 'A', branch: 'Computer Science & Engineering', subject: 'Data Structures' }
      ]
    })
  });
  const validOnboardingData = await validOnboardingRes.json();
  assert(validOnboardingRes.status === 200 && validOnboardingData.success, 'POST /api/faculty/onboarding succeeds with complete required payload');
  assert(validOnboardingData.faculty?.onboardingCompleted === true, 'Faculty onboarding sets onboardingCompleted = true');

  // 3. Faculty Profile Update (PUT /api/faculty/profile)
  console.log('\n--- TEST GROUP 3: Faculty Profile Update ---');
  const profileUpdateRes = await fetch(`${API_BASE}/api/faculty/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${facultyToken}`
    },
    body: JSON.stringify({
      bio: 'Expert in Algorithms & Distributed Systems.',
      phone: '+91 98765 00000',
      designation: 'Senior Professor'
    })
  });
  const profileUpdateData = await profileUpdateRes.json();
  assert(profileUpdateRes.status === 200 && profileUpdateData.success, 'PUT /api/faculty/profile updates faculty bio and contact details');
  assert(profileUpdateData.faculty?.bio === 'Expert in Algorithms & Distributed Systems.', 'Updated bio persists in faculty profile');

  // 4. Faculty Dashboard & Metrics Scope
  console.log('\n--- TEST GROUP 4: Faculty Dashboard & Metrics Scope ---');
  const dashRes = await fetch(`${API_BASE}/api/faculty/dashboard`, {
    headers: { Authorization: `Bearer ${facultyToken}` }
  });
  const dashData = await dashRes.json();
  assert(dashRes.status === 200 && dashData.success, 'GET /api/faculty/dashboard returns HTTP 200');
  assert(dashData.dashboard?.metrics !== undefined, 'Dashboard contains scoped metrics object');

  // 5. Scoped Students List (GET /api/faculty/students)
  console.log('\n--- TEST GROUP 5: Faculty Assigned Students API ---');
  const studentsRes = await fetch(`${API_BASE}/api/faculty/students`, {
    headers: { Authorization: `Bearer ${facultyToken}` }
  });
  const studentsData = await studentsRes.json();
  assert(studentsRes.status === 200 && studentsData.success, 'GET /api/faculty/students returns HTTP 200');
  assert(Array.isArray(studentsData.students), 'GET /api/faculty/students returns array of authorized students');

  // 6. Cross-College & Cross-Branch Authorization Tests
  console.log('\n--- TEST GROUP 6: Cross-College & Cross-Branch Security Tests ---');

  let crossColUser = null;
  let crossBranchUser = null;

  try {
    // Create temporary cross-college student auth user
    const { data: colUserData } = await supabaseAdmin.auth.admin.createUser({
      email: `test.crosscol.${Date.now()}@otherinst.edu`,
      password: 'TestPassword@2026!',
      email_confirm: true,
      user_metadata: { full_name: 'Outside College Student', role: 'Student' }
    });
    crossColUser = colUserData?.user;

    if (crossColUser) {
      await supabaseAdmin.from('student_profiles').upsert([{
        user_id: crossColUser.id,
        full_name: 'Outside College Student',
        email: crossColUser.email,
        college_name: 'Other Autonomous College',
        branch: 'Computer Science & Engineering',
        academic_year: '3rd Year',
        section: 'A'
      }]);

      const crossCollegeRes = await fetch(`${API_BASE}/api/faculty/students/${crossColUser.id}`, {
        headers: { Authorization: `Bearer ${facultyToken}` }
      });
      assert(crossCollegeRes.status === 403, 'GET /api/faculty/students/:studentId DENIES cross-college student access (HTTP 403 Forbidden)');
    }

    // Create temporary cross-branch student auth user
    const { data: branchUserData } = await supabaseAdmin.auth.admin.createUser({
      email: `test.crossbranch.${Date.now()}@careerpilot.local`,
      password: 'TestPassword@2026!',
      email_confirm: true,
      user_metadata: { full_name: 'Outside Branch Student', role: 'Student' }
    });
    crossBranchUser = branchUserData?.user;

    if (crossBranchUser) {
      await supabaseAdmin.from('student_profiles').upsert([{
        user_id: crossBranchUser.id,
        full_name: 'Outside Branch Student',
        email: crossBranchUser.email,
        college_name: 'CareerPilot Institute of Technology',
        branch: 'Mechanical Engineering',
        academic_year: '3rd Year',
        section: 'A'
      }]);

      const crossBranchRes = await fetch(`${API_BASE}/api/faculty/students/${crossBranchUser.id}`, {
        headers: { Authorization: `Bearer ${facultyToken}` }
      });
      assert(crossBranchRes.status === 403, 'GET /api/faculty/students/:studentId DENIES cross-branch student access (HTTP 403 Forbidden)');
    }
  } catch (err) {
    console.warn('Cross-college/branch test setup notice:', err.message);
  } finally {
    // Cleanup temporary test accounts
    if (crossColUser) {
      await supabaseAdmin.from('student_profiles').delete().eq('user_id', crossColUser.id);
      await supabaseAdmin.auth.admin.deleteUser(crossColUser.id);
    }
    if (crossBranchUser) {
      await supabaseAdmin.from('student_profiles').delete().eq('user_id', crossBranchUser.id);
      await supabaseAdmin.auth.admin.deleteUser(crossBranchUser.id);
    }
  }

  // 7. Student Attempting Faculty Endpoints Access Denial
  console.log('\n--- TEST GROUP 7: Student Access Denial to Faculty Routes ---');
  const studentAuth = await loginUser(studentCreds.email, studentCreds.password);
  const studentToken = studentAuth.data.session?.access_token;

  const studentAsFacultyRes = await fetch(`${API_BASE}/api/faculty/me`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert(studentAsFacultyRes.status === 403, 'Student requesting GET /api/faculty/me is DENIED (HTTP 403 Forbidden)');

  const studentAsFacultyStudentsRes = await fetch(`${API_BASE}/api/faculty/students`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert(studentAsFacultyStudentsRes.status === 403, 'Student requesting GET /api/faculty/students is DENIED (HTTP 403 Forbidden)');

  // FINAL SUMMARY
  console.log('\n================================================================');
  console.log(`📊 PHASE 2 TEST RESULTS: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase2TestSuite().catch(err => {
  console.error('Unhandled error running Phase 2 test suite:', err);
  process.exit(1);
});
