import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProfileProvider, useProfile } from './context/ProfileContext';
import { CareerProvider } from './context/CareerContext';
import { AdminProvider } from './context/AdminContext';

// Visual & Layout components
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import ErrorBoundary from './components/common/ErrorBoundary';

// Splash, Auth & Onboarding components
import SplashScreen from './components/splash/SplashScreen';
import LandingPage from './components/landing/LandingPage';
import LoginPage from './components/auth/LoginPage';
import AdminLoginPage from './components/auth/AdminLoginPage';
import SignupPage from './components/auth/SignupPage';
import OtpVerification from './components/auth/OtpVerification';
import ForgotPassword from './components/auth/ForgotPassword';
import FirstLoginIntro from './components/onboarding/FirstLoginIntro';
import StudentOnboardingFlow from './components/onboarding/StudentOnboardingFlow';
import PlacementAdminLayout from './components/placementAdmin/PlacementAdminLayout';
import FacultyPortalLayout from './components/faculty/FacultyPortalLayout';
import AdminPortalLayout from './components/admin/AdminPortalLayout';

import { PlacementAdminProvider } from './context/PlacementAdminContext';
import { BannerProvider } from './context/BannerContext';
import { EventsProvider } from './context/EventsContext';

// Modules
import StudentProfile from './components/profile/StudentProfile';
import DashboardHome from './components/dashboard/DashboardHome';
import CareerGoals from './components/goals/CareerGoals';
import CareerRoadmap from './components/roadmap/CareerRoadmap';
import AIChat from './components/chat/AIChat';
import SkillInsights from './components/skills/SkillInsights';
import ReadinessTest from './components/skills/ReadinessTest';
import Projects from './components/skills/Projects';
import Internships from './components/skills/Internships';
import Jobs from './components/skills/Jobs';
import Certificates from './components/skills/Certificates';
import Resources from './components/skills/Resources';
import Events from './components/skills/Events';
import ProgressTracking from './components/skills/ProgressTracking';
import NotificationsSection from './components/notifications/NotificationsSection';
import Companies from './components/companies/Companies';

// Admin components
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import ContentManagement from './components/admin/ContentManagement';
import Analytics from './components/admin/Analytics';
import SettingsPage from './components/settings/SettingsPage';

const VALID_STUDENT_TABS = [
  'dashboard',
  'career-goals',
  'roadmap',
  'chat',
  'skill-insights',
  'skill-analysis',
  'skill-gap',
  'readiness-test',
  'projects',
  'internships',
  'companies',
  'certificates',
  'resources',
  'events',
  'progress-tracking',
  'notifications',
  'jobs',
  'profile',
  'settings'
];

