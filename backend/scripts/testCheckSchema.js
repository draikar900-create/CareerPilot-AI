import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
  console.log('--- READINESS QUESTIONS ---');
  const { data: qData, error: qErr } = await supabaseAdmin.from('readiness_questions').select('*').limit(1);
  console.log('qData:', qData, 'qErr:', qErr);

  console.log('--- READINESS ATTEMPTS ---');
  const { data: aData, error: aErr } = await supabaseAdmin.from('readiness_attempts').select('*').limit(1);
  console.log('aData:', aData, 'aErr:', aErr);

  console.log('--- ASSESSMENTS ---');
  const { data: assData, error: assErr } = await supabaseAdmin.from('assessments').select('*').limit(1);
  console.log('assData:', assData, 'assErr:', assErr);
}

checkSchema();
