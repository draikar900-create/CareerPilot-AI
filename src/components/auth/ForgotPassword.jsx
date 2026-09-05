import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const { resetPassword, setAuthView } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSentSuccess(true);
      showToast('Password reset link sent to your email.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to send reset link', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (sentSuccess) {
    return (
      <div className="w-full max-w-md mx-auto glass-card rounded-3xl p-8 shadow-2xl border border-slate-200/80 dark:border-white/10 text-center">
        <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 mb-4 ring-1 ring-emerald-500/20">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
          Reset Email Sent
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
          We have sent password reset instructions to <strong className="text-brand-500">{email}</strong>. Please check your inbox and follow the link to reset your password.
        </p>
        <button
          onClick={() => setAuthView('login')}
          className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-brand-600 hover:bg-brand-500 shadow-glow transition-all"
        >
          Return to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto glass-card rounded-3xl p-8 shadow-2xl border border-slate-200/80 dark:border-white/10">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Forgot Password
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Enter your registered email to receive a password reset link
        </p>
      </div>

      <form onSubmit={handleSendEmail} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Registered Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:opacity-95 shadow-glow flex items-center justify-center gap-2"
        >
          {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => setAuthView('login')}
          className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </button>
      </div>
    </div>
  );
}