function AppContent() {
  const {
    showSplash,
    completeSplash,
    isAuthenticated,
    authView,
    setAuthView,
    currentUser
  } = useAuth();
  const { profile } = useProfile();

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '');
      if (VALID_STUDENT_TABS.includes(hash)) return hash;
    }
    return 'dashboard';
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync active tab with URL hash and enforce security boundaries
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        // Enforce route guard: reject admin or faculty areas for student accounts
        if (hash.startsWith('admin') || hash.startsWith('faculty') || !VALID_STUDENT_TABS.includes(hash)) {
          window.location.hash = 'dashboard';
          setActiveTab('dashboard');
        } else {
          setActiveTab(hash);
        }
      }
    };

    // Direct pathname check for /admin or /faculty URLs
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path.startsWith('/admin') || path.startsWith('/faculty')) {
        // If not authenticated, switch to appropriate login view
        if (!isAuthenticated) {
          if (path.startsWith('/admin')) setAuthView('admin-login');
        }
      }
    }

    if (window.location.hash) {
      handleHashChange();
    }
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAuthenticated, currentUser]);

  const handleTabChange = (tabId) => {
    // If student tries navigating to admin or faculty tabs, guard and redirect to dashboard
    const target = VALID_STUDENT_TABS.includes(tabId) ? tabId : 'dashboard';
    setActiveTab(target);
    window.location.hash = target;
  };

  // 1. Splash Screen Mode
  if (showSplash) {
    return (
      <SplashScreen
        onComplete={() => {
          completeSplash();
          if (!isAuthenticated) {
            setAuthView('landing');
          }
        }}
      />
    );
  }

  // 2. Public Landing & Authentication Mode (when user has not logged in or has signed out)
  if (!isAuthenticated) {
    if (authView === 'landing') {
      return (
        <ErrorBoundary moduleTitle="Public Landing Page">
          <LandingPage />
        </ErrorBoundary>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-brand-500 selection:text-white relative overflow-hidden">
        {/* Background glow accents */}
        <div className="absolute w-[500px] h-[500px] rounded-full bg-brand-500/10 filter blur-[140px] pointer-events-none -top-24 -left-24" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-purple-500/10 filter blur-[120px] pointer-events-none -bottom-24 -right-24" />

        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10 my-auto">
          <ErrorBoundary moduleTitle="Authentication">
            {authView === 'signup' ? (
              <SignupPage
                onSignupSuccess={(targetTab) => {
                  handleTabChange(targetTab || 'dashboard');
                }}
              />
            ) : authView === 'admin-login' ? (
              <AdminLoginPage />
            ) : authView === 'otp' ? (
              <OtpVerification
                onVerificationSuccess={(targetTab) => {
                  handleTabChange(targetTab || 'dashboard');
                }}
              />
            ) : authView === 'forgot-password' ? (
              <ForgotPassword />
            ) : (
              <LoginPage
                onLoginSuccess={(targetTab) => {
                  handleTabChange(targetTab || 'dashboard');
                }}
              />
            )}
          </ErrorBoundary>
        </main>

        <footer className="py-4 text-center text-xs text-slate-400 z-10 border-t border-slate-200/40 dark:border-slate-800/40">
          CareerPilot © 2026. Empowering Next-Gen Engineering Careers.
        </footer>
      </div>
    );
  }

  // Helper to normalize and resolve canonical user roles
  const resolveRole = (r) => {
    if (!r) return 'Student';
    const str = String(r).trim().toLowerCase();
    if (str === 'admin' || str === 'superadmin') return 'Admin';
    if (str === 'placementofficer' || str === 'placement_officer' || str === 'tpo') return 'PlacementOfficer';
    if (str === 'faculty') return 'Faculty';
    return 'Student';
  };

  const userRole = resolveRole(
    currentUser?.role ||
    currentUser?.user_metadata?.role ||
    currentUser?.app_metadata?.role
  );

  // 3. Dedicated Admin Portal (accessible strictly via Admin / SuperAdmin role)
  if (userRole === 'Admin') {
    return (
      <ErrorBoundary moduleTitle="Executive Administration Portal">
        <AdminPortalLayout />
      </ErrorBoundary>
    );
  }

  // 3b. Dedicated Placement Team Admin / TPO Portal (accessible strictly via PlacementOfficer / TPO role)
  if (userRole === 'PlacementOfficer') {
    return (
      <ErrorBoundary moduleTitle="Placement Team Admin Portal">
        <PlacementAdminLayout />
      </ErrorBoundary>
    );
  }

  // 3c. Dedicated Faculty Portal (accessible strictly via Faculty role)
  if (userRole === 'Faculty') {
    return (
      <ErrorBoundary moduleTitle="Faculty Portal">
        <FacultyPortalLayout />
      </ErrorBoundary>
    );
  }

  // 4. First-Time Website Introduction Tour (STRICTLY FOR STUDENT ROLE ONLY)
  if (userRole === 'Student' && !profile.introSeen) {
    return (
      <ErrorBoundary moduleTitle="First Login Introduction Tour">
        <FirstLoginIntro onComplete={() => handleTabChange('dashboard')} />
      </ErrorBoundary>
    );
  }

  // 5. Student Onboarding Wizard (STRICTLY FOR STUDENT ROLE ONLY)
  const isOnboardingDone = Boolean(
    profile.onboardingCompleted ||
    (profile.currentOnboardingStep && Number(profile.currentOnboardingStep) > 7)
  );

  if (userRole === 'Student' && !isOnboardingDone) {
    return (
      <ErrorBoundary moduleTitle="Student Onboarding Setup">
        <StudentOnboardingFlow onComplete={() => handleTabChange('dashboard')} />
      </ErrorBoundary>
    );
  }

  // 6. Authenticated Student Platform Application Workspace
  return (
    <div className="min-h-screen bg-[#F4F4F5] dark:bg-[#080C12] text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors duration-200">
      {/* Global Header */}
      <Header
        setActiveTab={handleTabChange}
        onToggleSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      {/* Main Body with Sidebar + Active Screen Content */}
      <div className="flex-1 flex w-full">
        {/* Collapsible Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          isOpenMobile={isMobileSidebarOpen}
          setIsOpenMobile={setIsMobileSidebarOpen}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
          <ErrorBoundary moduleTitle="Active Workspace">
            {activeTab === 'dashboard' && <DashboardHome setActiveTab={handleTabChange} />}
            {activeTab === 'career-goals' && <CareerGoals setActiveTab={handleTabChange} />}
            {activeTab === 'roadmap' && <CareerRoadmap setActiveTab={handleTabChange} />}
            {activeTab === 'chat' && <AIChat />}
            {(activeTab === 'skill-insights' || activeTab === 'skill-analysis' || activeTab === 'skill-gap') && (
              <SkillInsights setActiveTab={handleTabChange} />
            )}
            {activeTab === 'readiness-test' && <ReadinessTest />}
            {activeTab === 'projects' && <Projects />}
            {activeTab === 'internships' && <Internships />}
            {activeTab === 'companies' && <Companies />}
            {activeTab === 'certificates' && <Certificates />}
            {activeTab === 'resources' && <Resources />}
            {activeTab === 'events' && <Events setActiveTab={handleTabChange} />}
            {activeTab === 'progress-tracking' && <ProgressTracking />}
            {activeTab === 'notifications' && <NotificationsSection setActiveTab={handleTabChange} />}
            {activeTab === 'jobs' && <Jobs />}
            {activeTab === 'profile' && <StudentProfile setActiveTab={handleTabChange} />}
            {activeTab === 'settings' && <SettingsPage setActiveTab={handleTabChange} />}

            {/* Fallback for unlisted hash */}
            {!VALID_STUDENT_TABS.includes(activeTab) && (
              <DashboardHome setActiveTab={handleTabChange} />
            )}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary moduleTitle="CareerPilot Core Platform">
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <ProfileProvider>
              <CareerProvider>
                <AdminProvider>
                  <PlacementAdminProvider>
                    <BannerProvider>
                      <EventsProvider>
                        <AppContent />
                      </EventsProvider>
                    </BannerProvider>
                  </PlacementAdminProvider>
                </AdminProvider>
              </CareerProvider>
            </ProfileProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
