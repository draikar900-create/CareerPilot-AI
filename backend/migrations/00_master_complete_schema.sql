-- CAREERPILOT AI - CONSOLIDATED MASTER SCHEMA
-- Run this in your Supabase SQL Editor


-- ====================================
-- 01_schema.sql
-- ====================================
-- CAREERPILOT AI - SUPABASE POSTGRESQL SCHEMA & MIGRATIONS
-- Run this SQL in the Supabase SQL Editor to initialize all tables, indexes, and Row Level Security (RLS) policies.

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Student Profiles
CREATE TABLE IF NOT EXISTS public.student_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  profile_photo TEXT,
  date_of_birth DATE,
  college_name TEXT,
  branch TEXT,
  semester INTEGER CHECK (semester >= 1 AND semester <= 10),
  cgpa NUMERIC(3, 2) CHECK (cgpa >= 0.0 AND cgpa <= 10.0),
  graduation_year INTEGER,
  technical_skills TEXT[] DEFAULT '{}',
  achievements TEXT[] DEFAULT '{}',
  github_url TEXT,
  linkedin_url TEXT,
  resume_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Admin Users
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Admin' CHECK (role IN ('Admin', 'PlacementOfficer', 'SuperAdmin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Career Goals
CREATE TABLE IF NOT EXISTS public.career_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_role TEXT NOT NULL,
  target_company TEXT,
  target_timeline TEXT,
  target_salary TEXT,
  focus_skills TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Roadmaps
CREATE TABLE IF NOT EXISTS public.roadmaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES public.career_goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  total_phases INTEGER DEFAULT 1,
  completed_phases INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Roadmap Topics
CREATE TABLE IF NOT EXISTS public.roadmap_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  roadmap_id UUID NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  phase_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  estimated_hours INTEGER DEFAULT 5,
  is_completed BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Topic Resources
CREATE TABLE IF NOT EXISTS public.topic_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID NOT NULL REFERENCES public.roadmap_topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT DEFAULT 'article' CHECK (type IN ('article', 'video', 'course', 'documentation')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Projects & Saved Projects
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  technologies TEXT[] DEFAULT '{}',
  github_template_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.saved_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  custom_project_data JSONB,
  status TEXT DEFAULT 'bookmarked' CHECK (status IN ('bookmarked', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- 8. Internships & Saved Internships
CREATE TABLE IF NOT EXISTS public.internships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  location TEXT NOT NULL,
  stipend TEXT,
  duration TEXT,
  apply_url TEXT,
  deadline TIMESTAMPTZ,
  requirements TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.saved_internships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  internship_id UUID REFERENCES public.internships(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'saved' CHECK (status IN ('saved', 'applied', 'interviewing', 'offered', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, internship_id)
);

-- 9. Certificates & Saved Certificates
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  provider TEXT NOT NULL,
  category TEXT,
  credential_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.saved_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certificate_id UUID REFERENCES public.certificates(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'bookmarked' CHECK (status IN ('bookmarked', 'completed')),
  earned_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, certificate_id)
);

-- 10. Resources & Saved Resources
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  is_free BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.saved_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);

-- 11. Colleges & Events & Saved Events
CREATE TABLE IF NOT EXISTS public.colleges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  organizer TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  event_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.saved_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- 12. Skills & Student Skills
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  proficiency TEXT CHECK (proficiency IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_name)
);

-- 13. Readiness Questions, Attempts & Answers
CREATE TABLE IF NOT EXISTS public.readiness_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option_index INTEGER NOT NULL,
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.readiness_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  score NUMERIC(5, 2) NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.readiness_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES public.readiness_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.readiness_questions(id) ON DELETE CASCADE,
  selected_option_index INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL
);

