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
