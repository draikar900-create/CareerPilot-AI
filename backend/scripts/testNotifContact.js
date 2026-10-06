import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });
import { supabaseAdmin } from '../config/supabase.js';

async function testNotifContact() {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .insert({
      title: 'Contact Inquiry: Placement Schedule Query',
      message: 'From: Student Test (student.test@careerpilot.local)\n\nWhen will company recruitment drives start for 4th year?',
      type: 'contact_inquiry',
      user_id: null
    })
    .select('*');

  if (error) {
    console.error('Error inserting contact notification:', error.message);
  } else {
    console.log('✅ Successfully inserted contact notification:', data[0]);
  }
}

testNotifContact().catch(console.error);