-- 14. Progress Tracking
CREATE TABLE IF NOT EXISTS public.progress_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_score INTEGER DEFAULT 0,
  skills_completed INTEGER DEFAULT 0,
  projects_completed INTEGER DEFAULT 0,
  readiness_score INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Banners & Notifications & Settings
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL means broadcast
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notification_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  announcements BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.privacy_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'college_only')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.theme_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_mode TEXT DEFAULT 'dark' CHECK (theme_mode IN ('dark', 'light', 'system')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Companies, Jobs & Eligibility Rules
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  website TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  salary_package TEXT,
  description TEXT,
  deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.eligibility_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  min_cgpa NUMERIC(3, 2) DEFAULT 6.0,
  allowed_branches TEXT[] DEFAULT '{}',
  max_backlogs INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.student_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.student_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.student_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users access own career goals" ON public.career_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own roadmaps" ON public.roadmaps FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own saved projects" ON public.saved_projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own saved internships" ON public.saved_internships FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own saved certificates" ON public.saved_certificates FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own saved resources" ON public.saved_resources FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own saved events" ON public.saved_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own skills" ON public.student_skills FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own readiness attempts" ON public.readiness_attempts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own progress tracking" ON public.progress_tracking FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own or broadcast notifications" ON public.notifications FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);


-- ====================================
-- 02_jobs_update.sql
-- ====================================
-- Add missing columns to jobs table
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS responsibilities TEXT,
ADD COLUMN IF NOT EXISTS requirements TEXT,
ADD COLUMN IF NOT EXISTS eligibility TEXT,
ADD COLUMN IF NOT EXISTS required_skills TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS work_mode TEXT DEFAULT 'On-site',
ADD COLUMN IF NOT EXISTS employment_type TEXT DEFAULT 'Full-time',
ADD COLUMN IF NOT EXISTS experience TEXT,
ADD COLUMN IF NOT EXISTS openings INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Published',
ADD COLUMN IF NOT EXISTS external_url TEXT;

-- Add missing columns to internships table
ALTER TABLE public.internships
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS responsibilities TEXT,
ADD COLUMN IF NOT EXISTS eligibility TEXT,
ADD COLUMN IF NOT EXISTS required_skills TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS work_mode TEXT DEFAULT 'On-site',
ADD COLUMN IF NOT EXISTS openings INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Published',
ADD COLUMN IF NOT EXISTS external_url TEXT;


-- ====================================
-- 02_opportunities_applications.sql
-- ====================================
-- CAREERPILOT AI - MIGRATION 02: OPPORTUNITIES & APPLICATIONS SYSTEM
-- Run this SQL in the Supabase SQL Editor to support real Jobs, Internships, Companies, Applications, and Saved Opportunities.

-- 1. Ensure Companies table has all necessary fields
ALTER TABLE public.companies 
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS company_size TEXT;

-- 2. Upgrade Jobs table fields
ALTER TABLE public.jobs 
  ADD COLUMN IF NOT EXISTS responsibilities TEXT,
  ADD COLUMN IF NOT EXISTS requirements TEXT,
  ADD COLUMN IF NOT EXISTS eligibility TEXT,
  ADD COLUMN IF NOT EXISTS required_skills TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS work_mode TEXT DEFAULT 'On-site' CHECK (work_mode IN ('On-site', 'Remote', 'Hybrid')),
  ADD COLUMN IF NOT EXISTS employment_type TEXT DEFAULT 'Full-time' CHECK (employment_type IN ('Full-time', 'Part-time', 'Contract', 'Temporary')),
  ADD COLUMN IF NOT EXISTS experience TEXT,
  ADD COLUMN IF NOT EXISTS openings INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Published' CHECK (status IN ('Draft', 'Published', 'Closed', 'Archived')),
  ADD COLUMN IF NOT EXISTS external_url TEXT;

-- 3. Upgrade Internships table fields
ALTER TABLE public.internships 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS responsibilities TEXT,
  ADD COLUMN IF NOT EXISTS eligibility TEXT,
  ADD COLUMN IF NOT EXISTS required_skills TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS work_mode TEXT DEFAULT 'On-site' CHECK (work_mode IN ('On-site', 'Remote', 'Hybrid')),
  ADD COLUMN IF NOT EXISTS openings INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Published' CHECK (status IN ('Draft', 'Published', 'Closed', 'Archived')),
  ADD COLUMN IF NOT EXISTS external_url TEXT;

-- 4. Create Applications Table
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_type TEXT NOT NULL CHECK (opportunity_type IN ('job', 'internship')),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  internship_id UUID REFERENCES public.internships(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'Applied' CHECK (status IN ('Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected', 'Withdrawn')),
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_opportunity_id CHECK (
    (opportunity_type = 'job' AND job_id IS NOT NULL AND internship_id IS NULL) OR
    (opportunity_type = 'internship' AND internship_id IS NOT NULL AND job_id IS NULL)
  )
);

-- Unique constraints to prevent duplicate applications
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_job_application ON public.applications (user_id, job_id) WHERE job_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_internship_application ON public.applications (user_id, internship_id) WHERE internship_id IS NOT NULL;

-- 5. Create Saved Opportunities Table
CREATE TABLE IF NOT EXISTS public.saved_opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_type TEXT NOT NULL CHECK (opportunity_type IN ('job', 'internship')),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  internship_id UUID REFERENCES public.internships(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_saved_opportunity_id CHECK (
    (opportunity_type = 'job' AND job_id IS NOT NULL AND internship_id IS NULL) OR
    (opportunity_type = 'internship' AND internship_id IS NOT NULL AND job_id IS NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_saved_job ON public.saved_opportunities (user_id, job_id) WHERE job_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_saved_internship ON public.saved_opportunities (user_id, internship_id) WHERE internship_id IS NOT NULL;

-- 6. Row Level Security (RLS) Policies
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_opportunities ENABLE ROW LEVEL SECURITY;

-- Applications RLS
CREATE POLICY "Students read own applications" ON public.applications 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Students insert own applications" ON public.applications 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins full access to applications" ON public.applications 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
    )
  );

-- Saved Opportunities RLS
CREATE POLICY "Students access own saved opportunities" ON public.saved_opportunities 
  FOR ALL USING (auth.uid() = user_id);


-- ====================================
-- 03_eligibility_fix.sql
-- ====================================
-- Migration 03: Extend eligibility_rules table to support admin UI form fields
-- The existing table only had: id, job_id (FK), min_cgpa, allowed_branches, max_backlogs, created_at
-- The admin form sends: companyName, jobRole, minCgpa, eligibleBranches, maxBacklogs, requiredSkills
-- We add the missing columns so rules can be created without requiring a job_id FK.

ALTER TABLE public.eligibility_rules
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS job_role TEXT,
  ADD COLUMN IF NOT EXISTS required_skills TEXT[] DEFAULT '{}';

-- Make job_id optional (it was previously required conceptually but not enforced with NOT NULL)
-- job_id is already nullable by default since it was added as REFERENCES without NOT NULL
-- No action needed for that.

-- Add a public read policy so students can view eligibility rules
-- (no RLS was set on eligibility_rules, so service-role reads are fine for admin)
-- For students to read via their own JWT, we need a SELECT policy:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'eligibility_rules' AND policyname = 'Students can read eligibility rules'
  ) THEN
    ALTER TABLE public.eligibility_rules ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Students can read eligibility rules"
      ON public.eligibility_rules FOR SELECT
      USING (true);  -- All authenticated users can read eligibility rules
  END IF;
END
$$;

-- Add public read policies for skills, resources, events so students can see admin-created content
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'skills' AND policyname = 'Public can read skills'
  ) THEN
    ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Public can read skills"
      ON public.skills FOR SELECT
      USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'resources' AND policyname = 'Public can read resources'
  ) THEN
    ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Public can read resources"
      ON public.resources FOR SELECT
      USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Public can read events'
  ) THEN
    ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Public can read events"
      ON public.events FOR SELECT
      USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'jobs' AND policyname = 'Public can read published jobs'
  ) THEN
    ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Public can read published jobs"
      ON public.jobs FOR SELECT
      USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'internships' AND policyname = 'Public can read internships'
  ) THEN
    ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Public can read internships"
      ON public.internships FOR SELECT
      USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'companies' AND policyname = 'Public can read companies'
  ) THEN
    ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Public can read companies"
      ON public.companies FOR SELECT
      USING (true);
  END IF;
END
$$;


-- ====================================
-- 04_sync_fix.sql
-- ====================================
-- Add missing columns to jobs
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS responsibilities TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS requirements TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS eligibility TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS required_skills TEXT[] DEFAULT '{}';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS work_mode TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS employment_type TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS experience TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS openings INTEGER;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Published';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS external_url TEXT;

-- Add missing columns to internships
ALTER TABLE public.internships ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.internships ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.internships ADD COLUMN IF NOT EXISTS responsibilities TEXT;
ALTER TABLE public.internships ADD COLUMN IF NOT EXISTS eligibility TEXT;
ALTER TABLE public.internships ADD COLUMN IF NOT EXISTS required_skills TEXT[] DEFAULT '{}';
ALTER TABLE public.internships ADD COLUMN IF NOT EXISTS work_mode TEXT;
ALTER TABLE public.internships ADD COLUMN IF NOT EXISTS openings INTEGER;
ALTER TABLE public.internships ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Published';
ALTER TABLE public.internships ADD COLUMN IF NOT EXISTS external_url TEXT;


