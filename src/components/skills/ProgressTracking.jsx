import React from 'react';
import { useCareer } from '../../context/CareerContext';
import { useProfile } from '../../context/ProfileContext';
import CircularProgress from '../common/CircularProgress';
import {
  TrendingUp,
  Award,
  CheckCircle2,
  Calendar,
  Flame,
  Star,
  Sparkles,
  Milestone,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight
} from 'lucide-react';

export default function ProgressTracking({ setActiveTab }) {
  const {
    readinessScore,
    currentRole,
    roadmapStats,
    dailyStreak,
    testResults,
    skillComparison
  } = useCareer();

  const { profile } = useProfile();
  const hasSkills = profile.skills && profile.skills.length > 0;

  // Dynamic domain breakdown
  const domainSkills = [
    {
      domain: 'Core Programming & Data Structures',
      skillsInDomain: ['Python', 'Java', 'C++', 'Data Structures', 'Algorithms'],
      color: 'from-blue-500 to-indigo-600'
    },
    {
      domain: 'Web & Systems Development',
      skillsInDomain: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'REST APIs', 'SQL'],
      color: 'from-cyan-500 to-teal-600'
    },
    {
      domain: 'AI, Data & Modern Machine Learning',
      skillsInDomain: ['Machine Learning', 'PyTorch', 'Pandas', 'LangChain', 'Statistics'],
      color: 'from-purple-500 to-pink-600'
    },
    {
      domain: 'DevOps, Cloud & Infrastructure',
      skillsInDomain: ['Docker', 'Git', 'Linux', 'AWS', 'Kubernetes'],
      color: 'from-amber-500 to-orange-600'
    }
  ].map(dom => {
    const studentList = (profile.skills || []).map(s => s.toLowerCase());
    const matched = dom.skillsInDomain.filter(s =>
      studentList.some(userS => userS === s.toLowerCase() || userS.includes(s.toLowerCase()))
    );
    const pct = Math.round((matched.length / dom.skillsInDomain.length) * 100);
    return {
      name: dom.domain,
      pct,
      matchedCount: matched.length,
      totalCount: dom.skillsInDomain.length,
      color: dom.color
    };
  });

  // Dynamic Badges (Only unlocked when genuine condition is fulfilled!)
  const dynamicBadges = [
    {
      id: 'b1',
      title: 'First Step Pilot',
      desc: 'Completed initial Student Profile & contact setup',
      icon: '🚀',
      unlocked: Boolean(profile.fullName && profile.email)
    },
    {
      id: 'b2',
      title: 'Skill Navigator',
      desc: 'Added 5 or more technical skills to profile',
      icon: '⚡',
      unlocked: (profile.skills?.length || 0) >= 5
    },
    {
      id: 'b3',
      title: 'Career Strategist',
      desc: 'Selected a dream target role in Career Goals',
      icon: '🎯',
      unlocked: Boolean(currentRole)
    },
    {
      id: 'b4',
      title: 'Knowledge Evaluator',
      desc: 'Completed the Multi-Domain Readiness Quiz',
      icon: '🧠',
      unlocked: Boolean(testResults?.taken)
    },
    {
      id: 'b5',
      title: 'Consistency Champion',
      desc: 'Maintained an active 3+ day learning streak',
      icon: '🔥',
      unlocked: dailyStreak >= 3
    },
    {
      id: 'b6',
      title: 'Resume Pioneer',
      desc: 'Uploaded an ATS-compliant PDF resume',
      icon: '📄',
      unlocked: Boolean(profile.resume)
    }
  ];

  const unlockedCount = dynamicBadges.filter(b => b.unlocked).length;

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-brand-500/15 via-indigo-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-500 border border-brand-500/20 mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Telemetry & Mastery</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Progress Tracking & Achievements
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Real-time telemetry measuring curriculum completion, domain competencies, and earned credentials.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-xs text-slate-400 block font-medium">Unlocked Badges</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {unlockedCount} of {dynamicBadges.length} Earned
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats: Overall Circular Gauge & Milestone Tracker */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Circular Overall Progress */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 flex flex-col items-center justify-center text-center">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Overall Readiness
          </h3>
          <CircularProgress
            value={readinessScore}
            size={170}
            strokeWidth={14}
            label="Readiness Index"
            sublabel={`${readinessScore}% Score`}
          />
          <span className="text-xs text-slate-400 mt-4">
            {readinessScore === 0 ? 'No profile data yet' : 'Dynamically calibrated'}
          </span>
        </div>

        {/* Milestone Tracker & Streak */}
        <div className="md:col-span-2 glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Roadmap Milestones Progress
              </h3>
              <span className="text-xs font-bold text-brand-500">
                {roadmapStats.percentage}% Complete
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Target: {currentRole?.title || 'None Selected'}
            </p>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${roadmapStats.percentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
              <span>{roadmapStats.completedTopics} milestones finished</span>
              <span>{roadmapStats.totalTopics - roadmapStats.completedTopics} remaining</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
              <Flame className="w-6 h-6 text-amber-500 fill-amber-500 shrink-0" />
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">Streak Active</span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {dailyStreak} Days
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-3">
              <Zap className="w-6 h-6 text-purple-400 shrink-0" />
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">Readiness Quiz</span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {testResults.taken ? `${testResults.score}% Score` : 'Not Taken'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Domain Skill Completion Bars */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Domain Skill Competency Bars
        </h3>
        <p className="text-xs text-slate-400">
          Percentage of benchmark competencies in your profile across core computer science sectors:
        </p>

        <div className="space-y-4 pt-2">
          {domainSkills.map((dom, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">{dom.name}</span>
                <span className="text-slate-900 dark:text-white font-bold">
                  {dom.pct}% ({dom.matchedCount}/{dom.totalCount} skills)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${dom.color} rounded-full transition-all duration-500`}
                  style={{ width: `${dom.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Unlocked Badges Showcase */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Achievement Badges</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Badges unlock dynamically as you complete profile milestones and active learning challenges.
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-500 border border-brand-500/20">
            {unlockedCount} / {dynamicBadges.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {dynamicBadges.map((b) => (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                b.unlocked
                  ? 'bg-amber-500/5 border-amber-500/30 dark:bg-amber-500/5'
                  : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/50 opacity-60'
              }`}
            >
              <div className="text-2xl shrink-0 p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm">
                {b.unlocked ? b.icon : <Lock className="w-6 h-6 text-slate-400" />}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {b.title}
                  </h4>
                  {b.unlocked && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {b.desc}
                </p>
                <span className={`inline-block text-[10px] font-bold uppercase tracking-wider mt-2 px-2 py-0.5 rounded ${
                  b.unlocked
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                }`}>
                  {b.unlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
