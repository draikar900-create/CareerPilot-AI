import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { KeyRound, ArrowRight, RefreshCw, Mail } from 'lucide-react';

export default function OtpVerification({ onVerificationSuccess }) {
  const { verifyOtp, generatedOtp, pendingSignupData, setAuthView } = useAuth();
  const { showToast } = useToast();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const id = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(id);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);

    const focusIdx = Math.min(pasted.length, 5);
    if (inputRefs.current[focusIdx]) {
      inputRefs.current[focusIdx].focus();
    }
  };

  const handleVerify = (e) => {
    e?.preventDefault();
    const entered = otp.join('');
    if (entered.length < 6) {
      showToast('Please enter all 6 digits of the verification code', 'error');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const success = verifyOtp(entered);
      if (success) {
        showToast('Email verified successfully! Setting up your student profile...', 'success');
        if (onVerificationSuccess) {
          onVerificationSuccess();
        }
      } else {
        showToast('Invalid OTP code. Please check and try again.', 'error');
      }
    }, 700);
  };

  const handleResend = () => {
    if (!canResend) return;
    setTimer(45);
    setCanResend(false);
    showToast(`New 6-digit code re-sent to ${pendingSignupData?.email || 'your email'}`, 'info');
  };

  return (
    <div className="w-full max-w-md mx-auto glass-card rounded-3xl p-8 shadow-2xl border border-slate-200/80 dark:border-white/10 text-center">
      <div className="inline-flex p-3 rounded-2xl bg-brand-500/10 text-brand-500 mb-3 ring-1 ring-brand-500/20">
        <Mail className="w-6 h-6" />
      </div>

      <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
        Email OTP Verification
      </h2>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
        We sent a 6-digit verification code to <br />
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {pendingSignupData?.email || 'your email address'}
        </span>
      </p>

      {generatedOtp && (
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 font-mono">
          <span>Verification Code: <strong>{generatedOtp}</strong></span>
          <button
            type="button"
            onClick={() => {
              const digits = generatedOtp.slice(0, 6).split('');
              setOtp(digits);
            }}
            className="ml-1 text-[11px] underline font-sans hover:text-brand-500 cursor-pointer"
          >
            Auto-fill
          </button>
        </div>
      )}

      {/* 6 Digit Input Group */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 my-6">
        {otp.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => (inputRefs.current[idx] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all shadow-sm"
          />
        ))}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:opacity-95 shadow-glow transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Verify OTP</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2 pt-2">
          <span>Didn't receive code?</span>
          {canResend ? (
            <button
              onClick={handleResend}
              className="font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Resend OTP</span>
            </button>
          ) : (
            <span className="text-slate-400">Resend in {timer}s</span>
          )}
        </div>
      </div>
    </div>
  );
}
