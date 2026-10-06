import { supabaseAdmin, supabaseAuth } from '../config/supabase.js';

/**
 * Middleware: authenticateUser
 * Validates Supabase JWT access token passed in Authorization header.
 * Attaches authenticated user object to req.user (id, email, metadata).
 */
export async function authenticateUser(req, res, next) {
  try {
    if (process.env.NODE_ENV === 'test' && req.user) {
      return next();
    }
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('[AuthMiddleware] Missing or malformed authHeader:', authHeader);
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Missing or malformed Authorization header.'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.warn('[AuthMiddleware] Bearer token missing from header');
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Bearer token is missing.'
      });
    }

    // Verify token with Supabase Auth using isolated auth client
    const { data: { user }, error } = await supabaseAuth.auth.getUser(token);

    if (error || !user) {
      console.error('[AUTH DEBUG Backend] getUser failed. Error:', error?.message || error, '| Token prefix:', token.substring(0, 15) + '...');
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session. Please log in again.',
        debug_error: error?.message || 'No user returned'
      });
    }

    console.log('[AUTH DEBUG Backend] User authenticated successfully | User ID:', user.id, '| Email:', user.email);

    // Attach validated user to request object
    req.user = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      user_metadata: user.user_metadata || {},
      app_metadata: user.app_metadata || {}
    };

    next();
  } catch (error) {
    console.error('Error in authenticateUser middleware:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed due to token validation error.'
    });
  }
}

/**
 * Middleware: attachCollegeScope
 * Server-authoritative college tenant context builder.
 * Derives user's role and college scope directly from authenticated database profile.
 * Attaches req.userScope = { userId, role, collegeId, collegeName, departmentId, isSuperAdmin }
 */
export async function attachCollegeScope(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Authentication required for college scope.' });
    }

    const userId = req.user.id;

    // 1. Check admin_users table (Admin, SuperAdmin, PlacementOfficer)
    const { data: adminRecord } = await supabaseAdmin
      .from('admin_users')
      .select('role, college_id, college_name')
      .eq('user_id', userId)
      .maybeSingle();

    if (adminRecord) {
      const roleName = adminRecord.role || 'Admin';
      const isSuper = roleName === 'SuperAdmin';
      const collegeName = adminRecord.college_name || req.user.user_metadata?.college_name || req.user.app_metadata?.college_name || null;
      req.userScope = {
        userId,
        role: roleName,
        collegeId: adminRecord.college_id || null,
        collegeName,
        departmentId: null,
        isSuperAdmin: isSuper
      };
      return next();
    }

    // 2. Check faculty_profiles table
    const { data: facultyRecord } = await supabaseAdmin
      .from('faculty_profiles')
      .select('user_id, college_id, college_name, department_id, onboarding_completed')
      .eq('user_id', userId)
      .maybeSingle();

    if (facultyRecord) {
      req.userScope = {
        userId,
        role: 'Faculty',
        collegeId: facultyRecord.college_id || null,
        collegeName: facultyRecord.college_name || req.user.user_metadata?.college_name || null,
        departmentId: facultyRecord.department_id || null,
        onboardingCompleted: Boolean(facultyRecord.onboarding_completed),
        isSuperAdmin: false
      };
      return next();
    }

    // 3. Check student_profiles table
    const { data: studentRecord } = await supabaseAdmin
      .from('student_profiles')
      .select('user_id, college_id, college_name, department_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (studentRecord) {
      req.userScope = {
        userId,
        role: 'Student',
        collegeId: studentRecord.college_id || null,
        collegeName: studentRecord.college_name || req.user.user_metadata?.college_name || null,
        departmentId: studentRecord.department_id || null,
        isSuperAdmin: false
      };
      return next();
    }

    // 4. Metadata role fallback
    const metaRole = req.user.app_metadata?.role || req.user.user_metadata?.role || 'Student';
    req.userScope = {
      userId,
      role: metaRole,
      collegeId: null,
      collegeName: req.user.user_metadata?.college_name || null,
      departmentId: null,
      isSuperAdmin: metaRole === 'SuperAdmin'
    };

    next();
  } catch (error) {
    console.error('Error in attachCollegeScope middleware:', error);
    return res.status(500).json({ success: false, message: 'Failed to resolve server-side college scope.' });
  }
}

/**
 * Middleware: requireStudent
 * Validates that the authenticated user is a Student.
 */
export async function requireStudent(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Unauthenticated. Access denied.' });
    }

    const role = req.userScope?.role || req.user.app_metadata?.role || req.user.user_metadata?.role || 'Student';

    if (role !== 'Student') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. This endpoint is strictly for student accounts.'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Student authorization check failed.' });
  }
}

/**
 * Middleware: requireAdmin
 * Validates that the authenticated user possesses Admin, PlacementOfficer, or SuperAdmin privileges.
 */
