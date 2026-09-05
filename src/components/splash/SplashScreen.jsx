import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Rocket } from 'lucide-react';

export default function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const completedRef = useRef(false);

  const triggerComplete = () => {
    if (!completedRef.current) {
      completedRef.current = true;
      onCompleteRef.current?.();
    }
  };

  useEffect(() => {
    // Exactly 2.5 seconds duration (25ms * 100 steps = 2500ms, within 2–3 seconds)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(triggerComplete, 100);
          return 100;
        }
        return prev + 1;
      });
    }, 25);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-white via-slate-50 to-indigo-50/40 text-slate-900 overflow-hidden px-4 select-none animate-fade-in">
      {/* Soft light-theme ambient background glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-indigo-200/30 filter blur-[140px] pointer-events-none -translate-y-24" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-teal-200/25 filter blur-[120px] pointer-events-none translate-x-32 translate-y-32" />

      <div className="relative z-10 flex flex-col items-center max-w-md w-full text-center">
        {/* Animated Center Logo Reveal */}
        <div className="relative mb-6">
          <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-teal-400/20 filter blur-xl animate-pulse" />
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white border border-slate-200/90 shadow-2xl flex items-center justify-center ring-1 ring-slate-900/5">
            <Rocket
              className="w-12 h-12 text-indigo-600 animate-bounce"
              style={{ animationDuration: '2.4s' }}
            />
            <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        </div>

        {/* Brand Name & Tagline */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
          CareerPilot{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 bg-clip-text text-transparent">
            AI
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-medium tracking-wide max-w-xs mb-8">
          Your Intelligent Career Growth Companion
        </p>

        {/* Loading Progress Bar & Percentage */}
        <div className="w-full max-w-xs space-y-2.5">
          <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden border border-slate-300/50 p-0.5 shadow-inner">
            <div
              className="bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 h-full rounded-full transition-all duration-75 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
              Initializing AI Engine...
            </span>
            <span className="font-bold text-indigo-600">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
