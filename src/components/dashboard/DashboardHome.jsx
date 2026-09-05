import React from 'react';
import { useCareer } from '../../context/CareerContext';
import { useProfile } from '../../context/ProfileContext';
import { useTheme } from '../../context/ThemeContext';
import CircularProgress from '../common/CircularProgress';
import IndustryComparisonChart from './IndustryComparisonChart';
import BannerCarousel from './BannerCarousel';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  CheckCircle2,
  Clock,
  ListTodo,
  Award,
  FolderGit2,
  Briefcase,
  TrendingUp,
  Target,
  Sparkles,
  ArrowUpRight,
  Flame,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export default function DashboardHome({ setActiveTab }) {
  const {
    readinessScore,
    currentRole,
    roadmapStats,
    dailyStreak,
    skillComparison,
    appliedInternships,
    pinnedProjects
  } = useCareer();

  const { profile, isProfileCompleted } = useProfile();
  const { isDark } = useTheme();

  const isNewUser = !profile.skills || profile.skills.length === 0;

  // DYNAMIC STATS (Zero for new users)
  const skillsCompleted = isNewUser ? 0 : (profile?.skills?.length || 0);
  const skillsRemaining = !currentRole ? 0 : (skillComparison?.missingSkills?.length || 0);
  const activeTasks = !currentRole ? 0 : Math.max(0, (roadmapStats.totalTopics - roadmapStats.completedTopics));
  
  // Count certificates from profile string if present
  const certCount = profile?.certifications
    ? profile.certifications.split(',').filter(c => c.trim().length > 0).length
    : 0;

  const statsCards = [
    {
      title: 'Skills Completed',
      value: skillsCompleted,
      change: isNewUser ? 'No skills added yet' : `${skillsCompleted} verified skills`,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    {
      title: 'Skills Remaining',
      value: skillsRemaining,
      change: !currentRole ? 'Goal not set' : `${skillsRemaining} for ${currentRole.title}`,
      icon: Clock,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    },
    {
      title: 'Active Tasks',
      value: activeTasks,
      change: isNewUser ? 'Roadmap pending' : `${roadmapStats.completedTopics} finished`,
      icon: ListTodo,
      color: 'text-brand-500',
      bg: 'bg-brand-500/10'
    },
    {
      title: 'Certificates Earned',
      value: certCount,
      change: certCount > 0 ? 'Verified credentials' : 'No credentials added',
      icon: Award,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      title: 'Projects',
      value: pinnedProjects?.length || 0,
      change: pinnedProjects?.length > 0 ? 'Active capstones' : 'Explore projects',
      icon: FolderGit2,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10'
    },
    {
      title: 'Internships',
      value: appliedInternships?.length || 0,
      change: appliedInternships?.length > 0 ? 'Submitted applications' : 'No applications yet',
      icon: Briefcase,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10'
    }
  ];

  // Dynamic weekly growth data reflecting actual readinessScore
  const weeklyGrowthData = isNewUser
    ? [
        { week: 'Wk 1', score: 0, benchmark: 60 },
        { week: 'Wk 2', score: 0, benchmark: 62 },
        { week: 'Wk 3', score: 0, benchmark: 64 },
        { week: 'Wk 4', score: 0, benchmark: 68 },
        { week: 'Wk 5', score: 0, benchmark: 70 },
        { week: 'Wk 6', score: 0, benchmark: 72 },
        { week: 'Wk 7', score: 0, benchmark: 74 },
        { week: 'Wk 8', score: 0, benchmark: 76 }
      ]
    : [
        { week: 'Wk 1', score: Math.max(0, Math.round(readinessScore * 0.4)), benchmark: 60 },
        { week: 'Wk 2', score: Math.max(0, Math.round(readinessScore * 0.5)), benchmark: 62 },
        { week: 'Wk 3', score: Math.max(0, Math.round(readinessScore * 0.6)), benchmark: 64 },
        { week: 'Wk 4', score: Math.max(0, Math.round(readinessScore * 0.7)), benchmark: 68 },
        { week: 'Wk 5', score: Math.max(0, Math.round(readinessScore * 0.8)), benchmark: 70 },
        { week: 'Wk 6', score: Math.max(0, Math.round(readinessScore * 0.88)), benchmark: 72 },
        { week: 'Wk 7', score: Math.max(0, Math.round(readinessScore * 0.94)), benchmark: 74 },
        { week: 'Wk 8', score: readinessScore, benchmark: 76 }
      ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Carousel (Below Header, Above Statistics Cards) */}
      <BannerCarousel setActiveTab={setActiveTab} />

      {/* Welcome Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-brand-500/20 via-purple-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-500 border border-brand-500/20 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                AI-Driven Career Dashboard
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-amber-500" />
                {dailyStreak} Day Streak
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome back{profile?.fullName?.trim() && !profile.fullName.toLowerCase().includes('admin') ? `, ${profile.fullName.trim().split(' ')[0]}` : ''}! 👋
            </h1>

            {isNewUser ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                Start by completing your profile and selecting a career goal to unlock live AI readiness metrics.
              </p>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                Target Role: <strong className="text-slate-800 dark:text-slate-200">{currentRole?.title || 'None Selected'}</strong>. Your readiness index is dynamically calculated from verified skills.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isNewUser ? (
              <button
                onClick={() => setActiveTab('profile')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:opacity-95 shadow-glow flex items-center gap-2 transition-all"
              >
                <span>Complete Student Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('readiness-test')}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:opacity-95 shadow-glow flex items-center gap-2 transition-all"
                >
                  <span>Take Readiness Test</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveTab('roadmap')}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2"
                >
                  <Target className="w-4 h-4 text-brand-500" />
                  <span>View Roadmap</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* New User Callout Alert if no profile/skills added */}
      {isNewUser && (
        <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Start by completing your profile and selecting a career goal.
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All metrics, charts, and readiness scores are initialized to 0% and will calibrate automatically when you add your skills.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('profile')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 whitespace-nowrap transition-all"
          >
            Add Skills Now
          </button>
        </div>
      )}

      {/* Grid: Career Readiness Score Card & Statistics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Circular Career Readiness Score */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 flex flex-col items-center justify-between text-center relative">
          <div className="w-full flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
            <div className="text-left">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Career Readiness Score</h2>
              <p className="text-xs text-slate-400">
                {currentRole ? `Target: ${currentRole.title}` : 'No Role Selected'}
              </p>
            </div>
            <span className="p-2 rounded-xl bg-brand-500/10 text-brand-500">
              <TrendingUp className="w-5 h-5" />
            </span>
          </div>

          <div className="py-6">
            <CircularProgress
              value={readinessScore}
              size={200}
              strokeWidth={16}
              label="Readiness Index"
              sublabel={
                readinessScore === 0
                  ? 'Profile Incomplete'
                  : readinessScore >= 75
                  ? 'Junior Role Qualified'
                  : 'Building Skills'
              }
            />
          </div>

          <div className="w-full pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Target Match:</span>
            <span className="font-bold text-brand-500">
              {skillComparison?.matchPercentage || 0}% alignment
            </span>
          </div>
        </div>

        {/* 6 Statistics Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {statsCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-200/80 dark:border-white/10 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {stat.title}
                  </span>
                  <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-[11px] font-medium text-slate-400 mt-1">
                    {stat.change}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Big Charts: Industry Comparison (Bar) & Weekly Growth (Line) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Industry Comparison Chart */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Industry Comparison Analysis
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your Current Level vs Industry Requirement (Bar Chart)
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium text-slate-600 dark:text-slate-300">
              5 Key Dimensions
            </span>
          </div>

          <IndustryComparisonChart setActiveTab={setActiveTab} />
        </div>

        {/* Weekly Growth Line Graph */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Weekly Growth & Velocity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Career Readiness Growth over past 8 weeks (Line Graph)
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold">
              {readinessScore > 0 ? `Current: ${readinessScore}%` : 'Baseline (0%)'}
            </span>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={weeklyGrowthData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? '#1e293b' : '#f1f5f9'}
                  vertical={false}
                />
                <XAxis
                  dataKey="week"
                  stroke={isDark ? '#94a3b8' : '#64748b'}
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke={isDark ? '#94a3b8' : '#64748b'}
                  fontSize={11}
                  tickLine={false}
                  domain={[0, 100]}
                  unit="%"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                    borderRadius: '0.75rem',
                    color: isDark ? '#f8fafc' : '#0f172a',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Your Readiness Score"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#6366f1' }}
                  activeDot={{ r: 6, fill: '#00d2ff' }}
                />
                <Line
                  type="monotone"
                  dataKey="benchmark"
                  name="Industry Benchmark"
                  stroke={isDark ? '#475569' : '#94a3b8'}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
