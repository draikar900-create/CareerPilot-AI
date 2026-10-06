import React from 'react';
import {
  LayoutDashboard,
  Users,
  Award,
  BookOpen,
  Calendar,
  Settings,
  LogOut,
  UserCheck,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Video,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function FacultySidebar({ activeTab, setActiveTab }) {
  const { logout, currentUser } = useAuth();

  const navItems = [
    { id: 'faculty-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'faculty-students', label: 'My Students', icon: Users },
    { id: 'faculty-progress', label: 'Student Progress & Notes', icon: TrendingUp },
    { id: 'faculty-resources', label: 'YouTube & Resources', icon: Video },
    { id: 'faculty-training', label: 'Training & Classes', icon: BookOpen },
    { id: 'faculty-settings', label: 'Profile & Scope', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-white/95 dark:bg-[#0C111E]/95 backdrop-blur-md text-slate-700 dark:text-slate-300 flex flex-col justify-between border-r border-slate-200/80 dark:border-slate-800/80 shrink-0 h-screen sticky top-0 z-30 transition-colors duration-200">
      {/* Sidebar Header */}
      <div className="p-5 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20">
            CP
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 block">
              FACULTY PORTAL
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              CareerPilot
            </span>
          </div>
        </div>

        {/* Faculty Assignment Badge */}
        <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
            <UserCheck className="w-3.5 h-3.5" />
            <span className="truncate">{currentUser?.user_metadata?.full_name || currentUser?.name || 'Faculty Member'}</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
            {currentUser?.user_metadata?.department || 'Computer Science & Engineering'}
          </p>
        </div>

        {/* Nav Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Sign Out */}
      <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Faculty Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
