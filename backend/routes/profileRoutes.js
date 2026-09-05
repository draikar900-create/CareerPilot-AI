import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { profileUpdateSchema, validateBody } from '../utils/validation.js';

const router = express.Router();

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
        message: 'Failed to fetch student profile.'
      });
    }

    // If profile row doesn't exist yet, create a default one based on Auth user metadata
    if (!profile) {
      const defaultProfile = {
        user_id: userId,
        full_name: req.user.user_metadata?.full_name || req.user.email?.split('@')[0] || 'Student',
        email: req.user.email,
        phone: req.user.phone || req.user.user_metadata?.phone || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('student_profiles')
        .insert(defaultProfile)
        .select('*')
        .single();

      if (createError) {
        console.error('Error creating default profile:', createError);
        profile = defaultProfile;
      } else {
        profile = newProfile;
      }
    }

    return res.status(200).json({
      success: true,
      profile: profile
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
    const updates = {
      ...req.validatedBody,
      updated_at: new Date().toISOString()
    };

    const { data: updatedProfile, error } = await supabaseAdmin
      .from('student_profiles')
      .upsert({
        user_id: userId,
        ...updates
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update profile.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile
    });
  } catch (err) {
    console.error('Error in PUT /api/profile:', err);
    return res.status(500).json({
      success: false,
      message: 'An internal error occurred while updating profile.'
    });
  }
});

export default router;
