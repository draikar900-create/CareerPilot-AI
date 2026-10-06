import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// ROLE SKILL REQUIREMENTS DICTIONARY
const ROLE_SKILL_REQUIREMENTS = {
  'Software Engineer': ['Data Structures', 'Algorithms', 'Java', 'Python', 'OOP', 'DBMS', 'Git', 'System Design'],
  'Full Stack Engineer': ['HTML/CSS', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'SQL', 'Git', 'System Design'],
  'Frontend Developer': ['HTML/CSS', 'JavaScript', 'TypeScript', 'React', 'Tailwind CSS', 'Git', 'REST API'],
  'Backend Developer': ['Node.js', 'Express', 'Python', 'Java', 'SQL', 'PostgreSQL', 'MongoDB', 'System Design', 'Git'],
  'Data Analyst': ['Python', 'SQL', 'Pandas', 'NumPy', 'Data Visualization', 'Statistics', 'Power BI', 'Excel'],
  'Data Scientist': ['Python', 'SQL', 'Pandas', 'NumPy', 'Scikit-Learn', 'Machine Learning', 'Statistics', 'Deep Learning'],
  'Cloud Engineer': ['Linux', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Shell Scripting', 'Networking', 'Terraform'],
  'DevOps Engineer': ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Shell Scripting', 'Git', 'Ansible'],
  'AI / ML Specialist': ['Python', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'Linear Algebra', 'MLOps', 'Git']
};

// GET /api/dashboard
router.get('/dashboard', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const meta = req.user.user_metadata || {};

    // 1. Fetch user profile & related counts in parallel
    const [
      profileRes,
      goalRes,
      roadmapRes,
      skillsRes,
      projectsRes,
      certsRes,
      readinessRes,
      predictionRes
    ] = await Promise.all([
      supabaseAdmin.from('student_profiles').select('*').eq('user_id', userId).maybeSingle(),
      supabaseAdmin.from('career_goals').select('*').eq('user_id', userId).eq('status', 'active').maybeSingle(),
      supabaseAdmin.from('roadmaps').select('*, roadmap_topics(*)').eq('user_id', userId).maybeSingle(),
      supabaseAdmin.from('student_skills').select('skill_name').eq('user_id', userId),
      supabaseAdmin.from('saved_projects').select('id', { count: 'exact' }).eq('user_id', userId),
      supabaseAdmin.from('saved_certificates').select('id', { count: 'exact' }).eq('user_id', userId),
      supabaseAdmin.from('readiness_attempts').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
      supabaseAdmin.from('placement_predictions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle()
    ]);

    const profile = profileRes.data || {};
    const goal = goalRes.data || null;
    const roadmap = roadmapRes.data || null;

    // Combined skills list from DB table + profile JSON column
    const dbSkills = (skillsRes.data || []).map(s => s.skill_name);
    const profileTechSkills = Array.isArray(profile.technical_skills) ? profile.technical_skills : [];
    const allSkills = Array.from(new Set([...dbSkills, ...profileTechSkills]));

    const skillsCount = allSkills.length;
    const projectsCount = projectsRes.count || 0;
    const certsCount = certsRes.count || 0;

    // Latest readiness assessment score
    const completedAttempt = (readinessRes.data || []).find(a => a.category && a.category.includes('SUBMITTED'));
    const readinessScore = completedAttempt ? Number(completedAttempt.score) : 0;
    let readinessRank = null;
    if (completedAttempt && completedAttempt.category) {
      const parts = completedAttempt.category.split(' | ');
      readinessRank = parts[1] || (readinessScore >= 85 ? 'Platinum' : readinessScore >= 70 ? 'Gold' : 'Silver');
    }

    // Latest ML prediction
    const prediction = predictionRes.data || null;
    const placementProbability = prediction && prediction.probability ? Math.round(Number(prediction.probability) * 100) : null;

    // Calculate real profile completion percentage & missing fields
    const requiredChecklist = [
      { key: 'full_name', title: 'Full Name', value: profile.full_name || meta.full_name },
      { key: 'email', title: 'Email Address', value: profile.email || req.user.email },
      { key: 'branch', title: 'Branch / Major', value: profile.branch || meta.branch },
      { key: 'semester', title: 'Current Semester', value: profile.semester || meta.semester },
      { key: 'cgpa', title: 'CGPA', value: profile.cgpa && profile.cgpa > 0 ? profile.cgpa : null },
      { key: 'target_role', title: 'Target Career Role', value: meta.target_role || goal?.target_role || profile.target_role },
      { key: 'technical_skills', title: 'Technical Skills', value: skillsCount > 0 ? true : null },
      { key: 'resume', title: 'Upload Resume', value: meta.resume_storage_path || meta.resume_url || profile.resume_storage_path || profile.resume_url ? true : null },
      { key: 'github_url', title: 'GitHub Profile Link', value: profile.github_url || meta.github_url },
      { key: 'linkedin_url', title: 'LinkedIn Profile Link', value: profile.linkedin_url || meta.linkedin_url }
    ];

    const completedFields = requiredChecklist.filter(item => Boolean(item.value));
    const missingFields = requiredChecklist.filter(item => !item.value).map(item => ({
      key: item.key,
      title: item.title,
      action: `Add ${item.title}`
    }));

    const completionPercentage = Math.round((completedFields.length / requiredChecklist.length) * 100);

    // Roadmap Stats
    let totalTopics = 0;
    let completedTopics = 0;
    if (roadmap && Array.isArray(roadmap.roadmap_topics) && roadmap.roadmap_topics.length > 0) {
      totalTopics = roadmap.roadmap_topics.length;
      completedTopics = roadmap.roadmap_topics.filter(t => t.is_completed).length;
    } else if (roadmap && roadmap.description && roadmap.description.startsWith('{')) {
      try {
        const parsed = JSON.parse(roadmap.description);
        if (parsed.milestones) {
          parsed.milestones.forEach(m => {
            (m.topics || []).forEach(t => {
              totalTopics++;
              if (t.completed) completedTopics++;
            });
          });
        }
      } catch (e) {}
    }

    const roadmapPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    // Overall Progress Score Calculation
    const overallScore = Math.round(
      (completionPercentage * 0.25) +
      (readinessScore * 0.35) +
      (roadmapPercentage * 0.25) +
      (Math.min(100, (projectsCount * 25) + (certsCount * 15)) * 0.15)
    );

    return res.status(200).json({
      success: true,
      dashboard: {
        profile: {
          ...profile,
          full_name: profile.full_name || meta.full_name || 'Student',
          email: profile.email || req.user.email,
          academic_year: meta.academic_year || (profile.semester ? `${Math.ceil(profile.semester / 2)}${profile.semester <= 2 ? 'st' : profile.semester <= 4 ? 'nd' : profile.semester <= 6 ? 'rd' : 'th'} Year` : '1st Year'),
          target_role: meta.target_role || goal?.target_role || 'Software Engineer',
          skills: allSkills
        },
        profileCompletion: {
          percentage: completionPercentage,
          completedCount: completedFields.length,
          totalCount: requiredChecklist.length,
          missingFields,
          isCompleted: completionPercentage >= 80
        },
        activeGoal: goal,
        activeRoadmap: roadmap,
        roadmapStats: {
          totalTopics,
          completedTopics,
          percentage: roadmapPercentage
        },
        metrics: {
          skillsCount,
          projectsCount,
          certificatesCount: certsCount,
          readinessScore: completedAttempt ? readinessScore : null,
          readinessRank,
          placementProbability,
          placementStatus: prediction ? prediction.status : null
        },
        progress: {
          overall_score: overallScore,
          skills_completed: skillsCount,
          projects_completed: projectsCount,
          readiness_score: readinessScore,
          roadmap_percentage: roadmapPercentage
        }
      }
    });
  } catch (err) {
    console.error('Error in GET /api/dashboard:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch dashboard data.' });
  }
});

