import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useProfile } from '../../context/ProfileContext';
import { getInitials } from '../../utils/helpers';
import {
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Sparkles,
  Compass,
  CheckCircle2,
  FileText,
  Briefcase,
  X
} from 'lucide-react';

export default function Header({ setActiveTab, onToggleSidebar, isSidebarCollapsed }) {
  const { currentUser, logout, toggleUserRole } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { profile } = useProfile();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'AI Roadmap Calibrated', text: 'New PyTorch milestones unlocked for AI Engineer role.', time: '10m ago', unread: true },
    { id: 2, title: 'Internship Deadline', text: 'Google SWE Summer 2027 application window closes soon.', time: '2h ago', unread: true },
    { id: 3, title: 'Readiness Score Up', text: 'Your career readiness index improved to 78%!', time: '1d ago', unread: false }
  ]);

  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  // Quick search items database
  const searchableItems = [
    { title: 'Career Readiness Test', tab: 'readiness-test', category: 'Skill Intelligence' },
    { title: 'Autonomous RAG Project', tab: 'projects', category: 'Career Growth Hub' },
    { title: 'Google SWE Internship', tab: 'internships', category: 'Career Growth Hub' },
    { title: 'Resume Foundation Guide', tab: 'roadmap', category: 'Roadmap' },
    { title: 'AI Career Chat Assistant', tab: 'chat', category: 'AI Tools' },
    { title: 'Skill Insights', tab: 'skill-insights', category: 'Skill Intelligence' },
    { title: 'Technical Events & Hackathons', tab: 'events', category: 'Career Growth Hub' },
    { title: 'Progress Tracking & Analytics', tab: 'progress-tracking', category: 'Progress Tracking' },
    { title: 'Student Profile & Resume', tab: 'profile', category: 'Profile' }
  ];

  const searchResults = searchQuery.trim()
    ? searchableItems.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  // Resolve authenticated student's real display name strictly avoiding any admin/placeholder strings
  const invalidNames = ['placement team admin', 'placement officer', 'demo user', 'test user', 'student'];
  const isInvalid = (n) => !n || typeof n !== 'string' || invalidNames.includes(n.trim().toLowerCase()) || n.toLowerCase().includes('admin') || n.toLowerCase().includes('placement team');

  const studentDisplayName = (() => {
    if (profile?.fullName && !isInvalid(profile.fullName)) {
      return profile.fullName.trim();
    }
    if (currentUser?.role === 'Student' && currentUser?.name && !isInvalid(currentUser.name)) {
      return currentUser.name.trim();
    }
    const savedName = localStorage.getItem('cp_student_name');
    if (savedName && !isInvalid(savedName)) {
      return savedName.trim();
    }
    return 'Student';
  })();

  const studentDisplayEmail = (!isInvalid(profile?.email) && profile?.email) ||
    (currentUser?.role === 'Student' && currentUser?.email) ||
    '';

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0E131F]/90 backdrop-blur-md transition-colors duration-200">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                  CareerPilot<span className="text-brand-500">AI</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                  AI v2.4
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div ref={searchRef} className="relative hidden md:block max-w-md w-full mx-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search skills, projects, internships, roadmaps... (Press '/' to focus)"
              className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/70 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {isSearchFocused && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 glass-card rounded-xl p-2 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1.5">
                Quick Navigation Results
              </div>
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveTab(item.tab);
                    setIsSearchFocused(false);
                    setSearchQuery('');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-brand-950/40 hover:text-brand-600 dark:hover:text-brand-400 transition-colors text-left"
                >
                  <span className="font-medium">{item.title}</span>
                  <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification Bell */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-card rounded-2xl p-4 shadow-2xl border border-slate-200 dark:border-slate-800 z-50 animate-scale-up">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs px-2 py-0.5 rounded-full font-semibold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-72 overflow-y-auto mt-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`py-2.5 px-2 rounded-lg transition-colors ${
                        n.unread ? 'bg-brand-50/50 dark:bg-brand-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">{n.title}</span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
            aria-label="Toggle Theme"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600 transition-transform rotate-0 hover:-rotate-12" />
            )}
          </button>

          {/* Profile Avatar Dropdown */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
              title={studentDisplayName}
            >
              {profile?.photoUrl || (currentUser?.role === 'Student' && currentUser?.avatar) ? (
                <img
                  src={profile?.photoUrl || currentUser?.avatar}
                  alt={studentDisplayName}
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-brand-500/40"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center ring-2 ring-brand-500/30 shadow-sm">
                  {getInitials(studentDisplayName)}
                </div>
              )}
              <span className="hidden sm:block text-xs font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[140px]">
                {studentDisplayName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 glass-card rounded-2xl p-2 shadow-2xl border border-slate-200 dark:border-slate-800 z-50 animate-scale-up">
                <div className="px-3 py-2.5 border-b border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {studentDisplayName}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {studentDisplayEmail}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                      Student • Sem {profile?.currentSemester || 1}
                    </span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-brand-950/40 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4 text-brand-500" />
                    <span>Student Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-brand-950/40 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Settings</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
