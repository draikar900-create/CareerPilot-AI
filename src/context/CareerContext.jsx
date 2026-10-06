import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { TARGET_ROLES, getRoadmapForRole } from '../data/mockData';
import { useProfile } from './ProfileContext';
import { useToast } from './ToastContext';
import apiService from '../services/api';
import confetti from 'canvas-confetti';

const CareerContext = createContext();

export function CareerProvider({ children }) {
  const { profile, profileSaveTimestamp, isProfileCompleted, profileCompletionPercentage } = useProfile();
  const { showToast } = useToast();

  // For a fresh user, no role is selected until they choose one (or load demo)
  const [selectedRoleId, setSelectedRoleId] = useState(() => {
    return localStorage.getItem('cp_role') || null;
  });

  const [roadmapsState, setRoadmapsState] = useState(() => {
    const saved = localStorage.getItem('cp_roadmaps');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    const initial = {};
    TARGET_ROLES.forEach(r => {
      initial[r.id] = JSON.parse(JSON.stringify(getRoadmapForRole(r.id)));
    });
    return initial;
  });

  const [dailyStreak, setDailyStreak] = useState(() => {
    return Number(localStorage.getItem('cp_streak') || 0);
  });
  const [streakActiveToday, setStreakActiveToday] = useState(false);

  // Test Results start empty for new user
  const [testResults, setTestResults] = useState(() => {
    const saved = localStorage.getItem('cp_test_results');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      taken: false,
      score: 0,
      aptitudeScore: 0,
      techScore: 0,
      commScore: 0,
      strengths: [],
      weaknesses: [],
      recommendations: []
    };
  });

  // Track applied internships and pinned projects
  const [appliedInternships, setAppliedInternships] = useState([]);
  const [pinnedProjects, setPinnedProjects] = useState([]);

  useEffect(() => {
    if (selectedRoleId) {
      localStorage.setItem('cp_role', selectedRoleId);
    } else {
      localStorage.removeItem('cp_role');
    }
  }, [selectedRoleId]);

  useEffect(() => {
    localStorage.setItem('cp_test_results', JSON.stringify(testResults));
  }, [testResults]);

  useEffect(() => {
    let isMounted = true;
    if (!profile?.user_id) {
      setTestResults({
        taken: false,
        score: 0,
        aptitudeScore: 0,
        techScore: 0,
        commScore: 0,
        strengths: [],
        weaknesses: [],
        recommendations: []
      });
      localStorage.removeItem('cp_test_results');
      return;
    }

    apiService.getLatestAssessmentResult().then(res => {
      if (isMounted && res && res.success && res.result) {
        setTestResults(res.result);
      }
    }).catch(err => {
      console.warn('Could not load latest assessment result from backend:', err.message);
    });
    return () => { isMounted = false; };
  }, [profile?.user_id, profileSaveTimestamp]);

  useEffect(() => {
    localStorage.setItem('cp_streak', dailyStreak.toString());
  }, [dailyStreak]);

  const currentRole = useMemo(() => {
    if (!selectedRoleId) return null;
    return TARGET_ROLES.find(r => r.id === selectedRoleId) || null;
  }, [selectedRoleId]);

  const currentRoadmap = useMemo(() => {
    if (!selectedRoleId) return [];
    return roadmapsState[selectedRoleId] || getRoadmapForRole(selectedRoleId);
  }, [roadmapsState, selectedRoleId]);

  // Dynamic calculation of completed roadmap topics
  const roadmapStats = useMemo(() => {
    if (!currentRoadmap || currentRoadmap.length === 0) {
      return { totalTopics: 0, completedTopics: 0, percentage: 0 };
    }
    let totalTopics = 0;
    let completedTopics = 0;
    currentRoadmap.forEach(phase => {
      phase.topics.forEach(t => {
        totalTopics++;
        if (t.completed) completedTopics++;
      });
    });
    const percentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    return { totalTopics, completedTopics, percentage };
  }, [currentRoadmap]);

  // DYNAMIC SKILL COMPARISON (Student Skills VS Role Required Skills)
  const skillComparison = useMemo(() => {
    if (!currentRole || !profile.skills || profile.skills.length === 0) {
      return {
        hasSkills: profile.skills && profile.skills.length > 0,
        hasRole: !!currentRole,
        studentSkills: profile.skills || [],
        matchedSkills: [],
        missingSkills: currentRole ? currentRole.requiredSkills : [],
        matchPercentage: 0,
        gapSeverity: 'None'
      };
    }

    const studentSkillsLower = profile.skills.map(s => s.trim().toLowerCase());

    const matched = [];
    const missing = [];

    currentRole.requiredSkills.forEach(req => {
      const reqLower = req.name.toLowerCase();
      // Check exact match or partial match e.g. "React" matching "React.js"
      const isMatched = studentSkillsLower.some(
        s => s === reqLower || s.includes(reqLower) || reqLower.includes(s)
      );
      if (isMatched) {
        matched.push(req);
      } else {
        missing.push(req);
      }
    });

    const totalReq = currentRole.requiredSkills.length;
    const matchPercentage = totalReq > 0 ? Math.round((matched.length / totalReq) * 100) : 0;

    let gapSeverity = 'Low';
    if (matchPercentage < 35) gapSeverity = 'High';
    else if (matchPercentage < 70) gapSeverity = 'Medium';

    return {
      hasSkills: profile.skills.length > 0,
      hasRole: true,
      studentSkills: profile.skills,
      matchedSkills: matched,
      missingSkills: missing,
      matchPercentage,
      gapSeverity
    };
  }, [currentRole, profile.skills, profileSaveTimestamp]);

  // DYNAMIC READINESS SCORE (Rule 5: No Profile Completed => 0%)
  const readinessScore = useMemo(() => {
    // If no skills added and no role selected: 0%
    if (!profile.skills || profile.skills.length === 0) {
      return 0;
    }
    if (!currentRole) {
      return 0;
    }

    // Weighted dynamic formula based strictly on:
    // 1. Skill Match with target role (50%)
    // 2. Profile Completeness (20%)
    // 3. Roadmap milestones completed (15%)
    // 4. Standardized test score (15%)
    const skillPart = (skillComparison.matchPercentage / 100) * 50;
    const profilePart = (profileCompletionPercentage / 100) * 20;
    const roadmapPart = (roadmapStats.percentage / 100) * 15;
    const testPart = testResults.taken ? (testResults.score / 100) * 15 : 0;

    const total = Math.round(skillPart + profilePart + roadmapPart + testPart);
    return Math.min(100, Math.max(0, total));
  }, [profile.skills, currentRole, skillComparison, profileCompletionPercentage, roadmapStats, testResults]);

  const selectDreamRole = (roleId) => {
    setSelectedRoleId(roleId);
    const roleObj = TARGET_ROLES.find(r => r.id === roleId);
    showToast(`Dream role set to "${roleObj?.title}"!`, 'success');
  };

  // State for Database-persisted AI Roadmap
  const [dbRoadmap, setDbRoadmap] = useState(null);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);

  useEffect(() => {
    let isMounted = true;
    apiService.getRoadmap().then(res => {
      if (isMounted && res && res.success && res.roadmap) {
        setDbRoadmap(res.roadmap);
      }
    }).catch(err => {
      console.warn('Could not load database roadmap:', err.message);
    });
    return () => { isMounted = false; };
  }, [profileSaveTimestamp]);

  const regenerateAIRoadmap = async (targetRoleTitle) => {
    setIsGeneratingRoadmap(true);
    try {
      const res = await apiService.generateRoadmap(targetRoleTitle || currentRole?.title || 'Software Engineer');
      if (res && res.success && res.roadmap) {
        setDbRoadmap(res.roadmap);
        showToast('Personalized AI Roadmap generated successfully!', 'success');
        return res.roadmap;
      } else {
        showToast('AI Roadmap generation failed. Preserving previous roadmap.', 'error');
      }
    } catch (err) {
      console.error('Error generating AI roadmap:', err);
      showToast('AI Roadmap service error: ' + err.message, 'error');
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const toggleTopicCompletion = async (phaseIdx, topicId) => {
    // 1. Local optimistic update in dbRoadmap
    let nextCompletedState = true;
    if (dbRoadmap && dbRoadmap.structured_data && dbRoadmap.structured_data.milestones) {
      const updatedData = { ...dbRoadmap.structured_data };
      const phase = updatedData.milestones[phaseIdx];
      if (phase && phase.topics) {
        const topic = phase.topics.find(t => t.id === topicId);
        if (topic) {
          nextCompletedState = !topic.completed;
          topic.completed = nextCompletedState;
        }
      }
      setDbRoadmap({ ...dbRoadmap, structured_data: updatedData });
    }

    if (nextCompletedState) {
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      } catch (e) {}
      showToast('Milestone completed!', 'success');
      if (!streakActiveToday) {
        setDailyStreak(s => s + 1);
        setStreakActiveToday(true);
      }
    }

    // 2. Persist to backend database
    try {
      const res = await apiService.toggleRoadmapTopic(phaseIdx, topicId, nextCompletedState);
      if (res && res.success && res.roadmap) {
        setDbRoadmap(res.roadmap);
      }
    } catch (err) {
      console.warn('Failed to sync topic completion to database:', err.message);
    }
  };

  const completeDailyStreak = () => {
    if (!streakActiveToday) {
      setDailyStreak(prev => prev + 1);
      setStreakActiveToday(true);
      showToast(`Streak incremented: ${dailyStreak + 1} days`, 'success');
    }
  };

  const submitTestAnswers = (answers) => {
    console.warn('submitTestAnswers is deprecated; assessments are evaluated server-authoritatively via apiService.submitAssessmentAttempt.');
    return testResults;
  };

  return (
    <CareerContext.Provider
      value={{
        dbRoadmap,
        isGeneratingRoadmap,
        regenerateAIRoadmap,
        targetRoles: TARGET_ROLES,
        selectedRoleId,
        setSelectedRoleId,
        currentRole,
        currentRoadmap,
        roadmapStats,
        skillComparison,
        readinessScore,
        dailyStreak,
        streakActiveToday,
        completeDailyStreak,
        selectDreamRole,
        toggleTopicCompletion,
        testResults,
        setTestResults,
        submitTestAnswers,
        appliedInternships,
        setAppliedInternships,
        pinnedProjects,
        setPinnedProjects
      }}
    >
      {children}
    </CareerContext.Provider>
  );
}

export function useCareer() {
  const context = useContext(CareerContext);
  if (!context) throw new Error('useCareer must be used within CareerProvider');
  return context;
}
