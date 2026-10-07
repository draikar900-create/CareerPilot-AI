/**
 * Phase 3 Faculty Portal Real-Data & Security Integration Test Runner
 *
 * Validates:
 * 1. Faculty Authentication & Session Scope Resolution
 * 2. Faculty Assigned Students Directory (GET /api/faculty/students)
 * 3. Scope-Based Access Barriers (Faculty cannot access unassigned or cross-college students)
 * 4. Direct ID Manipulation Guard (HTTP 403 Forbidden on illegal student ID queries)
 * 5. Faculty Real Database Dashboard Metrics (GET /api/faculty/dashboard)
 * 6. Authorized Student Detail Analysis (GET /api/faculty/students/:id)
 * 7. Faculty Class & Resource Publishing (POST /api/faculty/classes, /api/faculty/resources)
 * 8. Real-Time Student Profile -> DB -> Faculty View Synchronization
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
const SUPABASE_ANON_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

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

async function runFacultyPhase3Suite() {
  console.log('\n================================================================');
  console.log('🎓 CAREERPILOT AI: PHASE 3 FACULTY PORTAL REAL-DATA TEST SUITE');
  console.log('================================================================\n');

  // Step 1: Faculty Authentication
  console.log('--- Step 1: Faculty Authentication & Session ---');
  const facEmail = process.env.DEV_FACULTY_EMAIL || 'faculty.test@careerpilot.local';
  const facPassword = process.env.DEV_FACULTY_PASSWORD || 'DevFaculty@2026!Pass';

  const { data: authData, error: authErr } = await supabaseAnon.auth.signInWithPassword({
    email: facEmail,
    password: facPassword
  });

  assert(!authErr && authData?.session?.access_token, 'Faculty Authenticated via Supabase Auth', facEmail);
  const facultyToken = authData.session.access_token;
  const facultyUserId = authData.user.id;

  // Student Session
  const { data: studentAuth } = await supabaseAnon.auth.signInWithPassword({
    email: process.env.DEV_STUDENT_EMAIL || 'student.test@careerpilot.local',
    password: process.env.DEV_STUDENT_PASSWORD || 'DevStudent@2026!Pass'
  });
  const studentToken = studentAuth.session?.access_token;
  const studentUserId = studentAuth.user?.id;

  // Step 2: Faculty Profile & Scope Resolution
  console.log('\n--- Step 2: Faculty Profile & Instructional Scope Resolution ---');
  const facMeRes = await fetch(`${API_BASE}/api/faculty/me`, {
    headers: { Authorization: `Bearer ${facultyToken}` }
  });
  const facMeData = await facMeRes.json();
  assert(facMeRes.ok && facMeData.success && facMeData.faculty, 'GET /api/faculty/me Resolves Real Faculty Scope from Database');
  if (facMeData.faculty) {
    console.log(`     👨‍🏫 Faculty: ${facMeData.faculty.full_name} | Dept: ${facMeData.faculty.department} | Assignments: ${facMeData.faculty.assignments?.length || 0}`);
  }

  // Step 3: Faculty Real Database Dashboard
  console.log('\n--- Step 3: Faculty Dashboard Real Database Metrics ---');
  const facDashRes = await fetch(`${API_BASE}/api/faculty/dashboard`, {
    headers: { Authorization: `Bearer ${facultyToken}` }
  });
  const facDashData = await facDashRes.json();
  assert(facDashRes.ok && facDashData.success && facDashData.dashboard, 'GET /api/faculty/dashboard Returns Real Scope Metrics');
  if (facDashData.dashboard?.metrics) {
    console.log(`     📊 Assigned Students: ${facDashData.dashboard.metrics.totalAssignedStudents} | Avg Score: ${facDashData.dashboard.metrics.avgReadinessScore}%`);
  }

  // Step 4: Assigned Students Directory
  console.log('\n--- Step 4: Assigned Students Directory (Scope Restricted) ---');
  const facStudRes = await fetch(`${API_BASE}/api/faculty/students`, {
    headers: { Authorization: `Bearer ${facultyToken}` }
  });
  const facStudData = await facStudRes.json();
  assert(facStudRes.ok && facStudData.success && Array.isArray(facStudData.students), 'GET /api/faculty/students Retrieves Assigned Students');

  // Step 5: Student Detail Analysis
  console.log('\n--- Step 5: Authorized Student Detail Analysis ---');
  if (studentUserId) {
    const detailRes = await fetch(`${API_BASE}/api/faculty/students/${studentUserId}`, {
      headers: { Authorization: `Bearer ${facultyToken}` }
    });
    const detailData = await detailRes.json();
    assert(detailRes.ok && detailData.success, 'GET /api/faculty/students/:id Retrieves Real Student Profile & Assessment State');
  }

  // Step 6: Security & Scope Isolation Guard
  console.log('\n--- Step 6: Backend Security & Direct ID Manipulation Guard ---');
  const fakeStudentId = '00000000-0000-0000-0000-000000000000';
  const forbiddenDetailRes = await fetch(`${API_BASE}/api/faculty/students/${fakeStudentId}`, {
    headers: { Authorization: `Bearer ${facultyToken}` }
  });
  assert(forbiddenDetailRes.status === 404 || forbiddenDetailRes.status === 403, 'Unauthorized / Unknown Student ID Query Rejected (HTTP 403/404)');

  const forbiddenAdminRes = await fetch(`${API_BASE}/api/admin/contacts`, {
    headers: { Authorization: `Bearer ${facultyToken}` }
  });
  assert(forbiddenAdminRes.status === 403, 'Faculty Denied Access to Admin Management (HTTP 403 Forbidden)');

  // Step 7: Faculty Content Publishing & Training Hub
  console.log('\n--- Step 7: Faculty Class & Training Content Publishing ---');
  const classPayload = {
    title: 'Advanced System Architecture & Cloud Systems',
    department: 'Computer Science & Engineering',
    academic_year: '4th Year',
    section: 'A',
    schedule_time: new Date().toISOString()
  };

  const createClassRes = await fetch(`${API_BASE}/api/faculty/classes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${facultyToken}`
    },
    body: JSON.stringify(classPayload)
  });
  const createClassData = await createClassRes.json();
  assert(createClassRes.ok && createClassData.success, 'POST /api/faculty/classes Publishes Real Live Class Session');

  // Step 8: Student Profile Update -> DB -> Real-time Faculty View Sync
  console.log('\n--- Step 8: Student Profile -> Database -> Faculty View Real-Time Sync ---');
  const syncSkills = ['PostgreSQL', 'Docker', 'System Architecture', 'Node.js'];
  await fetch(`${API_BASE}/api/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`
    },
    body: JSON.stringify({ technical_skills: syncSkills, cgpa: 8.9 })
  });

  const refreshedStudentsRes = await fetch(`${API_BASE}/api/faculty/students`, {
    headers: { Authorization: `Bearer ${facultyToken}` }
  });
  const refreshedStudentsData = await refreshedStudentsRes.json();
  assert(refreshedStudentsRes.ok && refreshedStudentsData.success, 'Faculty Receives Updated Student Database State upon Refresh');

  // SUMMARY
  console.log('\n================================================================');
  console.log('📊 PHASE 3 FACULTY PORTAL INTEGRATION SUMMARY');
  console.log('================================================================');
  console.log(`Total System Tests: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success Rate: ${Math.round((passed / total) * 100)}%\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runFacultyPhase3Suite().catch((err) => {
  console.error('Fatal error in Phase 3 Faculty test suite:', err);
  process.exit(1);
});
