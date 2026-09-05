import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { evaluatePasswordStrength } from '../../utils/helpers';
import { Mail, KeyRound, Lock, Eye, EyeOff, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const { setAuthView } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState(1); // 1: Email, 2: OTP Received prompt, 3: Verify OTP, 4: New Password, 5: Confirm Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordStrength = evaluatePasswordStrength(newPassword);

  // Step 1: Enter Email -> Step 2: Receive OTP & advance to Step 3
  const handleSendEmail = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(3); // Advance to verification (Step 2 was the sending/receipt)
      showToast(`Recovery code sent to ${email}`, 'success');
    }, 600);
  };

  // Step 3: Verify OTP -> Step 4: Create New Password
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.length < 4) {
      showToast('Please enter the verification code', 'error');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(4);
      showToast('Code verified! Set your new password.', 'success');
    }, 500);
  };

  // Step 4 -> Step 5: Confirm Password & Submit
  const handleSetPassword = (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters long', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('Password successfully reset! You can now sign in.', 'success');
      setAuthView('login');
    }, 800);
  };

  return (
    <div className="w-full max-w-md mx-auto glass-card rounded-3xl p-8 shadow-2xl border border-slate-200/80 dark:border-white/10">
      {/* Progress Steps Indicator */}
      <div className="flex items-center justify-between mb-6 px-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= s
                  ? 'bg-brand-500 text-white shadow-glow'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              {s}
            </div>
            {s < 5 && (
              <div
                className={`w-5 sm:w-8 h-0.5 transition-all ${
                  step > s ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Reset Password
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {step === 1 && 'Step 1: Enter your registered email address'}
          {step === 3 && 'Step 2 & 3: Enter the recovery OTP code received'}
          {step >= 4 && 'Step 4 & 5: Create and confirm your new password'}
        </p>
      </div>

      {/* Step 1: Email */}
      {step === 1 && (
        <form onSubmit={handleSendEmail} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email Address"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl font-semibold text-sm text-white bg-brand-600 hover:bg-brand-500 shadow-glow flex items-center justify-center gap-2"
          >
            {loading ? 'Sending...' : 'Send Recovery OTP'}
          </button>
        </form>
      )}

      {/* Step 3: Enter OTP */}
      {step === 3 && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Enter 6-Digit OTP
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-Digit OTP"
                maxLength={6}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Hint: Any 6 digits for testing</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl font-semibold text-sm text-white bg-brand-600 hover:bg-brand-500 shadow-glow flex items-center justify-center gap-2"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      )}

      {/* Step 4 & 5: New Password & Confirm */}
      {step >= 4 && (
        <form onSubmit={handleSetPassword} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Step 4: Create New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {newPassword && (
              <div className="mt-1.5 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Strength:</span>
                <span className={`font-bold ${passwordStrength.text}`}>{passwordStrength.label}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Step 5: Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:opacity-95 shadow-glow flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'Updating...' : 'Update & Confirm Password'}
          </button>
        </form>
      )}

      {/* Back to Sign in */}
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
