import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useCareer } from '../../context/CareerContext';
import { useProfile } from '../../context/ProfileContext';
import { useTheme } from '../../context/ThemeContext';
import { Target, AlertCircle } from 'lucide-react';

export default function IndustryComparisonChart({ setActiveTab }) {
  const { currentRole, skillComparison } = useCareer();
  const { profile } = useProfile();
  const { isDark } = useTheme();

  // If no role or no skills, render empty state
  if (!currentRole || !profile.skills || profile.skills.length === 0) {
    return (
      <div className="w-full h-72 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/30 dark:bg-slate-900/30">
        <Target className="w-10 h-10 text-slate-400 mb-2 opacity-60" />
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          Industry Comparison Not Available
        </h4>
        <p className="text-xs text-slate-400 max-w-xs mt-1">
          {!currentRole
            ? 'Select a target career role to benchmark your competencies.'
            : 'Add technical skills in your Student Profile to generate this chart.'}
        </p>
        <button
          onClick={() => setActiveTab(!currentRole ? 'career-goals' : 'profile')}
          className="mt-3 text-xs font-bold text-brand-500 hover:underline"
        >
          {!currentRole ? 'Go to Career Goals →' : 'Complete Student Profile →'}
        </button>
      </div>
    );
  }

  // Calculate student level dynamically based on match percentage ratio
  const benchmarkKeys = Object.keys(currentRole.industryBenchmark || {});
  const studentBase = Math.min(100, Math.max(10, skillComparison.matchPercentage));

  const data = benchmarkKeys.map((key, idx) => {
    const industryVal = currentRole.industryBenchmark[key];
    // Dynamic score scaled to matchPercentage
    const variance = (idx % 2 === 0 ? 5 : -5);
    const studentVal = Math.min(100, Math.max(0, Math.round(studentBase * 0.9 + variance)));

    return {
      name: key,
      'Your Current Level': studentVal,
      'Industry Requirement': industryVal
    };
  });

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          barCategoryGap="25%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? '#1e293b' : '#f1f5f9'}
            vertical={false}
          />
          <XAxis
            dataKey="name"
            stroke={isDark ? '#94a3b8' : '#64748b'}
            fontSize={11}
            tickLine={false}
          />
          <YAxis
            stroke={isDark ? '#94a3b8' : '#64748b'}
            fontSize={11}
            tickLine={false}
            domain={[0, 100]}
            unit="%"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#0f172a' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
              borderRadius: '0.75rem',
              color: isDark ? '#f8fafc' : '#0f172a',
              fontSize: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
          />
          <Bar
            dataKey="Your Current Level"
            fill="#6366f1"
            radius={[6, 6, 0, 0]}
          />
          <Bar
            dataKey="Industry Requirement"
            fill={isDark ? '#334155' : '#cbd5e1'}
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
