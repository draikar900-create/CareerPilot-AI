import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticateUser, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication and strict admin check middleware to ALL admin routes
router.use(authenticateUser, requireAdmin);

// GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const { count: studentCount } = await supabaseAdmin
      .from('student_profiles')
      .select('*', { count: 'exact', head: true });

    const { count: companyCount } = await supabaseAdmin
      .from('companies')
      .select('*', { count: 'exact', head: true });

    const { count: jobCount } = await supabaseAdmin
      .from('jobs')
      .select('*', { count: 'exact', head: true });

    return res.status(200).json({
      success: true,
      stats: {
        totalStudents: studentCount || 0,
        totalCompanies: companyCount || 0,
        activeJobs: jobCount || 0,
        placementRate: 84.5
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch admin dashboard statistics.' });
  }
});

// GET /api/admin/students
router.get('/students', async (req, res) => {
  try {
    const { data: students, error } = await supabaseAdmin
      .from('student_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.status(200).json({ success: true, students: students || [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch student records.' });
  }
});

// GET /api/admin/companies
router.get('/companies', async (req, res) => {
  try {
    const { data: companies } = await supabaseAdmin.from('companies').select('*');
    return res.status(200).json({ success: true, companies: companies || [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch companies.' });
  }
});

// GET /api/admin/jobs
router.get('/jobs', async (req, res) => {
  try {
    const { data: jobs } = await supabaseAdmin.from('jobs').select('*, companies(name, logo_url)');
    return res.status(200).json({ success: true, jobs: jobs || [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch jobs.' });
  }
});

// GET /api/admin/skills
router.get('/skills', async (req, res) => {
  try {
    const { data: skills } = await supabaseAdmin.from('skills').select('*').order('name');
    return res.status(200).json({ success: true, skills: skills || [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch skills.' });
  }
});

// POST /api/admin/skills
router.post('/skills', async (req, res) => {
  try {
    let { name, category } = req.body;
    name = (name || '').trim();
    if (!name) return res.status(400).json({ success: false, error: 'Skill name is required' });

    // Check duplicate (case-insensitive)
    const { data: existing } = await supabaseAdmin
      .from('skills')
      .select('id')
      .ilike('name', name)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ success: false, error: 'Skill already exists' });
    }

    const { data: skill, error } = await supabaseAdmin
      .from('skills')
      .insert({ name, category: category || 'Core Computer Science' })
      .select('*')
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.status(201).json({ success: true, data: skill });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to create skill.' });
  }
});

// PUT /api/admin/skills/:id
router.put('/skills/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let { name, category } = req.body;
    name = (name || '').trim();
    if (!name) return res.status(400).json({ success: false, error: 'Skill name is required' });

    // Check duplicate excluding self
    const { data: existing } = await supabaseAdmin
      .from('skills')
      .select('id')
      .ilike('name', name)
      .neq('id', id)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ success: false, error: 'Skill name already exists' });
    }

    const { data: skill, error } = await supabaseAdmin
      .from('skills')
      .update({ name, category, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, data: skill });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update skill.' });
  }
});

// DELETE /api/admin/skills/:id
router.delete('/skills/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('skills').delete().eq('id', id);
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to delete skill.' });
  }
});

// GET /api/admin/resources
router.get('/resources', async (req, res) => {
  try {
    const { data: resources } = await supabaseAdmin.from('resources').select('*');
    return res.status(200).json({ success: true, data: resources || [] });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch resources.' });
  }
});

// POST /api/admin/resources
router.post('/resources', async (req, res) => {
  try {
    const { title, category, description, url, is_free } = req.body;
    if (!title || !category || !url) return res.status(400).json({ success: false, error: 'Title, category, and URL are required.' });

    const { data, error } = await supabaseAdmin.from('resources').insert({
      title: title.trim(),
      category: category.trim(),
      description: description || '',
      url: url.trim(),
      is_free: is_free !== undefined ? is_free : true
    }).select('*').single();
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to create resource.' });
  }
});

// PUT /api/admin/resources/:id
router.put('/resources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, description, url, is_free } = req.body;
    if (!title || !category || !url) return res.status(400).json({ success: false, error: 'Title, category, and URL are required.' });

    const { data, error } = await supabaseAdmin.from('resources').update({
      title: title.trim(),
      category: category.trim(),
      description: description || '',
      url: url.trim(),
      is_free: is_free !== undefined ? is_free : true
    }).eq('id', id).select('*').single();
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update resource.' });
  }
});

// DELETE /api/admin/resources/:id
router.delete('/resources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('resources').delete().eq('id', id);
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to delete resource.' });
  }
});

// GET /api/admin/eligibility
router.get('/eligibility', async (req, res) => {
  try {
    const { data: rules } = await supabaseAdmin.from('eligibility_rules').select('*, jobs(title, company_id)');
    return res.status(200).json({ success: true, data: rules || [] });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch eligibility rules.' });
  }
});

// POST /api/admin/eligibility
router.post('/eligibility', async (req, res) => {
  try {
    const { job_id, min_cgpa, allowed_branches, max_backlogs } = req.body;
    if (!job_id) return res.status(400).json({ success: false, error: 'Job ID is required.' });

    const { data, error } = await supabaseAdmin.from('eligibility_rules').insert({
      job_id,
      min_cgpa: Number(min_cgpa) || 6.0,
      allowed_branches: Array.isArray(allowed_branches) ? allowed_branches : [],
      max_backlogs: Number(max_backlogs) || 0
    }).select('*').single();
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to create rule.' });
  }
});

// PUT /api/admin/eligibility/:id
router.put('/eligibility/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { job_id, min_cgpa, allowed_branches, max_backlogs } = req.body;
    if (!job_id) return res.status(400).json({ success: false, error: 'Job ID is required.' });

    const { data, error } = await supabaseAdmin.from('eligibility_rules').update({
      job_id,
      min_cgpa: Number(min_cgpa) || 6.0,
      allowed_branches: Array.isArray(allowed_branches) ? allowed_branches : [],
      max_backlogs: Number(max_backlogs) || 0
    }).eq('id', id).select('*').single();
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update rule.' });
  }
});

// DELETE /api/admin/eligibility/:id
router.delete('/eligibility/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('eligibility_rules').delete().eq('id', id);
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to delete rule.' });
  }
});

// GET /api/admin/banners
router.get('/banners', async (req, res) => {
  try {
    const { data: banners } = await supabaseAdmin.from('banners').select('*');
    return res.status(200).json({ success: true, banners: banners || [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch banners.' });
  }
});

// GET /api/admin/notifications
router.get('/notifications', async (req, res) => {
  try {
    const { data: notifications } = await supabaseAdmin.from('notifications').select('*').order('created_at', { ascending: false });
    return res.status(200).json({ success: true, data: notifications || [] });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch notifications.' });
  }
});

// POST /api/admin/notifications
router.post('/notifications', async (req, res) => {
  try {
    const { title, message, type, user_id } = req.body;
    if (!title || !message) return res.status(400).json({ success: false, error: 'Title and message are required.' });
    
    const { data: notif, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        title,
        message,
        type: type || 'info',
        user_id: user_id || null // NULL sends to all students
      })
      .select('*')
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.status(201).json({ success: true, data: notif });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to dispatch broadcast notification.' });
  }
});

// DELETE /api/admin/notifications/:id
router.delete('/notifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('notifications').delete().eq('id', id);
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to delete notification.' });
  }
});

export default router;
