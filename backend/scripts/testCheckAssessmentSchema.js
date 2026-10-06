import { supabaseAdmin } from '../config/supabase.js';

async function checkSchema() {
  console.log('--- Checking Assessment Schema & Data ---');
  
  // 1. Check assessments table
  const { data: assessments, error: aErr } = await supabaseAdmin.from('assessments').select('*').limit(5);
  console.log('assessments table:', aErr ? `Error: ${aErr.message}` : `Found ${assessments?.length} rows`);
  if (assessments && assessments.length > 0) {
    console.log('Sample assessment:', assessments[0]);
  }

  // 2. Check readiness_questions table
  const { data: questions, error: qErr } = await supabaseAdmin.from('readiness_questions').select('*').limit(5);
  console.log('readiness_questions table:', qErr ? `Error: ${qErr.message}` : `Found ${questions?.length} rows`);
  if (questions && questions.length > 0) {
    console.log('Sample question:', questions[0]);
  }

  // Check count of questions per academic year
  const { data: allQuestions } = await supabaseAdmin.from('readiness_questions').select('category');
  if (allQuestions) {
    const counts = {};
    allQuestions.forEach(q => {
      const year = q.category.split(' | ')[0] || 'Unknown';
      counts[year] = (counts[year] || 0) + 1;
    });
    console.log('Questions count by category prefix:', counts);
  }

  // 3. Check readiness_attempts table
  const { data: attempts, error: attErr } = await supabaseAdmin.from('readiness_attempts').select('*').limit(5);
  console.log('readiness_attempts table:', attErr ? `Error: ${attErr.message}` : `Found ${attempts?.length} rows`);
  if (attempts && attempts.length > 0) {
    console.log('Sample attempt:', attempts[0]);
  }

  // 4. Check readiness_answers table
  const { data: answers, error: ansErr } = await supabaseAdmin.from('readiness_answers').select('*').limit(5);
  console.log('readiness_answers table:', ansErr ? `Error: ${ansErr.message}` : `Found ${answers?.length} rows`);
  if (answers && answers.length > 0) {
    console.log('Sample answer:', answers[0]);
  }

  // 5. Check student_profiles for test student
  const { data: studentProf, error: sErr } = await supabaseAdmin
    .from('student_profiles')
    .select('user_id, full_name, email, academic_year, semester')
    .eq('email', 'student.test@careerpilot.local')
    .maybeSingle();
  console.log('Test student profile:', sErr ? `Error: ${sErr.message}` : studentProf);
}

checkSchema().catch(console.error);
