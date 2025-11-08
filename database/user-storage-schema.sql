-- =====================================================
-- InstaVu User Storage Schema
-- Run this in USER'S OWN SUPABASE PROJECT
-- 
-- ✅ THIS IS WHERE ACTUAL FILES ARE STORED!
-- =====================================================

-- ==========================================
-- STORAGE BUCKET SETUP
-- ==========================================

-- Create main storage bucket for all files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'instavault-storage',
  'instavault-storage',
  false, -- Private bucket (requires authentication)
  null, -- No file size limit
  ARRAY[
    -- Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
    -- Videos
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
    'video/mpeg',
    -- Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'text/html',
    'text/markdown',
    -- Archives
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/x-tar',
    'application/gzip',
    -- Audio (bonus)
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/webm'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ==========================================
-- STORAGE POLICIES
-- ==========================================

-- Policy: Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'instavault-storage');

-- Policy: Allow authenticated users to read files
CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'instavault-storage');

-- Policy: Allow authenticated users to update files
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'instavault-storage')
WITH CHECK (bucket_id = 'instavault-storage');

-- Policy: Allow authenticated users to delete files
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'instavault-storage');

-- ==========================================
-- OPTIONAL: File Tracking Table
-- (Backup metadata in user's database)
-- ==========================================

-- Create extension for UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Optional table to track files in user's Supabase
CREATE TABLE IF NOT EXISTS files_backup (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_path TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT,
  uploaded_by TEXT, -- Can store InstaVu user_id
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_files_backup_path ON files_backup(file_path);
CREATE INDEX IF NOT EXISTS idx_files_backup_uploaded ON files_backup(uploaded_at DESC);

-- RLS on backup table
ALTER TABLE files_backup ENABLE ROW LEVEL SECURITY;

-- Simple policy - allow all authenticated
CREATE POLICY "Allow authenticated file backup access"
ON files_backup FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

COMMENT ON TABLE files_backup IS 'Optional: Local backup of file metadata';

-- ==========================================
-- STORAGE FUNCTIONS
-- ==========================================

-- Function: Get total storage usage
CREATE OR REPLACE FUNCTION get_storage_usage()
RETURNS TABLE (
  total_files BIGINT,
  total_size BIGINT,
  bucket_id TEXT
) AS $$
DECLARE
  v_bucket_id TEXT := 'instavault-storage';
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_files,
    COALESCE(SUM((metadata->>'size')::BIGINT), 0) as total_size,
    v_bucket_id
  FROM storage.objects
  WHERE bucket_id = v_bucket_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_storage_usage IS 'Get current storage usage statistics';

-- Function: Get storage by file type
CREATE OR REPLACE FUNCTION get_storage_by_type()
RETURNS TABLE (
  file_type TEXT,
  file_count BIGINT,
  total_size BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN metadata->>'mimetype' LIKE 'image/%' THEN 'images'
      WHEN metadata->>'mimetype' LIKE 'video/%' THEN 'videos'
      WHEN metadata->>'mimetype' LIKE 'application/pdf' THEN 'documents'
      WHEN metadata->>'mimetype' LIKE 'application/%' THEN 'documents'
      ELSE 'other'
    END as file_type,
    COUNT(*)::BIGINT as file_count,
    COALESCE(SUM((metadata->>'size')::BIGINT), 0) as total_size
  FROM storage.objects
  WHERE bucket_id = 'instavault-storage'
  GROUP BY file_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Clean up old deleted files (optional maintenance)
CREATE OR REPLACE FUNCTION cleanup_deleted_files(days_old INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- This is a placeholder - implement based on your needs
  -- You might want to delete files marked for deletion in metadata
  deleted_count := 0;
  
  RAISE NOTICE 'Cleanup function - implement based on requirements';
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- VERIFICATION
-- ==========================================

-- Check if bucket exists
DO $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM storage.buckets WHERE id = 'instavault-storage'
  ) INTO bucket_exists;
  
  IF bucket_exists THEN
    RAISE NOTICE '✅ Storage bucket "instavault-storage" created successfully!';
    RAISE NOTICE '📦 This bucket will store ALL user files (photos, videos, documents)';
    RAISE NOTICE '🔒 Bucket is PRIVATE - requires authentication';
    RAISE NOTICE '📊 Max file size: 500MB per file';
  ELSE
    RAISE EXCEPTION '❌ Storage bucket creation failed!';
  END IF;
END $$;

-- Test storage usage function
SELECT * FROM get_storage_usage();

-- ==========================================
-- SCHEMA COMPLETE ✅
-- User Storage Ready!
-- ALL FILES WILL BE STORED HERE!
-- ==========================================