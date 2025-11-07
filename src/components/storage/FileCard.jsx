import { useState } from 'react';
import { useStorage } from '../../context/StorageContext';
import {
  Heart,
  HeartFilled,
  Download,
  Trash,
  MoreVertical,
  PhotoIcon,
  VideoIcon,
  DocumentIcon,
  FolderIcon,
  Play,
  LoadingSpinner,
} from '../../assets/icons';
import { formatFileSize, formatRelativeTime } from '../../utils/fileHelpers';

export default function FileCard({ file, viewMode, onClick }) {
  const { toggleFavorite, deleteFile, downloadFile } = useStorage();
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleFavorite = async (e) => {
    e.stopPropagation();
    await toggleFavorite(file.id);
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    setLoading(true);
    await downloadFile(file.id);
    setLoading(false);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this file?')) {
      setLoading(true);
      await deleteFile(file.id);
      setLoading(false);
    }
  };

  const getFileIcon = () => {
    switch (file.file_type) {
      case 'photo': return PhotoIcon;
      case 'video': return VideoIcon;
      case 'document': return DocumentIcon;
      default: return FolderIcon;
    }
  };

  const FileIcon = getFileIcon();

  // List View - Mobile First
  if (viewMode === 'list') {
    return (
      <div
        onClick={onClick}
        className="group bg-white dark:bg-dark-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
      >
        <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
          {/* Thumbnail - Responsive */}
          <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-700 dark:to-dark-600 rounded-lg sm:rounded-xl overflow-hidden">
            {file.file_type === 'photo' && file.storage_url ? (
              <img
                src={file.storage_url}
                alt={file.original_name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : file.file_type === 'video' && file.thumbnail_url ? (
              <div className="relative w-full h-full">
                <img
                  src={file.thumbnail_url}
                  alt={file.original_name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-lg" />
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FileIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-500" />
              </div>
            )}
          </div>

          {/* File Info - Responsive Typography */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">
              {file.original_name}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <span>{formatFileSize(file.file_size)}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">{formatRelativeTime(file.uploaded_at)}</span>
            </div>
          </div>

          {/* Actions - Touch Friendly */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={handleFavorite}
              className="p-2 sm:p-2.5 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg sm:rounded-xl transition-colors"
              aria-label={file.is_favorite ? "Remove from favorites" : "Add to favorites"}
            >
              {file.is_favorite ? (
                <HeartFilled className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
              ) : (
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
              )}
            </button>
            <button
              onClick={handleDownload}
              disabled={loading}
              className="p-2 sm:p-2.5 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg sm:rounded-xl transition-colors disabled:opacity-50"
              aria-label="Download"
            >
              {loading ? (
                <LoadingSpinner className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
              ) : (
                <Download className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" />
              )}
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="p-2 sm:p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg sm:rounded-xl transition-colors disabled:opacity-50"
              aria-label="Delete"
            >
              <Trash className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid View - Mobile First
  return (
    <div
      onClick={onClick}
      className="group bg-white dark:bg-dark-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-dark-700 overflow-hidden hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
    >
      {/* Thumbnail - Aspect Ratio */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-700 dark:to-dark-600">
        {file.file_type === 'photo' && file.storage_url ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <LoadingSpinner className="w-8 h-8 text-primary-600" />
              </div>
            )}
            <img
              src={file.storage_url}
              alt={file.original_name}
              className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
            />
          </>
        ) : file.file_type === 'video' && file.thumbnail_url ? (
          <div className="relative w-full h-full">
            <img
              src={file.thumbnail_url}
              alt={file.original_name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Play Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/90 group-hover:bg-white rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-all">
                <Play className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 ml-1" />
              </div>
            </div>
            {/* Duration Badge */}
            {file.duration && (
              <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-sm text-white text-xs sm:text-sm px-2 py-1 rounded-lg font-semibold">
                {Math.floor(file.duration / 60)}:{(file.duration % 60).toString().padStart(2, '0')}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-500" />
          </div>
        )}

        {/* Favorite Badge */}
        {file.is_favorite && (
          <div className="absolute top-2 right-2 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
            <HeartFilled className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
          </div>
        )}

        {/* Hover Actions Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleFavorite}
              className="p-2.5 sm:p-3 bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-dark-700 transition-all shadow-lg hover:scale-110"
            >
              {file.is_favorite ? (
                <HeartFilled className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              ) : (
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
            <button
              onClick={handleDownload}
              disabled={loading}
              className="p-2.5 sm:p-3 bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-dark-700 transition-all shadow-lg hover:scale-110 disabled:opacity-50"
            >
              {loading ? (
                <LoadingSpinner className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
              ) : (
                <Download className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="p-2.5 sm:p-3 bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-full hover:bg-red-500 hover:text-white transition-all shadow-lg hover:scale-110 disabled:opacity-50"
            >
              <Trash className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* File Info - Compact */}
      <div className="p-2.5 sm:p-3">
        <h3 className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white truncate" title={file.original_name}>
          {file.original_name}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {formatFileSize(file.file_size)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {formatRelativeTime(file.uploaded_at)}
          </p>
        </div>
      </div>
    </div>
  );
}