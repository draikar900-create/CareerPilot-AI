/**
 * Automated Test Suite for Phase 3 — Complete Faculty Student Management + Content/Learning Features
 */

process.env.NODE_ENV = 'test';

import { supabaseAdmin } from '../config/supabase.js';
import express from 'express';
import facultyRoutes, { normalizeYouTubeUrl } from '../routes/facultyRoutes.js';

const testCollegeId = '00000000-0000-0000-0000-000000000001';
const testDeptId = '00000000-0000-0000-0000-000000000002';
const testFacultyId = '00000000-0000-0000-0000-000000000010';
const testStudentId = '00000000-0000-0000-0000-000000000020';

const app = express();
app.use(express.json());

// Mock Auth Middleware for testing
app.use((req, res, next) => {
  if (req.headers['x-test-user-type'] === 'unauthorized-faculty') {
    req.user = { id: '00000000-0000-0000-0000-000000000099', user_metadata: { role: 'Faculty' } };
    req.userRole = 'Faculty';
  } else if (req.headers['x-test-user-type'] === 'student') {
    req.user = { id: testStudentId, user_metadata: { role: 'Student' } };
    req.userRole = 'Student';
  } else {
    req.user = { id: testFacultyId, user_metadata: { role: 'Faculty', full_name: 'Dr. Alan Turing' } };
    req.userRole = 'Faculty';
  }
  next();
});

app.use('/api/faculty', facultyRoutes);

