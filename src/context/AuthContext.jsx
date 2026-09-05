import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const isInvalidStudentName = (name) => {
  if (!name || typeof name !== 'string') return true;
  const trimmed = name.trim().toLowerCase();
  if (!trimmed) return true;
  return (
    trimmed === 'placement team admin' ||
    trimmed === 'placement officer' ||
    trimmed === 'demo user' ||
    trimmed === 'test user' ||
    trimmed === 'student' ||
    trimmed.includes('admin') ||
    trimmed.includes('placement team')
  );
};

const DEFAULT_USER = {
  id: 'usr-fresh',
  name: '',
  email: '',
  phone: '',
  role: 'Student',
  avatar: ''
};

export function AuthProvider({ children }) {
  // 1. Authentication State on Application Start:
  // Per User Requirement: Disable automatic redirects to Dashboard, Login, or other pages.
  // The Sign-Up page (Create Your Account) must always be the first page displayed after the splash screen.
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 2. Existing account detection: Checks if user has previously registered or logged in
  const [hasAccount, setHasAccountState] = useState(() => {
    return localStorage.getItem('cp_has_account') === 'true';
  });

  const setHasAccount = (val) => {
    localStorage.setItem('cp_has_account', val ? 'true' : 'false');
    setHasAccountState(!!val);
  };

  // 3. Splash Screen: Always shown on application start (2–3 seconds)
  const [showSplash, setShowSplash] = useState(true);

  // 4. Auth view: Defaults to 'login' (Login Page) after the splash screen
  const [authView, setAuthViewState] = useState('login');

  const setAuthView = (view) => {
    const validViews = ['login', 'signup', 'otp', 'forgot-password', 'admin-login'];
    const target = validViews.includes(view) ? view : 'login';
    sessionStorage.setItem('cp_auth_view', target);
    setAuthViewState(target);
  };

  // Current user (guaranteed non-null object)
  const [currentUser, setCurrentUser] = useState(() => {
    const isAdminAuth = localStorage.getItem('cp_admin_auth') === 'true';
    const isAuth = localStorage.getItem('cp_auth') === 'true';

    // If authenticated as admin
    if (isAuth && isAdminAuth) {
      const savedAdmin = localStorage.getItem('cp_admin_user');
      if (savedAdmin) {
        try {
          return JSON.parse(savedAdmin);
        } catch (e) {}
      }
      return {
        id: 'admin-01',
        name: 'Placement Team Admin',
        email: 'adminpc123@gmail.com',
        phone: '+91 94800 12345',
        role: 'Admin',
        avatar: ''
      };
    }

    // Otherwise, student mode
    // 1. Try saved student user
    const savedStudent = localStorage.getItem('cp_student_user');
    if (savedStudent) {
      try {
        const parsed = JSON.parse(savedStudent);
        if (parsed && typeof parsed === 'object' && !isInvalidStudentName(parsed.name)) {
          return { ...DEFAULT_USER, ...parsed, role: 'Student' };
        }
      } catch (e) {}
    }

    // 2. Try generic cp_user only if not Admin and not invalid
    const saved = localStorage.getItem('cp_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.role !== 'Admin' && !isInvalidStudentName(parsed.name)) {
          return { ...DEFAULT_USER, ...parsed, role: 'Student' };
        }
      } catch (e) {}
    }

    // 3. Try saved student name or profile
    const savedStudentName = localStorage.getItem('cp_student_name');
    if (savedStudentName && !isInvalidStudentName(savedStudentName)) {
      return {
        ...DEFAULT_USER,
        name: savedStudentName.trim(),
        role: 'Student'
      };
    }

    return DEFAULT_USER;
  });

  const [pendingSignupData, setPendingSignupData] = useState(null);
  const [generatedOtp, setGeneratedOtp] = useState('482910');

  useEffect(() => {
    if (currentUser && currentUser.name && currentUser.role === 'Student' && !isInvalidStudentName(currentUser.name)) {
      localStorage.setItem('cp_student_name', currentUser.name);
      localStorage.setItem('cp_student_user', JSON.stringify(currentUser));
      localStorage.setItem('cp_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  const completeSplash = () => {
    setShowSplash(false);
    sessionStorage.setItem('cp_splash_seen', 'true');

    if (!isAuthenticated) {
      // Per Navigation Flow Specification: Automatically open the Login Page after splash screen
      setAuthView('login');
    }
  };

  const login = (email, password, rememberMe = true) => {
    let resolvedName = '';
    const trimmedEmail = (email || '').trim().toLowerCase();

    // 1. Check registered students database by email
    try {
      const registered = JSON.parse(localStorage.getItem('cp_registered_students') || '{}');
      if (trimmedEmail && registered[trimmedEmail]?.name && !isInvalidStudentName(registered[trimmedEmail].name)) {
        resolvedName = registered[trimmedEmail].name.trim();
      }
    } catch (e) {}

    // 2. Check pending signup data
    if (!resolvedName && pendingSignupData?.fullName && !isInvalidStudentName(pendingSignupData.fullName)) {
      resolvedName = pendingSignupData.fullName.trim();
    }

    // 3. Check persistent student name
    if (!resolvedName) {
      const savedStudentName = localStorage.getItem('cp_student_name');
      if (savedStudentName && !isInvalidStudentName(savedStudentName)) {
        resolvedName = savedStudentName.trim();
      }
    }

    // 4. Check saved student profile
    if (!resolvedName) {
      try {
        const savedProf = JSON.parse(localStorage.getItem('cp_profile') || '{}');
        if (savedProf?.fullName && !isInvalidStudentName(savedProf.fullName)) {
          resolvedName = savedProf.fullName.trim();
        }
      } catch (e) {}
    }

    // 5. Check saved student user
    if (!resolvedName) {
      try {
        const savedStudentUser = JSON.parse(localStorage.getItem('cp_student_user') || '{}');
        if (savedStudentUser?.name && !isInvalidStudentName(savedStudentUser.name)) {
          resolvedName = savedStudentUser.name.trim();
        }
      } catch (e) {}
    }

    // 6. Check current user if already student
    if (!resolvedName && currentUser?.role === 'Student' && currentUser?.name && !isInvalidStudentName(currentUser.name)) {
      resolvedName = currentUser.name.trim();
    }

    // 7. Extract cleanly from email prefix if present, else fallback
    if (!resolvedName) {
      if (trimmedEmail && trimmedEmail.includes('@')) {
        const prefix = trimmedEmail.split('@')[0].replace(/[._-]/g, ' ');
        resolvedName = prefix
          .split(' ')
          .filter(Boolean)
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
      }
      if (!resolvedName || isInvalidStudentName(resolvedName)) {
        resolvedName = '';
      }
    }

    const studentUser = {
      id: `usr-${Date.now()}`,
      name: resolvedName,
      email: email || (currentUser?.role === 'Student' ? currentUser.email : '') || '',
      phone: (currentUser?.role === 'Student' ? currentUser.phone : '') || '',
      role: 'Student',
      avatar: (currentUser?.role === 'Student' ? currentUser.avatar : '') || ''
    };

    setCurrentUser(studentUser);
    setIsAuthenticated(true);
    setShowSplash(false);
    setHasAccount(true);
    localStorage.setItem('cp_has_account', 'true');
    localStorage.setItem('cp_auth', 'true');
    localStorage.removeItem('cp_admin_auth');
    localStorage.setItem('cp_student_name', resolvedName);
    localStorage.setItem('cp_student_user', JSON.stringify(studentUser));
    localStorage.setItem('cp_user', JSON.stringify(studentUser));

    // Also update cp_profile so profile is immediately consistent
    try {
      const savedProf = JSON.parse(localStorage.getItem('cp_profile') || '{}');
      if (!savedProf.fullName || isInvalidStudentName(savedProf.fullName)) {
        savedProf.fullName = resolvedName;
      }
      if (email && (!savedProf.email || isInvalidStudentName(savedProf.email))) {
        savedProf.email = email;
      }
      localStorage.setItem('cp_profile', JSON.stringify(savedProf));
    } catch (e) {}

    if (password) {
      localStorage.setItem('cp_acc_credential', password);
    }
  };

  const adminLogin = (email, password) => {
    const trimmedEmail = (email || '').trim().toLowerCase();
    const trimmedPass = (password || '').trim();

    if (trimmedEmail === 'adminpc123@gmail.com' && trimmedPass === 'SalutexAI') {
      const adminUser = {
        id: 'admin-01',
        name: 'Placement Team Admin',
        email: 'adminpc123@gmail.com',
        phone: '+91 94800 12345',
        role: 'Admin',
        avatar: ''
      };
      setCurrentUser(adminUser);
      setIsAuthenticated(true);
      setShowSplash(false);
      setHasAccount(true);
      localStorage.setItem('cp_has_account', 'true');
      localStorage.setItem('cp_auth', 'true');
      localStorage.setItem('cp_admin_auth', 'true');
      localStorage.setItem('cp_admin_user', JSON.stringify(adminUser));
      localStorage.setItem('cp_user', JSON.stringify(adminUser));
      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid Placement Team credentials. Please verify your admin email and password.'
    };
  };

  const signup = (formData) => {
    const studentName = formData.fullName?.trim() || '';
    const studentEmail = formData.email?.trim() || '';
    const studentPhone = formData.phone?.trim() || '';

    const sanitizedData = {
      ...formData,
      fullName: studentName,
      email: studentEmail,
      phone: studentPhone
    };

    setPendingSignupData(sanitizedData);
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockOtp);

    // Save initial user profile data from signup inputs
    const newUser = {
      id: `usr-${Date.now()}`,
      name: studentName,
      email: studentEmail,
      phone: studentPhone,
      role: 'Student',
      avatar: ''
    };

    setCurrentUser(newUser);
    localStorage.setItem('cp_student_name', studentName);
    localStorage.setItem('cp_student_user', JSON.stringify(newUser));
    localStorage.setItem('cp_user', JSON.stringify(newUser));
    localStorage.removeItem('cp_admin_auth');

    // Register student in registry
    if (studentEmail) {
      try {
        const registered = JSON.parse(localStorage.getItem('cp_registered_students') || '{}');
        registered[studentEmail.toLowerCase()] = {
          name: studentName,
          fullName: studentName,
          email: studentEmail,
          phone: studentPhone,
          role: 'Student'
        };
        localStorage.setItem('cp_registered_students', JSON.stringify(registered));
      } catch (e) {}
    }

    // Prime student profile data
    try {
      const existingProfile = JSON.parse(localStorage.getItem('cp_profile') || '{}');
      const updated = {
        ...existingProfile,
        fullName: studentName,
        email: studentEmail || existingProfile.email || '',
        phone: studentPhone || existingProfile.phone || ''
      };
      localStorage.setItem('cp_profile', JSON.stringify(updated));
    } catch (e) {}

    // Transition to OTP Verification
    setAuthView('otp');
  };

  const signupWithGoogle = (googleData) => {
    const studentName = googleData?.fullName?.trim() || 'Student';
    const studentEmail = googleData?.email?.trim() || '';
    const studentPhone = googleData?.phone?.trim() || '';

    const newUser = {
      id: `usr-${Date.now()}`,
      name: studentName,
      email: studentEmail,
      phone: studentPhone,
      role: 'Student',
      avatar: ''
    };

    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setShowSplash(false);
    setHasAccount(true);
    localStorage.setItem('cp_has_account', 'true');
    localStorage.setItem('cp_auth', 'true');
    localStorage.removeItem('cp_admin_auth');
    localStorage.setItem('cp_student_name', studentName);
    localStorage.setItem('cp_student_user', JSON.stringify(newUser));
    localStorage.setItem('cp_user', JSON.stringify(newUser));

    try {
      const registered = JSON.parse(localStorage.getItem('cp_registered_students') || '{}');
      registered[studentEmail.toLowerCase()] = {
        name: studentName,
        fullName: studentName,
        email: studentEmail,
        phone: studentPhone,
        role: 'Student'
      };
      localStorage.setItem('cp_registered_students', JSON.stringify(registered));
    } catch (e) {}

    try {
      const existingProfile = JSON.parse(localStorage.getItem('cp_profile') || '{}');
      const updated = {
        ...existingProfile,
        fullName: studentName,
        email: studentEmail,
        phone: studentPhone
      };
      localStorage.setItem('cp_profile', JSON.stringify(updated));
    } catch (e) {}

    return newUser;
  };

  const verifyOtp = (enteredOtp) => {
    if (enteredOtp.length === 6) {
      const studentName = pendingSignupData?.fullName || localStorage.getItem('cp_student_name') || '';
      const studentEmail = pendingSignupData?.email || '';
      const studentPhone = pendingSignupData?.phone || '';

      const confirmedUser = {
        id: `usr-${Date.now()}`,
        name: studentName,
        email: studentEmail,
        phone: studentPhone,
        role: 'Student',
        avatar: ''
      };

      setCurrentUser(confirmedUser);
      localStorage.setItem('cp_student_name', studentName);
      localStorage.setItem('cp_student_user', JSON.stringify(confirmedUser));
      localStorage.setItem('cp_user', JSON.stringify(confirmedUser));
      localStorage.removeItem('cp_admin_auth');

      if (pendingSignupData?.password) {
        localStorage.setItem('cp_acc_credential', pendingSignupData.password);
      }

      setIsAuthenticated(true);
      setShowSplash(false);
      setHasAccount(true);
      localStorage.setItem('cp_has_account', 'true');
      localStorage.setItem('cp_auth', 'true');
      sessionStorage.setItem('cp_splash_seen', 'true');
      return true;
    }
    return false;
  };

  // Secure Password Verification & Update (Never exposes password to UI)
  const verifyCurrentPassword = (enteredPassword) => {
    if (!enteredPassword) return false;
    const saved = localStorage.getItem('cp_acc_credential') || localStorage.getItem('cp_password') || 'password123';
    return enteredPassword === saved;
  };

  const updateAccountPassword = (newPassword) => {
    localStorage.setItem('cp_acc_credential', newPassword);
    localStorage.setItem('cp_password', newPassword);
  };

  // Logout Flow: Clear session and redirect back to Login page
  const logout = () => {
    const wasAdmin = currentUser?.role === 'Admin' || localStorage.getItem('cp_admin_auth') === 'true';

    setIsAuthenticated(false);
    localStorage.removeItem('cp_auth');
    sessionStorage.removeItem('cp_auth');
    localStorage.removeItem('cp_admin_auth');
    localStorage.removeItem('cp_admin_user');

    if (wasAdmin) {
      // Purge admin state so student login starts completely clean
      const savedStudent = localStorage.getItem('cp_student_user');
      if (savedStudent) {
        try {
          const parsed = JSON.parse(savedStudent);
          if (parsed && !isInvalidStudentName(parsed.name)) {
            setCurrentUser(parsed);
            localStorage.setItem('cp_user', JSON.stringify(parsed));
          } else {
            setCurrentUser(DEFAULT_USER);
            localStorage.removeItem('cp_user');
          }
        } catch (e) {
          setCurrentUser(DEFAULT_USER);
          localStorage.removeItem('cp_user');
        }
      } else {
        const studentName = localStorage.getItem('cp_student_name');
        if (studentName && !isInvalidStudentName(studentName)) {
          const freshStudent = {
            ...DEFAULT_USER,
            name: studentName,
            role: 'Student'
          };
          setCurrentUser(freshStudent);
          localStorage.setItem('cp_user', JSON.stringify(freshStudent));
        } else {
          setCurrentUser(DEFAULT_USER);
          localStorage.removeItem('cp_user');
        }
      }
    }

    localStorage.setItem('cp_has_account', 'true');
    setHasAccount(true);
    setAuthView('login');
  };

  const toggleUserRole = (newRole) => {
    setCurrentUser(prev => {
      const current = prev || DEFAULT_USER;
      return {
        ...current,
        role: newRole || (current.role === 'Student' ? 'Admin' : 'Student')
      };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        showSplash,
        setShowSplash,
        completeSplash,
        isAuthenticated,
        setIsAuthenticated,
        authView,
        setAuthView,
        currentUser,
        setCurrentUser,
        pendingSignupData,
        generatedOtp,
        login,
        adminLogin,
        signup,
        signupWithGoogle,
        verifyOtp,
        verifyCurrentPassword,
        updateAccountPassword,
        hasAccount,
        setHasAccount,
        logout,
        toggleUserRole
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
