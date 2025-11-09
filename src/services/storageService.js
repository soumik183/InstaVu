import { supabase } from './supabaseClient';

export const storageService = {
  // Get all files for user
  async getAllFiles(userId, filters = {}) {
    try {
      let query = supabase
        .from('files_metadata')
        .select('*')
        .eq('user_id', userId)
        .eq('is_deleted', false);

      // Apply filters
      if (filters.type && filters.type !== 'all') {
        query = query.eq('file_type', filters.type);
      }

      if (filters.favorite) {
        query = query.eq('is_favorite', true);
      }

      // Apply sorting
      if (filters.sortBy) {
        query = query.order(filters.sortBy, { 
          ascending: filters.sortOrder === 'asc' 
        });
      }

      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get file by ID
  async getFileById(fileId, userId) {
    try {
      const { data, error } = await supabase
        .from('files_metadata')
        .select('*')
        .eq('id', fileId)
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update file metadata
  async updateFileMetadata(fileId, updates) {
    try {
      const { data, error } = await supabase
        .from('files_metadata')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', fileId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Toggle file favorite status
  async toggleFavorite(fileId, userId) {
    try {
      // Get current favorite status
      const { data: currentFile, error: fetchError } = await supabase
        .from('files_metadata')
        .select('is_favorite')
        .eq('id', fileId)
        .eq('user_id', userId)
        .single();

      if (fetchError) throw fetchError;

      const { data, error } = await supabase
        .from('files_metadata')
        .update({ 
          is_favorite: !currentFile.is_favorite,
          updated_at: new Date().toISOString()
        })
        .eq('id', fileId)
        .eq('user_id', userId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Soft delete file
  async deleteFile(fileId, userId) {
    try {
      const { data, error } = await supabase
        .from('files_metadata')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString()
        })
        .eq('id', fileId)
        .eq('user_id', userId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Permanently delete file (admin only)
  async permanentlyDeleteFile(fileId, userId) {
    try {
      const { error } = await supabase
        .from('files_metadata')
        .delete()
        .eq('id', fileId)
        .eq('user_id', userId);

      return { error };
    } catch (error) {
      return { error };
    }
  },

  // Get files by type
  async getFilesByType(userId, fileType) {
    try {
      const { data, error } = await supabase
        .from('files_metadata')
        .select('*')
        .eq('user_id', userId)
        .eq('file_type', fileType)
        .eq('is_deleted', false)
        .order('uploaded_at', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get favorite files
  async getFavoriteFiles(userId) {
    try {
      const { data, error } = await supabase
        .from('files_metadata')
        .select('*')
        .eq('user_id', userId)
        .eq('is_favorite', true)
        .eq('is_deleted', false)
        .order('uploaded_at', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Search files
  async searchFiles(userId, searchTerm) {
    try {
      const { data, error } = await supabase
        .from('files_metadata')
        .select('*')
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .or(`file_name.ilike.%${searchTerm}%,original_name.ilike.%${searchTerm}%`)
        .order('uploaded_at', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get file statistics
  async getFileStats(userId) {
    try {
      const { data, error } = await supabase
        .from('files_metadata')
        .select('file_type, file_size')
        .eq('user_id', userId)
        .eq('is_deleted', false);

      if (error) throw error;

      const stats = {
        totalFiles: data.length,
        totalSize: data.reduce((sum, file) => sum + file.file_size, 0),
        byType: {}
      };

      // Group by file type
      data.forEach(file => {
        if (!stats.byType[file.file_type]) {
          stats.byType[file.file_type] = { count: 0, size: 0 };
        }
        stats.byType[file.file_type].count++;
        stats.byType[file.file_type].size += file.file_size;
      });

      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update download count
  async incrementDownloadCount(fileId) {
    try {
      const { data, error } = await supabase
        .rpc('increment_download_count', { file_id: fileId });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Batch operations
  async batchUpdateFavorite(fileIds, isFavorite) {
    try {
      const { data, error } = await supabase
        .from('files_metadata')
        .update({ 
          is_favorite: isFavorite,
          updated_at: new Date().toISOString()
        })
        .in('id', fileIds)
        .select();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async batchDeleteFiles(fileIds, userId) {
    try {
      const { data, error } = await supabase
        .from('files_metadata')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString()
        })
        .in('id', fileIds)
        .eq('user_id', userId)
        .select();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }
};