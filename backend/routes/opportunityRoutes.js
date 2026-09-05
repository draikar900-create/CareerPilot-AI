import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticateUser, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// ========================================================
// COMPANIES API
// ========================================================

// GET /api/companies - Public/Student company directory
router.get('/companies', async (req, res) => {
  try {
    const { data: companies, error } = await supabaseAdmin
      .from('companies')
      .select('*')
      .order('name', { ascending: true });

    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.status(200).json({ success: true, companies: companies || [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch companies.' });
  }
});

// GET /api/companies/:id - Single company details
router.get('/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: company, error } = await supabaseAdmin
      .from('companies')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    // Fetch active jobs and internships for this company
    const [{ data: jobs }, { data: internships }] = await Promise.all([
      supabaseAdmin.from('jobs').select('*').eq('company_id', id).eq('status', 'Published'),
      supabaseAdmin.from('internships').select('*').eq('company_id', id).eq('status', 'Published')
    ]);

    return res.status(200).json({
      success: true,
      company: {
        ...company,
        activeJobs: jobs || [],
        activeInternships: internships || []
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch company details.' });
  }
});

// POST /api/admin/companies - Create company
router.post('/admin/companies', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { name, logo_url, website, description, industry, location, company_size } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Company name is required.' });
    }

    const payload = {
      name: name.trim(),
      logo_url: logo_url || '',
      website: website || '',
      description: description || ''
    };

    if (industry) payload.industry = industry;
    if (location) payload.location = location;
    if (company_size) payload.company_size = company_size;

    let { data: company, error } = await supabaseAdmin
      .from('companies')
      .insert(payload)
      .select('*')
      .single();

    if (error && error.message && error.message.includes('column')) {
      // Fallback for minimal schema (id, name, logo_url, website, description, created_at)
      const minimalPayload = {
        name: name.trim(),
        logo_url: logo_url || '',
        website: website || '',
        description: description || ''
      };

      const fallbackResult = await supabaseAdmin
        .from('companies')
        .insert(minimalPayload)
        .select('*')
        .single();

      company = fallbackResult.data;
      error = fallbackResult.error;
    }

    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.status(201).json({ success: true, message: 'Company added successfully.', company, data: company });
  } catch (err) {
    console.error('Error creating company:', err);
    return res.status(500).json({ success: false, message: 'Failed to create company: ' + err.message });
  }
});

// DELETE /api/admin/companies/:id
router.delete('/admin/companies/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('companies').delete().eq('id', id);
    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.status(200).json({ success: true, message: 'Company deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete company.' });
  }
});

// ========================================================
// INTERNSHIPS API
// ========================================================

// GET /api/internships - Published internships for students
router.get('/internships', async (req, res) => {
  try {
    // Attempt full relational select first
    const { data: internships, error } = await supabaseAdmin
      .from('internships')
      .select('*, companies(name, logo_url)')
      .order('created_at', { ascending: false });

    if (error) {
      // Fallback query if companies relationship is missing in current Supabase schema cache
      const { data: fallbackData } = await supabaseAdmin
        .from('internships')
        .select('*')
        .order('created_at', { ascending: false });

      return res.status(200).json({
        success: true,
        data: fallbackData || [],
        internships: fallbackData || []
      });
    }

    return res.status(200).json({
      success: true,
      data: internships || [],
      internships: internships || []
    });
  } catch (err) {
    console.error('Error in GET /api/internships:', err.message);
    return res.status(200).json({ success: true, data: [], internships: [] });
  }
});

// GET /api/internships/:id - Single internship details
router.get('/internships/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: internship, error } = await supabaseAdmin
      .from('internships')
      .select('*, companies(*)')
      .eq('id', id)
      .maybeSingle();

    if (error || !internship) {
      return res.status(404).json({ success: false, message: 'Internship not found.' });
    }

    return res.status(200).json({ success: true, internship });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch internship details.' });
  }
});

// POST /api/admin/internships - Create Internship
router.post('/admin/internships', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const {
      company_id, role_title, title, description, responsibilities, requirements,
      eligibility, required_skills, location, work_mode, duration, stipend,
      openings, deadline, status, external_url
    } = req.body;

    const internshipTitle = role_title || title;
    if (!internshipTitle || !company_id) {
      return res.status(400).json({ success: false, message: 'Company and Title are required.' });
    }

    const { data: internship, error } = await supabaseAdmin
      .from('internships')
      .insert({
        company_id,
        role_title: internshipTitle.trim(),
        description: description || '',
        responsibilities: responsibilities || '',
        requirements: requirements ? (Array.isArray(requirements) ? requirements : [requirements]) : [],
        eligibility: eligibility || '',
        required_skills: required_skills || [],
        location: location || 'Remote',
        work_mode: work_mode || 'On-site',
        duration: duration || '3 Months',
        stipend: stipend || 'Unpaid',
        openings: Number(openings) || 1,
        deadline: deadline || null,
        status: status || 'Published',
        external_url: external_url || ''
      })
      .select('*, companies(name, logo_url)')
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.status(201).json({ success: true, message: 'Internship created successfully.', internship });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create internship.' });
  }
});

