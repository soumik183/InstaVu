CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- TABLE: users_profile
-- Purpose: Store user account information
-- ==========================================
CREATE TABLE users_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  total_files INTEGER DEFAULT 0,
  total_storage_used BIGINT DEFAULT 0, -- Combined from all APIs (bytes)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
  CONSTRAINT username_format CHECK (username ~ '^[a-z0-9_-]+$')
);

-- Indexes
CREATE INDEX idx_users_profile_user_id ON users_profile(user_id);
CREATE INDEX idx_users_profile_username ON users_profile(username);
CREATE INDEX idx_users_profile_created ON users_profile(created_at DESC);

-- RLS Policies
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
  ON users_profile FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
  ON users_profile FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
  ON users_profile FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE users_profile IS 'User profiles - NO FILES STORED HERE';

-- ==========================================
-- TABLE: api_keys
-- Purpose: Store user's external Supabase API credentials
-- ==========================================
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- API Info
  name TEXT NOT NULL,
  description TEXT,
  project_url TEXT NOT NULL,
  anon_key TEXT NOT NULL,
  service_role_key TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,
  
  -- Storage Stats (calculated from files_metadata)
  storage_used BIGINT DEFAULT 0,
  storage_limit BIGINT DEFAULT 5368709120, -- 5GB default
  files_count INTEGER DEFAULT 0,
  
  -- Health
  status TEXT DEFAULT 'active',
  error_message TEXT,
  last_checked TIMESTAMPTZ DEFAULT NOW(),
  connection_speed TEXT DEFAULT 'fast',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, name),
  CHECK (storage_used <= storage_limit),
  CHECK (status IN ('active', 'error', 'full', 'disconnected')),
  CHECK (connection_speed IN ('fast', 'medium', 'slow'))
);

-- Indexes
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_status ON api_keys(user_id, status);
CREATE INDEX idx_api_keys_primary ON api_keys(user_id, is_primary) WHERE is_primary = true;
CREATE INDEX idx_api_keys_active ON api_keys(user_id, is_active) WHERE is_active = true;

-- RLS Policies
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own API keys" 
  ON api_keys FOR ALL 
  USING (auth.uid() = user_id);

COMMENT ON TABLE api_keys IS 'User API credentials - Points to where actual files are stored';

-- ==========================================
-- TABLE: files_metadata
-- Purpose: Store METADATA about files (NOT actual files!)
-- Actual files are in user's Supabase storage
-- ==========================================
CREATE TABLE files_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE NOT NULL,
  
  -- File Identification
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- photo, video, document, other
  file_size BIGINT NOT NULL,
  mime_type TEXT,
  
  -- Storage Location (in user's Supabase)
  file_path TEXT NOT NULL, -- Path in user's storage bucket
  storage_url TEXT, -- Full URL to access file
  
  -- Media Properties
  width INTEGER, -- For images/videos
  height INTEGER,
  duration INTEGER, -- For videos (seconds)
  thumbnail_path TEXT,
  thumbnail_url TEXT,
  
  -- Quality Variants (if generated)
  quality_variants JSONB, -- {"720p": "url", "480p": "url"}
  
  -- Organization
  tags TEXT[],
  description TEXT,
  folder_path TEXT,
  
  -- User Preferences
  is_favorite BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  
  -- Usage Stats
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  
  -- Timestamps
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CHECK (file_type IN ('photo', 'video', 'document', 'other')),
  CHECK (file_size > 0)
);

-- Indexes for fast queries
CREATE INDEX idx_files_user_id ON files_metadata(user_id);
CREATE INDEX idx_files_api_key_id ON files_metadata(api_key_id);
CREATE INDEX idx_files_type ON files_metadata(user_id, file_type) WHERE is_deleted = false;
CREATE INDEX idx_files_uploaded ON files_metadata(user_id, uploaded_at DESC) WHERE is_deleted = false;
CREATE INDEX idx_files_favorite ON files_metadata(user_id, is_favorite) WHERE is_favorite = true AND is_deleted = false;
CREATE INDEX idx_files_deleted ON files_metadata(user_id, is_deleted) WHERE is_deleted = true;

-- Full-text search index
CREATE INDEX idx_files_search ON files_metadata USING gin(to_tsvector('english', original_name || ' ' || COALESCE(description, '')));