export async function requireAdmin(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthenticated. Access denied.'
      });
    }

    const userId = req.user.id;

    const { data: adminRecord } = await supabaseAdmin
      .from('admin_users')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    const isDatabaseAdmin = adminRecord && ['Admin', 'PlacementOfficer', 'SuperAdmin', 'TPO'].includes(adminRecord.role);
    const isMetadataAdmin = ['Admin', 'PlacementOfficer', 'SuperAdmin', 'TPO'].includes(req.user.app_metadata?.role) || ['Admin', 'PlacementOfficer', 'SuperAdmin', 'TPO'].includes(req.user.user_metadata?.role);

    if (!isDatabaseAdmin && !isMetadataAdmin) {
      console.warn(`[AuthMiddleware] Admin authorization failed for user ${userId}.`);
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to access administrative resources.'
      });
    }

    req.user.adminRole = adminRecord?.role || 'Admin';
    if (!req.userScope) {
      const collegeName = req.user.user_metadata?.college_name || req.user.app_metadata?.college_name || null;
      req.userScope = {
        userId,
        role: adminRecord?.role || 'Admin',
        collegeId: null,
        collegeName,
        isSuperAdmin: adminRecord?.role === 'SuperAdmin'
      };
    }
    next();
  } catch (error) {
    console.error('Error in requireAdmin middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization check failed.'
    });
  }
}

/**
 * Middleware: requirePlacementOfficer
 * Validates that the authenticated user is a PlacementOfficer/TPO, Admin, or SuperAdmin.
 */
export async function requirePlacementOfficer(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Unauthenticated. Access denied.' });
    }

    const userId = req.user.id;

    const { data: adminRecord } = await supabaseAdmin
      .from('admin_users')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    const role = adminRecord?.role || req.user.app_metadata?.role || req.user.user_metadata?.role;
    const isTpoOrAdmin = ['PlacementOfficer', 'TPO', 'Admin', 'SuperAdmin'].includes(role);

    if (!isTpoOrAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Placement Officer or Administrative access required.'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Placement officer authorization check failed.' });
  }
}

/**
 * Middleware: requireFaculty
 * Validates that the authenticated user is a registered Faculty member or Admin.
 */
export async function requireFaculty(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthenticated. Access denied.'
      });
    }

    const userId = req.user.id;

    const { data: facultyRecord } = await supabaseAdmin
      .from('faculty_profiles')
      .select('user_id, college_id, college_name, department_id')
      .eq('user_id', userId)
      .maybeSingle();

    const { data: adminRecord } = await supabaseAdmin
      .from('admin_users')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    const isFaculty = !!facultyRecord || req.user.app_metadata?.role === 'Faculty' || req.user.user_metadata?.role === 'Faculty';
    const isAdmin = !!adminRecord || req.user.app_metadata?.role === 'Admin' || req.user.user_metadata?.role === 'Admin';

    if (!isFaculty && !isAdmin) {
      console.warn(`[AuthMiddleware] Faculty authorization failed for user ${userId}`);
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to access faculty resources.'
      });
    }

    if (!req.userScope) {
      const collegeName = facultyRecord?.college_name || req.user.user_metadata?.college_name || null;
      req.userScope = {
        userId,
        role: isFaculty ? 'Faculty' : (adminRecord?.role || 'Admin'),
        collegeId: facultyRecord?.college_id || null,
        collegeName,
        departmentId: facultyRecord?.department_id || null,
        isSuperAdmin: adminRecord?.role === 'SuperAdmin'
      };
    }

    next();
  } catch (error) {
    console.error('Error in requireFaculty middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Faculty authorization check failed.'
    });
  }
}

/**
 * Middleware: requireSuperAdmin
 * Validates that the authenticated user is a SuperAdmin.
 */
export async function requireSuperAdmin(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Unauthenticated. Access denied.' });
    }

    const { data: adminRecord } = await supabaseAdmin
      .from('admin_users')
      .select('role')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (adminRecord?.role !== 'SuperAdmin' && req.user.app_metadata?.role !== 'SuperAdmin' && req.user.user_metadata?.role !== 'SuperAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Requires SuperAdmin administrative privileges.'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'SuperAdmin authorization check failed.' });
  }
}

/**
 * Higher-order middleware factory: requireRole
 */
export function requireRole(allowedRoles = []) {
  return async (req, res, next) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthenticated. Access denied.'
      });
    }

    const userRole = req.userScope?.role || req.user.app_metadata?.role || req.user.user_metadata?.role || 'Student';

    if (!allowedRoles.includes(userRole)) {
      if (allowedRoles.includes('Admin')) {
        const { data: adminRecord } = await supabaseAdmin.from('admin_users').select('role').eq('user_id', req.user.id).maybeSingle();
        if (adminRecord) return next();
      }
      if (allowedRoles.includes('Faculty')) {
        const { data: facultyRecord } = await supabaseAdmin.from('faculty_profiles').select('user_id').eq('user_id', req.user.id).maybeSingle();
        if (facultyRecord) return next();
      }

      return res.status(403).json({
        success: false,
        message: `Forbidden. Requires one of the following roles: ${allowedRoles.join(', ')}.`
      });
    }

    next();
  };
}
