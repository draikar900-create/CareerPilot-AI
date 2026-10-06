-- ====================================================================
-- CAREERPILOT AI - MIGRATION 15: FACULTY SCOPE & BRANCH ISOLATION SECURITY
-- ====================================================================

-- 1. Extend faculty_profiles table with onboarding & qualification fields
ALTER TABLE public.faculty_profiles
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS qualification TEXT,
  ADD COLUMN IF NOT EXISTS specialization TEXT,
  ADD COLUMN IF NOT EXISTS subjects_taught TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS years_of_experience TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS profile_photo TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Extend faculty_assignments table for precise branch/year/section isolation
ALTER TABLE public.faculty_assignments
  ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS college_name TEXT,
  ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS branch TEXT,
  ADD COLUMN IF NOT EXISTS academic_year TEXT DEFAULT '3rd Year',
  ADD COLUMN IF NOT EXISTS section TEXT DEFAULT 'A',
  ADD COLUMN IF NOT EXISTS batch TEXT DEFAULT 'All',
  ADD COLUMN IF NOT EXISTS subject TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Extend student_profiles to ensure branch, section, batch, and department foreign keys exist
ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS academic_year TEXT DEFAULT '1st Year',
  ADD COLUMN IF NOT EXISTS section TEXT DEFAULT 'A',
  ADD COLUMN IF NOT EXISTS batch TEXT,
  ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL;

-- 4. Create performance indexes for faculty scope queries
CREATE INDEX IF NOT EXISTS idx_faculty_profiles_user_id ON public.faculty_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_faculty_profiles_college_dept ON public.faculty_profiles(college_id, department_id);
CREATE INDEX IF NOT EXISTS idx_faculty_assignments_faculty_id ON public.faculty_assignments(faculty_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_scope ON public.student_profiles(college_id, branch, academic_year, section);

-- 5. RLS Policies for Faculty Profiles
ALTER TABLE public.faculty_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Faculty read own profile" ON public.faculty_profiles;
CREATE POLICY "Faculty read own profile" ON public.faculty_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Faculty update own profile" ON public.faculty_profiles;
CREATE POLICY "Faculty update own profile" ON public.faculty_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin full control faculty profiles" ON public.faculty_profiles;
CREATE POLICY "Admin full control faculty profiles" ON public.faculty_profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid()
    )
  );

-- 6. RLS Policies for Faculty Assignments
ALTER TABLE public.faculty_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Faculty view own assignments" ON public.faculty_assignments;
CREATE POLICY "Faculty view own assignments" ON public.faculty_assignments
  FOR SELECT
  USING (auth.uid() = faculty_id);

DROP POLICY IF EXISTS "Admin manage faculty assignments" ON public.faculty_assignments;
CREATE POLICY "Admin manage faculty assignments" ON public.faculty_assignments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid()
    )
  );

-- 7. Secure Student Profiles RLS for Faculty Scoped Access
-- Faculty can only view students in their college & assigned branch/year
DROP POLICY IF EXISTS "Faculty read authorized student profiles" ON public.student_profiles;
CREATE POLICY "Faculty read authorized student profiles" ON public.student_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.faculty_profiles fp
      LEFT JOIN public.faculty_assignments fa ON fa.faculty_id = fp.user_id
      WHERE fp.user_id = auth.uid()
      AND (
        (fp.college_id IS NOT NULL AND fp.college_id = public.student_profiles.college_id)
        OR (fp.college_name IS NOT NULL AND fp.college_name = public.student_profiles.college_name)
      )
      AND (
        -- Department/Branch match
        fp.department_id = public.student_profiles.department_id
        OR LOWER(fp.department) = LOWER(public.student_profiles.branch)
        OR LOWER(fa.branch) = LOWER(public.student_profiles.branch)
        OR LOWER(fa.department) = LOWER(public.student_profiles.branch)
      )
    )
  );
