import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { profileUpdateSchema, validateBody } from '../utils/validation.js';
import { persistentProfileStore } from '../services/persistentStore.js';

const router = express.Router();

const DB_COLUMNS = new Set([
  'user_id',
  'full_name',
  'email',
  'phone',
  'profile_photo',
  'date_of_birth',
  'college_name',
  'branch',
  'semester',
  'cgpa',
  'graduation_year',
  'technical_skills',
  'achievements',
  'github_url',
  'linkedin_url',
  'resume_url',
  'created_at',
  'updated_at'
]);

const METADATA_KEYS = new Set([
  'intro_seen',
  'onboarding_completed',
  'onboarding_completed_at',
  'current_onboarding_step',
  'target_role',
  'academic_year',
  'section',
  'batch',
  'student_id',
  'college_id',
  'department_id',
  'gender',
  'career_interests',
  'preferred_domains',
  'preferred_technologies'
]);

/**
 * GET /api/profile
 * Returns the authenticated student's profile (req.user.id)
 */
router.get('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    let { data: profile, error } = await supabaseAdmin
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve profile.'
      });
    }

    // If profile row doesn't exist in DB yet, check persistent profile store or create default
    if (!profile) {
      const stored = persistentProfileStore.getById(userId);
      if (stored) {
        profile = stored;
      } else {
        const defaultProfile = {
          user_id: userId,
          full_name: req.user.user_metadata?.full_name || req.user.email?.split('@')[0] || 'Student',
          email: req.user.email,
          phone: req.user.phone || req.user.user_metadata?.phone || '',
          profile_photo: req.user.user_metadata?.avatar_url || '',
          college_name: '',
          branch: '',
          semester: 1,
          cgpa: 0.0,
          graduation_year: new Date().getFullYear() + 4,
          technical_skills: [],
          achievements: [],
          github_url: '',
          linkedin_url: '',
          resume_url: '',
          current_onboarding_step: 1
        };

        const { data: inserted, error: insertError } = await supabaseAdmin
          .from('student_profiles')
          .insert(defaultProfile)
          .select('*')
          .maybeSingle();

        if (!insertError && inserted) {
          profile = inserted;
        } else {
          profile = defaultProfile;
        }
      }
    }

    const meta = req.user.user_metadata || {};
    const formattedProfile = {
      ...profile,
      intro_seen: meta.intro_seen ?? profile?.intro_seen ?? false,
      onboarding_completed: Boolean(
        meta.onboarding_completed ||
        profile?.onboarding_completed ||
        (meta.current_onboarding_step && Number(meta.current_onboarding_step) > 7) ||
        (profile?.current_onboarding_step && Number(profile.current_onboarding_step) > 7)
      ),
      current_onboarding_step: meta.current_onboarding_step || profile?.current_onboarding_step || 1,
      gender: meta.gender || '',
      target_role: meta.target_role || '',
      academic_year: meta.academic_year || (profile?.semester ? `${Math.ceil(profile.semester / 2)}${profile.semester <= 2 ? 'st' : profile.semester <= 4 ? 'nd' : profile.semester <= 6 ? 'rd' : 'th'} Year` : '1st Year'),
      career_interests: meta.career_interests || [],
      preferred_domains: meta.preferred_domains || [],
      preferred_technologies: meta.preferred_technologies || []
    };

    // Save to persistent store as well
    persistentProfileStore.save(formattedProfile);

    return res.status(200).json({
      success: true,
      profile: formattedProfile
    });
  } catch (err) {
    console.error('Error in GET /api/profile:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile data.'
    });
  }
});

/**
 * PUT /api/profile
 * Updates the authenticated student's profile (req.user.id)
 */
router.put('/', authenticateUser, validateBody(profileUpdateSchema), async (req, res) => {
  try {
    const userId = req.user.id;
    const dbUpdates = {
      user_id: userId,
      email: req.user.email,
      updated_at: new Date().toISOString()
    };

    // Ensure full_name is present in case of initial row creation
    if (!dbUpdates.full_name) {
      dbUpdates.full_name = req.user.user_metadata?.full_name || req.user.email?.split('@')[0] || 'Student';
    }

    const metaUpdates = {};

    // FORBIDDEN SENSITIVE KEYS (cannot be modified by student profile updates)
    const FORBIDDEN_KEYS = new Set(['role', 'isSuperAdmin', 'adminRole', 'college_id', 'collegeId']);

    for (const [key, val] of Object.entries(req.validatedBody)) {
      if (val !== undefined && !FORBIDDEN_KEYS.has(key)) {
        if (DB_COLUMNS.has(key)) {
          dbUpdates[key] = val;
        }
        if (METADATA_KEYS.has(key)) {
          metaUpdates[key] = val;
        }
      }
    }

    // Explicitly delete sensitive keys to prevent role escalation
    delete metaUpdates.role;
    delete metaUpdates.app_metadata;
    delete metaUpdates.isSuperAdmin;
    delete metaUpdates.adminRole;

    // Safety Guard: Preserve existing database resume_url if not explicitly provided in updates
    if (!dbUpdates.resume_url) {
      const { data: existingProfile } = await supabaseAdmin
        .from('student_profiles')
        .select('resume_url')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingProfile?.resume_url) {
        dbUpdates.resume_url = existingProfile.resume_url;
      }
    }

    // 1. Update user_metadata in Supabase Auth if metadata keys were provided
    if (Object.keys(metaUpdates).length > 0) {
      const currentMeta = req.user.user_metadata || {};
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...currentMeta,
          ...metaUpdates
        }
      }).catch(err => {
        console.warn('Failed to update user_metadata in auth:', err.message);
      });
    }

    // 2. Persist profile updates to student_profiles table (try update first, then insert if not found)
    let updatedProfile = null;
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('student_profiles')
      .update(dbUpdates)
      .eq('user_id', userId)
      .select('*')
      .maybeSingle();

    if (!updateError && updateData) {
      updatedProfile = updateData;
    } else {
      // If update returned no row, attempt insert
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('student_profiles')
        .insert(dbUpdates)
        .select('*')
        .maybeSingle();

      if (!insertError && insertData) {
        updatedProfile = insertData;
      } else {
        console.warn('Warning: student_profiles DB persistence notice:', insertError?.message || updateError?.message);
        // Metadata updates were already saved to Supabase Auth above, ensuring user flow proceeds cleanly
      }
    }

    const mergedProfile = {
      ...(updatedProfile || dbUpdates),
      ...(req.user.user_metadata || {}),
      ...metaUpdates
    };

    // Also persist to disk backup
    persistentProfileStore.save(mergedProfile);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: mergedProfile
    });
  } catch (err) {
    console.error('Error in PUT /api/profile:', err);
    return res.status(500).json({
      success: false,
      message: 'An internal error occurred while updating profile.'
    });
  }
});

/**
 * GET /api/profile/feedback
 * Retrieves faculty feedback records intended for the authenticated student (req.user.id)
 */
router.get('/feedback', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: feedbackList, error } = await supabaseAdmin
      .from('faculty_feedback')
      .select('*, faculty_profiles(full_name, designation, department)')
      .eq('student_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      // Fallback query without relational join
      const { data: simpleList } = await supabaseAdmin
        .from('faculty_feedback')
        .select('*')
        .eq('student_id', userId)
        .order('created_at', { ascending: false });

      return res.status(200).json({
        success: true,
        feedback: simpleList || []
      });
    }

    return res.status(200).json({
      success: true,
      feedback: feedbackList || []
    });
  } catch (err) {
    console.error('Error in GET /api/profile/feedback:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch student feedback.' });
  }
});

export default router;
