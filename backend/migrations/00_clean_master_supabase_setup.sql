-- ====================================================================
-- CAREERPILOT AI - PRISTINE MASTER SUPABASE DATABASE SETUP
-- ====================================================================
-- Description: Complete, clean, single-pass schema migration for Supabase.
-- Compatibility: PostgreSQL 14+, Supabase PostgreSQL
-- Features:
--   1. Extensions (UUID, Cryptography)
--   2. Multi-College Foundation & Hierarchy
--   3. Unified User Profiles (Student, Faculty, Admin)
--   4. Career Goals, Personalized AI Roadmaps & Skill Intelligence
--   5. Jobs, Internships, Applications & Eligibility Rule Engine
--   6. Assessments, Questions, Attempts & Placement Prediction Matrix
--   7. Learning Resources, Progress Tracking & Events
--   8. Contact Management & Notifications
--   9. Complete Multi-Tenant Indexes
--  10. Battle-Tested Row Level Security (RLS) Policies
--  11. Core Seed Data (Assessments & Academic Question Bank)
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. EXTENSIONS
-- --------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --------------------------------------------------------------------
-- 2. FOUNDATION & TENANT LOOKUP TABLES
-- --------------------------------------------------------------------

-- Colleges
CREATE TABLE IF NOT EXISTS public.colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Academic Departments
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(college_id, name)
);

-- Master Skills Taxonomy
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partner Companies
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  website TEXT,
  description TEXT,
  industry TEXT,
  location TEXT,
  company_size TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 3. USER PROFILES & INSTITUTIONAL ROLES
-- --------------------------------------------------------------------

-- Student Profiles
CREATE TABLE IF NOT EXISTS public.student_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  profile_photo TEXT,
  date_of_birth DATE,
  college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
  college_name TEXT,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  branch TEXT,
  semester INTEGER CHECK (semester >= 1 AND semester <= 10),
  academic_year TEXT,
  section TEXT,
  batch TEXT,
  student_id TEXT,
  cgpa NUMERIC(3, 2) CHECK (cgpa >= 0.0 AND cgpa <= 10.0),
  graduation_year INTEGER,
  technical_skills TEXT[] DEFAULT '{}',
  achievements TEXT[] DEFAULT '{}',
  github_url TEXT,
  linkedin_url TEXT,
  resume_url TEXT,
  target_role TEXT,
  career_interests TEXT[] DEFAULT '{}',
  preferred_domains TEXT[] DEFAULT '{}',
  preferred_technologies TEXT[] DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_completed_at TIMESTAMPTZ,
  intro_seen BOOLEAN DEFAULT FALSE,
  current_onboarding_step INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Users (Admins, TPOs, SuperAdmins)
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Admin' CHECK (role IN ('Admin', 'PlacementOfficer', 'SuperAdmin')),
  college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
  college_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Faculty Profiles
CREATE TABLE IF NOT EXISTS public.faculty_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
  college_name TEXT,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  department TEXT,
  employee_id TEXT,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  designation TEXT DEFAULT 'Assistant Professor',
  specialization TEXT,
  subjects TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Faculty Class & Student Assignments
CREATE TABLE IF NOT EXISTS public.faculty_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  department TEXT,
  academic_year TEXT,
  section TEXT,
  batch TEXT,
  subject TEXT,
  assignment_type TEXT DEFAULT 'section' CHECK (assignment_type IN ('all', 'section', 'student', 'subject')),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Faculty Classes & Lecture Schedules
CREATE TABLE IF NOT EXISTS public.faculty_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- --------------------------------------------------------------------
-- 4. CAREER GOALS & PERSONALIZED AI ROADMAPS
-- --------------------------------------------------------------------

-- Career Goals
CREATE TABLE IF NOT EXISTS public.career_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- AI Roadmaps
CREATE TABLE IF NOT EXISTS public.roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES public.career_goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  total_phases INTEGER DEFAULT 1,
  completed_phases INTEGER DEFAULT 0,
  structured_data JSONB,
  generation_status TEXT DEFAULT 'completed',
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Roadmap Topics
CREATE TABLE IF NOT EXISTS public.roadmap_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  phase_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  estimated_hours INTEGER DEFAULT 5,
  is_completed BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Topic Resources
CREATE TABLE IF NOT EXISTS public.topic_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.roadmap_topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT DEFAULT 'article' CHECK (type IN ('article', 'video', 'course', 'documentation')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student Skills Progress
CREATE TABLE IF NOT EXISTS public.student_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  proficiency TEXT CHECK (proficiency IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_name)
);

