import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { loginSchema, signupSchema, validateBody } from '../utils/validation.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Real Supabase email/password authentication
 */
router.post('/login', validateBody(loginSchema), async (req, res) => {
  try {
    const { identifier, password } = req.validatedBody;
    const trimmedIdentifier = identifier.trim();

    // 1. Check if identifier is email or phone
    const isEmail = trimmedIdentifier.includes('@');

    if (!isEmail) {
      // Phone login attempt check
      return res.status(400).json({
        success: false,
        message: 'Phone verification/login is not configured yet. Please use email verification.'
      });
    }

    // 2. Check if user exists in auth users or student_profiles
    const { data: profile } = await supabaseAdmin
      .from('student_profiles')
      .select('user_id, email')
      .eq('email', trimmedIdentifier.toLowerCase())
      .maybeSingle();

    // 3. Authenticate with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: trimmedIdentifier.toLowerCase(),
      password: password
    });

    if (error) {
      // Check error nature
      const errorMsg = error.message.toLowerCase();
      
      // If user does not exist in profile or Supabase error indicates invalid credentials
      if (!profile && (errorMsg.includes('invalid credentials') || errorMsg.includes('user not found'))) {
        return res.status(401).json({
          success: false,
          message: 'Account not found. Please create an account first.'
        });
      }

      if (errorMsg.includes('email not confirmed')) {
        return res.status(401).json({
          success: false,
          message: 'Email not verified. Please check your inbox and verify your email.'
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // 4. Load full profile
    const { data: userProfile } = await supabaseAdmin
      .from('student_profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .maybeSingle();

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        expires_in: data.session.expires_in
      },
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: userProfile?.full_name || data.user.user_metadata?.full_name || '',
        phone: userProfile?.phone || '',
        role: 'Student'
      }
    });

  } catch (err) {
    console.error('Error in POST /api/auth/login:', err);
    return res.status(500).json({
      success: false,
      message: 'An internal server error occurred during authentication.'
    });
  }
});

/**
 * POST /api/auth/signup
 * Real Supabase user registration and profile creation
 */
router.post('/signup', validateBody(signupSchema), async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.validatedBody;
    const lowerEmail = email.trim().toLowerCase();

    // 1. Check if user profile already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('student_profiles')
      .select('user_id')
      .eq('email', lowerEmail)
      .maybeSingle();

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in instead.'
      });
    }

    // 2. Register user using Supabase Auth
    const { data, error } = await supabaseAdmin.auth.signUp({
      email: lowerEmail,
      password: password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone: phone ? phone.trim() : ''
        }
      }
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Registration failed.'
      });
    }

    if (!data.user) {
      return res.status(400).json({
        success: false,
        message: 'User creation failed.'
      });
    }

    const userId = data.user.id;

    // 3. Create initial student_profiles entry
    const { error: profileError } = await supabaseAdmin
      .from('student_profiles')
      .upsert({
        user_id: userId,
        full_name: fullName.trim(),
        email: lowerEmail,
        phone: phone ? phone.trim() : '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('Error creating profile entry:', profileError);
    }

    // 4. Return safe response without password or OTP
    return res.status(201).json({
      success: true,
      message: 'Verification email sent. Please check your inbox and verify your email.',
      user: {
        id: userId,
        email: lowerEmail,
        full_name: fullName.trim()
      }
    });

  } catch (err) {
    console.error('Error in POST /api/auth/signup:', err);
    return res.status(500).json({
      success: false,
      message: 'An internal server error occurred during signup.'
    });
  }
});

/**
 * POST /api/auth/verify-otp
 * Validates actual Supabase OTP flow if used
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, phone, token, type } = req.body;

    if (phone && !email) {
      return res.status(400).json({
        success: false,
        message: 'Phone verification is not configured yet. Please use email verification.'
      });
    }

    if (!email || !token) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification token are required.'
      });
    }

    const { data, error } = await supabaseAdmin.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: token.trim(),
      type: type || 'signup'
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Invalid or expired verification code.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully.',
      session: data.session
    });

  } catch (err) {
    console.error('Error in /api/auth/verify-otp:', err);
    return res.status(500).json({
      success: false,
      message: 'Verification process failed.'
    });
  }
});

/**
 * POST /api/auth/forgot-password
 * Triggers Supabase reset password email
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${process.env.FRONTEND_ORIGIN?.split(',')[0] || 'http://localhost:5173'}#reset-password`
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to send password reset email.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Password reset link has been sent to your email address.'
    });
  } catch (err) {
    console.error('Error in /api/auth/forgot-password:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to process forgot password request.'
    });
  }
});

export default router;
