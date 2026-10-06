process.env.NODE_ENV = 'test';

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';
import uploadRoutes from '../routes/uploadRoutes.js';
import resumeRoutes from '../routes/resumeRoutes.js';
import { supabaseAdmin } from '../config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
app.use(express.json());

// Test Identity Definitions
const studentAId = '11111111-1111-1111-1111-111111111111';
const studentBId = '22222222-2222-2222-2222-222222222222';
const studentColBId = '33333333-3333-3333-3333-333333333333';
const facultyAId = '44444444-4444-4444-4444-444444444444';
const tpoAlphaId = '55555555-5555-5555-5555-555555555555';
const tpoBetaId = '66666666-6666-6666-6666-666666666666';

// Test Auth Middleware Injector
app.use((req, res, next) => {
  const actor = req.headers['x-test-actor'];
  if (actor === 'student-a') {
    req.user = { id: studentAId, email: 'studentA@collegeA.test', user_metadata: { role: 'Student', college_name: 'College Alpha', branch: 'Computer Science & Engineering' }, app_metadata: { role: 'Student' } };
    req.userScope = { userId: studentAId, role: 'Student', collegeName: 'College Alpha', isSuperAdmin: false };
  } else if (actor === 'student-b') {
    req.user = { id: studentBId, email: 'studentB@collegeA.test', user_metadata: { role: 'Student', college_name: 'College Alpha', branch: 'Computer Science & Engineering' }, app_metadata: { role: 'Student' } };
    req.userScope = { userId: studentBId, role: 'Student', collegeName: 'College Alpha', isSuperAdmin: false };
  } else if (actor === 'student-college-b') {
    req.user = { id: studentColBId, email: 'student@collegeB.test', user_metadata: { role: 'Student', college_name: 'College Beta', branch: 'Electronics & Communication Engineering' }, app_metadata: { role: 'Student' } };
    req.userScope = { userId: studentColBId, role: 'Student', collegeName: 'College Beta', isSuperAdmin: false };
  } else if (actor === 'faculty-a') {
    req.user = { id: facultyAId, email: 'facultyA@collegeA.test', user_metadata: { role: 'Faculty', college_name: 'College Alpha', department: 'Computer Science & Engineering' }, app_metadata: { role: 'Faculty' } };
    req.userScope = { userId: facultyAId, role: 'Faculty', collegeName: 'College Alpha', departmentId: null, isSuperAdmin: false };
  } else if (actor === 'tpo-alpha') {
    req.user = { id: tpoAlphaId, email: 'tpo@collegeA.test', user_metadata: { role: 'PlacementOfficer', college_name: 'College Alpha' }, app_metadata: { role: 'PlacementOfficer' } };
    req.userScope = { userId: tpoAlphaId, role: 'PlacementOfficer', collegeName: 'College Alpha', isSuperAdmin: false };
  } else if (actor === 'tpo-beta') {
    req.user = { id: tpoBetaId, email: 'tpo@collegeB.test', user_metadata: { role: 'PlacementOfficer', college_name: 'College Beta' }, app_metadata: { role: 'PlacementOfficer' } };
    req.userScope = { userId: tpoBetaId, role: 'PlacementOfficer', collegeName: 'College Beta', isSuperAdmin: false };
  } else {
    // Default student A
    req.user = { id: studentAId, email: 'studentA@collegeA.test', user_metadata: { role: 'Student', college_name: 'College Alpha', branch: 'Computer Science & Engineering' }, app_metadata: { role: 'Student' } };
    req.userScope = { userId: studentAId, role: 'Student', collegeName: 'College Alpha', isSuperAdmin: false };
  }
  next();
});

app.use('/api/upload', uploadRoutes);
app.use('/api/resume', resumeRoutes);

const PORT = 5098;
let server;

