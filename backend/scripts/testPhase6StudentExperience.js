process.env.NODE_ENV = 'test';

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';

import profileRoutes from '../routes/profileRoutes.js';
import careerRoutes from '../routes/careerRoutes.js';
import assessmentRoutes from '../routes/assessmentRoutes.js';
import mlRoutes from '../routes/mlRoutes.js';
import learningRoutes from '../routes/learningRoutes.js';
import resumeRoutes from '../routes/resumeRoutes.js';
import { supabaseAdmin } from '../config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
app.use(express.json());

// Test Identity Definitions
const studentAId = '10101010-1010-1010-1010-101010101010';
const studentBId = '20202020-2020-2020-2020-202020202020';
const facultyAId = '30303030-3030-3030-3030-303030303030';

// Mock Auth Middleware Injector based on x-test-actor header
app.use((req, res, next) => {
  const actor = req.headers['x-test-actor'] || 'student-a';
  if (actor === 'student-a') {
    req.user = {
      id: studentAId,
      email: 'bob.student@collegea.edu',
      user_metadata: {
        full_name: 'Bob Student',
        role: 'Student',
        branch: 'Computer Science',
        semester: 6,
        academic_year: '3rd Year',
        target_role: 'Full Stack Engineer'
      },
      app_metadata: { role: 'Student' }
    };
    req.userScope = { userId: studentAId, role: 'Student', collegeName: 'College Alpha', isSuperAdmin: false };
  } else if (actor === 'student-b') {
    req.user = {
      id: studentBId,
      email: 'alice.student@collegea.edu',
      user_metadata: {
        full_name: 'Alice Student',
        role: 'Student',
        branch: 'Electronics',
        semester: 2,
        academic_year: '1st Year',
        target_role: 'Data Analyst'
      },
      app_metadata: { role: 'Student' }
    };
    req.userScope = { userId: studentBId, role: 'Student', collegeName: 'College Alpha', isSuperAdmin: false };
  } else if (actor === 'faculty-a') {
    req.user = {
      id: facultyAId,
      email: 'prof.smith@collegea.edu',
      user_metadata: {
        full_name: 'Prof. Smith',
        role: 'Faculty',
        college_name: 'College Alpha',
        department: 'Computer Science'
      },
      app_metadata: { role: 'Faculty' }
    };
    req.userScope = { userId: facultyAId, role: 'Faculty', collegeName: 'College Alpha', isSuperAdmin: false };
  }
  next();
});

