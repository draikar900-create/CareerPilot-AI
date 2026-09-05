import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const ProfileContext = createContext();

const EMPTY_PROFILE = {
  fullName: '',
  email: '',
  phone: '',
  dob: '',
  gender: '',
  collegeName: '',
  branch: '',
  graduationYear: '',
  currentSemester: '',
  cgpa: '',
  skills: [],
  achievements: '',
  certifications: '',
  githubUrl: '',
  linkedinUrl: '',
  photoUrl: '',
  resume: null
};

const isPromptOrInvalidText = (str, isShortField = false) => {
  if (typeof str !== 'string') return false;
  const hasPromptKeywords = (
    str.includes('CareerPilot AI') ||
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

const isInvalidStudentName = (name) => {
  if (!name || typeof name !== 'string') return true;
  const trimmed = name.trim().toLowerCase();
  if (!trimmed) return true;
  return (
    trimmed === 'placement team admin' ||
    trimmed === 'placement officer' ||
    trimmed === 'demo user' ||
    trimmed === 'test user' ||
    trimmed === 'student' ||
    trimmed.includes('admin') ||
    trimmed.includes('placement team') ||
    isPromptOrInvalidText(name, true)
  );
};

const cleanProfileData = (data, user) => {
  if (!data || typeof data !== 'object') return data;
  const cleaned = { ...data };
  if (isPromptOrInvalidText(cleaned.branch, true)) {
    cleaned.branch = '';
  }
  if (isInvalidStudentName(cleaned.fullName)) {
    const validUserName = (user?.role === 'Student' && !isInvalidStudentName(user?.name)) ? user.name : '';
    cleaned.fullName = validUserName || localStorage.getItem('cp_student_name') || '';
  }
  if (isPromptOrInvalidText(cleaned.collegeName, true)) {
    cleaned.collegeName = '';
  }
  if (isPromptOrInvalidText(cleaned.achievements)) {
    cleaned.achievements = '';
  }
  if (isPromptOrInvalidText(cleaned.certifications)) {
    cleaned.certifications = '';
  }
  if (Array.isArray(cleaned.skills)) {
    cleaned.skills = cleaned.skills.filter(s => !isPromptOrInvalidText(s, true));
  }
  return cleaned;
};

export function ProfileProvider({ children }) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState(() => {
    const studentUser = currentUser?.role === 'Student' ? currentUser : null;
    const fallbackName = (!isInvalidStudentName(studentUser?.name) ? studentUser.name : '') ||
      localStorage.getItem('cp_student_name') ||
      '';

    const saved = localStorage.getItem('cp_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const cleaned = cleanProfileData(parsed, studentUser);
        localStorage.setItem('cp_profile', JSON.stringify(cleaned));
        return {
          ...EMPTY_PROFILE,
          ...cleaned,
          fullName: !isInvalidStudentName(cleaned.fullName) ? cleaned.fullName : fallbackName,
          email: cleaned.email || studentUser?.email || '',
          phone: cleaned.phone || studentUser?.phone || ''
        };
      } catch (e) {}
    }
    return {
      ...EMPTY_PROFILE,
      fullName: fallbackName,
      email: studentUser?.email || '',
      phone: studentUser?.phone || ''
    };
  });

  const [isCalibrating, setIsCalibrating] = useState(false);
  const [profileSaveTimestamp, setProfileSaveTimestamp] = useState(Date.now());

  // Proactively clean up any stale or corrupted localStorage data on mount
  useEffect(() => {
    try {
      const studentUser = currentUser?.role === 'Student' ? currentUser : null;
      const saved = localStorage.getItem('cp_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        const cleaned = cleanProfileData(parsed, studentUser);
        if (JSON.stringify(cleaned) !== saved) {
          localStorage.setItem('cp_profile', JSON.stringify(cleaned));
          setProfile(prev => ({ ...prev, ...cleaned }));
        }
      }
    } catch (e) {}
  }, [currentUser]);

  // Automatically synchronize name, email, phone from currentUser (strictly for authenticated Student only)
  useEffect(() => {
    if (currentUser && currentUser.role === 'Student' && !isInvalidStudentName(currentUser.name)) {
      setProfile(prev => {
        const safeName = currentUser.name.trim();
        const safeEmail = currentUser.email || prev.email;
        const safePhone = currentUser.phone || prev.phone;

        const needsUpdate =
          (safeName && prev.fullName !== safeName) ||
          (currentUser.email && prev.email !== currentUser.email) ||
          (currentUser.phone && prev.phone !== currentUser.phone);

        if (needsUpdate) {
          return {
            ...prev,
            fullName: safeName || prev.fullName,
            email: safeEmail,
            phone: safePhone
          };
        }
        return prev;
      });
    }
  }, [currentUser]);

  // Persist profile in localStorage
  useEffect(() => {
    const studentUser = currentUser?.role === 'Student' ? currentUser : null;
    const cleaned = cleanProfileData(profile, studentUser);
    if (cleaned.fullName && !isInvalidStudentName(cleaned.fullName)) {
      localStorage.setItem('cp_student_name', cleaned.fullName);
    }
    localStorage.setItem('cp_profile', JSON.stringify(cleaned));
  }, [profile, currentUser]);

  const updateProfile = (field, value) => {
    const isShort = ['branch', 'fullName', 'collegeName', 'email', 'phone', 'dob', 'githubUrl', 'linkedinUrl'].includes(field);
    if (typeof value === 'string' && isPromptOrInvalidText(value, isShort)) {
      setProfile(prev => ({
        ...prev,
        [field]: ''
      }));
      return;
    }
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    const exists = profile.skills.some(s => s.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, trimmed]
      }));
      showToast(`Added skill "${trimmed}"`, 'success');
    } else {
      showToast(`Skill "${trimmed}" is already added`, 'info');
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.toLowerCase() !== skillToRemove.toLowerCase())
    }));
    showToast(`Removed skill "${skillToRemove}"`, 'info');
  };

  const handleResumeUpload = (file) => {
    if (!file) return false;
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      showToast('Error: Only PDF resumes are accepted', 'error');
      return false;
    }
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    setProfile(prev => ({
      ...prev,
      resume: {
        name: file.name,
        size: `${sizeMb} MB`,
        updatedAt: 'Just now',
        atsScore: Math.floor(82 + Math.random() * 14)
      }
    }));
    showToast('Resume uploaded and ATS calibrated successfully!', 'success');
    return true;
  };

  const saveProfile = (customProfile = null) => {
    const toSave = customProfile || profile;
    setProfileSaveTimestamp(Date.now());
    localStorage.setItem('cp_profile', JSON.stringify(toSave));
    localStorage.setItem('cp_profile_completed', 'true');
    showToast('Profile saved successfully.', 'success');
    return true;
  };

  const refreshCareerCalibration = (onComplete) => {
    setIsCalibrating(true);
    setTimeout(() => {
      setIsCalibrating(false);
      setProfileSaveTimestamp(Date.now());
      showToast('Career calibration updated with latest student competencies!', 'success');
      if (onComplete) onComplete();
    }, 1200);
  };

  // Compute profile completion percentage
  const profileCompletionPercentage = (() => {
    let filled = 0;
    let total = 8;
    if (profile.fullName) filled++;
    if (profile.email) filled++;
    if (profile.collegeName) filled++;
    if (profile.branch) filled++;
    if (profile.skills && profile.skills.length > 0) filled++;
    if (profile.resume) filled++;
    if (profile.githubUrl || profile.linkedinUrl) filled++;
    if (Number(profile.currentSemester) === 1 || profile.cgpa) filled++;
    return Math.round((filled / total) * 100);
  })();

  const isProfileCompleted = profileCompletionPercentage >= 60 && profile.skills.length > 0;

  return (
    <ProfileContext.Provider
      value={{
        profile,
        setProfile,
        updateProfile,
        addSkill,
        removeSkill,
        handleResumeUpload,
        saveProfile,
        refreshCareerCalibration,
        isCalibrating,
        isFirstSemester: Number(profile.currentSemester) === 1,
        isResumeRequired: Number(profile.currentSemester) > 1,
        profileSaveTimestamp,
        profileCompletionPercentage,
        isProfileCompleted
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within ProfileProvider');
  return context;
}
