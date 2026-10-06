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
