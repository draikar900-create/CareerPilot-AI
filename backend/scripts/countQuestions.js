import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function countQuestions() {
  const { data, count, error } = await supabaseAdmin.from('readiness_questions').select('category', { count: 'exact' });
  console.log('Total Questions in DB:', count, 'Error:', error);
  if (data) {
    const yearCounts = {};
    data.forEach(q => {
      const year = q.category.split(' | ')[0];
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    });
    console.log('Year Breakdown:', yearCounts);
  }
}

countQuestions();