// GET /api/career-goal
router.get('/career-goal', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: goal } = await supabaseAdmin
      .from('career_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .maybeSingle();

    return res.status(200).json({ success: true, goal });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error fetching career goal.' });
  }
});

// POST /api/career-goal
router.post('/career-goal', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetRole, targetCompany, targetTimeline, focusSkills } = req.body;

    const { data: goal, error } = await supabaseAdmin
      .from('career_goals')
      .upsert({
        user_id: userId,
        target_role: targetRole || 'Full Stack Engineer',
        target_company: targetCompany || 'Top Tech Companies',
        target_timeline: targetTimeline || '6 Months',
        focus_skills: focusSkills || [],
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(200).json({ success: true, goal });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to save career goal.' });
  }
});

import { generatePersonalizedRoadmap } from '../services/aiRoadmapService.js';

// Helper to format roadmap object with parsed structured_data
function formatRoadmapResponse(roadmap) {
  if (!roadmap) return null;
  let structured_data = null;

  if (roadmap.structured_data) {
    if (typeof roadmap.structured_data === 'string') {
      try { structured_data = JSON.parse(roadmap.structured_data); } catch (e) {}
    } else {
      structured_data = roadmap.structured_data;
    }
  }

  if (!structured_data && roadmap.description) {
    const descStr = String(roadmap.description).trim();
    if (descStr.startsWith('{')) {
      try {
        structured_data = JSON.parse(descStr);
      } catch (e) {}
    }
  }

  if (typeof structured_data === 'string') {
    try { structured_data = JSON.parse(structured_data); } catch (e) {}
  }

  if (!structured_data || typeof structured_data !== 'object') {
    structured_data = {
      title: roadmap.title || 'Personalized Career Roadmap',
      description: typeof roadmap.description === 'string' && !roadmap.description.startsWith('{') ? roadmap.description : '',
      milestones: []
    };
  }

  if (!Array.isArray(structured_data.milestones) || structured_data.milestones.length === 0) {
    if (Array.isArray(roadmap.roadmap_topics) && roadmap.roadmap_topics.length > 0) {
      const phasesMap = {};
      roadmap.roadmap_topics.forEach((t) => {
        const pNum = t.phase_number || 1;
        if (!phasesMap[pNum]) {
          phasesMap[pNum] = {
            phaseNumber: pNum,
            semester: `Phase ${pNum}`,
            title: `Phase ${pNum} Foundations`,
            topics: []
          };
        }
        phasesMap[pNum].topics.push({
          id: t.id,
          title: t.title,
          description: t.description || '',
          hours: t.estimated_hours || 10,
          completed: t.is_completed || false
        });
      });
      structured_data.milestones = Object.values(phasesMap).sort((a, b) => a.phaseNumber - b.phaseNumber);
    }
  }

  return {
    ...roadmap,
    structured_data
  };
}

