import { createDynamicClient } from './supabaseClient';
import { supabase } from './supabaseClient';
import { apiKeyService } from './apiKeyService';

class MultiApiManager {
  constructor() {
    this.apiClients = new Map();
    this.activeApiId = null;
    this.userId = null;
  }

  // Initialize all user's API keys
  async initialize(userId) {
    this.userId = userId;
    const { data: apiKeys, error } = await apiKeyService.getAllApiKeys(userId);

    if (error) {
      console.error('Error loading API keys:', error);
      return { success: false, error };
    }

    if (!apiKeys || apiKeys.length === 0) {
      return { success: true, apiKeys: [] };
    }

    // Add each API
    for (const apiKey of apiKeys) {
      if (apiKey.is_active) {
        await this.addApi(apiKey);
      }
    }

    // Set active API (primary or first active)
    if (!this.activeApiId) {
      const primaryApi = apiKeys.find(api => api.is_primary && api.status === 'active');
      const firstActive = apiKeys.find(api => api.status === 'active');
      this.activeApiId = primaryApi?.id || firstActive?.id || null;
    }

    return { success: true, apiKeys };
  }

  // Add new API client
  async addApi(apiKey) {
    try {
      const client = createDynamicClient(apiKey.project_url, apiKey.anon_key);
      
      // Test connection
      const { error: listError } = await client.storage.listBuckets();
      
      if (listError) {
        await apiKeyService.updateApiStatus(apiKey.id, 'error', listError.message);
        return { success: false, error: listError.message };
      }

      // Ensure bucket exists
      await this.ensureBucket(client, 'instavault-storage');

      // Store client
      this.apiClients.set(apiKey.id, {
        client,
        ...apiKey,
        is_active: apiKey.is_active !== false, // Default to active if not specified
      });

      // Set as active if first API or no active API
      if (!this.activeApiId) {
        this.activeApiId = apiKey.id;
      }

      await apiKeyService.updateApiStatus(apiKey.id, 'active', null);

      return { success: true };
    } catch (error) {
      await apiKeyService.updateApiStatus(apiKey.id, 'error', error.message);
      return { success: false, error: error.message };
    }
  }

  // Ensure storage bucket exists
  async ensureBucket(client, bucketName) {
    try {
      const { data: buckets } = await client.storage.listBuckets();
      const bucketExists = buckets?.some(b => b.name === bucketName);

      if (!bucketExists) {
        await client.storage.createBucket(bucketName, {
          public: false,
          fileSizeLimit: 524288000, // 500MB per file
        });
      }
    } catch (error) {
      console.error('Error ensuring bucket:', error);
    }
  }

  // Get active API client
  getActiveClient() {
    if (!this.activeApiId || !this.apiClients.has(this.activeApiId)) {
      return null;
    }
    return this.apiClients.get(this.activeApiId);
  }

  // Select optimal API for upload
  selectOptimalApi(fileSize) {
    const availableApis = Array.from(this.apiClients.values())
      .filter(api => {
        const availableSpace = api.storage_limit - api.storage_used;
        return api.status === 'active' && api.is_active && availableSpace >= fileSize;
      })
      .sort((a, b) => {
        // Primary API first
        if (a.is_primary) return -1;
        if (b.is_primary) return 1;

        // Then by connection speed
        const speedScore = { fast: 3, medium: 2, slow: 1 };
        const speedDiff = speedScore[b.connection_speed] - speedScore[a.connection_speed];
        if (speedDiff !== 0) return speedDiff;

        // Then by least used percentage
        const usageA = a.storage_used / a.storage_limit;
        const usageB = b.storage_used / b.storage_limit;
        return usageA - usageB;
      });

    return availableApis[0] || null;
  }

