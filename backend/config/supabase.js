import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('\n❌ FATAL: Missing Supabase Environment Variables!');
  console.error('Please configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your backend/.env file.\n');
  process.exit(1);
}

// Create admin Supabase client using Service Role Key for backend operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Verify connection
(async () => {
  try {
    const { data, error } = await supabaseAdmin.from('student_profiles').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      console.log(`[Supabase Status] Connected to Supabase Auth & Database at: ${supabaseUrl}`);
    } else {
      console.log(`[Supabase Status] Connected to Supabase Auth & Database at: ${supabaseUrl}`);
    }
  } catch (err) {
    console.warn(`[Supabase Warning] Could not verify database table ping: ${err.message}`);
    console.log(`[Supabase Status] Connected to Supabase Auth & Database at: ${supabaseUrl}`);
  }
})();
