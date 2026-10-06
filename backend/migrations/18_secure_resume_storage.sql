-- Migration 18: Secure Resume Storage & Privacy Metadata Columns
-- Adds columns for private storage tracking, original filename, and upload timestamp.

ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS resume_storage_path TEXT,
  ADD COLUMN IF NOT EXISTS resume_file_name TEXT,
  ADD COLUMN IF NOT EXISTS resume_uploaded_at TIMESTAMPTZ;

-- Backfill existing resume_url into resume_storage_path for legacy records
UPDATE public.student_profiles
SET 
  resume_storage_path = CASE 
    WHEN resume_url LIKE '%/storage/v1/object/public/resumes/%' THEN 
      SUBSTRING(resume_url FROM '%/storage/v1/object/public/resumes/(.*)')
    WHEN resume_url LIKE 'resumes/%' THEN 
      resume_url
    ELSE 
      resume_url
  END,
  resume_file_name = COALESCE(resume_file_name, 'resume.pdf'),
  resume_uploaded_at = COALESCE(resume_uploaded_at, updated_at, NOW())
WHERE resume_url IS NOT NULL AND resume_storage_path IS NULL;
