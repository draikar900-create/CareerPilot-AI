import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jobsFile = path.join(__dirname, '../src/components/skills/Jobs.jsx');

let content = fs.readFileSync(jobsFile, 'utf8');

// Replacements
content = content.replace(/Internships/g, 'Jobs');
content = content.replace(/internships/g, 'jobs');
content = content.replace(/internship/g, 'job');
content = content.replace(/Internship/g, 'Job');
content = content.replace(/stipend/g, 'salary_package');
content = content.replace(/duration/g, 'experience');
content = content.replace(/role_title/g, 'title');

fs.writeFileSync(jobsFile, content);
console.log('Jobs.jsx successfully updated.');
