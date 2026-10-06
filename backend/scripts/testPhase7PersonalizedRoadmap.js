import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import { supabaseAdmin } from '../config/supabase.js';

const API_BASE = 'http://localhost:5000/api';

async function runPhase7Tests() {
  console.log('====================================================');
  console.log('CAREERPILOT AI - PHASE 7 AUTOMATED TEST SUITE');
  console.log('PERSONALIZED AI CAREER ROADMAP ENGINE');
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
    // 1. Authenticate test student user (student.cse@careerpilot.ai)
    console.log('--- TEST 1: Student Login & Auth Token ---');
    const studentLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'student.cse@careerpilot.ai',
        password: 'Password123!'
      })
    });
    const studentLoginData = await studentLoginRes.json();
    const studentToken = studentLoginData.session?.access_token || studentLoginData.token;
    const studentUserId = studentLoginData.user?.id;
    assert(studentLoginRes.status === 200 && studentToken, 'Student logged in successfully and received JWT token.');

    // Ensure student profile is assigned to College A and 3rd Year for Faculty assignment test
    const { data: profCheck } = await supabaseAdmin.from('student_profiles').select('*').eq('email', 'student.cse@careerpilot.ai');
    console.log('[DEBUG PROF CHECK]', profCheck, 'studentUserId:', studentUserId);
    if (profCheck && profCheck.length > 0) {
      const { error: updErr } = await supabaseAdmin
        .from('student_profiles')
        .update({ user_id: studentUserId, college_name: 'College A Institute of Technology', semester: 5 })
        .eq('email', 'student.cse@careerpilot.ai');
      if (updErr) console.error('[UPDATE ERR]', updErr);
    } else {
      await supabaseAdmin
        .from('student_profiles')
        .insert({
          user_id: studentUserId,
          email: 'student.cse@careerpilot.ai',
          full_name: 'Student CSE',
          college_name: 'College A Institute of Technology',
          semester: 5
        });
    }

    // 2. Fetch/Generate Student Roadmap via API
    console.log('\n--- TEST 2: Personal AI Roadmap Generation ---');
    const genRes = await fetch(`${API_BASE}/roadmap/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({ targetRole: 'Full Stack Engineer' })
    });
    const genData = await genRes.json();
    assert(genRes.status === 200 && genData.success, 'AI Roadmap generated via POST /api/roadmap/generate');
    assert(genData.roadmap && genData.roadmap.structured_data, 'Roadmap contains structured_data JSON payload');

    const structured = genData.roadmap?.structured_data;
    assert(structured?.baseline?.currentLevel, 'Structured output contains student baseline audit');
    assert(Array.isArray(structured?.careerOptions) && structured.careerOptions.length > 0, 'Structured output contains career relevance options');
    assert(Array.isArray(structured?.skillGaps) && structured.skillGaps.length > 0, 'Structured output contains prioritized skill gap audit');
    assert(Array.isArray(structured?.milestones) && structured.milestones.length === 4, 'Structured output contains 4 learning phase milestones');

    // 3. Database Persistence Verification
    console.log('\n--- TEST 3: Database Source of Truth Persistence ---');
    const { data: dbRoadmap } = await supabaseAdmin
      .from('roadmaps')
      .select('*')
      .eq('user_id', studentUserId)
      .maybeSingle();

    const { data: topicsData } = dbRoadmap ? await supabaseAdmin.from('roadmap_topics').select('*').eq('roadmap_id', dbRoadmap.id) : { data: [] };

    const isPersisted = !!(dbRoadmap && (dbRoadmap.structured_data || (dbRoadmap.description && dbRoadmap.description.trim().startsWith('{'))));
    assert(isPersisted, 'Roadmap is persisted in PostgreSQL roadmaps table');
    assert(topicsData && topicsData.length > 0, 'Relational topic records inserted into roadmap_topics table');

    // 4. Topic Progress Toggling
    console.log('\n--- TEST 4: Topic Progress Toggling ---');
    const toggleRes = await fetch(`${API_BASE}/roadmap/toggle-topic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({ phaseIdx: 0, topicId: 'p1_t1', completed: true })
    });
    const toggleData = await toggleRes.json();
    assert(toggleRes.status === 200 && toggleData.success, 'Topic completion status updated via POST /api/roadmap/toggle-topic');

    // 5. Faculty Authorization Boundary Test
    console.log('\n--- TEST 5: Faculty Roadmap Access Authorization ---');
    const { data: { users: authUsers } } = await supabaseAdmin.auth.admin.listUsers();
    const facUser = authUsers?.find(u => u.email === 'faculty@careerpilot.ai');
    if (facUser) {
      await supabaseAdmin.auth.admin.updateUserById(facUser.id, {
        password: 'TemporaryPassword123!',
        user_metadata: { role: 'Faculty', full_name: 'Faculty Member', college_name: 'College A Institute of Technology' },
        app_metadata: { role: 'Faculty' }
      });
      await supabaseAdmin.from('faculty_profiles').upsert({
        user_id: facUser.id,
        email: 'faculty@careerpilot.ai',
        full_name: 'Faculty Member',
        college_name: 'College A Institute of Technology'
      }, { onConflict: 'user_id' });
    }

    const facultyLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'faculty@careerpilot.ai',
        password: 'TemporaryPassword123!'
      })
    });
    const facultyLoginData = await facultyLoginRes.json();
    const facultyToken = facultyLoginData.session?.access_token || facultyLoginData.token;
    assert(facultyLoginRes.status === 200 && facultyToken, 'Faculty logged in successfully');

    // Authorized access to assigned student roadmap
    const facultyAuthRoadmapRes = await fetch(`${API_BASE}/faculty/students/${studentUserId}/roadmap`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${facultyToken}` }
    });
    const facultyAuthData = await facultyAuthRoadmapRes.json();
    console.log('[DEBUG TEST 5] status:', facultyAuthRoadmapRes.status, 'data:', JSON.stringify(facultyAuthData));
    assert(facultyAuthRoadmapRes.status === 200 && facultyAuthData.success, 'Assigned Faculty can retrieve student roadmap');

    // Unauthorized student trying to call faculty roadmap endpoint
    console.log('\n--- TEST 6: Student Security & Role Barrier ---');
    const unauthorizedRes = await fetch(`${API_BASE}/faculty/students/${studentUserId}/roadmap`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert(unauthorizedRes.status === 403, 'Student calling faculty roadmap endpoint rejected with HTTP 403 Forbidden');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase7Tests();
