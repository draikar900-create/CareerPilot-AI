-- ====================================================================
-- CAREERPILOT AI - MIGRATION 20: PHASE 9 OPERATIONAL WORKFLOWS SCHEMA
-- ====================================================================

-- 1. Faculty Feedback Table for persisted student academic guidance & feedback
CREATE TABLE IF NOT EXISTS public.faculty_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID NOT NULL,
  student_id UUID NOT NULL,
  category VARCHAR(100) DEFAULT 'Academic Guidance',
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on faculty_feedback
ALTER TABLE public.faculty_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Faculty manage own feedback" ON public.faculty_feedback;
CREATE POLICY "Faculty manage own feedback" ON public.faculty_feedback
  FOR ALL USING (auth.uid() = faculty_id) WITH CHECK (auth.uid() = faculty_id);

DROP POLICY IF EXISTS "Students view own received feedback" ON public.faculty_feedback;
CREATE POLICY "Students view own received feedback" ON public.faculty_feedback
  FOR SELECT USING (auth.uid() = student_id);

-- 2. Official Placement Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'Placement Drive',
  college_id UUID REFERENCES public.colleges(id) ON DELETE CASCADE,
  college_name VARCHAR(255),
  target_branch VARCHAR(100) DEFAULT 'All',
  target_year VARCHAR(100) DEFAULT 'All',
  created_by UUID NOT NULL,
  author_name VARCHAR(255),
  external_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students select scoped announcements" ON public.announcements;
CREATE POLICY "Students select scoped announcements" ON public.announcements
  FOR SELECT USING (
    college_id IS NULL 
    OR EXISTS (
      SELECT 1 FROM public.student_profiles sp
      WHERE sp.user_id = auth.uid()
      AND (sp.college_id = announcements.college_id OR sp.college_name = announcements.college_name)
    )
  );

DROP POLICY IF EXISTS "TPO Admin manage announcements" ON public.announcements;
CREATE POLICY "TPO Admin manage announcements" ON public.announcements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid()
      AND au.role IN ('Admin', 'PlacementOfficer', 'TPO', 'SuperAdmin')
    )
  );

-- 3. Faculty Scheduled Classes Table
CREATE TABLE IF NOT EXISTS public.faculty_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID NOT NULL,
  college_id UUID,
  department_id UUID,
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(200),
  topic VARCHAR(200),
  description TEXT,
  department VARCHAR(100),
  academic_year VARCHAR(100) DEFAULT '3rd Year',
  section VARCHAR(50) DEFAULT 'A',
  class_date TIMESTAMPTZ DEFAULT NOW(),
  meeting_url TEXT,
  status VARCHAR(50) DEFAULT 'Scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.faculty_classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Faculty manage own classes" ON public.faculty_classes;
CREATE POLICY "Faculty manage own classes" ON public.faculty_classes
  FOR ALL USING (auth.uid() = faculty_id) WITH CHECK (auth.uid() = faculty_id);

DROP POLICY IF EXISTS "Students view scoped faculty classes" ON public.faculty_classes;
CREATE POLICY "Students view scoped faculty classes" ON public.faculty_classes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.student_profiles sp
      WHERE sp.user_id = auth.uid()
      AND (
        sp.college_id = faculty_classes.college_id
        OR LOWER(sp.branch) = LOWER(faculty_classes.department)
      )
    )
  );

-- 4. Indices for Performance
CREATE INDEX IF NOT EXISTS idx_faculty_feedback_student ON public.faculty_feedback(student_id);
CREATE INDEX IF NOT EXISTS idx_faculty_feedback_faculty ON public.faculty_feedback(faculty_id);
CREATE INDEX IF NOT EXISTS idx_announcements_college ON public.announcements(college_id);
CREATE INDEX IF NOT EXISTS idx_faculty_classes_faculty ON public.faculty_classes(faculty_id);