// Mount routes exactly as server.js
app.use('/api/profile', profileRoutes);
app.use('/api', careerRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/resume', resumeRoutes);

async function runAudit() {
  console.log('\n==================================================');
  console.log('  PHASE 6 AUTOMATED STUDENT EXPERIENCE & ML AUDIT');
  console.log('==================================================\n');

  const server = app.listen(0, async () => {
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}/api`;

    try {
      // Setup DB records for Student A
      await supabaseAdmin.from('student_profiles').upsert({
        user_id: studentAId,
        full_name: 'Bob Student',
        email: 'bob.student@collegea.edu',
        college_name: 'College Alpha',
        branch: 'Computer Science',
        semester: 6,
        cgpa: 8.4,
        graduation_year: 2027,
        technical_skills: ['HTML/CSS', 'JavaScript', 'React', 'Node.js'],
        github_url: 'https://github.com/bobstudent',
        linkedin_url: 'https://linkedin.com/in/bobstudent'
      });

      // --- TEST 1: Student Dashboard & Real Profile Completion ---
      console.log('--- TEST 1: Real Profile Completion & Dashboard Metrics ---');
      const dashRes = await fetch(`${baseUrl}/dashboard`, {
        headers: { 'x-test-actor': 'student-a' }
      });
      const dashData = await dashRes.json();

      assert.strictEqual(dashRes.status, 200);
      assert.strictEqual(dashData.success, true);
      assert.ok(dashData.dashboard.profileCompletion);
      assert.ok(typeof dashData.dashboard.profileCompletion.percentage === 'number');
      assert.ok(Array.isArray(dashData.dashboard.profileCompletion.missingFields));

      console.log(`✅ Dashboard fetched cleanly. Profile completion: ${dashData.dashboard.profileCompletion.percentage}%`);
      console.log(`Actionable missing fields (${dashData.dashboard.profileCompletion.missingFields.length}):`, dashData.dashboard.profileCompletion.missingFields.map(m => m.title));

      // --- TEST 2: Dynamic Skill Gap Analysis ---
      console.log('\n--- TEST 2: Real Skill Gap Analysis ---');
      const skillRes = await fetch(`${baseUrl}/skill-insights`, {
        headers: { 'x-test-actor': 'student-a' }
      });
      const skillData = await skillRes.json();

      assert.strictEqual(skillRes.status, 200);
      assert.strictEqual(skillData.success, true);
      assert.ok(skillData.gapAnalysis);
      assert.ok(typeof skillData.gapAnalysis.matchPercentage === 'number');
      assert.ok(Array.isArray(skillData.gapAnalysis.missingSkills));
      assert.ok(Array.isArray(skillData.gapAnalysis.matchedSkills));

      console.log(`✅ Skill insights verified for target role: "${skillData.targetRole}"`);
      console.log(`Matched Skills (${skillData.gapAnalysis.matchedSkills.length}):`, skillData.gapAnalysis.matchedSkills);
      console.log(`Missing Skills (${skillData.gapAnalysis.missingSkills.length}):`, skillData.gapAnalysis.missingSkills);
      console.log(`Match Percentage: ${skillData.gapAnalysis.matchPercentage}%`);

      // --- TEST 3: Assessment Answer Key Stripping & Server Scoring ---
      console.log('\n--- TEST 3: Assessment Answer Key Stripping & Server Scoring ---');
      const qRes = await fetch(`${baseUrl}/assessment/current`, {
        headers: { 'x-test-actor': 'student-a' }
      });
      const qData = await qRes.json();

      assert.strictEqual(qRes.status, 200);
      assert.ok(qData.questions && qData.questions.length > 0);

      // Verify answer keys are strictly stripped
      qData.questions.forEach(q => {
        assert.strictEqual(q.correctOption, undefined, 'Answer key must not be exposed in GET /assessment/current');
        assert.strictEqual(q.correct_option_index, undefined, 'Answer key index must not be exposed');
      });
      console.log(`✅ ${qData.questions.length} questions fetched. Answer keys strictly stripped.`);

      // Start attempt
      const startRes = await fetch(`${baseUrl}/assessment/start`, {
        method: 'POST',
        headers: { 'x-test-actor': 'student-a' }
      });
      const startData = await startRes.json();
      assert.strictEqual(startRes.status, 201);
      assert.ok(startData.attemptId);
      console.log('✅ Assessment attempt created:', startData.attemptId);

      // Submit attempt
      const sampleAnswers = {};
      qData.questions.forEach((q, idx) => {
        sampleAnswers[q.id] = idx % 4;
      });

      const subRes = await fetch(`${baseUrl}/assessment/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-test-actor': 'student-a'
        },
        body: JSON.stringify({
          attemptId: startData.attemptId,
          answers: sampleAnswers,
          timeSpentSeconds: 300
        })
      });

      const subData = await subRes.json();
      assert.strictEqual(subRes.status, 200);
      assert.strictEqual(subData.success, true);
      assert.ok(typeof subData.percentage === 'number');
      assert.ok(subData.rank);
      console.log(`✅ Server evaluated score: ${subData.percentage}% (Rank: ${subData.rank})`);

      // --- TEST 4: Real ML Prediction & XAI Explainability ---
      console.log('\n--- TEST 4: Real ML Placement Prediction & XAI ---');
      const mlRes = await fetch(`${baseUrl}/ml/predict`, {
        method: 'POST',
        headers: { 'x-test-actor': 'student-a' }
      });
      const mlData = await mlRes.json();

      assert.strictEqual(mlRes.status, 200);
      assert.strictEqual(mlData.success, true);
      assert.ok(mlData.status);
      assert.ok(typeof mlData.probability === 'number' || typeof mlData.placement_probability === 'number');
      assert.ok(Array.isArray(mlData.contributions));

      console.log('✅ ML Prediction status:', mlData.status);
      console.log('Placement probability:', (mlData.placement_probability || mlData.probability * 100).toFixed(1) + '%');
      console.log('XAI Feature Contributions:', mlData.contributions);

      // --- TEST 5: Personalized Roadmap & Progress ---
      console.log('\n--- TEST 5: Personalized Roadmap & Dynamic Progress ---');
      const roadRes = await fetch(`${baseUrl}/roadmap`, {
        headers: { 'x-test-actor': 'student-a' }
      });
      const roadData = await roadRes.json();

      assert.strictEqual(roadRes.status, 200);
      assert.strictEqual(roadData.success, true);
      assert.ok(roadData.roadmap);
      console.log('✅ Roadmap retrieved:', roadData.roadmap.title);

      const progRes = await fetch(`${baseUrl}/progress`, {
        headers: { 'x-test-actor': 'student-a' }
      });
      const progData = await progRes.json();

      assert.strictEqual(progRes.status, 200);
      assert.ok(typeof progData.progress.overall_score === 'number');
      console.log('✅ Real database-driven progress overall score:', progData.progress.overall_score);

      // --- TEST 6: Student Authorization & IDOR Security ---
      console.log('\n--- TEST 6: Student Scope & IDOR Protection ---');
      
      // Attempt student A viewing student B's roadmap from faculty endpoint
      const idorRes = await fetch(`${baseUrl}/faculty/students/${studentBId}/roadmap`, {
        headers: { 'x-test-actor': 'student-a' }
      });
      assert.ok([403, 404].includes(idorRes.status), `Student A calling faculty student endpoint must be blocked (got HTTP ${idorRes.status})`);
      console.log(`✅ IDOR protection verified: Student A blocked from faculty student endpoints (HTTP ${idorRes.status}).`);

      // --- TEST 7: Year-Specific Experience Differentiation ---
      console.log('\n--- TEST 7: Year-Specific Experience Differentiation ---');
      const dashYear1 = await fetch(`${baseUrl}/dashboard`, {
        headers: { 'x-test-actor': 'student-b' }
      });
      const dashYear1Data = await dashYear1.json();

      assert.strictEqual(dashYear1.status, 200);
      assert.strictEqual(dashYear1Data.dashboard.profile.academic_year, '1st Year');
      console.log('✅ 1st Year student experience correctly resolved. Academic Year:', dashYear1Data.dashboard.profile.academic_year);

      console.log('\n==================================================');
      console.log(' 🎉 ALL PHASE 6 STUDENT EXPERIENCE TESTS PASSED!');
      console.log('==================================================\n');

    } catch (err) {
      console.error('❌ Test execution error:', err);
      process.exitCode = 1;
    } finally {
      server.close();
    }
  });
}

runAudit();
