import 'dotenv/config';
import { supabaseAdmin } from './config/supabase.js';

async function createBuckets() {
  console.log("Creating buckets...");
  
  // Create profile-photos bucket
  const { data: b1, error: e1 } = await supabaseAdmin.storage.createBucket('profile-photos', {
    public: true,
    fileSizeLimit: 10485760, // 10MB
  });
  if (e1) console.error("Error creating profile-photos:", e1.message);
  else console.log("Created profile-photos bucket");

  // Create resumes bucket
  const { data: b2, error: e2 } = await supabaseAdmin.storage.createBucket('resumes', {
    public: false, // resumes shouldn't be public
    fileSizeLimit: 10485760, // 10MB
  });
  if (e2) console.error("Error creating resumes:", e2.message);
  else console.log("Created resumes bucket");
}

createBuckets();
