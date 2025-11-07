import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStorage } from '../../context/StorageContext';
import { useApiKeys } from '../../context/ApiContext';
import {
  AllFilesIcon,
  PhotoIcon,
  VideoIcon,
  DocumentIcon,
  FolderIcon,
  HeartFilled,
  Close,
} from '../../assets/icons';
import { formatFileSize } from '../../utils/fileHelpers';

export default function Sidebar({ isOpen, onClose, onCategoryChange }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { allFiles, getFilesByType } = useStorage();
  const { getStorageStats } = useApiKeys();

  const [storageStats, setStorageStats] = useState({
    total_used: 0,
    total_limit: 0,
  });

  useEffect(() => {
    const stats = getStorageStats();
    setStorageStats(stats);
  }, [allFiles]);

  const categories = [
    { 
      id: 'all', 
      name: 'All Files', 
      icon: AllFilesIcon, 
      count: allFiles.length, 
      path: '/dashboard',
      gradient: 'from-purple-500 to-pink-500'
    },
    { 
      id: 'photo', 
      name: 'Photos', 
      icon: PhotoIcon, 
      count: getFilesByType('photo').length, 
      path: '/dashboard/photos',
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      id: 'video', 
      name: 'Videos', 
      icon: VideoIcon, 
      count: getFilesByType('video').length, 
      path: '/dashboard/videos',
      gradient: 'from-red-500 to-orange-500'
    },
    { 
      id: 'document', 
      name: 'Documents', 
      icon: DocumentIcon, 
      count: getFilesByType('document').length, 
      path: '/dashboard/documents',
      gradient: 'from-green-500 to-emerald-500'
    },
    { 
      id: 'other', 
      name: 'Other', 
      icon: FolderIcon, 
      count: getFilesByType('other').length, 
      path: '/dashboard/other',
      gradient: 'from-gray-500 to-slate-500'
    },
  ];

  const handleCategoryClick = (category) => {
    onCategoryChange(category.id);
    navigate(category.path);
    // Auto-close on mobile
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleFavoritesClick = () => {
    onCategoryChange('favorites');
    navigate('/dashboard/favorites');
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const usagePercent = storageStats.total_limit > 0
    ? (storageStats.total_used / storageStats.total_limit) * 100
    : 0;

  const getProgressGradient = () => {
    if (usagePercent >= 95) return 'from-red-500 to-red-600';
    if (usagePercent >= 80) return 'from-orange-500 to-orange-600';
    if (usagePercent >= 50) return 'from-yellow-500 to-yellow-600';
    return 'from-green-500 to-emerald-600';
  };

  const getWarningMessage = () => {
    if (usagePercent >= 95) return { text: 'Storage almost full!', color: 'text-red-600', bg: 'bg-red-50', icon: 'WARNING' };
    if (usagePercent >= 80) return { text: 'Storage running low', color: 'text-orange-600', bg: 'bg-orange-50', icon: 'ALERT' };
    return null;
  };

  const warning = getWarningMessage();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar - Mobile First */}
      <aside
        className={`
          fixed left-0 top-14 sm:top-16 lg:top-18 
          h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] lg:h-[calc(100vh-4.5rem)]
          w-full sm:w-72 lg:w-64 xl:w-72
          bg-white dark:bg-dark-900 
          border-r border-gray-200 dark:border-dark-800 
          shadow-2xl lg:shadow-lg
          z-40 
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Header with Close Button */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <Close className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Categories - Scrollable */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {/* Main Categories */}
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = location.pathname === category.path;

              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className={`
                    w-full group relative overflow-hidden
                    rounded-xl sm:rounded-2xl
                    transition-all duration-300
                    ${isActive 
                      ? 'shadow-lg scale-[1.02]' 
                      : 'hover:scale-[1.01] hover:shadow-md'
                    }
                  `}
                >
                  {/* Background Gradient */}
                  <div className={`
                    absolute inset-0 bg-gradient-to-br ${category.gradient}
                    ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-10'}
                    transition-opacity duration-300
                  `}></div>

                  {/* Content */}
                  <div className={`
                    relative flex items-center justify-between px-4 py-3 sm:py-3.5
                    ${isActive 
                      ? 'text-white' 
                      : 'text-gray-700 dark:text-gray-300'
                    }
                  `}>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className={`
                        p-2 sm:p-2.5 rounded-lg sm:rounded-xl
                        ${isActive 
                          ? 'bg-white/20 shadow-lg' 
                          : 'bg-gray-100 dark:bg-dark-800 group-hover:bg-gray-200 dark:group-hover:bg-dark-700'
                        }
                        transition-all
                      `}>
                        <Icon className={`
                          w-5 h-5 sm:w-6 sm:h-6
                          ${isActive 
                            ? 'text-white' 
                            : `text-gray-600 dark:text-gray-400 group-hover:bg-gradient-to-br group-hover:${category.gradient} group-hover:bg-clip-text group-hover:text-transparent`
                          }
                        `} />
                      </div>
                      <span className={`
                        font-semibold text-sm sm:text-base
                        ${isActive ? 'text-white' : ''}
                      `}>
                        {category.name}
                      </span>
                    </div>

                    {/* Count Badge */}
                    <span className={`
                      px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold
                      ${isActive 
                        ? 'bg-white/30 text-white shadow-inner' 
                        : 'bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-dark-700'
                      }
                      transition-all
                    `}>
                      {category.count}
                    </span>
                  </div>
                </button>
              );
            })}

            {/* Divider */}
            <div className="my-4 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-dark-700 to-transparent"></div>

            {/* Favorites */}
            <button
              onClick={handleFavoritesClick}
              className={`
                w-full group relative overflow-hidden
                rounded-xl sm:rounded-2xl
                transition-all duration-300
                ${location.pathname === '/dashboard/favorites'
                  ? 'shadow-lg scale-[1.02]'
                  : 'hover:scale-[1.01] hover:shadow-md'
                }
              `}
            >
              <div className={`
                absolute inset-0 bg-gradient-to-br from-pink-500 to-red-500
                ${location.pathname === '/dashboard/favorites' ? 'opacity-100' : 'opacity-0 group-hover:opacity-10'}
                transition-opacity duration-300
              `}></div>

              <div className={`
                relative flex items-center justify-between px-4 py-3 sm:py-3.5
                ${location.pathname === '/dashboard/favorites'
                  ? 'text-white'
                  : 'text-gray-700 dark:text-gray-300'
                }
              `}>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`
                    p-2 sm:p-2.5 rounded-lg sm:rounded-xl
                    ${location.pathname === '/dashboard/favorites'
                      ? 'bg-white/20 shadow-lg'
                      : 'bg-gray-100 dark:bg-dark-800 group-hover:bg-gray-200 dark:group-hover:bg-dark-700'
                    }
                  `}>
                    <HeartFilled className={`
                      w-5 h-5 sm:w-6 sm:h-6
                      ${location.pathname === '/dashboard/favorites'
                        ? 'text-white'
                        : 'text-red-500 group-hover:text-red-600'
                      }
                    `} />
                  </div>
                  <span className="font-semibold text-sm sm:text-base">
                    Favorites
                  </span>
                </div>

                <span className={`
                  px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold
                  ${location.pathname === '/dashboard/favorites'
                    ? 'bg-white/30 text-white shadow-inner'
                    : 'bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-gray-400'
                  }
                `}>
                  {allFiles.filter(f => f.is_favorite).length}
                </span>
              </div>
            </button>
          </div>

          {/* Storage Stats - Fixed at Bottom */}
          <div className="p-4 border-t border-gray-200 dark:border-dark-800 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-900 dark:to-dark-800">
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Storage</h3>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  {usagePercent.toFixed(1)}%
                </span>
              </div>

              {/* Progress Bar - Premium */}
              <div className="relative h-3 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden shadow-inner">
                <div
                  className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getProgressGradient()} rounded-full shadow-lg transition-all duration-1000 ease-out`}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                >
                  {/* Animated Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
              </div>

              {/* Storage Details */}
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {formatFileSize(storageStats.total_used)}
                </span>
                <span className="text-gray-500 dark:text-gray-500">
                  of {formatFileSize(storageStats.total_limit)}
                </span>
              </div>
            </div>

            {/* Warning Message */}
            {warning && (
              <div className={`
                ${warning.bg} dark:bg-opacity-20 
                border-l-4 ${warning.color.replace('text-', 'border-')}
                p-3 rounded-lg animate-pulse-slow
              `}>
                <div className="flex items-start gap-2">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{warning.icon}</span>
                  <div className="flex-1">
                    <p className={`text-xs font-bold ${warning.color}`}>
                      {warning.text}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Add more APIs to continue
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}