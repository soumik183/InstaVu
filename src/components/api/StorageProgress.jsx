import { formatFileSize } from '../../utils/fileHelpers';

export default function StorageProgress({ used, limit, showLabel = true }) {
  const percentage = (used / limit) * 100;

  const getGradient = () => {
    if (percentage >= 95) return 'from-error-500 via-error-600 to-error-700';
    if (percentage >= 80) return 'from-warning-500 via-warning-600 to-warning-700';
    if (percentage >= 50) return 'from-accent-500 via-accent-600 to-accent-700';
    return 'from-success-500 via-success-600 to-success-700';
  };

  const getGlowColor = () => {
    if (percentage >= 95) return 'shadow-error-500/50';
    if (percentage >= 80) return 'shadow-warning-500/50';
    if (percentage >= 50) return 'shadow-accent-500/50';
    return 'shadow-success-500/50';
  };

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="relative h-3 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden shadow-inner">
        <div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getGradient()} rounded-full transition-all duration-700 ease-out ${getGlowColor()} shadow-md`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        >
          {/* Animated Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        </div>
        
        {/* Percentage Text Inside Bar (if space available) */}
        {percentage > 15 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-white drop-shadow-md">
              {percentage.toFixed(0)}%
            </span>
          </div>
        )}
      </div>

      {/* Labels */}
      {showLabel && (
        <div className="flex items-center justify-between mt-2 text-xs sm:text-sm">
          <span className="font-bold text-gray-700 dark:text-gray-300">
            {formatFileSize(used)}
          </span>
          <span className="text-gray-500 dark:text-gray-500">
            / {formatFileSize(limit)}
          </span>
        </div>
      )}
    </div>
  );
}