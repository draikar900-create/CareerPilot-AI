import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import { useCareer } from '../../context/CareerContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../common/Modal';
import { GithubIcon, LinkedinIcon } from '../common/BrandIcons';
import { getInitials } from '../../utils/helpers';
import { apiService } from '../../services/api';
import {
  User,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  Building,
  Award,
  Upload,
  FileText,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Info,
  Camera,
  Sparkles,
  ArrowRight,
  AlertCircle,
  X,
  Eye,
  Download
} from 'lucide-react';

export default function StudentProfile({ setActiveTab }) {
  const { currentUser } = useAuth();
  const {
    profile,
    updateProfile,
    addSkill,
    removeSkill,
    handleResumeUpload,
    handleResumeDelete,
    saveProfile,
    refreshCareerCalibration,
    isCalibrating,
    profileCompletionPercentage
  } = useProfile();

  const { readinessScore, currentRole } = useCareer();
  const { showToast } = useToast();

  const [skillInput, setSkillInput] = useState('');
  const [showCalibrateModal, setShowCalibrateModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [showTopNotification, setShowTopNotification] = useState(false);

  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);

  const isPromptOrInvalidText = (str, isShortField = false) => {
    if (typeof str !== 'string') return false;
    const hasPromptKeywords = (
      str.includes('CareerPilot') ||
      str.includes('Required Form Validation') ||
      str.includes('Enhance the Student Profile') ||
      str.includes('semester-based resume') ||
      str.includes('Student Profile Validation Update') ||
      str.includes('Student Profile Setup') ||
      str.includes('When a user clicks') ||
      str.includes('Save Profile') ||
      (str.startsWith('#') && str.length > 20)
    );
    if (hasPromptKeywords) return true;
    if (isShortField && str.length > 100) return true;
    return false;
  };

  const safeDefaultName = (currentUser?.name && !isPromptOrInvalidText(currentUser.name, true))
    ? currentUser.name
    : '';
  const cleanFullName = isPromptOrInvalidText(profile.fullName, true) ? safeDefaultName : (profile.fullName || safeDefaultName || '');
  const cleanBranch = isPromptOrInvalidText(profile.branch, true) ? '' : (profile.branch || '');
  const cleanCollege = isPromptOrInvalidText(profile.collegeName, true) ? '' : (profile.collegeName || '');

  // Auto-clean any corrupted prompt text from profile on mount
  React.useEffect(() => {
    if (isPromptOrInvalidText(profile.branch, true)) {
      updateProfile('branch', '');
    }
    if (isPromptOrInvalidText(profile.fullName, true)) {
      updateProfile('fullName', safeDefaultName);
    }
    if (isPromptOrInvalidText(profile.collegeName, true)) {
      updateProfile('collegeName', '');
    }
    if (isPromptOrInvalidText(profile.achievements)) {
      updateProfile('achievements', []);
    }
  }, [profile.branch, profile.fullName, profile.collegeName, profile.achievements]);


  const isFirstSemester = Number(profile.currentSemester) === 1;
  const isResumeRequired = Number(profile.currentSemester) >= 2;

  // Single field validator
  const validateField = (field, value, currentProfile = profile) => {
    switch (field) {
      case 'fullName':
        if (!value?.trim()) return 'Full Name is required.';
        return null;
      case 'email':
        if (!value?.trim()) return 'Email is required.';
        return null;
      case 'phone':
        if (!value?.trim()) return 'Phone Number is required.';
        return null;
      case 'dob':
        if (!value?.trim()) return 'Date of Birth is required.';
        return null;
      case 'collegeName':
        if (!value?.trim()) return 'College Name is required.';
        return null;
      case 'branch':
        if (!value?.trim()) return 'Branch is required.';
        return null;
      case 'currentSemester':
        if (!value) return 'Current Semester is required.';
        return null;
      case 'cgpa':
        if (Number(currentProfile.currentSemester) > 1) {
          if (value === undefined || value === null || value.toString().trim() === '') {
            return 'CGPA is required.';
          }
          const num = Number(value);
          if (isNaN(num) || num < 0 || num > 10) {
            return 'Please enter a valid CGPA between 0.0 and 10.0';
          }
        }
        return null;
      case 'graduationYear':
        if (!value?.toString().trim()) return 'Graduation Year is required.';
        return null;
      case 'skills':
        if (!value || value.length === 0) return 'Please add at least one technical skill.';
        return null;
      case 'githubUrl':
        if (!value?.trim()) return 'GitHub Profile URL is required.';
        return null;
      case 'linkedinUrl':
        if (!value?.trim()) return 'LinkedIn Profile URL is required.';
        return null;
      case 'resume':
        if (Number(currentProfile.currentSemester) >= 2) {
          if (!value) return 'Please upload your resume before saving your profile.';
        }
        return null;
      default:
        return null;
    }
  };

  // Full form validator
  const validateAll = (data = profile) => {
    const newErrors = {};

    const fullNameErr = validateField('fullName', data.fullName, data);
    if (fullNameErr) newErrors.fullName = fullNameErr;

    const emailErr = validateField('email', data.email, data);
    if (emailErr) newErrors.email = emailErr;

    const phoneErr = validateField('phone', data.phone, data);
    if (phoneErr) newErrors.phone = phoneErr;

    const dobErr = validateField('dob', data.dob, data);
    if (dobErr) newErrors.dob = dobErr;

    const collegeErr = validateField('collegeName', data.collegeName, data);
    if (collegeErr) newErrors.collegeName = collegeErr;

    const branchErr = validateField('branch', data.branch, data);
    if (branchErr) newErrors.branch = branchErr;

    const semErr = validateField('currentSemester', data.currentSemester, data);
    if (semErr) newErrors.currentSemester = semErr;

    if (Number(data.currentSemester) > 1) {
      const cgpaErr = validateField('cgpa', data.cgpa, data);
      if (cgpaErr) newErrors.cgpa = cgpaErr;
    }

    const gradErr = validateField('graduationYear', data.graduationYear, data);
    if (gradErr) newErrors.graduationYear = gradErr;

    const skillsErr = validateField('skills', data.skills, data);
    if (skillsErr) newErrors.skills = skillsErr;

    const ghErr = validateField('githubUrl', data.githubUrl, data);
    if (ghErr) newErrors.githubUrl = ghErr;

    const liErr = validateField('linkedinUrl', data.linkedinUrl, data);
    if (liErr) newErrors.linkedinUrl = liErr;

    if (Number(data.currentSemester) >= 2) {
      const resumeErr = validateField('resume', data.resume, data);
      if (resumeErr) newErrors.resume = resumeErr;
    }

    return newErrors;
  };

  // Real-time field change handler
  const handleFieldChange = (field, value) => {
    const isShort = ['branch', 'fullName', 'collegeName', 'email', 'phone', 'dob', 'githubUrl', 'linkedinUrl'].includes(field);
    const sanitizedValue = (typeof value === 'string' && isPromptOrInvalidText(value, isShort)) ? '' : value;
    updateProfile(field, sanitizedValue);

    if (hasAttemptedSubmit || errors[field]) {
      const updatedProfile = { ...profile, [field]: sanitizedValue };
      const fieldError = validateField(field, sanitizedValue, updatedProfile);
      setErrors(prev => {
        const next = { ...prev };
        if (fieldError) {
          next[field] = fieldError;
        } else {
          delete next[field];
        }
        return next;
      });
    }
  };

  // Dynamic Semester change handler
  const handleSemesterChange = (newSem) => {
    const semNum = Number(newSem);
    updateProfile('currentSemester', semNum);

    setErrors(prev => {
      const next = { ...prev };
      delete next.currentSemester;
      if (semNum === 1) {
        delete next.cgpa;
        delete next.resume;
      } else if (hasAttemptedSubmit) {
        if (!profile.cgpa) next.cgpa = 'CGPA is required.';
        if (!profile.resume) next.resume = 'Please upload your resume before saving your profile.';
      }
      return next;
    });
  };

  // Skill key handler
  const handleAddSkillKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (skillInput.trim()) {
        addSkill(skillInput.trim());
        setSkillInput('');
        if (errors.skills) {
          setErrors(prev => {
            const next = { ...prev };
            delete next.skills;
            return next;
          });
        }
      }
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    removeSkill(skillToRemove);
    if (profile.skills.length <= 1 && hasAttemptedSubmit) {
      setErrors(prev => ({ ...prev, skills: 'Please add at least one technical skill.' }));
    }
  };

  // Resume upload & action handlers
  const onResumeFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!['pdf', 'doc', 'docx'].includes(ext)) {
        showToast('Error: Resume must be a PDF, DOC, or DOCX file.', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('Error: Resume file size must be within 5 MB.', 'error');
        return;
      }
      const ok = await handleResumeUpload(file);
      if (ok) {
        setErrors(prev => {
          const next = { ...prev };
          delete next.resume;
          return next;
        });
      }
    }
  };

  const handleViewResumeClick = async () => {
    try {
      await apiService.viewResume('me');
    } catch (err) {
      showToast('Error viewing resume: ' + err.message, 'error');
    }
  };

  const handleDownloadResumeClick = async () => {
    try {
      await apiService.downloadResume('me', profile.resume?.name || 'resume.pdf');
    } catch (err) {
      showToast('Error downloading resume: ' + err.message, 'error');
    }
  };

  const handleDeleteResumeClick = async () => {
    if (window.confirm('Are you sure you want to delete your resume?')) {
      const ok = await handleResumeDelete();
      if (ok && isResumeRequired && hasAttemptedSubmit) {
        setErrors(prev => ({ ...prev, resume: 'Please upload your resume before saving your profile.' }));
      }
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Show loading toast or state if needed, but since we don't have a specific loading state for avatar,
        // we'll just try to upload it directly.
        const res = await import('../../services/api').then(m => m.apiService.uploadAvatar(file));
        if (res && res.success) {
          updateProfile('photoUrl', res.url);
          showToast('Profile photo updated successfully!', 'success');
        } else {
          showToast('Failed to upload photo: ' + (res?.message || 'Unknown error'), 'error');
        }
      } catch (err) {
        showToast('Error uploading photo: ' + err.message, 'error');
      }
    }
  };

  // Save Profile with full validation check
  const handleSaveAndProceed = async () => {
    setHasAttemptedSubmit(true);
    const validationErrors = validateAll(profile);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setShowTopNotification(true);
      showToast('Please complete all required fields before saving your profile.', 'error');

      // Scroll smoothly to first invalid field or top
      const firstKey = Object.keys(validationErrors)[0];
      const element = document.getElementById(`field-${firstKey}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus?.();
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    // All validations pass!
    setErrors({});
    setShowTopNotification(false);
    const ok = await saveProfile(profile);
    if (ok) {
      showToast('Profile changes saved successfully!', 'success');
    }
  };

  const handleCalibrationClick = () => {
    setShowCalibrateModal(true);
    refreshCareerCalibration();
  };

  const initials = getInitials(cleanFullName || 'Student');

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Page Title & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Profile Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            View and update your personal, academic, skill, and career details.
          </p>
        </div>

        {/* Dynamic Semester Indicator Tag */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-sm ${
              isFirstSemester
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                : 'bg-indigo-500/10 text-brand-400 border-indigo-500/20'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Semester {profile.currentSemester} ({isFirstSemester ? 'Fresher Tier' : 'Senior Tier'})</span>
          </span>

          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Profile {profileCompletionPercentage}% Complete
          </span>
        </div>
      </div>

      {/* Top Validation Alert Notification */}
      {showTopNotification && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-600 dark:text-rose-400 text-sm font-semibold shadow-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span className="flex-1">
            Please complete all required fields before saving your profile.
          </span>
          <button
            type="button"
            onClick={() => setShowTopNotification(false)}
            className="p-1 text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Profile Header Card with Photo Upload */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-brand-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          <div className="relative group">
            {profile.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt={profile.fullName || 'Student'}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-brand-500/30 shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-700 text-white flex items-center justify-center text-2xl font-bold shadow-lg ring-4 ring-brand-500/20">
                {initials}
              </div>
            )}
            <button
              onClick={() => photoInputRef.current?.click()}
              className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-semibold transition-opacity"
            >
              <Camera className="w-5 h-5 mb-1" />
              <span>{profile.photoUrl ? 'Change' : 'Upload'}</span>
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {cleanFullName || 'Student Name'}
              </h2>
              {profile.skills && profile.skills.length > 0 ? (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  {profile.skills.length} Skills Added
                </span>
              ) : (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  Profile Incomplete
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              {cleanBranch ? cleanBranch : 'Branch not specified'}{' '}
              {cleanCollege ? `• ${cleanCollege}` : ''}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {profile.email || 'No email attached'}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {profile.phone || 'No phone attached'}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <button
              onClick={handleSaveAndProceed}
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:opacity-95 shadow-glow flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Profile</span>
            </button>
            <button
              onClick={handleCalibrationClick}
              disabled={isCalibrating || !profile.skills || profile.skills.length === 0}
              className="px-4 py-2 rounded-xl font-semibold text-xs text-slate-700 dark:text-slate-200 bg-white/70 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCalibrating ? 'animate-spin' : ''}`} />
              <span>Refresh Career Calibration</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 1: Basic Information */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-5 h-5 text-brand-500" />
          <span>Basic Information</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="field-fullName"
              type="text"
              value={cleanFullName}
              onChange={(e) => handleFieldChange('fullName', e.target.value)}
              placeholder="Enter Full Name"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all ${
                errors.fullName
                  ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500'
                  : 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50'
              }`}
            />
            {errors.fullName && (
              <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1 animate-fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.fullName}</span>
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Email <span className="text-rose-500">*</span>
            </label>
            <input
              id="field-email"
              type="email"
              value={profile.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              placeholder="Enter Email Address"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all ${
                errors.email
                  ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500'
                  : 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50'
              }`}
            />
            {errors.email && (
              <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1 animate-fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              id="field-phone"
              type="tel"
              value={profile.phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              placeholder="Enter Phone Number"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all ${
                errors.phone
                  ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500'
                  : 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50'
              }`}
            />
            {errors.phone && (
              <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1 animate-fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.phone}</span>
              </p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Date of Birth <span className="text-rose-500">*</span>
            </label>
            <input
              id="field-dob"
              type="date"
              value={profile.dob}
              onChange={(e) => handleFieldChange('dob', e.target.value)}
              placeholder="Select Date of Birth"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all ${
                errors.dob
                  ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500'
                  : 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50'
              }`}
            />
            {errors.dob && (
              <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1 animate-fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.dob}</span>
              </p>
            )}
          </div>

          {/* Profile Photo (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Profile Photo <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
            </label>
            <div className="flex items-center gap-3">
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt="Profile"
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-brand-500/30"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                  {initials}
                </div>
              )}
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-200 transition-all"
              >
                <Camera className="w-3.5 h-3.5 text-brand-500" />
                <span>{profile.photoUrl ? 'Change Photo' : 'Upload Photo'}</span>
              </button>
            </div>
          </div>

          {/* Gender (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Gender <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
            </label>
            <select
              value={profile.gender}
              onChange={(e) => handleFieldChange('gender', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500/50"
            >
              <option value="">Select Gender</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Non-Binary">Non-Binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 2: Academic Details (with Dynamic Semester & CGPA Logic) */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-500" />
            <span>Academic Details</span>
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {isFirstSemester
              ? 'Semester 1: CGPA hidden; Resume optional.'
              : 'Semester 2+: CGPA & Resume are required.'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 1. College Name */}
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              College Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="field-collegeName"
              type="text"
              value={cleanCollege}
              onChange={(e) => handleFieldChange('collegeName', e.target.value)}
              placeholder="Enter College Name"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all ${
                errors.collegeName
                  ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500'
                  : 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50'
              }`}
            />
            {errors.collegeName && (
              <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1 animate-fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.collegeName}</span>
              </p>
            )}
          </div>

          {/* 2. Branch */}
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Branch / Major <span className="text-rose-500">*</span>
            </label>
            <input
              id="field-branch"
              type="text"
              value={cleanBranch}
              onChange={(e) => handleFieldChange('branch', e.target.value)}
              placeholder="Select Branch"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all ${
                errors.branch
                  ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500'
                  : 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50'
              }`}
            />
            {errors.branch && (
              <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1 animate-fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.branch}</span>
              </p>
            )}
          </div>

          {/* 3. Current Semester */}
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Current Semester <span className="text-rose-500">*</span>
            </label>
            <select
              id="field-currentSemester"
              value={profile.currentSemester}
              onChange={(e) => handleSemesterChange(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                errors.currentSemester
                  ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500'
                  : 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50'
              }`}
            >
              <option value="">Select Semester</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s} {s === 1 ? '(Fresher - CGPA & Resume Optional)' : '(Senior - CGPA & Resume Required)'}
                </option>
              ))}
            </select>
            {errors.currentSemester && (
              <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1 animate-fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.currentSemester}</span>
              </p>
            )}
          </div>

          {/* 4. CGPA (Hidden completely if Semester = 1 or unselected; Shown and Required if Semester > 1) */}
          {Number(profile.currentSemester) > 1 && (
            <div className="sm:col-span-1 animate-fade-in">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>
                  Cumulative CGPA (Scale 10.0) <span className="text-rose-500">*</span>
                </span>
                <span className="text-[10px] text-emerald-500 font-bold">Required for Semester 2+</span>
              </label>
              <input
                id="field-cgpa"
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={profile.cgpa}
                onChange={(e) => handleFieldChange('cgpa', e.target.value)}
                placeholder="Enter CGPA"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono transition-all ${
                  errors.cgpa
                    ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500'
                    : 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50'
                }`}
              />
              {errors.cgpa && (
                <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1 animate-fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.cgpa}</span>
                </p>
              )}
            </div>
          )}

          {/* 5. Graduation Year */}
          <div className={`sm:col-span-1 ${Number(profile.currentSemester) <= 1 ? 'sm:col-start-1' : ''}`}>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Graduation Year <span className="text-rose-500">*</span>
            </label>
            <select
              id="field-graduationYear"
              value={profile.graduationYear}
              onChange={(e) => handleFieldChange('graduationYear', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all ${
                errors.graduationYear
                  ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500'
                  : 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50'
              }`}
            >
              <option value="">Select Graduation Year</option>
              {[2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035].map((year) => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </select>
            {errors.graduationYear && (
              <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1 animate-fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.graduationYear}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section 3: Technical Skills, Achievements & Resume */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-cyan-500" />
          <span>Technical & Achievement Details</span>
        </h3>

        {/* Technical Skills Tags Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Technical Skills <span className="text-rose-500">*</span>{' '}
            <span className="text-slate-400 font-normal text-[11px]">(Type skill and press Enter or comma)</span>
          </label>
          <p className="text-xs text-slate-400 mb-2">
            Add at least one skill you know and press Enter or comma.
          </p>
          <div
            id="field-skills"
            className={`flex flex-wrap items-center gap-2 p-3 rounded-2xl border min-h-[56px] transition-all ${
              errors.skills
                ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20'
                : 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50'
            }`}
          >
            {Array.isArray(profile?.skills) && profile.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-brand-500/10 text-brand-500 border border-brand-500/20 shadow-sm"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkillKey}
              placeholder="Add Technical Skills"
              className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none min-w-[140px]"
            />
          </div>
          {errors.skills && (
            <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1 animate-fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.skills}</span>
            </p>
          )}
        </div>

        {/* Achievements & Certifications (Optional) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Achievements <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={isPromptOrInvalidText(profile.achievements) ? '' : (profile.achievements || '')}
              onChange={(e) => handleFieldChange('achievements', e.target.value)}
              placeholder="Add Achievements"
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500/50 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Certifications <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={isPromptOrInvalidText(profile.certifications) ? '' : (profile.certifications || '')}
              onChange={(e) => handleFieldChange('certifications', e.target.value)}
              placeholder="Add Certifications"
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500/50 resize-none"
            />
          </div>
        </div>

        {/* Resume Upload & Secure Document Management */}
        <div id="field-resume">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span>Resume</span>
              {isResumeRequired ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  Required for Semester 2 and above *
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Optional for Semester 1
                </span>
              )}
            </label>
            <span className="text-xs text-slate-400">Accepted formats: PDF, DOC, DOCX (Max 5 MB)</span>
          </div>

          {/* First Semester Explanatory Notice */}
          {isFirstSemester && (
            <div className="mb-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>Resume upload is optional for first semester students.</span>
            </div>
          )}

          {profile.resume ? (
            <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Resume uploaded
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {profile.resume.name || 'resume.pdf'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Uploaded {profile.resume.uploadedAt || 'Recently'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleViewResumeClick}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Resume</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadResumeClick}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Resume</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Replace Resume</span>
                </button>

                <button
                  type="button"
                  onClick={handleDeleteResumeClick}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Delete Resume"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center space-y-3 bg-white/40 dark:bg-slate-900/40">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  No resume uploaded yet.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Upload your resume in PDF, DOC, or DOCX format (Max size 5 MB).
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-glow inline-flex items-center gap-2 cursor-pointer transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Resume</span>
              </button>
            </div>
          )}

          {errors.resume && (
            <p className="text-xs text-rose-500 font-medium mt-2 flex items-center gap-1 animate-fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.resume}</span>
            </p>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={onResumeFileChange}
          />
        </div>
      </div>

      {/* Section 4: Professional Profiles */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <GithubIcon className="w-5 h-5 text-indigo-500" />
          <span>Professional Profiles</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* GitHub Profile URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              GitHub Profile URL <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <GithubIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="field-githubUrl"
                type="url"
                value={profile.githubUrl}
                onChange={(e) => handleFieldChange('githubUrl', e.target.value)}
                placeholder="Enter GitHub Profile URL"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all ${
                  errors.githubUrl
                    ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500'
                    : 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50'
                }`}
              />
            </div>
            {errors.githubUrl && (
              <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1 animate-fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.githubUrl}</span>
              </p>
            )}
          </div>

          {/* LinkedIn Profile URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              LinkedIn Profile URL <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <LinkedinIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="field-linkedinUrl"
                type="url"
                value={profile.linkedinUrl}
                onChange={(e) => handleFieldChange('linkedinUrl', e.target.value)}
                placeholder="Enter LinkedIn Profile URL"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all ${
                  errors.linkedinUrl
                    ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500'
                    : 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50'
                }`}
              />
            </div>
            {errors.linkedinUrl && (
              <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1 animate-fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.linkedinUrl}</span>
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-400">
            Please complete all required fields (*) before saving your profile.
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSaveAndProceed}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:opacity-95 shadow-glow transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Career Calibration Simulation Modal */}
      {showCalibrateModal && (
        <Modal
          isOpen={showCalibrateModal}
          onClose={() => setShowCalibrateModal(false)}
          title="Career Calibration & Competency Analysis"
        >
          <div className="space-y-4 text-center py-2">
            {isCalibrating ? (
              <div className="py-8 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center animate-spin">
                  <RefreshCw className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Calibrating Against Industry Requirements...
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Synchronizing your entered skill tags, GPA, and projects against live {currentRole?.title || 'Engineering'} benchmarks.
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-left">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-emerald-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Calibration Complete!
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Your profile information is updated across Dashboard, Skill Insights, and Readiness Score.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-xs text-slate-400">Skills Captured</span>
                    <p className="text-2xl font-extrabold text-brand-500 mt-1">{profile.skills?.length || 0}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-xs text-slate-400">Readiness Score</span>
                    <p className="text-2xl font-extrabold text-emerald-500 mt-1">{readinessScore}%</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowCalibrateModal(false)}
                  className="w-full py-2.5 rounded-xl font-semibold text-xs text-white bg-brand-600 hover:bg-brand-500 shadow-glow cursor-pointer"
                >
                  Close & View Updated Dashboard
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
