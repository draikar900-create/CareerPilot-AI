/**
 * Automated Verification Script:
 * 1. Student Identity Isolation & Account Switching
 * 2. Faculty Profile & Scope Persistence
 * 3. Faculty Assigned Students Scope Verification
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });
const testEnvPath = path.join(__dirname, '../.env.test-accounts');
if (fs.existsSync(testEnvPath)) {
  dotenv.config({ path: testEnvPath });
}

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
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

async function runTestSuite() {
  console.log('\n================================================================');
  console.log('🧪 CAREERPILOT AI: IDENTITY ISOLATION & FACULTY SCOPE TEST SUITE');
  console.log('================================================================\n');

  // STEP 1: STUDENT A LOGIN & PROFILE VERIFICATION
  console.log('--- Step 1: Student A Login & Profile Isolation ---');
  const studentAEmail = process.env.DEV_STUDENT_EMAIL || 'student.test@careerpilot.local';
  const studentAPassword = process.env.DEV_STUDENT_PASSWORD || 'DevStudent@2026!Pass';

  const { data: authA, error: errA } = await supabaseAnon.auth.signInWithPassword({
    email: studentAEmail,
    password: studentAPassword
  });

  assert(!errA && authA?.session?.access_token, 'Student A Authenticated via Supabase Auth', studentAEmail);
  const tokenA = authA.session.access_token;
  const userAId = authA.user.id;

  const profileARes = await fetch(`${API_BASE}/api/profile`, {
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  const profileAData = await profileARes.json();
  assert(profileARes.ok && profileAData.success && profileAData.profile, 'GET /api/profile Returns Student A Profile');
  const nameA = profileAData.profile?.full_name;
  console.log(`     👤 Student A Name: "${nameA}" | User ID: ${profileAData.profile?.user_id}`);
  assert(profileAData.profile?.user_id === userAId, 'Student A Profile Matches Authenticated JWT User ID');

  // STEP 2: STUDENT B (CREATE VIA ADMIN CLIENT) & ISOLATION
  console.log('\n--- Step 2: Student B Login & Cross-Account Isolation ---');
  const studentBEmail = `student_b_${Date.now()}@careerpilot.local`;
  const studentBPassword = 'DevStudentB@2026!Pass';

  const { data: authBReg, error: regBErr } = await supabaseAdmin.auth.admin.createUser({
    email: studentBEmail,
    password: studentBPassword,
    email_confirm: true,
    user_metadata: {
      full_name: 'Student B Candidate',
      phone: '+91 99999 88888'
    }
  });

  assert(!regBErr && authBReg?.user, 'Student B Account Created via Supabase Auth Admin', studentBEmail);
  const userBId = authBReg.user.id;

  const { data: authB, error: errB } = await supabaseAnon.auth.signInWithPassword({
    email: studentBEmail,
    password: studentBPassword
  });

  assert(!errB && authB?.session?.access_token, 'Student B Authenticated via Supabase Auth', studentBEmail);
  const tokenB = authB.session.access_token;

  const profileBRes = await fetch(`${API_BASE}/api/profile`, {
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  const profileBData = await profileBRes.json();
  assert(profileBRes.ok && profileBData.success && profileBData.profile, 'GET /api/profile Returns Student B Profile');
  const nameB = profileBData.profile?.full_name;
  console.log(`     👤 Student B Name: "${nameB}" | User ID: ${profileBData.profile?.user_id}`);

  assert(profileBData.profile?.user_id === userBId, 'Student B Profile Matches Authenticated User ID B');
  assert(nameB !== nameA, 'Student B Name does NOT leak Student A Name');
  assert(profileBData.profile?.email === studentBEmail, 'Student B Email matches logged-in account');

  // STEP 3: FACULTY LOGIN & PROFILE SCOPE PERSISTENCE
  console.log('\n--- Step 3: Faculty Authentication & Profile Scope ---');
  const facultyEmail = process.env.DEV_FACULTY_EMAIL || 'faculty.test@careerpilot.local';
  const facultyPassword = process.env.DEV_FACULTY_PASSWORD || 'DevFaculty@2026!Pass';

  const { data: authFac, error: errFac } = await supabaseAnon.auth.signInWithPassword({
    email: facultyEmail,
    password: facultyPassword
  });

  assert(!errFac && authFac?.session?.access_token, 'Faculty Authenticated via Supabase Auth', facultyEmail);
  const facultyToken = authFac.session.access_token;

  const facMeRes = await fetch(`${API_BASE}/api/faculty/me`, {
    headers: { Authorization: `Bearer ${facultyToken}` }
  });
  const facMeData = await facMeRes.json();
  assert(facMeRes.ok && facMeData.success && facMeData.faculty, 'GET /api/faculty/me Returns Real Faculty Record');
  console.log(`     👨‍🏫 Faculty Name: "${facMeData.faculty?.fullName}" | Dept: "${facMeData.faculty?.department}" | Scopes: ${facMeData.faculty?.assignments?.length || 0}`);

  // STEP 4: UPDATE FACULTY PROFILE & INSTRUCTIONAL SCOPE
  console.log('\n--- Step 4: Faculty Profile & Scope Update Persistence ---');
  const newDesignation = `Professor of Computing (${Date.now().toString().slice(-4)})`;
  const updateFacRes = await fetch(`${API_BASE}/api/faculty/onboarding`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${facultyToken}`
    },
    body: JSON.stringify({
      full_name: facMeData.faculty?.fullName || 'Dr. Verified Faculty',
      employee_id: 'FAC-8899',
      department: 'Computer Science & Engineering',
      designation: newDesignation,
      assignments: [
        { academic_year: '3rd Year', section: 'A', subject: 'Advanced Algorithms' },
        { academic_year: '4th Year', section: 'B', subject: 'Distributed Systems' }
      ]
    })
  });

  const updateFacData = await updateFacRes.json();
  assert(updateFacRes.ok && updateFacData.success, 'POST /api/faculty/onboarding Persists Faculty Scope & Profile');

  const verifyFacRes = await fetch(`${API_BASE}/api/faculty/me`, {
    headers: { Authorization: `Bearer ${facultyToken}` }
  });
  const verifyFacData = await verifyFacRes.json();
  assert(verifyFacData.faculty?.designation === newDesignation, 'GET /api/faculty/me Reflects Persisted Designation');

  // STEP 5: FACULTY MY STUDENTS LISTING
  console.log('\n--- Step 5: Faculty Assigned Students Scope Verification ---');
  const facStudentsRes = await fetch(`${API_BASE}/api/faculty/students`, {
    headers: { Authorization: `Bearer ${facultyToken}` }
  });
  const facStudentsData = await facStudentsRes.json();
  assert(facStudentsRes.ok && facStudentsData.success && Array.isArray(facStudentsData.students), 'GET /api/faculty/students Returns Assigned Students Array');
  console.log(`     🎓 Total Assigned Students Retreived: ${facStudentsData.students?.length}`);
  if (facStudentsData.students?.length > 0) {
    const firstStu = facStudentsData.students[0];
    console.log(`     Student #1: ${firstStu.fullName} (${firstStu.email}) | ID: ${firstStu.studentId} | Year: ${firstStu.academicYear}`);
    assert(firstStu.fullName && firstStu.email && firstStu.studentId, 'Assigned Student has valid Name, Email, and Student ID');
  }

  console.log('\n================================================================');
  console.log(`📊 IDENTITY & SCOPE SUMMARY: Passed ${passed}/${total} (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(console.error);
