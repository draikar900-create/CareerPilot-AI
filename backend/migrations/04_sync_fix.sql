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