// GET /api/roadmap
router.get('/roadmap', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    let { data: roadmap } = await supabaseAdmin
      .from('roadmaps')
      .select('*, roadmap_topics(*, topic_resources(*))')
      .eq('user_id', userId)
      .maybeSingle();

    // If no roadmap exists yet in DB, auto-generate initial personalized AI roadmap
    if (!roadmap) {
      const structuredData = await generatePersonalizedRoadmap(userId);
      const totalPhases = structuredData.milestones ? structuredData.milestones.length : 4;
      const descPayload = JSON.stringify(structuredData);

      let newRoadmap = null;
      try {
        const { data: insData, error: insErr } = await supabaseAdmin
          .from('roadmaps')
          .insert({
            user_id: userId,
            title: structuredData.title || 'Personal Mastery Roadmap',
            description: descPayload,
            total_phases: totalPhases,
            completed_phases: 0
          })
          .select('*')
          .maybeSingle();

        if (!insErr && insData) {
          newRoadmap = insData;
          if (structuredData.milestones) {
            const topicInserts = [];
            structuredData.milestones.forEach((phase) => {
              phase.topics?.forEach((t, idx) => {
                topicInserts.push({
                  roadmap_id: newRoadmap.id,
                  phase_number: phase.phaseNumber || 1,
                  title: t.title,
                  description: t.description || '',
                  estimated_hours: t.hours || 10,
                  is_completed: false,
                  order_index: idx
                });
              });
            });
            if (topicInserts.length > 0) {
              await supabaseAdmin.from('roadmap_topics').insert(topicInserts).catch(() => {});
            }
          }
        }
      } catch (dbEx) {
        console.warn('Roadmap DB insert notice:', dbEx.message);
      }

      if (!newRoadmap) {
        newRoadmap = {
          id: `rm_${Date.now()}`,
          user_id: userId,
          title: structuredData.title || 'Personal Mastery Roadmap',
          description: descPayload,
          total_phases: totalPhases,
          completed_phases: 0,
          structured_data: structuredData
        };
      }

      roadmap = newRoadmap;
    }

    return res.status(200).json({ success: true, roadmap: formatRoadmapResponse(roadmap) });
  } catch (err) {
    console.error('Error in GET /api/roadmap:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch roadmap.' });
  }
});

