import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';
import {
  BarChart4,
  TrendingUp,
  Users,
  Award,
  Sparkles,
  ArrowUpRight,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export default function Analytics() {
  const { platformUsage } = useAdmin();
  const { isDark } = useTheme();

  // Readiness distribution across student body
  const readinessDistribution = [
    { range: '0-40% (Beginning)', count: 480 },
    { range: '41-60% (Intermediate)', count: 1820 },
    { range: '61-75% (Proficient)', count: 3950 },
    { range: '76-85% (Interview Ready)', count: 2410 },
    { range: '86-100% (Tier-1 Elite)', count: 760 }
  ];

  const rolePopularity = [
    { role: 'Full Stack Dev', count: 3800 },
    { role: 'AI Engineer', count: 2950 },
    { role: 'Software Engineer', count: 2400 },
    { role: 'Data Scientist', count: 1650 },
    { role: 'Cloud Engineer', count: 1200 },
    { role: 'Cybersecurity', count: 850 }
  ];

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-500 border border-brand-500/20 mb-2">
            <BarChart4 className="w-3.5 h-3.5" />
            <span>Platform Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Institutional Analytics & Readiness Trends
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Cohort-level telemetry tracking user acquisition velocity, benchmark readiness migration, and high-demand specialization trends.
          </p>
        </div>
      </div>

      {/* Chart 1: User Growth & Platform Usage */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              User Growth & Feature Utilization (6-Month Velocity)
            </h3>
            <p className="text-xs text-slate-400">
              Comparing Active Students vs Assessments Taken vs ATS Resumes Calibrated
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold">
            +683% Active Growth
          </span>
        </div>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={platformUsage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="userGrowth" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="assessmentsGrowth" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="resumeGrowth" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="students" name="Active Students" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#userGrowth)" />
              <Area type="monotone" dataKey="testsTaken" name="Assessments Taken" stroke="#a855f7" strokeWidth={2.5} fillOpacity={1} fill="url(#assessmentsGrowth)" />
              <Area type="monotone" dataKey="resumesCalibrated" name="Resumes Calibrated" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#resumeGrowth)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Readiness Distribution & Target Role Popularity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Readiness Trends Histogram */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Student Readiness Score Distribution
            </h3>
            <p className="text-xs text-slate-400">
              Cohort breakdown across readiness tiers
            </p>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={readinessDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} vertical={false} />
                <XAxis dataKey="range" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} tickLine={false} />
                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                    borderRadius: '0.75rem',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" name="Enrolled Students" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Role Specialization Demand */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Target Role Aspirations
            </h3>
            <p className="text-xs text-slate-400">
              Specialization choices selected by student candidates
            </p>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rolePopularity} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} horizontal={false} />
                <XAxis type="number" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} tickLine={false} />
                <YAxis type="category" dataKey="role" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                    borderRadius: '0.75rem',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" name="Student Candidates" fill="#06b6d4" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
