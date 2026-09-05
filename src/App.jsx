import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { CareerProvider } from './context/CareerContext';
import { AdminProvider } from './context/AdminContext';

// Visual & Layout components
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import ErrorBoundary from './components/common/ErrorBoundary';

// Splash & Auth components
import SplashScreen from './components/splash/SplashScreen';
import LoginPage from './components/auth/LoginPage';
import AdminLoginPage from './components/auth/AdminLoginPage';
import SignupPage from './components/auth/SignupPage';
import OtpVerification from './components/auth/OtpVerification';
import ForgotPassword from './components/auth/ForgotPassword';
import PlacementAdminLayout from './components/placementAdmin/PlacementAdminLayout';
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
import Certificates from './components/skills/Certificates';
import Resources from './components/skills/Resources';
import Events from './components/skills/Events';
import ProgressTracking from './components/skills/ProgressTracking';
import NotificationsSection from './components/notifications/NotificationsSection';

// Admin components
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import ContentManagement from './components/admin/ContentManagement';
import Analytics from './components/admin/Analytics';
import SettingsPage from './components/settings/SettingsPage';

const VALID_TABS = [
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
  'certificates',
  'resources',
  'events',
  'progress-tracking',
  'notifications',
  'jobs',
  'profile',
  'settings',
  'admin-dashboard',
  'user-management',
  'content-management',
  'admin-analytics'
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

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '');
      if (VALID_TABS.includes(hash)) return hash;
    }
    return 'dashboard';
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync active tab with URL hash for easy bookmarking and deep-linking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && VALID_TABS.includes(hash)) {
        setActiveTab(hash);
      }
    };
    if (window.location.hash) {
      handleHashChange();
    }
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleTabChange = (tabId) => {
    const target = VALID_TABS.includes(tabId) ? tabId : 'dashboard';
    setActiveTab(target);
    window.location.hash = target;
  };

  // 1. Splash Screen Mode
  if (showSplash) {
    return (
      <SplashScreen
        onComplete={() => {
          completeSplash();
          setAuthView('login');
        }}
      />
    );
  }

  // 2. Authentication Mode (when user signs out or has not logged in)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-brand-500 selection:text-white relative overflow-hidden">
        {/* Background glow accents */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10 my-auto">
          <ErrorBoundary moduleTitle="Authentication">
            {authView === 'login' && (
              <LoginPage
                onLoginSuccess={(targetTab) => {
                  handleTabChange(targetTab || 'dashboard');
                }}
              />
            )}
            {authView === 'admin-login' && (
              <AdminLoginPage />
            )}
            {authView === 'signup' && (
              <SignupPage
                onSignupSuccess={() => {
                  handleTabChange('profile');
                }}
              />
            )}
            {authView === 'otp' && (
              <OtpVerification
                onVerificationSuccess={() => {
                  handleTabChange('profile');
                }}
              />
            )}
            {authView === 'forgot-password' && <ForgotPassword />}
            {authView !== 'login' && authView !== 'admin-login' && authView !== 'signup' && authView !== 'otp' && authView !== 'forgot-password' && (
              <LoginPage
                onLoginSuccess={(targetTab) => {
                  handleTabChange(targetTab || 'dashboard');
                }}
              />
            )}
          </ErrorBoundary>
        </main>

        <footer className="py-4 text-center text-xs text-slate-400 z-10 border-t border-slate-200/40 dark:border-slate-800/40">
          CareerPilot AI © 2026. Empowering Next-Gen Engineering Careers.
        </footer>
      </div>
    );
  }

  // 3. Dedicated Placement Team Admin Portal (accessible strictly via Placement Team Admin Sign In)
  if (currentUser?.role === 'Admin') {
    return (
      <ErrorBoundary moduleTitle="Placement Team Admin Portal">
        <PlacementAdminLayout />
      </ErrorBoundary>
    );
  }

  // 4. Authenticated Student Platform Application
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
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
            {activeTab === 'certificates' && <Certificates />}
            {activeTab === 'resources' && <Resources />}
            {activeTab === 'events' && <Events setActiveTab={handleTabChange} />}
            {activeTab === 'progress-tracking' && <ProgressTracking />}
            {activeTab === 'notifications' && <NotificationsSection setActiveTab={handleTabChange} />}
            {activeTab === 'jobs' && <Internships />}
            {activeTab === 'profile' && <StudentProfile setActiveTab={handleTabChange} />}
            {activeTab === 'settings' && <SettingsPage setActiveTab={handleTabChange} />}

            {/* Admin screens */}
            {activeTab === 'admin-dashboard' && <AdminDashboard setActiveTab={handleTabChange} />}
            {activeTab === 'user-management' && <UserManagement />}
            {activeTab === 'content-management' && <ContentManagement />}
            {activeTab === 'admin-analytics' && <Analytics />}

            {/* Fallback for unlisted hash */}
            {!VALID_TABS.includes(activeTab) && (
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
