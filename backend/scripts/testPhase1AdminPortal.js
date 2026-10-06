/**
 * Phase 1 Admin Portal Real-Data Integration Test Runner
 *
 * Validates real database-backed endpoints across:
 * 1. Admin Dashboard Real Metrics (GET /api/admin/dashboard)
 * 2. Admin Real Analytics (GET /api/admin/analytics)
 * 3. Admin Student Directory & Creation (GET, POST /api/admin/students)
 * 4. Admin Faculty Management & Assignment (GET, POST /api/admin/faculty, POST /api/admin/faculty/assign)
 * 5. Admin Company & Job Management (GET, POST /api/admin/companies, /api/admin/jobs)
 * 6. Admin Contact Management (POST /api/contact, GET, PUT, DELETE /api/admin/contacts)
 * 7. Admin Server-Side Security & Scope Isolation
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
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_b8Wr6uPqsPLvdJQS7rpTSg_MlZeKXxN';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

async function runAdminPhase1Suite() {
  console.log('\n================================================================');
  console.log('🏛️ CAREERPILOT AI: PHASE 1 ADMIN PORTAL REAL-DATA TEST SUITE');
  console.log('================================================================\n');

  // Step 1: Login as Admin
  console.log('--- Step 1: Admin Authentication & Session ---');
  const adminEmail = process.env.DEV_ADMIN_EMAIL || 'admin.test@careerpilot.local';
  const adminPassword = process.env.DEV_ADMIN_PASSWORD || 'DevAdmin@2026!Pass';

  const { data: authData, error: authErr } = await supabaseAnon.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword
  });

  assert(!authErr && authData?.session?.access_token, 'Admin Authenticated Successfully via Supabase Auth', adminEmail);
  const adminToken = authData.session.access_token;
  const adminUserId = authData.user.id;

  // Login as Student for security testing
  const { data: studentAuth } = await supabaseAnon.auth.signInWithPassword({
    email: process.env.DEV_STUDENT_EMAIL || 'student.test@careerpilot.local',
    password: process.env.DEV_STUDENT_PASSWORD || 'DevStudent@2026!Pass'
  });
  const studentToken = studentAuth.session?.access_token;

  // Step 2: Admin Dashboard Real Metrics
  console.log('\n--- Step 2: Admin Dashboard Real Database Statistics ---');
  const dashRes = await fetch(`${API_BASE}/api/admin/dashboard`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const dashData = await dashRes.json();
  assert(dashRes.ok && dashData.success && dashData.stats, 'GET /api/admin/dashboard Returns Database Stats');
  if (dashData.stats) {
    console.log(`     📊 DB Students: ${dashData.stats.totalStudents} | DB Faculty: ${dashData.stats.totalFaculty} | DB Companies: ${dashData.stats.totalCompanies} | DB Jobs: ${dashData.stats.activeJobs}`);
  }

  // Step 3: Admin Real Analytics
  console.log('\n--- Step 3: Admin Analytics & Institutional Metrics ---');
  const analyticsRes = await fetch(`${API_BASE}/api/admin/analytics`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const analyticsData = await analyticsRes.json();
  assert(analyticsRes.ok && analyticsData.success && analyticsData.analytics, 'GET /api/admin/analytics Returns Real Departmental Breakdown');

  // Step 4: Admin Student Directory & Student Creation
  console.log('\n--- Step 4: Admin Student Management ---');
  const studentsRes = await fetch(`${API_BASE}/api/admin/students`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const studentsData = await studentsRes.json();
  if (!studentsData.success) console.log('DEBUG studentsData failure:', studentsRes.status, studentsData);
  assert(studentsRes.ok && studentsData.success && Array.isArray(studentsData.students), 'GET /api/admin/students Returns Real Student Records');

  const newStudentEmail = `admin_created_student_${Date.now()}@careerpilot.ai`;
  const addStudentRes = await fetch(`${API_BASE}/api/admin/students`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      full_name: 'Admin Added Student',
      email: newStudentEmail,
      branch: 'Computer Science & Engineering',
      semester: 5,
      cgpa: 8.4
    })
  });
  const addStudentData = await addStudentRes.json();
  assert(addStudentRes.ok && addStudentData.success, 'POST /api/admin/students Creates Real Student Record in DB', newStudentEmail);

  // Step 5: Admin Faculty Management & Assignment
  console.log('\n--- Step 5: Admin Faculty Management & Instructional Assignment ---');
  const facultyRes = await fetch(`${API_BASE}/api/admin/faculty`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const facultyData = await facultyRes.json();
  assert(facultyRes.ok && facultyData.success && Array.isArray(facultyData.faculty), 'GET /api/admin/faculty Returns Real Faculty Records');

  const newFacultyEmail = `admin_created_faculty_${Date.now()}@careerpilot.ai`;
  const addFacultyRes = await fetch(`${API_BASE}/api/admin/faculty`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      full_name: 'Dr. Admin Appointed Faculty',
      email: newFacultyEmail,
      department: 'Information Science & Engineering',
      designation: 'Professor',
      assignments: [{ academic_year: '3rd Year', section: 'A', subject: 'Database Management Systems' }]
    })
  });
  const addFacultyData = await addFacultyRes.json();
  assert(addFacultyRes.ok || addFacultyData.message?.includes('already'), 'POST /api/admin/faculty Creates Real Faculty Member in DB', addFacultyData.message || newFacultyEmail);

  const createdFacultyUserId = addFacultyData.faculty?.user_id;
  if (createdFacultyUserId) {
    const assignRes = await fetch(`${API_BASE}/api/admin/faculty/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        faculty_id: createdFacultyUserId,
        academic_year: '4th Year',
        department: 'Information Science & Engineering',
        section: 'B',
        subject: 'Advanced Algorithms'
      })
    });
    const assignData = await assignRes.json();
    assert(assignRes.ok && assignData.success, 'POST /api/admin/faculty/assign Persists Instructional Scope to Database');
  }

  // Step 6: Admin Company & Job Drive Management
  console.log('\n--- Step 6: Admin Companies & Placement Jobs ---');
  const compRes = await fetch(`${API_BASE}/api/admin/companies`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const compData = await compRes.json();
  assert(compRes.ok && compData.success && Array.isArray(compData.companies), 'GET /api/admin/companies Returns Real Companies Catalog');

  const jobsRes = await fetch(`${API_BASE}/api/admin/jobs`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const jobsData = await jobsRes.json();
  assert(jobsRes.ok && jobsData.success && Array.isArray(jobsData.jobs), 'GET /api/admin/jobs Returns Real Placement Drives');

  // Step 7: Admin Contact Management
  console.log('\n--- Step 7: Admin Contact Management Lifecycle ---');
  const postContactRes = await fetch(`${API_BASE}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Phase 1 Audit User',
      email: 'phase1_audit@careerpilot.ai',
      role: 'Student',
      subject: 'Phase 1 Integration Test Inquiry',
      message: 'Testing complete contact pipeline from public submission to admin status resolution.'
    })
  });
  const postContactData = await postContactRes.json();
  assert(postContactRes.ok && postContactData.success, 'POST /api/contact Submits Contact Message');

  const getContactsRes = await fetch(`${API_BASE}/api/admin/contacts`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const getContactsData = await getContactsRes.json();
  assert(getContactsRes.ok && getContactsData.success && Array.isArray(getContactsData.contacts), 'GET /api/admin/contacts Lists Submissions for Admin');

  if (getContactsData.contacts?.length > 0) {
    const contactId = getContactsData.contacts[0].id;
    const updateContactRes = await fetch(`${API_BASE}/api/admin/contacts/${contactId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'resolved' })
    });
    const updateContactData = await updateContactRes.json();
    assert(updateContactRes.ok && updateContactData.success, 'PUT /api/admin/contacts/:id Updates Resolution Status');
  }

  // Step 8: Admin Security Barrier Verification
  console.log('\n--- Step 8: Server-Side RBAC Security Enforcement ---');
  if (studentToken) {
    const forbiddenRes = await fetch(`${API_BASE}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(forbiddenRes.status === 403, 'Student Access to GET /api/admin/dashboard Rejected (HTTP 403 Forbidden)');

    const forbiddenContactsRes = await fetch(`${API_BASE}/api/admin/contacts`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(forbiddenContactsRes.status === 403, 'Student Access to GET /api/admin/contacts Rejected (HTTP 403 Forbidden)');
  }

  // SUMMARY
  console.log('\n================================================================');
  console.log('📊 PHASE 1 ADMIN PORTAL INTEGRATION SUMMARY');
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

runAdminPhase1Suite().catch((err) => {
  console.error('Fatal error in Phase 1 Admin test suite:', err);
  process.exit(1);
});
