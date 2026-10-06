-- Migration 03: Extend eligibility_rules table to support admin UI form fields
-- The existing table only had: id, job_id (FK), min_cgpa, allowed_branches, max_backlogs, created_at
-- The admin form sends: companyName, jobRole, minCgpa, eligibleBranches, maxBacklogs, requiredSkills
-- We add the missing columns so rules can be created without requiring a job_id FK.

ALTER TABLE public.eligibility_rules
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS job_role TEXT,
  ADD COLUMN IF NOT EXISTS required_skills TEXT[] DEFAULT '{}';

-- Make job_id optional (it was previously required conceptually but not enforced with NOT NULL)
-- job_id is already nullable by default since it was added as REFERENCES without NOT NULL
-- No action needed for that.

-- Add a public read policy so students can view eligibility rules
-- (no RLS was set on eligibility_rules, so service-role reads are fine for admin)
-- For students to read via their own JWT, we need a SELECT policy:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'eligibility_rules' AND policyname = 'Students can read eligibility rules'
  ) THEN
    ALTER TABLE public.eligibility_rules ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Students can read eligibility rules"
      ON public.eligibility_rules FOR SELECT
      USING (true);  -- All authenticated users can read eligibility rules
  END IF;
END
$$;

-- Add public read policies for skills, resources, events so students can see admin-created content
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'skills' AND policyname = 'Public can read skills'
  ) THEN
    ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Public can read skills"
      ON public.skills FOR SELECT
      USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'resources' AND policyname = 'Public can read resources'
  ) THEN
    ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Public can read resources"
      ON public.resources FOR SELECT
      USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Public can read events'
  ) THEN
    ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Public can read events"
      ON public.events FOR SELECT
      USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'jobs' AND policyname = 'Public can read published jobs'
  ) THEN
    ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Public can read published jobs"
      ON public.jobs FOR SELECT
      USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'internships' AND policyname = 'Public can read internships'
  ) THEN
    ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Public can read internships"
      ON public.internships FOR SELECT
      USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'companies' AND policyname = 'Public can read companies'
  ) THEN
    ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Public can read companies"
      ON public.companies FOR SELECT
      USING (true);
  END IF;
END
$$;
