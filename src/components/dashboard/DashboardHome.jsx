import React, { useState, useEffect } from 'react';
import { useCareer } from '../../context/CareerContext';
import { useProfile } from '../../context/ProfileContext';
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/api';
import {
  Award,
  ArrowRight,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  FileText,
  Briefcase,
  Compass,
  Target,
  User,
  Milestone,
  BookOpen,
  FolderGit2,
  ShieldCheck,
  Bell
} from 'lucide-react';

export default function DashboardHome({ setActiveTab }) {
  const {
    readinessScore,
    currentRole,
    roadmapStats,
    dailyStreak,
    skillComparison,
    appliedInternships,
    pinnedProjects
  } = useCareer();

  const { profile, isProfileCompleted } = useProfile();
  const { isDark } = useTheme();

  const [facultyNotes, setFacultyNotes] = useState([]);

  useEffect(() => {
    apiService.getStudentFacultyNotes()
      .then(res => {
        if (res && res.success && Array.isArray(res.notes)) {
          setFacultyNotes(res.notes);
        }
      })
      .catch(() => setFacultyNotes([]));
  }, []);

  // Dynamic profile completion percentage (fallback to 75% as shown in reference design if not calculated)
  const calculatedCompletion = (() => {
    let score = 0;
    if (profile?.fullName) score += 20;
    if (profile?.email) score += 15;
    if (profile?.skills?.length > 0) score += 25;
    if (profile?.education || profile?.department) score += 15;
    if (profile?.resumeUrl || profile?.summary) score += 15;
    if (profile?.certifications) score += 10;
    return score > 0 ? Math.min(100, score) : 75;
  })();

  const completionPercent = isProfileCompleted ? 100 : calculatedCompletion;

  // Certificates resolution (Use real profile certificates if provided, or default reference certificate item)
  const certList = (() => {
    if (profile?.certifications) {
      const items = profile.certifications.split(',').map(c => c.trim()).filter(Boolean);
      if (items.length > 0) {
        return items.map((certName, idx) => ({
          title: certName,
          issuer: 'Verified Credential',
          status: 'Completed',
          date: `Issued ${2024 + (idx % 2)}`
        }));
      }
    }
    return [
      {
        title: 'AI & Machine Learning Basics',
        issuer: 'Coursera',
        status: 'Completed',
        date: 'Issued on 12 Aug 2025'
      }
    ];
  })();

  // Timeline Steps Configuration
  const timelineSteps = [
    { label: 'Profile', icon: User, status: 'completed' },
    { label: 'Skills', icon: Target, status: 'completed' },
    { label: 'Roadmap', icon: Milestone, status: 'current' },
    { label: 'Learning', icon: BookOpen, status: 'upcoming' },
    { label: 'Projects', icon: FolderGit2, status: 'upcoming' },
    { label: 'Opportunities', icon: Briefcase, status: 'upcoming' }
  ];

  return (
    <div className="space-y-6 pb-12 text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Responsive Dashboard Main Grid: 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= MAIN / CENTER COLUMN (approx 75% = lg:col-span-8 or 9) ================= */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          
          {/* HERO CARD */}
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 flex flex-col justify-between min-h-[260px] shadow-xs">
            {/* Mountain Graphic on the right side blending naturally into card */}
            <div className="absolute right-0 bottom-0 top-0 w-full sm:w-1/2 pointer-events-none opacity-40 dark:opacity-30 sm:opacity-90 flex flex-col justify-between items-end pr-4 pt-4 pb-0">
              <span className="text-[10px] sm:text-xs font-medium text-zinc-400 dark:text-zinc-500 tracking-wide text-right z-10">
                Better Skills • Better Opportunities • A Brighter Future
              </span>
              
              {/* Monochrome Mountain SVG Illustration with flag at summit */}
              <svg
                viewBox="0 0 400 220"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full max-w-[340px] h-auto text-zinc-300 dark:text-zinc-800"
              >
                {/* Background Peak */}
                <path
                  d="M140 220 L240 80 L340 220 Z"
                  className="fill-zinc-200/60 dark:fill-zinc-800/40"
                />
                {/* Foreground Mountain Peak */}
                <path
                  d="M60 220 L200 40 L340 220 Z"
                  className="fill-zinc-300/80 dark:fill-zinc-800/80"
                />
                {/* Mountain Ridge Accent */}
                <path
                  d="M200 40 L200 220"
                  className="stroke-zinc-400/50 dark:stroke-zinc-700/60"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                {/* Flag Post at Summit */}
                <line
                  x1="200"
                  y1="40"
                  x2="200"
                  y2="20"
                  className="stroke-zinc-700 dark:stroke-zinc-300"
                  strokeWidth="2"
                />
                {/* Summit Flag */}
                <polygon
                  points="200,20 222,27 200,34"
                  className="fill-emerald-500 dark:fill-emerald-400"
                />
                {/* Growth path line */}
                <path
                  d="M40 200 C 100 180, 140 120, 200 40"
                  className="stroke-emerald-500/80 dark:stroke-emerald-400/80"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                />
              </svg>
            </div>

            {/* Hero Left Content */}
            <div className="relative z-10 max-w-xl space-y-4">
              <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                YOUR CAREER JOURNEY
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight">
                Build Your Future <br />
                <span className="text-zinc-900 dark:text-white">With CareerPilot</span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md">
                Get personalized guidance, discover opportunities and build the skills you need to achieve your career goals.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('roadmap')}
                  className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white transition-all shadow-xs"
                >
                  <span>View Career Roadmap</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* FACULTY NOTES & OBSERVATIONS BANNER */}
          {facultyNotes.length > 0 && (
            <div className="rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-purple-500/10 border border-blue-500/20 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                      Faculty Guidance & Progress Notes ({facultyNotes.length})
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Direct feedback and observation notes sent by your assigned faculty mentor.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 shrink-0"
                >
                  <span>View All Notes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {facultyNotes.slice(0, 2).map((noteItem, nIdx) => (
                  <div key={nIdx} className="p-3.5 rounded-xl bg-white dark:bg-[#121824] border border-blue-500/20 space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {noteItem.faculty_name || 'Faculty Mentor'}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {new Date(noteItem.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                      "{noteItem.note_text}"
                    </p>
                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      {noteItem.category || 'Academic Observation'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MIDDLE ROW GRID: Certificates Card + Profile Completion Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* CARD 1: YOUR CERTIFICATES */}
            <div className="rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col justify-between space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  YOUR CERTIFICATES
                </span>
                <button
                  onClick={() => setActiveTab('certificates')}
                  className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 hover:underline flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {certList.map((cert, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveTab('certificates')}
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-zinc-200/70 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white leading-snug">
                          {cert.title}
                        </h4>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {cert.issuer}
                        </p>
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            {cert.status}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            {cert.date}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* CARD: FACULTY GUIDANCE NOTES */}
            {facultyNotes && facultyNotes.length > 0 && (
              <div className="rounded-2xl bg-white dark:bg-[#121824] border border-blue-500/30 p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Faculty Guidance & Notes ({facultyNotes.length})
                  </span>
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>View Notifications</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {facultyNotes.slice(0, 2).map((note, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/15 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-blue-500" />
                          {note.faculty_name || 'Faculty Mentor'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(note.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        "{note.note_text || note.note || note.message}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CARD 2: PROFILE COMPLETION */}
            <div className="rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col justify-between space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Profile Completion
                </span>
              </div>

              <div className="flex flex-col items-center justify-center py-2 space-y-3 text-center">
                {/* Minimal Circular Progress Indicator */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-zinc-200 dark:text-zinc-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-zinc-900 dark:text-white"
                      strokeDasharray={`${completionPercent}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-xl font-extrabold text-zinc-900 dark:text-white">
                    {completionPercent}%
                  </span>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xs leading-relaxed">
                  Complete your profile to unlock more personalized recommendations.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('profile')}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Complete Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* CARD 3: CAREER PROGRESS TIMELINE */}
          <div className="rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 space-y-6 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Your Career Progress
              </h3>
              <span className="text-xs text-zinc-400">
                Stage 3 of 6
              </span>
            </div>

            {/* Horizontal timeline container */}
            <div className="relative py-4 overflow-x-auto">
              {/* Connecting Horizontal Line */}
              <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-zinc-200 dark:bg-zinc-800 -translate-y-1/2 z-0" />

              <div className="relative z-10 flex items-center justify-between min-w-[500px] px-4">
                {timelineSteps.map((step, idx) => {
                  const StepIcon = step.icon;
                  const isCompleted = step.status === 'completed';
                  const isCurrent = step.status === 'current';

                  return (
                    <div key={idx} className="flex flex-col items-center space-y-2 group cursor-pointer" onClick={() => setActiveTab(step.label.toLowerCase() === 'profile' ? 'profile' : step.label.toLowerCase() === 'skills' ? 'skill-insights' : step.label.toLowerCase() === 'roadmap' ? 'roadmap' : step.label.toLowerCase() === 'projects' ? 'projects' : 'jobs')}>
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                          isCompleted
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                            : isCurrent
                            ? 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100 text-white dark:text-zinc-900 ring-4 ring-zinc-200 dark:ring-zinc-800'
                            : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-400'
                        }`}
                      >
                        <StepIcon className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          isCompleted
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isCurrent
                            ? 'text-zinc-900 dark:text-white font-bold'
                            : 'text-zinc-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* ================= RIGHT SIDEBAR COLUMN (approx 25-30% = lg:col-span-4 or 3) ================= */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          
          {/* RIGHT CARD 1: RECOMMENDED NEXT STEP */}
          <div className="rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200 dark:border-zinc-800 p-5 space-y-4 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white">
              <Sparkles className="w-4 h-4 text-emerald-500" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Recommended Next Step
              </span>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Update Your Skills
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Add your current skills to get more accurate recommendations.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('profile')}
              className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Update Skills</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* RIGHT CARD 2: QUICK ACTIONS */}
          <div className="rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200 dark:border-zinc-800 p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Quick Actions
            </h3>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {/* Row 1: Take Readiness Test */}
              <button
                onClick={() => setActiveTab('readiness-test')}
                className="w-full py-3 px-2 flex items-center justify-between text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors group text-left"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                  <span>Take Readiness Test</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
              </button>

              {/* Row 2: Upload Resume */}
              <button
                onClick={() => setActiveTab('profile')}
                className="w-full py-3 px-2 flex items-center justify-between text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors group text-left"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                  <span>Upload Resume</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
              </button>

              {/* Row 3: Explore Jobs */}
              <button
                onClick={() => setActiveTab('jobs')}
                className="w-full py-3 px-2 flex items-center justify-between text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors group text-left"
              >
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                  <span>Explore Jobs</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
              </button>

              {/* Row 4: Explore Internships */}
              <button
                onClick={() => setActiveTab('internships')}
                className="w-full py-3 px-2 flex items-center justify-between text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors group text-left"
              >
                <div className="flex items-center gap-3">
                  <Compass className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                  <span>Explore Internships</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

