import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });
const testEnvPath = path.join(__dirname, '../.env.test-accounts');
if (fs.existsSync(testEnvPath)) {
  dotenv.config({ path: testEnvPath });
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_b8Wr6uPqsPLvdJQS7rpTSg_MlZeKXxN';
const API_BASE = 'http://localhost:5000/api';

// Create real client (same client used by frontend)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TEST_CREDENTIALS = {
  student: {
    email: process.env.DEV_STUDENT_EMAIL || 'student.test@careerpilot.local',
    password: process.env.DEV_STUDENT_PASSWORD || 'DevStudent@2026!Pass',
    expectedRole: 'Student'
  },
  faculty: {
    email: process.env.DEV_FACULTY_EMAIL || 'faculty.test@careerpilot.local',
    password: process.env.DEV_FACULTY_PASSWORD || 'DevFaculty@2026!Pass',
    expectedRole: 'Faculty'
  },
  admin: {
    email: process.env.DEV_ADMIN_EMAIL || 'admin.test@careerpilot.local',
    password: process.env.DEV_ADMIN_PASSWORD || 'DevAdmin@2026!Pass',
    expectedRole: 'Admin'
  },
  tpo: {
    email: process.env.DEV_TPO_EMAIL || 'tpo.test@careerpilot.local',
    password: process.env.DEV_TPO_PASSWORD || 'DevTpo@2026!Pass',
    expectedRole: 'PlacementOfficer'
  }
};