-- ====================================
-- 05_phase1_onboarding_multicollege.sql
-- ====================================
-- CAREERPILOT AI - PHASE 1 MIGRATION
-- Adds Multi-College Foundation, Onboarding State, and Faculty Foundation.

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(college_id, name)
);

-- 2. Update Student Profiles with Phase 1 additions
ALTER TABLE public.student_profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS academic_year TEXT,
ADD COLUMN IF NOT EXISTS section TEXT,
ADD COLUMN IF NOT EXISTS batch TEXT,
ADD COLUMN IF NOT EXISTS student_id TEXT,
ADD COLUMN IF NOT EXISTS target_role TEXT,
ADD COLUMN IF NOT EXISTS career_interests TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferred_domains TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferred_technologies TEXT[] DEFAULT '{}';

-- 3. Faculty Foundation
CREATE TABLE IF NOT EXISTS public.faculty_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  employee_id TEXT,
  college_name TEXT,
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.faculty_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  academic_year TEXT,
  section TEXT,
  batch TEXT,
  subject TEXT,
  department TEXT,
  assignment_type TEXT DEFAULT 'section' CHECK (assignment_type IN ('all', 'section', 'student', 'subject')),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RLS Policies Updates
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
-- Anyone can see departments (needed for signup/onboarding dropdowns)
CREATE POLICY "Public read access to departments" ON public.departments FOR SELECT USING (true);

-- Ensure public read access to colleges if not already present
-- (Assuming it was already public, but let's be safe)
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access to colleges" ON public.colleges;
CREATE POLICY "Public read access to colleges" ON public.colleges FOR SELECT USING (true);

ALTER TABLE public.faculty_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Faculty can read own profile" ON public.faculty_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Faculty can update own profile" ON public.faculty_profiles FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE public.faculty_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Faculty can read own assignments" ON public.faculty_assignments FOR SELECT USING (auth.uid() = faculty_id);


-- ====================================
-- 06_placement_predictions.sql
-- ====================================
-- CAREERPILOT AI - PHASE 2 MIGRATION
-- Placement Predictions Persistence Table & RLS Policies

CREATE TABLE IF NOT EXISTS public.placement_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_version TEXT DEFAULT '1.0.0',
  prediction INTEGER, -- 1 = Placed, 0 = Unplaced
  probability NUMERIC(5, 4), -- Range: 0.0000 to 1.0000
  status TEXT NOT NULL, -- 'High Readiness', 'Moderate Readiness', 'Needs Skill Enhancement', 'insufficient_data', 'service_unavailable'
  missing_fields TEXT[] DEFAULT '{}',
  feature_contributions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.placement_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users access own placement predictions" ON public.placement_predictions;
CREATE POLICY "Users access own placement predictions" ON public.placement_predictions FOR ALL USING (auth.uid() = user_id);


-- ====================================
-- 07_onboarding_enhancements.sql
-- ====================================
-- CAREERPILOT AI - PHASE 3 MIGRATION
-- Adds First-Time Website Introduction & Step Persistence Columns

ALTER TABLE public.student_profiles
ADD COLUMN IF NOT EXISTS intro_seen BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS current_onboarding_step INTEGER DEFAULT 1;


-- ====================================
-- 08_yearwise_assessments_ranking.sql
-- ====================================
-- ====================================================================
-- CAREERPILOT AI - MIGRATION 08: YEAR-WISE ASSESSMENTS & RANKING ENGINE
-- ====================================================================

-- 1. Create assessments table for Year-Specific Configurations
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  academic_year TEXT NOT NULL UNIQUE CHECK (academic_year IN ('1st Year', '2nd Year', '3rd Year', '4th Year')),
  duration_minutes INTEGER DEFAULT 20,
  total_questions INTEGER DEFAULT 15,
  platinum_threshold NUMERIC(5, 2) DEFAULT 85.00,
  gold_threshold NUMERIC(5, 2) DEFAULT 70.00,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Extend readiness_questions table
ALTER TABLE public.readiness_questions 
  ADD COLUMN IF NOT EXISTS assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS academic_year TEXT DEFAULT '1st Year',
  ADD COLUMN IF NOT EXISTS marks INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- 3. Extend readiness_attempts table
ALTER TABLE public.readiness_attempts
  ADD COLUMN IF NOT EXISTS assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS academic_year TEXT DEFAULT '1st Year',
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'timed_out', 'expired')),
  ADD COLUMN IF NOT EXISTS percentage NUMERIC(5, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rank TEXT CHECK (rank IN ('Platinum', 'Gold', 'Silver')),
  ADD COLUMN IF NOT EXISTS category_scores JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS time_spent_seconds INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tab_switch_count INTEGER DEFAULT 0;

-- 4. Extend readiness_answers table
ALTER TABLE public.readiness_answers
  ADD COLUMN IF NOT EXISTS marks_awarded NUMERIC(5, 2) DEFAULT 0;

-- Enable RLS & Policies
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_answers ENABLE ROW LEVEL SECURITY;

-- Service role policies & public read policies
DROP POLICY IF EXISTS "Assessments viewable by authenticated" ON public.assessments;
CREATE POLICY "Assessments viewable by authenticated" ON public.assessments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Questions viewable by authenticated" ON public.readiness_questions;
CREATE POLICY "Questions viewable by authenticated" ON public.readiness_questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Attempts manage by owner" ON public.readiness_attempts;
CREATE POLICY "Attempts manage by owner" ON public.readiness_attempts FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Answers manage by attempt owner" ON public.readiness_answers;
CREATE POLICY "Answers manage by attempt owner" ON public.readiness_answers FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.readiness_attempts 
    WHERE readiness_attempts.id = readiness_answers.attempt_id 
    AND readiness_attempts.user_id = auth.uid()
  )
);

-- ====================================================================
-- SEED ASSESSMENTS (1st Year, 2nd Year, 3rd Year, 4th Year)
-- ====================================================================
INSERT INTO public.assessments (title, description, academic_year, duration_minutes, total_questions, platinum_threshold, gold_threshold)
VALUES
  ('Year 1 Foundation & Quantitative Assessment', 'Evaluates fundamental mathematics, basic logical reasoning, introduction to programming concepts, and workplace communication basics.', '1st Year', 20, 15, 85.00, 70.00),
  ('Year 2 Data Structures & Systems Assessment', 'Evaluates core data structures, Object-Oriented Programming principles, DBMS fundamentals, and professional communication.', '2nd Year', 20, 15, 85.00, 70.00),
  ('Year 3 Algorithms & System Concepts Assessment', 'Evaluates algorithmic complexity, operating system concepts, SQL optimization, advanced logic, and technical interview communication.', '3rd Year', 20, 15, 85.00, 70.00),
  ('Year 4 Senior Engineering & System Design Assessment', 'Evaluates distributed system design, microservices, complex quantitative logic, code architecture, and executive technical presentation.', '4th Year', 20, 15, 85.00, 70.00)