  // Upload file
  async uploadFile(file, metadata = {}) {
    const optimalApi = this.selectOptimalApi(file.size);

    if (!optimalApi) {
      throw new Error('No available storage. All APIs are full or disconnected.');
    }

    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const filePath = `${this.userId}/${fileName}`;

      const { data, error } = await optimalApi.client.storage
        .from('instavault-storage')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = optimalApi.client.storage
        .from('instavault-storage')
        .getPublicUrl(filePath);

      // Save metadata to main database
      await this.saveFileMetadata({
        apiKeyId: optimalApi.id,
        fileName,
        filePath,
        storageUrl: urlData.publicUrl,
        file,
        ...metadata,
      });

      return { 
        success: true, 
        data, 
        apiId: optimalApi.id,
        url: urlData.publicUrl 
      };
    } catch (error) {
      console.error('Upload error:', error);
      
      // Try next API
      if (this.apiClients.size > 1) {
        this.apiClients.delete(optimalApi.id);
        return this.uploadFile(file, metadata);
      }

      throw error;
    }
  }

  // Save file metadata
  async saveFileMetadata({ apiKeyId, fileName, filePath, storageUrl, file, ...metadata }) {
    const fileType = this.getFileType(file.type);

    const { error } = await supabase
      .from('files_metadata')
      .insert({
        user_id: this.userId,
        api_key_id: apiKeyId,
        file_name: fileName,
        original_name: file.name,
        file_type: fileType,
        file_size: file.size,
        file_path: filePath,
        storage_url: storageUrl,
        mime_type: file.type,
        ...metadata,
      });

    if (error) throw error;
  }

  // Get file type category
  getFileType(mimeType) {
    if (mimeType.startsWith('image/')) return 'photo';
    if (mimeType.startsWith('video/')) return 'video';
    if (
      mimeType.startsWith('application/pdf') ||
      mimeType.includes('document') ||
      mimeType.includes('text') ||
      mimeType.includes('sheet') ||
      mimeType.includes('presentation')
    ) {
      return 'document';
    }
    return 'other';
  }

  // Delete file
  async deleteFile(fileMetadata) {
    try {
      const api = this.apiClients.get(fileMetadata.api_key_id);
      if (!api) {
        throw new Error('API not found for this file');
      }

      // Delete from storage
      const { error: storageError } = await api.client.storage
        .from('instavault-storage')
        .remove([fileMetadata.file_path]);

      if (storageError) throw storageError;

      // Soft delete in database
      const { error: dbError } = await supabase
        .from('files_metadata')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
        })
        .eq('id', fileMetadata.id);

      if (dbError) throw dbError;

      return { success: true };
    } catch (error) {
      console.error('Delete error:', error);
      return { success: false, error: error.message };
    }
  }

  // Download file
  async downloadFile(fileMetadata) {
    try {
      const api = this.apiClients.get(fileMetadata.api_key_id);
      if (!api) {
        throw new Error('API not found for this file');
      }

      const { data, error } = await api.client.storage
        .from('instavault-storage')
        .download(fileMetadata.file_path);

      if (error) throw error;

      // Update download count
      await supabase
        .from('files_metadata')
        .update({ download_count: fileMetadata.download_count + 1 })
        .eq('id', fileMetadata.id);

      // Create download link
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileMetadata.original_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('Download error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all APIs info
  getAllApis() {
    return Array.from(this.apiClients.values()).map(api => ({
      id: api.id,
      name: api.name,
      status: api.status,
      storage_used: api.storage_used,
      storage_limit: api.storage_limit,
      usage_percent: (api.storage_used / api.storage_limit) * 100,
      is_active: api.id === this.activeApiId,
      is_primary: api.is_primary,
      files_count: api.files_count,
      user_active: api.is_active,
    }));
  }

  // Toggle API active status
  async toggleApiStatus(apiId) {
    const api = this.apiClients.get(apiId);
    if (!api) return { success: false, error: 'API not found' };

    const newStatus = !api.is_active;
    this.apiClients.set(apiId, { ...api, is_active: newStatus });

    // Update in database
    const { error } = await supabase
      .from('api_keys')
      .update({ is_active: newStatus })
      .eq('id', apiId);

    if (error) {
      // Revert local change on error
      this.apiClients.set(apiId, { ...api, is_active: api.is_active });
      return { success: false, error: error.message };
    }

    return { success: true, is_active: newStatus };
  }

  // Get total storage stats
  getTotalStorage() {
    const apis = Array.from(this.apiClients.values());
    
    return {
      total_used: apis.reduce((sum, api) => sum + api.storage_used, 0),
      total_limit: apis.reduce((sum, api) => sum + api.storage_limit, 0),
      total_files: apis.reduce((sum, api) => sum + api.files_count, 0),
      apis_count: apis.length,
      active_apis: apis.filter(api => api.status === 'active').length,
    };
  }
}

export const apiManager = new MultiApiManager();