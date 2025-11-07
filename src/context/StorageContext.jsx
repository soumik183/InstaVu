import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { apiManager } from '../services/multiApiManager';
import { useAuth } from './AuthContext';

const StorageContext = createContext({});

export const StorageProvider = ({ children }) => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    search: '',
    sortBy: 'uploaded_at',
    sortOrder: 'desc',
    favorite: false,
  });

  useEffect(() => {
    if (user) {
      loadFiles();
      
      // Subscribe to real-time changes
      const subscription = supabase
        .channel('files_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'files_metadata',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('File change:', payload);
            loadFiles();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const loadFiles = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('files_metadata')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_deleted', false);

      // Apply filters
      if (filters.type !== 'all') {
        query = query.eq('file_type', filters.type);
      }

      if (filters.favorite) {
        query = query.eq('is_favorite', true);
      }

      // Apply sorting
      query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });

      const { data, error } = await query;

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file, onProgress) => {
    setUploading(true);
    try {
      const result = await apiManager.uploadFile(file, {
        userId: user.id,
      });
      
      await loadFiles(); // Reload files
      return result;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (fileId) => {
    try {
      const file = files.find(f => f.id === fileId);
      if (!file) throw new Error('File not found');

      const result = await apiManager.deleteFile(file);
      if (result.success) {
        await loadFiles(); // Reload files
      }
      return result;
    } catch (error) {
      console.error('Delete error:', error);
      return { success: false, error: error.message };
    }
  };

  const downloadFile = async (fileId) => {
    try {
      const file = files.find(f => f.id === fileId);
      if (!file) throw new Error('File not found');

      return await apiManager.downloadFile(file);
    } catch (error) {
      console.error('Download error:', error);
      return { success: false, error: error.message };
    }
  };

  const toggleFavorite = async (fileId) => {
    try {
      const file = files.find(f => f.id === fileId);
      if (!file) throw new Error('File not found');

      const { error } = await supabase
        .from('files_metadata')
        .update({ is_favorite: !file.is_favorite })
        .eq('id', fileId);

      if (error) throw error;

      // Update local state
      setFiles(prevFiles =>
        prevFiles.map(f =>
          f.id === fileId ? { ...f, is_favorite: !f.is_favorite } : f
        )
      );

      return { success: true };
    } catch (error) {
      console.error('Toggle favorite error:', error);
      return { success: false, error: error.message };
    }
  };

  const getFilteredFiles = () => {
    let filtered = [...files];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(file =>
        file.file_name.toLowerCase().includes(searchLower) ||
        file.original_name.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };

  const getFilesByType = (type) => {
    return files.filter(file => file.file_type === type);
  };

  const getTotalStorage = () => {
    return files.reduce((total, file) => total + file.file_size, 0);
  };

  const value = {
    files: getFilteredFiles(),
    allFiles: files,
    loading,
    uploading,
    filters,
    setFilters,
    uploadFile,
    deleteFile,
    downloadFile,
    toggleFavorite,
    refreshFiles: loadFiles,
    getFilesByType,
    getTotalStorage,
    totalFiles: files.length,
  };

  return (
    <StorageContext.Provider value={value}>
      {children}
    </StorageContext.Provider>
  );
};

export const useStorage = () => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within StorageProvider');
  }
  return context;
};