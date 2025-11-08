import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApiKeys } from '../../context/ApiContext';
import { Close, Plus, LoadingSpinner, Key, Refresh } from '../../assets/icons';
import ApiKeyCard from './ApiKeyCard';
import ApiKeyForm from './ApiKeyForm';

export default function ApiDashboard({ onClose }) {
  const { user } = useAuth();
  const { apiKeys, loading, addApiKey, deleteApiKey, setPrimaryApi, refreshApiStats } = useApiKeys();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedApi, setSelectedApi] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    refreshApiStats();
  }, []);

  const handleAddApi = async (apiData) => {
    const result = await addApiKey(apiData);
    
    if (result.success) {
      setShowAddForm(false);
      // Success handled by context
    } else {
      alert(`❌ Error: ${result.error}`);
    }
  };

  const handleDeleteApi = async (apiId) => {
    if (window.confirm('⚠️ Delete this API? All associated files will become inaccessible!')) {
      const result = await deleteApiKey(apiId);
      
      if (!result.success) {
        alert(`❌ Error: ${result.error}`);
      }
    }
  };

  const handleSetPrimary = async (apiId) => {
    const result = await setPrimaryApi(apiId);
    
    if (!result.success) {
      alert(`❌ Error: ${result.error}`);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshApiStats();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleToggleStatus = async (apiId) => {
    const { toggleApiStatus } = useApiKeys();
    const result = await toggleApiStatus(apiId);

    if (!result.success) {
      alert(`Error: ${result.error}`);
    } else {
      await refreshApiStats();
    }
  };

  const totalStorage = apiKeys.reduce((sum, api) => sum + api.storage_limit, 0);
  const usedStorage = apiKeys.reduce((sum, api) => sum + api.storage_used, 0);
  const totalFiles = apiKeys.reduce((sum, api) => sum + api.files_count, 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 z-50 animate-fade-in">
      {/* Modal Container - Mobile First */}
      <div className="w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col bg-white dark:bg-dark-900 rounded-2xl sm:rounded-3xl shadow-2xl animate-scale-in">
        
        {/* Header - Premium Gradient */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-gold-600 px-4 sm:px-6 md:px-8 py-4 sm:py-6 overflow-hidden">
          {/* Animated Background Shapes */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white rounded-full blur-3xl animate-float"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gold-300 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
          </div>

          {/* Header Content */}
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="p-2 sm:p-2.5 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl">
                  <Key className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white">
                  API Management
                </h2>
              </div>
              <p className="text-xs sm:text-sm md:text-base text-white/80 font-medium">
                Manage your Supabase storage connections
              </p>

              {/* Stats - Responsive */}
              <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6">
                <div className="flex items-center gap-2 text-white/90">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-base sm:text-lg font-bold">{apiKeys.length}</span>
                  </div>
                  <span className="text-xs sm:text-sm font-semibold">APIs</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-base sm:text-lg font-bold">{totalFiles}</span>
                  </div>
                  <span className="text-xs sm:text-sm font-semibold">Files</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <div className="px-3 py-1.5 bg-white/20 rounded-lg">
                    <span className="text-xs sm:text-sm font-bold">
                      {((usedStorage / totalStorage) * 100 || 0).toFixed(1)}% Used
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 sm:p-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg sm:rounded-xl transition-colors"
                aria-label="Refresh stats"
              >
                <Refresh className={`w-5 h-5 sm:w-6 sm:h-6 text-white ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 sm:p-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg sm:rounded-xl transition-colors"
                aria-label="Close"
              >
                <Close className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {/* Add API Button - Always Visible */}
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full mb-4 sm:mb-6 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl sm:rounded-2xl border-2 border-dashed border-primary-300 dark:border-primary-700 group-hover:border-primary-500 dark:group-hover:border-primary-500 transition-colors"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 to-secondary-500/0 group-hover:from-primary-500/10 group-hover:to-secondary-500/10 rounded-xl sm:rounded-2xl transition-all"></div>
              <div className="relative px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-center gap-2 sm:gap-3">
                <div className="p-2 bg-gradient-to-br from-gold-500 to-blue-500 rounded-lg sm:rounded-xl shadow-glow-sm group-hover:shadow-glow transition-shadow">
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-gold-600 to-blue-600 bg-clip-text text-transparent">
                  Add New Supabase API
                </span>
              </div>
            </button>
          )}

          {/* Add API Form */}
          {showAddForm && (
            <div className="mb-4 sm:mb-6 animate-slide-down">
              <ApiKeyForm
                onSubmit={handleAddApi}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16">
              <LoadingSpinner className="w-12 h-12 sm:w-16 sm:h-16 text-primary-600 mb-4" />
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">
                Loading your APIs...
              </p>
            </div>
          )}

          {/* Empty State */}
          {!loading && apiKeys.length === 0 && !showAddForm && (
            <div className="text-center py-12 sm:py-16 animate-fade-in">
              <div className="inline-block p-4 sm:p-6 bg-gradient-to-br from-gold-100 to-blue-100 dark:from-gold-900/20 dark:to-blue-900/20 rounded-2xl sm:rounded-3xl mb-4 sm:mb-6">
                <Key className="w-16 h-16 sm:w-20 sm:h-20 text-blue-600 dark:text-blue-400 animate-float" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
                No API Keys Yet
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6 sm:mb-8">
                Add your first Supabase project to start storing unlimited files!
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                  <span>5GB per API</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>Unlimited APIs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-gold-500 rounded-full animate-pulse"></div>
                  <span>Auto-switching</span>
                </div>
              </div>
            </div>
          )}

          {/* API Keys List - Responsive Grid */}
          {!loading && apiKeys.length > 0 && (
            <div className="space-y-3 sm:space-y-4">
              {apiKeys.map((api, index) => (
                <div
                  key={api.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ApiKeyCard
                    api={api}
                    isExpanded={selectedApi?.id === api.id}
                    onToggle={() => setSelectedApi(selectedApi?.id === api.id ? null : api)}
                    onDelete={() => handleDeleteApi(api.id)}
                    onSetPrimary={() => handleSetPrimary(api.id)}
                    onToggleStatus={() => handleToggleStatus(api.id)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Bottom Padding for Mobile */}
          <div className="h-4 sm:h-0"></div>
        </div>
      </div>
    </div>
  );
}