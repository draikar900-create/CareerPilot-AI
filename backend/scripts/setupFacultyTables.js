import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function setupFacultyTables() {
  console.log('Ensuring faculty_profiles and faculty_assignments tables...');

  // Check if faculty_profiles exists
  const { error: fpErr } = await supabaseAdmin.from('faculty_profiles').select('*').limit(1);
  if (fpErr && fpErr.code === 'PGRST205') {
    console.log('faculty_profiles table missing. Executing creation query via RPC exec_sql...');
    const sql1 = `
      CREATE TABLE IF NOT EXISTS public.faculty_profiles (
        user_id UUID PRIMARY KEY,
        college_id UUID,
        department_id UUID,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        employee_id TEXT,
        college_name TEXT,
        department TEXT,
        designation TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    const { error: err1 } = await supabaseAdmin.rpc('exec_sql', { sql_query: sql1 });
    console.log('faculty_profiles creation result:', err1 ? err1.message : 'SUCCESS');
  } else {
    console.log('faculty_profiles table exists or accessible!');
  }

  // Check if faculty_assignments exists
  const { error: faErr } = await supabaseAdmin.from('faculty_assignments').select('*').limit(1);
  if (faErr && faErr.code === 'PGRST205') {
    console.log('faculty_assignments table missing. Executing creation query via RPC exec_sql...');
    const sql2 = `
      CREATE TABLE IF NOT EXISTS public.faculty_assignments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        faculty_id UUID NOT NULL,
        college_id UUID,
        department_id UUID,
        academic_year TEXT,
        section TEXT,
        batch TEXT,
        subject TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    const { error: err2 } = await supabaseAdmin.rpc('exec_sql', { sql_query: sql2 });
    console.log('faculty_assignments creation result:', err2 ? err2.message : 'SUCCESS');
  } else {
    console.log('faculty_assignments table exists or accessible!');
  }
}

setupFacultyTables().catch(console.error);
