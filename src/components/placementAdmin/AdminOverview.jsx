import React from 'react';
import { usePlacementAdmin } from '../../context/PlacementAdminContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Users,
  Building2,
  Briefcase,
  BookOpen,
  TrendingUp,
  UserCheck,
  Award,
  CheckCircle2,
  Sparkles,
  BarChart3,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';

export default function AdminOverview({ setActiveTab }) {
  const { overviewMetrics = {}, branchData = [], students = [], companies = [], jobs = [], resources = [] } = usePlacementAdmin();
  const { isDark } = useTheme();

  const totalSt = overviewMetrics?.totalStudents || 0;
  const statCards = [
    {
      id: 'students',
      label: 'Total Students',
      value: totalSt.toLocaleString(),
      subtext: 'Enrolled across all engineering branches',
      icon: Users,
      color: 'from-blue-600 to-indigo-600',
      textColor: 'text-blue-500',
      tab: 'students'
    },
    {
      id: 'companies',
      label: 'Total Companies',
      value: (companies || []).length,
      subtext: 'Active recruiting partners on campus',
      icon: Building2,
      color: 'from-purple-600 to-pink-600',
      textColor: 'text-purple-500',
      tab: 'companies'
    },
    {
      id: 'jobs',
      label: 'Total Jobs',
      value: (jobs || []).length,
      subtext: 'Open placement & internship drives',
      icon: Briefcase,
      color: 'from-emerald-600 to-teal-600',
      textColor: 'text-emerald-500',
      tab: 'jobs'
    },
    {
      id: 'resources',
      label: 'Total Resources',
      value: (resources || []).length,
      subtext: 'Curated technical preparation modules',
      icon: BookOpen,
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-500',
      tab: 'resources'
    }
  ];

  const registered = overviewMetrics?.studentsRegistered || 0;
  const profileCompletePercent = registered > 0
    ? Math.round(((overviewMetrics?.studentsProfileCompleted || 0) / registered) * 100)
    : 0;
  const readyPercent = registered > 0
    ? Math.round(((overviewMetrics?.studentsPlacementReady || 0) / registered) * 100)
    : 0;

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto animate-fade-in">
      {/* Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Placement Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Placement Team Admin Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Real-time institutional dashboard monitoring candidate readiness index, hiring companies, drive pipelines, and departmental metrics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('notifications')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
            >
              <span>Broadcast Announcement</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              onClick={() => setActiveTab(stat.tab)}
              className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-white/10 hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {stat.label}
                </span>
                <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${stat.color} text-white shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {stat.value}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">
                {stat.subtext}
              </p>
            </div>
          );
        })}
      </div>

      {/* Analytics Graph: Students by Branch */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Students by Branch
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Distribution across CSE, ISE, AIML, ECE, EEE, Mechanical, and Civil departments
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            Total Cohort: {overviewMetrics.totalStudents} Candidates
          </span>
        </div>

        <div className="w-full h-80 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={branchData} margin={{ top: 15, right: 20, left: -10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} vertical={false} />
              <XAxis
                dataKey="branch"
                stroke={isDark ? '#94a3b8' : '#64748b'}
                fontSize={12}
                fontWeight={600}
                tickLine={false}
              />
              <YAxis
                stroke={isDark ? '#94a3b8' : '#64748b'}
                fontSize={11}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  borderColor: isDark ? '#334155' : '#e2e8f0',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)'
                }}
                formatter={(value, name, item) => [`${value} Students`, `${item.payload.fullName}`]}
                labelStyle={{ fontWeight: 'bold', color: isDark ? '#f8fafc' : '#0f172a' }}
              />
              <Bar dataKey="students" radius={[8, 8, 0, 0]}>
                {branchData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Branch legend tags */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
          {branchData.map((b) => (
            <div key={b.branch} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.fill }} />
              <span className="font-semibold">{b.branch}:</span>
              <span>{b.students}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Overview Data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1 */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Registration Pipeline
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {overviewMetrics.studentsRegistered.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Students Registered
            </p>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: '100%' }} />
          </div>
          <div className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% of campus batch accounted for</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Profile Validation
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {overviewMetrics.studentsProfileCompleted.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Students Profile Completed ({profileCompletePercent}%)
            </p>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${profileCompletePercent}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Verified resumes & transcripts</span>
            <span className="font-bold text-indigo-500">{overviewMetrics.studentsRegistered - overviewMetrics.studentsProfileCompleted} pending</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Interview Readiness
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {overviewMetrics.studentsPlacementReady.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Students Placement Ready ({readyPercent}%)
            </p>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${readyPercent}%` }}
            />
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Meets benchmark for Tier-1 drives (Score ≥ 75%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