// PUT /api/admin/internships/:id - Update Internship
router.put('/admin/internships/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      company_id, role_title, title, description, responsibilities, requirements,
      eligibility, required_skills, location, work_mode, duration, stipend,
      openings, deadline, status, external_url
    } = req.body;

    const internshipTitle = role_title || title;
    if (!internshipTitle || !company_id) {
      return res.status(400).json({ success: false, error: 'Company and Title are required.' });
    }

    const { data: internship, error } = await supabaseAdmin
      .from('internships')
      .update({
        company_id,
        role_title: internshipTitle.trim(),
        description: description || '',
        responsibilities: responsibilities || '',
        requirements: requirements ? (Array.isArray(requirements) ? requirements : [requirements]) : [],
        eligibility: eligibility || '',
        required_skills: required_skills || [],
        location: location || 'Remote',
        work_mode: work_mode || 'On-site',
        duration: duration || '3 Months',
        stipend: stipend || 'Unpaid',
        openings: Number(openings) || 1,
        deadline: deadline || null,
        status: status || 'Published',
        external_url: external_url || ''
      })
      .eq('id', id)
      .select('*, companies(name, logo_url)')
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, data: internship });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update internship.' });
  }
});

// DELETE /api/admin/internships/:id - Delete Internship
router.delete('/admin/internships/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('internships').delete().eq('id', id);
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to delete internship.' });
  }
});

// ========================================================
// JOBS API
// ========================================================

// GET /api/jobs - Published jobs for students
router.get('/jobs', async (req, res) => {
  try {
    const { data: jobs, error } = await supabaseAdmin
      .from('jobs')
      .select('*, companies(name, logo_url)')
      .order('created_at', { ascending: false });

    if (error) {
      // Fallback query if status column or relationship is not present
      const { data: fallbackData } = await supabaseAdmin
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      return res.status(200).json({
        success: true,
        data: fallbackData || [],
        jobs: fallbackData || []
      });
    }

    return res.status(200).json({
      success: true,
      data: jobs || [],
      jobs: jobs || []
    });
  } catch (err) {
    console.error('Error in GET /api/jobs:', err.message);
    return res.status(200).json({ success: true, data: [], jobs: [] });
  }
});

// GET /api/jobs/:id - Single job details
router.get('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: job, error } = await supabaseAdmin
      .from('jobs')
      .select('*, companies(*)')
      .eq('id', id)
      .maybeSingle();

    if (error || !job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    return res.status(200).json({ success: true, job });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch job details.' });
  }
});

// POST /api/admin/jobs - Create Job
router.post('/admin/jobs', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const {
      company_id, title, description, responsibilities, requirements, eligibility,
      required_skills, location, work_mode, employment_type, salary_package,
      experience, openings, deadline, status, external_url
    } = req.body;

    if (!title || !company_id) {
      return res.status(400).json({ success: false, error: 'Company and Job Title are required.' });
    }

    const { data: job, error } = await supabaseAdmin
      .from('jobs')
      .insert({
        company_id,
        title: title.trim(),
        description: description || '',
        responsibilities: responsibilities || '',
        requirements: requirements || '',
        eligibility: eligibility || '',
        required_skills: required_skills || [],
        location: location || 'On-site',
        work_mode: work_mode || 'On-site',
        employment_type: employment_type || 'Full-time',
        salary_package: salary_package || 'Not specified',
        experience: experience || 'Entry Level (0-1 yrs)',
        openings: Number(openings) || 1,
        deadline: deadline || null,
        status: status || 'Published',
        external_url: external_url || ''
      })
      .select('*, companies(name, logo_url)')
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.status(201).json({ success: true, data: job });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to create job.' });
  }
});

// PUT /api/admin/jobs/:id - Update Job
router.put('/admin/jobs/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      company_id, title, description, responsibilities, requirements, eligibility,
      required_skills, location, work_mode, employment_type, salary_package,
      experience, openings, deadline, status, external_url
    } = req.body;

    if (!title || !company_id) {
      return res.status(400).json({ success: false, error: 'Company and Job Title are required.' });
    }

    const { data: job, error } = await supabaseAdmin
      .from('jobs')
      .update({
        company_id,
        title: title.trim(),
        description: description || '',
        responsibilities: responsibilities || '',
        requirements: requirements || '',
        eligibility: eligibility || '',
        required_skills: required_skills || [],
        location: location || 'On-site',
        work_mode: work_mode || 'On-site',
        employment_type: employment_type || 'Full-time',
        salary_package: salary_package || 'Not specified',
        experience: experience || 'Entry Level (0-1 yrs)',
        openings: Number(openings) || 1,
        deadline: deadline || null,
        status: status || 'Published',
        external_url: external_url || ''
      })
      .eq('id', id)
      .select('*, companies(name, logo_url)')
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, data: job });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update job.' });
  }
});

