import React from 'react';
import { useCareer } from '../../context/CareerContext';
import { useProfile } from '../../context/ProfileContext';
import {
  GitPullRequest,
  TrendingUp,
  Clock,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  Flame,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileQuestion,
  Target,
  ArrowRight
} from 'lucide-react';

export default function SkillGapAudit({ setActiveTab }) {
  const { currentRole, skillComparison } = useCareer();
  const { profile } = useProfile();

  const {
    hasSkills,
    hasRole,
    studentSkills,
    matchedSkills,
    missingSkills,
    matchPercentage,
    gapSeverity
  } = skillComparison;

  // Case 1: No career role selected
  if (!hasRole) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-slate-200/80 dark:border-white/10 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Target className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Skill Gap Audit Not Available
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Select your target career role to generate a personalized skill gap audit.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setActiveTab('career-goals')}
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:opacity-95 shadow-glow inline-flex items-center gap-2"
            >
              <span>Go To Career Goals</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 1b: No skills entered
  if (!hasSkills || studentSkills.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-slate-200/80 dark:border-white/10 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500">
            Progress: 0% • Audit Suspended
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Skill Gap Audit Not Available
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Complete Student Profile First. Add your technical skills to analyze your readiness gaps for {currentRole.title}.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setActiveTab('profile')}
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:opacity-95 shadow-glow inline-flex items-center gap-2"
            >
              <span>Complete Student Profile</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Skills Available -> Generate dynamic gap audit!
  const severityBadge =
    gapSeverity === 'High'
      ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
      : gapSeverity === 'Medium'
      ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-rose-500/10 via-amber-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-500 border border-brand-500/20 mb-2">
              <GitPullRequest className="w-3.5 h-3.5" />
              <span>Gap Remediation Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Skill Gap Audit for {currentRole.title}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Real-time audit calculating exact competency gaps between your saved profile and target role.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border uppercase tracking-wider ${severityBadge}`}>
              Gap Severity: {gapSeverity}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Existing Skills VS Missing Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Existing Skills */}
        <div className="glass-card rounded-3xl p-6 border border-emerald-500/20 bg-emerald-500/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Existing Skills ({studentSkills.length})</span>
            </h3>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              Verified in Profile
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {studentSkills.map((sk, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm"
              >
                {sk}
              </span>
            ))}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="glass-card rounded-3xl p-6 border border-rose-500/20 bg-rose-500/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              <span>Missing Skills ({missingSkills.length})</span>
            </h3>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
              Target Requirements
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {missingSkills.map((sk, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-sm flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>{sk.name}</span>
                <span className="text-[10px] opacity-75">({sk.priority})</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Missing Skills Detailed Progress & Impact */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Gap Remediation & Priority Roadmap
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Focus on high-priority missing skills to maximize your readiness index.
          </p>
        </div>

        <div className="space-y-4">
          {missingSkills.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {item.name}
                  </h4>
                  <span className="text-xs text-slate-400">
                    {item.industryImportance}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    item.priority === 'High'
                      ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  }`}
                >
                  {item.priority} Priority
                </span>
              </div>

              {/* Progress Bar showing current 0% for missing skill to target */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Current Mastery: 0%</span>
                  <span>Target Benchmark: 85%+</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                    style={{ width: item.priority === 'High' ? '15%' : '30%' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Learning Path */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-brand-900/60 via-indigo-900/60 to-purple-900/60 border border-brand-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-300 block mb-1">
            Recommended Learning Path
          </span>
          <h4 className="text-base font-bold text-white">
            Ready to bridge your {missingSkills.length} missing skills?
          </h4>
          <p className="text-xs text-slate-300 mt-0.5">
            Follow your semester curriculum and practice projects to eliminate competency gaps.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('roadmap')}
          className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-500 shadow-glow shrink-0 flex items-center gap-2 transition-all"
        >
          <span>Open Learning Roadmap</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
