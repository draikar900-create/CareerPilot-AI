import { supabaseAdmin } from '../config/supabase.js';

async function checkAssessments() {
  const { data, error } = await supabaseAdmin.from('assessments').select('*');
  if (error) {
    console.log('assessments table error:', error.message);
  } else {
    console.log('assessments count:', data?.length);
    console.log('assessments rows:', data);
  }
}

checkAssessments().catch(console.error);