ON CONFLICT (academic_year) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  duration_minutes = EXCLUDED.duration_minutes,
  total_questions = EXCLUDED.total_questions,
  platinum_threshold = EXCLUDED.platinum_threshold,
  gold_threshold = EXCLUDED.gold_threshold;

-- Clean existing seed questions to refresh with authentic academic questions
DELETE FROM public.readiness_questions WHERE academic_year IN ('1st Year', '2nd Year', '3rd Year', '4th Year');

-- ====================================================================
-- SEED QUESTIONS - YEAR 1 (15 Questions)
-- ====================================================================
INSERT INTO public.readiness_questions (academic_year, category, question_text, options, correct_option_index, explanation, difficulty, marks, order_index)
VALUES
-- Aptitude (Year 1)
('1st Year', 'Aptitude', 'If a train traveling at 60 km/h crosses a pole in 9 seconds, what is the length of the train in meters?', '["120m", "150m", "180m", "200m"]', 1, 'Speed = 60 * (5/18) = 50/3 m/s. Length = Speed * Time = (50/3) * 9 = 150 meters.', 'Easy', 1, 1),
('1st Year', 'Aptitude', 'What is the sum of the first 20 even positive integers?', '["200", "210", "420", "400"]', 2, 'Sum of first n even numbers is n(n + 1). For n=20, 20 * 21 = 420.', 'Easy', 1, 2),
('1st Year', 'Aptitude', 'A product marked at $80 is sold for $68. What is the percentage discount offered?', '["12%", "15%", "18%", "20%"]', 1, 'Discount = 80 - 68 = 12. Percentage = (12 / 80) * 100 = 15%.', 'Easy', 1, 3),
('1st Year', 'Aptitude', 'If 5 workers build a wall in 12 days, how many days will 10 workers take to build the same wall?', '["3 days", "6 days", "8 days", "10 days"]', 1, 'Workers * Days = Constant. 5 * 12 = 60 worker-days. Days for 10 workers = 60 / 10 = 6 days.', 'Easy', 1, 4),

-- Technical (Year 1)
('1st Year', 'Technical', 'Which data type is typically used to store a single character in C / C++ / Java?', '["string", "char", "float", "boolean"]', 1, 'The char primitive keyword represents a single 8-bit or 16-bit character unit.', 'Easy', 1, 5),
('1st Year', 'Technical', 'What is the binary representation of the decimal number 13?', '["1011", "1100", "1101", "1110"]', 2, '13 in binary: 8 + 4 + 0 + 1 = 1101_2.', 'Easy', 1, 6),
('1st Year', 'Technical', 'Which component of a computer system executes arithmetic and logic operations?', '["RAM", "Control Unit", "ALU", "Cache"]', 2, 'The Arithmetic Logic Unit (ALU) performs arithmetic calculations and logical decisions.', 'Easy', 1, 7),
('1st Year', 'Technical', 'In programming, what is a loop that never terminates called?', '["Recursive Loop", "Infinite Loop", "Deadlock", "Stack Overflow"]', 1, 'A loop whose exit condition is never satisfied is an infinite loop.', 'Easy', 1, 8),

-- Communication (Year 1)
('1st Year', 'Communication', 'Choose the sentence with correct subject-verb agreement:', '["Each of the students are attending", "Each of the students is attending", "Each of the students have attended", "Each of the students were attending"]', 1, '`Each` is a singular indefinite pronoun requiring the singular verb `is`.', 'Easy', 1, 9),
('1st Year', 'Communication', 'When emailing a professor or recruiter, what is the most professional subject line?', '["Hey check this out", "Inquiry Regarding Internship Application - John Doe", "Help needed urgently!!!", "Application"]', 1, 'A clear, structured subject line detailing purpose and full name is professional.', 'Easy', 1, 10),
('1st Year', 'Communication', 'What does active listening primarily involve during a professional interaction?', '["Planning your response while the other speaks", "Nodding, maintaining eye contact, and clarifying key points", "Interrupting to correct minor errors", "Remaining completely silent without feedback"]', 1, 'Active listening involves focused engagement, non-verbal cues, and reflective clarification.', 'Easy', 1, 11),

-- Problem Solving (Year 1)
('1st Year', 'Problem Solving', 'Look at the series: 2, 6, 12, 20, 30, ... What is the next number in the pattern?', '["36", "40", "42", "48"]', 2, 'Differences: +4, +6, +8, +10. Next difference is +12, so 30 + 12 = 42.', 'Medium', 1, 12),
('1st Year', 'Problem Solving', 'All cats are mammals. All mammals have lungs. Which statement is logically valid?', '["All mammals are cats", "All cats have lungs", "No cats have lungs", "Some mammals do not have lungs"]', 1, 'If A ⊂ B and B ⊂ C, then A ⊂ C (Transitive property of sets).', 'Medium', 1, 13),
('1st Year', 'Problem Solving', 'If RED is coded as 18-5-4, how is BLUE coded using letter positions in the alphabet?', '["2-12-21-5", "2-11-20-5", "3-12-21-6", "2-12-22-5"]', 0, 'B=2, L=12, U=21, E=5.', 'Easy', 1, 14),
('1st Year', 'Problem Solving', 'A algorithm processes 10 items in 2 seconds. Assuming linear time complexity O(N), how long will it take for 50 items?', '["5 seconds", "10 seconds", "15 seconds", "25 seconds"]', 1, 'O(N) linear ratio: 50 / 10 = 5x input -> 2 * 5 = 10 seconds.', 'Easy', 1, 15);


