import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load primary backend .env
dotenv.config({ path: path.join(__dirname, '../.env') });

// Load development test accounts .env
const testEnvPath = path.join(__dirname, '../.env.test-accounts');
if (fs.existsSync(testEnvPath)) {
  dotenv.config({ path: testEnvPath });
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('\n❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in backend/.env');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const ACCOUNTS = {
  student: {
    email: process.env.DEV_STUDENT_EMAIL || 'student.test@careerpilot.local',
    password: process.env.DEV_STUDENT_PASSWORD || 'DevStudent@2026!Pass',
    fullName: 'Dev Test Student',
    role: 'Student'
  },
  faculty: {
    email: process.env.DEV_FACULTY_EMAIL || 'faculty.test@careerpilot.local',
    password: process.env.DEV_FACULTY_PASSWORD || 'DevFaculty@2026!Pass',
    fullName: 'Dr. Dev Test Faculty',
    role: 'Faculty'
  },
  admin: {
    email: process.env.DEV_ADMIN_EMAIL || 'admin.test@careerpilot.local',
    password: process.env.DEV_ADMIN_PASSWORD || 'DevAdmin@2026!Pass',
    fullName: 'Dev Test Platform Admin',
    role: 'Admin'
  },
  tpo: {
    email: process.env.DEV_TPO_EMAIL || 'tpo.test@careerpilot.local',
    password: process.env.DEV_TPO_PASSWORD || 'DevTpo@2026!Pass',
    fullName: 'Dev Test Placement Officer',
    role: 'PlacementOfficer'
  }
};

async function getOrCreateAuthUser(email, password, userMeta, appMeta) {
  const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
  if (listErr) throw listErr;

  let existing = users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

  if (!existing) {
    console.log(`   [Auth] Creating Supabase user: ${email}...`);
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: userMeta,
      app_metadata: appMeta
    });
    if (createErr) throw createErr;
    return created.user;
  } else {
    console.log(`   [Auth] Updating existing user: ${email} (${existing.id})...`);
    const { data: updated, error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { ...existing.user_metadata, ...userMeta },
      app_metadata: { ...existing.app_metadata, ...appMeta }
    });
    if (updateErr) throw updateErr;
    return updated.user;
  }
}

