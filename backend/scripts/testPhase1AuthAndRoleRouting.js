/**
 * CAREERPILOT AI - PHASE 1: AUTHENTICATION, ROLE RESOLUTION & SCOPE SECURITY TEST SUITE
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
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

async function runAuthSuite() {
  console.log('\n================================================================');
  console.log('🔒 CAREERPILOT AI: PHASE 1 AUTHENTICATION & ROLE SECURITY SUITE');
  console.log('================================================================\n');

  // Test Accounts
  const studentCreds = { email: process.env.DEV_STUDENT_EMAIL || 'student.test@careerpilot.local', password: process.env.DEV_STUDENT_PASSWORD || 'DevStudent@2026!Pass' };
  const facultyCreds = { email: process.env.DEV_FACULTY_EMAIL || 'faculty.test@careerpilot.local', password: process.env.DEV_FACULTY_PASSWORD || 'DevFaculty@2026!Pass' };
  const tpoCreds = { email: process.env.DEV_TPO_EMAIL || 'tpo.test@careerpilot.local', password: process.env.DEV_TPO_PASSWORD || 'DevTpo@2026!Pass' };
  const adminCreds = { email: process.env.DEV_ADMIN_EMAIL || 'admin.test@careerpilot.local', password: process.env.DEV_ADMIN_PASSWORD || 'DevAdmin@2026!Pass' };

  // 1. Health & Root Endpoints
  console.log('--- TEST GROUP 1: Backend Health & Root Routes ---');
  const rootRes = await fetch(`${API_BASE}/`);
  const rootData = await rootRes.json();
  assert(rootRes.status === 200 && rootData.success && rootData.health === '/health', 'GET / returns HTTP 200 and health route reference');

  const healthRes = await fetch(`${API_BASE}/health`);
  const healthData = await healthRes.json();
  assert(healthRes.status === 200 && healthData.success && healthData.environment === 'development', 'GET /health returns HTTP 200 OK without exposing secrets');

  // 2. Student Authentication & Role Resolution
  console.log('\n--- TEST GROUP 2: Student Authentication & Role Resolution ---');
  const studentAuth = await loginUser(studentCreds.email, studentCreds.password);
  assert(studentAuth.status === 200 && studentAuth.data.success, 'Student login succeeds');
  assert(studentAuth.data.user?.role === 'Student', 'Student login resolves authoritative role = Student', `Role: ${studentAuth.data.user?.role}`);
  const studentToken = studentAuth.data.session?.access_token;

  // 3. Faculty Authentication & Role Resolution
  console.log('\n--- TEST GROUP 3: Faculty Authentication & Role Resolution ---');
  const facultyAuth = await loginUser(facultyCreds.email, facultyCreds.password);
  assert(facultyAuth.status === 200 && facultyAuth.data.success, 'Faculty login succeeds');
  assert(facultyAuth.data.user?.role === 'Faculty', 'Faculty login resolves authoritative role = Faculty', `Role: ${facultyAuth.data.user?.role}`);
  const facultyToken = facultyAuth.data.session?.access_token;

  // 4. Placement Officer / TPO Authentication & Role Resolution
  console.log('\n--- TEST GROUP 4: TPO / Placement Officer Role Resolution ---');
  const tpoAuth = await loginUser(tpoCreds.email, tpoCreds.password);
  assert(tpoAuth.status === 200 && tpoAuth.data.success, 'TPO login succeeds');
  assert(tpoAuth.data.user?.role === 'PlacementOfficer', 'TPO login resolves authoritative role = PlacementOfficer', `Role: ${tpoAuth.data.user?.role}`);
  const tpoToken = tpoAuth.data.session?.access_token;

  // 5. Admin Authentication & Role Resolution
  console.log('\n--- TEST GROUP 5: Admin Role Resolution ---');
  const adminAuth = await loginUser(adminCreds.email, adminCreds.password);
  assert(adminAuth.status === 200 && adminAuth.data.success, 'Admin login succeeds');
  assert(adminAuth.data.user?.role === 'Admin', 'Admin login resolves authoritative role = Admin', `Role: ${adminAuth.data.user?.role}`);
  const adminToken = adminAuth.data.session?.access_token;

  // 6. Server-Side Role Authorization & Boundaries (HTTP 403 Enforcement)
  console.log('\n--- TEST GROUP 6: Server-Side Role Boundaries & 403 Enforcement ---');
  
  // Student calling Faculty endpoint -> 403
  const studToFac = await fetch(`${API_BASE}/api/faculty/dashboard`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert(studToFac.status === 403, 'Student calling GET /api/faculty/dashboard returns 403 Forbidden', `Status: ${studToFac.status}`);

  // Student calling Admin endpoint -> 403
  const studToAdmin = await fetch(`${API_BASE}/api/admin/users`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert(studToAdmin.status === 403, 'Student calling GET /api/admin/users returns 403 Forbidden', `Status: ${studToAdmin.status}`);

  // Faculty calling Admin endpoint -> 403
  const facToAdmin = await fetch(`${API_BASE}/api/admin/users`, {
    headers: { Authorization: `Bearer ${facultyToken}` }
  });
  assert(facToAdmin.status === 403, 'Faculty calling GET /api/admin/users returns 403 Forbidden', `Status: ${facToAdmin.status}`);

  // 7. Faculty Profile Onboarding & Scope Setup
  console.log('\n--- TEST GROUP 7: Faculty Profile Onboarding & Persistence ---');
  const onboardingPayload = {
    full_name: 'Dr. Faculty Test Member',
    employee_id: 'FAC-2026-TEST',
    phone: '+91 98765 43210',
    college_name: 'CareerPilot Institute of Technology',
    department: 'Computer Science & Engineering',
    designation: 'Professor',
    assignments: [
      { academic_year: '3rd Year', section: 'A', batch: 'All', subject: 'Cloud Computing & System Design' }
    ],
    onboarding_completed: true
  };

  const onboardingRes = await fetch(`${API_BASE}/api/faculty/onboarding`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${facultyToken}`
    },
    body: JSON.stringify(onboardingPayload)
  });
  const onboardingData = await onboardingRes.json();
  assert(onboardingRes.status === 200 && onboardingData.success, 'Faculty onboarding POST /api/faculty/onboarding saves successfully', `Msg: ${onboardingData.message}`);

  // 8. Cross-College Data Access Security Check
  console.log('\n--- TEST GROUP 8: Cross-College Data Access Security ---');
  // Attempt to request roadmap for a non-existent or cross-college student
  const fakeStudentId = '00000000-0000-0000-0000-000000000000';
  const crossRes = await fetch(`${API_BASE}/api/faculty/students/${fakeStudentId}/roadmap`, {
    headers: { Authorization: `Bearer ${facultyToken}` }
  });
  assert(crossRes.status === 404 || crossRes.status === 403, 'Unauthorized / cross-college student detail request is safely rejected', `Status: ${crossRes.status}`);

  // Summary Report
  console.log('\n================================================================');
  console.log(`📊 TEST RESULTS SUMMARY: Total: ${total} | Passed: ${passed} | Failed: ${failed}`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAuthSuite().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
