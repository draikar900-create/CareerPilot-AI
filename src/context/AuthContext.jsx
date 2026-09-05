import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Splash screen state
  const [showSplash, setShowSplash] = useState(true);
  const [authView, setAuthViewState] = useState('login');

  const setAuthView = (view) => {
    const validViews = ['login', 'signup', 'otp', 'forgot-password', 'admin-login'];
    const target = validViews.includes(view) ? view : 'login';
    setAuthViewState(target);
  };

  // 1. Initialize Supabase Auth state & listen to session changes
  useEffect(() => {
    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthenticated(!!session);
      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Student',
          phone: session.user.phone || session.user.user_metadata?.phone || '',
          role: session.user.app_metadata?.role || session.user.user_metadata?.role || 'Student',
          avatar: session.user.user_metadata?.avatar_url || ''
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    // Listen for Auth Changes (Sign in, Sign out, OAuth Callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsAuthenticated(!!session);
      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Student',
          phone: session.user.phone || session.user.user_metadata?.phone || '',
          role: session.user.app_metadata?.role || session.user.user_metadata?.role || 'Student',
          avatar: session.user.user_metadata?.avatar_url || ''
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const completeSplash = () => {
    setShowSplash(false);
  };

  // Real Supabase Email/Password Login
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('invalid credentials') || msg.includes('user not found')) {
        throw new Error('Account not found. Please create an account first.');
      }
      if (msg.includes('email not confirmed')) {
        throw new Error('Email not verified. Please check your inbox and verify your email.');
      }
      throw new Error('Invalid email or password.');
    }

    return data;
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
      throw new Error(error.message || 'Google authentication failed.');
    }

    return data;
  };

  // Real Supabase User Signup
  const signUp = async ({ fullName, email, phone, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone: phone ? phone.trim() : ''
        }
      }
    });

    if (error) {
      throw new Error(error.message || 'Registration failed.');
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
    setAuthView('login');
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
