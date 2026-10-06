import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Award,
  BookOpen,
  TrendingUp,
  Sparkles,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Zap,
  Clock,
  AlertCircle
} from 'lucide-react';

export default function FacultyDashboard({ onNavigateTab }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashData, setDashData] = useState(null);

  useEffect(() => {
    apiService.getFacultyDashboard()
      .then(res => {
        if (res && res.success) {
          setDashData(res.dashboard);
        }
      })
      .catch(err => {
        console.error('Error fetching faculty dashboard:', err.message);
        showToast('Could not load faculty dashboard statistics.', 'error');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-400 animate-pulse">
          Loading Faculty Dashboard & Assigned Scope Metrics...
        </p>
      </div>
    );
  }

  const metrics = dashData?.metrics || {
    totalAssignedStudents: 0,
    avgReadinessScore: 0,
    assessmentCompletionRate: 0,
    rankDistribution: { Platinum: 0, Gold: 0, Silver: 0, Unranked: 0 },
    studentsByYear: { '1st Year': 0, '2nd Year': 0, '3rd Year': 0, '4th Year': 0 }
  };

  const facultyInfo = dashData?.facultyInfo || {};
  const upcomingClasses = dashData?.upcomingClasses || [];
  const emptyScopeMessage = dashData?.message;

  const hasStudentData = metrics.totalAssignedStudents > 0;

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Faculty Portal Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Department Faculty Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome, {facultyInfo.fullName || 'Faculty Member'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Assigned to <strong>{facultyInfo.department || 'Department Scope'}</strong> &bull; {facultyInfo.collegeName || 'Institution'}. Monitor assigned student readiness, track rank distributions, and publish faculty training materials.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab('faculty-students')}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 shadow-glow flex items-center gap-2 transition-all cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>View Assigned Students</span>
            </button>
          </div>
        </div>
      </div>

      {/* Empty Scope Message Notice */}
      {!hasStudentData && (
        <div className="glass-card rounded-3xl p-8 text-center border border-amber-500/20 bg-amber-500/5 space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No student data available for your current teaching scope.
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {emptyScopeMessage || 'There are currently no registered student profiles matching your assigned college, department, or academic year scope.'}
          </p>
        </div>
      )}

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Students</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {metrics.totalAssignedStudents}
          </div>
          <p className="text-[11px] text-slate-400">Scoped to active teaching assignments</p>
        </div>

        <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Readiness Index</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {hasStudentData ? `${metrics.avgReadinessScore}%` : 'N/A'}
          </div>
          <p className="text-[11px] text-emerald-500 font-semibold">Standardized assessment score</p>
        </div>

        <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assessment Completion</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {hasStudentData ? `${metrics.assessmentCompletionRate}%` : 'N/A'}
          </div>
          <p className="text-[11px] text-slate-400">Students with submitted attempts</p>
        </div>

        <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Platinum & Gold Tier</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {(metrics.rankDistribution?.Platinum || 0) + (metrics.rankDistribution?.Gold || 0)}
          </div>
          <p className="text-[11px] text-amber-500 font-semibold">Top placement candidates</p>
        </div>
      </div>

      {/* Rank Distribution & Academic Year Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rank Distribution Breakdown */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-400" />
              <span>Assigned Student Rank Distribution</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-1">
              <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold">
                <Sparkles className="w-4 h-4" />
                <span>PLATINUM TIER</span>
              </div>
              <div className="text-2xl font-extrabold text-white">
                {metrics.rankDistribution?.Platinum || 0}
              </div>
              <span className="text-[10px] text-cyan-300">Score &ge; 85%</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                <Award className="w-4 h-4" />
                <span>GOLD TIER</span>
              </div>
              <div className="text-2xl font-extrabold text-white">
                {metrics.rankDistribution?.Gold || 0}
              </div>
              <span className="text-[10px] text-amber-300">Score &ge; 70%</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-500/10 border border-slate-500/30 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>SILVER TIER</span>
              </div>
              <div className="text-2xl font-extrabold text-white">
                {metrics.rankDistribution?.Silver || 0}
              </div>
              <span className="text-[10px] text-slate-400">Score &lt; 70%</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                <Clock className="w-4 h-4" />
                <span>UNRANKED</span>
              </div>
              <div className="text-2xl font-extrabold text-white">
                {metrics.rankDistribution?.Unranked || 0}
              </div>
              <span className="text-[10px] text-slate-400">Pending Test</span>
            </div>
          </div>
        </div>

        {/* Academic Year Breakdown */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Students by Academic Year</span>
          </h3>

          <div className="space-y-3">
            {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(yr => {
              const count = metrics.studentsByYear?.[yr] || 0;
              const pct = metrics.totalAssignedStudents > 0 ? Math.round((count / metrics.totalAssignedStudents) * 100) : 0;

              return (
                <div key={yr} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{yr} Engineering</span>
                    <span className="text-slate-400">{count} Students ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scheduled Classes */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-400">
            <Calendar className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Upcoming Scheduled Faculty Classes
            </h3>
          </div>

          <button
            onClick={() => onNavigateTab('faculty-training')}
            className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Manage Training Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {upcomingClasses.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
            No upcoming classes scheduled. Use the Training Hub to schedule a new class.
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingClasses.map((c) => (
              <div key={c.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{c.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{c.department || c.subject} &bull; {c.academic_year || c.academicYear} (Sec {c.section})</p>
                </div>
                {c.meeting_url || c.meetingUrl ? (
                  <a href={c.meeting_url || c.meetingUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs">
                    Join Meeting
                  </a>
                ) : (
                  <span className="text-[10px] text-slate-400 uppercase font-bold">{c.status || 'Scheduled'}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
