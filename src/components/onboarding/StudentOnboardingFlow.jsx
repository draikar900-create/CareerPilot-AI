import React, { useState, useEffect } from 'react';
import { useProfile } from '../../context/ProfileContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { apiService } from '../../services/api';
import { GithubIcon, LinkedinIcon } from '../common/BrandIcons';
import {
  GraduationCap,
  Building,
  BookOpen,
  Code2,
  Target,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
  AlertCircle,
  Plus,
  Trash2,
  Upload,
  User,
  Mail,
  Phone,
  Calendar,
  Layers,
  FolderGit2,
  Award,
  Compass,
  Check,
  Briefcase
} from 'lucide-react';

const COMMON_SKILLS = [
  'Python', 'JavaScript', 'Java', 'C++', 'React', 'Node.js',
  'HTML/CSS', 'SQL', 'Git/GitHub', 'Data Structures', 'Algorithms',
  'Docker', 'AWS', 'Machine Learning', 'Linux', 'Tailwind CSS'
];

const TARGET_ROLES = [
  { id: 'fullstack', title: 'Full Stack Software Engineer', category: 'Software Development' },
  { id: 'frontend', title: 'Frontend Engineer (React / Next.js)', category: 'Software Development' },
  { id: 'backend', title: 'Backend Systems Engineer (Node.js / Java)', category: 'Software Development' },
  { id: 'aiml', title: 'AI / Machine Learning Engineer', category: 'Data & AI' },
  { id: 'data', title: 'Data Scientist & Analytics Engineer', category: 'Data & AI' },
  { id: 'cloud', title: 'Cloud Architect & DevOps Engineer', category: 'Infrastructure' },
  { id: 'cyber', title: 'Cybersecurity Analyst', category: 'Security' },
  { id: 'mobile', title: 'Mobile App Developer (Flutter / React Native)', category: 'Mobile' }
];

const DOMAINS = [
  'Web Platforms',
  'Artificial Intelligence',
  'Cloud & DevOps',
  'Cybersecurity',
  'Data Science & Analytics',
  'Mobile Applications',
  'IoT & Embedded Systems',
  'Financial Technology'
];

const STEPS = [
  { number: 1, title: 'Welcome' },
  { number: 2, title: 'Basic Info' },
  { number: 3, title: 'Academics' },
  { number: 4, title: 'Skills' },
  { number: 5, title: 'Resume & Links' },
  { number: 6, title: 'Career Goals' },
  { number: 7, title: 'Review & Guide' }
];

