import React from 'react';
import { useCareer } from '../../context/CareerContext';
import { useProfile } from '../../context/ProfileContext';
import { useToast } from '../../context/ToastContext';
import {
  Target,
  Sparkles,
  ArrowRight,
  Cpu,
  Layers,
  Code2,
  BarChart3,
  Cloud,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Briefcase
} from 'lucide-react';

const iconMap = {
  Cpu,
  Layers,
  Code2,
  BarChart3,
  Cloud,
  ShieldCheck
};

export default function CareerGoals({ setActiveTab }) {
  const { targetRoles, selectedRoleId, selectDreamRole } = useCareer();
  const { profile } = useProfile();
  const { showToast } = useToast();

  const handleGenerateRoadmap = (roleId) => {
    selectDreamRole(roleId);
    showToast('Target role updated! Career Roadmap synchronized.', 'success');
    setActiveTab('roadmap');
  };

  const studentSkillsLower = (profile.skills || []).map(s => s.trim().toLowerCase());

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-brand-500/15 via-purple-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-500 border border-brand-500/20 mb-3">
            <Target className="w-3.5 h-3.5" />
            <span>Target Role Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Career Goals & Target Role Selection
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Select your dream specialization. Match percentages are dynamically evaluated against your verified Student Profile skills.
          </p>
        </div>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {targetRoles.map((role) => {
          const Icon = iconMap[role.icon] || Code2;
          const isSelected = selectedRoleId === role.id;

          // Dynamically compute match score against studentSkills
          let dynamicMatch = 0;
          let matchedCount = 0;
          if (studentSkillsLower.length > 0 && role.requiredSkills.length > 0) {
            matchedCount = role.requiredSkills.filter(req => {
              const reqLow = req.name.toLowerCase();
              return studentSkillsLower.some(s => s === reqLow || s.includes(reqLow) || reqLow.includes(s));
            }).length;
            dynamicMatch = Math.round((matchedCount / role.requiredSkills.length) * 100);
          }

          return (
            <div
              key={role.id}
              onClick={() => selectDreamRole(role.id)}
              className={`glass-card glass-card-hover rounded-3xl p-6 border cursor-pointer relative flex flex-col justify-between transition-all ${
                isSelected
                  ? 'border-brand-500 ring-2 ring-brand-500/30 shadow-glow bg-brand-50/20 dark:bg-brand-950/20'
                  : 'border-slate-200/80 dark:border-white/10 hover:border-brand-500/50'
              }`}
            >
              {/* Selected Pill */}
              {isSelected && (
                <div className="absolute -top-3 right-6 bg-brand-600 text-white text-[11px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Selected Role</span>
                </div>
              )}

              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className={`p-3.5 rounded-2xl bg-gradient-to-tr ${role.color} text-white shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {role.difficulty}
                    </span>
                    <div className="text-xs font-bold text-brand-500 mt-1">
                      {studentSkillsLower.length === 0 ? '0% Match' : `${dynamicMatch}% Match`}
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {role.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                  {role.description}
                </p>

                {/* Salary & Openings */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="font-semibold">{role.medianSalary}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <Briefcase className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="truncate">{role.openPositions}</span>
                  </div>
                </div>

                {/* Key Skills Tags */}
                <div className="mt-4">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Priority Competencies ({role.requiredSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {role.requiredSkills.slice(0, 4).map((s) => (
                      <span
                        key={s.name}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {s.name}
                      </span>
                    ))}
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-500">
                      +{role.requiredSkills.length - 4} more
                    </span>
                  </div>
                </div>
              </div>

              {/* Generate Roadmap Button */}
              <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGenerateRoadmap(role.id);
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    isSelected
                      ? 'bg-brand-600 text-white shadow-glow hover:bg-brand-500'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-brand-950/40 hover:text-brand-500'
                  }`}
                >
                  <span>Generate Roadmap</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
