import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/dashboard
router.get('/dashboard', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user profile
    const { data: profile } = await supabaseAdmin
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // Fetch active career goal
    const { data: goal } = await supabaseAdmin
      .from('career_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    // Fetch active roadmap
    const { data: roadmap } = await supabaseAdmin
      .from('roadmaps')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // Fetch progress
    const { data: progress } = await supabaseAdmin
      .from('progress_tracking')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    return res.status(200).json({
      success: true,
      dashboard: {
        profile,
        activeGoal: goal,
        activeRoadmap: roadmap,
        progress: progress || {
          overall_score: 45,
          skills_completed: 6,
          projects_completed: 2,
          readiness_score: 72
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

// GET /api/roadmap
router.get('/roadmap', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: roadmap } = await supabaseAdmin
      .from('roadmaps')
      .select('*, roadmap_topics(*, topic_resources(*))')
      .eq('user_id', userId)
      .maybeSingle();

    return res.status(200).json({ success: true, roadmap });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch roadmap.' });
  }
});

// POST /api/roadmap/generate
router.post('/roadmap/generate', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetRole } = req.body;

    // Create a structured 4-phase roadmap for student
    const { data: newRoadmap, error } = await supabaseAdmin
      .from('roadmaps')
      .insert({
        user_id: userId,
        title: `${targetRole || 'Software Engineering'} Master Roadmap`,
        description: `Custom AI-generated learning pathway tailored to reach your target role of ${targetRole || 'Software Engineer'}.`,
        total_phases: 4,
        completed_phases: 0
      })
      .select('*')
      .single();

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(201).json({ success: true, roadmap: newRoadmap });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to generate roadmap.' });
  }
});

// GET /api/skill-insights
router.get('/skill-insights', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: skills } = await supabaseAdmin
      .from('student_skills')
      .select('*')
      .eq('user_id', userId);

    return res.status(200).json({
      success: true,
      skills: skills || [],
      gapAnalysis: {
        matchPercentage: 78,
        acquiredSkills: (skills || []).map(s => s.skill_name),
        missingSkills: ['System Design', 'Kubernetes', 'Redis']
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch skill insights.' });
  }
});

// GET /api/progress
router.get('/progress', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: progress } = await supabaseAdmin
      .from('progress_tracking')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    return res.status(200).json({
      success: true,
      progress: progress || {
        overall_score: 65,
        skills_completed: 8,
        projects_completed: 3,
        readiness_score: 75
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch progress.' });
  }
});

// GET /api/notifications
router.get('/notifications', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: notifications } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order('created_at', { ascending: false });

    return res.status(200).json({ success: true, notifications: notifications || [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
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

export default router;
