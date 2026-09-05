import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Mail, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';

export default function OtpVerification({ onVerificationSuccess }) {
  const { setAuthView, resetPassword } = useAuth();
  const { showToast } = useToast();
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    setResending(true);
    setTimeout(() => {
      setResending(false);
      showToast('Verification email resent. Please check your inbox.', 'info');
    }, 800);
  };

  return (
    <div className="w-full max-w-md mx-auto glass-card rounded-3xl p-8 shadow-2xl border border-slate-200/80 dark:border-white/10 text-center">
      <div className="inline-flex p-3 rounded-2xl bg-brand-500/10 text-brand-500 mb-4 ring-1 ring-brand-500/20">
        <Mail className="w-8 h-8" />
      </div>

      <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
        Email Verification
      </h2>
      
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
        We have dispatched an activation link to your email address. Please click the link inside your email to complete registration.
      </p>

      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 mb-6 flex items-center gap-3 text-left">
        <CheckCircle className="w-5 h-5 text-brand-500 shrink-0" />
        <span>After confirming your email in your inbox, return here and sign in with your credentials.</span>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleResend}
          disabled={resending}
          className="w-full py-2.5 px-4 rounded-xl font-medium text-sm text-slate-700 dark:text-slate-200 bg-white/70 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
          <span>{resending ? 'Resending...' : 'Resend Verification Email'}</span>
        </button>

        <button
          onClick={() => setAuthView('login')}
          className="w-full py-2.5 px-4 rounded-xl font-medium text-sm text-brand-600 dark:text-brand-400 hover:underline flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </button>
      </div>
    </div>
  );
}
