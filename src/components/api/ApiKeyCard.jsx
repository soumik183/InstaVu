import { useState } from 'react';
import {
  CheckCircle,
  ErrorCircle,
  WarningCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Trash,
  Key,
  LoadingSpinner,
  Power,
} from '../../assets/icons';
import { formatFileSize } from '../../utils/fileHelpers';
import StorageProgress from './StorageProgress';

export default function ApiKeyCard({ api, isExpanded, onToggle, onDelete, onSetPrimary, onToggleStatus }) {
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const getStatusConfig = () => {
    switch (api.status) {
      case 'active':
        return {
          icon: CheckCircle,
          text: 'Connected',
          color: 'text-success-600 dark:text-success-400',
          bg: 'bg-success-50 dark:bg-success-900/20',
          border: 'border-success-200 dark:border-success-800',
          glow: 'shadow-green-500/20',
        };
      case 'error':
        return {
          icon: ErrorCircle,
          text: 'Error',
          color: 'text-error-600 dark:text-error-400',
          bg: 'bg-error-50 dark:bg-error-900/20',
          border: 'border-error-200 dark:border-error-800',
          glow: 'shadow-error-500/20',
        };
      case 'full':
        return {
          icon: WarningCircle,
          text: 'Storage Full',
          color: 'text-warning-600 dark:text-warning-400',
          bg: 'bg-warning-50 dark:bg-warning-900/20',
          border: 'border-warning-200 dark:border-warning-800',
          glow: 'shadow-warning-500/20',
        };
      default:
        return {
          icon: Key,
          text: 'Disconnected',
          color: 'text-gray-600 dark:text-gray-400',
          bg: 'bg-gray-50 dark:bg-gray-900/20',
          border: 'border-gray-200 dark:border-gray-800',
          glow: 'shadow-gray-500/20',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;
  const usagePercent = (api.storage_used / api.storage_limit) * 100;

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-xl sm:rounded-2xl border-2 transition-all duration-300 ${
        isExpanded
          ? `${statusConfig.border} shadow-xl ${statusConfig.glow}`
          : 'border-gray-200 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-lg'
      }`}
    >
      {/* Card Header - Clickable */}
      <div
        onClick={onToggle}
        className="relative bg-white dark:bg-dark-800 cursor-pointer"
      >
        {/* Gradient Background on Hover/Active */}
        <div className={`absolute inset-0 bg-gradient-to-r from-primary-50/50 to-secondary-50/50 dark:from-primary-900/10 dark:to-secondary-900/10 opacity-0 group-hover:opacity-100 transition-opacity ${isExpanded ? 'opacity-100' : ''}`}></div>

        {/* Content */}
        <div className="relative p-4 sm:p-5 md:p-6">
          {/* Top Row - Mobile First */}
          <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
            <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
              {/* Icon */}
              <div className={`p-2 sm:p-2.5 ${statusConfig.bg} rounded-lg sm:rounded-xl flex-shrink-0`}>
                <StatusIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${statusConfig.color}`} />
              </div>

              {/* API Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white truncate">
                    {api.name}
                  </h3>
                  {api.is_primary && (
                    <span className="flex-shrink-0 px-2 py-0.5 bg-gradient-to-r from-accent-400 to-accent-500 text-white text-xs font-bold rounded-md shadow-gold-glow">
                      PRIMARY
                    </span>
                  )}
                </div>
                {api.description && (
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                    {api.description}
                  </p>
                )}
              </div>
            </div>

            {/* Status & Toggle */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 ${statusConfig.bg} rounded-lg`}>
                <div className={`w-2 h-2 rounded-full ${statusConfig.color.replace('text-', 'bg-')} ${api.status === 'active' ? 'animate-pulse' : ''}`}></div>
                <span className={`text-xs font-bold ${statusConfig.color}`}>
                  {statusConfig.text}
                </span>
              </div>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors">
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Status Badge */}
          <div className={`sm:hidden flex items-center gap-2 px-3 py-1.5 ${statusConfig.bg} rounded-lg w-fit mb-3`}>
            <div className={`w-2 h-2 rounded-full ${statusConfig.color.replace('text-', 'bg-')} ${api.status === 'active' ? 'animate-pulse' : ''}`}></div>
            <span className={`text-xs font-bold ${statusConfig.color}`}>
              {statusConfig.text}
            </span>
          </div>

          {/* Storage Progress */}
          <div className="mb-3">
            <StorageProgress used={api.storage_used} limit={api.storage_limit} />
          </div>

          {/* Quick Stats - Responsive Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm">
            <div className="text-center p-2 bg-gray-50 dark:bg-dark-700/50 rounded-lg">
              <div className="font-bold text-primary-600 dark:text-primary-400">
                {usagePercent.toFixed(0)}%
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-xs mt-0.5">Used</div>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-dark-700/50 rounded-lg">
              <div className="font-bold text-secondary-600 dark:text-secondary-400">
                {api.files_count}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-xs mt-0.5">Files</div>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-dark-700/50 rounded-lg">
              <div className="font-bold text-accent-600 dark:text-accent-400 capitalize">
                {api.connection_speed}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-xs mt-0.5">Speed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details - Responsive */}
      {isExpanded && (
        <div className="border-t-2 border-gray-100 dark:border-dark-700 bg-gradient-to-br from-gray-50 to-white dark:from-dark-800 dark:to-dark-900 p-4 sm:p-5 md:p-6 space-y-4 animate-slide-down">
          {/* Project URL */}
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
              Project URL
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs sm:text-sm bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg px-3 py-2.5 font-mono text-gray-800 dark:text-gray-200 overflow-x-auto">
                {api.project_url}
              </code>
              <button
                onClick={() => handleCopy(api.project_url, 'url')}
                className="flex-shrink-0 p-2.5 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/40 border border-primary-200 dark:border-primary-800 rounded-lg transition-colors group"
                title="Copy URL"
              >
                {copied === 'url' ? (
                  <CheckCircle className="w-5 h-5 text-success-600" />
                ) : (
                  <Copy className="w-5 h-5 text-primary-600 dark:text-primary-400 group-hover:text-primary-700" />
                )}
              </button>
            </div>
          </div>

          {/* Anon Key */}
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
              Anon Key
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs sm:text-sm bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg px-3 py-2.5 font-mono text-gray-800 dark:text-gray-200 overflow-x-auto">
                {showKey ? api.anon_key : `${api.anon_key.substring(0, 40)}...`}
              </code>
              <button
                onClick={() => setShowKey(!showKey)}
                className="flex-shrink-0 p-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-dark-600 dark:hover:bg-dark-500 border border-gray-200 dark:border-dark-500 rounded-lg transition-colors text-xs font-bold"
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
              <button
                onClick={() => handleCopy(api.anon_key, 'key')}
                className="flex-shrink-0 p-2.5 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/40 border border-primary-200 dark:border-primary-800 rounded-lg transition-colors"
                title="Copy Key"
              >
                {copied === 'key' ? (
                  <CheckCircle className="w-5 h-5 text-success-600" />
                ) : (
                  <Copy className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                )}
              </button>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl p-4">
            <h4 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
              Statistics
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Files:</span>
                <span className="font-bold text-gray-900 dark:text-white">{api.files_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Storage Used:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatFileSize(api.storage_used)}
                </span>
              </div>
              <div className="flex justify-between sm:col-span-2">
                <span className="text-gray-600 dark:text-gray-400">Last Checked:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {new Date(api.last_checked).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {api.error_message && (
            <div className="bg-error-50 dark:bg-error-900/20 border-l-4 border-error-500 rounded-lg p-4 animate-slide-down">
              <div className="flex items-start gap-3">
                <ErrorCircle className="w-5 h-5 text-error-600 dark:text-error-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-error-800 dark:text-error-200 mb-1">
                    Connection Error
                  </p>
                  <p className="text-sm text-error-700 dark:text-error-300">
                    {api.error_message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons - Mobile First */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
            {/* Activate/Deactivate Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStatus();
              }}
              className={`flex-1 relative overflow-hidden group ${
                api.user_active
                  ? 'bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                  : 'bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 border-2 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
              } rounded-lg sm:rounded-xl font-bold text-sm sm:text-base transition-colors flex items-center justify-center gap-2`}
            >
              <Power className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{api.user_active ? 'Deactivate' : 'Activate'}</span>
            </button>

            {!api.is_primary && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSetPrimary();
                }}
                className="flex-1 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-accent-500 to-accent-600 rounded-lg sm:rounded-xl"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-accent-400 to-accent-500 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative px-4 py-2.5 sm:py-3 text-sm sm:text-base font-bold text-white flex items-center justify-center gap-2">
                  <span>PRIMARY</span>
                </div>
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 sm:py-3 bg-error-50 hover:bg-error-100 dark:bg-error-900/20 dark:hover:bg-error-900/40 border-2 border-error-200 dark:border-error-800 text-error-600 dark:text-error-400 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base transition-colors flex items-center justify-center gap-2"
            >
              <Trash className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}