import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('\n❌ Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in backend/.env file.');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const ADMIN_EMAIL = 'admin@careerpilot.ai';
const ADMIN_PASSWORD = 'Admin@123456';
const ADMIN_NAME = 'CareerPilot Placement Admin';

async function seedAdminAccount() {
  console.log(`\n🔑 Initializing Admin Account Seed for CareerPilot AI...`);
  console.log(`   Target Email: ${ADMIN_EMAIL}`);

  try {
    // 1. Check if user already exists in Supabase Auth
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error querying Supabase Auth users:', listError.message);
      process.exit(1);
    }

    let adminUser = users?.find(u => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());

    if (!adminUser) {
      // 2a. Create Admin user in Supabase Auth
      console.log(`   Creating new Supabase Auth user: ${ADMIN_EMAIL}...`);
      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: ADMIN_NAME,
          role: 'Admin'
        },
        app_metadata: {
          role: 'Admin'
        }
      });

      if (createError) {
        console.error('❌ Failed to create Supabase Auth user:', createError.message);
        process.exit(1);
      }
      adminUser = createData.user;
      console.log(`   ✅ Created Supabase Auth User with UUID: ${adminUser.id}`);
    } else {
      // 2b. Update existing admin user password & metadata
      console.log(`   Existing user found (UUID: ${adminUser.id}). Updating credentials...`);
      const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(adminUser.id, {
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: ADMIN_NAME,
          role: 'Admin'
        },
        app_metadata: {
          role: 'Admin'
        }
      });

      if (updateError) {
        console.error('❌ Failed to update Supabase Auth user:', updateError.message);
        process.exit(1);
      }
      adminUser = updateData.user;
      console.log(`   ✅ Credentials updated for user UUID: ${adminUser.id}`);
    }

    // 3. Upsert record into public.admin_users table
    console.log(`   Syncing database record in public.admin_users...`);
    const { error: dbError } = await supabaseAdmin
      .from('admin_users')
      .upsert({
        user_id: adminUser.id,
        email: ADMIN_EMAIL,
        full_name: ADMIN_NAME,
        role: 'Admin',
        created_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (dbError) {
      console.warn(`   ⚠️ Warning sync to admin_users table: ${dbError.message}`);
      console.warn(`   (If table has not been created yet in Supabase SQL editor, please run backend/migrations/01_schema.sql)`);
    } else {
      console.log(`   ✅ Database record successfully updated in public.admin_users table.`);
    }

    console.log(`\n🎉 Admin Account Seed Completed Successfully!`);
    console.log(`   -------------------------------------------------`);
    console.log(`   Admin Email:    ${ADMIN_EMAIL}`);
    console.log(`   Admin Password: ${ADMIN_PASSWORD}`);
    console.log(`   User UUID:      ${adminUser.id}`);
    console.log(`   -------------------------------------------------\n`);

  } catch (err) {
    console.error('❌ Unexpected seed error:', err);
    process.exit(1);
  }
}

seedAdminAccount();