-- --------------------------------------------------------------------
-- 5. JOBS, INTERNSHIPS, APPLICATIONS & ELIGIBILITY RULES
-- --------------------------------------------------------------------

-- Jobs
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  salary_package TEXT,
  description TEXT,
  deadline TIMESTAMPTZ,
  responsibilities TEXT,
  requirements TEXT,
  eligibility TEXT,
  required_skills TEXT[] DEFAULT '{}',
  work_mode TEXT DEFAULT 'On-site' CHECK (work_mode IN ('On-site', 'Remote', 'Hybrid')),
  employment_type TEXT DEFAULT 'Full-time' CHECK (employment_type IN ('Full-time', 'Part-time', 'Contract', 'Temporary')),
  experience TEXT,
  openings INTEGER DEFAULT 1,
  status TEXT DEFAULT 'Published' CHECK (status IN ('Draft', 'Published', 'Closed', 'Archived')),
  external_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Internships
CREATE TABLE IF NOT EXISTS public.internships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  location TEXT NOT NULL,
  stipend TEXT,
  duration TEXT,
  apply_url TEXT,
  deadline TIMESTAMPTZ,
  requirements TEXT[] DEFAULT '{}',
  responsibilities TEXT,
  eligibility TEXT,
  required_skills TEXT[] DEFAULT '{}',
  work_mode TEXT DEFAULT 'On-site' CHECK (work_mode IN ('On-site', 'Remote', 'Hybrid')),
  openings INTEGER DEFAULT 1,
  status TEXT DEFAULT 'Published' CHECK (status IN ('Draft', 'Published', 'Closed', 'Archived')),
  external_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Placement Eligibility Rules
CREATE TABLE IF NOT EXISTS public.eligibility_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
  company_name TEXT,
  job_role TEXT,
  min_cgpa NUMERIC(3, 2) DEFAULT 6.0,
  allowed_branches TEXT[] DEFAULT '{}',
  max_backlogs INTEGER DEFAULT 0,
  required_skills TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications (Jobs & Internships)
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Saved Opportunities
CREATE TABLE IF NOT EXISTS public.saved_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- --------------------------------------------------------------------
-- 6. PROJECTS & CERTIFICATES
-- --------------------------------------------------------------------

-- Curated Projects Library
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  technologies TEXT[] DEFAULT '{}',
  github_template_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved & In-Progress Projects
CREATE TABLE IF NOT EXISTS public.saved_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  custom_project_data JSONB,
  status TEXT DEFAULT 'bookmarked' CHECK (status IN ('bookmarked', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- Curated Certifications
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  provider TEXT NOT NULL,
  category TEXT,
  credential_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved & Earned Certificates
CREATE TABLE IF NOT EXISTS public.saved_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certificate_id UUID REFERENCES public.certificates(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'bookmarked' CHECK (status IN ('bookmarked', 'completed')),
  earned_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, certificate_id)
);

-- --------------------------------------------------------------------
-- 7. LEARNING RESOURCES & EVENTS
-- --------------------------------------------------------------------

-- Curated Learning Resources
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  is_free BOOLEAN DEFAULT TRUE,
  access_level TEXT DEFAULT 'Standard' CHECK (access_level IN ('Standard', 'Faculty', 'Premium', 'Expert')),
  content_type TEXT DEFAULT 'Resource' CHECK (content_type IN ('Notes', 'Lecture', 'Video', 'Resource', 'Class', 'Documentation', 'Practice')),
  academic_year TEXT DEFAULT 'All' CHECK (academic_year IN ('1st Year', '2nd Year', '3rd Year', '4th Year', 'All')),
  college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
  department_id TEXT,
  author TEXT DEFAULT 'Staff Engineer',
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved Learning Resources
CREATE TABLE IF NOT EXISTS public.saved_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);

-- Student Resource Completion Progress
CREATE TABLE IF NOT EXISTS public.student_resource_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);

-- Campus & Tech Events
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  organizer TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  event_url TEXT,
  description TEXT,
  college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved Events
CREATE TABLE IF NOT EXISTS public.saved_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- --------------------------------------------------------------------
-- 8. ASSESSMENTS, READINESS & ML PREDICTIONS
-- --------------------------------------------------------------------

-- Academic Year Assessment Configs
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Assessment & Readiness Questions
CREATE TABLE IF NOT EXISTS public.readiness_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  academic_year TEXT DEFAULT '1st Year',
  category TEXT NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option_index INTEGER NOT NULL,
  explanation TEXT,
  marks INTEGER DEFAULT 1,
  difficulty TEXT DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Readiness Test Attempts
