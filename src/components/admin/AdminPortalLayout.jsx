import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard,
  Users,
  Database,
  BarChart3,
  Building2,
  ShieldAlert,
  LogOut,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  Briefcase,
  Mail
} from 'lucide-react';

import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import ContentManagement from './ContentManagement';
import Analytics from './Analytics';
import AdminCompanies from '../placementAdmin/AdminCompanies';
import AdminEligibilityRules from '../placementAdmin/AdminEligibilityRules';
import ContactManagement from './ContactManagement';

const ADMIN_PORTAL_ITEMS = [
  { id: 'overview', label: 'Platform Overview', icon: LayoutDashboard },
  { id: 'users', label: 'User Directory (Students & Faculty)', icon: Users },
  { id: 'content', label: 'Content Management', icon: Database },
  { id: 'analytics', label: 'Institutional Analytics', icon: BarChart3 },
  { id: 'companies', label: 'Corporate Partners', icon: Building2 },
  { id: 'eligibility', label: 'Eligibility & Rules', icon: ShieldCheck },
  { id: 'contacts', label: 'Contact Management', icon: Mail }
];

export default function AdminPortalLayout() {
  const { currentUser, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#admin-', '');
      if (ADMIN_PORTAL_ITEMS.some(item => item.id === hash)) {
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Executive Admin Header */}
      <header className="sticky top-0 z-30 h-16 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-[#0B1020]/90 backdrop-blur-md transition-colors duration-200">
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
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-brand-500 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
                    CareerPilot
                  </span>
                  <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    Admin Console
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Institutional Executive Portal
                </p>
              </div>
            </div>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Admin Badge & Info */}
            <div className="hidden md:flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {currentUser?.name || 'Platform Admin'}
                </p>
                <p className="text-[11px] text-purple-500 dark:text-purple-400 font-semibold font-mono">
                  {currentUser?.email}
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                AD
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Workspace with Sidebar */}
      <div className="flex-1 flex w-full">
        {/* Mobile Backdrop */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden animate-fade-in"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-0 lg:top-16 z-40 h-screen lg:h-[calc(100vh-4rem)] bg-white/95 dark:bg-[#0B1020]/95 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between transition-all duration-300 ${
            isSidebarCollapsed ? 'w-20' : 'w-64'
          } ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        >
          {/* Mobile Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 lg:hidden">
            <span className="font-bold text-slate-900 dark:text-white">Admin Console</span>
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
                Institutional Management
              </p>
            ) : (
              <div className="w-6 h-0.5 bg-slate-200 dark:bg-slate-800 mx-auto my-2" />
            )}

            {ADMIN_PORTAL_ITEMS.map((item) => {
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
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-transform ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-500'
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

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
          {activeTab === 'overview' && (
            <AdminDashboard setActiveTab={(tab) => {
              if (tab === 'user-management') setActiveTab('users');
              else if (tab === 'content-management') setActiveTab('content');
              else if (tab === 'admin-analytics') setActiveTab('analytics');
              else setActiveTab(tab);
            }} />
          )}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'content' && <ContentManagement />}
          {activeTab === 'analytics' && <Analytics />}
          {activeTab === 'companies' && <AdminCompanies />}
          {activeTab === 'eligibility' && <AdminEligibilityRules />}
          {activeTab === 'contacts' && <ContactManagement />}
        </main>
      </div>
    </div>
  );
}
