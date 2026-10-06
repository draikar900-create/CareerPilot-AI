-- ====================================================================
-- CAREERPILOT AI - MIGRATION 21: COMPANY RLS HARDENING & UNIFIED RESOURCE SCOPE
-- ====================================================================

-- 1. Ensure public.companies table has all required metadata columns
ALTER TABLE IF EXISTS public.companies ADD COLUMN IF NOT EXISTS industry TEXT DEFAULT 'Technology';
ALTER TABLE IF EXISTS public.companies ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Hybrid / On-site';
ALTER TABLE IF EXISTS public.companies ADD COLUMN IF NOT EXISTS company_size TEXT DEFAULT '100-500';
ALTER TABLE IF EXISTS public.companies ADD COLUMN IF NOT EXISTS website TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.companies ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.companies ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT '';

-- 2. Enable Row-Level Security on companies table
ALTER TABLE IF EXISTS public.companies ENABLE ROW LEVEL SECURITY;

-- 3. SELECT policy: Anyone authenticated or public can read companies
DROP POLICY IF EXISTS "Public can read companies" ON public.companies;
DROP POLICY IF EXISTS "Anyone can select companies" ON public.companies;
CREATE POLICY "Anyone can select companies" ON public.companies
  FOR SELECT USING (true);

-- 4. INSERT policy: Authorized Admin / TPO users (or service_role) can insert companies
DROP POLICY IF EXISTS "Admin TPO insert companies" ON public.companies;
CREATE POLICY "Admin TPO insert companies" ON public.companies
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid()
      AND au.role IN ('Admin', 'PlacementOfficer', 'TPO', 'SuperAdmin')
    )
    OR auth.jwt() ->> 'role' = 'service_role'
    OR auth.role() = 'service_role'
  );

-- 5. UPDATE policy: Authorized Admin / TPO users can update companies
DROP POLICY IF EXISTS "Admin TPO update companies" ON public.companies;
CREATE POLICY "Admin TPO update companies" ON public.companies
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid()
      AND au.role IN ('Admin', 'PlacementOfficer', 'TPO', 'SuperAdmin')
    )
    OR auth.jwt() ->> 'role' = 'service_role'
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid()
      AND au.role IN ('Admin', 'PlacementOfficer', 'TPO', 'SuperAdmin')
    )
    OR auth.jwt() ->> 'role' = 'service_role'
    OR auth.role() = 'service_role'
  );

-- 6. DELETE policy: Authorized Admin / TPO users can delete companies
DROP POLICY IF EXISTS "Admin TPO delete companies" ON public.companies;
CREATE POLICY "Admin TPO delete companies" ON public.companies
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid()
      AND au.role IN ('Admin', 'PlacementOfficer', 'TPO', 'SuperAdmin')
    )
    OR auth.jwt() ->> 'role' = 'service_role'
    OR auth.role() = 'service_role'
  );

-- 7. Ensure RLS on public.resources table for learning content
ALTER TABLE IF EXISTS public.resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can select published resources" ON public.resources;
CREATE POLICY "Anyone can select published resources" ON public.resources
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Faculty admin insert resources" ON public.resources;
CREATE POLICY "Faculty admin insert resources" ON public.resources
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.faculty_profiles fp WHERE fp.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.admin_users au WHERE au.user_id = auth.uid() AND au.role IN ('Admin', 'PlacementOfficer', 'TPO', 'SuperAdmin')
    )
    OR auth.jwt() ->> 'role' = 'service_role'
    OR auth.role() = 'service_role'
  );
