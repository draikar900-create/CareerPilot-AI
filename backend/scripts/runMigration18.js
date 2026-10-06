import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });
import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from '../config/supabase.js';

async function runMigration18() {
  console.log('Running Migration 18: Secure Resume Storage & Privacy Metadata Columns...');

  const sqlPath = path.join(process.cwd(), 'backend', 'migrations', '18_secure_resume_storage.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  try {
    const { error: rpcError } = await supabaseAdmin.rpc('exec_sql', { sql_query: sql });
    if (rpcError) {
      console.warn('RPC exec_sql notice:', rpcError.message);
    } else {
      console.log('Successfully executed migration 18 via RPC.');
    }
  } catch (err) {
    console.warn('RPC execution exception:', err.message);
  }

  // Fallback verification & column check
  console.log('Verifying student_profiles table columns...');
  const { data: profile, error: selError } = await supabaseAdmin
    .from('student_profiles')
    .select('user_id, resume_url, resume_storage_path, resume_file_name, resume_uploaded_at')
    .limit(1);

  if (selError) {
    console.error('Column verification failed:', selError.message);
  } else {
    console.log('Verification succeeded! Columns present. Sample profile row:', profile);
  }
}

runMigration18().catch(err => {
  console.error('Fatal error running migration 18:', err);
  process.exit(1);
});
