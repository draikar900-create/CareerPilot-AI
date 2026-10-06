import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testAttemptInsert() {
  // Let's get an existing user id or use random test UUID
  const { data: users } = await supabaseAdmin.auth.admin.listUsers();
  const testUserId = users?.[0]?.id || '00000000-0000-0000-0000-000000000000';

  const payload = {
    user_id: testUserId,
    category: '1st Year | Platinum | 86.67%',
    score: 86.67,
    total_questions: 15,
    correct_count: 13
  };

  const { data, error } = await supabaseAdmin.from('readiness_attempts').insert(payload).select();
  console.log('Attempt Insert Result:', data, 'Error:', error);
}

testAttemptInsert();
