import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });
import { supabaseAdmin } from '../config/supabase.js';

async function applyTable() {
  console.log('Testing SQL DDL execution for contact_messages...');

  // Try creating table using rpc if available
  const sql = `
    CREATE TABLE IF NOT EXISTS public.contact_messages (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'unread',
      college_id UUID,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  const { error } = await supabaseAdmin.rpc('exec_sql', { sql_query: sql });
  if (error) {
    console.log('rpc exec_sql error:', error.message);
  } else {
    console.log('rpc exec_sql succeeded');
  }
}

applyTable().catch(console.error);
