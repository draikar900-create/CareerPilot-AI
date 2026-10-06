import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const FACULTY_EMAIL = 'faculty@careerpilot.ai';
const FACULTY_PASSWORD = 'Faculty@123456';
const FACULTY_NAME = 'Dr. Rajesh Kumar (Faculty)';

export async function seedFacultyAccount() {
  console.log('\n=============================================================');
  console.log('🚀 CAREERPILOT AI: Initializing Faculty Account & Assignments');
  console.log('=============================================================\n');

  try {
    // 1. Get or create college
    let collegeId = null;
    const { data: college } = await supabaseAdmin.from('colleges').select('*').limit(1).maybeSingle();
    if (college) {
      collegeId = college.id;
    } else {
      const { data: newCol } = await supabaseAdmin.from('colleges').insert({ name: 'National Institute of Technology' }).select().single();
      if (newCol) collegeId = newCol.id;
    }

    // 2. Get or create department
    let departmentId = null;
    if (collegeId) {
      const { data: department } = await supabaseAdmin.from('departments').select('*').eq('college_id', collegeId).limit(1).maybeSingle();
      if (department) {
        departmentId = department.id;
      } else {
        const { data: newDept } = await supabaseAdmin.from('departments').insert({ college_id: collegeId, name: 'Computer Science & Engineering' }).select().single();
        if (newDept) departmentId = newDept.id;
      }
    }

    // 3. Create or fetch Faculty Auth User
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    let facultyUser = users?.find(u => u.email?.toLowerCase() === FACULTY_EMAIL.toLowerCase());

    if (!facultyUser) {
      console.log(`  🔑 Creating new Faculty Auth User: ${FACULTY_EMAIL}...`);
      const { data: created, error: cErr } = await supabaseAdmin.auth.admin.createUser({
        email: FACULTY_EMAIL,
        password: FACULTY_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: FACULTY_NAME, role: 'Faculty' },
        app_metadata: { role: 'Faculty' }
      });
      if (cErr) throw cErr;
      facultyUser = created.user;
    } else {
      // Ensure app_metadata has role Faculty
      await supabaseAdmin.auth.admin.updateUserById(facultyUser.id, {
        app_metadata: { role: 'Faculty' },
        user_metadata: { full_name: FACULTY_NAME, role: 'Faculty' }
      });
    }

    console.log(`  ✅ Faculty Auth ID: ${facultyUser.id}`);

    // 4. Create/Upsert Faculty Profile
    const profilePayload = {
      user_id: facultyUser.id,
      full_name: FACULTY_NAME,
      email: FACULTY_EMAIL,
      phone: '+91 98765 43210'
    };
    if (collegeId) profilePayload.college_id = collegeId;
    if (departmentId) profilePayload.department_id = departmentId;

    const { error: pErr } = await supabaseAdmin.from('faculty_profiles').upsert(profilePayload);
    if (pErr) {
      console.warn('  ⚠️ Faculty profile notice:', pErr.message);
    }

    console.log(`  ✅ Faculty Profile Configured for ${FACULTY_NAME}`);

    // 5. Seed Faculty Assignments for 3rd Year Section A & 4th Year Section B
    await supabaseAdmin.from('faculty_assignments').delete().eq('faculty_id', facultyUser.id);

    const assignments = [
      {
        faculty_id: facultyUser.id,
        college_id: collegeId,
        department_id: departmentId,
        academic_year: '3rd Year',
        section: 'A',
        batch: '2023-2027',
        subject: 'Data Structures & Algorithms'
      },
      {
        faculty_id: facultyUser.id,
        college_id: collegeId,
        department_id: departmentId,
        academic_year: '4th Year',
        section: 'B',
        batch: '2022-2026',
        subject: 'System Design & Cloud Computing'
      }
    ];

    for (const a of assignments) {
      const payload = {
        faculty_id: a.faculty_id,
        academic_year: a.academic_year,
        section: a.section
      };
      if (a.college_id) payload.college_id = a.college_id;
      if (a.department_id) payload.department_id = a.department_id;

      await supabaseAdmin.from('faculty_assignments').insert(payload).catch(e => console.warn('Assignment notice:', e.message));
    }

    console.log(`  ✅ Seeded 2 Faculty Scope Assignments (3rd Year Sec A & 4th Year Sec B)`);

    // 6. Seed Faculty Scheduled Classes
    const sampleClasses = [
      {
        faculty_id: facultyUser.id,
        title: 'Advanced Binary Tree Traversals & Heap Optimizations',
        subject: 'Data Structures',
        topic: 'Tree & Heap Patterns',
        description: 'Interactive problem-solving class focusing on LeetCode Medium/Hard tree traversals.',
        class_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        academic_year: '3rd Year',
        section: 'A',
        meeting_url: 'https://meet.google.com/abc-defg-hij',
        status: 'Scheduled'
      },
      {
        faculty_id: facultyUser.id,
        title: 'Distributed System Sharding & Consistency Trade-offs',
        subject: 'System Design',
        topic: 'CAP Theorem & Sharding',
        description: 'Deep-dive into database partitioning, replication topologies, and Raft consensus.',
        class_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        academic_year: '4th Year',
        section: 'B',
        meeting_url: 'https://meet.google.com/xyz-uvwx-rst',
        status: 'Scheduled'
      }
    ];

    if (collegeId) {
      sampleClasses.forEach(c => {
        c.college_id = collegeId;
        if (departmentId) c.department_id = departmentId;
      });
    }

    for (const c of sampleClasses) {
      await supabaseAdmin.from('faculty_classes').insert(c).catch(e => console.warn('Class seed notice:', e.message));
    }

    console.log(`  ✅ Seeded Faculty Scheduled Classes`);
    console.log('\n🎉 Faculty Seed Complete! Login credentials:');
    console.log(`   Email: ${FACULTY_EMAIL}`);
    console.log(`   Password: ${FACULTY_PASSWORD}\n`);
    return true;
  } catch (err) {
    console.error('❌ Exception in seedFacultyAccount:', err);
    return false;
  }
}

seedFacultyAccount().then(() => process.exit(0));
