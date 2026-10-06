-- CAREERPILOT AI - PHASE 7: PERSONALIZED AI CAREER ROADMAP MIGRATION
-- Adds structured_data, generation metadata to roadmaps table and updates RLS policies.

ALTER TABLE public.roadmaps
  ADD COLUMN IF NOT EXISTS structured_data JSONB,
  ADD COLUMN IF NOT EXISTS generation_status TEXT DEFAULT 'completed',
  ADD COLUMN IF NOT EXISTS generated_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON public.roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_topics_roadmap_id ON public.roadmap_topics(roadmap_id);

-- Ensure RLS is active and updated
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_topics ENABLE ROW LEVEL SECURITY;

-- Drop previous restrictive policies if present to re-create safely
DROP POLICY IF EXISTS "Users access own roadmaps" ON public.roadmaps;
DROP POLICY IF EXISTS "Faculty read assigned student roadmaps" ON public.roadmaps;
DROP POLICY IF EXISTS "Users access own roadmap topics" ON public.roadmap_topics;

CREATE POLICY "Users access own roadmaps" ON public.roadmaps
  FOR ALL
  USING (auth.uid() = user_id);

-- Policy to allow faculty to read roadmaps of assigned students
CREATE POLICY "Faculty read assigned student roadmaps" ON public.roadmaps
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.faculty_profiles fp
      JOIN public.faculty_assignments fa ON fa.faculty_id = fp.user_id
      JOIN public.student_profiles sp ON sp.user_id = public.roadmaps.user_id
      WHERE fp.user_id = auth.uid()
      AND (
        (fp.college_id IS NOT NULL AND sp.college_id = fp.college_id)
        OR (fp.college_name IS NOT NULL AND sp.college_name = fp.college_name)
        OR (fp.college_id IS NULL AND fp.college_name IS NULL)
      )
      AND (
        fa.assignment_type = 'all'
        OR (fa.student_id = sp.user_id)
        OR (
          (fa.academic_year IS NULL OR fa.academic_year = 'All' OR fa.academic_year = sp.academic_year)
          AND (fa.section IS NULL OR fa.section = 'All' OR fa.section = sp.section)
        )
      )
    )
  );

CREATE POLICY "Users access own roadmap topics" ON public.roadmap_topics
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.roadmaps r
      WHERE r.id = public.roadmap_topics.roadmap_id
      AND r.user_id = auth.uid()
    )
  );