-- RLS Policies
ALTER TABLE files_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own files metadata" 
  ON files_metadata FOR ALL 
  USING (auth.uid() = user_id);

COMMENT ON TABLE files_metadata IS '⚠️ METADATA ONLY - Actual files stored in user Supabase!';
COMMENT ON COLUMN files_metadata.file_path IS 'Path in user storage bucket (NOT in main app)';
COMMENT ON COLUMN files_metadata.storage_url IS 'URL from user Supabase storage';

-- ==========================================
-- TABLE: storage_analytics
-- Purpose: Daily storage usage tracking
-- ==========================================
CREATE TABLE storage_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Daily Stats
  uploads_count INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  storage_added BIGINT DEFAULT 0,
  storage_removed BIGINT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, api_key_id, date)
);

-- Indexes
CREATE INDEX idx_analytics_user_date ON storage_analytics(user_id, date DESC);
CREATE INDEX idx_analytics_api ON storage_analytics(api_key_id, date DESC);

-- RLS Policies
ALTER TABLE storage_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own analytics" 
  ON storage_analytics FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own analytics" 
  ON storage_analytics FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE storage_analytics IS 'Daily usage statistics';

-- ==========================================
-- FUNCTIONS
-- ==========================================

-- Function: Update user total storage from metadata
CREATE OR REPLACE FUNCTION update_user_total_storage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users_profile
  SET 
    total_storage_used = (
      SELECT COALESCE(SUM(file_size), 0)
      FROM files_metadata
      WHERE user_id = COALESCE(NEW.user_id, OLD.user_id) AND is_deleted = false
    ),
    total_files = (
      SELECT COUNT(*)
      FROM files_metadata
      WHERE user_id = COALESCE(NEW.user_id, OLD.user_id) AND is_deleted = false
    ),
    updated_at = NOW()
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_user_total_storage IS 'Recalculates user storage from metadata (not actual files)';

-- Function: Update API storage stats from metadata
CREATE OR REPLACE FUNCTION update_api_storage_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_total_size BIGINT;
  v_file_count INTEGER;
BEGIN
  -- Calculate totals from metadata
  SELECT 
    COALESCE(SUM(file_size), 0),
    COUNT(*)
  INTO v_total_size, v_file_count
  FROM files_metadata
  WHERE api_key_id = COALESCE(NEW.api_key_id, OLD.api_key_id) 
    AND is_deleted = false;

  -- Update API stats
  UPDATE api_keys
  SET 
    storage_used = v_total_size,
    files_count = v_file_count,
    status = CASE 
      WHEN v_total_size >= storage_limit * 0.95 THEN 'full'
      WHEN status = 'full' AND v_total_size < storage_limit * 0.90 THEN 'active'
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.api_key_id, OLD.api_key_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_api_storage_stats IS 'Updates API stats from file metadata';

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Update user storage when file metadata changes
CREATE TRIGGER trigger_update_user_storage
AFTER INSERT OR UPDATE OR DELETE ON files_metadata
FOR EACH ROW EXECUTE FUNCTION update_user_total_storage();

-- Update API storage when file metadata changes
CREATE TRIGGER trigger_update_api_storage
AFTER INSERT OR UPDATE OR DELETE ON files_metadata
FOR EACH ROW EXECUTE FUNCTION update_api_storage_stats();

-- Auto-update timestamps
CREATE TRIGGER update_users_profile_updated_at 
BEFORE UPDATE ON users_profile
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at 
BEFORE UPDATE ON api_keys
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_files_metadata_updated_at 
BEFORE UPDATE ON files_metadata
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- VERIFICATION
-- ==========================================

-- Check tables exist
DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'users_profile') = 1, 'users_profile table missing';
  ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'api_keys') = 1, 'api_keys table missing';
  ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'files_metadata') = 1, 'files_metadata table missing';
  ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'storage_analytics') = 1, 'storage_analytics table missing';
  
  RAISE NOTICE '✅ All tables created successfully!';
  RAISE NOTICE '⚠️  IMPORTANT: This schema does NOT store actual files!';
  RAISE NOTICE '📦 Users must setup their own Supabase for file storage!';
END $$;

-- ==========================================
-- SCHEMA COMPLETE ✅
-- Main App Database Ready!
-- NO FILES STORED HERE - ONLY METADATA!
-- ==========================================