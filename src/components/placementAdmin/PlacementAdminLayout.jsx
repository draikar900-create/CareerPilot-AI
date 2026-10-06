import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  Cpu,
  BookOpen,
  ShieldCheck,
  Bell,
  Sun,
  Moon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  Menu,
  X,
  Sliders,
  Calendar,
  Folder,
  Award
} from 'lucide-react';

import AdminOverview from './AdminOverview';
import AdminStudents from './AdminStudents';
import AdminCompanies from './AdminCompanies';
import AdminJobs from './AdminJobs';
import AdminInternships from './AdminInternships';
import AdminProjects from './AdminProjects';
import AdminCertificates from './AdminCertificates';
import AdminSkills from './AdminSkills';
import AdminResources from './AdminResources';
import AdminEligibilityRules from './AdminEligibilityRules';
import AdminNotifications from './AdminNotifications';
import AdminBanners from './AdminBanners';
import AdminEvents from './AdminEvents';
import ContactManagement from '../admin/ContactManagement';
import { Mail } from 'lucide-react';

const ADMIN_MENU_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'events', label: 'Event Management', icon: Calendar },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'companies', label: 'Companies', icon: Building2 },
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
  { id: 'internships', label: 'Internships', icon: Briefcase },
  { id: 'projects', label: 'Projects', icon: Folder },
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'skills', label: 'Skills', icon: Cpu },
  { id: 'resources', label: 'Learning Resources', icon: BookOpen },
  { id: 'eligibility-rules', label: 'Eligibility Rules', icon: ShieldCheck },
  { id: 'contacts', label: 'Contact Management', icon: Mail },
  { id: 'banners', label: 'Banner Management', icon: Sliders },
  { id: 'notifications', label: 'Notifications', icon: Bell }
];

export default function PlacementAdminLayout() {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#admin-', '');
      if (ADMIN_MENU_ITEMS.some((item) => item.id === hash)) {
        return hash;
      }
    }
    return 'overview';
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    window.location.hash = `admin-${activeTab}`;
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080C16] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Placement Admin Header */}
      <header className="sticky top-0 z-30 h-16 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-[#0C111E]/90 backdrop-blur-md transition-colors duration-200">
        <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Brand & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
              aria-label="Toggle menu"
            >
              {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div
              onClick={() => setActiveTab('overview')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-brand-500 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                    CareerPilot
                  </span>
                  <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    TPO / Placement Portal
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Controls: Theme Toggle & Admin Sign Out */}
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

            {/* Admin Badge & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {currentUser?.name || 'Placement Officer / TPO'}
                </span>
                <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-mono">
                  {currentUser?.email}
                </span>
              </div>

              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900/50 transition-colors"
                title="Sign Out & return to Student Login"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container with dedicated Admin Sidebar */}
      <div className="flex-1 flex w-full">
        {/* Mobile Backdrop */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden animate-fade-in"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Dedicated Admin Console Sidebar */}
        <aside
          className={`fixed lg:sticky top-0 lg:top-16 z-40 h-screen lg:h-[calc(100vh-4rem)] bg-white/95 dark:bg-[#0C111E]/95 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between transition-all duration-300 ${
            isSidebarCollapsed ? 'w-20' : 'w-64'
          } ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        >
          {/* Mobile Top Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 lg:hidden">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
              <span className="font-bold text-slate-900 dark:text-white">Admin Console</span>
            </div>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Nav List */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {!isSidebarCollapsed ? (
              <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Placement Console
              </p>
            ) : (
              <div className="w-6 h-0.5 bg-slate-200 dark:bg-slate-800 mx-auto my-2" />
            )}

            {ADMIN_MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-transform ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'
                    }`}
                  />
                  {!isSidebarCollapsed && (
                    <span className="truncate font-semibold">{item.label}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Desktop Collapse Toggle */}
          <div className="hidden lg:flex items-center justify-end p-2 border-t border-slate-200/80 dark:border-slate-800/80">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full flex items-center justify-center"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
          {activeTab === 'overview' && <AdminOverview setActiveTab={setActiveTab} />}
          {activeTab === 'events' && <AdminEvents />}
          {activeTab === 'students' && <AdminStudents />}
          {activeTab === 'companies' && <AdminCompanies />}
          { activeTab === 'jobs' && <AdminJobs /> }
          { activeTab === 'internships' && <AdminInternships /> }
          { activeTab === 'projects' && <AdminProjects /> }
          { activeTab === 'certificates' && <AdminCertificates /> }
          { activeTab === 'skills' && <AdminSkills /> }
          {activeTab === 'resources' && <AdminResources />}
          {activeTab === 'eligibility-rules' && <AdminEligibilityRules />}
          {activeTab === 'contacts' && <ContactManagement />}
          {activeTab === 'banners' && <AdminBanners />}
          {activeTab === 'notifications' && <AdminNotifications />}
        </main>
      </div>
    </div>
  );
}
