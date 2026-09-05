import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Users,
  UserCheck,
  UserPlus,
  Briefcase,
  FolderGit2,
  TrendingUp,
  ShieldAlert,
  ArrowUpRight,
  Database,
  BarChart4
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

export default function AdminDashboard({ setActiveTab }) {
  const { users, projects, internships, resources, platformUsage } = useAdmin();
  const { isDark } = useTheme();

  const totalUsers = users.length + 9420;
  const activeUsers = Math.round(totalUsers * 0.84);
  const newRegistrations = 428;

  const kpiCards = [
    {
      title: 'Total Users',
      value: totalUsers.toLocaleString(),
      subtext: '+18% MoM Growth',
      icon: Users,
      color: 'text-brand-500',
      bg: 'bg-brand-500/10'
    },
    {
      title: 'Active Users',
      value: activeUsers.toLocaleString(),
      subtext: '84% Engagement Rate',
      icon: UserCheck,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    {
      title: 'New Registrations',
      value: newRegistrations.toLocaleString(),
      subtext: 'Past 7 Days',
      icon: UserPlus,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10'
    },
    {
      title: 'Internship Listings',
      value: internships.length + 18,
      subtext: 'Tier-1 Tech Companies',
      icon: Briefcase,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    },
    {
      title: 'Project Listings',
      value: projects.length + 12,
      subtext: 'Vetted Capstones',
      icon: FolderGit2,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    }
  ];

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-purple-500/20 via-brand-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Executive Administration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Admin Platform Overview
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Monitor active student registrations, curriculum content catalogues, and automated readiness index metrics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('user-management')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-500 shadow-glow flex items-center gap-2 transition-all"
            >
              <Users className="w-4 h-4" />
              <span>Manage Users</span>
            </button>
            <button
              onClick={() => setActiveTab('content-management')}
              className="px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2 transition-all"
            >
              <Database className="w-4 h-4" />
              <span>Content Library</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="glass-card glass-card-hover rounded-3xl p-5 border border-slate-200/80 dark:border-white/10 flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl ${card.bg} ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {card.value}
                </span>
                <p className="text-[11px] font-semibold text-emerald-500 mt-1">
                  {card.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Platform Activity Chart */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Platform Growth & Assessment Volume
            </h3>
            <p className="text-xs text-slate-400">
              Active student enrollments and verified readiness evaluations
            </p>
          </div>
          <button
            onClick={() => setActiveTab('admin-analytics')}
            className="text-xs font-bold text-brand-500 hover:underline flex items-center gap-1"
          >
            <span>Deep Analytics</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={platformUsage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorStudents" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTests" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} vertical={false} />
              <XAxis dataKey="month" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} />
              <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                  borderRadius: '0.75rem',
                  fontSize: '12px'
                }}
              />
              <Area type="monotone" dataKey="students" name="Active Students" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorStudents)" />
              <Area type="monotone" dataKey="testsTaken" name="Readiness Tests" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorTests)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
