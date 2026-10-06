import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  GraduationCap,
  Building2,
  Users,
  Target,
  BookOpen,
  Award,
  Briefcase,
  Layers,
  ChevronRight,
  TrendingUp,
  FileText,
  UserCheck
} from 'lucide-react';

export default function LandingPage() {
  const { setAuthView } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white relative overflow-hidden transition-colors duration-200">
      {/* Background glow accents */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-brand-500/10 filter blur-[150px] pointer-events-none -top-32 -left-32" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-purple-500/10 filter blur-[130px] pointer-events-none top-1/2 -right-32" />

      {/* Top Institutional Header Bar */}
      <header className="w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#090D16]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setAuthView('landing')}>
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                CAREERPILOT
              </span>
              <span className="block text-[10px] font-bold text-brand-600 dark:text-brand-400 tracking-widest uppercase">
                Institutional Platform
              </span>
            </div>
          </div>

          {/* Navigation & Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAuthView('login')}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              LOGIN
            </button>
            <button
              onClick={() => setAuthView('signup')}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:opacity-95 shadow-md shadow-brand-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>SIGN UP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 max-w-7xl mx-auto text-center z-10 flex-1 flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 mb-6">
          <ShieldCheck className="w-4 h-4" />
          <span>Centralized Career-Readiness & Placement System</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight max-w-4xl">
          From Confusion to Confidence.<br />
          <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            From First Year to First Job.
          </span>
        </h1>

        <p className="mt-6 text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          CareerPilot is a centralized institutional platform designed to help students understand their career readiness, build skills, receive faculty guidance, access learning resources, and prepare for placement opportunities.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <button
            onClick={() => setAuthView('login')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:opacity-95 shadow-lg shadow-brand-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Access Student & Staff Login</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setAuthView('signup')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-slate-800 dark:text-white bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            Create Student Account
          </button>
        </div>

        {/* Role Quick Links Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200/60 dark:border-slate-800/60 w-full max-w-3xl flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Supported Portals:
          </span>
          <button onClick={() => setAuthView('login')} className="hover:text-brand-600 dark:hover:text-white transition-colors cursor-pointer">
            Student Portal
          </button>
          <span>•</span>
          <button onClick={() => setAuthView('login')} className="hover:text-brand-600 dark:hover:text-white transition-colors cursor-pointer">
            Faculty Portal
          </button>
          <span>•</span>
          <button onClick={() => setAuthView('admin-login')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
            Placement Cell (TPO)
          </button>
          <span>•</span>
          <button onClick={() => setAuthView('admin-login')} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer">
            Executive Admin
          </button>
        </div>
      </section>

      {/* Core Capabilities Section */}
      <section className="py-16 px-4 sm:px-6 bg-white/60 dark:bg-[#0B0F1A]/60 border-y border-slate-200/80 dark:border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
              CORE CAPABILITIES
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Institutional Features Built for Career Success
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Integrated tools connecting academic guidance with real placement preparation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Capability 1 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#121724] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-brand-500/40 transition-all space-y-3">
              <div className="p-3 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 w-fit">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Career Readiness</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Standardized readiness scoring and domain assessments measuring core engineering competencies.
              </p>
            </div>

            {/* Capability 2 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#121724] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-brand-500/40 transition-all space-y-3">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 w-fit">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">AI Career Roadmap</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Structured step-by-step milestones tailored to target roles in software, cloud, data, and systems engineering.
              </p>
            </div>

            {/* Capability 3 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#121724] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-brand-500/40 transition-all space-y-3">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 w-fit">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Placement Prediction</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Machine-learning prediction pipeline offering feature contribution analysis and actionable feedback.
              </p>
            </div>

            {/* Capability 4 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#121724] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-brand-500/40 transition-all space-y-3">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 w-fit">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Faculty Guidance</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Direct faculty feedback, progress observations, and academic guidance delivered straight to student dashboards.
              </p>
            </div>

            {/* Capability 5 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#121724] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-brand-500/40 transition-all space-y-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Learning Resources</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Faculty-curated study material and educational YouTube video lectures with branch and academic year scope.
              </p>
            </div>

            {/* Capability 6 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#121724] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-brand-500/40 transition-all space-y-3">
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 w-fit">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Placement Drives</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Corporate partner taxonomy, eligibility rules, and drive management for placement officers (TPOs).
              </p>
            </div>

            {/* Capability 7 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#121724] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-brand-500/40 transition-all space-y-3">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Jobs & Internships</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Verified campus hiring postings, internship applications, and status tracking for registered students.
              </p>
            </div>

            {/* Capability 8 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#121724] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-brand-500/40 transition-all space-y-3">
              <div className="p-3 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 w-fit">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Institutional Analytics</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Departmental metrics, student directory oversight, and institutional governance for executive admins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Roles Matrix Section */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            STAKEHOLDER PORTALS
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Designed for Every Institutional Role
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Dedicated role-isolated workspaces tailored for students, faculty, TPOs, and administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Student Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-500/20">
                Student Portal
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">For Students</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Track placement readiness, practice assessments, receive faculty notes, and discover jobs.
              </p>
            </div>
            <button
              onClick={() => setAuthView('login')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Student Login</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Faculty Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                Faculty Portal
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">For Faculty</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Monitor assigned students, record guidance notes, and publish targeted study materials.
              </p>
            </div>
            <button
              onClick={() => setAuthView('login')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Faculty Login</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* TPO Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                Placement Cell (TPO)
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">For TPO Officers</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Manage recruiting companies, host placement drives, review student applications, and set rules.
              </p>
            </div>
            <button
              onClick={() => setAuthView('admin-login')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>TPO Login</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Admin Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                Executive Admin
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">For Administrators</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Oversee platform user directory, institutional analytics, tenant college scope, and governance.
              </p>
            </div>
            <button
              onClick={() => setAuthView('admin-login')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Admin Login</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080B13] relative z-10 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span className="font-bold text-slate-900 dark:text-white">CareerPilot</span>
            <span>© 2026. Centralized Institutional Career-Readiness System.</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setAuthView('login')} className="hover:text-brand-600 dark:hover:text-white transition-colors cursor-pointer">
              Login
            </button>
            <button onClick={() => setAuthView('signup')} className="hover:text-brand-600 dark:hover:text-white transition-colors cursor-pointer">
              Sign Up
            </button>
            <button onClick={() => setAuthView('admin-login')} className="hover:text-brand-600 dark:hover:text-white transition-colors cursor-pointer">
              Placement Cell Access
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