-- ====================================================================
-- SEED QUESTIONS - YEAR 2 (15 Questions)
-- ====================================================================
INSERT INTO public.readiness_questions (academic_year, category, question_text, options, correct_option_index, explanation, difficulty, marks, order_index)
VALUES
-- Aptitude (Year 2)
('2nd Year', 'Aptitude', 'Two pipes A and B can fill a tank in 20 and 30 minutes respectively. If both are opened together, how long will it take to fill?', '["10 minutes", "12 minutes", "15 minutes", "25 minutes"]', 1, 'Combined rate = (1/20) + (1/30) = (3+2)/60 = 5/60 = 1/12. Time = 12 minutes.', 'Medium', 1, 1),
('2nd Year', 'Aptitude', 'In how many different ways can the letters of the word "CANVAS" be arranged?', '["360", "720", "180", "120"]', 0, 'CANVAS has 6 letters with 2 A''s. Permutations = 6! / 2! = 720 / 2 = 360.', 'Medium', 1, 2),
('2nd Year', 'Aptitude', 'A card is drawn from a well-shuffled deck of 52 cards. What is the probability of drawing a Spade or an Ace?', '["16/52", "4/13", "17/52", "9/26"]', 0, 'Spades = 13, Aces = 4, Ace of Spades = 1. P(Spade ∪ Ace) = (13 + 4 - 1)/52 = 16/52 = 4/13.', 'Medium', 1, 3),
('2nd Year', 'Aptitude', 'The average age of a group of 8 students is 21 years. If a teacher aged 39 joins, what is the new average age?', '["22 years", "23 years", "24 years", "25 years"]', 1, 'Sum = 8 * 21 = 168. New Sum = 168 + 39 = 207. New Average = 207 / 9 = 23 years.', 'Medium', 1, 4),

-- Technical (Year 2)
('2nd Year', 'Technical', 'Which data structure operates on a Last In First Out (LIFO) protocol?', '["Queue", "Stack", "LinkedList", "Binary Tree"]', 1, 'Stack data structure enforces Last-In-First-Out access via push and pop.', 'Easy', 1, 5),
('2nd Year', 'Technical', 'What is the primary characteristic of Object-Oriented Encapsulation?', '["Creating new classes from existing ones", "Bundling data and methods while restricting direct access", "Allowing one function name to have multiple forms", "Executing tasks concurrently"]', 1, 'Encapsulation restricts direct state access by enclosing attributes with access modifiers/getters.', 'Easy', 1, 6),
('2nd Year', 'Technical', 'In SQL, which command is used to remove a table and its structure permanently from the database?', '["DELETE", "REMOVE", "DROP", "TRUNCATE"]', 2, '`DROP TABLE` deletes both data and the schema definition, whereas `TRUNCATE` removes only rows.', 'Easy', 1, 7),
('2nd Year', 'Technical', 'What is the average time complexity of searching for an element in a balanced Binary Search Tree (BST)?', '["O(1)", "O(log N)", "O(N)", "O(N log N)"]', 1, 'A balanced BST halves the search space at each step, yielding logarithmic O(log N) time.', 'Medium', 1, 8),

-- Communication (Year 2)
('2nd Year', 'Communication', 'In technical discussions, what does the STAR technique stand for when answering behavioral interview questions?', '["System, Task, Action, Result", "Situation, Task, Action, Result", "Strategy, Theory, Analysis, Review", "Statement, Test, Application, Reaction"]', 1, 'STAR stands for Situation, Task, Action, and Result.', 'Easy', 1, 9),
('2nd Year', 'Communication', 'Identify the most constructive response when receiving critical feedback on code review:', '["Defense your code aggressively", "Thank the reviewer, ask clarifying questions, and address valid points", "Ignore the comments and merge your branch", "Refuse to take further assignments"]', 1, 'Constructive feedback handling demonstrates emotional intelligence and engineering maturity.', 'Easy', 1, 10),
('2nd Year', 'Communication', 'Which tone is most suitable when detailing a system post-mortem report to cross-functional leaders?', '["Blameless, objective, and solution-focused", "Emotional and apologetic", "Highly academic with undefined jargon", "Dismissive of user impact"]', 0, 'Post-mortems require blameless objectivity, precise metrics, and actionable prevention steps.', 'Medium', 1, 11),

-- Problem Solving (Year 2)
('2nd Year', 'Problem Solving', 'A linked list has a loop. Which algorithm detects this loop in O(N) time and O(1) auxiliary memory space?', '["Dijkstra Algorithm", "Floyds Cycle Detection (Fast & Slow Pointers)", "Binary Search", "Kruskal Algorithm"]', 1, 'Floyd''s Tortoise and Hare algorithm detects linked list cycles using two pointers.', 'Medium', 1, 12),
('2nd Year', 'Problem Solving', 'Which sorting algorithm guarantees O(N log N) time complexity in the worst-case scenario?', '["Quick Sort", "Bubble Sort", "Merge Sort", "Insertion Sort"]', 2, 'Merge Sort consistently divides and merges arrays in O(N log N) time regardless of input order.', 'Medium', 1, 13),
('2nd Year', 'Problem Solving', 'Given array [4, 1, 2, 1, 2], where every element appears twice except for one. Which bitwise operator identifies the single element in O(N) time and O(1) space?', '["AND (&)", "OR (|)", "XOR (^)", "NOT (~)"]', 2, 'XORing identical numbers yields 0 (A ^ A = 0), leaving only the unique element.', 'Medium', 1, 14),
('2nd Year', 'Problem Solving', 'A hash table encounters a collision. What is the collision resolution method that probes sequential memory slots?', '["Separate Chaining", "Open Addressing with Linear Probing", "Double Hashing", "Re-hashing"]', 1, 'Linear probing searches consecutive array locations (i+1, i+2...) upon hash collision.', 'Medium', 1, 15);


-- ====================================================================
-- SEED QUESTIONS - YEAR 3 (15 Questions)
-- ====================================================================
INSERT INTO public.readiness_questions (academic_year, category, question_text, options, correct_option_index, explanation, difficulty, marks, order_index)
VALUES
-- Aptitude (Year 3)
('3rd Year', 'Aptitude', 'A seller marks up an item by 40% above cost price and then gives a discount of 25%. What is the net profit or loss percentage?', '["5% profit", "5% loss", "10% profit", "15% profit"]', 0, 'Cost = 100. Marked = 140. Selling = 140 * 0.75 = 105. Net Profit = (105 - 100)/100 = 5% profit.', 'Medium', 1, 1),
('3rd Year', 'Aptitude', 'At what time between 3 o''clock and 4 o''clock will the hands of a clock overlap?', '["3:15", "3:16 4/11 minutes", "3:18 minutes", "3:20 minutes"]', 1, 'At 3:00, hands are 15 minute spaces apart. Relative speed = 55/60 = 11/12 min spaces/min. Time = 15 / (11/12) = 180/11 = 16 4/11 mins past 3.', 'Hard', 1, 2),
('3rd Year', 'Aptitude', 'A container has 80 liters of pure milk. 8 liters are replaced with water, and this operation is performed twice in total. How much milk remains?', '["64.8 liters", "65.2 liters", "66.0 liters", "72.0 liters"]', 0, 'Remaining Milk = Initial * (1 - x/V)^n = 80 * (1 - 8/80)^2 = 80 * (0.9)^2 = 80 * 0.81 = 64.8 liters.', 'Hard', 1, 3),
('3rd Year', 'Aptitude', 'How many 4-digit numbers can be formed using digits 1, 2, 3, 4, 5 without repetition such that the number is divisible by 4?', '["24", "32", "16", "20"]', 0, 'Divisibility by 4 requires last 2 digits to be divisible by 4: 12, 24, 32, 52 (4 possibilities). For each, remaining 2 digits can be filled in 3 * 2 = 6 ways. Total = 4 * 6 = 24.', 'Hard', 1, 4),