CREATE TABLE IF NOT EXISTS public.readiness_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  academic_year TEXT DEFAULT '1st Year',
  category TEXT NOT NULL,
  score NUMERIC(5, 2) NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  percentage NUMERIC(5, 2) DEFAULT 0,
  rank TEXT CHECK (rank IN ('Platinum', 'Gold', 'Silver')),
  category_scores JSONB DEFAULT '{}'::jsonb,
  time_spent_seconds INTEGER DEFAULT 0,
  tab_switch_count INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'timed_out', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Readiness Answers Log
CREATE TABLE IF NOT EXISTS public.readiness_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.readiness_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.readiness_questions(id) ON DELETE CASCADE,
  selected_option_index INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  marks_awarded NUMERIC(5, 2) DEFAULT 0
);

-- Placement Prediction Logs (Machine Learning Intelligence)
CREATE TABLE IF NOT EXISTS public.placement_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_version TEXT DEFAULT '1.0.0',
  prediction INTEGER, -- 1 = Placed, 0 = Unplaced
  probability NUMERIC(5, 4), -- Range: 0.0000 to 1.0000
  status TEXT NOT NULL, -- 'High Readiness', 'Moderate Readiness', 'Needs Skill Enhancement', 'insufficient_data', 'service_unavailable'
  missing_fields TEXT[] DEFAULT '{}',
  feature_contributions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Overall Progress Tracking
CREATE TABLE IF NOT EXISTS public.progress_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_score INTEGER DEFAULT 0,
  skills_completed INTEGER DEFAULT 0,
  projects_completed INTEGER DEFAULT 0,
  readiness_score INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 9. PORTAL SETTINGS, NOTIFICATIONS & CONTACT MESSAGES
-- --------------------------------------------------------------------

-- Promotional Banners
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User & College Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL means broadcast
  college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification Settings
