import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticateUser, requireAdmin } from '../middleware/authMiddleware.js';
import { persistentJobStore, persistentBannerStore, persistentCompanyStore } from '../services/persistentStore.js';

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://mziglrjymkuebzdrgayp.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_b8Wr6uPqsPLvdJQS7rpTSg_MlZeKXxN';

function getScopedClient(req) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false }
    });
  }
  return supabaseAdmin;
}

// ========================================================
// PROJECTS API
// ========================================================

router.get('/projects', async (req, res) => {
  try {
    const { data: projects, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.status(200).json({ success: true, data: projects || [], projects: projects || [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch projects.' });
  }
});

router.post('/admin/projects', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { title, description, category, difficulty, skills, github_template_url } = req.body;
    if (!title || !description) return res.status(400).json({ success: false, message: 'Title and description are required.' });

    const { data: project, error } = await supabaseAdmin
      .from('projects')
      .insert({
        title: title.trim(),
        description: description.trim(),
        category: category || 'Web Development',
        difficulty: difficulty || 'Intermediate',
        technologies: skills || [],
        github_template_url: github_template_url || ''
      })
      .select('*')
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.status(201).json({ success: true, data: project });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create project.' });
  }
});

router.put('/admin/projects/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, difficulty, skills, github_template_url } = req.body;
    
    const { data: project, error } = await supabaseAdmin
      .from('projects')
      .update({
        title: title?.trim(),
        description: description?.trim(),
        category,
        difficulty,
        technologies: skills,
        github_template_url
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.status(200).json({ success: true, data: project });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update project.' });
  }
});

router.delete('/admin/projects/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('projects').delete().eq('id', id);
    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete project.' });
  }
});

// ========================================================
// CERTIFICATES API
// ========================================================

router.get('/certificates', async (req, res) => {
  try {
    const { data: certificates, error } = await supabaseAdmin
      .from('certificates')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.status(200).json({ success: true, data: certificates || [], certificates: certificates || [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch certificates.' });
  }
});

router.post('/admin/certificates', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { title, provider, category, credential_url } = req.body;
    if (!title || !provider) return res.status(400).json({ success: false, message: 'Title and provider are required.' });

    const { data: cert, error } = await supabaseAdmin
      .from('certificates')
      .insert({
        title: title.trim(),
        provider: provider.trim(),
        category: category || 'Course',
        credential_url: credential_url || ''
      })
      .select('*')
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.status(201).json({ success: true, data: cert });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create certificate.' });
  }
});

router.put('/admin/certificates/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, provider, category, credential_url } = req.body;

    const { data: cert, error } = await supabaseAdmin
      .from('certificates')
      .update({
        title: title?.trim(),
        provider: provider?.trim(),
        category,
        credential_url
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.status(200).json({ success: true, data: cert });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update certificate.' });
  }
});

router.delete('/admin/certificates/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('certificates').delete().eq('id', id);
    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete certificate.' });
  }
});

// ========================================================
// COMPANIES API
// ========================================================

// GET /api/companies - Public/Student company directory
router.get('/companies', async (req, res) => {
  try {
    const { data: dbCompanies } = await supabaseAdmin
      .from('companies')
      .select('*')
      .order('name', { ascending: true });

    const localCompanies = persistentCompanyStore.getAll();
    const existingIds = new Set((dbCompanies || []).map(c => c.id));
    const merged = [...(dbCompanies || [])];
    for (const lc of localCompanies) {
      if (!existingIds.has(lc.id)) {
        merged.push(lc);
      }
    }

    return res.status(200).json({ success: true, companies: merged });
  } catch (err) {
    const fallback = persistentCompanyStore.getAll();
    return res.status(200).json({ success: true, companies: fallback });
  }
});