-- Technical (Year 3)
('3rd Year', 'Technical', 'What does ACID stand for in Database Transaction Management?', '["Atomicity, Consistency, Isolation, Durability", "Access, Control, Integrity, Security", "Asynchronous, Concurrent, Indexed, Distributed", "Authentication, Authorization, Encryption, Auditing"]', 0, 'ACID parameters guarantee reliable relational database transaction processing.', 'Easy', 1, 5),
('3rd Year', 'Technical', 'Which CPU scheduling algorithm can lead to starvation for long processes?', '["Round Robin", "First-Come First-Served", "Shortest Job First (SJF)", "Priority Scheduling without Aging"]', 3, 'Priority scheduling without aging keeps executing higher priority tasks, starving lower priority ones indefinitely.', 'Medium', 1, 6),
('3rd Year', 'Technical', 'What is the primary difference between a process and a thread in an Operating System?', '["Processes share memory space; threads do not", "Threads share the memory space of their parent process", "Processes are managed by application code; threads by hardware", "Threads cannot execute concurrently"]', 1, 'Threads share heap, code, and global memory within a single parent process boundary.', 'Medium', 1, 7),
('3rd Year', 'Technical', 'What is the tightest worst-case time complexity of QuickSort when using a naive pivot selection (e.g. always first element) on an already sorted array?', '["O(N)", "O(N log N)", "O(N^2)", "O(2^N)"]', 2, 'Unbalanced partitions on pre-sorted input result in recursive depth of N, yielding quadratic O(N^2) complexity.', 'Medium', 1, 8),

-- Communication (Year 3)
('3rd Year', 'Communication', 'During an architectural design review, an engineer disagrees with your choice of database. What is the most effective approach?', '["Concede immediately to avoid conflict", "Present empirical benchmarks, trade-off analysis, and listen to alternative proposals objectively", "Tell them your decision is final", "Escalate to management without debate"]', 1, 'Engineers evaluate choices using benchmark data, trade-off analysis, and constructive active listening.', 'Medium', 1, 9),
('3rd Year', 'Communication', 'What is the core purpose of a Executive Summary in an engineering design document?', '["To list all source code line numbers", "To provide a concise, high-level overview of the problem, proposed solution, cost, and business impact for stakeholders", "To document user login credentials", "To serve as a user manual"]', 1, 'Executive summaries convey high-level objectives, architectural choices, and business impacts succinctly.', 'Easy', 1, 10),
('3rd Year', 'Communication', 'When delivering an technical talk to non-technical business leaders, which practice should be avoided?', '["Using real-world analogies", "Overloading slides with dense low-level code snippets and un-explained acronyms", "Highlighting key ROI and user experience metrics", "Inviting interactive questions"]', 1, 'Avoid dense code snippets and un-explained jargon when communicating with non-technical leaders.', 'Easy', 1, 11),

-- Problem Solving (Year 3)
('3rd Year', 'Problem Solving', 'What dynamic programming pattern solves the classic 0/1 Knapsack problem in O(N * W) pseudo-polynomial time?', '["Sliding Window", "Bottom-up Tabulation / Memoization", "Greedy Choice Strategy", "Two Pointers"]', 1, '0/1 Knapsack requires dynamic programming (tabulation/memoization) to check overlapping subproblems.', 'Medium', 1, 12),
('3rd Year', 'Problem Solving', 'In graph theory, which algorithm finds the shortest path from a single source node to all other nodes in a weighted graph with non-negative edge weights?', '["Dijkstra Algorithm", "Bellman-Ford Algorithm", "Floyd-Warshall Algorithm", "Kruskal Algorithm"]', 0, 'Dijkstra''s algorithm uses a priority queue to determine shortest single-source non-negative paths.', 'Medium', 1, 13),
('3rd Year', 'Problem Solving', 'Which relational algebra operation corresponds to combining rows from two tables based on a related column?', '["Projection", "Selection", "Join", "Union"]', 2, 'JOIN operators correlate tuples across relational entities based on join predicates.', 'Easy', 1, 14),
('3rd Year', 'Problem Solving', 'What is the maximum number of nodes in a full binary tree of height H (where root height = 0)?', '["2^H", "2^(H+1) - 1", "2^H + 1", "2^(H-1)"]', 1, 'Sum of geometric progression 1 + 2 + 4 + ... + 2^H = 2^(H+1) - 1.', 'Medium', 1, 15);


-- ====================================================================
-- SEED QUESTIONS - YEAR 4 (15 Questions)
-- ====================================================================
INSERT INTO public.readiness_questions (academic_year, category, question_text, options, correct_option_index, explanation, difficulty, marks, order_index)
VALUES
-- Aptitude (Year 4)
('4th Year', 'Aptitude', 'A sum of money compounded annually doubles in 4 years. In how many years will it become 8 times the original principal?', '["8 years", "12 years", "16 years", "20 years"]', 1, 'P becomes 2P in 4 yrs. (2P)^3 = 8P takes 4 * 3 = 12 years.', 'Hard', 1, 1),
('4th Year', 'Aptitude', 'Three dice are rolled simultaneously. What is the probability that the sum of the numbers shown is equal to 15?', '["10/216", "12/216", "15/216", "18/216"]', 0, 'Combinations for sum 15 with 3 dice: (6,6,3)[3], (6,5,4)[6], (5,5,5)[1]. Total favorable outcomes = 3 + 6 + 1 = 10. Probability = 10 / 216.', 'Hard', 1, 2),
('4th Year', 'Aptitude', 'A and B run a 1 km race. A beats B by 100 meters or 20 seconds. What is A''s time to complete the race?', '["160 seconds", "180 seconds", "200 seconds", "220 seconds"]', 1, 'B covers 100m in 20s -> B''s speed = 5 m/s. B takes 1000/5 = 200s for 1km. A''s time = 200 - 20 = 180 seconds.', 'Hard', 1, 3),
('4th Year', 'Aptitude', 'Find the remainder when 3^100 is divided by 7.', '["1", "2", "3", "4"]', 1, 'By Fermat''s Little Theorem: 3^6 ≡ 1 (mod 7). 100 = 6 * 16 + 4. 3^100 ≡ (3^6)^16 * 3^4 ≡ 1 * 81 ≡ 81 (mod 7) = 4 * 7 + 4? Wait 81 = 11*7 + 4? 3^4 = 81. 81 / 7 = 11 remainder 4. Let''s check: 3^1=3, 3^2=2, 3^3=6, 3^4=4. 3^100 = (3^3)^33 * 3 = (-1)^33 * 3 = -3 ≡ 4 (mod 7). Correct option is 4 (index 3).', 'Hard', 1, 4),

