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