// DELETE /api/admin/jobs/:id - Delete Job
router.delete('/admin/jobs/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('jobs').delete().eq('id', id);
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to delete job.' });
  }
});

// ========================================================
// APPLICATIONS API
// ========================================================

// POST /api/applications - Student applies for a job or internship
router.post('/applications', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { opportunity_type, job_id, internship_id, company_id } = req.body;

    if (!opportunity_type || (!job_id && !internship_id)) {
      return res.status(400).json({ success: false, message: 'Invalid application payload.' });
    }

    // 1. Verify student has uploaded a resume
    const { data: profile } = await supabaseAdmin
      .from('student_profiles')
      .select('resume_url')
      .eq('user_id', userId)
      .maybeSingle();

    if (!profile || !profile.resume_url) {
      return res.status(400).json({
        success: false,
        message: 'Please upload your resume in your profile before applying for opportunities.'
      });
    }

    // 2. Check for duplicate application
    const duplicateQuery = supabaseAdmin
      .from('applications')
      .select('id')
      .eq('user_id', userId);

    if (opportunity_type === 'job') {
      duplicateQuery.eq('job_id', job_id);
    } else {
      duplicateQuery.eq('internship_id', internship_id);
    }

    const { data: existingApp } = await duplicateQuery.maybeSingle();
    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this opportunity.'
      });
    }

    // 3. Create application
    const { data: application, error } = await supabaseAdmin
      .from('applications')
      .insert({
        user_id: userId,
        opportunity_type,
        job_id: opportunity_type === 'job' ? job_id : null,
        internship_id: opportunity_type === 'internship' ? internship_id : null,
        company_id: company_id || null,
        status: 'Applied',
        applied_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      application
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to submit application.' });
  }
});

// GET /api/applications/me - Get authenticated student's applications
router.get('/applications/me', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: applications, error } = await supabaseAdmin
      .from('applications')
      .select('*, jobs(*, companies(name, logo_url)), internships(*, companies(name, logo_url)), companies(name, logo_url)')
      .eq('user_id', userId)
      .order('applied_at', { ascending: false });

    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.status(200).json({ success: true, applications: applications || [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch student applications.' });
  }
});

// GET /api/admin/applications - Get all applications for admin console
router.get('/admin/applications', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { data: applications, error } = await supabaseAdmin
      .from('applications')
      .select('*, student_profiles!inner(*), jobs(*), internships(*), companies(*)')
      .order('applied_at', { ascending: false });

    if (error) {
      // Fallback query if relation metadata requires simple joins
      const { data: simpleApps } = await supabaseAdmin
        .from('applications')
        .select('*')
        .order('applied_at', { ascending: false });
      return res.status(200).json({ success: true, applications: simpleApps || [] });
    }

    return res.status(200).json({ success: true, applications: applications || [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch admin applications.' });
  }
});

// PATCH /api/admin/applications/:id/status - Update application status
router.patch('/admin/applications/:id/status', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected', 'Withdrawn'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid application status.' });
    }

    const { data: updatedApp, error } = await supabaseAdmin
      .from('applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.status(200).json({ success: true, message: `Application status updated to ${status}.`, application: updatedApp });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update application status.' });
  }
});

// ========================================================
// SAVED OPPORTUNITIES API
// ========================================================

// GET /api/saved-opportunities
router.get('/saved-opportunities', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: items, error } = await supabaseAdmin
      .from('saved_opportunities')
      .select('*, jobs(*, companies(name, logo_url)), internships(*, companies(name, logo_url))')
      .eq('user_id', userId);

    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.status(200).json({ success: true, savedOpportunities: items || [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch saved opportunities.' });
  }
});

// POST /api/saved-opportunities
router.post('/saved-opportunities', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { opportunity_type, job_id, internship_id } = req.body;

    const { data: savedItem, error } = await supabaseAdmin
      .from('saved_opportunities')
      .insert({
        user_id: userId,
        opportunity_type,
        job_id: opportunity_type === 'job' ? job_id : null,
        internship_id: opportunity_type === 'internship' ? internship_id : null
      })
      .select('*')
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.status(201).json({ success: true, savedItem });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to save opportunity.' });
  }
});

// ========================================================
// EVENTS API
// ========================================================

// GET /api/events - Real events from database
router.get('/events', async (req, res) => {
  try {
    const { data: events, error } = await supabaseAdmin
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.status(200).json({ success: true, events: events || [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch events.' });
  }
});

// POST /api/admin/events - Create real event
router.post('/admin/events', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { title, organizer, event_date, location, event_url, description } = req.body;
    if (!title || !event_date) {
      return res.status(400).json({ success: false, message: 'Event title and date are required.' });
    }

    const { data: event, error } = await supabaseAdmin
      .from('events')
      .insert({
        title: title.trim(),
        organizer: organizer || 'Placement Cell',
        event_date,
        location: location || 'Campus Auditorium',
        event_url: event_url || '',
        description: description || ''
      })
      .select('*')
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.status(201).json({ success: true, message: 'Event created successfully.', event });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create event.' });
  }
});

export default router;
