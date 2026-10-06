-- ====================================================================
-- CAREERPILOT AI - MIGRATION 09: RANK-BASED LEARNING & ACCESS CONTROL
-- ====================================================================

-- Extend resources table schema
ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS access_level TEXT DEFAULT 'Standard' CHECK (access_level IN ('Standard', 'Faculty', 'Premium', 'Expert')),
  ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'Resource' CHECK (content_type IN ('Notes', 'Lecture', 'Video', 'Resource', 'Class', 'Documentation', 'Practice')),
  ADD COLUMN IF NOT EXISTS academic_year TEXT DEFAULT 'All' CHECK (academic_year IN ('1st Year', '2nd Year', '3rd Year', '4th Year', 'All')),
  ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS department_id TEXT,
  ADD COLUMN IF NOT EXISTS author TEXT DEFAULT 'Staff Engineer',
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;

-- Create student_resource_progress table for tracking completion
CREATE TABLE IF NOT EXISTS public.student_resource_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);

ALTER TABLE public.student_resource_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Progress manage by owner" ON public.student_resource_progress;
CREATE POLICY "Progress manage by owner" ON public.student_resource_progress FOR ALL USING (auth.uid() = user_id);
