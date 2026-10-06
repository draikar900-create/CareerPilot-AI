import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const API_BASE = process.env.API_BASE_URL || 'http://127.0.0.1:5000';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testFacultyLoginFlow() {
  console.log('==================================================');
  console.log('🧪 TESTING FACULTY AUTHENTICATION FOR EXISTING ACCOUNT');
  console.log('==================================================\n');

  const facultyEmail = process.env.DEV_FACULTY_EMAIL || 'faculty.test@careerpilot.local';
  const facultyPassword = process.env.DEV_FACULTY_PASSWORD || 'DevFaculty@2026!Pass';

  console.log(`1. Testing Faculty Sign-In for (${facultyEmail}) via POST /api/auth/login...`);
  const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: facultyEmail,
      password: facultyPassword
    })
  });

  const loginData = await loginRes.json();
  console.log('   Login HTTP Status:', loginRes.status);
  console.log('   Login API Response User Role:', loginData.user?.role);

  if (!loginRes.ok || !loginData.success || loginData.user?.role !== 'Faculty') {
    throw new Error(`Faculty login failed or incorrect role returned! Received role: ${loginData.user?.role}`);
  } else {
    console.log('   ✅ Faculty Login Authenticated Successfully! Role resolved as:', loginData.user.role);
    console.log('   User ID:', loginData.user.id);
    console.log('   Full Name:', loginData.user.full_name);
  }

  // 2. Test Direct Supabase Client Sign-In
  console.log('\n2. Testing direct Supabase client signInWithPassword...');
  const { data: clientAuthData, error: clientAuthErr } = await supabaseAnon.auth.signInWithPassword({
    email: facultyEmail,
    password: facultyPassword
  });

  if (clientAuthErr || !clientAuthData.session) {
    throw new Error(`Direct Supabase auth failed: ${clientAuthErr?.message}`);
  } else {
    const rawRole = clientAuthData.user.role;
    const metaRole = clientAuthData.user.user_metadata?.role;
    console.log('   ✅ Direct Supabase Auth succeeded.');
    console.log('   Auth Connection Role:', rawRole);
    console.log('   User Metadata Role:', metaRole);
  }

  console.log('\n==================================================');
  console.log('🎉 FACULTY AUTHENTICATION TEST PASSED 100%!');
  console.log('==================================================\n');
}

testFacultyLoginFlow().catch(err => {
  console.error('\n❌ FACULTY AUTH TEST FAILED:', err.message);
  process.exit(1);
});
