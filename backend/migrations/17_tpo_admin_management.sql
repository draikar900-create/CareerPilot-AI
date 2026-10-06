-- Migration 17: TPO & Placement Officer System Enhancements + Audit Logging & Security Scope
-- Phase 4: Placement Status, College Departments, Faculty Assignment Management, and Audit Logs

-- 1. Ensure placement_status and placement_notes columns exist on student_profiles
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'student_profiles' AND column_name = 'placement_status'
  ) THEN
    ALTER TABLE student_profiles ADD COLUMN placement_status VARCHAR(50) DEFAULT 'Not Started';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'student_profiles' AND column_name = 'placement_notes'
  ) THEN
    ALTER TABLE student_profiles ADD COLUMN placement_notes TEXT DEFAULT '';
  END IF;
END $$;

-- 2. Audit Logs Table for administrative actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  actor_email VARCHAR(255),
  actor_role VARCHAR(50),
  action VARCHAR(255) NOT NULL,
  target VARCHAR(255),
  college_id UUID,
  college_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs for their college" ON audit_logs;
CREATE POLICY "Admins can view audit logs for their college" ON audit_logs
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM admin_users WHERE role IN ('Admin', 'SuperAdmin', 'PlacementOfficer', 'TPO')
    )
  );

-- 3. Departments table if not exists
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_name VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(college_name, name)
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read departments" ON departments;
CREATE POLICY "Public read departments" ON departments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage departments" ON departments;
CREATE POLICY "Admins manage departments" ON departments
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM admin_users WHERE role IN ('Admin', 'SuperAdmin')
    )
  );

-- 4. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_student_profiles_college_branch ON student_profiles(college_name, branch);
CREATE INDEX IF NOT EXISTS idx_student_profiles_placement_status ON student_profiles(placement_status);
CREATE INDEX IF NOT EXISTS idx_faculty_assignments_faculty_id ON faculty_assignments(faculty_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
