import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    const sqlPath = path.join(__dirname, 'migrations', '02_jobs_update.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Supabase JS client doesn't have a direct raw SQL executor, but we can call a generic RPC if it exists.
    // However, since we cannot easily run raw SQL from the JS client without an RPC like `exec_sql`,
    // we might not be able to automate this script reliably. Let's try inserting a dummy job first
    // to see if it fails. If we can't run the SQL via JS, we will inform the user.
    console.log("To apply the migration, please run the contents of 'backend/migrations/02_jobs_update.sql' in your Supabase SQL Editor.");
  } catch (err) {
    console.error("Migration script error:", err);
  }
}

runMigration();