async function runDevAuthTestSuite() {
  console.log('\n================================================================');
  console.log('🧪 CAREERPILOT AI: FULL AUTOMATED DEV TEST ACCOUNTS & AUTH SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      failed++;
    }
  }

  const tokens = {};

  try {
    // -------------------------------------------------------------
    // TEST 1: Real Supabase Auth Login for each of the 4 accounts
    // -------------------------------------------------------------
    console.log('--- PHASE 1: Real Supabase Auth Authentication ---');
    for (const [key, cred] of Object.entries(TEST_CREDENTIALS)) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cred.email,
        password: cred.password
      });

      assert(!error && data.session?.access_token, `${key.toUpperCase()}: Real Supabase Auth login succeeded (${cred.email})`);
      assert(data.user?.email?.toLowerCase() === cred.email.toLowerCase(), `${key.toUpperCase()}: User identity matches registered email`);

      const rawRole = data.user.app_metadata?.role || data.user.user_metadata?.role;
      assert(rawRole === cred.expectedRole, `${key.toUpperCase()}: Canonical role matches expected "${cred.expectedRole}" (got: "${rawRole}")`);

      tokens[key] = data.session?.access_token;
    }

    // -------------------------------------------------------------
    // TEST 2: Wrong Password Rejection (Negative Testing)
    // -------------------------------------------------------------
    console.log('\n--- PHASE 2: Security & Negative Authentication Tests ---');
    const { data: wrongData, error: wrongError } = await supabase.auth.signInWithPassword({
      email: TEST_CREDENTIALS.student.email,
      password: 'CompletelyWrongPassword123!'
    });
    assert(!!wrongError && !wrongData.session, 'Incorrect password correctly rejected by Supabase Auth');

    // Test without Authorization header
    const resNoAuth = await fetch(`${API_BASE}/admin/dashboard`).catch(() => null);
    if (resNoAuth) {
      assert(resNoAuth.status === 401, 'Unauthenticated request to /api/admin/dashboard rejected (HTTP 401)');
    } else {
      console.log('  ⚠️ Backend server not currently running at localhost:5000. Skipping live HTTP tests.');
    }

    // Test with invalid bearer token
    if (resNoAuth) {
      const resBadToken = await fetch(`${API_BASE}/admin/dashboard`, {
        headers: { Authorization: 'Bearer invalid.fake.token123' }
      });
      assert(resBadToken.status === 401, 'Invalid bearer token rejected by authenticateUser middleware (HTTP 401)');

      // -------------------------------------------------------------
      // TEST 3: Student Role Access Boundaries
      // -------------------------------------------------------------
      console.log('\n--- PHASE 3: Student Role Access Boundaries ---');
      const resStudToAdmin = await fetch(`${API_BASE}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${tokens.student}` }
      });
      assert(resStudToAdmin.status === 403, 'Student denied access to /api/admin/dashboard (HTTP 403 Forbidden)');

      const resStudToFaculty = await fetch(`${API_BASE}/faculty/me`, {
        headers: { Authorization: `Bearer ${tokens.student}` }
      });
      assert(resStudToFaculty.status === 403, 'Student denied access to /api/faculty/me (HTTP 403 Forbidden)');

      // -------------------------------------------------------------
      // TEST 4: Faculty Role Access Boundaries & Scope
      // -------------------------------------------------------------
      console.log('\n--- PHASE 4: Faculty Role Access Boundaries ---');
      const resFacToAdmin = await fetch(`${API_BASE}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${tokens.faculty}` }
      });
      assert(resFacToAdmin.status === 403, 'Faculty denied access to /api/admin/dashboard (HTTP 403 Forbidden)');

      const resFacMe = await fetch(`${API_BASE}/faculty/me`, {
        headers: { Authorization: `Bearer ${tokens.faculty}` }
      });
      const dataFacMe = await resFacMe.json();
      assert(resFacMe.status === 200 && dataFacMe.success, 'Faculty successfully authenticated to /api/faculty/me (HTTP 200 OK)');
      assert(dataFacMe.faculty?.assignments?.length > 0, 'Faculty profile derives active teaching assignments');

      const resFacDash = await fetch(`${API_BASE}/faculty/dashboard`, {
        headers: { Authorization: `Bearer ${tokens.faculty}` }
      });
      assert(resFacDash.status === 200, 'Faculty successfully accesses /api/faculty/dashboard (HTTP 200 OK)');

      // -------------------------------------------------------------
      // TEST 5: Admin Role Management Areas
      // -------------------------------------------------------------
      console.log('\n--- PHASE 5: Admin Role Management Areas ---');
      const resAdminDash = await fetch(`${API_BASE}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${tokens.admin}` }
      });
      assert(resAdminDash.status === 200, 'Admin successfully accesses /api/admin/dashboard (HTTP 200 OK)');

      const resAdminStudents = await fetch(`${API_BASE}/admin/students`, {
        headers: { Authorization: `Bearer ${tokens.admin}` }
      });
      const dataAdminStudents = await resAdminStudents.json();
      assert(resAdminStudents.status === 200 && Array.isArray(dataAdminStudents.students), 'Admin successfully accesses /api/admin/students');

      const resAdminFaculty = await fetch(`${API_BASE}/admin/faculty`, {
        headers: { Authorization: `Bearer ${tokens.admin}` }
      });
      const dataAdminFaculty = await resAdminFaculty.json();
      assert(resAdminFaculty.status === 200 && Array.isArray(dataAdminFaculty.faculty), 'Admin successfully accesses /api/admin/faculty');

      // -------------------------------------------------------------
      // TEST 6: TPO / Placement Officer Access & Boundaries
      // -------------------------------------------------------------
      console.log('\n--- PHASE 6: TPO / Placement Officer Access & Boundaries ---');
      const resTpoDash = await fetch(`${API_BASE}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${tokens.tpo}` }
      });
      assert(resTpoDash.status === 200, 'TPO successfully accesses /api/admin/dashboard (HTTP 200 OK)');

      const resTpoStudents = await fetch(`${API_BASE}/admin/students`, {
        headers: { Authorization: `Bearer ${tokens.tpo}` }
      });
      assert(resTpoStudents.status === 200, 'TPO successfully accesses student placement candidates (/api/admin/students)');

      const resTpoRules = await fetch(`${API_BASE}/admin/eligibility`, {
        headers: { Authorization: `Bearer ${tokens.tpo}` }
      });
      assert(resTpoRules.status === 200, 'TPO successfully accesses /api/admin/eligibility rules');

      // TPO attempting restricted SuperAdmin-only action
      const resTpoSuperAdminAction = await fetch(`${API_BASE}/admin/colleges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.tpo}` },
        body: JSON.stringify({ name: 'Unauthorized Institution' })
      });
      assert(resTpoSuperAdminAction.status === 403, 'TPO rejected from SuperAdmin-only institution creation /api/admin/colleges (HTTP 403 Forbidden)');
    }

    console.log('\n================================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runDevAuthTestSuite();
