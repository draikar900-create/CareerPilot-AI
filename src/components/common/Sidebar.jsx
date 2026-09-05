import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCareer } from '../../context/CareerContext';
import {
  LayoutDashboard,
  Target,
  Milestone,
  MessageSquareCode,
  LineChart,
  GitPullRequest,
  CheckCircle,
  FolderGit2,
  Briefcase,
  Award,
  BookOpen,
  Calendar,
  TrendingUp,
  ShieldAlert,
  Users,
  Database,
  BarChart4,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flame,
  Settings
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

  const navSections = [
    {
      title: 'MAIN',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'career-goals', label: 'Career Goals', icon: Target },
        { id: 'roadmap', label: 'Career Roadmap', icon: Milestone },
        { id: 'chat', label: 'AI Career Chat', icon: MessageSquareCode, badge: 'AI' }
      ]
    },
    {
      title: 'SKILL INTELLIGENCE',
      items: [
        { id: 'skill-insights', label: 'Skill Insights', icon: LineChart },
        { id: 'readiness-test', label: 'Readiness Test', icon: CheckCircle, badge: 'Quiz' }
      ]
    },
    {
      title: 'CAREER GROWTH HUB',
      items: [
        { id: 'projects', label: 'Projects', icon: FolderGit2 },
        { id: 'internships', label: 'Internships', icon: Briefcase, badge: 'Hot' },
        { id: 'certificates', label: 'Certificates', icon: Award },
        { id: 'resources', label: 'Resources', icon: BookOpen },
        { id: 'events', label: 'Events', icon: Calendar, badge: 'New' }
      ]
    },
    {
      title: 'PROGRESS TRACKING',
      items: [
        { id: 'progress-tracking', label: 'Progress Tracking', icon: TrendingUp }
      ]
    },
    {
      title: 'SETTINGS',
      items: [
        { id: 'settings', label: 'Settings', icon: Settings }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-16 z-40 h-screen lg:h-[calc(100vh-4rem)] bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Top Header on mobile only */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 lg:hidden">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-500" />
            <span className="font-bold text-slate-900 dark:text-white">CareerPilot AI</span>
          </div>
          <button
            onClick={() => setIsOpenMobile(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed ? (
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {section.title}
                </p>
              ) : (
                <div className="w-6 h-0.5 bg-slate-200 dark:bg-slate-800 mx-auto my-2" />
              )}

              {section.items.map((item) => {
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
                    className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brand-500 text-white shadow-glow'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 shrink-0 transition-transform ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-500'
                      }`}
                    />
                    {!isCollapsed && (
                      <div className="flex items-center justify-between flex-1 truncate">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-brand-500/10 text-brand-500 dark:text-brand-400 border border-brand-500/20'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer: Daily Streak & Readiness Mini widget */}
        {!isCollapsed && (
          <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 font-semibold text-amber-500">
                  <Flame className="w-4 h-4 fill-amber-500" />
                  {dailyStreak} Day Streak
                </span>
                <span className="font-bold text-brand-500">{readinessScore}% Ready</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-brand-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${readinessScore}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Collapse toggle button on desktop */}
        <div className="hidden lg:flex items-center justify-end p-2 border-t border-slate-200/80 dark:border-slate-800/80">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full flex items-center justify-center"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
}
