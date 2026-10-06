import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testInsert() {
  const payload = {
    category: '1st Year | Aptitude',
    question_text: 'Test question for 1st Year',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correct_option_index: 1,
    explanation: 'Test explanation'
  };

  const { data, error } = await supabaseAdmin.from('readiness_questions').insert(payload).select();
  console.log('Insert Result:', data, 'Error:', error);
}

testInsert();
