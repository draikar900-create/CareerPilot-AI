import { supabaseAdmin } from '../config/supabase.js';

async function inspectColumns() {
  console.log('--- Inspecting Table Columns ---');

  const { data: qData, error: qErr } = await supabaseAdmin.from('readiness_questions').select('*').limit(1);
  if (qData && qData.length > 0) {
    console.log('readiness_questions keys:', Object.keys(qData[0]));
  } else {
    console.log('readiness_questions err:', qErr);
  }

  const { data: aData, error: aErr } = await supabaseAdmin.from('readiness_attempts').select('*').limit(1);
  if (aData && aData.length > 0) {
    console.log('readiness_attempts keys:', Object.keys(aData[0]));
  } else {
    console.log('readiness_attempts err:', aErr);
  }

  const { data: ansData, error: ansErr } = await supabaseAdmin.from('readiness_answers').select('*').limit(1);
  if (ansData && ansData.length > 0) {
    console.log('readiness_answers keys:', Object.keys(ansData[0]));
  } else {
    console.log('readiness_answers (empty or err):', ansErr || 'Empty table');
  }

  // Try inserting a dummy answer into readiness_answers to test its schema
  const { error: testAnsErr } = await supabaseAdmin.from('readiness_answers').insert({
    attempt_id: '00000000-0000-0000-0000-000000000000',
    question_id: '00000000-0000-0000-0000-000000000000',
    selected_option_index: 1,
    is_correct: true
  });
  console.log('readiness_answers dummy insert test result:', testAnsErr ? testAnsErr.message : 'Success (rolled back)');
}

inspectColumns().catch(console.error);
