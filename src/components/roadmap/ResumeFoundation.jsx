import React, { useState } from 'react';
import { RESUME_FOUNDATION_MODULES } from '../../data/mockData';
import {
  FileText,
  CheckCircle2,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function ResumeFoundation() {
  const [activeModule, setActiveModule] = useState('rf1');
  const [completedItems, setCompletedItems] = useState({});

  const toggleItem = (itemId) => {
    setCompletedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-amber-500/30 bg-amber-500/5 relative overflow-hidden space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Semester 1 Priority Feature</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Resume Foundation for First-Year Students
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Build your first high-impact, ATS-friendly technical resume before applying to hackathons & freshman explore internships.
          </p>
        </div>

        <a
          href="#template"
          onClick={(e) => {
            e.preventDefault();
            alert('Downloading standard Google/Harvard style LaTeX/Word 1-page template...');
          }}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-md flex items-center gap-2 self-start sm:self-auto shrink-0 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Download 1-Page Template</span>
        </a>
      </div>

      {/* 4 Core Pillars Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {RESUME_FOUNDATION_MODULES.map((mod) => {
          const isActive = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod.id)}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-amber-500/15 border-amber-500/50 shadow-sm'
                  : 'bg-white/40 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 hover:border-amber-500/30'
              }`}
            >
              <div>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                  Foundation Pillar
                </span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                  {mod.title}
                </h4>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
                {mod.summary}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Pillar Details Card */}
      {(() => {
        const current = RESUME_FOUNDATION_MODULES.find(m => m.id === activeModule) || RESUME_FOUNDATION_MODULES[0];
        return (
          <div className="p-5 sm:p-6 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-amber-500/20 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>{current.title} Masterclass</span>
            </h3>

            {/* Tips list */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Key Formatting Directives
              </span>
              <ul className="space-y-2">
                {(Array.isArray(current?.tips) ? current.tips : []).map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Interactive Checklist */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Pillar Completion Checklist (Click to check off)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(Array.isArray(current?.checklist) ? current.checklist : []).map((item, idx) => {
                  const checkKey = `${current.id}-${idx}`;
                  const isDone = !!completedItems[checkKey];
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleItem(checkKey)}
                      className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 text-left transition-all ${
                        isDone
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-500/40'
                      }`}
                    >
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${isDone ? 'text-emerald-500 fill-emerald-500/20' : 'text-slate-400'}`} />
                      <span className="truncate">{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
