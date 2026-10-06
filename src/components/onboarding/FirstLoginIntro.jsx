import React, { useState } from 'react';
import { useProfile } from '../../context/ProfileContext';
import {
  Sparkles,
  Rocket,
  LineChart,
  Brain,
  Milestone,
  Briefcase,
  Bot,
  ArrowRight,
  CheckCircle2,
  X
} from 'lucide-react';

export default function FirstLoginIntro({ onComplete }) {
  const { completeIntro, profile } = useProfile();
  const [activeSlide, setActiveSlide] = useState(0);

  const features = [
    {
      icon: LineChart,
      title: 'Skill Intelligence & Gap Audit',
      badge: 'Competency Analysis',
      description: 'Analyze your technical skills against real engineering role requirements and identify actionable skill gaps.',
      color: 'from-blue-500/20 to-indigo-500/20',
      iconColor: 'text-blue-500'
    },
    {
      icon: Brain,
      title: 'Machine Learning Placement Engine',
      badge: 'Predictive Analytics',
      description: 'Calculate statistical placement readiness probabilities using authentic machine learning algorithms trained on student metrics.',
      color: 'from-purple-500/20 to-indigo-500/20',
      iconColor: 'text-purple-500'
    },
    {
      icon: Milestone,
      title: 'AI-Generated Career Roadmaps',
      badge: 'Structured Learning',
      description: 'Get customized phase-by-phase learning paths with curated resources and projects tailored to your target role.',
      color: 'from-emerald-500/20 to-teal-500/20',
      iconColor: 'text-emerald-500'
    },
    {
      icon: Briefcase,
      title: 'Campus & Off-Campus Opportunities',
      badge: 'Placement Drives',
      description: 'Explore curated job openings, internships, hackathons, and placement drives matched to your branch and academic year.',
      color: 'from-amber-500/20 to-orange-500/20',
      iconColor: 'text-amber-500'
    },
    {
      icon: Bot,
      title: '24/7 AI Career Companion',
      badge: 'Powered by Gemini AI',
      description: 'Ask questions, refine your resume, practice mock interviews, and receive personalized career advice anytime.',
      color: 'from-rose-500/20 to-pink-500/20',
      iconColor: 'text-rose-500'
    }
  ];

  const handleFinishIntro = async () => {
    await completeIntro();
    if (onComplete) onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl glass-card rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-white/10 shadow-2xl relative overflow-hidden bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">
        {/* Background Accent Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-brand-500/20 via-indigo-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500 ring-1 ring-brand-500/20">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">Welcome to CareerPilot</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Platform Overview & Capability Tour</p>
            </div>
          </div>

          <button
            onClick={handleFinishIntro}
            className="text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
          >
            <span>Skip Tour</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Slide Feature View */}
        <div className="min-h-[220px] flex flex-col justify-center space-y-4 my-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 border border-brand-500/20">
              {features[activeSlide].badge}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Feature {activeSlide + 1} of {features.length}
            </span>
          </div>

          <div className="flex items-start gap-4">
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${features[activeSlide].color} ${features[activeSlide].iconColor} shrink-0 shadow-sm`}>
              {React.createElement(features[activeSlide].icon, { className: 'w-8 h-8' })}
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {features[activeSlide].title}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {features[activeSlide].description}
              </p>
            </div>
          </div>
        </div>

        {/* Slide Pagination Indicators */}
        <div className="flex items-center justify-center gap-2 py-4">
          {features.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeSlide === idx ? 'w-8 bg-brand-500' : 'w-2 bg-slate-300 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
          <button
            onClick={() => setActiveSlide(prev => Math.max(0, prev - 1))}
            disabled={activeSlide === 0}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            ← Previous
          </button>

          {activeSlide < features.length - 1 ? (
            <button
              onClick={() => setActiveSlide(prev => prev + 1)}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>Next Capability</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinishIntro}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Start Onboarding</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
