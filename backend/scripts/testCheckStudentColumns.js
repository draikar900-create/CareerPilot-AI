import { supabaseAdmin } from '../config/supabase.js';

async function checkStudentProfiles() {
  const { data, error } = await supabaseAdmin.from('student_profiles').select('*').limit(1);
  if (error) {
    console.error('Error fetching student_profiles:', error);
  } else {
    console.log('student_profiles sample keys:', Object.keys(data[0] || {}));
    console.log('student_profiles sample row:', data[0]);
  }
}

checkStudentProfiles().catch(console.error);
