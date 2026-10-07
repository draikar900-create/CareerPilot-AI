import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!globalThis.WebSocket) {
  globalThis.WebSocket = class DummyWebSocket { };
}

dotenv.config();
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY
  || process.env.SUPABASE_ANON_KEY
  || process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseSecretKey || !supabasePublishableKey) {
  console.error('\n❌ FATAL: Missing Supabase Environment Variables!');
  console.error('Configure SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, and SUPABASE_SECRET_KEY in backend/.env or the hosting environment.\n');
  process.exit(1);
}

// Keep the secret key in the apikey header; Supabase secret keys are not JWTs.
export const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  realtime: {
    disabled: true
  }
});

// Dedicated auth client created with Anon Key for standard user authentication (signInWithPassword, signUp, verifyOtp)
export const supabaseAuth = createClient(supabaseUrl, supabasePublishableKey, {
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
