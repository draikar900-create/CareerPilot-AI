import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testTables() {
  console.log('--- FACULTY PROFILES ---');
  const { data: fp, error: fpErr } = await supabaseAdmin.from('faculty_profiles').select('*').limit(1);
  console.log('fp:', fp, 'fpErr:', fpErr);

  console.log('--- FACULTY ASSIGNMENTS ---');
  const { data: fa, error: faErr } = await supabaseAdmin.from('faculty_assignments').select('*').limit(1);
  console.log('fa:', fa, 'faErr:', faErr);

  console.log('--- FACULTY CLASSES ---');
  const { data: fc, error: fcErr } = await supabaseAdmin.from('faculty_classes').select('*').limit(1);
  console.log('fc:', fc, 'fcErr:', fcErr);
}

testTables();