// POST /api/roadmap/generate
router.post('/roadmap/generate', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetRole } = req.body;

    const structuredData = await generatePersonalizedRoadmap(userId, targetRole);
    const totalPhases = structuredData.milestones ? structuredData.milestones.length : 4;
    const descPayload = JSON.stringify(structuredData);

    // Delete previous roadmap topics for user if updating
    const { data: existingRoadmap } = await supabaseAdmin
      .from('roadmaps')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    let updatedRoadmap = null;
    let error = null;

    if (existingRoadmap) {
      await supabaseAdmin.from('roadmap_topics').delete().eq('roadmap_id', existingRoadmap.id);

      const res = await supabaseAdmin
        .from('roadmaps')
        .update({
          title: structuredData.title || `${targetRole || 'Software Engineering'} Master Roadmap`,
          description: descPayload,
          total_phases: totalPhases,
          completed_phases: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRoadmap.id)
        .select('*')
        .single();

      updatedRoadmap = res.data;
      error = res.error;
    } else {
      const res = await supabaseAdmin
        .from('roadmaps')
        .insert({
          user_id: userId,
          title: structuredData.title || `${targetRole || 'Software Engineering'} Master Roadmap`,
          description: descPayload,
          total_phases: totalPhases,
          completed_phases: 0
        })
        .select('*')
        .single();

      updatedRoadmap = res.data;
      error = res.error;
    }

    if (error) {
      console.error('Error inserting/updating roadmap in database:', error);
      return res.status(400).json({ success: false, message: error.message });
    }

    // Insert new relational topic records
    if (structuredData.milestones && updatedRoadmap) {
      const topicInserts = [];
      structuredData.milestones.forEach((phase) => {
        phase.topics?.forEach((t, idx) => {
          topicInserts.push({
            roadmap_id: updatedRoadmap.id,
            phase_number: phase.phaseNumber || 1,
            title: t.title,
            description: t.description || '',
            estimated_hours: t.hours || 10,
            is_completed: false,
            order_index: idx
          });
        });
      });
      if (topicInserts.length > 0) {
        const { error: insErr } = await supabaseAdmin.from('roadmap_topics').insert(topicInserts);
        if (insErr) console.error('Error inserting roadmap topics:', insErr);
      }
    }

    return res.status(200).json({ success: true, roadmap: formatRoadmapResponse(updatedRoadmap) });
  } catch (err) {
    console.error('Error in POST /api/roadmap/generate:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate personalized AI roadmap.' });
  }
});

// POST /api/roadmap/toggle-topic
router.post('/roadmap/toggle-topic', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { phaseIdx, topicId, completed } = req.body;

    const { data: roadmap } = await supabaseAdmin
      .from('roadmaps')
      .select('*, roadmap_topics(*)')
      .eq('user_id', userId)
      .maybeSingle();

    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found.' });
    }

    let structuredData = null;
    if (roadmap.description && roadmap.description.trim().startsWith('{')) {
      try {
        structuredData = JSON.parse(roadmap.description);
      } catch (e) {}
    }

    if (structuredData && structuredData.milestones && structuredData.milestones[phaseIdx]) {
      const phase = structuredData.milestones[phaseIdx];
      if (phase.topics) {
        phase.topics = phase.topics.map(t => t.id === topicId ? { ...t, completed } : t);
      }
    }

    // Calculate updated completion stats
    let totalTopics = 0;
    let completedTopics = 0;
    if (structuredData && structuredData.milestones) {
      structuredData.milestones.forEach(m => {
        (m.topics || []).forEach(t => {
          totalTopics++;
          if (t.completed) completedTopics++;
        });
      });
    }

    const completedPhases = Math.floor((completedTopics / Math.max(1, totalTopics)) * (roadmap.total_phases || 4));
    const updatedDescPayload = structuredData ? JSON.stringify(structuredData) : roadmap.description;

    const { data: updatedRoadmap, error } = await supabaseAdmin
      .from('roadmaps')
      .update({
        description: updatedDescPayload,
        completed_phases: completedPhases,
        updated_at: new Date().toISOString()
      })
      .eq('id', roadmap.id)
      .select('*')
      .single();

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(200).json({ success: true, roadmap: formatRoadmapResponse(updatedRoadmap) });
  } catch (err) {
    console.error('Error in POST /api/roadmap/toggle-topic:', err);
    return res.status(500).json({ success: false, message: 'Failed to update topic completion.' });
  }
});

