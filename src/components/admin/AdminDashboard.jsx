import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { apiService } from '../../services/api';
import {
  Users,
  Building2,
  Briefcase,
  FileCheck,
  ShieldAlert,
  Database
} from 'lucide-react';

export default function AdminDashboard({ setActiveTab }) {
  const { isDark } = useTheme();

  const [stats, setStats] = useState({
    studentsCount: 0,
    companiesCount: 0,
    jobsCount: 0,
    internshipsCount: 0,
    applicationsCount: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminStats() {
      setLoading(true);
      try {
        const [stRes, compRes, jobsRes, intRes, appRes] = await Promise.all([
          apiService.getAdminStudents().catch(() => ({ success: true, students: [] })),
          apiService.getCompanies().catch(() => ({ success: true, companies: [] })),
          apiService.getJobs().catch(() => ({ success: true, jobs: [] })),
          apiService.getInternships().catch(() => ({ success: true, internships: [] })),
          apiService.getAdminApplications().catch(() => ({ success: true, applications: [] }))
        ]);

        setStats({
          studentsCount: (stRes.students || []).length,
          companiesCount: (compRes.companies || []).length,
          jobsCount: (jobsRes.jobs || []).length,
          internshipsCount: (intRes.internships || []).length,
          applicationsCount: (appRes.applications || []).length
        });
      } catch (err) {
        console.warn('Error loading admin dashboard stats:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadAdminStats();
  }, []);

  const kpiCards = [
    {
      title: 'Total Students',
      value: stats.studentsCount,
      subtext: 'Registered Supabase Accounts',
      icon: Users,
      color: 'text-brand-500',
      bg: 'bg-brand-500/10'
    },
    {
      title: 'Total Companies',
      value: stats.companiesCount,
      subtext: 'Database Company Records',
      icon: Building2,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    {
      title: 'Published Jobs',
      value: stats.jobsCount,
      subtext: 'Active Job Openings',
      icon: Briefcase,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10'
    },
    {
      title: 'Published Internships',
      value: stats.internshipsCount,
      subtext: 'Active Internship Drives',
      icon: Briefcase,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    },
    {
      title: 'Total Applications',
      value: stats.applicationsCount,
      subtext: 'Submitted Applications',
      icon: FileCheck,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    }
  ];

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-purple-500/20 via-brand-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Executive Administration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Admin Platform Overview
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Real-time database metrics calculated directly from Supabase PostgreSQL tables.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('user-management')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-500 shadow-glow flex items-center gap-2 transition-all cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>View Registered Students</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="glass-card glass-card-hover rounded-3xl p-5 border border-slate-200/80 dark:border-white/10 flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl ${card.bg} ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {loading ? '...' : card.value}
                </span>
                <p className="text-[11px] font-semibold text-emerald-500 mt-1">
                  {card.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
