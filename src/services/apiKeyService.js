import { supabase } from './supabaseClient';
import { createDynamicClient } from './supabaseClient';

export const apiKeyService = {
  // Get all API keys for user
  async getAllApiKeys(userId) {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Add new API key
  async addApiKey(userId, apiData) {
    try {
      // If this is set as primary, unset other primary keys
      if (apiData.is_primary) {
        await supabase
          .from('api_keys')
          .update({ is_primary: false })
          .eq('user_id', userId);
      }

      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          user_id: userId,
          ...apiData,
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update API key
  async updateApiKey(apiKeyId, updates) {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .update(updates)
        .eq('id', apiKeyId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Delete API key
  async deleteApiKey(apiKeyId) {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', apiKeyId);

      return { error };
    } catch (error) {
      return { error };
    }
  },

  // Test API connection
  async testApiConnection(projectUrl, anonKey) {
    try {
      const client = createDynamicClient(projectUrl, anonKey);
      
      // Try to list buckets
      const { data, error } = await client.storage.listBuckets();
      
      if (error) {
        return { 
          success: false, 
          error: error.message || 'Failed to connect to Supabase' 
        };
      }

      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Invalid credentials or URL' 
      };
    }
  },

  // Update API status
  async updateApiStatus(apiKeyId, status, errorMessage = null) {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({
          status,
          error_message: errorMessage,
          last_checked: new Date().toISOString(),
        })
        .eq('id', apiKeyId);

      return { error };
    } catch (error) {
      return { error };
    }
  },

  // Set API as primary
  async setPrimaryApi(apiKeyId, userId) {
    try {
      // First, unset all primary flags for this user
      await supabase
        .from('api_keys')
        .update({ is_primary: false })
        .eq('user_id', userId);

      // Then set this one as primary
      const { data, error } = await supabase
        .from('api_keys')
        .update({ is_primary: true })
        .eq('id', apiKeyId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get storage usage for API
  async getApiStorageUsage(apiKeyId) {
    try {
      const { data, error } = await supabase
        .from('files_metadata')
        .select('file_size')
        .eq('api_key_id', apiKeyId)
        .eq('is_deleted', false);

      if (error) return { data: 0, error };

      const totalSize = data.reduce((sum, file) => sum + file.file_size, 0);
      return { data: totalSize, error: null };
    } catch (error) {
      return { data: 0, error };
    }
  },
};