export default function StudentOnboardingFlow({ onComplete }) {
  const { currentUser } = useAuth();
  const {
    profile,
    updateProfile,
    saveProfile,
    handleResumeUpload,
    profileCompletionPercentage
  } = useProfile();
  const { showToast } = useToast();

  const getClampedStep = (s) => {
    const num = Number(s) || 1;
    if (num > 7) return 7;
    if (num < 1) return 1;
    return num;
  };

  const [currentStep, setCurrentStep] = useState(() => getClampedStep(profile.currentOnboardingStep));
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingColleges, setLoadingColleges] = useState(false);
  const [customSkill, setCustomSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Optional mini-forms in Step 7
  const [showAddProject, setShowAddProject] = useState(false);
  const [projectData, setProjectData] = useState({ title: '', tech: '', link: '' });
  const [showAddCert, setShowAddCert] = useState(false);
  const [certData, setCertData] = useState({ title: '', issuer: '' });

  // Sync step if profile loaded asynchronously
  useEffect(() => {
    if (profile.currentOnboardingStep) {
      setCurrentStep(getClampedStep(profile.currentOnboardingStep));
    }
  }, [profile.currentOnboardingStep]);

  // Fetch colleges list on mount
  useEffect(() => {
    setLoadingColleges(true);
    apiService.getColleges()
      .then(res => {
        if (res.success && res.colleges) {
          setColleges(res.colleges);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingColleges(false));
  }, []);

  // Fetch departments when college changes
  useEffect(() => {
    if (profile.collegeId) {
      apiService.getDepartments(profile.collegeId)
        .then(res => {
          if (res.success && res.departments) {
            setDepartments(res.departments);
          }
        })
        .catch(() => {});
    }
  }, [profile.collegeId]);

  // Determine if student is a 1st year / fresher
  const isFirstYear = profile.academicYear === '1st Year' || Number(profile.currentSemester) <= 2;

  const handleStepTransition = async (nextStep) => {
    const clamped = getClampedStep(nextStep);
    setCurrentStep(clamped);
    updateProfile('currentOnboardingStep', clamped);
    await saveProfile({ currentOnboardingStep: clamped });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSkill = (skill) => {
    const current = profile.skills || [];
    if (current.includes(skill)) {
      updateProfile('skills', current.filter(s => s !== skill));
    } else {
      updateProfile('skills', [...current, skill]);
    }
  };

  const handleAddCustomSkill = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && customSkill.trim()) {
      e.preventDefault();
      const trimmed = customSkill.trim();
      const current = profile.skills || [];
      if (!current.includes(trimmed)) {
        updateProfile('skills', [...current, trimmed]);
      }
      setCustomSkill('');
    }
  };

  const toggleDomain = (domain) => {
    const current = profile.preferredDomains || [];
    if (current.includes(domain)) {
      updateProfile('preferredDomains', current.filter(d => d !== domain));
    } else {
      updateProfile('preferredDomains', [...current, domain]);
    }
  };

  // Step 2 Validation (Basic Info)
  const handleNextStep2 = (e) => {
    e.preventDefault();
    if (!profile.fullName?.trim()) {
      showToast('Please enter your full name.', 'error');
      return;
    }
    handleStepTransition(3);
  };

  // Step 3 Validation (Academic Info)
  const handleNextStep3 = (e) => {
    e.preventDefault();
    if (!profile.collegeName?.trim() && !profile.collegeId) {
      showToast('Please specify your college or institution.', 'error');
      return;
    }
    if (!profile.branch?.trim() && !profile.departmentId) {
      showToast('Please select or enter your branch / department.', 'error');
      return;
    }
    if (!profile.currentSemester) {
      showToast('Please select your current semester.', 'error');
      return;
    }
    if (!isFirstYear && (!profile.cgpa || Number(profile.cgpa) <= 0)) {
      showToast('Please enter your current CGPA (scale of 10.0).', 'error');
      return;
    }
    handleStepTransition(4);
  };

  // Step 4 Validation (Skills)
  const handleNextStep4 = (e) => {
    e.preventDefault();
    // 1st year students are allowed to continue even with 0 skills
    if (!isFirstYear && (!profile.skills || profile.skills.length === 0)) {
      showToast('Please add at least one technical skill or programming language.', 'info');
    }
    handleStepTransition(5);
  };

  // Step 5 Validation (Resume & Profiles)
  const handleNextStep5 = (e) => {
    e.preventDefault();
    if (!isFirstYear && !profile.resume) {
      showToast('A resume is recommended for senior students. You can also upload or update it later in Profile.', 'info');
    }
    handleStepTransition(6);
  };

  // Step 6 Validation (Career Goals)
  const handleNextStep6 = (e) => {
    e.preventDefault();
    if (!profile.targetRole?.trim()) {
      showToast('Please select a target engineering role to customize your roadmap.', 'error');
      return;
    }
    handleStepTransition(7);
  };

  // Step 7 Final Onboarding Completion
  const handleFinalSubmit = async () => {
    setSaving(true);
    try {
      updateProfile('onboardingCompleted', true);
      updateProfile('currentOnboardingStep', 8);

      const ok = await saveProfile({
        onboardingCompleted: true,
        currentOnboardingStep: 8
      });

      if (ok) {
        setIsCompleted(true);
        showToast('Onboarding completed successfully! Welcome to CareerPilot.', 'success');
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 1200);
      }
    } catch (err) {
      showToast('Error completing onboarding: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-slate-100 flex items-center justify-center p-4">
        <div className="glass-card rounded-3xl p-8 max-w-md w-full text-center space-y-4 border border-emerald-500/30 animate-fade-in shadow-2xl shadow-emerald-500/10">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Your CareerPilot Profile is Ready!
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Personalized career goals, skill insights, and your custom roadmap are now configured. Redirecting to your dashboard...
          </p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full w-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6 selection:bg-brand-500 selection:text-white">
      <div className="w-full max-w-3xl mx-auto space-y-6">
        
        {/* Top Header Card with Step Indicator */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-500 ring-1 ring-brand-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-500">
                  CareerPilot Onboarding
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
                  Step {currentStep} of 7
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {STEPS[currentStep - 1]?.title || 'Student Profile Setup'}
              </h1>
            </div>
          </div>

          {/* Step Progress Dots */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {STEPS.map((s) => (
              <div
                key={s.number}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${
                  currentStep === s.number
                    ? 'bg-brand-600 text-white shadow-glow'
                    : currentStep > s.number
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
                title={`Step ${s.number}: ${s.title}`}
              >
                {currentStep > s.number ? <Check className="w-3.5 h-3.5" /> : s.number}
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: Welcome & Overview                                                */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-6 animate-fade-in">
            <div className="space-y-2 text-center sm:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-500/10 text-brand-500 border border-brand-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Welcome to CareerPilot</span>
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Let's build your CareerPilot profile
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">
                Tell us about yourself so CareerPilot can personalize your skills, roadmap, learning, and placement insights.
              </p>
            </div>

            {/* Platform Value Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-500 shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">AI Career Roadmap</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Stage-wise learning path aligned with your target engineering role.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Skill Intelligence</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Calibrate competencies and test placement readiness year-by-year.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Placement Drives</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Match eligibility rules for campus drives, jobs, and internships.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 shrink-0">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Faculty & College Mentorship</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Direct guidance and assigned training content from your department.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => handleStepTransition(2)}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:opacity-95 shadow-glow flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Start Onboarding</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: Basic Information                                                 */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <form onSubmit={handleNextStep2} className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-brand-500" />
                <span>Step 2: Basic Information</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Confirm your student identity and primary contact information.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={profile.fullName || ''}
                  onChange={(e) => updateProfile('fullName', e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
              </div>

              {/* Email (Derived from Auth) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Email Address</span>
                  <span className="text-[10px] text-brand-500 font-normal">Account Email</span>
                </label>
                <input
                  type="email"
                  disabled
                  value={currentUser?.email || profile.email || ''}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 text-slate-500 text-sm cursor-not-allowed"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profile.phone || ''}
                  onChange={(e) => updateProfile('phone', e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={profile.dob || ''}
                  onChange={(e) => updateProfile('dob', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
              </div>

              {/* Gender (Optional) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Gender (Optional)
                </label>
                <select
                  value={profile.gender || ''}
                  onChange={(e) => updateProfile('gender', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              {/* Profile Photo URL */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Profile Photo URL (Optional)
                </label>
                <input
                  type="url"
                  value={profile.photoUrl || ''}
                  onChange={(e) => updateProfile('photoUrl', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => handleStepTransition(1)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:opacity-95 shadow-glow flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Save & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: Academic Information                                              */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <form onSubmit={handleNextStep3} className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-brand-500" />
                <span>Step 3: Academic Information</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Set up your institutional details and academic year.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* College */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  College / Institution *
                </label>
                {colleges.length > 0 ? (
                  <select
                    value={profile.collegeId || ''}
                    onChange={(e) => {
                      const selected = colleges.find(c => c.id === e.target.value);
                      updateProfile('collegeId', e.target.value);
                      if (selected) updateProfile('collegeName', selected.name);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  >
                    <option value="">Select College</option>
                    {colleges.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={profile.collegeName || ''}
                    onChange={(e) => updateProfile('collegeName', e.target.value)}
                    placeholder="Enter College Name"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  />
                )}
              </div>

              {/* Department / Branch */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Department / Branch *
                </label>
                {departments.length > 0 ? (
                  <select
                    value={profile.departmentId || ''}
                    onChange={(e) => {
                      const selected = departments.find(d => d.id === e.target.value);
                      updateProfile('departmentId', e.target.value);
                      if (selected) updateProfile('branch', selected.name);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  >
                    <option value="">Select Branch</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={profile.branch || ''}
                    onChange={(e) => updateProfile('branch', e.target.value)}
                    placeholder="e.g. Computer Science and Engineering"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  />
                )}
              </div>

              {/* Academic Year */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Academic Year *
                </label>
                <select
                  value={profile.academicYear || '1st Year'}
                  onChange={(e) => {
                    const yr = e.target.value;
                    updateProfile('academicYear', yr);
                    const defaultSem = yr === '1st Year' ? 1 : yr === '2nd Year' ? 3 : yr === '3rd Year' ? 5 : 7;
                    updateProfile('currentSemester', defaultSem);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                >
                  <option value="1st Year">1st Year (Fresher)</option>
                  <option value="2nd Year">2nd Year (Sophomore)</option>
                  <option value="3rd Year">3rd Year (Pre-Final)</option>
                  <option value="4th Year">4th Year (Final Year)</option>
                </select>
              </div>

              {/* Current Semester */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Current Semester *
                </label>
                <select
                  value={profile.currentSemester || 1}
                  onChange={(e) => updateProfile('currentSemester', Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>

              {/* Graduation Year */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Expected Graduation Year
                </label>
                <input
                  type="number"
                  min="2024"
                  max="2032"
                  value={profile.graduationYear || new Date().getFullYear() + 4}
                  onChange={(e) => updateProfile('graduationYear', Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
              </div>

              {/* CGPA Field with First-Year Logic */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Current CGPA (Scale of 10)</span>
                  {isFirstYear && (
                    <span className="text-[10px] text-amber-500 font-semibold">Optional for 1st Year</span>
                  )}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  required={!isFirstYear}
                  value={profile.cgpa || ''}
                  onChange={(e) => updateProfile('cgpa', e.target.value)}
                  placeholder={isFirstYear ? 'Optional (Not yet published)' : 'e.g. 8.45'}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
              </div>
            </div>

            {/* First-Year Guidance Notice for CGPA */}
            {isFirstYear && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-600 dark:text-amber-400">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  As a 1st-Year student, CGPA can be left blank for now. You can easily add your score once semester results are declared.
                </span>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => handleStepTransition(2)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:opacity-95 shadow-glow flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Save & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: Technical Skills                                                  */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <form onSubmit={handleNextStep4} className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-brand-500" />
                <span>Step 4: Technical Skills</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Add languages, frameworks, or tools you know or are currently learning.
              </p>
            </div>

            {/* 1st-Year Reassurance Banner */}
            {isFirstYear && (
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-2.5 text-xs text-brand-400">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Don't have many technical skills yet? That's completely okay. CareerPilot's AI Roadmap will help you build them step-by-step.
                </span>
              </div>
            )}

            {/* Skill Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Add Skills (Type & Press Enter)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={handleAddCustomSkill}
                  placeholder="e.g. Python, React, C++, SQL"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customSkill.trim()) {
                      const trimmed = customSkill.trim();
                      const current = profile.skills || [];
                      if (!current.includes(trimmed)) updateProfile('skills', [...current, trimmed]);
                      setCustomSkill('');
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Currently Added Skill Badges */}
            {Array.isArray(profile?.skills) && profile.skills.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Your Skills ({profile.skills.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-brand-500/10 text-brand-500 dark:text-brand-400 border border-brand-500/20"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className="hover:text-rose-500 transition-colors ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick-Pick Popular Suggestions */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Quick-Add Popular Skills:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SKILLS.map((skill) => {
                  const has = (profile.skills || []).includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                        has
                          ? 'bg-brand-600 text-white shadow-glow'
                          : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {has ? '✓ ' : '+ '}
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => handleStepTransition(3)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:opacity-95 shadow-glow flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Save & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: Resume & Professional Profiles                                    */}
        {/* ========================================================================= */}
        {currentStep === 5 && (
          <form onSubmit={handleNextStep5} className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-500" />
                <span>Step 5: Resume & Professional Links</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Connect your resume and developer profiles for placement drives and recruiter visibility.
              </p>
            </div>

            {/* Resume Upload Box */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Resume Document (PDF)
              </label>

              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500/50 rounded-2xl p-5 text-center transition-all bg-white/40 dark:bg-slate-900/40">
                {profile.resume ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{profile.resume.name || 'Resume Uploaded'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateProfile('resume', null)}
                      className="text-rose-500 hover:underline"
                    >
                      Replace
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Upload your PDF resume (Max 5MB)
                    </div>
                    <label className="inline-block px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold cursor-pointer transition-all shadow-glow">
                      <span>Browse PDF</span>
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.type !== 'application/pdf') {
                              showToast('Please select a PDF document.', 'error');
                              return;
                            }
                            if (file.size > 5 * 1024 * 1024) {
                              showToast('Resume must be under 5MB.', 'error');
                              return;
                            }
                            const ok = await handleResumeUpload(file);
                            if (ok) showToast('Resume uploaded successfully!', 'success');
                          }
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>

              {isFirstYear && (
                <p className="text-[11px] text-slate-400 italic">
                  Note: Freshers can skip resume upload for now. CareerPilot's AI Resume Builder will help you create one.
                </p>
              )}
            </div>

            {/* Developer Profiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <GithubIcon className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                  <span>GitHub Profile</span>
                </label>
                <input
                  type="url"
                  value={profile.githubUrl || ''}
                  onChange={(e) => updateProfile('githubUrl', e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <LinkedinIcon className="w-4 h-4 text-blue-500" />
                  <span>LinkedIn Profile</span>
                </label>
                <input
                  type="url"
                  value={profile.linkedinUrl || ''}
                  onChange={(e) => updateProfile('linkedinUrl', e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => handleStepTransition(4)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:opacity-95 shadow-glow flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Save & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 6: Career Goals & Direction                                          */}
        {/* ========================================================================= */}
        {currentStep === 6 && (
          <form onSubmit={handleNextStep6} className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-brand-500" />
                <span>Step 6: Career Goals & Direction</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select your primary target role so our AI engine can tailor your learning roadmap.
              </p>
            </div>

            {/* Target Role Selector Cards */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Primary Target Role *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {TARGET_ROLES.map((role) => {
                  const selected = profile.targetRole === role.title;
                  return (
                    <div
                      key={role.id}
                      onClick={() => updateProfile('targetRole', role.title)}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                        selected
                          ? 'border-brand-500 bg-brand-500/10 text-brand-500 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {role.category}
                        </span>
                        {selected && <CheckCircle2 className="w-4 h-4 text-brand-500" />}
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {role.title}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Preferred Domains */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Areas of Interest & Domains
              </label>
              <div className="flex flex-wrap gap-2">
                {DOMAINS.map((domain) => {
                  const active = (profile.preferredDomains || []).includes(domain);
                  return (
                    <button
                      key={domain}
                      type="button"
                      onClick={() => toggleDomain(domain)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        active
                          ? 'bg-brand-600 text-white shadow-glow'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}
                      {domain}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => handleStepTransition(5)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:opacity-95 shadow-glow flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Save & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 7: Projects, Certificates & Completion (+ First-Year Guidance)        */}
        {/* ========================================================================= */}
        {currentStep === 7 && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                <span>Welcome to CareerPilot</span>
                <span>Step 7: Projects, Guidance & Final Review</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Review your profile information and see recommendations before entering the workspace.
              </p>
            </div>

            {/* FIRST-YEAR GUIDANCE SECTION (Conditional for 1st-Year Students) */}
            {isFirstYear && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-brand-500/5 to-purple-500/10 border border-indigo-500/20 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-brand-500/20 text-brand-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    You're just getting started! First-Year Action Guide
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Projects and certificates are completely optional right now. Here are recommended foundations to build during your 1st year:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 flex items-start gap-2">
                    <span className="text-brand-500 font-bold">1.</span>
                    <span><strong>Core Programming</strong>: Focus on Python, C++, or Java fundamentals.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 flex items-start gap-2">
                    <span className="text-brand-500 font-bold">2.</span>
                    <span><strong>GitHub Profile</strong>: Push your lab programs and class assignments.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 flex items-start gap-2">
                    <span className="text-brand-500 font-bold">3.</span>
                    <span><strong>LinkedIn Presence</strong>: Connect with campus placement officers and seniors.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 flex items-start gap-2">
                    <span className="text-brand-500 font-bold">4.</span>
                    <span><strong>First Mini-Project</strong>: Build a simple web calculator or CLI tool.</span>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Academic Summary</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500 font-semibold">
                    {profile.academicYear || '1st Year'}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{profile.fullName}</div>
                <div className="text-xs text-slate-500">{profile.collegeName || 'College Set'}</div>
                <div className="text-xs text-slate-500">{profile.branch} (Semester {profile.currentSemester})</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Career Goal & Skills</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold">
                    Profile {profileCompletionPercentage}% Complete
                  </span>
                </div>
                <div className="text-sm font-bold text-brand-500">{profile.targetRole || 'Software Engineering'}</div>
                <div className="text-xs text-slate-500">Skills ({profile.skills?.length || 0} configured)</div>
                <div className="text-xs text-slate-500">Resume: {profile.resume ? 'Uploaded' : 'Can be added later'}</div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => handleStepTransition(6)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={saving}
                className="px-8 py-3 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:opacity-95 shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Profile & Enter Dashboard</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
