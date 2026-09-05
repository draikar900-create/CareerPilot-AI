import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function evaluatePasswordStrength(password) {
  if (!password) return { label: '', score: 0, color: 'bg-slate-300', text: '' };
  
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) {
    return { label: 'Weak', score: 25, color: 'bg-rose-500', text: 'text-rose-500' };
  } else if (score === 2 || score === 3) {
    return { label: 'Medium', score: 65, color: 'bg-amber-500', text: 'text-amber-500' };
  } else {
    return { label: 'Strong', score: 100, color: 'bg-emerald-500', text: 'text-emerald-500' };
  }
}

export function getInitials(name) {
  if (!name) return 'CP';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}
