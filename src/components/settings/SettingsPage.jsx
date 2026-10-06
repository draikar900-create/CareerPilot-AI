import React, { useState, useEffect } from 'react';
import { useProfile } from '../../context/ProfileContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import {
  User,
  Shield,
  Bell,
  Lock,
  Palette,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  AlertCircle,
  Building,
  Mail,
  Sun,
  Moon,
  Monitor,
  Sparkles,
  Save,
  KeyRound,
  ShieldCheck,
  FileCheck
} from 'lucide-react';

export default function SettingsPage({ setActiveTab }) {
  const { profile, updateProfile, saveProfile } = useProfile();
  const { currentUser, setCurrentUser, updatePassword } = useAuth();
  const { theme, themeMode, setThemeMode, isDark } = useTheme();
  const { showToast } = useToast();

  const [activeSection, setActiveSection] = useState('profile'); // 'profile' | 'security' | 'notifications' | 'privacy' | 'theme'

  // -------------------------------------------------------------
  // 1. Profile Settings State
  // -------------------------------------------------------------
  const isInvalidName = (n) => !n || typeof n !== 'string' || n.toLowerCase().includes('admin') || n.toLowerCase().includes('demo user') || n.toLowerCase().includes('test user');
  const getSafeStudentName = () => {
    if (profile?.fullName && !isInvalidName(profile.fullName)) return profile.fullName;
    if (currentUser?.name && !isInvalidName(currentUser.name)) return currentUser.name;
    return '';
  };

  const [profileForm, setProfileForm] = useState({
    fullName: getSafeStudentName(),
    email: profile?.email || currentUser?.email || '',
    collegeName: profile?.collegeName || ''
  });

  useEffect(() => {
    setProfileForm({
      fullName: getSafeStudentName(),
      email: profile?.email || currentUser?.email || '',
      collegeName: profile?.collegeName || ''
    });
  }, [profile, currentUser]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!profileForm.fullName.trim()) {
      showToast('Please enter your full name.', 'error');
      return;
    }

    if (isInvalidName(profileForm.fullName)) {
      showToast('Please enter a valid student name.', 'error');
      return;
    }

    if (!profileForm.email.trim() || !emailRegex.test(profileForm.email.trim())) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    // Save changes to ProfileContext and AuthContext
    const trimmedName = profileForm.fullName.trim();
    const trimmedEmail = profileForm.email.trim();
    const trimmedCollege = profileForm.collegeName.trim();

    updateProfile('fullName', trimmedName);
    updateProfile('email', trimmedEmail);
    updateProfile('collegeName', trimmedCollege);

    if (currentUser) {
      setCurrentUser(prev => ({
        ...prev,
        name: trimmedName,
        email: trimmedEmail
      }));
    }

    await saveProfile();
  };


  // -------------------------------------------------------------
  // 2. Account & Security State
  // -------------------------------------------------------------
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Compute Password Strength
  const passwordStrength = (() => {
    const pwd = securityForm.newPassword;
    if (!pwd) return { label: '', score: 0, color: 'bg-slate-200 dark:bg-slate-700', text: '' };
    if (pwd.length < 6) return { label: 'Weak', score: 33, color: 'bg-rose-500', text: 'text-rose-500' };

    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);

    const matchCount = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

    if (pwd.length >= 8 && matchCount >= 3) {
      return { label: 'Strong', score: 100, color: 'bg-emerald-500', text: 'text-emerald-500' };
    }
    if (pwd.length >= 6 && matchCount >= 2) {
      return { label: 'Medium', score: 66, color: 'bg-amber-500', text: 'text-amber-500' };
    }
    return { label: 'Weak', score: 33, color: 'bg-rose-500', text: 'text-rose-500' };
  })();

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    // New password validation
    if (!securityForm.newPassword) {
      showToast('Please enter a new password.', 'error');
      return;
    }

    if (securityForm.newPassword.length < 6) {
      showToast('New password must be at least 6 characters long.', 'error');
      return;
    }

    // Confirm new password validation
    if (!securityForm.confirmNewPassword) {
      showToast('Please confirm your new password.', 'error');
      return;
    }

    if (securityForm.newPassword !== securityForm.confirmNewPassword) {
      showToast('New password and confirm password do not match.', 'error');
      return;
    }

    // Update password via Supabase Auth
    try {
      await updatePassword(securityForm.newPassword);
      setSecurityForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      showToast('Password updated successfully via Supabase Auth.', 'success');
    } catch (err) {
      showToast(err.message || 'Unable to update password.', 'error');
    }
  };



  // -------------------------------------------------------------
  // 3. Notifications State
  // -------------------------------------------------------------
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('cp_notification_preferences');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      careerRecommendations: true,
      roadmapUpdates: true,
      internshipAlerts: true,
      projectRecommendations: true,
      certificateOpportunities: true,
      emailNotifications: true
    };
  });

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveNotifications = () => {
    localStorage.setItem('cp_notification_preferences', JSON.stringify(notifications));
    showToast('Notification preferences saved.', 'success');
  };

  // -------------------------------------------------------------
  // 4. Privacy & Sharing State
  // -------------------------------------------------------------
  const [privacy, setPrivacy] = useState(() => {
    const saved = localStorage.getItem('cp_privacy_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      publicTalentDirectory: true,
      displayReadinessScore: true
    };
  });

  const togglePrivacy = (key) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSavePrivacy = () => {
    localStorage.setItem('cp_privacy_settings', JSON.stringify(privacy));
    showToast('Privacy settings updated.', 'success');
  };

  // -------------------------------------------------------------
  // 5. Theme & Display State
  // -------------------------------------------------------------
  const [selectedThemeMode, setSelectedThemeMode] = useState(themeMode || 'dark');

  const handlePreviewTheme = (mode) => {
    setSelectedThemeMode(mode);
    setThemeMode(mode); // Instant preview
  };

  const handleSaveDisplay = () => {
    setThemeMode(selectedThemeMode);
    localStorage.setItem('cp_theme_mode', selectedThemeMode);
    showToast('Display settings saved.', 'success');
  };

  // Navigation tabs config
  const navTabs = [
    { id: 'profile', label: 'Profile Settings', icon: User, desc: 'Manage your name, email and university' },
    { id: 'security', label: 'Account & Security', icon: Shield, desc: 'Update password & credential protection' },
    { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Job alerts & study recommendations' },
    { id: 'privacy', label: 'Privacy & Sharing', icon: Lock, desc: 'Control visibility & readiness score' },
    { id: 'theme', label: 'Theme & Display', icon: Palette, desc: 'Light, dark, & system color modes' }
  ];

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-brand-500/15 via-indigo-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Platform Settings</span>
            </span>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              User: {profileForm.fullName || 'Student'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Account Settings & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
            Configure your profile credentials, notification alerts, privacy preferences, and application themes.
          </p>
        </div>
      </div>

      {/* Main Settings Content Area: Sidebar Tabs + Card Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Tab Navigation */}
        <div className="md:col-span-4 space-y-2">
          <div className="glass-card rounded-3xl p-3 border border-slate-200/80 dark:border-white/10 space-y-1 shadow-sm">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSection(tab.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all select-none ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-glow'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="font-bold text-xs block leading-tight truncate">
                      {tab.label}
                    </span>
                    <span
                      className={`text-[11px] block truncate mt-0.5 ${
                        isActive ? 'text-white/80' : 'text-slate-400'
                      }`}
                    >
                      {tab.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Section Content Cards */}
        <div className="md:col-span-8">
          {/* ========================================================= */}
          {/* 1. PROFILE SETTINGS */}
          {/* ========================================================= */}
          {activeSection === 'profile' && (
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-6 shadow-sm animate-fade-in">
              <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-brand-500" />
                  <span>Profile Settings</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Manage your personal details and academic affiliation. Data is synchronized with your Student Profile.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      placeholder="Enter Full Name"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                    />
                  </div>
                </div>

                {/* Primary Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Primary Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="Enter Email Address"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                    />
                  </div>
                </div>

                {/* College / University */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    College / University
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={profileForm.collegeName}
                      onChange={(e) => setProfileForm({ ...profileForm, collegeName: e.target.value })}
                      placeholder="Enter College Name"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Pre-filled from Student Profile
                  </span>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:opacity-95 shadow-glow transition-all flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. ACCOUNT & SECURITY */}
          {/* ========================================================= */}
          {activeSection === 'security' && (
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-6 shadow-sm animate-fade-in">
              <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-500" />
                  <span>Account & Security</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Manage your account credentials and password protection.
                </p>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                {/* Field 1: Current Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={securityForm.currentPassword}
                      onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      title={showCurrentPassword ? 'Hide password' : 'Show password'}
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Field 2: New Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={securityForm.newPassword}
                      onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                      placeholder="Enter new strong password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      title={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {securityForm.newPassword && (
                    <div className="mt-2.5 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-400">Password Strength:</span>
                        <span className={passwordStrength.text}>{passwordStrength.label}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${passwordStrength.color} transition-all duration-300`}
                          style={{ width: `${passwordStrength.score}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Field 3: Confirm New Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={securityForm.confirmNewPassword}
                      onChange={(e) => setSecurityForm({ ...securityForm, confirmNewPassword: e.target.value })}
                      placeholder="Confirm new strong password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Real-time Match Indicator */}
                  {securityForm.confirmNewPassword && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                      {securityForm.newPassword === securityForm.confirmNewPassword ? (
                        <span className="text-emerald-500 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Passwords match</span>
                        </span>
                      ) : (
                        <span className="text-rose-500 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Passwords do not match</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Use at least 8 characters with numbers & symbols
                  </span>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:opacity-95 shadow-glow transition-all flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. NOTIFICATIONS */}
          {/* ========================================================= */}
          {activeSection === 'notifications' && (
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-6 shadow-sm animate-fade-in">
              <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-500" />
                  <span>Notification Preferences</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Choose which alerts and recommendation notifications you want to receive.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    key: 'careerRecommendations',
                    title: 'Career Recommendations',
                    desc: 'Receive career suggestions based on your evolving skill profile'
                  },
                  {
                    key: 'roadmapUpdates',
                    title: 'Roadmap Updates',
                    desc: 'Notify when roadmap milestones and semester phases are completed'
                  },
                  {
                    key: 'internshipAlerts',
                    title: 'Internship Alerts',
                    desc: 'Notify about new internships and student hiring opportunities'
                  },
                  {
                    key: 'projectRecommendations',
                    title: 'Project Recommendations',
                    desc: 'Notify about new project suggestions aligned with your dream role'
                  },
                  {
                    key: 'certificateOpportunities',
                    title: 'Certificate Opportunities',
                    desc: 'Notify about recommended certifications and skill validation tests'
                  },
                  {
                    key: 'emailNotifications',
                    title: 'Email Notifications',
                    desc: 'Receive updates through email digest and weekly career telemetry'
                  }
                ].map((item) => (
                  <div
                    key={item.key}
                    onClick={() => toggleNotification(item.key)}
                    className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-4 cursor-pointer hover:border-brand-500/40 transition-all select-none"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.desc}
                      </p>
                    </div>

                    {/* Animated Toggle Switch */}
                    <div
                      className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 ${
                        notifications[item.key] ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                          notifications[item.key] ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveNotifications}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-500 shadow-glow transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Preferences</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. PRIVACY & SHARING */}
          {/* ========================================================= */}
          {activeSection === 'privacy' && (
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-6 shadow-sm animate-fade-in">
              <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-emerald-500" />
                  <span>Privacy & Sharing</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Manage your data sharing and profile visibility in hiring directories.
                </p>
              </div>

              <div className="space-y-4">
                {/* Public Talent Directory Listing */}
                <div
                  onClick={() => togglePrivacy('publicTalentDirectory')}
                  className="p-5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-4 cursor-pointer hover:border-brand-500/40 transition-all select-none"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        Public Talent Directory Listing
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        privacy.publicTalentDirectory
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {privacy.publicTalentDirectory ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Allow profile visibility in CareerPilot talent directory for campus recruiters and verified employers.
                    </p>
                  </div>

                  <div
                    className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 ${
                      privacy.publicTalentDirectory ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                        privacy.publicTalentDirectory ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>

                {/* Display Career Readiness Score on Profile */}
                <div
                  onClick={() => togglePrivacy('displayReadinessScore')}
                  className="p-5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-4 cursor-pointer hover:border-brand-500/40 transition-all select-none"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        Display Career Readiness Score on Profile
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        privacy.displayReadinessScore
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {privacy.displayReadinessScore ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Allow readiness score to be shown on profile and included in downloadable resumes.
                    </p>
                  </div>

                  <div
                    className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 ${
                      privacy.displayReadinessScore ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                        privacy.displayReadinessScore ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={handleSavePrivacy}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-500 shadow-glow transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Privacy Settings</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 5. THEME & DISPLAY */}
          {/* ========================================================= */}
          {activeSection === 'theme' && (
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-6 shadow-sm animate-fade-in">
              <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-500" />
                  <span>Theme & Display</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Customize the appearance of CareerPilot. Previews are applied in real time.
                </p>
              </div>

              {/* Display Current Theme */}
              <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-500">
                    {isDark ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold block">Current Active Theme:</span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {isDark ? 'Dark Mode' : 'Light Mode'}
                    </h4>
                  </div>
                </div>

                <span className="text-xs px-3 py-1 rounded-full font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                  {selectedThemeMode === 'system' ? 'System Default (Active)' : `${selectedThemeMode === 'dark' ? 'Dark' : 'Light'} Mode`}
                </span>
              </div>

              {/* Theme Selector: 3 Options */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Select Application Theme (Instant Preview)
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Light Mode */}
                  <div
                    onClick={() => handlePreviewTheme('light')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col items-center text-center space-y-3 ${
                      selectedThemeMode === 'light'
                        ? 'border-brand-500 ring-2 ring-brand-500/30 bg-brand-50/20 dark:bg-brand-950/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <Sun className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white block">Light Mode</span>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">Crisp daylight palette</span>
                    </div>
                    {selectedThemeMode === 'light' && (
                      <CheckCircle2 className="w-4 h-4 text-brand-500" />
                    )}
                  </div>

                  {/* Dark Mode */}
                  <div
                    onClick={() => handlePreviewTheme('dark')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col items-center text-center space-y-3 ${
                      selectedThemeMode === 'dark'
                        ? 'border-brand-500 ring-2 ring-brand-500/30 bg-brand-50/20 dark:bg-brand-950/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                      <Moon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white block">Dark Mode</span>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">High-tech cyber aesthetic</span>
                    </div>
                    {selectedThemeMode === 'dark' && (
                      <CheckCircle2 className="w-4 h-4 text-brand-500" />
                    )}
                  </div>

                  {/* System Default */}
                  <div
                    onClick={() => handlePreviewTheme('system')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col items-center text-center space-y-3 ${
                      selectedThemeMode === 'system'
                        ? 'border-brand-500 ring-2 ring-brand-500/30 bg-brand-50/20 dark:bg-brand-950/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                      <Monitor className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white block">System Default</span>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">Sync with OS appearance</span>
                    </div>
                    {selectedThemeMode === 'system' && (
                      <CheckCircle2 className="w-4 h-4 text-brand-500" />
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveDisplay}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-500 shadow-glow transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Display Settings</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
