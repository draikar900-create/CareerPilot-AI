import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testAdminUsersInsert() {
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
  const facultyUser = users?.find(u => u.email?.toLowerCase().includes('faculty')) || users?.[0];

  if (!facultyUser) {
    console.log('No user found for testAdminUsersInsert, skipping');
    return;
  }

  const { data, error } = await supabaseAdmin.from('admin_users').upsert({
    user_id: facultyUser.id,
    email: facultyUser.email,
    full_name: 'Dr. Rajesh Kumar (Faculty)',
    role: 'Faculty'
  }).select();

  console.log('Result:', data, 'Error:', error);
}

testAdminUsersInsert();
