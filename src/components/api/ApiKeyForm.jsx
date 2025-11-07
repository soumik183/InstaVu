import { useState } from 'react';
import { useApiKeys } from '../../context/ApiContext';
import { LoadingSpinner, CheckCircle, ErrorCircle, Key, Link as LinkIcon } from '../../assets/icons';
import { validateSupabaseUrl } from '../../utils/validators';

export default function ApiKeyForm({ onSubmit, onCancel }) {
  const { testConnection } = useApiKeys();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    project_url: '',
    anon_key: '',
    is_primary: false,
  });

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    setTestResult(null);
    setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'API name is required';
    }

    if (!formData.project_url.trim()) {
      newErrors.project_url = 'Project URL is required';
    } else if (!validateSupabaseUrl(formData.project_url)) {
      newErrors.project_url = 'Invalid Supabase URL';
    }

    if (!formData.anon_key.trim()) {
      newErrors.anon_key = 'Anon key is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTest = async () => {
    if (!formData.project_url || !formData.anon_key) {
      setTestResult({
        success: false,
        message: 'Please enter both Project URL and Anon Key',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const result = await testConnection(formData.project_url, formData.anon_key);

      if (result.success) {
        setTestResult({
          success: true,
          message: '✅ Connection successful! Your API is ready to use.',
        });
      } else {
        setTestResult({
          success: false,
          message: `❌ ${result.error}`,
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `❌ ${error.message}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!testResult) {
      await handleTest();
      return;
    }

    if (!testResult.success) {
      alert('Please fix connection issues before adding API');
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-dark-800 dark:via-dark-800 dark:to-dark-800 rounded-xl sm:rounded-2xl border-2 border-primary-200 dark:border-primary-800 p-4 sm:p-6 md:p-8 shadow-xl animate-scale-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="p-2.5 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl shadow-glow-sm">
          <Key className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            Add Supabase API
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Connect your Supabase storage project
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* API Name */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            API Name <span className="text-error-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-white dark:bg-dark-700 border-2 rounded-lg sm:rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-4 transition-all ${
              errors.name 
                ? 'border-error-500 focus:border-error-500 focus:ring-error-100' 
                : 'border-gray-300 dark:border-dark-600 focus:border-primary-500 focus:ring-primary-100'
            }`}
            placeholder="My Primary Storage"
            required
          />
          {errors.name && (
            <p className="mt-2 text-sm text-error-600 dark:text-error-400 flex items-center gap-1">
              <ErrorCircle className="w-4 h-4" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Description <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white dark:bg-dark-700 border-2 border-gray-300 dark:border-dark-600 rounded-lg sm:rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all"
            placeholder="For photos and videos"
          />
        </div>

        {/* Project URL */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Supabase Project URL <span className="text-error-500">*</span>
          </label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="url"
              name="project_url"
              value={formData.project_url}
              onChange={handleChange}
              className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-dark-700 border-2 rounded-lg sm:rounded-xl font-mono text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-4 transition-all ${
                errors.project_url 
                  ? 'border-error-500 focus:border-error-500 focus:ring-error-100' 
                  : 'border-gray-300 dark:border-dark-600 focus:border-primary-500 focus:ring-primary-100'
              }`}
              placeholder="https://xxxxx.supabase.co"
              required
            />
          </div>
          {errors.project_url && (
            <p className="mt-2 text-sm text-error-600 dark:text-error-400 flex items-center gap-1">
              <ErrorCircle className="w-4 h-4" />
              {errors.project_url}
            </p>
          )}
        </div>

        {/* Anon Key */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Anon Key <span className="text-error-500">*</span>
          </label>
          <textarea
            name="anon_key"
            value={formData.anon_key}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-white dark:bg-dark-700 border-2 rounded-lg sm:rounded-xl font-mono text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-4 transition-all resize-none ${
              errors.anon_key 
                ? 'border-error-500 focus:border-error-500 focus:ring-error-100' 
                : 'border-gray-300 dark:border-dark-600 focus:border-primary-500 focus:ring-primary-100'
            }`}
            rows="3"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            required
          />
          {errors.anon_key && (
            <p className="mt-2 text-sm text-error-600 dark:text-error-400 flex items-center gap-1">
              <ErrorCircle className="w-4 h-4" />
              {errors.anon_key}
            </p>
          )}
        </div>

        {/* Primary Checkbox */}
        <label className="flex items-center gap-3 p-4 bg-accent-50 dark:bg-accent-900/10 border-2 border-accent-200 dark:border-accent-800 rounded-lg sm:rounded-xl cursor-pointer hover:bg-accent-100 dark:hover:bg-accent-900/20 transition-colors">
          <input
            type="checkbox"
            name="is_primary"
            checked={formData.is_primary}
            onChange={handleChange}
            className="w-5 h-5 rounded border-2 border-accent-500 text-accent-600 focus:ring-4 focus:ring-accent-100 cursor-pointer"
          />
          <div className="flex-1">
            <span className="text-sm font-bold text-gray-900 dark:text-white block">
              Set as Primary Storage
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              New uploads will use this API first
            </span>
          </div>
        </label>

        {/* Test Result */}
        {testResult && (
          <div
            className={`p-4 rounded-lg sm:rounded-xl border-2 animate-slide-down ${
              testResult.success
                ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800'
                : 'bg-error-50 dark:bg-error-900/20 border-error-200 dark:border-error-800'
            }`}
          >
            <div className="flex items-start gap-3">
              {testResult.success ? (
                <CheckCircle className="w-6 h-6 text-success-600 dark:text-success-400 flex-shrink-0" />
              ) : (
                <ErrorCircle className="w-6 h-6 text-error-600 dark:text-error-400 flex-shrink-0" />
              )}
              <p className={`text-sm font-semibold ${
                testResult.success 
                  ? 'text-success-800 dark:text-success-200' 
                  : 'text-error-800 dark:text-error-200'
              }`}>
                {testResult.message}
              </p>
            </div>
          </div>
        )}

        {/* Actions - Mobile First */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={handleTest}
            disabled={testing || !formData.project_url || !formData.anon_key}
            className="flex-1 px-4 py-3 bg-white dark:bg-dark-700 border-2 border-primary-600 dark:border-primary-500 text-primary-600 dark:text-primary-400 rounded-lg sm:rounded-xl font-bold hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {testing && <LoadingSpinner className="w-5 h-5" />}
            {testing ? 'Testing...' : 'Test Connection'}
          </button>

          <button
            type="submit"
            disabled={!testResult?.success}
            className="flex-1 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg sm:rounded-xl"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative px-4 py-3 text-white font-bold">
              Add API
            </div>
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="sm:flex-initial px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-dark-700 dark:hover:bg-dark-600 text-gray-700 dark:text-gray-300 rounded-lg sm:rounded-xl font-bold transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}