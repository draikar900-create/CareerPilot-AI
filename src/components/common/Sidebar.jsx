import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCareer } from '../../context/CareerContext';
import {
  LayoutDashboard,
  Milestone,
  LineChart,
  MessageSquareCode,
  Briefcase,
  FolderGit2,
  CheckCircle,
  BookOpen,
  Bell,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flame,
  Building
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isOpenMobile,
  setIsOpenMobile
}) {
  const { currentUser } = useAuth();
  const { dailyStreak, readinessScore } = useCareer();

  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'roadmap', label: 'Career Roadmap', icon: Milestone },
    { id: 'skill-insights', label: 'Skill Analysis', icon: LineChart },
    { id: 'chat', label: 'AI Career Chat', icon: MessageSquareCode },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'internships', label: 'Internships', icon: Briefcase },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'progress-tracking', label: 'Applications', icon: CheckCircle },
    { id: 'resources', label: 'Learning Resources', icon: BookOpen },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  const profileNavItems = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden animate-fade-in"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-16 z-40 h-screen lg:h-[calc(100vh-4rem)] bg-white dark:bg-[#080C12] border-r border-zinc-200 dark:border-zinc-800/80 flex flex-col justify-between transition-all duration-200 shrink-0 ${
          isCollapsed ? 'w-16' : 'w-60 lg:w-64'
        } ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 lg:hidden">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
            <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-white uppercase">
              CAREERPILOT
            </span>
          </div>
          <button
            onClick={() => setIsOpenMobile(false)}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Body */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {/* Brand header on desktop if collapsed or full */}
          <div className="hidden lg:flex items-center gap-2.5 px-3 mb-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs shrink-0">
              CP
            </div>
            {!isCollapsed && (
              <span className="font-extrabold text-xs tracking-wider uppercase text-zinc-900 dark:text-white">
                CAREERPILOT
              </span>
            )}
          </div>

          {/* Main Navigation Section */}
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || (item.id === 'skill-insights' && (activeTab === 'skill-analysis' || activeTab === 'skill-gap'));
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpenMobile(false);
                  }}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-white font-semibold border border-zinc-200/80 dark:border-zinc-700/60 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="border-t border-zinc-200 dark:border-zinc-800/80 my-3" />

          {/* Profile & Settings Navigation Section */}
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                Profile
              </p>
            )}
            {profileNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpenMobile(false);
                  }}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-white font-semibold border border-zinc-200/80 dark:border-zinc-700/60 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer Mini Streak & Collapse Toggle */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800/80 space-y-2">
          {!isCollapsed && (
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800/60 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
                <Flame className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
                {dailyStreak} Day Streak
              </span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                {readinessScore}% Ready
              </span>
            </div>
          )}

          <div className="hidden lg:flex items-center justify-end">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors w-full flex items-center justify-center"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

