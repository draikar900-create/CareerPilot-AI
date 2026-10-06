import { supabaseAdmin, supabaseAuth } from '../config/supabase.js';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('================================================================');
  console.log('  CAREERPILOT AI - STUDENT ONBOARDING & PROFILE VERIFICATION   ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, desc) => {
    if (condition) {
      console.log(`  [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${desc}`);
      failed++;
    }
  };

  const testEmail = `onboarding_test_${Date.now()}@college.edu`;
  const testPassword = 'Password123!';
  let testUserId = null;
  let authToken = null;

  try {
    // 1. Create a test student account
    console.log('--- 1. Creating New Test Student Account ---');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Test Onboarding Student',
        role: 'Student'
      }
    });

    if (authError || !authData.user) {
      throw new Error('Failed to create test user: ' + authError?.message);
    }
    testUserId = authData.user.id;
    console.log(`Created user: ${testEmail} (ID: ${testUserId})`);

    // Log in as this student to obtain JWT
    const { data: sessionData, error: sessionError } = await supabaseAuth.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (sessionError || !sessionData.session) {
      throw new Error('Sign in failed: ' + sessionError?.message);
    }
    authToken = sessionData.session.access_token;
    console.log('Obtained JWT token.\n');

    // TEST 1: New student login → onboarding is incomplete
    console.log('--- TEST 1: First Login Check & Incomplete Onboarding ---');
    const res1 = await fetch(`${BASE_URL}/profile`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data1 = await res1.json();
    assert(data1.success === true, 'GET /api/profile returns HTTP 200');
    assert(data1.profile.onboarding_completed === false, 'New student has onboarding_completed = false');
    assert(data1.profile.current_onboarding_step === 1, 'Initial onboarding step is 1');

    // TEST 2: Complete basic information (Step 2) → save progress → reload → step preserved
    console.log('\n--- TEST 2: Save Progress (Step 2) & Persistence Check ---');
    const res2 = await fetch(`${BASE_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        full_name: 'Alex Morgan',
        phone: '+91 9876543210',
        current_onboarding_step: 3
      })
    });
    const data2 = await res2.json();
    assert(data2.success === true, 'PUT /api/profile saves basic information');
    assert(data2.profile.current_onboarding_step === 3, 'current_onboarding_step persisted as 3');

    // Verify retrieval after simulated logout/login
    const reloadRes = await fetch(`${BASE_URL}/profile`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const reloadData = await reloadRes.json();
    assert(reloadData.profile.current_onboarding_step === 3, 'Re-login restores current_onboarding_step = 3');
    assert(reloadData.profile.phone === '+91 9876543210', 'Phone number persisted correctly');

    // TEST 6: First-year student setup (Fresher can skip CGPA and resume)
    console.log('\n--- TEST 6: First-Year Student (Optional CGPA / Resume) ---');
    const fresherRes = await fetch(`${BASE_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        academic_year: '1st Year',
        semester: 1,
        college_name: 'National Tech Institute',
        branch: 'Computer Science and Engineering',
        current_onboarding_step: 4
      })
    });
    const fresherData = await fresherRes.json();
    assert(fresherData.success === true, '1st-Year profile saved without CGPA or resume');
    assert(fresherData.profile.semester === 1, 'Semester 1 stored');
    assert(fresherData.profile.cgpa === null || fresherData.profile.cgpa === undefined || Number(fresherData.profile.cgpa) === 0, 'CGPA safely omitted/zero');

    // TEST 7: Technical skills and career goals update
    console.log('\n--- TEST 7: Skills & Career Information ---');
    const skillsRes = await fetch(`${BASE_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        technical_skills: ['Python', 'JavaScript', 'SQL', 'Git/GitHub'],
        target_role: 'Full Stack Software Engineer',
        preferred_domains: ['Web Platforms', 'Artificial Intelligence'],
        current_onboarding_step: 7
      })
    });
    const skillsData = await skillsRes.json();
    assert(skillsData.success === true, 'Technical skills and target role updated');
    assert(skillsData.profile.technical_skills.length === 4, 'Skills array has 4 items');
    assert(skillsData.profile.target_role === 'Full Stack Software Engineer', 'Target role matches');

    // TEST 3 & 4: Final completion → onboarding_completed = true → direct dashboard access
    console.log('\n--- TEST 3 & 4: Complete Onboarding & Re-Login Dashboard Check ---');
    const finishRes = await fetch(`${BASE_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        onboarding_completed: true,
        current_onboarding_step: 8
      })
    });
    const finishData = await finishRes.json();
    assert(finishData.success === true, 'Final submit succeeds');
    assert(finishData.profile.onboarding_completed === true, 'onboarding_completed is TRUE');

    // Subsequent fetch simulates future logins
    const loginAgainRes = await fetch(`${BASE_URL}/profile`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const loginAgainData = await loginAgainRes.json();
    assert(loginAgainData.profile.onboarding_completed === true, 'Subsequent login confirms onboarding is complete');

    // TEST 9: Edit profile after onboarding without resetting onboarding_completed
    console.log('\n--- TEST 9: Edit Profile After Onboarding ---');
    const editRes = await fetch(`${BASE_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: '+91 9123456780',
        github_url: 'https://github.com/alexmorgan-dev'
      })
    });
    const editData = await editRes.json();
    assert(editData.success === true, 'Edit profile succeeds');
    assert(editData.profile.phone === '+91 9123456780', 'Phone updated in edit profile');
    assert(editData.profile.github_url === 'https://github.com/alexmorgan-dev', 'GitHub URL updated in edit profile');
    assert(editData.profile.onboarding_completed === true, 'onboarding_completed remains TRUE after edit');

    // TEST 11: Security — Student cannot access or overwrite another student's profile
    console.log('\n--- TEST 11: Security & Identity Derivation ---');
    // Backend derives identity strictly from req.user.id in JWT, ignoring any injected user_id in body
    const tamperRes = await fetch(`${BASE_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: '00000000-0000-0000-0000-000000000000',
        full_name: 'Hacked Profile'
      })
    });
    const tamperData = await tamperRes.json();
    assert(tamperData.profile.user_id === testUserId, 'Backend enforces authenticated user_id; ignores tampered body ID');

    // TEST 12: Admin & Faculty Login Integrity
    console.log('\n--- TEST 12: Faculty & Admin Route Protection ---');
    const facultyBarrierRes = await fetch(`${BASE_URL}/faculty/dashboard`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    assert(facultyBarrierRes.status === 403, 'Student cannot access Faculty portal (HTTP 403)');

    const adminBarrierRes = await fetch(`${BASE_URL}/admin/students`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    assert(adminBarrierRes.status === 403, 'Student cannot access Admin portal (HTTP 403)');

    console.log('\n================================================================');
    console.log(`  RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log('================================================================');

  } catch (err) {
    console.error('Fatal error during test run:', err);
  } finally {
    if (testUserId) {
      await supabaseAdmin.auth.admin.deleteUser(testUserId).catch(() => {});
      console.log(`Cleaned up test user ${testUserId}.`);
    }
  }
}

runTests();
