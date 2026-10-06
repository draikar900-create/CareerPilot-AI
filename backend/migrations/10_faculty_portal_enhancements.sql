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
