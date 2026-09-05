import React from 'react';
import { useCareer } from '../../context/CareerContext';
import { useProfile } from '../../context/ProfileContext';
import CircularProgress from '../common/CircularProgress';
import {
  LineChart,
  Target,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  TrendingUp,
  AlertTriangle,
  FileQuestion,
  UserCheck
} from 'lucide-react';

export default function SkillAnalysis({ setActiveTab }) {
  const { currentRole, skillComparison, selectDreamRole } = useCareer();
  const { profile } = useProfile();

  const {
    hasSkills,
    hasRole,
    studentSkills,
    matchedSkills,
    missingSkills,
    matchPercentage
  } = skillComparison;

  // Case 1: No career role selected yet
  if (!hasRole) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-slate-200/80 dark:border-white/10 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Target className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            No Career Goal Selected
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Select your target career role to generate analysis. We will compare your skills against live industry requirements.
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

  // Case 2: Career role selected, but no skills added in profile
  if (!hasSkills || studentSkills.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-slate-200/80 dark:border-white/10 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <FileQuestion className="w-8 h-8" />
          </div>
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500">
            Target: {currentRole.title} (0% Match)
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            No Skills Added Yet
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Complete your Student Profile and add your skills to generate career analysis.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setActiveTab('profile')}
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:opacity-95 shadow-glow inline-flex items-center gap-2"
            >
              <span>Go to Student Profile</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Skills available & Target Role Selected -> Render dynamic analysis!
  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-brand-500/15 to-transparent rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-500 border border-brand-500/20 mb-2">
              <LineChart className="w-3.5 h-3.5" />
              <span>Skill Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Skill Alignment & Match Analysis
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Real-time comparison between your student profile skills and requirements for <strong className="text-slate-800 dark:text-slate-200">{currentRole.title}</strong>.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('roadmap')}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:opacity-95 shadow-glow flex items-center gap-2 transition-all self-start md:self-auto shrink-0"
          >
            <span>Generate Roadmap</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dream Role Match Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-500">
            Mathematical Alignment
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {currentRole.title} Match: {matchPercentage}%
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md">
            You currently possess <strong>{matchedSkills.length}</strong> of the <strong>{currentRole.requiredSkills.length}</strong> core competency requirements for this role.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Matched: {matchedSkills.length} Skills
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Missing: {missingSkills.length} Skills
            </span>
          </div>
        </div>

        <div className="shrink-0 py-2">
          <CircularProgress
            value={matchPercentage}
            size={160}
            strokeWidth={14}
            label="Role Match"
            sublabel={`${matchPercentage}% Match`}
          />
        </div>
      </div>

      {/* Section 1: Skills You Have */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-emerald-500/20 bg-emerald-500/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Skills You Have
            </h3>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            {studentSkills.length} Skills from Profile
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          All skills entered and saved in your Student Profile:
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {studentSkills.map((skill, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{skill}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Section 2: Skills Missing For Dream Role */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-amber-500/20 bg-amber-500/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Skills Missing For Dream Role ({currentRole.title})
            </h3>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
            {missingSkills.length} Missing
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Target competencies required for {currentRole.title} that are not yet in your profile:
        </p>

        {missingSkills.length === 0 ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Congratulations! You have covered all core skills required for {currentRole.title}!</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {missingSkills.map((req, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white block">
                      {req.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {req.industryImportance}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    req.priority === 'High'
                      ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  }`}
                >
                  {req.priority} Priority
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Acquiring these skills will increase your match score towards 100%.
          </span>
          <button
            onClick={() => setActiveTab('roadmap')}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-glow flex items-center gap-1.5 transition-all"
          >
            <span>Generate Roadmap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