async function seedAllTestAccounts() {
  console.log('\n================================================================');
  console.log('🚀 CAREERPILOT AI: SEEDING DEVELOPMENT TEST ACCOUNTS (ALL PORTALS)');
  console.log('================================================================\n');

  try {
    // 1. Ensure College & Department exist
    console.log('1. Setting up Test Institution Scope...');
    const collegeName = 'College A Institute of Technology';
    let { data: college } = await supabaseAdmin
      .from('colleges')
      .select('id, name')
      .eq('name', collegeName)
      .maybeSingle();

    if (!college) {
      const { data: newCol, error: colErr } = await supabaseAdmin
        .from('colleges')
        .insert({ name: collegeName, location: 'Metro A' })
        .select()
        .single();
      if (colErr) throw colErr;
      college = newCol;
    }
    console.log(`   ✅ College: "${college.name}" (${college.id})`);

    let { data: department } = await supabaseAdmin
      .from('departments')
      .select('id, name')
      .eq('college_id', college.id)
      .eq('name', 'Computer Science & Engineering')
      .maybeSingle();

    if (!department) {
      const { data: newDept, error: deptErr } = await supabaseAdmin
        .from('departments')
        .insert({ college_id: college.id, name: 'Computer Science & Engineering' })
        .select()
        .single();
      if (!deptErr && newDept) department = newDept;
    }
    console.log(`   ✅ Department: "${department?.name || 'Computer Science & Engineering'}"`);

    // 2. Student Test Account
    console.log('\n2. Configuring STUDENT Test Account...');
    const studentAuth = await getOrCreateAuthUser(
      ACCOUNTS.student.email,
      ACCOUNTS.student.password,
      {
        full_name: ACCOUNTS.student.fullName,
        role: 'Student',
        college_name: collegeName,
        email_verified: true
      },
      { role: 'Student' }
    );

    const { error: studentProfileErr } = await supabaseAdmin
      .from('student_profiles')
      .upsert({
        user_id: studentAuth.id,
        email: ACCOUNTS.student.email,
        full_name: ACCOUNTS.student.fullName,
        phone: '+91 9876543210',
        college_name: collegeName,
        branch: 'Computer Science & Engineering',
        semester: 6,
        cgpa: 8.75,
        graduation_year: 2026,
        technical_skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'Python', 'Tailwind CSS'],
        achievements: ["Dean's List 2025", 'National Hackathon Finalist'],
        current_onboarding_step: 8,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (studentProfileErr) console.warn('   ⚠️ Student profile upsert warning:', studentProfileErr.message);
    else console.log(`   ✅ Student Profile synced in public.student_profiles`);

    // 3. Faculty Test Account
    console.log('\n3. Configuring FACULTY Test Account...');
    const facultyAuth = await getOrCreateAuthUser(
      ACCOUNTS.faculty.email,
      ACCOUNTS.faculty.password,
      {
        full_name: ACCOUNTS.faculty.fullName,
        role: 'Faculty',
        department: 'Computer Science & Engineering',
        designation: 'Associate Professor',
        college_name: collegeName,
        email_verified: true,
        assignments: [
          { academic_year: '3rd Year', section: 'A', subject: 'Data Structures & Algorithms' },
          { academic_year: '4th Year', section: 'B', subject: 'System Design & Cloud Computing' }
        ]
      },
      { role: 'Faculty' }
    );
    console.log(`   ✅ Faculty Auth User configured with metadata & assignments`);

    // 4. Admin Test Account
    console.log('\n4. Configuring ADMIN Test Account...');
    const adminAuth = await getOrCreateAuthUser(
      ACCOUNTS.admin.email,
      ACCOUNTS.admin.password,
      {
        full_name: ACCOUNTS.admin.fullName,
        role: 'Admin',
        college_name: collegeName,
        email_verified: true
      },
      { role: 'Admin' }
    );

    const { error: adminErr } = await supabaseAdmin
      .from('admin_users')
      .upsert({
        user_id: adminAuth.id,
        email: ACCOUNTS.admin.email,
        full_name: ACCOUNTS.admin.fullName,
        role: 'Admin'
      }, { onConflict: 'user_id' });

    if (adminErr) console.warn('   ⚠️ Admin sync warning:', adminErr.message);
    else console.log(`   ✅ Admin Profile synced in public.admin_users (role: Admin)`);

    // 5. TPO / Placement Officer Test Account
    console.log('\n5. Configuring TPO / PLACEMENT OFFICER Test Account...');
    const tpoAuth = await getOrCreateAuthUser(
      ACCOUNTS.tpo.email,
      ACCOUNTS.tpo.password,
      {
        full_name: ACCOUNTS.tpo.fullName,
        role: 'PlacementOfficer',
        college_name: collegeName,
        email_verified: true
      },
      { role: 'PlacementOfficer' }
    );

    const { error: tpoErr } = await supabaseAdmin
      .from('admin_users')
      .upsert({
        user_id: tpoAuth.id,
        email: ACCOUNTS.tpo.email,
        full_name: ACCOUNTS.tpo.fullName,
        role: 'PlacementOfficer'
      }, { onConflict: 'user_id' });

    if (tpoErr) console.warn('   ⚠️ TPO sync warning:', tpoErr.message);
    else console.log(`   ✅ TPO Profile synced in public.admin_users (role: PlacementOfficer)`);

    console.log('\n================================================================');
    console.log('🎉 ALL 4 DEVELOPMENT TEST ACCOUNTS CONFIGURED SUCCESSFULLY!');
    console.log('================================================================');
    console.log(`1. STUDENT:`);
    console.log(`   Email:    ${ACCOUNTS.student.email}`);
    console.log(`   Password: ${ACCOUNTS.student.password}`);
    console.log(`   Role:     Student`);
    console.log(`   Portal:   Student Portal / Dashboard`);
    console.log(`----------------------------------------------------------------`);
    console.log(`2. FACULTY:`);
    console.log(`   Email:    ${ACCOUNTS.faculty.email}`);
    console.log(`   Password: ${ACCOUNTS.faculty.password}`);
    console.log(`   Role:     Faculty`);
    console.log(`   Portal:   Faculty Portal / Dashboard`);
    console.log(`----------------------------------------------------------------`);
    console.log(`3. ADMIN:`);
    console.log(`   Email:    ${ACCOUNTS.admin.email}`);
    console.log(`   Password: ${ACCOUNTS.admin.password}`);
    console.log(`   Role:     Admin`);
    console.log(`   Portal:   Admin Portal / Executive Management`);
    console.log(`----------------------------------------------------------------`);
    console.log(`4. TPO (PLACEMENT OFFICER):`);
    console.log(`   Email:    ${ACCOUNTS.tpo.email}`);
    console.log(`   Password: ${ACCOUNTS.tpo.password}`);
    console.log(`   Role:     PlacementOfficer`);
    console.log(`   Portal:   TPO / Placement Portal`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('\n❌ Error seeding development test accounts:', err);
    process.exit(1);
  }
}

seedAllTestAccounts();
