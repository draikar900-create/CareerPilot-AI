// Run migration 03 against Supabase using raw REST API
import { supabaseAdmin } from './config/supabase.js';
import fs from 'fs';
import https from 'https';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Run individual ALTER statements using the Supabase management API via direct DB operations
async function runMigration() {
  // Use supabaseAdmin to test connection first
  const { data, error: connErr } = await supabaseAdmin.from('eligibility_rules').select('id').limit(1);
  if (connErr) {
    console.error('Cannot connect to DB:', connErr.message);
    return;
  }
  console.log('[OK] Connected to Supabase DB');

  // Check if columns already exist by querying a row
  const { data: sample } = await supabaseAdmin.from('eligibility_rules').select('*').limit(1);
  if (sample && sample.length > 0) {
    const cols = Object.keys(sample[0]);
    console.log('Existing columns:', cols.join(', '));
    if (cols.includes('company_name')) {
      console.log('[SKIP] company_name column already exists — migration already applied');
      return;
    }
  } else {
    console.log('Table is empty — checking schema via insert test...');
  }

  // Use Supabase REST API to run raw SQL via /rest/v1/rpc or the SQL endpoint
  const projectRef = SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!projectRef) {
    console.error('Cannot extract project ref from SUPABASE_URL:', SUPABASE_URL);
    return;
  }

  const sqlStatements = [
    `ALTER TABLE public.eligibility_rules ADD COLUMN IF NOT EXISTS company_name TEXT`,
    `ALTER TABLE public.eligibility_rules ADD COLUMN IF NOT EXISTS job_role TEXT`,
    `ALTER TABLE public.eligibility_rules ADD COLUMN IF NOT EXISTS required_skills TEXT[] DEFAULT '{}'`
  ];

  for (const sql of sqlStatements) {
    const result = await new Promise((resolve) => {
      const body = JSON.stringify({ query: sql });
      const options = {
        hostname: `${projectRef}.supabase.co`,
        port: 443,
        path: '/rest/v1/rpc/query',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'apikey': SERVICE_ROLE_KEY,
          'Content-Length': Buffer.byteLength(body)
        }
      };
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', d => data += d);
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      });
      req.on('error', (e) => resolve({ error: e.message }));
      req.write(body);
      req.end();
    });
    console.log(`SQL: ${sql.substring(0, 60)}...`);
    console.log(`Result: status=${result.status || 'error'} body=${result.body?.substring(0, 100) || result.error}`);
  }

  // Verify the columns were added
  const { data: verify } = await supabaseAdmin.from('eligibility_rules').select('*').limit(1);
  if (verify !== null) {
    if (verify.length === 0) {
      console.log('[INFO] Table empty after migration — columns cannot be verified from data, check Supabase dashboard');
    } else {
      console.log('[OK] Columns after migration:', Object.keys(verify[0]).join(', '));
    }
  }
}

runMigration().catch(console.error);
