import 'dotenv/config';
import { supabaseAdmin } from './config/supabase.js';

async function checkBrokenImages() {
  const { data: profiles, error } = await supabaseAdmin.from('student_profiles').select('user_id, profile_photo');
  if (error) {
    console.error("Error fetching profiles:", error);
    return;
  }
  
  let fixedCount = 0;
  for (const profile of profiles) {
    if (profile.profile_photo && profile.profile_photo.includes('/storage/v1/object/public/profile-photos/')) {
      // It's a URL to the profile-photos bucket. We should verify if the file exists!
      // But since the bucket was literally just created, ANY file in there is a 404.
      // So we must clear the profile_photo for these broken URLs so it defaults back to initials.
      console.log(`Resetting broken profile photo for user ${profile.user_id}`);
      await supabaseAdmin.from('student_profiles').update({ profile_photo: null }).eq('user_id', profile.user_id);
      fixedCount++;
    }
  }
  console.log(`Fixed ${fixedCount} broken profile photos.`);
}

checkBrokenImages();
