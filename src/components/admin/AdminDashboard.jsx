import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { apiService } from '../../services/api';
import {
  Users,
  Building2,
  Briefcase,
  FileCheck,
  ShieldCheck,
  Mail,
  ArrowRight,
  Database,
  BarChart3
} from 'lucide-react';

export default function AdminDashboard({ setActiveTab }) {
  const { isDark } = useTheme();

  const [stats, setStats] = useState({
    studentsCount: 0,
    companiesCount: 0,
    jobsCount: 0,
    internshipsCount: 0,
    applicationsCount: 0,
    contactsCount: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminStats() {
      setLoading(true);
      try {
        const [stRes, compRes, jobsRes, intRes, appRes, contRes] = await Promise.all([
          apiService.getAdminStudents().catch(() => ({ success: true, students: [] })),
          apiService.getCompanies().catch(() => ({ success: true, companies: [] })),
          apiService.getJobs().catch(() => ({ success: true, jobs: [] })),
          apiService.getInternships().catch(() => ({ success: true, internships: [] })),
          apiService.getAdminApplications().catch(() => ({ success: true, applications: [] })),
          apiService.getAdminContacts().catch(() => ({ success: true, contacts: [] }))
        ]);

        setStats({
          studentsCount: (stRes?.students || []).length,
          companiesCount: (compRes?.companies || []).length,
          jobsCount: (jobsRes?.jobs || []).length,
          internshipsCount: (intRes?.internships || []).length,
          applicationsCount: (appRes?.applications || []).length,
          contactsCount: (contRes?.contacts || []).length
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
      subtext: 'Registered Accounts',
      icon: Users,
      tab: 'user-management'
    },
    {
      title: 'Total Companies',
      value: stats.companiesCount,
      subtext: 'Corporate Partners',
      icon: Building2,
      tab: 'companies'
    },
    {
      title: 'Published Jobs',
      value: stats.jobsCount,
      subtext: 'Active Job Openings',
      icon: Briefcase,
      tab: 'content-management'
    },
    {
      title: 'Active Internships',
      value: stats.internshipsCount,
      subtext: 'Internship Drives',
      icon: Briefcase,
      tab: 'content-management'
    },
    {
      title: 'Contact Inquiries',
      value: stats.contactsCount,
      subtext: 'User & Partner Queries',
      icon: Mail,
      tab: 'contacts'
    }
  ];

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto text-zinc-900 dark:text-zinc-100">
      {/* Header Banner - Matching Student Dashboard Design */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121824] shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              <span>Executive Administration</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Admin Platform Overview
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
              Real-time platform metrics, user directory controls, and support inquiry triaging across CareerPilot AI.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab('contacts')}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-all cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Management</span>
            </button>
            <button
              onClick={() => setActiveTab('user-management')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-all cursor-pointer shadow-xs"
            >
              <Users className="w-4 h-4" />
              <span>View Registered Students</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {(kpiCards || []).map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => card.tab && setActiveTab(card.tab)}
              className="glass-card glass-card-hover rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121824] shadow-xs flex flex-col justify-between space-y-4 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {card.title}
                </span>
                <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                  {loading ? '...' : card.value}
                </span>
                <p className="text-[11px] font-medium text-zinc-400 mt-1">
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