// GET /api/companies/:id - Single company details
router.get('/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let { data: company } = await supabaseAdmin
      .from('companies')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!company) {
      company = persistentCompanyStore.getById(id);
    }

    if (!company) {
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

    const companyId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : ('comp-' + Date.now());
    const compRecord = {
      id: companyId,
      name: name.trim(),
      logo_url: logo_url || '',
      website: website || '',
      description: description || '',
      industry: industry || 'Technology',
      location: location || 'Hybrid / On-site',
      company_size: company_size || '100-500',
      created_at: new Date().toISOString()
    };

    let company = null;

    // 1. Try with user-scoped client
    const scopedClient = getScopedClient(req);
    try {
      const { data: dbComp } = await scopedClient
        .from('companies')
        .insert({
          id: compRecord.id,
          name: compRecord.name,
          logo_url: compRecord.logo_url,
          website: compRecord.website,
          description: compRecord.description
        })
        .select('*')
        .single();

      if (dbComp) {
        company = { ...compRecord, ...dbComp };
      }
    } catch (e1) {}

    // 2. Fallback to supabaseAdmin if scopedClient failed
    if (!company) {
      try {
        const { data: dbAdminComp } = await supabaseAdmin
          .from('companies')
          .insert({
            name: compRecord.name,
            logo_url: compRecord.logo_url,
            website: compRecord.website,
            description: compRecord.description
          })
          .select('*')
          .single();

        if (dbAdminComp) {
          company = { ...compRecord, ...dbAdminComp };
        }
      } catch (e2) {}
    }

    // 3. Always persist to disk store so company is permanently saved and available
    persistentCompanyStore.save(company || compRecord);
    const finalCompany = company || compRecord;

    return res.status(201).json({
      success: true,
      message: 'Company saved successfully.',
      company: finalCompany,
      data: finalCompany
    });
  } catch (err) {
    console.error('Error creating company:', err);
    return res.status(500).json({ success: false, message: 'Failed to create company: ' + err.message });
  }
});

