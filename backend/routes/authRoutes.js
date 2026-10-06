import express from 'express';
import { supabaseAdmin, supabaseAuth } from '../config/supabase.js';
import { loginSchema, signupSchema, validateBody } from '../utils/validation.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Authenticates user using Supabase Auth, retrieves verified profile & role across tables
 */
router.post('/login', validateBody(loginSchema), async (req, res) => {
  try {
    const { identifier, password } = req.validatedBody;
    const trimmedIdentifier = identifier.trim();

    // 1. Check if identifier is email
    const isEmail = trimmedIdentifier.includes('@');
    if (!isEmail) {
      return res.status(400).json({
        success: false,
        message: 'Phone verification/login is not configured yet. Please use email verification.'
      });
    }

    const lowerEmail = trimmedIdentifier.toLowerCase();
    console.log(`[AUTH API DEBUG] Received login attempt for email: ${lowerEmail}`);

    // 2. Direct Supabase Auth authentication using signInWithPassword
    let { data, error } = await supabaseAuth.auth.signInWithPassword({
      email: lowerEmail,
      password: password
    });

    console.log(`[AUTH API DEBUG] Supabase Auth result for ${lowerEmail}:`, {
      authenticated: !!(data?.user && data?.session),
      user_id: data?.user?.id || null,
      error_name: error?.name || null,
      error_message: error?.message || null,
      error_status: error?.status || null
    });

    // Handle authentication failures with specific, meaningful error messages
    if (error || !data?.user || !data?.session) {
      const errMsg = error?.message ? error.message.toLowerCase() : '';
      console.warn(`[AUTH API] Login authentication failed for ${lowerEmail}:`, error?.message || 'No user/session returned');

      if (errMsg.includes('rate limit')) {
        return res.status(429).json({
          success: false,
          message: 'Too many login attempts. Please wait a minute and try again.'
        });
      }

      if (errMsg.includes('confirm') || errMsg.includes('email not confirmed')) {
        return res.status(400).json({
          success: false,
          message: 'Email not verified. Please check your inbox and verify your email before logging in.'
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials.'
      });
    }

    // 3. Authenticated successfully! Get verified user ID and metadata
    const userId = data.user.id;
    const authEmail = data.user.email ? data.user.email.toLowerCase() : lowerEmail;
    const userMetadata = data.user.user_metadata || {};

    // 4. Authoritative Role and Profile Lookup across database tables
    const normalizeRole = (r) => {
      if (!r) return 'Student';
      const str = String(r).trim().toLowerCase();
      if (str === 'admin' || str === 'superadmin') return 'Admin';
      if (str === 'placementofficer' || str === 'placement_officer' || str === 'tpo') return 'PlacementOfficer';
      if (str === 'faculty') return 'Faculty';
      return 'Student';
    };

    let userRole = 'Student';
    let userFullName = userMetadata.full_name || authEmail.split('@')[0] || 'User';
    let userPhone = userMetadata.phone || '';

    // Step A: Check admin_users table (Admin, SuperAdmin, PlacementOfficer)
    try {
      const { data: adminRecord } = await supabaseAdmin
        .from('admin_users')
        .select('role, full_name')
        .eq('user_id', userId)
        .maybeSingle();

      if (adminRecord) {
        userRole = normalizeRole(adminRecord.role);
        if (adminRecord.full_name) userFullName = adminRecord.full_name;
      }
    } catch (adminErr) {
      console.warn('[AUTH API] Admin table check notice:', adminErr.message);
    }

    // Step B: If not admin/TPO, check faculty_profiles table
    if (userRole === 'Student') {
      try {
        const { data: facultyRecord } = await supabaseAdmin
          .from('faculty_profiles')
          .select('full_name, phone')
          .eq('user_id', userId)
          .maybeSingle();

        if (facultyRecord) {
          userRole = 'Faculty';
          if (facultyRecord.full_name) userFullName = facultyRecord.full_name;
          if (facultyRecord.phone) userPhone = facultyRecord.phone;
        }
      } catch (facErr) {
        console.warn('[AUTH API] Faculty table check notice:', facErr.message);
      }
    }

    // Step C: Check metadata role if still default Student
    if (userRole === 'Student' && userMetadata.role) {
      const metaRole = normalizeRole(userMetadata.role);
      if (metaRole !== 'Student') {
        userRole = metaRole;
      }
    }

    // Step D: Auto-repair and guarantee table profile records matching verified role
    if (userRole === 'Faculty') {
      try {
        const { data: facultyRecord } = await supabaseAdmin
          .from('faculty_profiles')
          .select('full_name, phone')
          .eq('user_id', userId)
          .maybeSingle();

        if (!facultyRecord) {
          console.log(`[AUTH API] Auto-repairing missing faculty_profiles record for: ${userId}`);
          await supabaseAdmin
            .from('faculty_profiles')
            .upsert({
              user_id: userId,
              full_name: userFullName,
              email: authEmail,
              phone: userPhone,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
        }
      } catch (e) {
        console.warn('[AUTH API] Faculty auto-repair notice:', e.message);
      }
    } else if (userRole === 'Admin' || userRole === 'PlacementOfficer') {
      try {
        const { data: adminRecord } = await supabaseAdmin
          .from('admin_users')
          .select('role, full_name')
          .eq('user_id', userId)
          .maybeSingle();

        if (!adminRecord) {
          console.log(`[AUTH API] Auto-repairing missing admin_users record for: ${userId}`);
          await supabaseAdmin
            .from('admin_users')
            .upsert({
              user_id: userId,
              email: authEmail,
              full_name: userFullName,
              role: userRole,
              created_at: new Date().toISOString()
            });
        }
      } catch (e) {
        console.warn('[AUTH API] Admin auto-repair notice:', e.message);
      }
    } else {
      try {
        const { data: studentRecord } = await supabaseAdmin
          .from('student_profiles')
          .select('full_name, phone')
          .eq('user_id', userId)
          .maybeSingle();

        if (studentRecord) {
          if (studentRecord.full_name) userFullName = studentRecord.full_name;
          if (studentRecord.phone) userPhone = studentRecord.phone;
        } else {
          console.log(`[AUTH API] Creating student_profiles record for authenticated student: ${userId}`);
          await supabaseAdmin
            .from('student_profiles')
            .upsert({
              user_id: userId,
              full_name: userFullName,
              email: authEmail,
              phone: userPhone,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
        }
      } catch (studErr) {
        console.warn('[AUTH API] Student table check notice:', studErr.message);
      }
    }

    // 5. Return success response with session and authenticated user profile
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
        id: userId,
        email: authEmail,
        full_name: userFullName,
        phone: userPhone,
        role: userRole
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
    const { fullName, email, phone, role, password } = req.validatedBody;
    const lowerEmail = email.trim().toLowerCase();
    
    const normalizeRole = (r) => {
      if (!r) return 'Student';
      const str = String(r).trim().toLowerCase();
      if (str === 'admin' || str === 'superadmin') return 'Admin';
      if (str === 'placementofficer' || str === 'placement_officer' || str === 'tpo') return 'PlacementOfficer';
      if (str === 'faculty') return 'Faculty';
      return 'Student';
    };

    const userRole = normalizeRole(role);

    // 1. Check if user already exists in Supabase Auth
    try {
      const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = (userList?.users || []).find(u => u.email?.toLowerCase() === lowerEmail);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists. Please log in instead.'
        });
      }
    } catch (e) {}

    // 2. Register user using Supabase Auth
    let user = null;
    let authError = null;

    try {
      const { data: adminData, error: adminErr } = await supabaseAdmin.auth.admin.createUser({
        email: lowerEmail,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName.trim(),
          phone: phone ? phone.trim() : '',
          role: userRole
        }
      });

      if (adminErr) {
        const msg = adminErr.message ? adminErr.message.toLowerCase() : '';
        if (msg.includes('already') || msg.includes('registered') || msg.includes('exists')) {
          return res.status(400).json({
            success: false,
            message: 'An account with this email address already exists. Please log in instead.'
          });
        }
        authError = adminErr;
      }

      if (!adminErr && adminData?.user) {
        user = adminData.user;
      }
    } catch (e) {
      // Ignore admin createUser error, fall back to standard signUp below
    }

    if (!user) {
      const { data: clientData, error: clientErr } = await supabaseAuth.auth.signUp({
        email: lowerEmail,
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone ? phone.trim() : '',
            role: userRole
          }
        }
      });
      user = clientData?.user || null;
      authError = clientErr || authError;
    }

    if (authError && authError.message?.toLowerCase().includes('rate limit')) {
      // If rate limited, check if account can sign in
      const { data: signTry } = await supabaseAuth.auth.signInWithPassword({
        email: lowerEmail,
        password: password
      }).catch(() => ({ data: null }));

      if (signTry?.user) {
        user = signTry.user;
        authError = null;
      } else {
        return res.status(429).json({
          success: false,
          message: 'Too many registration requests. Please wait a minute or try logging in.'
        });
      }
    }

    if (authError || !user) {
      const errMsg = authError?.message || 'Registration failed. Please check your credentials.';
      const isDup = errMsg.toLowerCase().includes('already') || errMsg.toLowerCase().includes('registered') || errMsg.toLowerCase().includes('exists');
      return res.status(400).json({
        success: false,
        message: isDup ? 'An account with this email address already exists. Please log in instead.' : errMsg
      });
    }

    const userId = user.id;

    // 2. Create profile entry matching role
    try {
      if (userRole === 'Admin' || userRole === 'PlacementOfficer') {
        await supabaseAdmin.from('admin_users').upsert({
          user_id: userId,
          email: lowerEmail,
          full_name: fullName.trim(),
          role: userRole,
          created_at: new Date().toISOString()
        });
      } else if (userRole === 'Faculty') {
        await supabaseAdmin.from('faculty_profiles').upsert({
          user_id: userId,
          email: lowerEmail,
          full_name: fullName.trim(),
          phone: phone ? phone.trim() : '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      } else {
        await supabaseAdmin.from('student_profiles').upsert({
          user_id: userId,
          full_name: fullName.trim(),
          email: lowerEmail,
          phone: phone ? phone.trim() : '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn('[SIGNUP API] Profile upsert notice:', e.message);
    }

    // Auto-confirm user account
    await supabaseAdmin.auth.admin.updateUserById(userId, { email_confirm: true }).catch(() => {});

    // 3. Authenticate user immediately to issue active session
    const { data: sessionData } = await supabaseAuth.auth.signInWithPassword({
      email: lowerEmail,
      password: password
    }).catch(() => ({ data: null }));

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Logging you in...',
      session: sessionData?.session || null,
      user: {
        id: userId,
        email: lowerEmail,
        full_name: fullName.trim(),
        phone: phone ? phone.trim() : '',
        role: userRole
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

    const { data, error } = await supabaseAuth.auth.verifyOtp({
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

    const { error } = await supabaseAuth.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
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