// GET /api/skill-insights
router.get('/skill-insights', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const meta = req.user.user_metadata || {};

    const [skillsRes, profileRes, goalRes] = await Promise.all([
      supabaseAdmin.from('student_skills').select('*').eq('user_id', userId),
      supabaseAdmin.from('student_profiles').select('technical_skills, target_role').eq('user_id', userId).maybeSingle(),
      supabaseAdmin.from('career_goals').select('target_role').eq('user_id', userId).eq('status', 'active').maybeSingle()
    ]);

    const dbSkills = (skillsRes.data || []).map(s => s.skill_name);
    const profileTechSkills = Array.isArray(profileRes.data?.technical_skills) ? profileRes.data.technical_skills : [];
    const acquiredSkills = Array.from(new Set([...dbSkills, ...profileTechSkills]));

    const targetRole = meta.target_role || goalRes.data?.target_role || profileRes.data?.target_role || 'Software Engineer';
    const requiredSkills = ROLE_SKILL_REQUIREMENTS[targetRole] || ROLE_SKILL_REQUIREMENTS['Software Engineer'];

    const acquiredLower = new Set(acquiredSkills.map(s => String(s).trim().toLowerCase()));
    const matchedSkills = [];
    const missingSkills = [];

    requiredSkills.forEach(reqSkill => {
      const reqLower = reqSkill.toLowerCase();
      const isMatched = Array.from(acquiredLower).some(s => s.includes(reqLower) || reqLower.includes(s));
      if (isMatched) {
        matchedSkills.push(reqSkill);
      } else {
        missingSkills.push(reqSkill);
      }
    });

    const matchPercentage = requiredSkills.length > 0
      ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
      : 80;

    return res.status(200).json({
      success: true,
      skills: skillsRes.data || [],
      acquiredSkills,
      targetRole,
      gapAnalysis: {
        matchPercentage,
        matchedSkills,
        acquiredSkills,
        missingSkills,
        recommendedSkills: missingSkills.slice(0, 5)
      }
    });
  } catch (err) {
    console.error('Error in GET /api/skill-insights:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch skill insights.' });
  }
});

// GET /api/progress
router.get('/progress', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const [
      skillsRes,
      projectsRes,
      certsRes,
      readinessRes,
      roadmapRes,
      progressRes
    ] = await Promise.all([
      supabaseAdmin.from('student_skills').select('id', { count: 'exact' }).eq('user_id', userId),
      supabaseAdmin.from('saved_projects').select('id', { count: 'exact' }).eq('user_id', userId),
      supabaseAdmin.from('saved_certificates').select('id', { count: 'exact' }).eq('user_id', userId),
      supabaseAdmin.from('readiness_attempts').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
      supabaseAdmin.from('roadmaps').select('*, roadmap_topics(*)').eq('user_id', userId).maybeSingle(),
      supabaseAdmin.from('progress_tracking').select('*').eq('user_id', userId).maybeSingle()
    ]);

    const skillsCount = skillsRes.count || 0;
    const projectsCount = projectsRes.count || 0;
    const certsCount = certsRes.count || 0;

    const completedAttempt = (readinessRes.data || []).find(a => a.category && a.category.includes('SUBMITTED'));
    const readinessScore = completedAttempt ? Number(completedAttempt.score) : 0;

    let totalTopics = 0;
    let completedTopics = 0;
    const roadmap = roadmapRes.data;
    if (roadmap && Array.isArray(roadmap.roadmap_topics) && roadmap.roadmap_topics.length > 0) {
      totalTopics = roadmap.roadmap_topics.length;
      completedTopics = roadmap.roadmap_topics.filter(t => t.is_completed).length;
    }

    const roadmapPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    const computedOverall = Math.round(
      (readinessScore * 0.4) +
      (roadmapPercentage * 0.3) +
      (Math.min(100, (skillsCount * 10) + (projectsCount * 20) + (certsCount * 15)) * 0.3)
    );

    const progressData = {
      overall_score: progressRes.data?.overall_score || computedOverall,
      skills_completed: skillsCount,
      projects_completed: projectsCount,
      certificates_completed: certsCount,
      readiness_score: readinessScore,
      roadmap_percentage: roadmapPercentage
    };

    return res.status(200).json({
      success: true,
      progress: progressData
    });
  } catch (err) {
    console.error('Error in GET /api/progress:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch progress.' });
  }
});

// Saved Items Endpoints (Projects, Internships, Certificates, Resources)
router.get('/saved-items/:type', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.params;
    const tableName = `saved_${type}`;

    const { data: items, error } = await supabaseAdmin
      .from(tableName)
      .select('*')
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(200).json({ success: true, items: items || [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch saved items.' });
  }
});

router.post('/saved-items/:type', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.params;
    const tableName = `saved_${type}`;

    const { data: item, error } = await supabaseAdmin
      .from(tableName)
      .insert({
        user_id: userId,
        ...req.body
      })
      .select('*')
      .single();

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(201).json({ success: true, item });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to save item.' });
  }
});

// GET /api/colleges
router.get('/colleges', async (req, res) => {
  try {
    const { data: colleges, error } = await supabaseAdmin
      .from('colleges')
      .select('*')
      .order('name', { ascending: true });

    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, data: colleges || [] });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch colleges.' });
  }
});

// GET /api/departments/:collegeId
router.get('/departments/:collegeId', async (req, res) => {
  try {
    const { collegeId } = req.params;
    const { data: departments, error } = await supabaseAdmin
      .from('departments')
      .select('*')
      .eq('college_id', collegeId)
      .order('name', { ascending: true });

    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, data: departments || [] });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch departments.' });
  }
});

export default router;
