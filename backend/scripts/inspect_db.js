import { supabaseAdmin } from '../config/supabase.js';

async function checkDb() {
  console.log('=== SUPABASE DATABASE INSPECTION ===');

  const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.listUsers();
  console.log('\n--- AUTH USERS --- (Count:', authData?.users?.length || 0, ', Error:', authErr?.message || 'none', ')');
  authData?.users?.forEach(u => console.log('ID:', u.id, '| Email:', u.email, '| Role:', u.role, '| Metadata:', JSON.stringify(u.user_metadata)));

  const { data: students, error: sErr } = await supabaseAdmin.from('student_profiles').select('*');
  console.log('\n--- STUDENT PROFILES --- (Count:', students?.length || 0, ', Error:', sErr?.message || 'none', ')');
  students?.forEach(s => console.log('User ID:', s.user_id, '| Name:', s.full_name || s.name, '| Email:', s.email, '| College:', s.college_name, '| Branch:', s.branch, '| Sem:', s.semester));

  const { data: faculty, error: fErr } = await supabaseAdmin.from('faculty_profiles').select('*');
  console.log('\n--- FACULTY PROFILES --- (Count:', faculty?.length || 0, ', Error:', fErr?.message || 'none', ')');
  faculty?.forEach(f => console.log('User ID:', f.user_id, '| Name:', f.full_name, '| Email:', f.email, '| College:', f.college_name, '| Dept:', f.department, '| Onboarding:', f.onboarding_completed));

  const { data: admins, error: aErr } = await supabaseAdmin.from('admin_users').select('*');
  console.log('\n--- ADMIN USERS --- (Count:', admins?.length || 0, ', Error:', aErr?.message || 'none', ')');
  admins?.forEach(a => console.log('User ID:', a.user_id, '| Name:', a.full_name, '| Email:', a.email, '| Role:', a.role, '| College:', a.college_name));

  const { data: notes, error: nErr } = await supabaseAdmin.from('faculty_student_notes').select('*');
  console.log('\n--- FACULTY STUDENT NOTES --- (Count:', notes?.length || 0, ', Error:', nErr?.message || 'none', ')');
  notes?.forEach(n => console.log('Note ID:', n.id, '| Faculty ID:', n.faculty_id, '| Student ID:', n.student_id, '| Content:', n.note || n.message, '| Created At:', n.created_at));

  const { data: resources, error: rErr } = await supabaseAdmin.from('learning_resources').select('*');
  console.log('\n--- LEARNING RESOURCES --- (Count:', resources?.length || 0, ', Error:', rErr?.message || 'none', ')');
  resources?.forEach(r => console.log('Resource ID:', r.id, '| Title:', r.title, '| Type:', r.resource_type || r.type, '| URL:', r.url || r.video_url, '| Branch:', r.branch, '| Sem:', r.semester));
}

checkDb().catch(console.error);
