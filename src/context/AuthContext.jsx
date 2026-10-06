import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { apiService } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Splash screen state
  const [showSplash, setShowSplash] = useState(true);
  const [authView, setAuthViewState] = useState('landing');

  const setAuthView = (view) => {
    const validViews = ['landing', 'login', 'signup', 'otp', 'forgot-password', 'admin-login'];
    const target = validViews.includes(view) ? view : 'landing';
    setAuthViewState(target);
  };

  // Helper to normalize and resolve canonical user roles
  const resolveNormalizedRole = (rawRole) => {
    if (!rawRole) return 'Student';
    const r = String(rawRole).trim().toLowerCase();
    if (r === 'admin' || r === 'superadmin') return 'Admin';
    if (r === 'placementofficer' || r === 'placement_officer' || r === 'tpo') return 'PlacementOfficer';
    if (r === 'faculty') return 'Faculty';
    if (r === 'student') return 'Student';
    return 'Student';
  };

  // Helper to build canonical user state with DB role lookup fallback across admin_users, faculty_profiles, and student_profiles
  const syncUserWithRole = async (user) => {
    if (!user) {
      setCurrentUser(null);
      return;
    }

    // Supabase Auth user.role defaults to "authenticated" database role string. Extract custom metadata role first.
    let rawRoleCandidate = user.role && user.role !== 'authenticated' && user.role !== 'anon'
      ? user.role
      : (user.user_metadata?.role || user.app_metadata?.role || user.role);

    let initialRole = resolveNormalizedRole(rawRoleCandidate);

    const baseUser = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      phone: user.phone || user.user_metadata?.phone || '',
      role: initialRole,
      avatar: user.user_metadata?.avatar_url || '',
      user_metadata: user.user_metadata || {},
      app_metadata: user.app_metadata || {}
    };
    setCurrentUser(baseUser);

    try {
      // 1. Authoritative check against admin_users table in PostgreSQL
      const { data: adminRecord } = await supabase
        .from('admin_users')
        .select('role, full_name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (adminRecord?.role) {
        const dbRole = resolveNormalizedRole(adminRecord.role);
        setCurrentUser(prev => prev ? { ...prev, role: dbRole, name: adminRecord.full_name || prev.name } : null);
        return dbRole;
      }

      // 2. Authoritative check against faculty_profiles table
      const { data: facultyRecord } = await supabase
        .from('faculty_profiles')
        .select('user_id, full_name, phone')
        .eq('user_id', user.id)
        .maybeSingle();

      if (facultyRecord) {
        setCurrentUser(prev => prev ? {
          ...prev,
          role: 'Faculty',
          name: facultyRecord.full_name || prev.name,
          phone: facultyRecord.phone || prev.phone
        } : null);
        return 'Faculty';
      }

      // 3. Check student_profiles table ONLY if user is a Student (never downgrade Admin/Faculty/TPO)
      if (initialRole === 'Student') {
        const { data: studentRecord } = await supabase
          .from('student_profiles')
          .select('user_id, full_name, phone')
          .eq('user_id', user.id)
          .maybeSingle();

        if (studentRecord) {
          setCurrentUser(prev => prev ? {
            ...prev,
            role: 'Student',
            name: studentRecord.full_name || prev.name,
            phone: studentRecord.phone || prev.phone
          } : null);
          return 'Student';
        }
      }
    } catch (dbErr) {
      console.warn('[AuthContext] Role check notice:', dbErr.message);
    }
  };

  // Restore authenticated session and listen for session state changes
  useEffect(() => {
    let mounted = true;

    // Restore existing session on app startup
    const initSession = async () => {
      try {
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        if (mounted && existingSession?.user) {
          setSession(existingSession);
          setIsAuthenticated(true);
          await syncUserWithRole(existingSession.user);
        }
      } catch (err) {
        console.warn('[AuthContext] Session restore notice:', err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;
      if (currentSession?.user) {
        setSession(currentSession);
        setIsAuthenticated(true);
        await syncUserWithRole(currentSession.user);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setCurrentUser(null);
        setIsAuthenticated(false);
        setAuthViewState('login');
      }
    });

    const handleExpired = () => {
      console.warn('[AUTH DEBUG] Session expired event received. Clearing user state.');
      setSession(null);
      setCurrentUser(null);
      setIsAuthenticated(false);
      setAuthViewState('login');
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('cp_session_expired', handleExpired);
    }

    return () => {
      mounted = false;
      subscription?.unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('cp_session_expired', handleExpired);
      }
    };
  }, []);

  const completeSplash = () => {
    setShowSplash(false);
  };

  // Real Supabase Email/Password Login
  const signIn = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    console.log('[AUTH DEBUG] Initiating signIn for:', cleanEmail);

    // 1. Primary: Login via Express Backend API
    try {
      const apiRes = await apiService.login(cleanEmail, password);
      if (apiRes && apiRes.success && apiRes.session) {
        console.log('[AUTH DEBUG] Backend login API succeeded for:', cleanEmail);
        setSession(apiRes.session);
        setIsAuthenticated(true);
        if (apiRes.user) {
          syncUserWithRole(apiRes.user);
        }
        return apiRes;
      }
    } catch (apiErr) {
      console.warn('[AUTH DEBUG] Backend login API error:', apiErr.message);
      // If error is a response from the backend (not network offline), rethrow the backend error message directly
      const errLower = (apiErr?.message || '').toLowerCase();
      if (!errLower.includes('failed to fetch') && !errLower.includes('networkerror') && !errLower.includes('load failed')) {
        throw apiErr;
      }
    }

    // 2. Direct Supabase Client Authentication Fallback
    console.log('[AUTH DEBUG] Backend unreachable, attempting direct Supabase client auth...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('email not confirmed')) {
        throw new Error('Email not verified. Please check your inbox and confirm your email before logging in.');
      }
      if (msg.includes('invalid credentials') || msg.includes('user not found')) {
        throw new Error('Invalid email or password. Please check your credentials or create an account if you do not have one.');
      }
      throw new Error(error.message || 'Invalid email or password.');
    }

    if (data?.session && data?.user) {
      setSession(data.session);
      setIsAuthenticated(true);
      await syncUserWithRole(data.user);
    }

    return data;
  };

  // Real Supabase User Signup
  const signUp = async ({ fullName, email, phone, role, password }) => {
    const cleanEmail = email.trim().toLowerCase();
    const userRole = role || 'Student';
    console.log('[AUTH DEBUG] Initiating signUp for:', cleanEmail, 'with role:', userRole);

    // 1. Register user and create profile entry via backend API
    let apiResult = null;
    let apiErrorMsg = null;
    try {
      apiResult = await apiService.signup({ fullName, email: cleanEmail, phone, role: userRole, password });
      console.log('[AUTH DEBUG] Backend signup API response:', apiResult);
    } catch (apiErr) {
      console.warn('[AUTH DEBUG] Backend signup API notice:', apiErr.message);
      apiErrorMsg = apiErr.message;
    }

    // If backend signup succeeded, automatically perform login to obtain active session
    if (apiResult?.success) {
      try {
        await signIn(cleanEmail, password);
      } catch (loginErr) {
        console.warn('[AUTH DEBUG] Post-signup login notice:', loginErr.message);
      }
      return apiResult;
    }

    // If backend returned explicit error (like email rate limit or duplicate), rethrow it directly
    if (apiErrorMsg && (apiErrorMsg.includes('rate limit') || apiErrorMsg.includes('already registered'))) {
      throw new Error(apiErrorMsg);
    }

    // 2. Fallback: Register user via Supabase Client
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone: phone ? phone.trim() : '',
          role: userRole
        }
      }
    });

    console.log('[AUTH DEBUG] Supabase Client signUp response:', {
      user: data?.user ? { id: data.user.id, email: data.user.email, confirmed_at: data.user.email_confirmed_at } : null,
      session: data?.session ? { expires_at: data.session.expires_at } : null,
      error: error ? { message: error.message, status: error.status } : null
    });

    if (error) {
      console.error('[AUTH DEBUG] Supabase signUp error:', error.message);
      throw new Error(error.message || apiErrorMsg || 'Registration failed.');
    }

    // Post-signup: attempt immediate signIn to guarantee session generation and auto-confirmation
    try {
      await signIn(cleanEmail, password);
    } catch (postSignInErr) {
      console.warn('[AUTH DEBUG] Post-signup fallback signIn notice:', postSignInErr.message);
    }

    return data || apiResult;
  };

  // Real Supabase Google OAuth Login
  const signInWithGoogle = async () => {
    const redirectUrl = window.location.origin;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });

    if (error) {
      console.error('[AUTH DEBUG] Google OAuth error:', error.message);
      throw new Error(error.message || 'Google authentication failed.');
    }

    return data;
  };

  // Real Password Reset Email
  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}#reset-password`
    });

    if (error) {
      throw new Error(error.message || 'Failed to send password reset email.');
    }

    return data;
  };

  // Real Update Password
  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw new Error(error.message || 'Failed to update password.');
    }

    return data;
  };

  // Admin Login via Supabase / Backend API
  const adminLogin = async (email, password) => {
    try {
      const data = await signIn(email, password);
      // Verify admin role if present
      if (data?.user) {
        return { success: true };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Real Logout
  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setSession(null);
    setCurrentUser(null);
    setAuthView('landing');
  };

  return (
    <AuthContext.Provider
      value={{
        showSplash,
        setShowSplash,
        completeSplash,
        isAuthenticated,
        session,
        currentUser,
        setCurrentUser,
        loading,
        authView,
        setAuthView,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        logout: signOut,
        resetPassword,
        updatePassword,
        adminLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
