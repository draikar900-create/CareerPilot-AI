import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { TARGET_ROLES, getRoadmapForRole, READINESS_QUIZ_QUESTIONS } from '../data/mockData';
import { useProfile } from './ProfileContext';
import { useToast } from './ToastContext';
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

  const toggleTopicCompletion = (phaseIdx, topicId) => {
    if (!selectedRoleId) return;
    setRoadmapsState(prev => {
      const updatedList = [...(prev[selectedRoleId] || getRoadmapForRole(selectedRoleId))];
      const phase = { ...updatedList[phaseIdx] };
      phase.topics = phase.topics.map(t => {
        if (t.id === topicId) {
          const nextState = !t.completed;
          if (nextState) {
            try {
              confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
            } catch (e) {}
            showToast(`Milestone completed: "${t.title}"!`, 'success');
            // Advance streak if not done today
            if (!streakActiveToday) {
              setDailyStreak(s => s + 1);
              setStreakActiveToday(true);
            }
          }
          return { ...t, completed: nextState };
        }
        return t;
      });
      updatedList[phaseIdx] = phase;
      const nextMap = { ...prev, [selectedRoleId]: updatedList };
      localStorage.setItem('cp_roadmaps', JSON.stringify(nextMap));
      return nextMap;
    });
  };

  const completeDailyStreak = () => {
    if (!streakActiveToday) {
      setDailyStreak(prev => prev + 1);
      setStreakActiveToday(true);
      showToast(`🔥 Streak incremented! Now at ${dailyStreak + 1} day streak!`, 'success');
    }
  };

  const submitTestAnswers = (answers) => {
    let correctCount = 0;
    let aptCorrect = 0;
    let techCorrect = 0;
    let commCorrect = 0;

    READINESS_QUIZ_QUESTIONS.forEach(q => {
      const userAns = answers[q.id];
      if (userAns === q.answer) {
        correctCount++;
        if (q.section === 'Aptitude') aptCorrect++;
        if (q.section === 'Technical MCQs') techCorrect++;
        if (q.section === 'Communication') commCorrect++;
      }
    });

    const totalQuestions = READINESS_QUIZ_QUESTIONS.length;
    const finalScore = Math.round((correctCount / totalQuestions) * 100);

    const calculatedResults = {
      taken: true,
      score: finalScore,
      correctCount,
      totalQuestions,
      aptitudeScore: Math.round((aptCorrect / 5) * 100),
      techScore: Math.round((techCorrect / 5) * 100),
      commScore: Math.round((commCorrect / 5) * 100),
      strengths: [
        aptCorrect >= 3 ? 'Quantitative Deduction & Problem Solving' : 'Analytical Aptitude Basics',
        techCorrect >= 3 ? 'Core Computer Science & Architecture' : 'Foundational Computing',
        commCorrect >= 3 ? 'Professional Communication & STAR Technique' : 'Constructive Communication'
      ],
      weaknesses: [
        aptCorrect < 3 ? 'Speed Math & Probability Formulations' : 'Edge-case Combinatorics',
        techCorrect < 3 ? 'ACID Boundaries & Distributed Systems' : 'Performance Optimization',
        commCorrect < 3 ? 'Stakeholder Alignment' : 'Executive Summaries'
      ],
      recommendations: [
        'Practice targeted algorithmic patterns on NeetCode and LeetCode',
        'Review the System Design Primer for database and caching trade-offs',
        'Build and deploy a full-stack capstone project to demonstrate mastery'
      ]
    };

    setTestResults(calculatedResults);

    try {
      confetti({ particleCount: 100, spread: 90, origin: { y: 0.6 } });
    } catch (e) {}

    showToast(`Test completed! You scored ${finalScore}%. Readiness calibrated!`, 'success');
    return calculatedResults;
  };

  return (
    <CareerContext.Provider
      value={{
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