-- Technical (Year 4)
('4th Year', 'Technical', 'In distributed systems architecture, what does CAP Theorem state you must choose between during a network partition?', '["Consistency or Availability", "Latency or Throughput", "Security or Performance", "Storage or Computation"]', 0, 'CAP Theorem states a distributed system can guarantee at most two of Consistency, Availability, Partition Tolerance.', 'Hard', 1, 5),
('4th Year', 'Technical', 'Which architectural strategy decouples microservice communication by emitting domain events to an intermediary event bus?', '["Monolithic Shared Memory", "Event-Driven Architecture with Message Brokers", "Synchronous REST Polling", "Direct Database Mirroring"]', 1, 'Event-Driven Architecture uses brokers (Kafka/RabbitMQ) for asynchronous decoupled domain event publishing.', 'Medium', 1, 6),
('4th Year', 'Technical', 'What mechanism is commonly used in API Gateways to prevent DDoS attacks and enforce service quotas per client?', '["Database Normalization", "Distributed Rate Limiting (Token Bucket / Leaky Bucket)", "Circuit Breaker Pattern", "Cache Invalidation"]', 1, 'Rate limiting algorithms (Token Bucket/Leaky Bucket) throttle request volumes to protect API availability.', 'Medium', 1, 7),
('4th Year', 'Technical', 'In microservices design, what is the purpose of the Circuit Breaker pattern (e.g. Resilience4j)?', '["To encrypt network traffic", "To prevent cascading failures when a downstream dependency is degraded or unreachable", "To balance load evenly across instances", "To auto-scale container replicas"]', 1, 'Circuit Breakers fail-fast when downstream services experience high error rates, protecting upstream caller threads.', 'Hard', 1, 8),

-- Communication (Year 4)
('4th Year', 'Communication', 'You are presenting an architectural proposal to C-level executives. What is the optimal structure for your deck?', '["50 slides of un-formatted source code", "Executive Summary & Business ROI -> High-level System Architecture -> Risk & Mitigation -> Benchmark Comparison", "Deep dive into variable naming conventions", "Personal stories without metrics"]', 1, 'Executive decks lead with business impact/ROI, system architecture, risks/mitigations, and cost benchmarks.', 'Medium', 1, 9),
('4th Year', 'Communication', 'How should a Senior Tech Lead handle a critical P0 production outage call with client leadership?', '["Deny any responsibility", "Provide calm, transparent updates on status, immediate containment steps, estimated resolution ETA, and commit to post-mortem", "Blame the junior developer who pushed code", "Mute the line and wait for it to self-heal"]', 1, 'Senior engineering leaders communicate transparently with containment steps, status, and realistic ETAs.', 'Medium', 1, 10),
('4th Year', 'Communication', 'When conducting a technical interview as a senior peer, what is the key responsibility of the interviewer?', '["Trick the candidate with obscure trivia", "Create a welcoming environment, give clear problem statements, and evaluate problem-solving thought process", "Talk for 80% of the interview time", "Show off your own coding skills"]', 1, 'Interviewers create an encouraging environment to objectively evaluate candidate problem-solving and reasoning.', 'Easy', 1, 11),

-- Problem Solving (Year 4)
('4th Year', 'Problem Solving', 'Which caching strategy updates the cache and the backing database synchronously in a single transaction before returning success?', '["Write-Through Cache", "Write-Behind (Write-Back) Cache", "Cache-Aside (Lazy Loading)", "Read-Through Cache"]', 0, 'Write-Through cache synchronously writes data to both cache layer and persistent DB store.', 'Hard', 1, 12),
('4th Year', 'Problem Solving', 'Which consensus protocol is widely used in distributed key-value stores like etcd and Consul for leader election?', '["Raft Consensus Protocol", "Round Robin Routing", "Consistent Hashing", "LRU Eviction"]', 0, 'Raft provides strong consistency and fault-tolerant leader election in distributed systems.', 'Hard', 1, 13),
('4th Year', 'Problem Solving', 'In consistent hashing, what technique prevents hot-spotting and ensures uniform distribution of keys across physical nodes?', '["Virtual Nodes (Vnodes)", "B-Tree Indexing", "Double Hashing", "Linear Probing"]', 0, 'Virtual nodes map multiple tokens on the hash ring to each physical node, smoothing load distribution.', 'Hard', 1, 14),
('4th Year', 'Problem Solving', 'To find the median of a continuous stream of integers in O(1) time per query, which data structure pair is optimal?', '["Two Heaps (Max-Heap for lower half, Min-Heap for upper half)", "Single Stack", "Unsorted Array", "Binary Search Tree without balancing"]', 0, 'Two balanced heaps (Max-Heap and Min-Heap) keep track of upper and lower halves to yield median in O(1) time.', 'Hard', 1, 15);

-- Link question foreign keys to their assessment IDs
UPDATE public.readiness_questions q
SET assessment_id = a.id
FROM public.assessments a
WHERE q.academic_year = a.academic_year;



-- ====================================
-- 09_rank_based_learning.sql
-- ====================================
-- ====================================================================
-- CAREERPILOT AI - MIGRATION 09: RANK-BASED LEARNING & ACCESS CONTROL
-- ====================================================================

-- Extend resources table schema
ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS access_level TEXT DEFAULT 'Standard' CHECK (access_level IN ('Standard', 'Faculty', 'Premium', 'Expert')),
  ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'Resource' CHECK (content_type IN ('Notes', 'Lecture', 'Video', 'Resource', 'Class', 'Documentation', 'Practice')),
  ADD COLUMN IF NOT EXISTS academic_year TEXT DEFAULT 'All' CHECK (academic_year IN ('1st Year', '2nd Year', '3rd Year', '4th Year', 'All')),
  ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS department_id TEXT,
  ADD COLUMN IF NOT EXISTS author TEXT DEFAULT 'Staff Engineer',
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;

-- Create student_resource_progress table for tracking completion
CREATE TABLE IF NOT EXISTS public.student_resource_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);

ALTER TABLE public.student_resource_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Progress manage by owner" ON public.student_resource_progress;
CREATE POLICY "Progress manage by owner" ON public.student_resource_progress FOR ALL USING (auth.uid() = user_id);


