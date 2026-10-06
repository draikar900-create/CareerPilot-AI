-- ====================================================================
-- CAREERPILOT AI - MIGRATION 16: FACULTY LEARNING CONTENT, YOUTUBE & STUDENT NOTES
-- ====================================================================

-- 1. Extend resources table for faculty YouTube videos and scoped study materials
ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS branch TEXT,
  ADD COLUMN IF NOT EXISTS academic_year TEXT,
  ADD COLUMN IF NOT EXISTS section TEXT,
  ADD COLUMN IF NOT EXISTS subject TEXT,
  ADD COLUMN IF NOT EXISTS topic TEXT,
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'notes',
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Create faculty_student_notes table for private student feedback & evaluations
CREATE TABLE IF NOT EXISTS public.faculty_student_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  faculty_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
  category TEXT DEFAULT 'Academic Observation',
  note_text TEXT NOT NULL,
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indexes for resource and note queries
CREATE INDEX IF NOT EXISTS idx_resources_scope ON public.resources(college_id, branch, academic_year, section);
CREATE INDEX IF NOT EXISTS idx_resources_created_by ON public.resources(created_by);
CREATE INDEX IF NOT EXISTS idx_faculty_student_notes_student_id ON public.faculty_student_notes(student_id);
CREATE INDEX IF NOT EXISTS idx_faculty_student_notes_faculty_id ON public.faculty_student_notes(faculty_id);

-- 4. Enable RLS on faculty_student_notes
ALTER TABLE public.faculty_student_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Faculty manage student notes" ON public.faculty_student_notes;
CREATE POLICY "Faculty manage student notes" ON public.faculty_student_notes
  FOR ALL
  USING (auth.uid() = faculty_id);

DROP POLICY IF EXISTS "Admin read faculty student notes" ON public.faculty_student_notes;
CREATE POLICY "Admin read faculty student notes" ON public.faculty_student_notes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid()
    )
  );

-- Students cannot select private notes
DROP POLICY IF EXISTS "Students read non-private feedback" ON public.faculty_student_notes;
CREATE POLICY "Students read non-private feedback" ON public.faculty_student_notes
  FOR SELECT
  USING (
    auth.uid() = student_id AND is_private = false
  );