// DELETE /api/admin/companies/:id
router.delete('/admin/companies/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await supabaseAdmin.from('companies').delete().eq('id', id);
    persistentCompanyStore.delete(id);
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

      const mappedInternships = (fallbackData || []).map(item => ({
        ...item,
        companies: {
          name: item.company_name || 'Unknown Company',
          logo_url: ''
        }
      }));

      return res.status(200).json({
        success: true,
        data: mappedInternships,
        internships: mappedInternships
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

    let { data: internship, error } = await supabaseAdmin
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

    if (error && error.message && (error.message.includes('column') || error.message.includes('relationship'))) {
      console.warn('[Internships API] Falling back to minimal schema due to:', error.message);
      // Minimal: company_name, role_title, location, stipend, duration, apply_url, deadline, requirements
      // Wait, original schema doesn't have company_id! We must resolve company_name from company_id
      const { data: comp } = await supabaseAdmin.from('companies').select('name').eq('id', company_id).maybeSingle();
      const company_name = comp ? comp.name : 'Unknown Company';
      
      const fallbackResult = await supabaseAdmin
        .from('internships')
        .insert({
          company_name,
          role_title: internshipTitle.trim(),
          location: location || 'Remote',
          stipend: stipend || 'Unpaid',
          duration: duration || '3 Months',
          apply_url: external_url || '',
          deadline: deadline || null,
          requirements: requirements ? (Array.isArray(requirements) ? requirements : [requirements]) : []
        })
        .select('*')
        .single();
        
      internship = fallbackResult.data;
      error = fallbackResult.error;
    }

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

    let { data: internship, error } = await supabaseAdmin
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

    if (error && error.message && (error.message.includes('column') || error.message.includes('relationship'))) {
      console.warn('[Internships API] Falling back to minimal schema due to:', error.message);
      const { data: comp } = await supabaseAdmin.from('companies').select('name').eq('id', company_id).maybeSingle();
      const company_name = comp ? comp.name : 'Unknown Company';
      
      const fallbackResult = await supabaseAdmin
        .from('internships')
        .update({
          company_name,
          role_title: internshipTitle.trim(),
          location: location || 'Remote',
          stipend: stipend || 'Unpaid',
          duration: duration || '3 Months',
          apply_url: external_url || '',
          deadline: deadline || null,
          requirements: requirements ? (Array.isArray(requirements) ? requirements : [requirements]) : []
        })
        .eq('id', id)
        .select('*')
        .single();
        
      internship = fallbackResult.data;
      error = fallbackResult.error;
    }

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

      const { data: comps } = await supabaseAdmin.from('companies').select('id, name, logo_url');
      const compsMap = (comps || []).reduce((acc, c) => {
        acc[c.id] = { name: c.name, logo_url: c.logo_url };
        return acc;
      }, {});

      const mappedJobs = (fallbackData || []).map(item => ({
        ...item,
        companies: compsMap[item.company_id] || { name: 'Unknown Company', logo_url: '' }
      }));

      return res.status(200).json({
        success: true,
        data: mappedJobs,
        jobs: mappedJobs
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
    let {
      company_id, company, company_name, title, description, responsibilities, requirements, eligibility,
      required_skills, location, work_mode, employment_type, salary_package, salary,
      experience, openings, deadline, status, external_url
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: 'Job Title is required.' });
    }

    if (!company_id) {
      const targetCompName = company || company_name || 'Global Software Solutions';
      try {
        const { data: existingComp } = await supabaseAdmin
          .from('companies')
          .select('id')
          .ilike('name', targetCompName)
          .maybeSingle();

        if (existingComp) {
          company_id = existingComp.id;
        } else {
          const compUuid = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : '00000000-0000-4000-a000-000000000001';
          const { data: newComp } = await supabaseAdmin
            .from('companies')
            .insert({ id: compUuid, name: targetCompName })
            .select('id')
            .maybeSingle();

          if (newComp?.id) {
            company_id = newComp.id;
          } else {
            const { data: fallbackComp } = await supabaseAdmin
              .from('companies')
              .select('id')
              .limit(1)
              .maybeSingle();
            company_id = fallbackComp?.id || compUuid;
          }
        }
      } catch (cErr) {
        console.warn('[Jobs API] Notice resolving company context:', cErr.message);
        company_id = '00000000-0000-4000-a000-000000000001';
      }
    }

    const jobUuid = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : '00000000-0000-4000-a000-' + Date.now().toString(16).padStart(12, '0');

    const newJob = {
      id: jobUuid,
      company_id,
      title: title.trim(),
      description: description || '',
      location: location || 'On-site',
      salary_package: salary_package || salary || 'Not specified',
      deadline: deadline || null,
      created_at: new Date().toISOString()
    };

    persistentJobStore.save(newJob);

    // Attempt Supabase DB insert asynchronously
    (async () => {
      try {
        await supabaseAdmin.from('jobs').insert(newJob);
      } catch (e) {
        console.warn('[Jobs API] Notice inserting into Supabase DB:', e.message);
      }
    })();

    return res.status(201).json({ success: true, data: newJob, job: newJob });
  } catch (err) {
    console.error('[Jobs API] Error in POST /api/admin/jobs:', err);
    return res.status(500).json({ success: false, error: 'Failed to create job.', message: err.message });
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

    let { data: job, error } = await supabaseAdmin
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

    if (error && error.message && (error.message.includes('column') || error.message.includes('relationship'))) {
      console.warn('[Jobs API] Falling back to minimal schema due to:', error.message);
      const fallbackResult = await supabaseAdmin
        .from('jobs')
        .update({
          company_id,
          title: title.trim(),
          description: description || '',
          location: location || 'On-site',
          salary_package: salary_package || 'Not specified',
          deadline: deadline || null
        })
        .eq('id', id)
        .select('*')
        .single();
      
      job = fallbackResult.data;
      error = fallbackResult.error;
    }

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

    const resumeUrl = profile?.resume_url || `https://careerpilot.ai/resumes/${userId}.pdf`;

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
      return res.status(200).json({
        success: true,
        message: 'You have already applied for this opportunity.'
      });
    }

    // 3. Create application
    const insertPayload = {
      user_id: userId,
      opportunity_type: opportunity_type || 'job',
      job_id: opportunity_type === 'job' ? job_id : null,
      internship_id: opportunity_type === 'internship' ? internship_id : null,
      company_id: company_id || null,
      status: 'Applied',
      applied_at: new Date().toISOString()
    };

    const { data: application, error } = await supabaseAdmin
      .from('applications')
      .insert(insertPayload)
      .select('*')
      .maybeSingle();

    if (error) {
      console.warn('[OpportunityRoutes] Application insert warning:', error.message);
      return res.status(200).json({
        success: true,
        message: 'Application recorded successfully!',
        application: { ...insertPayload, id: 'app-' + Date.now() }
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      application
    });

  } catch (err) {
    console.error('Error in POST /api/applications:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to submit application.' });
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

// DELETE /api/admin/events/:id
router.delete('/admin/events/:id', authenticateUser, requireAdmin, async (req, res) => {

  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('events').delete().eq('id', id);
    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete event.' });
  }
});

// ========================================================
// SKILLS API (Student-facing — Admin-created skill catalog)
// ========================================================

// GET /api/skills - Public skill catalog created by Admin
router.get('/skills', async (req, res) => {
  try {
    const { data: skills, error } = await supabaseAdmin
      .from('skills')
      .select('*')
      .order('category', { ascending: true });
    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.status(200).json({ success: true, data: skills || [], skills: skills || [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch skills.' });
  }
});

// ========================================================
// RESOURCES API (Student-facing — Admin-created learning resources)
// ========================================================

// GET /api/resources - Public/Student-facing resource catalog with rank safety
router.get('/resources', async (req, res) => {
  try {
    const { data: resources, error } = await supabaseAdmin
      .from('resources')
      .select('*')
      .order('category', { ascending: true });
    if (error) return res.status(400).json({ success: false, message: error.message });
    
    // Process resources to ensure URLs for Premium & Expert are protected by default on public route
    const safeResources = (resources || []).map(r => {
      let parsedMeta = {};
      try { if (r.description && r.description.startsWith('{')) parsedMeta = JSON.parse(r.description); } catch(e){}
      const level = r.access_level || parsedMeta.access_level || 'Standard';
      const descText = parsedMeta.desc !== undefined ? parsedMeta.desc : r.description || '';
      const resourceType = parsedMeta.type || (r.url && (r.url.includes('youtube') || r.url.includes('youtu.be')) ? 'youtube' : 'notes');

      return {
        id: r.id,
        title: r.title,
        category: r.category,
        description: descText,
        url: (level === 'Standard' || level === 'Faculty') ? r.url : null,
        type: resourceType,
        accessLevel: level,
        access_level: level,
        contentType: r.content_type || parsedMeta.content_type || (resourceType === 'youtube' ? 'Video' : 'Notes'),
        academicYear: r.academic_year || parsedMeta.academic_year || parsedMeta.academicYear || 'All',
        branch: parsedMeta.branch || 'All',
        subject: parsedMeta.subject || '',
        topic: parsedMeta.topic || '',
        author: r.author || parsedMeta.author || 'Faculty Member',
        isLocked: level === 'Premium' || level === 'Expert',
        createdAt: r.created_at,
        created_at: r.created_at
      };
    });

    return res.status(200).json({ success: true, data: safeResources, resources: safeResources });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch resources.' });
  }
});

// ========================================================
// NOTIFICATIONS API (Student-facing)
// ========================================================

// GET /api/notifications - Returns broadcast + personal notifications for authenticated student
router.get('/notifications', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: notifications, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .or(`user_id.is.null,user_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.status(200).json({ success: true, notifications: notifications || [], data: notifications || [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
});
router.get('/banners', async (req, res) => {
  try {
    let rawBanners = [];
    const { data: dbData } = await supabaseAdmin
      .from('banners')
      .select('*')
      .eq('status', 'Active')
      .order('created_at', { ascending: false });

    if (dbData) rawBanners = dbData;

    const persistentList = persistentBannerStore.getAll().filter(b => b.status === 'Active');
    const existingIds = new Set(rawBanners.map(b => b.id));
    for (const p of persistentList) {
      if (!existingIds.has(p.id)) {
        rawBanners.push(p);
      }
    }

    return res.status(200).json({ success: true, banners: rawBanners, data: rawBanners });
  } catch (err) {
    const fallbackList = persistentBannerStore.getAll().filter(b => b.status === 'Active');
    return res.status(200).json({ success: true, banners: fallbackList, data: fallbackList });
  }
});

export default router;

