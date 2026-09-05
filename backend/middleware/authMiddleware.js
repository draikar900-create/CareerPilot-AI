import { supabaseAdmin } from '../config/supabase.js';

/**
 * Middleware: authenticateUser
 * Validates Supabase JWT access token passed in Authorization header.
 * Attaches authenticated user object to req.user (id, email, metadata).
 */
export async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Missing or malformed Authorization header.'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Bearer token is missing.'
      });
    }

    // Verify token with Supabase Auth
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session. Please log in again.'
      });
    }

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
 * Middleware: requireAdmin
 * Validates that the authenticated user possesses Admin privileges in the system.
 * Checks both admin_users table and app_metadata/role.
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

    // Check if user is registered in admin_users table
    const { data: adminRecord, error } = await supabaseAdmin
      .from('admin_users')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    const isDatabaseAdmin = adminRecord && ['Admin', 'PlacementOfficer', 'SuperAdmin'].includes(adminRecord.role);
    const isMetadataAdmin = req.user.app_metadata?.role === 'Admin' || req.user.user_metadata?.role === 'Admin';

    if (!isDatabaseAdmin && !isMetadataAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to access administrative resources.'
      });
    }

    req.user.adminRole = adminRecord?.role || 'Admin';
    next();
  } catch (error) {
    console.error('Error in requireAdmin middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization check failed.'
    });
  }
}