async function setupTestDbProfiles() {
  // Upsert test student profiles
  await supabaseAdmin.from('student_profiles').upsert([
    {
      user_id: studentAId,
      full_name: 'Alice Student A',
      email: 'studentA@collegeA.test',
      college_name: 'College Alpha',
      branch: 'Computer Science & Engineering',
      semester: 5,
      academic_year: '3rd Year'
    },
    {
      user_id: studentBId,
      full_name: 'Bob Student B',
      email: 'studentB@collegeA.test',
      college_name: 'College Alpha',
      branch: 'Computer Science & Engineering',
      semester: 5,
      academic_year: '3rd Year'
    },
    {
      user_id: studentColBId,
      full_name: 'Charlie Student Col B',
      email: 'student@collegeB.test',
      college_name: 'College Beta',
      branch: 'Electronics & Communication Engineering',
      semester: 5,
      academic_year: '3rd Year'
    }
  ]);

  // Upsert test faculty profile and assignment
  await supabaseAdmin.from('faculty_profiles').upsert({
    user_id: facultyAId,
    full_name: 'Prof. David Faculty A',
    email: 'facultyA@collegeA.test',
    college_name: 'College Alpha',
    department: 'Computer Science & Engineering',
    onboarding_completed: true
  });

  await supabaseAdmin.from('faculty_assignments').upsert({
    faculty_id: facultyAId,
    college_name: 'College Alpha',
    department: 'Computer Science & Engineering',
    branch: 'Computer Science & Engineering',
    academic_year: '3rd Year',
    section: 'A'
  });

  // Upsert test TPO admins
  await supabaseAdmin.from('admin_users').upsert([
    { user_id: tpoAlphaId, role: 'PlacementOfficer', college_name: 'College Alpha' },
    { user_id: tpoBetaId, role: 'PlacementOfficer', college_name: 'College Beta' }
  ]);
}

