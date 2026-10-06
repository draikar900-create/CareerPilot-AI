import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useProfile } from '../../context/ProfileContext';
import { getInitials } from '../../utils/helpers';
import { apiService } from '../../services/api';
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
  X
} from 'lucide-react';

export default function Header({ setActiveTab, onToggleSidebar, isSidebarCollapsed }) {
  const { currentUser, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const { profile } = useProfile();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = () => {
    import('../../services/api').then(({ apiService }) => {
      apiService.getStudentNotifications()
        .then(res => {
          const list = Array.isArray(res?.notifications) ? res.notifications
            : Array.isArray(res?.data) ? res.data : [];
          const formattedList = list.map(n => ({
            id: n.id,
            title: n.title,
            text: n.message,
            time: n.time || n.sentAt || 'Recent',
            unread: true
          }));
          setNotifications(formattedList);
        })
        .catch(() => {});
    });
  };

  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 15000);
    return () => clearInterval(intervalId);
  }, []);

  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

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

  // Keyboard shortcut Ctrl+K to focus search input
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.querySelector('input')?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const searchableItems = [
    { title: 'Career Roadmap', tab: 'roadmap', category: 'Roadmap' },
    { title: 'Skill Analysis', tab: 'skill-insights', category: 'Skills' },
    { title: 'AI Career Chat', tab: 'chat', category: 'AI Assistant' },
    { title: 'Readiness Test', tab: 'readiness-test', category: 'Tests' },
    { title: 'Projects', tab: 'projects', category: 'Projects' },
    { title: 'Internships', tab: 'internships', category: 'Opportunities' },
    { title: 'Jobs', tab: 'jobs', category: 'Opportunities' },
    { title: 'Learning Resources', tab: 'resources', category: 'Resources' },
    { title: 'My Profile', tab: 'profile', category: 'Profile' }
  ];

  const searchResults = searchQuery.trim()
    ? searchableItems.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const invalidNames = ['placement team admin', 'placement officer', 'demo user', 'test user', 'student'];
  const isInvalid = (n) => !n || typeof n !== 'string' || invalidNames.includes(n.trim().toLowerCase()) || n.toLowerCase().includes('admin');

  const studentDisplayName = (() => {
    if (profile?.fullName && !isInvalid(profile.fullName)) {
      return profile.fullName.trim();
    }
    if (currentUser?.name && !isInvalid(currentUser.name)) {
      return currentUser.name.trim();
    }
    if (currentUser?.email) {
      return currentUser.email.split('@')[0];
    }
    return 'Student';
  })();

  const studentDisplayEmail = (!isInvalid(profile?.email) && profile?.email) ||
    (currentUser?.role === 'Student' && currentUser?.email) ||
    'student@careerpilot.ai';

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-[#080C12]/95 backdrop-blur-md transition-colors duration-200">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 lg:hidden"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs shadow-xs">
              CP
            </div>
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-zinc-900 dark:text-white uppercase">
              CAREERPILOT
            </span>
          </div>
        </div>

        {/* Center Global Search Bar */}
        <div ref={searchRef} className="relative hidden md:block max-w-lg w-full mx-4">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search skills, projects, internships, roadmaps..."
              className="w-full pl-9 pr-16 py-2 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 focus:border-zinc-400 transition-all"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="absolute right-3 pointer-events-none px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-200/60 dark:bg-zinc-800 border border-zinc-300/60 dark:border-zinc-700/60 rounded">
                Ctrl K
              </span>
            )}
          </div>

          {/* Search Dropdown */}
          {isSearchFocused && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#121824] rounded-xl p-2 shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden z-50">
              <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider px-3 py-1">
                Quick Results
              </div>
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveTab(item.tab);
                    setIsSearchFocused(false);
                    setSearchQuery('');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
                >
                  <span className="font-medium">{item.title}</span>
                  <span className="text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Toggle Theme"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-zinc-200" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-700" />
            )}
          </button>

          {/* Notification Bell */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#121824] rounded-2xl p-4 shadow-xl border border-zinc-200 dark:border-zinc-800 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-zinc-900 dark:text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 max-h-72 overflow-y-auto mt-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-zinc-400 py-4 text-center">No new notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="py-2.5 px-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded-lg">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-semibold text-zinc-900 dark:text-white">{n.title}</span>
                          <span className="text-[10px] text-zinc-400">{n.time}</span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{n.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title={studentDisplayName}
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs flex items-center justify-center border border-zinc-300 dark:border-zinc-700">
                {getInitials(studentDisplayName)}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-zinc-900 dark:text-white leading-tight">
                  {studentDisplayName}
                </span>
                <span className="text-[10px] text-zinc-400 leading-tight">
                  Student
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#121824] rounded-2xl p-2 shadow-xl border border-zinc-200 dark:border-zinc-800 z-50">
                <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-800">
                  <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                    {studentDisplayName}
                  </p>
                  <p className="text-[11px] text-zinc-400 truncate">
                    {studentDisplayEmail}
                  </p>
                </div>

                <div className="py-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-zinc-400" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Settings</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
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

