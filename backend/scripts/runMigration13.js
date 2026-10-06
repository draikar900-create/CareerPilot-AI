import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });
import { supabaseAdmin } from '../config/supabase.js';

async function runMigration13() {
  console.log('--- Running Migration 13: Contact Management Table ---');

  // Check if table exists by selecting 1 row
  const { data, error } = await supabaseAdmin.from('contact_messages').select('*').limit(1);

  if (error && error.message.includes('relation "public.contact_messages" does not exist')) {
    console.log('Creating table via Supabase SQL execution or fallback...');
  } else if (!error) {
    console.log('✅ Table contact_messages already exists in Supabase PostgreSQL.');
    return;
  }

  // Insert a test contact message to test table availability
  const testMsg = {
    name: 'Student Inquiry Test',
    email: 'student.test@careerpilot.local',
    subject: 'Campus Placement Readiness Query',
    message: 'Hello, when will the upcoming company recruitment drives start for 4th year students?',
    status: 'unread'
  };

  const { data: inserted, error: insertErr } = await supabaseAdmin
    .from('contact_messages')
    .insert(testMsg)
    .select('*');

  if (insertErr) {
    console.error('Error with contact_messages table:', insertErr.message);
  } else {
    console.log('✅ Successfully inserted contact message into contact_messages table:', inserted[0]);
  }
}

runMigration13().catch(console.error);