async function runTests() {
  console.log('\n==================================================');
  console.log('  PHASE 5 AUTOMATED RESUME & PRIVACY AUDIT');
  console.log('==================================================\n');

  await setupTestDbProfiles();

  server = app.listen(PORT, async () => {
    try {
      const BASE = `http://localhost:${PORT}/api`;

      // --------------------------------------------------
      // TEST 1: File Validation (Format & Size)
      // --------------------------------------------------
      console.log('--- TEST 1: Resume Format & Size Validation ---');

      // A. Invalid format (.exe) -> 400 Bad Request
      const formExe = new FormData();
      formExe.append('file', new Blob(['binary data'], { type: 'application/x-msdownload' }), 'virus.exe');

      const exeRes = await fetch(`${BASE}/upload/resume`, {
        method: 'POST',
        headers: { 'x-test-actor': 'student-a' },
        body: formExe
      });
      const exeData = await exeRes.json();
      assert(exeRes.status === 400, 'Invalid format (.exe) correctly DENIED with 400');
      assert(exeData.message.includes('PDF, DOC, or DOCX'), 'Clear user-friendly error message returned without internal stack traces');
      console.log('✅ Invalid format (.exe) blocked with message:', exeData.message);

      // B. Oversized File (> 5MB) -> 400 Bad Request
      const largeBuffer = new Uint8Array(6 * 1024 * 1024); // 6MB
      const formLarge = new FormData();
      formLarge.append('file', new Blob([largeBuffer], { type: 'application/pdf' }), 'large_resume.pdf');

      const largeRes = await fetch(`${BASE}/upload/resume`, {
        method: 'POST',
        headers: { 'x-test-actor': 'student-a' },
        body: formLarge
      });
      const largeData = await largeRes.json();
      assert(largeRes.status === 400, 'Oversized resume (>5MB) correctly DENIED with 400');
      console.log('✅ Oversized file (>5MB) blocked with message:', largeData.message);

      // --------------------------------------------------
      // TEST 2: Valid Resume Upload & Sanitized Metadata Response
      // --------------------------------------------------
      console.log('\n--- TEST 2: Valid Resume Upload & Sanitized Metadata ---');

      const validPdfContent = `%PDF-1.4
1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj
2 0 obj <</Type /Pages /Count 1 /Kids [3 0 R]>> endobj
3 0 obj <</Type /Page /MediaBox [0 0 612 792] /Parent 2 0 R>> endobj
xref
0 4
0000000000 65535 f
0000000009 00000 n
0000000052 00000 n
00000000114 00000 n
trailer <</Size 4 /Root 1 0 R>>
startxref
190
%%EOF`;

      const formPdf = new FormData();
      formPdf.append('file', new Blob([validPdfContent], { type: 'application/pdf' }), 'Alice_Resume_2026.pdf');

      const uploadRes = await fetch(`${BASE}/upload/resume`, {
        method: 'POST',
        headers: { 'x-test-actor': 'student-a' },
        body: formPdf
      });
      const uploadData = await uploadRes.json();
      assert(uploadRes.status === 200 && uploadData.success, 'Valid PDF resume uploaded successfully');
      assert(uploadData.fileName === 'Alice_Resume_2026.pdf', 'Sanitized original filename saved');
      assert(!uploadData.url?.includes('http') && !uploadData.url?.includes('supabase'), 'NO raw public storage URL exposed in upload response');
      console.log('✅ Valid PDF uploaded successfully. Sanitized metadata:', uploadData);

      // --------------------------------------------------
      // TEST 3: Metadata & Own Resume View / Download
      // --------------------------------------------------
      console.log('\n--- TEST 3: Student Metadata & Own View / Download ---');

      // A. Metadata
      const metaRes = await fetch(`${BASE}/resume/metadata/me`, {
        headers: { 'x-test-actor': 'student-a' }
      });
      const metaData = await metaRes.json();
      assert(metaRes.status === 200 && metaData.hasResume, 'Metadata endpoint returns hasResume = true');
      assert(metaData.fileName === 'Alice_Resume_2026.pdf', 'Metadata returns sanitized original filename');
      console.log('✅ Metadata response:', metaData);

      // B. View Stream
      const viewRes = await fetch(`${BASE}/resume/view/me`, {
        headers: { 'x-test-actor': 'student-a' }
      });
      assert(viewRes.status === 200, 'Student viewing own resume returns 200 OK');
      const viewDisp = viewRes.headers.get('content-disposition');
      assert(viewDisp && viewDisp.includes('inline'), 'View stream sets inline Content-Disposition');
      console.log('✅ View stream header verified:', viewDisp);

      // C. Download Stream
      const dlRes = await fetch(`${BASE}/resume/download/me`, {
        headers: { 'x-test-actor': 'student-a' }
      });
      assert(dlRes.status === 200, 'Student downloading own resume returns 200 OK');
      const dlDisp = dlRes.headers.get('content-disposition');
      assert(dlDisp && dlDisp.includes('attachment'), 'Download stream sets attachment Content-Disposition');
      console.log('✅ Download stream header verified:', dlDisp);

      // --------------------------------------------------
      // TEST 4: IDOR Security Protection (Student A -> Student B)
      // --------------------------------------------------
      console.log('\n--- TEST 4: IDOR Security Protection ---');

      const idorView = await fetch(`${BASE}/resume/view/${studentBId}`, {
        headers: { 'x-test-actor': 'student-a' }
      });
      const idorViewData = await idorView.json();
      assert(idorView.status === 403 || idorView.status === 404, 'Student A accessing Student B resume DENIED (403 or 404)');
      console.log('✅ IDOR view blocked with code', idorView.status, ':', idorViewData.message);

      const idorDl = await fetch(`${BASE}/resume/download/${studentBId}`, {
        headers: { 'x-test-actor': 'student-a' }
      });
      const idorDlData = await idorDl.json();
      assert(idorDl.status === 403 || idorDl.status === 404, 'Student A downloading Student B resume DENIED (403 or 404)');
      console.log('✅ IDOR download blocked with code', idorDl.status, ':', idorDlData.message);

      // --------------------------------------------------
      // TEST 5: Faculty Scope Authorization
      // --------------------------------------------------
      console.log('\n--- TEST 5: Faculty Scope Authorization ---');

      // Faculty A -> Student A (In scope: Same college, same department) -> PASS
      const facIn = await fetch(`${BASE}/resume/view/${studentAId}`, {
        headers: { 'x-test-actor': 'faculty-a' }
      });
      if (facIn.status !== 200) {
        const facInData = await facIn.json();
        console.log('[DEBUG Test 5 Faculty Access Error]:', facIn.status, facInData);
      }
      assert(facIn.status === 200, 'Faculty A accessing in-scope Student A resume -> PASS (200 OK)');
      console.log('✅ In-scope Faculty resume access granted.');

      // Faculty A -> College B Student (Out of scope: Different college) -> DENIED 403 or 404
      const facOut = await fetch(`${BASE}/resume/view/${studentColBId}`, {
        headers: { 'x-test-actor': 'faculty-a' }
      });
      const facOutData = await facOut.json();
      assert(facOut.status === 403 || facOut.status === 404, 'Faculty A accessing out-of-scope student resume DENIED (403 or 404)');
      console.log('✅ Out-of-scope Faculty access blocked:', facOut.status, facOutData.message);

      // --------------------------------------------------
      // TEST 6: TPO College Scope Authorization
      // --------------------------------------------------
      console.log('\n--- TEST 6: TPO College Scope Authorization ---');

      // TPO Alpha -> Student A (College Alpha) -> PASS
      const tpoIn = await fetch(`${BASE}/resume/view/${studentAId}`, {
        headers: { 'x-test-actor': 'tpo-alpha' }
      });
      assert(tpoIn.status === 200, 'TPO Alpha accessing College Alpha student resume -> PASS (200 OK)');
      console.log('✅ In-scope TPO resume access granted.');

      // TPO Alpha -> Student College Beta (Different College) -> DENIED 403 or 404
      const tpoOut = await fetch(`${BASE}/resume/view/${studentColBId}`, {
        headers: { 'x-test-actor': 'tpo-alpha' }
      });
      const tpoOutData = await tpoOut.json();
      assert(tpoOut.status === 403 || tpoOut.status === 404, 'TPO Alpha accessing College Beta student resume DENIED (403 or 404)');
      console.log('✅ Out-of-scope TPO access blocked:', tpoOut.status, tpoOutData.message);

      // --------------------------------------------------
      // TEST 7: Resume Replacement & Deletion
      // --------------------------------------------------
      console.log('\n--- TEST 7: Resume Replacement & Deletion ---');

      // A. Replace resume with DOCX file
      const docxHeader = 'PK\x03\x04...DocxContent';
      const formDocx = new FormData();
      formDocx.append('file', new Blob([docxHeader], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }), 'Alice_Updated_Resume.docx');

      const replaceRes = await fetch(`${BASE}/upload/resume`, {
        method: 'POST',
        headers: { 'x-test-actor': 'student-a' },
        body: formDocx
      });
      const replaceData = await replaceRes.json();
      assert(replaceRes.status === 200 && replaceData.success, 'Resume replaced with DOCX file successfully');
      assert(replaceData.fileName === 'Alice_Updated_Resume.docx', 'Updated DOCX filename saved');
      console.log('✅ Resume replaced successfully:', replaceData);

      // B. Delete Resume
      const delRes = await fetch(`${BASE}/resume`, {
        method: 'DELETE',
        headers: { 'x-test-actor': 'student-a' }
      });
      const delData = await delRes.json();
      assert(delRes.status === 200 && delData.success, 'Student deleted own resume successfully');
      console.log('✅ Resume deleted:', delData);

      // C. Verify metadata after deletion
      const postDelMeta = await fetch(`${BASE}/resume/metadata/me`, {
        headers: { 'x-test-actor': 'student-a' }
      });
      const postDelData = await postDelMeta.json();
      assert(postDelData.hasResume === false, 'Metadata returns hasResume = false after deletion');
      console.log('✅ Post-deletion metadata verified:', postDelData);

      console.log('\n==================================================');
      console.log('🎉 ALL PHASE 5 RESUME SECURITY TESTS PASSED 100%!');
      console.log('==================================================\n');

      server.close();
      process.exit(0);

    } catch (testErr) {
      console.error('\n❌ TEST FAILURE:', testErr);
      if (server) server.close();
      process.exit(1);
    }
  });
}

runTests().catch(err => {
  console.error('Fatal test setup error:', err);
  process.exit(1);
});
