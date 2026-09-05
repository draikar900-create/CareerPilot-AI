import React, { useState } from 'react';
import { READINESS_QUIZ_QUESTIONS } from '../../data/mockData';
import { useCareer } from '../../context/CareerContext';
import { useToast } from '../../context/ToastContext';
import CircularProgress from '../common/CircularProgress';
import {
  CheckCircle,
  HelpCircle,
  Clock,
  Award,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

export default function ReadinessTest() {
  const { testResults, submitTestAnswers } = useCareer();
  const { showToast } = useToast();

  const [inTestMode, setInTestMode] = useState(false);
  const [activeSection, setActiveSection] = useState('All'); // 'All' | 'Aptitude' | 'Technical MCQs' | 'Communication'
  const [userAnswers, setUserAnswers] = useState({});
  const [showExplanations, setShowExplanations] = useState(false);

  const sections = ['All', 'Aptitude', 'Technical MCQs', 'Communication'];

  const filteredQuestions =
    activeSection === 'All'
      ? READINESS_QUIZ_QUESTIONS
      : READINESS_QUIZ_QUESTIONS.filter((q) => q.section === activeSection);

  const answeredCount = Object.keys(userAnswers).length;
  const totalCount = READINESS_QUIZ_QUESTIONS.length;

  const handleSelectOption = (questionId, optionIdx) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  const handleFinishTest = () => {
    if (answeredCount < 10) {
      if (!confirm(`You have answered ${answeredCount} of ${totalCount} questions. Are you sure you want to submit now?`)) {
        return;
      }
    }
    submitTestAnswers(userAnswers);
    setInTestMode(false);
    setShowExplanations(true);
  };

  const startNewTest = () => {
    setUserAnswers({});
    setInTestMode(true);
    setShowExplanations(false);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-brand-500/15 via-purple-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-500 border border-brand-500/20 mb-2">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Standardized Assessment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Multi-Domain Career Readiness Assessment
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Evaluate your problem solving across Quantitative Aptitude, Technical Architecture, and Professional Workplace Communication.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {inTestMode ? (
              <button
                onClick={handleFinishTest}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 shadow-glow flex items-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Assessment ({answeredCount}/{totalCount})</span>
              </button>
            ) : (
              <button
                onClick={startNewTest}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:opacity-95 shadow-glow flex items-center gap-2 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Take Fresh Test</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* RESULT REPORT VIEW (When not actively taking the test) */}
      {!inTestMode && testResults && testResults.taken && (
        <div className="space-y-6 animate-fade-in">
          {/* Main Score Overview */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Official Assessment Report
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Readiness Score: {testResults.score}%
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                Based on your performance across 15 core competency evaluations, you qualify for competitive junior engineering and internship applicant pools.
              </p>

              {/* 3 Domain Pills */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80">
                  <span className="text-[11px] text-slate-400 font-semibold block">Aptitude</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">{testResults.aptitudeScore}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80">
                  <span className="text-[11px] text-slate-400 font-semibold block">Technical</span>
                  <span className="text-base font-bold text-brand-500">{testResults.techScore}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80">
                  <span className="text-[11px] text-slate-400 font-semibold block">Communication</span>
                  <span className="text-base font-bold text-emerald-500">{testResults.commScore}%</span>
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <CircularProgress
                value={testResults.score}
                size={180}
                strokeWidth={15}
                label="Overall Score"
                sublabel="Tier 1 Qualified"
              />
            </div>
          </div>

          {/* Strengths & Weaknesses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="glass-card rounded-3xl p-6 border border-emerald-500/20 bg-emerald-500/5 space-y-4">
              <div className="flex items-center gap-2 text-emerald-500">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Identified Strengths
                </h3>
              </div>
              <ul className="space-y-2.5">
                {testResults.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="glass-card rounded-3xl p-6 border border-rose-500/20 bg-rose-500/5 space-y-4">
              <div className="flex items-center gap-2 text-rose-500">
                <XCircle className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Areas for Improvement
                </h3>
              </div>
              <ul className="space-y-2.5">
                {testResults.weaknesses.map((weak, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{weak}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Tailored Recommendations */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-brand-500/20 bg-brand-500/5 space-y-4">
            <div className="flex items-center gap-2 text-brand-500">
              <Lightbulb className="w-5 h-5" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Targeted AI Recommendations
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {testResults.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex flex-col justify-between space-y-2"
                >
                  <span className="font-bold text-brand-500 uppercase text-[10px] tracking-wider">
                    Action Step 0{idx + 1}
                  </span>
                  <p className="leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* QUIZ INTERACTIVE QUESTION LIST */}
      {(inTestMode || showExplanations) && (
        <div className="space-y-4">
          {/* Section Filter Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              {sections.map((sec) => (
                <button
                  key={sec}
                  onClick={() => setActiveSection(sec)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeSection === sec
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-400 font-medium">
              Showing {filteredQuestions.length} Questions
            </span>
          </div>

          {/* Question Cards */}
          <div className="space-y-4">
            {filteredQuestions.map((q, qIndex) => {
              const selectedOpt = userAnswers[q.id];
              const isAnswered = selectedOpt !== undefined;

              return (
                <div
                  key={q.id}
                  className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-brand-500/10 text-brand-500 text-xs font-bold flex items-center justify-center">
                        {q.id}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {q.section}
                      </span>
                    </div>

                    {showExplanations && (
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          selectedOpt === q.answer
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-rose-500/10 text-rose-500'
                        }`}
                      >
                        {selectedOpt === q.answer ? 'Correct' : 'Incorrect'}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                    {q.question}
                  </h3>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isChosen = selectedOpt === optIdx;
                      const isCorrect = showExplanations && optIdx === q.answer;
                      const isWrongChoice = showExplanations && isChosen && !isCorrect;

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`p-3.5 rounded-xl border text-xs font-medium text-left transition-all flex items-center justify-between ${
                            isCorrect
                              ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-600 dark:text-emerald-300 font-bold'
                              : isWrongChoice
                              ? 'bg-rose-500/15 border-rose-500/50 text-rose-500'
                              : isChosen
                              ? 'bg-brand-500/10 border-brand-500 text-brand-600 dark:text-brand-400 font-semibold'
                              : 'bg-white/40 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-brand-500/30'
                          }`}
                        >
                          <span>{opt}</span>
                          {isChosen && <CheckCircle2 className="w-4 h-4 shrink-0 text-brand-500" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Detailed Explanation */}
                  {showExplanations && (
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <strong>Concept Explanation:</strong> {q.explanation}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Footer if in test mode */}
          {inTestMode && (
            <div className="p-6 rounded-3xl glass-card border border-brand-500/30 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-400">
                Answered <strong>{answeredCount}</strong> of <strong>{totalCount}</strong> questions
              </span>
              <button
                onClick={handleFinishTest}
                className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:opacity-95 shadow-glow"
              >
                Submit & Calculate Score
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
