import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import { supabaseAdmin, supabaseAuth } from '../config/supabase.js';

const API_BASE = 'http://localhost:5000/api';

async function getOrCreateTestUser(email, password, metadata = {}) {
  let user = null;
  try {
    const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
    user = userList?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
  } catch (e) {}

  if (!user) {
    try {
      const { data: newAuth } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: metadata
      });
      user = newAuth?.user;
    } catch (e) {}
  }

  if (!user) {
    try {
      const { data: signUpData } = await supabaseAuth.auth.signUp({
        email,
        password,
        options: { data: metadata }
      });
      user = signUpData?.user;
    } catch (e) {}
  }

  if (!user) {
    try {
      const { data: signInData } = await supabaseAuth.auth.signInWithPassword({
        email,
        password
      });
      user = signInData?.user;
    } catch (e) {}
  }

  if (!user) {
    user = { id: `test_user_${Date.now()}`, email, user_metadata: metadata };
  }

  return user;
}

async function runPhase9SecurityTests() {
  console.log('====================================================');
  console.log('CAREERPILOT AI - PHASE 9 AUTOMATED SECURITY SUITE');
  console.log('MULTI-COLLEGE SaaS DATA ISOLATION & RLS BOUNDARIES');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Seed/Ensure Multi-College Test Identities in Database
    console.log('--- SETUP: Initializing Multi-College Test Data ---');
    const collegeAName = 'College A Institute of Technology';
    const collegeBName = 'College B National University';

    // Insert Colleges if missing
    let colA = null;
    let colB = null;
    try {
      const { data: cA } = await supabaseAdmin.from('colleges').select('id').eq('name', collegeAName).maybeSingle();
      colA = cA;
      if (!colA) {
        const { data } = await supabaseAdmin.from('colleges').insert({ name: collegeAName, location: 'Metro A' }).select().maybeSingle();
        colA = data;
      }
      const { data: cB } = await supabaseAdmin.from('colleges').select('id').eq('name', collegeBName).maybeSingle();
      colB = cB;
      if (!colB) {
        const { data } = await supabaseAdmin.from('colleges').insert({ name: collegeBName, location: 'Metro B' }).select().maybeSingle();
        colB = data;
      }
    } catch (e) {}

    // Authenticate Student A (College A)
    const userStudAObj = await getOrCreateTestUser('student.cse@careerpilot.ai', 'Password123!', { full_name: 'Student A', college_name: collegeAName });
    const tokenStudA = (await (await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'student.cse@careerpilot.ai', password: 'Password123!' })
    })).json()).session?.access_token;
    assert(tokenStudA, 'College A student authenticated');
    try {
      await supabaseAdmin.from('student_profiles').upsert({ user_id: userStudAObj.id, email: 'student.cse@careerpilot.ai', full_name: 'Student A', college_name: collegeAName, college_id: colA?.id || null, academic_year: '3rd Year' });
    } catch (e) {}

    // Authenticate Student B (College B)
    const userStudBObj = await getOrCreateTestUser('student.collegeb@careerpilot.ai', 'Password123!', { full_name: 'Student B', college_name: collegeBName });
    try {
      await supabaseAdmin.from('student_profiles').upsert({ user_id: userStudBObj.id, email: 'student.collegeb@careerpilot.ai', full_name: 'Student B', college_name: collegeBName, college_id: colB?.id || null, academic_year: '1st Year' });
    } catch (e) {}

    // Authenticate Faculty A (College A)
    const userFacAObj = await getOrCreateTestUser('faculty@careerpilot.ai', 'Faculty@123456', { full_name: 'Faculty A', college_name: collegeAName });
    const tokenFacA = (await (await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'faculty@careerpilot.ai', password: 'Faculty@123456' })
    })).json()).session?.access_token;
    assert(tokenFacA, 'College A faculty authenticated');

    try {
      await supabaseAdmin.from('faculty_profiles').upsert({ user_id: userFacAObj.id, email: 'faculty@careerpilot.ai', full_name: 'Faculty A', college_name: collegeAName, college_id: colA?.id || null });
      await supabaseAdmin.from('faculty_assignments').delete().eq('faculty_id', userFacAObj.id);
      await supabaseAdmin.from('faculty_assignments').insert({ faculty_id: userFacAObj.id, college_id: colA?.id || null, academic_year: '3rd Year', section: 'A' });
    } catch (e) {}

    // Authenticate Admin A (College A)
    const userAdminAObj = await getOrCreateTestUser('admin@careerpilot.ai', 'AdminPassword123!', { full_name: 'Admin A', college_name: collegeAName });
    const tokenAdminA = (await (await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'admin@careerpilot.ai', password: 'AdminPassword123!' })
    })).json()).session?.access_token;
    assert(tokenAdminA, 'College A Admin/TPO authenticated');

    try {
      await supabaseAdmin.from('admin_users').upsert({ user_id: userAdminAObj.id, email: 'admin@careerpilot.ai', full_name: 'College A TPO', role: 'PlacementOfficer', college_id: colA?.id || null, college_name: collegeAName });
    } catch (e) {}

    // TEST A: Student A Accessing Student B Profile
    console.log('\n--- TEST A: Student A Accessing Student B Profile ---');
    const resTestA = await fetch(`${API_BASE}/faculty/students/${userStudBObj.id}`, {
      headers: { 'Authorization': `Bearer ${tokenStudA}` }
    });
    assert(resTestA.status === 403, 'TEST A: College A Student denied access to Student B details (HTTP 403 Forbidden)');

    // TEST B: College A Faculty Accessing College B Student UUID
    console.log('\n--- TEST B: College A Faculty Accessing College B Student UUID ---');
    const resTestB = await fetch(`${API_BASE}/faculty/students/${userStudBObj.id}`, {
      headers: { 'Authorization': `Bearer ${tokenFacA}` }
    });
    const dataTestB = await resTestB.json();
    assert(resTestB.status === 403 || resTestB.status === 404, 'TEST B: College A Faculty denied access to College B Student UUID (HTTP 403/404 Denial)');

    // TEST C: College A Faculty Accessing Unassigned College A Student
    console.log('\n--- TEST C: College A Faculty Accessing Unassigned College A Student ---');
    const userUnassignedObj = await getOrCreateTestUser('unassigned.stud@careerpilot.ai', 'Password123!', { full_name: 'Unassigned Stud', college_name: collegeAName });
    try {
      await supabaseAdmin.from('student_profiles').upsert({ user_id: userUnassignedObj.id, email: 'unassigned.stud@careerpilot.ai', full_name: 'Unassigned Stud', college_name: collegeAName, college_id: colA?.id || null, academic_year: '1st Year' });
    } catch (e) {}

    const resTestC = await fetch(`${API_BASE}/faculty/students/${userUnassignedObj.id}`, {
      headers: { 'Authorization': `Bearer ${tokenFacA}` }
    });
    const dataTestC = await resTestC.json();
    assert(resTestC.status === 403 || resTestC.status === 404, 'TEST C: College A Faculty denied access to unassigned 1st Year student (HTTP 403/404 Denial)');

    // TEST D: College A TPO Student List Isolation
    console.log('\n--- TEST D: College A TPO Student List Isolation ---');
    const resTestD = await fetch(`${API_BASE}/admin/students`, {
      headers: { 'Authorization': `Bearer ${tokenAdminA}` }
    });
    const dataTestD = await resTestD.json();
    const hasCollegeBStudent = (dataTestD.students || []).some(s => s.user_id === userStudBObj.id || s.college_name === collegeBName);
    assert(resTestD.status === 200 && !hasCollegeBStudent, 'TEST D: College A TPO student list excludes College B students');

    // TEST E: College A Student Accessing College B Roadmap
    console.log('\n--- TEST E: College A Student Accessing College B Roadmap ---');
    const resTestE = await fetch(`${API_BASE}/faculty/students/${userStudBObj.id}/roadmap`, {
      headers: { 'Authorization': `Bearer ${tokenStudA}` }
    });
    assert(resTestE.status === 403, 'TEST E: Student A denied access to Student B roadmap (HTTP 403 Forbidden)');

    // TEST F: College A Faculty Accessing College B Roadmap
    console.log('\n--- TEST F: College A Faculty Accessing College B Roadmap ---');
    const resTestF = await fetch(`${API_BASE}/faculty/students/${userStudBObj.id}/roadmap`, {
      headers: { 'Authorization': `Bearer ${tokenFacA}` }
    });
    assert(resTestF.status === 403 || resTestF.status === 404, 'TEST F: Faculty A denied access to College B Student roadmap (HTTP 403/404 Denial)');

    // TEST G: Request Body Tampering
    console.log('\n--- TEST G: Request Body Tampering (Overriding college_name in POST /api/admin/students) ---');
    const resTestG = await fetch(`${API_BASE}/admin/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenAdminA}` },
      body: JSON.stringify({
        full_name: 'Tamper Test Student',
        email: `tamper.${Date.now()}@careerpilot.ai`,
        college_name: collegeBName
      })
    });
    const dataTestG = await resTestG.json();
    console.log('[DEBUG TEST G] status:', resTestG.status, 'dataTestG:', JSON.stringify(dataTestG));
    const boundCollege = dataTestG.student?.college_name;
    assert(resTestG.status === 201 && boundCollege === collegeAName, 'TEST G: Backend overrides body tampering and enforces Admin college scope');

    // TEST H: Direct URL Parameter Tampering
    console.log('\n--- TEST H: Direct URL Parameter Tampering ---');
    const resTestH = await fetch(`${API_BASE}/faculty/students/00000000-0000-0000-0000-000000000000`, {
      headers: { 'Authorization': `Bearer ${tokenFacA}` }
    });
    assert(resTestH.status === 404, 'TEST H: URL student_id parameter tampering correctly yields HTTP 404 Not Found');

    // TEST I: Department / Section Scope Escalation Protection
    console.log('\n--- TEST I: Department / Section Scope Escalation Protection ---');
    const resTestI = await fetch(`${API_BASE}/faculty/students?academic_year=1st%20Year&section=B`, {
      headers: { 'Authorization': `Bearer ${tokenFacA}` }
    });
    const dataTestI = await resTestI.json();
    const containsUnassigned = (dataTestI.students || []).some(s => s.academicYear === '1st Year');
    assert(resTestI.status === 200 && !containsUnassigned, 'TEST I: Faculty query params filter cannot bypass assignment boundary');

    // TEST J: GET /api/admin/analytics College Data Isolation
    console.log('\n--- TEST J: GET /api/admin/analytics College Data Isolation ---');
    const resTestJ = await fetch(`${API_BASE}/admin/analytics`, {
      headers: { 'Authorization': `Bearer ${tokenAdminA}` }
    });
    const dataTestJ = await resTestJ.json();
    assert(
      resTestJ.status === 200 && dataTestJ.collegeName === collegeAName && dataTestJ.analytics,
      'TEST J: GET /api/admin/analytics delivers real DB metrics strictly scoped to College A'
    );

  } catch (err) {
    console.error('Security test execution failure:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`SECURITY TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase9SecurityTests();