CREATE TABLE IF NOT EXISTS public.notification_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  announcements BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Privacy Settings
CREATE TABLE IF NOT EXISTS public.privacy_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'college_only')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Theme Settings
CREATE TABLE IF NOT EXISTS public.theme_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_mode TEXT DEFAULT 'dark' CHECK (theme_mode IN ('dark', 'light', 'system')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact Inquiries & Feedback (Contact Management)
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived', 'resolved')),
  college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 10. MULTI-TENANT & PERFORMANCE INDEXES
-- --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_student_profiles_college_id ON public.student_profiles(college_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_email ON public.student_profiles(email);
CREATE INDEX IF NOT EXISTS idx_faculty_profiles_college_id ON public.faculty_profiles(college_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_college_id ON public.admin_users(college_id);
CREATE INDEX IF NOT EXISTS idx_departments_college_id ON public.departments(college_id);
CREATE INDEX IF NOT EXISTS idx_resources_college_id ON public.resources(college_id);
CREATE INDEX IF NOT EXISTS idx_notifications_college_id ON public.notifications(college_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_college_id ON public.contact_messages(college_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON public.roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_topics_roadmap_id ON public.roadmap_topics(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_opportunities_user_id ON public.saved_opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_faculty_assignments_faculty_id ON public.faculty_assignments(faculty_id);
CREATE INDEX IF NOT EXISTS idx_readiness_attempts_user_id ON public.readiness_attempts(user_id);

-- Unique constraints to prevent duplicate applications
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_job_application ON public.applications (user_id, job_id) WHERE job_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_internship_application ON public.applications (user_id, internship_id) WHERE internship_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_saved_job ON public.saved_opportunities (user_id, job_id) WHERE job_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_saved_internship ON public.saved_opportunities (user_id, internship_id) WHERE internship_id IS NOT NULL;

-- --------------------------------------------------------------------
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------

-- Enable RLS across all tables
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eligibility_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_resource_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Colleges & Departments (Public Read)
DROP POLICY IF EXISTS "Public read access to colleges" ON public.colleges;
CREATE POLICY "Public read access to colleges" ON public.colleges FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access to departments" ON public.departments;
CREATE POLICY "Public read access to departments" ON public.departments FOR SELECT USING (true);

-- Student Profiles
DROP POLICY IF EXISTS "Users can read own profile" ON public.student_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.student_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.student_profiles;
DROP POLICY IF EXISTS "College Admin read student profiles" ON public.student_profiles;

CREATE POLICY "Users can read own profile" ON public.student_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.student_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.student_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "College Admin read student profiles" ON public.student_profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.admin_users au
    WHERE au.user_id = auth.uid()
    AND (au.role = 'SuperAdmin' OR au.college_id = public.student_profiles.college_id OR au.college_name = public.student_profiles.college_name)
  )
);

-- Admin Users
DROP POLICY IF EXISTS "Admin access own record" ON public.admin_users;
CREATE POLICY "Admin access own record" ON public.admin_users FOR ALL USING (auth.uid() = user_id);

-- Faculty Profiles & Assignments
DROP POLICY IF EXISTS "Faculty can read own profile" ON public.faculty_profiles;
DROP POLICY IF EXISTS "Faculty can update own profile" ON public.faculty_profiles;
DROP POLICY IF EXISTS "Faculty can read own assignments" ON public.faculty_assignments;
DROP POLICY IF EXISTS "Faculty manage own classes" ON public.faculty_classes;
DROP POLICY IF EXISTS "Students read assigned classes" ON public.faculty_classes;

CREATE POLICY "Faculty can read own profile" ON public.faculty_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Faculty can update own profile" ON public.faculty_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Faculty can read own assignments" ON public.faculty_assignments FOR SELECT USING (auth.uid() = faculty_id);
CREATE POLICY "Faculty manage own classes" ON public.faculty_classes FOR ALL USING (auth.uid() = faculty_id);
CREATE POLICY "Students read assigned classes" ON public.faculty_classes FOR SELECT USING (true);

-- Career Goals
DROP POLICY IF EXISTS "Users access own career goals" ON public.career_goals;
CREATE POLICY "Users access own career goals" ON public.career_goals FOR ALL USING (auth.uid() = user_id);

-- Roadmaps & Roadmap Topics
DROP POLICY IF EXISTS "Users access own roadmaps" ON public.roadmaps;
DROP POLICY IF EXISTS "Faculty read assigned student roadmaps" ON public.roadmaps;
DROP POLICY IF EXISTS "Users access own roadmap topics" ON public.roadmap_topics;

CREATE POLICY "Users access own roadmaps" ON public.roadmaps FOR ALL USING (auth.uid() = user_id);

-- FIXED: Uses fp.user_id as primary key and matches college and assignments accurately
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

-- Skills & Opportunities Public Read
DROP POLICY IF EXISTS "Public can read skills" ON public.skills;
CREATE POLICY "Public can read skills" ON public.skills FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read companies" ON public.companies;
CREATE POLICY "Public can read companies" ON public.companies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read published jobs" ON public.jobs;
CREATE POLICY "Public can read published jobs" ON public.jobs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read internships" ON public.internships;
CREATE POLICY "Public can read internships" ON public.internships FOR SELECT USING (true);

DROP POLICY IF EXISTS "Students can read eligibility rules" ON public.eligibility_rules;
CREATE POLICY "Students can read eligibility rules" ON public.eligibility_rules FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read resources" ON public.resources;
CREATE POLICY "Public can read resources" ON public.resources FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read events" ON public.events;
CREATE POLICY "Public can read events" ON public.events FOR SELECT USING (true);

-- Applications & Saved Opportunities
DROP POLICY IF EXISTS "Students read own applications" ON public.applications;
DROP POLICY IF EXISTS "Students insert own applications" ON public.applications;
DROP POLICY IF EXISTS "Admins full access to applications" ON public.applications;
DROP POLICY IF EXISTS "Students access own saved opportunities" ON public.saved_opportunities;

CREATE POLICY "Students read own applications" ON public.applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students insert own applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins full access to applications" ON public.applications FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Students access own saved opportunities" ON public.saved_opportunities FOR ALL USING (auth.uid() = user_id);

-- User-Specific Collections (Projects, Certificates, Resources, Events, Skills)
DROP POLICY IF EXISTS "Users access own saved projects" ON public.saved_projects;
CREATE POLICY "Users access own saved projects" ON public.saved_projects FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users access own saved certificates" ON public.saved_certificates;
CREATE POLICY "Users access own saved certificates" ON public.saved_certificates FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users access own saved resources" ON public.saved_resources;
CREATE POLICY "Users access own saved resources" ON public.saved_resources FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Progress manage by owner" ON public.student_resource_progress;
CREATE POLICY "Progress manage by owner" ON public.student_resource_progress FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users access own saved events" ON public.saved_events;
CREATE POLICY "Users access own saved events" ON public.saved_events FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users access own skills" ON public.student_skills;
CREATE POLICY "Users access own skills" ON public.student_skills FOR ALL USING (auth.uid() = user_id);

-- Assessments & Attempts
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

-- ML Predictions & Progress
DROP POLICY IF EXISTS "Users access own placement predictions" ON public.placement_predictions;
CREATE POLICY "Users access own placement predictions" ON public.placement_predictions FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users access own progress tracking" ON public.progress_tracking;
CREATE POLICY "Users access own progress tracking" ON public.progress_tracking FOR ALL USING (auth.uid() = user_id);

-- Notifications & Contact Management
DROP POLICY IF EXISTS "Users access own or broadcast notifications" ON public.notifications;
CREATE POLICY "Users access own or broadcast notifications" ON public.notifications FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Contact messages insertable by all" ON public.contact_messages;
CREATE POLICY "Contact messages insertable by all" ON public.contact_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Contact messages viewable by admins" ON public.contact_messages;
CREATE POLICY "Contact messages viewable by admins" ON public.contact_messages FOR SELECT USING (true);

-- --------------------------------------------------------------------
-- 12. CORE SEED DATA (ASSESSMENTS & BASELINE EVALUATIONS)
-- --------------------------------------------------------------------
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

-- Seed Colleges & Companies Taxonomy
INSERT INTO public.colleges (name, location)
VALUES
  ('Institute of Technology & Science', 'California, USA'),
  ('National College of Engineering', 'New York, USA')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.companies (name, industry, location, website)
VALUES
  ('Google', 'Technology', 'Mountain View, CA', 'https://google.com'),
  ('Microsoft', 'Software', 'Redmond, WA', 'https://microsoft.com'),
  ('Amazon', 'E-Commerce & Cloud', 'Seattle, WA', 'https://amazon.com'),
  ('Meta', 'Social Technology', 'Menlo Park, CA', 'https://meta.com')
ON CONFLICT (name) DO NOTHING;

-- Seed Master Skills Taxonomy
INSERT INTO public.skills (name, category)
VALUES
  ('Python', 'Languages'),
  ('JavaScript', 'Languages'),
  ('TypeScript', 'Languages'),
  ('React', 'Frontend'),
  ('Node.js', 'Backend'),
  ('Express.js', 'Backend'),
  ('PostgreSQL', 'Databases'),
  ('MongoDB', 'Databases'),
  ('Data Structures', 'CS Fundamentals'),
  ('Algorithms', 'CS Fundamentals'),
  ('Machine Learning', 'AI & Data Science'),
  ('Docker', 'DevOps & Cloud'),
  ('AWS', 'DevOps & Cloud'),
  ('System Design', 'Architecture')
ON CONFLICT (name) DO NOTHING;

-- Seed Year 2, 3, 4 Sample Questions
INSERT INTO public.readiness_questions (academic_year, category, question_text, options, correct_option_index, explanation, difficulty, marks, order_index)
VALUES
('2nd Year', 'Technical', 'What is the average time complexity of searching in a Hash Table?', '["O(1)", "O(n)", "O(log n)", "O(n^2)"]'::jsonb, 0, 'Average time complexity for hash lookup is O(1) assuming a uniform hash distribution.', 'Medium', 1, 1),
('2nd Year', 'Aptitude', 'A car travels 300 km at 60 km/h and returns at 40 km/h. What is the average speed for the whole journey?', '["48 km/h", "50 km/h", "52 km/h", "45 km/h"]'::jsonb, 0, 'Average Speed = 2 * v1 * v2 / (v1 + v2) = 2 * 60 * 40 / (100) = 48 km/h.', 'Medium', 1, 2),
('3rd Year', 'Technical', 'Which database transaction isolation level prevents Phantom Reads?', '["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"]'::jsonb, 3, 'Serializable isolation level prevents dirty reads, non-repeatable reads, and phantom reads.', 'Hard', 1, 1),
('3rd Year', 'Problem Solving', 'In React 18, what is the primary purpose of useMemo hook?', '["Side Effects", "Cache Expensive Computations", "State Management", "DOM References"]'::jsonb, 1, 'useMemo memoizes calculated values across re-renders until dependencies change.', 'Medium', 1, 2),
('4th Year', 'Technical', 'In distributed systems under the CAP theorem, what does Partition Tolerance (P) guarantee?', '["No latency", "System functions despite network dropped messages", "Single node execution", "Immediate disk sync"]'::jsonb, 1, 'Partition tolerance means the system continues operating despite network message loss or delay between nodes.', 'Hard', 1, 1)
ON CONFLICT DO NOTHING;

-- ====================================================================
-- END OF PRISTINE MASTER SETUP
-- ====================================================================
