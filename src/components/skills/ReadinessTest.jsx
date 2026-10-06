import React, { useState, useEffect, useRef } from 'react';
import { useCareer } from '../../context/CareerContext';
import { useProfile } from '../../context/ProfileContext';
import { useToast } from '../../context/ToastContext';
import apiService from '../../services/api';
import CircularProgress from '../common/CircularProgress';
import confetti from 'canvas-confetti';
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
  TrendingUp,
  AlertTriangle,
  Lock,
  Zap,
  BookOpen,
  EyeOff
} from 'lucide-react';

export default function ReadinessTest() {
  const { testResults, setTestResults } = useCareer();
  const { profile } = useProfile();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [assessmentInfo, setAssessmentInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [inTestMode, setInTestMode] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [activeSection, setActiveSection] = useState('All');
  const [showExplanations, setShowExplanations] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Anti-cheating & Timer States
  const [secondsRemaining, setSecondsRemaining] = useState(20 * 60);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);
  const [tabWarningVisible, setTabWarningVisible] = useState(false);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const academicYear = profile?.academic_year || '1st Year';

  // 1. Fetch Assessment & Questions from Backend
  const loadAssessmentData = async () => {
    setLoading(true);
    try {
      const res = await apiService.getCurrentAssessment();
      if (res && res.success) {
        setAssessmentInfo(res.assessment);
        setQuestions(res.questions || []);

        if (res.activeAttempt) {
          setAttemptId(res.activeAttempt.attemptId);
          setInTestMode(true);
          setSecondsRemaining(res.activeAttempt.remainingSeconds || 20 * 60);
        }

        if (res.latestResult) {
          setTestResults(res.latestResult);
        }
      }
    } catch (err) {
      console.error('Error loading assessment:', err.message);
      showToast('Could not load assessment details from server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessmentData();
  }, [profile?.academic_year]);

  // 2. Anti-Cheating: Window Focus & Tab Visibility Monitor
  useEffect(() => {
    if (!inTestMode) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => prev + 1);
        setTabWarningVisible(true);
      }
    };

    const handleWindowBlur = () => {
      setTabSwitchCount((prev) => prev + 1);
      setTabWarningVisible(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [inTestMode]);

  // 3. Countdown Timer & Time Spent Tracker
  useEffect(() => {
    if (inTestMode) {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoSubmitOnTimeout();
            return 0;
          }
          return prev - 1;
        });

        setTimeSpentSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [inTestMode]);

  // Handle Start New Test
  const handleStartTest = async () => {
    try {
      setLoading(true);
      const res = await apiService.startAssessmentAttempt();
      if (res && res.success) {
        setAttemptId(res.attemptId);
        setUserAnswers({});
        setInTestMode(true);
        setShowExplanations(false);
        setTabSwitchCount(0);
        setTimeSpentSeconds(0);
        setSecondsRemaining(res.remainingSeconds || 20 * 60);
        const cur = await apiService.getCurrentAssessment();
        if (cur && cur.questions) {
          setQuestions(cur.questions);
        }
        showToast('Assessment started! Server timer active.', 'info');
      } else {
        showToast(res.message || 'Failed to start assessment attempt.', 'error');
      }
    } catch (err) {
      showToast('Error initiating assessment attempt: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Select Option Handler
  const handleSelectOption = (questionId, optionIdx) => {
    if (!inTestMode) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  // Submit Test Handler (Manual)
  const handleFinishTest = async () => {
    const answeredCount = Object.keys(userAnswers).length;
    const totalCount = questions.length;

    if (answeredCount < totalCount) {
      if (!confirm(`You have answered ${answeredCount} of ${totalCount} questions. Are you sure you want to submit now?`)) {
        return;
      }
    }

    await submitAssessmentPayload();
  };

  // Auto Submit on Timeout
  const handleAutoSubmitOnTimeout = async () => {
    showToast('Time expired! Auto-submitting assessment...', 'warning');
    await submitAssessmentPayload();
  };

  // Submit Answers to Backend Service
  const submitAssessmentPayload = async () => {
    if (submitting) return;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const res = await apiService.submitAssessmentAttempt({
        attemptId,
        answers: userAnswers,
        timeSpentSeconds,
        tabSwitchCount
      });

      if (res && res.success) {
        setTestResults(res);
        setInTestMode(false);
        setShowExplanations(true);
        if (res.questions && res.questions.length > 0) {
          setQuestions(res.questions);
        }

        if (res.rank === 'Platinum' || res.rank === 'Gold') {
          try {
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
          } catch (e) {}
        }

        showToast(`Assessment submitted! Result: ${res.score}% (${res.rank} Rank)`, 'success');
      } else {
        showToast(res.message || 'Failed to submit assessment.', 'error');
      }
    } catch (err) {
      showToast('Submission error: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Format seconds to MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const parseOptionsArray = (opts) => {
    if (Array.isArray(opts)) return opts;
    if (!opts) return [];
    if (typeof opts === 'string') {
      try {
        const parsed = JSON.parse(opts);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return opts.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    if (typeof opts === 'object') return Object.values(opts);
    return [];
  };

  const sections = ['All', 'Aptitude', 'Technical', 'Communication', 'Problem Solving'];
  const filteredQuestions =
    activeSection === 'All'
      ? questions
      : questions.filter((q) => {
          const cat = q.category || '';
          return cat === activeSection || cat.includes(activeSection) || (activeSection === 'Technical' && (cat.toLowerCase().includes('tech') || cat.toLowerCase().includes('mcq')));
        });

  const answeredCount = Object.keys(userAnswers).length;
  const totalCount = questions.length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
          Loading {academicYear} Standardized Assessment Engine...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Tab Switch Warning Toast/Banner */}
      {inTestMode && tabWarningVisible && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-400 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
            <span>
              <strong>Security Event Logged:</strong> Window focus lost or tab switched. (Switches: {tabSwitchCount})
            </span>
          </div>
          <button
            onClick={() => setTabWarningVisible(false)}
            className="text-xs font-bold underline text-amber-600 dark:text-amber-300"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-brand-500/15 via-purple-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-500 border border-brand-500/20 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{academicYear} Academic Year Standardized Assessment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {assessmentInfo?.title || `${academicYear} Career & Technical Readiness Assessment`}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Strict server-scored assessment evaluating Aptitude, Technical Architecture, and Workplace Communication for {academicYear} students.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {inTestMode ? (
              <div className="flex items-center gap-3">
                {/* Live Countdown Timer */}
                <div
                  className={`px-3 py-2 rounded-xl border flex items-center gap-2 font-mono font-bold text-xs ${
                    secondsRemaining < 180
                      ? 'bg-rose-500/10 border-rose-500 text-rose-500 animate-pulse'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                  }`}
                >
                  <Clock className="w-4 h-4 text-brand-500" />
                  <span>{formatTime(secondsRemaining)}</span>
                </div>

                <button
                  onClick={handleFinishTest}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 shadow-glow flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitting ? 'Submitting...' : `Submit (${answeredCount}/${totalCount})`}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleStartTest}
                className="px-6 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:opacity-95 shadow-glow flex items-center gap-2 transition-all"
              >
                <Zap className="w-4 h-4" />
                <span>{testResults?.taken ? 'Retake Fresh Assessment' : 'Start Assessment'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* INSTRUCTIONS SCREEN (When not in active test mode and no result taken yet or viewing rules) */}
      {!inTestMode && !testResults?.taken && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-6">
          <div className="flex items-center gap-2 text-brand-500">
            <BookOpen className="w-5 h-5" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Official Assessment Rules & Ranking Protocol
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-500 block">
                01. Authoritative Assessment Structure
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Contains 15 curated questions specifically designed for <strong>{academicYear}</strong> candidates across Aptitude, Technical CS, Communication, and Problem Solving.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500 block">
                02. Server-Enforced Timer & Security
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                20-minute strict time limit managed by backend services. Window focus and tab switches are logged to ensure integrity.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 block">
                03. Zero Client Key Exposure
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Answer keys and explanations remain securely on backend database servers during the attempt and are only transmitted post-submission.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-500 block">
                04. Deterministic Rank Thresholds
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>Platinum Tier:</strong> Score ≥ 85% &nbsp;|&nbsp; <strong>Gold Tier:</strong> Score ≥ 70% &nbsp;|&nbsp; <strong>Silver Tier:</strong> Score &lt; 70%.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleStartTest}
              className="px-8 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:opacity-95 shadow-glow flex items-center gap-2 transition-all"
            >
              <span>I Understand — Begin Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* OFFICIAL RESULT REPORT VIEW */}
      {!inTestMode && testResults && testResults.taken && (
        <div className="space-y-6 animate-fade-in">
          {/* Main Score & Rank Badge Overview */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            <div className="space-y-4 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  Official Server-Scored Report
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {academicYear} Assessment
                </span>
              </div>

              <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Score: {testResults.score}%
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Answered {testResults.correctCount || Math.round((testResults.score / 100) * 15)} of {testResults.totalQuestions || 15} questions correctly.
                </p>
              </div>

              {/* SLEEK PROFESSIONAL RANK BADGE */}
              <div className="pt-1">
                {testResults.rank === 'Platinum' && (
                  <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-teal-500/15 to-emerald-500/20 border border-cyan-500/40 text-cyan-400 shadow-glow">
                    <Sparkles className="w-5 h-5 text-cyan-400 animate-spin-slow" />
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block">
                        Tier 1 Distinction
                      </span>
                      <span className="text-sm font-extrabold text-white">
                        PLATINUM TIER QUALIFIED
                      </span>
                    </div>
                  </div>
                )}

                {testResults.rank === 'Gold' && (
                  <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-orange-500/20 border border-amber-500/40 text-amber-400 shadow-glow">
                    <Award className="w-5 h-5 text-amber-400" />
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                        Core Placement Tier
                      </span>
                      <span className="text-sm font-extrabold text-white">
                        GOLD TIER QUALIFIED
                      </span>
                    </div>
                  </div>
                )}

                {(!testResults.rank || testResults.rank === 'Silver') && (
                  <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-slate-500/20 via-zinc-500/15 to-slate-600/20 border border-slate-400/30 text-slate-300">
                    <ShieldCheck className="w-5 h-5 text-slate-400" />
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                        Foundational Level
                      </span>
                      <span className="text-sm font-extrabold text-white">
                        SILVER TIER QUALIFIED
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 4 Domain Performance Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Aptitude</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">{testResults.aptitudeScore}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Technical</span>
                  <span className="text-base font-extrabold text-brand-500">{testResults.techScore}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Communication</span>
                  <span className="text-base font-extrabold text-emerald-500">{testResults.commScore}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Problem Solving</span>
                  <span className="text-base font-extrabold text-purple-500">{testResults.problemSolvingScore || testResults.score}%</span>
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <CircularProgress
                value={testResults.score}
                size={180}
                strokeWidth={15}
                label="Readiness Index"
                sublabel={`${testResults.rank || 'Silver'} Tier`}
              />
            </div>
          </div>

          {/* Identified Strengths & Weaknesses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card rounded-3xl p-6 border border-emerald-500/20 bg-emerald-500/5 space-y-4">
              <div className="flex items-center gap-2 text-emerald-500">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Identified Strengths
                </h3>
              </div>
              <ul className="space-y-2.5">
                {(testResults.strengths || []).map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-rose-500/20 bg-rose-500/5 space-y-4">
              <div className="flex items-center gap-2 text-rose-500">
                <XCircle className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Areas for Improvement
                </h3>
              </div>
              <ul className="space-y-2.5">
                {(testResults.weaknesses || []).map((weak, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{weak}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-brand-500/20 bg-brand-500/5 space-y-4">
            <div className="flex items-center gap-2 text-brand-500">
              <Lightbulb className="w-5 h-5" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Targeted Action Steps for {academicYear} Placement Readiness
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(testResults.recommendations || []).map((rec, idx) => (
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

      {/* QUIZ INTERACTIVE QUESTION LIST (During test or after submission for review) */}
      {(inTestMode || showExplanations) && (
        <div className="space-y-4 pt-4">
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
              Showing {filteredQuestions.length} Questions for {academicYear}
            </span>
          </div>

          {/* Question Cards */}
          <div className="space-y-4">
            {filteredQuestions.map((q, qIndex) => {
              const selectedOpt = userAnswers[q.id] !== undefined ? userAnswers[q.id] : (q.selectedOption !== undefined ? q.selectedOption : undefined);
              const isAnswered = selectedOpt !== undefined && selectedOpt !== null && selectedOpt !== -1;

              return (
                <div
                  key={q.id || qIndex}
                  className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-brand-500/10 text-brand-500 text-xs font-bold flex items-center justify-center">
                        {qIndex + 1}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {q.category}
                      </span>
                    </div>

                    {showExplanations && (
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          q.isCorrect || selectedOpt === q.correctOption
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        }`}
                      >
                        {q.isCorrect || selectedOpt === q.correctOption ? 'Correct' : 'Incorrect'}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                    {q.question}
                  </h3>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {parseOptionsArray(q.options).map((opt, optIdx) => {
                      const isChosen = selectedOpt === optIdx;
                      const isCorrect = showExplanations && optIdx === q.correctOption;
                      const isWrongChoice = showExplanations && isChosen && !isCorrect;

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={!inTestMode}
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

                  {/* Detailed Concept Explanation (Unlocked only post-submission) */}
                  {showExplanations && q.explanation && (
                    <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5 animate-fade-in">
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-amber-500 font-bold">Concept & Explanation:</strong> {q.explanation}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Footer when actively taking test */}
          {inTestMode && (
            <div className="p-6 rounded-3xl glass-card border border-brand-500/30 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-400 font-medium">
                Answered <strong className="text-slate-900 dark:text-white font-bold">{answeredCount}</strong> of <strong className="text-slate-900 dark:text-white font-bold">{totalCount}</strong> questions
              </span>
              <button
                onClick={handleFinishTest}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:opacity-95 shadow-glow transition-all disabled:opacity-50"
              >
                {submitting ? 'Calculating Server Score...' : 'Submit Assessment'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
