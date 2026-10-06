import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });
import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from '../config/supabase.js';

async function runMigration21() {
  console.log('🚀 Running Migration 21: Company RLS Hardening & Unified Resource Scope...');

  const sqlPath = path.join(process.cwd(), 'backend', 'migrations', '21_companies_and_unified_resources_rls.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  try {
    const { error: rpcError } = await supabaseAdmin.rpc('exec_sql', { sql_query: sql });
    if (rpcError) {
      console.warn('RPC exec_sql notice:', rpcError.message);
    } else {
      console.log('Successfully executed migration 21 via RPC.');
    }
  } catch (err) {
    console.warn('RPC execution exception:', err.message);
  }

  // Verification
  console.log('Verifying companies table access...');
  const { data: testComp, error: compErr } = await supabaseAdmin
    .from('companies')
    .select('id, name, industry, location, website')
    .limit(1);

  if (compErr) {
    console.warn('Company SELECT notice:', compErr.message);
  } else {
    console.log('Companies query succeeded. Sample:', testComp);
  }
}

runMigration21().catch(err => {
  console.error('Fatal error running migration 21:', err);
  process.exit(1);
});
