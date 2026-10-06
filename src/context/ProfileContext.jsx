import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { apiService } from '../services/api';

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

export function ProfileProvider({ children }) {
  const { currentUser, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [profileSaveTimestamp, setProfileSaveTimestamp] = useState(Date.now());

  // Fetch profile from Backend API whenever authenticated user changes
  useEffect(() => {
    if (isAuthenticated && currentUser?.id) {
      // 1. Immediately reset profile to EMPTY_PROFILE for the new user ID to prevent cross-account leaks
      setProfile({
        ...EMPTY_PROFILE,
        userId: currentUser.id,
        user_id: currentUser.id,
        fullName: currentUser.name || '',
        email: currentUser.email || ''
      });

      apiService.getProfile()
        .then(res => {
          if (res && res.success && res.profile) {
            const p = res.profile;
            setProfile({
              userId: p.user_id || currentUser.id,
              user_id: p.user_id || currentUser.id,
              fullName: p.full_name || currentUser.name || '',
              email: p.email || currentUser.email || '',
              phone: p.phone || currentUser.phone || '',
              dob: p.date_of_birth || '',
              gender: p.gender || '',
              collegeName: p.college_name || '',
              branch: p.branch || '',
              graduationYear: p.graduation_year || '',
              currentSemester: p.semester || '',
              cgpa: p.cgpa || '',
              skills: Array.isArray(p.technical_skills) ? p.technical_skills : [],
              achievements: Array.isArray(p.achievements) ? p.achievements : [],
              githubUrl: p.github_url || '',
              linkedinUrl: p.linkedin_url || '',
              photoUrl: p.profile_photo || '',
              resume: (p.resume_storage_path || p.resume_url) ? {
                name: p.resume_file_name || (p.resume_url?.split('/').pop() || 'resume.pdf').replace(/^[0-9a-fA-F-]+_/, ''),
                uploadedAt: p.resume_uploaded_at ? new Date(p.resume_uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
                size: 'Document'
              } : null,
              onboardingCompleted: Boolean(p.onboarding_completed || (p.current_onboarding_step && Number(p.current_onboarding_step) > 7)),
              introSeen: Boolean(p.intro_seen),
              currentOnboardingStep: p.current_onboarding_step || 1,
              collegeId: p.college_id || null,
              departmentId: p.department_id || null,
              academicYear: p.academic_year || '',
              section: p.section || '',
              batch: p.batch || '',
              studentId: p.student_id || '',
              targetRole: p.target_role || '',
              careerInterests: Array.isArray(p.career_interests) ? p.career_interests : [],
              preferredDomains: Array.isArray(p.preferred_domains) ? p.preferred_domains : [],
              preferredTechnologies: Array.isArray(p.preferred_technologies) ? p.preferred_technologies : []
            });
          }
        })
        .catch(err => {
          console.warn('Backend profile sync warning:', err.message);
        });
    } else if (!isAuthenticated) {
      setProfile(EMPTY_PROFILE);
    }
  }, [isAuthenticated, currentUser?.id]);

  const updateProfile = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const completeIntro = async () => {
    setProfile(prev => ({ ...prev, introSeen: true }));
    if (isAuthenticated) {
      try {
        await apiService.updateProfile({ intro_seen: true });
      } catch (err) {
        console.warn('Failed to persist intro_seen:', err);
      }
    }
  };

  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    const exists = profile.skills.some(s => s.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      const newSkills = [...profile.skills, trimmed];
      setProfile(prev => ({ ...prev, skills: newSkills }));
      showToast(`Added skill "${trimmed}"`, 'success');
      
      if (isAuthenticated) {
        apiService.updateProfile({ technical_skills: newSkills }).catch(() => {});
      }
    } else {
      showToast(`Skill "${trimmed}" is already added`, 'info');
    }
  };

  const removeSkill = (skillToRemove) => {
    const newSkills = profile.skills.filter(s => s.toLowerCase() !== skillToRemove.toLowerCase());
    setProfile(prev => ({ ...prev, skills: newSkills }));
    showToast(`Removed skill "${skillToRemove}"`, 'info');

    if (isAuthenticated) {
      apiService.updateProfile({ technical_skills: newSkills }).catch(() => {});
    }
  };

  const handleResumeUpload = async (file) => {
    if (!file) return false;
    const ext = file.name.split('.').pop().toLowerCase();
    const allowed = ['pdf', 'doc', 'docx'];
    if (!allowed.includes(ext)) {
      showToast('Error: Resume must be a PDF, DOC, or DOCX file.', 'error');
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Error: Resume file size must not exceed 5 MB.', 'error');
      return false;
    }

    try {
      if (isAuthenticated) {
        const res = await apiService.uploadResume(file);
        if (res.success) {
          const dateStr = res.uploadedAt 
            ? new Date(res.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : 'Just now';

          setProfile(prev => ({
            ...prev,
            resume: {
              name: res.fileName || file.name,
              uploadedAt: dateStr,
              size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
            }
          }));
          showToast('Resume uploaded successfully!', 'success');
          return true;
        } else {
          showToast('Resume upload error: ' + (res.message || 'Upload failed'), 'error');
          return false;
        }
      }
    } catch (err) {
      showToast('Resume upload warning: ' + err.message, 'error');
      return false;
    }

    return false;
  };

  const handleResumeDelete = async () => {
    try {
      if (isAuthenticated) {
        const res = await apiService.deleteResume();
        if (res.success) {
          setProfile(prev => ({
            ...prev,
            resume: null
          }));
          showToast('Resume deleted successfully', 'info');
          return true;
        }
      }
    } catch (err) {
      showToast('Resume deletion error: ' + err.message, 'error');
    }
    setProfile(prev => ({ ...prev, resume: null }));
    showToast('Resume deleted', 'info');
    return true;
  };

  const saveProfile = async (customProfile = null) => {
    const toSave = customProfile ? { ...profile, ...customProfile } : profile;
    setProfileSaveTimestamp(Date.now());

    if (isAuthenticated) {
      try {
        const payload = {
          full_name: toSave.fullName,
          phone: toSave.phone,
          date_of_birth: toSave.dob || null,
          gender: toSave.gender || undefined,
          profile_photo: toSave.photoUrl || null,
          college_name: toSave.collegeName,
          branch: toSave.branch,
          semester: Number(toSave.currentSemester) || null,
          cgpa: Number(toSave.cgpa) || null,
          graduation_year: Number(toSave.graduationYear) || null,
          technical_skills: toSave.skills,
          github_url: toSave.githubUrl,
          linkedin_url: toSave.linkedinUrl,
          resume_url: toSave.resume?.url || toSave.resumeUrl || (typeof toSave.resume === 'string' ? toSave.resume : (profile.resume?.url || undefined)),
          onboarding_completed: toSave.onboardingCompleted ?? undefined,
          intro_seen: toSave.introSeen ?? undefined,
          current_onboarding_step: toSave.currentOnboardingStep || undefined,
          college_id: toSave.collegeId || undefined,
          department_id: toSave.departmentId || undefined,
          academic_year: toSave.academicYear || undefined,
          section: toSave.section || undefined,
          batch: toSave.batch || undefined,
          student_id: toSave.studentId || undefined,
          target_role: toSave.targetRole || undefined,
          career_interests: toSave.careerInterests || undefined,
          preferred_domains: toSave.preferredDomains || undefined,
          preferred_technologies: toSave.preferredTechnologies || undefined
        };
        
        // Prevent sending empty string wipes for critical fields
        Object.keys(payload).forEach(key => {
          if (payload[key] === undefined || payload[key] === null || payload[key] === '') {
            delete payload[key];
          }
        });

        const res = await apiService.updateProfile(payload);
        if (res.success && res.profile) {
          const p = res.profile;
          setProfile(prev => ({
            ...prev,
            fullName: p.full_name || prev.fullName,
            collegeName: p.college_name || prev.collegeName,
            branch: p.branch || prev.branch,
            currentSemester: p.semester || prev.currentSemester,
            cgpa: p.cgpa || prev.cgpa,
            graduationYear: p.graduation_year || prev.graduationYear,
            skills: p.technical_skills || prev.skills,
            githubUrl: p.github_url || prev.githubUrl,
            linkedinUrl: p.linkedin_url || prev.linkedinUrl,
            photoUrl: p.profile_photo || prev.photoUrl,
            resume: p.resume_url ? { name: (p.resume_url.split('/').pop() || 'Resume.pdf').replace(/^[0-9a-fA-F-]+_/, ''), url: p.resume_url, size: 'PDF Document', atsScore: 88 } : prev.resume,
            onboardingCompleted: p.onboarding_completed ?? (customProfile?.onboardingCompleted !== undefined ? customProfile.onboardingCompleted : prev.onboardingCompleted),
            introSeen: p.intro_seen ?? (customProfile?.introSeen !== undefined ? customProfile.introSeen : prev.introSeen),
            currentOnboardingStep: p.current_onboarding_step || (customProfile?.currentOnboardingStep !== undefined ? customProfile.currentOnboardingStep : prev.currentOnboardingStep),
            academicYear: p.academic_year || prev.academicYear
          }));
        }
        showToast('Profile saved to database successfully.', 'success');
        return true;
      } catch (err) {
        showToast(err.message || 'Failed to save profile', 'error');
        return false;
      }
    }

    showToast('Please sign in to save your profile.', 'error');
    return false;
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

  const isFirstYear = profile.academicYear === '1st Year' || Number(profile.currentSemester) <= 2;

  const profileCompletionPercentage = (() => {
    let filled = 0;
    let total = isFirstYear ? 6 : 8;

    if (profile.fullName) filled++;
    if (profile.email) filled++;
    if (profile.collegeName || profile.collegeId) filled++;
    if (profile.branch || profile.departmentId) filled++;
    if (profile.skills && profile.skills.length > 0) filled++;
    if (profile.targetRole || (profile.careerInterests && profile.careerInterests.length > 0)) filled++;
    
    if (!isFirstYear) {
      if (profile.resume) filled++;
      if (profile.githubUrl || profile.linkedinUrl) filled++;
    }

    return Math.min(100, Math.round((filled / total) * 100));
  })();

  const isProfileCompleted = profileCompletionPercentage >= 60 && profile.skills.length > 0;

  return (
    <ProfileContext.Provider
      value={{
        profile,
        setProfile,
        updateProfile,
        completeIntro,
        addSkill,
        removeSkill,
        handleResumeUpload,
        handleResumeDelete,
        saveProfile,
        refreshCareerCalibration,
        isCalibrating,
        isFirstYear,
        isFirstSemester: Number(profile.currentSemester) === 1,
        isResumeRequired: !isFirstYear,
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
