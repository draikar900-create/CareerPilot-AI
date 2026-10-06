import React, { useState, useEffect } from 'react';
import FacultySidebar from './FacultySidebar';
import FacultyDashboard from './FacultyDashboard';
import AssignedStudentsList from './AssignedStudentsList';
import FacultyStudentProgress from './FacultyStudentProgress';
import FacultyResourceManagement from './FacultyResourceManagement';
import FacultyTrainingHub from './FacultyTrainingHub';
import FacultyProfileScope from './FacultyProfileScope';
import FacultyOnboardingFlow from './FacultyOnboardingFlow';
import ErrorBoundary from '../common/ErrorBoundary';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { apiService } from '../../services/api';
import { UserCheck, LogOut, Sun, Moon, AlertCircle } from 'lucide-react';

export default function FacultyPortalLayout() {
  const [activeTab, setActiveTab] = useState('faculty-dashboard');
  const [isOnboardingNeeded, setIsOnboardingNeeded] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  useEffect(() => {
    let mounted = true;
    const checkFacultyStatus = async () => {
      try {
        const res = await apiService.getFacultyProfile();
        if (mounted && res?.success && res.faculty) {
          const f = res.faculty;
          // Check if essential onboarding fields are set
          const isComplete = Boolean(
            f.onboardingCompleted &&
            f.fullName &&
            f.employeeId &&
            f.collegeName &&
            f.department &&
            f.designation
          );
          if (!isComplete) {
            setIsOnboardingNeeded(true);
          }
        } else if (mounted) {
          setIsOnboardingNeeded(true);
        }
      } catch (err) {
        console.warn('Faculty profile onboarding check notice:', err.message);
        if (mounted) setIsOnboardingNeeded(true);
      } finally {
        if (mounted) setCheckingProfile(false);
      }
    };

    checkFacultyStatus();
    return () => { mounted = false; };
  }, []);

  if (checkingProfile) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#080C16] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-400 animate-pulse">
          Authenticating Faculty Portal & Resolving Instructional Scope...
        </p>
      </div>
    );
  }

  // IF faculty profile is incomplete -> Faculty Onboarding
  if (isOnboardingNeeded) {
    return (
      <ErrorBoundary moduleTitle="Faculty Onboarding">
        <FacultyOnboardingFlow
          onComplete={() => {
            setIsOnboardingNeeded(false);
            setActiveTab('faculty-dashboard');
          }}
        />
      </ErrorBoundary>
    );
  }

  // IF faculty profile is complete -> Faculty Dashboard & Portal
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080C16] text-slate-900 dark:text-slate-100 flex transition-colors duration-200 selection:bg-blue-500 selection:text-white">
      {/* Dedicated Faculty Sidebar */}
      <FacultySidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Faculty Workspace */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-[#0C111E]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20 transition-colors duration-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
              FACULTY PORTAL
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {currentUser?.user_metadata?.department || 'Computer Science & Engineering'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
              aria-label="Toggle Theme"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-600" />
              )}
            </button>

            <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800">
              <UserCheck className="w-4 h-4 text-blue-500" />
              <span className="font-bold text-xs text-slate-900 dark:text-white">
                {currentUser?.user_metadata?.full_name || currentUser?.name || 'Faculty Member'}
              </span>
            </div>

            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900/50 transition-all cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          <ErrorBoundary moduleTitle="Faculty Portal">
            {activeTab === 'faculty-dashboard' && (
              <FacultyDashboard onNavigateTab={(tab) => setActiveTab(tab)} />
            )}

            {activeTab === 'faculty-students' && (
              <AssignedStudentsList />
            )}

            {activeTab === 'faculty-progress' && (
              <FacultyStudentProgress />
            )}

            {activeTab === 'faculty-resources' && (
              <FacultyResourceManagement />
            )}

            {activeTab === 'faculty-training' && (
              <FacultyTrainingHub />
            )}

            {activeTab === 'faculty-settings' && (
              <FacultyProfileScope
                isOnboardingMode={false}
                onOnboardingComplete={() => {
                  setActiveTab('faculty-dashboard');
                }}
              />
            )}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
