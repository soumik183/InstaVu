import { createContext, useContext, useState, useEffect } from 'react';
import { apiKeyService } from '../services/apiKeyService';
import { apiManager } from '../services/multiApiManager';
import { useAuth } from './AuthContext';

const ApiContext = createContext({});

export const ApiProvider = ({ children }) => {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (user && !initialized) {
      initializeApis();
    }
  }, [user]);

  const initializeApis = async () => {
    setLoading(true);
    try {
      // Initialize API manager
      const { apiKeys: keys } = await apiManager.initialize(user.id);
      setApiKeys(keys || []);
      setInitialized(true);
    } catch (error) {
      console.error('Error initializing APIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadApiKeys = async () => {
    if (!user) return;
    
    const { data, error } = await apiKeyService.getAllApiKeys(user.id);
    if (!error && data) {
      setApiKeys(data);
    }
  };

  const addApiKey = async (apiData) => {
    try {
      // Add to database
      const { data, error } = await apiKeyService.addApiKey(user.id, apiData);
      if (error) throw error;

      // Add to API manager
      const result = await apiManager.addApi(data);
      if (!result.success) {
        throw new Error(result.error);
      }

      await loadApiKeys();
      return { success: true, data };
    } catch (error) {
      console.error('Add API error:', error);
      return { success: false, error: error.message };
    }
  };

  const updateApiKey = async (apiKeyId, updates) => {
    try {
      const { data, error } = await apiKeyService.updateApiKey(apiKeyId, updates);
      if (error) throw error;

      await loadApiKeys();
      return { success: true, data };
    } catch (error) {
      console.error('Update API error:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteApiKey = async (apiKeyId) => {
    try {
      const { error } = await apiKeyService.deleteApiKey(apiKeyId);
      if (error) throw error;

      // Remove from API manager
      apiManager.apiClients.delete(apiKeyId);

      await loadApiKeys();
      return { success: true };
    } catch (error) {
      console.error('Delete API error:', error);
      return { success: false, error: error.message };
    }
  };

  const testConnection = async (projectUrl, anonKey) => {
    return await apiKeyService.testApiConnection(projectUrl, anonKey);
  };

  const setPrimaryApi = async (apiKeyId) => {
    try {
      const { data, error } = await apiKeyService.setPrimaryApi(apiKeyId, user.id);
      if (error) throw error;

      await loadApiKeys();
      return { success: true, data };
    } catch (error) {
      console.error('Set primary API error:', error);
      return { success: false, error: error.message };
    }
  };

  const refreshApiStats = async () => {
    await loadApiKeys();
  };

  const getStorageStats = () => {
    return apiManager.getTotalStorage();
  };

  const value = {
    apiKeys,
    loading,
    initialized,
    addApiKey,
    updateApiKey,
    deleteApiKey,
    testConnection,
    setPrimaryApi,
    refreshApiStats,
    getStorageStats,
    toggleApiStatus: apiManager.toggleApiStatus.bind(apiManager),
    activeApi: apiManager.getActiveClient(),
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};

export const useApiKeys = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApiKeys must be used within ApiProvider');
  }
  return context;
};