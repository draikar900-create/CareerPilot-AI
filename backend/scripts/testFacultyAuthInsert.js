import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testFacultyInsert() {
  const FACULTY_EMAIL = 'faculty@careerpilot.ai';
  const FACULTY_PASSWORD = 'Faculty@123456';
  const FACULTY_NAME = 'Dr. Rajesh Kumar (Faculty)';

  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
  let facultyUser = users?.find(u => u.email?.toLowerCase() === FACULTY_EMAIL.toLowerCase());

  if (!facultyUser) {
    const { data: created, error: cErr } = await supabaseAdmin.auth.admin.createUser({
      email: FACULTY_EMAIL,
      password: FACULTY_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: FACULTY_NAME,
        role: 'Faculty',
        department: 'Computer Science & Engineering',
        designation: 'Associate Professor',
        assignments: [
          { academic_year: '3rd Year', section: 'A', subject: 'Data Structures & Algorithms' },
          { academic_year: '4th Year', section: 'B', subject: 'System Design & Cloud Computing' }
        ]
      },
      app_metadata: { role: 'Faculty' }
    });
    if (cErr) console.error('Error creating user:', cErr);
    facultyUser = created.user;
  } else {
    await supabaseAdmin.auth.admin.updateUserById(facultyUser.id, {
      app_metadata: { role: 'Faculty' },
      user_metadata: {
        full_name: FACULTY_NAME,
        role: 'Faculty',
        department: 'Computer Science & Engineering',
        designation: 'Associate Professor',
        assignments: [
          { academic_year: '3rd Year', section: 'A', subject: 'Data Structures & Algorithms' },
          { academic_year: '4th Year', section: 'B', subject: 'System Design & Cloud Computing' }
        ]
      }
    });
  }

  console.log('Faculty User Configured in Supabase Auth:', facultyUser.id);

  // Test admin_users insert/upsert for role Faculty
  const { data: adminData, error: adminErr } = await supabaseAdmin.from('admin_users').upsert({
    user_id: facultyUser.id,
    email: FACULTY_EMAIL,
    role: 'Faculty',
    name: FACULTY_NAME
  }).select();

  console.log('admin_users insert result:', adminData, 'error:', adminErr);
}

testFacultyInsert();
