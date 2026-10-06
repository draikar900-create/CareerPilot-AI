import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });
import { supabaseAdmin } from '../config/supabase.js';

async function testNotifTypes() {
  const types = ['info', 'warning', 'success', 'urgent', 'broadcast', 'system', 'contact'];
  for (const t of types) {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        title: `Test ${t}`,
        message: 'Test message',
        type: t
      })
      .select('*');

    console.log(`Type '${t}':`, error ? `Error: ${error.message}` : 'Allowed ✅');
    if (data && data[0]) {
      // Clean up test row
      await supabaseAdmin.from('notifications').delete().eq('id', data[0].id);
    }
  }
}

testNotifTypes().catch(console.error);
