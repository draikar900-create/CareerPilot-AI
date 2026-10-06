-- CAREERPILOT AI - PHASE 2 MIGRATION
-- Placement Predictions Persistence Table & RLS Policies

CREATE TABLE IF NOT EXISTS public.placement_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_version TEXT DEFAULT '1.0.0',
  prediction INTEGER, -- 1 = Placed, 0 = Unplaced
  probability NUMERIC(5, 4), -- Range: 0.0000 to 1.0000
  status TEXT NOT NULL, -- 'High Readiness', 'Moderate Readiness', 'Needs Skill Enhancement', 'insufficient_data', 'service_unavailable'
  missing_fields TEXT[] DEFAULT '{}',
  feature_contributions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.placement_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users access own placement predictions" ON public.placement_predictions;
CREATE POLICY "Users access own placement predictions" ON public.placement_predictions FOR ALL USING (auth.uid() = user_id);
