import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://demo-placeholder.supabase.co';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo-placeholder';

// Detect if Supabase Project URL changed and purge stale tokens from localStorage
try {
  const cachedUrl = localStorage.getItem('cp_supabase_project_url');
  if (cachedUrl && cachedUrl !== supabaseUrl) {
    console.warn('[AUTH DEBUG] Supabase Project URL changed from', cachedUrl, 'to', supabaseUrl, '- Purging stale session tokens.');
    Object.keys(localStorage).forEach((key) => {
      if (key.includes('supabase') || key.includes('sb-') || key.includes('cp_')) {
        if (key !== 'cp_supabase_project_url') {
          localStorage.removeItem(key);
        }
      }
    });
  }
  localStorage.setItem('cp_supabase_project_url', supabaseUrl);
} catch (e) {
  console.warn('[AUTH DEBUG] LocalStorage check warning:', e.message);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});
