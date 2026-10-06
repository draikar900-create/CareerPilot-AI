-- CAREERPILOT AI - PHASE 3 MIGRATION
-- Adds First-Time Website Introduction & Step Persistence Columns

ALTER TABLE public.student_profiles
ADD COLUMN IF NOT EXISTS intro_seen BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS current_onboarding_step INTEGER DEFAULT 1;
