import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });
import { supabaseAdmin } from '../config/supabase.js';

async function testInsertAnswers() {
  console.log('Testing insert into readiness_answers...');
  // Find an existing attempt
  const { data: attempts } = await supabaseAdmin.from('readiness_attempts').select('id').limit(1);
  if (!attempts || attempts.length === 0) {
    console.log('No attempts found');
    return;
  }
  const attemptId = attempts[0].id;

  // Find an existing question
  const { data: questions } = await supabaseAdmin.from('readiness_questions').select('id').limit(1);
  if (!questions || questions.length === 0) {
    console.log('No questions found');
    return;
  }
  const questionId = questions[0].id;

  const record = {
    attempt_id: attemptId,
    question_id: questionId,
    selected_option_index: 1,
    is_correct: true
  };

  try {
    const { data, error } = await supabaseAdmin.from('readiness_answers').insert([record]).select();
    console.log('Insert result:', { data, error });
  } catch (err) {
    console.error('Caught error:', err);
  }
}

testInsertAnswers().catch(console.error);
