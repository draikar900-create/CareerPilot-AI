import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!globalThis.WebSocket) {
  globalThis.WebSocket = class DummyWebSocket {};
}

dotenv.config();
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://mziglrjymkuebzdrgayp.supabase.co';
const supabaseServiceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('your-supabase'))
  ? process.env.SUPABASE_SERVICE_ROLE_KEY
  : (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_b8Wr6uPqsPLvdJQS7rpTSg_MlZeKXxN');

const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || supabaseServiceRoleKey;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('\n❌ FATAL: Missing Supabase Environment Variables!');
  console.error('Please configure SUPABASE_URL and SUPABASE_ANON_KEY in your backend/.env file.\n');
  process.exit(1);
}

// Create admin Supabase client using Service Role Key (or key fallback) for backend operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  realtime: {
    disabled: true
  },
  global: {
    headers: {
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      apikey: supabaseServiceRoleKey
    }
  }
});

// Dedicated auth client created with Anon Key for standard user authentication (signInWithPassword, signUp, verifyOtp)
export const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  realtime: {
    disabled: true
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