-- ====================================
-- 10_faculty_portal_enhancements.sql
-- ====================================
-- ====================================================================
-- CAREERPILOT AI - MIGRATION 10: FACULTY PORTAL & ASSIGNMENT ENHANCEMENTS
-- ====================================================================

-- 1. Extend faculty_profiles
ALTER TABLE public.faculty_profiles
  ADD COLUMN IF NOT EXISTS designation TEXT DEFAULT 'Assistant Professor',
  ADD COLUMN IF NOT EXISTS specialization TEXT,
  ADD COLUMN IF NOT EXISTS subjects TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS college_name TEXT,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS employee_id TEXT;

-- 2. Extend faculty_assignments to support granular student & subject assignments
ALTER TABLE public.faculty_assignments
  ADD COLUMN IF NOT EXISTS subject TEXT,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS assignment_type TEXT DEFAULT 'section' CHECK (assignment_type IN ('all', 'section', 'student', 'subject')),
  ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Create faculty_classes table
CREATE TABLE IF NOT EXISTS public.faculty_classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT,
  topic TEXT,
  description TEXT,
  class_date TIMESTAMPTZ NOT NULL,
  academic_year TEXT DEFAULT '3rd Year',
  section TEXT DEFAULT 'A',
  meeting_url TEXT,
  materials_url TEXT,
  status TEXT DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.faculty_classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Faculty manage own classes" ON public.faculty_classes;
CREATE POLICY "Faculty manage own classes" ON public.faculty_classes FOR ALL USING (auth.uid() = faculty_id);

DROP POLICY IF EXISTS "Students read assigned classes" ON public.faculty_classes;
CREATE POLICY "Students read assigned classes" ON public.faculty_classes FOR SELECT USING (true);


-- ====================================
-- 11_personalized_ai_roadmaps.sql
-- ====================================
-- CAREERPILOT AI - PHASE 7: PERSONALIZED AI CAREER ROADMAP MIGRATION
-- Adds structured_data, generation metadata to roadmaps table and updates RLS policies.

ALTER TABLE public.roadmaps
  ADD COLUMN IF NOT EXISTS structured_data JSONB,
  ADD COLUMN IF NOT EXISTS generation_status TEXT DEFAULT 'completed',
  ADD COLUMN IF NOT EXISTS generated_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON public.roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_topics_roadmap_id ON public.roadmap_topics(roadmap_id);

-- Ensure RLS is active and updated
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_topics ENABLE ROW LEVEL SECURITY;

-- Drop previous restrictive policies if present to re-create safely
DROP POLICY IF EXISTS "Users access own roadmaps" ON public.roadmaps;
DROP POLICY IF EXISTS "Faculty read assigned student roadmaps" ON public.roadmaps;
DROP POLICY IF EXISTS "Users access own roadmap topics" ON public.roadmap_topics;

CREATE POLICY "Users access own roadmaps" ON public.roadmaps
  FOR ALL
  USING (auth.uid() = user_id);

-- Policy to allow faculty to read roadmaps of assigned students
CREATE POLICY "Faculty read assigned student roadmaps" ON public.roadmaps
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.faculty_profiles fp
      JOIN public.faculty_assignments fa ON fa.faculty_id = fp.user_id
      JOIN public.student_profiles sp ON sp.user_id = public.roadmaps.user_id
      WHERE fp.user_id = auth.uid()
      AND (
        (fp.college_id IS NOT NULL AND sp.college_id = fp.college_id)
        OR (fp.college_name IS NOT NULL AND sp.college_name = fp.college_name)
        OR (fp.college_id IS NULL AND fp.college_name IS NULL)
      )
      AND (
        fa.assignment_type = 'all'
        OR (fa.student_id = sp.user_id)
        OR (
          (fa.academic_year IS NULL OR fa.academic_year = 'All' OR fa.academic_year = sp.academic_year)
          AND (fa.section IS NULL OR fa.section = 'All' OR fa.section = sp.section)
        )
      )
    )
  );

CREATE POLICY "Users access own roadmap topics" ON public.roadmap_topics
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.roadmaps r
      WHERE r.id = public.roadmap_topics.roadmap_id
      AND r.user_id = auth.uid()
    )
  );


-- ====================================
-- 12_multicollege_saas_architecture.sql
-- ====================================
-- CAREERPILOT AI - PHASE 9: MULTI-COLLEGE SaaS ARCHITECTURE MIGRATION
-- Enhances multi-tenant college isolation, admin scope, and index performance.

-- 1. Extend admin_users with college foreign keys
ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS college_name TEXT;

-- 2. Extend resources, events, notifications, eligibility_rules with college_id for tenant isolation
ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL;

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL;

ALTER TABLE public.eligibility_rules
  ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL;

-- 3. Multi-Tenant Index Optimization
CREATE INDEX IF NOT EXISTS idx_student_profiles_college_id ON public.student_profiles(college_id);
CREATE INDEX IF NOT EXISTS idx_faculty_profiles_college_id ON public.faculty_profiles(college_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_college_id ON public.admin_users(college_id);
CREATE INDEX IF NOT EXISTS idx_departments_college_id ON public.departments(college_id);
CREATE INDEX IF NOT EXISTS idx_resources_college_id ON public.resources(college_id);
CREATE INDEX IF NOT EXISTS idx_notifications_college_id ON public.notifications(college_id);

-- 4. Update RLS Policies for College Isolation
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin access own record" ON public.admin_users;
CREATE POLICY "Admin access own record" ON public.admin_users
  FOR ALL
  USING (auth.uid() = user_id);

-- Update Student Profiles RLS to enforce college isolation
DROP POLICY IF EXISTS "Users can read own profile" ON public.student_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.student_profiles;
DROP POLICY IF EXISTS "College Admin read student profiles" ON public.student_profiles;

CREATE POLICY "Users can read own profile" ON public.student_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.student_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "College Admin read student profiles" ON public.student_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid()
      AND (au.role = 'SuperAdmin' OR au.college_id = public.student_profiles.college_id OR au.college_name = public.student_profiles.college_name)
    )
  );


-- ====================================
-- 13_contact_management.sql
-- ====================================
-- ====================================================================
-- CAREERPILOT AI - MIGRATION 13: CONTACT MANAGEMENT SYSTEM
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived', 'resolved')),
  college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS & Policies
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Contact messages insertable by all" ON public.contact_messages;
CREATE POLICY "Contact messages insertable by all" ON public.contact_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Contact messages viewable by admins" ON public.contact_messages;
CREATE POLICY "Contact messages viewable by admins" ON public.contact_messages FOR SELECT USING (true);

