-- ====================================================================
-- CAREERPILOT AI - MIGRATION 14: ROLE, SCOPE & AUTHORIZATION SECURITY
-- ====================================================================

-- 1. Extend faculty_profiles to support onboarding tracking and relational FK scope
ALTER TABLE public.faculty_profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL;

-- 2. Index for faculty lookup performance
CREATE INDEX IF NOT EXISTS idx_faculty_profiles_user_id ON public.faculty_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_faculty_profiles_dept ON public.faculty_profiles(department);

-- 3. Faculty RLS Policies
ALTER TABLE public.faculty_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Faculty read own profile" ON public.faculty_profiles;
CREATE POLICY "Faculty read own profile" ON public.faculty_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Faculty update own profile" ON public.faculty_profiles;
CREATE POLICY "Faculty update own profile" ON public.faculty_profiles
  FOR ALL
  USING (auth.uid() = user_id);

-- 4. Extend Student Profiles RLS to allow authorized Faculty to read student profiles in their college
DROP POLICY IF EXISTS "Faculty read college student profiles" ON public.student_profiles;
CREATE POLICY "Faculty read college student profiles" ON public.student_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.faculty_profiles fp
      WHERE fp.user_id = auth.uid()
      AND (
        (fp.college_id IS NOT NULL AND fp.college_id = public.student_profiles.college_id)
        OR (fp.college_name IS NOT NULL AND fp.college_name = public.student_profiles.college_name)
      )
    )
    OR EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid()
      AND (au.role = 'SuperAdmin' OR au.college_id = public.student_profiles.college_id OR au.college_name = public.student_profiles.college_name)
    )
  );