async function runPhase3Tests() {
  console.log('====================================================');
  console.log('STARTING PHASE 3 TEST SUITE: FACULTY PORTAL & RESOURCES');
  console.log('====================================================\n');

  // Start temporary HTTP server on port 5999
  const server = app.listen(5999);
  const BASE_URL = 'http://localhost:5999/api/faculty';

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
    // 1. YouTube URL Normalization Test
    console.log('--- Test 1: YouTube URL Normalization ---');
    if (typeof normalizeYouTubeUrl === 'function') {
      const url1 = normalizeYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      assert(url1 && url1.embedUrl.includes('embed/dQw4w9WgXcQ'), 'Standard watch URL normalized correctly');

      const url2 = normalizeYouTubeUrl('https://youtu.be/dQw4w9WgXcQ');
      assert(url2 && url2.embedUrl.includes('embed/dQw4w9WgXcQ'), 'Shortened youtu.be URL normalized correctly');

      const url3 = normalizeYouTubeUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ');
      assert(url3 && url3.embedUrl.includes('embed/dQw4w9WgXcQ'), 'YouTube Shorts URL normalized correctly');

      const urlInvalid = normalizeYouTubeUrl('https://invalid-domain.com/video');
      assert(urlInvalid === null, 'Invalid non-YouTube URL returns null');
    } else {
      assert(false, 'normalizeYouTubeUrl function exists in facultyRoutes');
    }

    // Setup Mock DB Records
    console.log('\n--- Setting Up Mock Database Records for Testing ---');

    await supabaseAdmin.from('colleges').upsert({
      id: testCollegeId,
      name: 'Phase 3 Test Institute of Technology',
      code: 'P3TIT'
    });

    await supabaseAdmin.from('departments').upsert({
      id: testDeptId,
      college_id: testCollegeId,
      name: 'Computer Science & Engineering',
      code: 'CSE'
    });

    const { error: fErr } = await supabaseAdmin.from('faculty_profiles').upsert({
      id: testFacultyId,
      user_id: testFacultyId,
      full_name: 'Dr. Alan Turing',
      email: 'alan.turing@p3test.edu',
      employee_id: 'FAC-P3-001',
      college_id: testCollegeId,
      college_name: 'Phase 3 Test Institute of Technology',
      department_id: testDeptId,
      department: 'Computer Science & Engineering',
      designation: 'Professor',
      onboarding_completed: true,
      assignments: [
        { branch: 'CSE', academic_year: '3rd Year', section: 'A' },
        { branch: 'CSE', academic_year: '4th Year', section: 'B' }
      ]
    });
    if (fErr) console.warn('Faculty upsert notice:', fErr.message);

    let targetTestStudentId = testStudentId;
    const { data: existingStudents } = await supabaseAdmin
      .from('student_profiles')
      .select('user_id, college_name, branch, semester')
      .limit(1);

    if (existingStudents && existingStudents.length > 0) {
      targetTestStudentId = existingStudents[0].user_id;
      await supabaseAdmin.from('student_profiles').update({
        college_name: 'Phase 3 Test Institute of Technology',
        branch: 'Computer Science & Engineering',
        semester: 5
      }).eq('user_id', targetTestStudentId);
      console.log(`[Test Setup] Reusing existing DB student profile: ${targetTestStudentId}`);
    } else {
      try {
        const { data: newUser } = await supabaseAdmin.auth.admin.createUser({
          email: 'grace.hopper@p3test.edu',
          password: 'TestPassword123!',
          email_confirm: true,
          user_metadata: { role: 'Student' }
        });
        if (newUser?.user) targetTestStudentId = newUser.user.id;
      } catch (uErr) {}

      const { error: sErr } = await supabaseAdmin.from('student_profiles').upsert({
        user_id: targetTestStudentId,
        full_name: 'Grace Hopper',
        email: 'grace.hopper@p3test.edu',
        college_name: 'Phase 3 Test Institute of Technology',
        branch: 'Computer Science & Engineering',
        semester: 5
      });
      if (sErr) console.warn('Student upsert notice:', sErr.message);
    }

    // 2. Learning Resource Creation within Authorized Scope
    console.log('\n--- Test 2: Create Learning Resource in Authorized Scope ---');
    const createRes = await fetch(`${BASE_URL}/resources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-test-user-type': 'authorized-faculty'
      },
      body: JSON.stringify({
        title: 'DBMS B+ Tree Indexing Lecture',
        description: 'Comprehensive guide to multi-level index structures.',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        type: 'Video',
        branch: 'CSE',
        academicYear: '3rd Year',
        section: 'A',
        subject: 'Database Management Systems',
        topic: 'Indexing'
      })
    });

    const createData = await createRes.json();
    if (createRes.status !== 201) console.log('[Test 2 Error Details]:', createRes.status, createData);
    assert(createRes.status === 201 && createData.success, 'Faculty successfully created resource in authorized scope');
    const createdResourceId = createData.resource?.id;

    // 3. Learning Resource Creation outside Scope (Denied)
    console.log('\n--- Test 3: Block Resource Creation outside Scope ---');
    const invalidScopeRes = await fetch(`${BASE_URL}/resources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-test-user-type': 'authorized-faculty'
      },
      body: JSON.stringify({
        title: 'Unauthorized ECE Circuits Video',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        branch: 'Mechanical Engineering', // Faculty only authorized for CSE
        academicYear: '1st Year'
      })
    });

    assert(invalidScopeRes.status === 403, 'Backend blocked faculty from creating resource for unauthorized branch (403 Forbidden)');

    // 4. GET Faculty Resources
    console.log('\n--- Test 4: Retrieve Faculty Resources ---');
    const getRes = await fetch(`${BASE_URL}/resources`, {
      headers: { 'x-test-user-type': 'authorized-faculty' }
    });
    const getData = await getRes.json();
    assert(getRes.status === 200 && Array.isArray(getData.resources), 'Faculty fetched published resources list');

    // 5. UPDATE Learning Resource
    if (createdResourceId) {
      console.log('\n--- Test 5: Update Learning Resource ---');
      const updateRes = await fetch(`${BASE_URL}/resources/${createdResourceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-test-user-type': 'authorized-faculty'
        },
        body: JSON.stringify({
          title: 'DBMS B+ Tree Indexing Lecture (Updated Edition)',
          description: 'Updated with B-Tree vs B+ Tree comparisons.'
        })
      });
      const updateData = await updateRes.json();
      assert(updateRes.status === 200 && updateData.success, 'Faculty updated learning resource');
    }

    // 6. Confidential Faculty Student Notes CRUD
    console.log('\n--- Test 6: Faculty Student Notes CRUD ---');
    const createNoteRes = await fetch(`${BASE_URL}/students/${targetTestStudentId}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-test-user-type': 'authorized-faculty'
      },
      body: JSON.stringify({
        note: 'Excellent performance in SQL queries. Needs practice in transaction ACID properties.',
        category: 'Academic',
        isPrivate: true
      })
    });
    const noteData = await createNoteRes.json();
    if (createNoteRes.status !== 201) console.log('[Test 6 Error Details]:', createNoteRes.status, noteData);
    assert(createNoteRes.status === 201 && noteData.success, 'Faculty recorded observation note for student');
    const createdNoteId = noteData.note?.id;

    const getNotesRes = await fetch(`${BASE_URL}/students/${targetTestStudentId}/notes`, {
      headers: { 'x-test-user-type': 'authorized-faculty' }
    });
    const notesListData = await getNotesRes.json();
    if (getNotesRes.status !== 200) console.log('[Test 6 GET Error Details]:', getNotesRes.status, notesListData);
    assert(getNotesRes.status === 200 && Array.isArray(notesListData.notes), 'Faculty retrieved student observation notes');

    if (createdNoteId) {
      const deleteNoteRes = await fetch(`${BASE_URL}/students/${targetTestStudentId}/notes/${createdNoteId}`, {
        method: 'DELETE',
        headers: { 'x-test-user-type': 'authorized-faculty' }
      });
      const deleteNoteData = await deleteNoteRes.json();
      assert(deleteNoteRes.status === 200 && deleteNoteData.success, 'Faculty deleted observation note');
    }

    // 7. Secure Student Resume Endpoint
    console.log('\n--- Test 7: Secure Student Resume Access ---');
    const resumeRes = await fetch(`${BASE_URL}/students/${targetTestStudentId}/resume`, {
      headers: { 'x-test-user-type': 'authorized-faculty' }
    });
    const resumeData = await resumeRes.json();
    if (resumeRes.status !== 200) console.log('[Test 7 Error Details]:', resumeRes.status, resumeData);
    assert(resumeRes.status === 200 && resumeData.success, 'Secure resume proxy endpoint checked student authorization');

    // 8. Class Scheduling & Deletion
    console.log('\n--- Test 8: Class Scheduling & Deletion ---');
    const createClassRes = await fetch(`${BASE_URL}/classes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-test-user-type': 'authorized-faculty'
      },
      body: JSON.stringify({
        title: 'Phase 3 Verification Masterclass',
        subject: 'Algorithms',
        class_date: new Date().toISOString(),
        academic_year: '3rd Year',
        section: 'A',
        meeting_url: 'https://meet.google.com/test-p3-meet'
      })
    });
    const classData = await createClassRes.json();
    assert(createClassRes.status === 201 && classData.success, 'Scheduled new faculty training class');
    const createdClassId = classData.class?.id;

    if (createdClassId) {
      const deleteClassRes = await fetch(`${BASE_URL}/classes/${createdClassId}`, {
        method: 'DELETE',
        headers: { 'x-test-user-type': 'authorized-faculty' }
      });
      const deleteClassData = await deleteClassRes.json();
      assert(deleteClassRes.status === 200 && deleteClassData.success, 'Faculty deleted scheduled training class');
    }

    // Clean up created resource
    if (createdResourceId) {
      await fetch(`${BASE_URL}/resources/${createdResourceId}`, {
        method: 'DELETE',
        headers: { 'x-test-user-type': 'authorized-faculty' }
      });
    }

    // Clean up mock DB records
    await supabaseAdmin.from('faculty_profiles').delete().eq('id', testFacultyId);
    await supabaseAdmin.from('student_profiles').delete().eq('id', testStudentId);

  } catch (err) {
    console.error('Unhandled exception during Phase 3 tests:', err);
    failed++;
  } finally {
    server.close();
  }

  console.log('\n====================================================');
  console.log(`PHASE 3 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase3Tests();
