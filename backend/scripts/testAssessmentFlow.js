import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testAssessmentFlow() {
  console.log('=== Step 1: Login as Student ===');
  const email = 'student.test@careerpilot.local';
  const password = 'DevStudent@2026!Pass';

  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (authErr) {
    console.error('Student login failed:', authErr.message);
    return;
  }

  const token = authData.session.access_token;
  console.log('Student logged in successfully. User ID:', authData.user.id);

  console.log('\n=== Step 2: GET /api/assessment/current ===');
  const curRes = await fetch('http://localhost:5000/api/assessment/current', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  console.log('Status code:', curRes.status);
  const curData = await curRes.json().catch(() => null);
  console.log('Response body:', JSON.stringify(curData, null, 2));

  console.log('\n=== Step 3: POST /api/assessment/start ===');
  const startRes = await fetch('http://localhost:5000/api/assessment/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  console.log('Status code:', startRes.status);
  const startData = await startRes.json().catch(() => null);
  console.log('Response body:', JSON.stringify(startData, null, 2));

  if (!startData || !startData.attemptId) {
    console.error('Failed to get attemptId. Stopping.');
    return;
  }

  console.log('\n=== Step 4: POST /api/assessment/submit ===');
  // Prepare answers for the questions
  const sampleAnswers = {};
  if (curData && curData.questions) {
    curData.questions.forEach((q, idx) => {
      sampleAnswers[q.id] = idx % 4; // pick an option
    });
  }

  const subRes = await fetch('http://localhost:5000/api/assessment/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      attemptId: startData.attemptId,
      answers: sampleAnswers,
      timeSpentSeconds: 120,
      tabSwitchCount: 0
    })
  });

  console.log('Status code:', subRes.status);
  const subData = await subRes.json().catch(() => null);
  console.log('Response body:', JSON.stringify(subData, null, 2));
}

testAssessmentFlow().catch(console.error);
