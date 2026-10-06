-- ====================================================================
-- CAREERPILOT AI - MIGRATION 19: PHASE 8 SECURITY, DATA ISOLATION & RLS HARDENING
-- ====================================================================

-- 1. Ensure RLS is enabled on ALL core tables
ALTER TABLE IF EXISTS public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.faculty_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.faculty_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.saved_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.saved_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.readiness_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.readiness_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.placement_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.roadmap_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_resource_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.career_goals ENABLE ROW LEVEL SECURITY;

-- 2. STUDENT PROFILES SECURITY POLICIES
DROP POLICY IF EXISTS "Students select own profile" ON public.student_profiles;
CREATE POLICY "Students select own profile" ON public.student_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students update own profile" ON public.student_profiles;
CREATE POLICY "Students update own profile" ON public.student_profiles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students insert own profile" ON public.student_profiles;
CREATE POLICY "Students insert own profile" ON public.student_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Faculty select scoped student profiles" ON public.student_profiles;
CREATE POLICY "Faculty select scoped student profiles" ON public.student_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.faculty_profiles fp
      WHERE fp.user_id = auth.uid()
      AND (
        (fp.college_id IS NOT NULL AND fp.college_id = public.student_profiles.college_id)
        OR (fp.college_name IS NOT NULL AND fp.college_name = public.student_profiles.college_name)
      )
    )
  );

DROP POLICY IF EXISTS "Admin select scoped student profiles" ON public.student_profiles;
CREATE POLICY "Admin select scoped student profiles" ON public.student_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid()
      AND (
        au.role = 'SuperAdmin'
        OR (au.college_id IS NOT NULL AND au.college_id = public.student_profiles.college_id)
        OR (au.college_name IS NOT NULL AND au.college_name = public.student_profiles.college_name)
      )
    )
  );

-- 3. STUDENT DATA ISOLATION POLICIES (Skills, Projects, Certifications, Career Goals)
DROP POLICY IF EXISTS "Student isolate skills" ON public.student_skills;
CREATE POLICY "Student isolate skills" ON public.student_skills
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Student isolate saved_projects" ON public.saved_projects;
CREATE POLICY "Student isolate saved_projects" ON public.saved_projects
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Student isolate saved_certificates" ON public.saved_certificates;
CREATE POLICY "Student isolate saved_certificates" ON public.saved_certificates
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Student isolate career_goals" ON public.career_goals;
CREATE POLICY "Student isolate career_goals" ON public.career_goals
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. ASSESSMENT & ML PREDICTION DATA ISOLATION POLICIES
DROP POLICY IF EXISTS "Student select own attempts" ON public.readiness_attempts;
CREATE POLICY "Student select own attempts" ON public.readiness_attempts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Student insert own attempts" ON public.readiness_attempts;
CREATE POLICY "Student insert own attempts" ON public.readiness_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Student select own predictions" ON public.placement_predictions;
CREATE POLICY "Student select own predictions" ON public.placement_predictions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Faculty admin select scoped predictions" ON public.placement_predictions;
CREATE POLICY "Faculty admin select scoped predictions" ON public.placement_predictions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.student_profiles sp
      WHERE sp.user_id = public.placement_predictions.user_id
      AND (
        EXISTS (
          SELECT 1 FROM public.faculty_profiles fp
          WHERE fp.user_id = auth.uid()
          AND (fp.college_name = sp.college_name OR fp.college_id = sp.college_id)
        )
        OR EXISTS (
          SELECT 1 FROM public.admin_users au
          WHERE au.user_id = auth.uid()
          AND (au.role = 'SuperAdmin' OR au.college_name = sp.college_name OR au.college_id = sp.college_id)
        )
      )
    )
  );

-- 5. ROADMAP ISOLATION POLICIES
DROP POLICY IF EXISTS "Student isolate roadmaps" ON public.roadmaps;
CREATE POLICY "Student isolate roadmaps" ON public.roadmaps
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. NOTIFICATION DATA ISOLATION POLICIES
DROP POLICY IF EXISTS "Student select own or broadcast notifications" ON public.notifications;
CREATE POLICY "Student select own or broadcast notifications" ON public.notifications
  FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());

-- 7. APPLICATIONS ISOLATION POLICIES
DROP POLICY IF EXISTS "Student select own applications" ON public.applications;
CREATE POLICY "Student select own applications" ON public.applications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Student insert own applications" ON public.applications;
CREATE POLICY "Student insert own applications" ON public.applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin TPO select scoped applications" ON public.applications;
CREATE POLICY "Admin TPO select scoped applications" ON public.applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid()
      AND au.role IN ('Admin', 'PlacementOfficer', 'TPO', 'SuperAdmin')
    )
  );

-- 8. PERFORMANCE INDEXES FOR SECURITY & AUTHORIZATION LOOKUPS
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON public.student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id_role ON public.admin_users(user_id, role);
CREATE INDEX IF NOT EXISTS idx_faculty_profiles_user_id_college ON public.faculty_profiles(user_id, college_name);
CREATE INDEX IF NOT EXISTS idx_readiness_attempts_user_id ON public.readiness_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_placement_predictions_user_id ON public.placement_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON public.roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
