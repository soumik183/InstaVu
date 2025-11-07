import { useState, useEffect } from 'react';
import { useStorage } from '../../context/StorageContext';
import FileCard from './FileCard';
import PhotoViewer from '../media/PhotoViewer';
import VideoPlayer from '../media/VideoPlayer';
import { Grid, List, LoadingSpinner, Upload } from '../../assets/icons';

export default function FileGrid({ filter }) {
  const { files, loading } = useStorage();
  const [viewMode, setViewMode] = useState('grid');
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewerType, setViewerType] = useState(null);

  // Load saved view mode
  useEffect(() => {
    const savedMode = localStorage.getItem('viewMode');
    if (savedMode) setViewMode(savedMode);
  }, []);

  const filteredFiles = filter && filter !== 'all' && filter !== 'favorites'
    ? files.filter(f => f.file_type === filter)
    : files;

  const handleFileClick = (file) => {
    setSelectedFile(file);
    if (file.file_type === 'photo') {
      setViewerType('photo');
    } else if (file.file_type === 'video') {
      setViewerType('video');
    }
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('viewMode', mode);
  };

  const closeViewer = () => {
    setSelectedFile(null);
    setViewerType(null);
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-primary-200 dark:border-primary-900 border-t-primary-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="mt-6 text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">
          Loading your files...
        </p>
      </div>
    );
  }

  // Empty State
  if (filteredFiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 sm:p-6 animate-scale-in">
        <div className="relative mb-6 sm:mb-8">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-3xl sm:rounded-4xl flex items-center justify-center">
            <Upload className="w-12 h-12 sm:w-16 sm:h-16 text-primary-600 dark:text-primary-400 animate-float" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-secondary-500 to-primary-500 rounded-full shadow-glow-sm"></div>
        </div>
        
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
          No files yet
        </h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center max-w-sm mb-6 sm:mb-8">
          Upload your first file to get started with InstaVu
        </p>

        <button
          onClick={() => {/* Open upload modal */}}
          className="group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl sm:rounded-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative px-6 sm:px-8 py-3 sm:py-4 flex items-center gap-2 sm:gap-3">
            <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            <span className="text-base sm:text-lg font-bold text-white">Upload Files</span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Header - Mobile First */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* Title */}
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            {filter === 'favorites' ? 'Favorite Files' : 
             filter ? `${filter.charAt(0).toUpperCase() + filter.slice(1)}s` : 
             'All Files'}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            {filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'}
          </p>
        </div>

        {/* View Mode Toggle - Premium */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-dark-800 rounded-xl sm:rounded-2xl p-1.5 shadow-inner">
          <button
            onClick={() => handleViewModeChange('grid')}
            className={`
              flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl
              font-semibold text-sm sm:text-base
              transition-all duration-300
              ${viewMode === 'grid'
                ? 'bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 shadow-md scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }
            `}
          >
            <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            onClick={() => handleViewModeChange('list')}
            className={`
              flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl
              font-semibold text-sm sm:text-base
              transition-all duration-300
              ${viewMode === 'list'
                ? 'bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 shadow-md scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }
            `}
          >
            <List className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>
      </div>

      {/* File Grid - Responsive Columns */}
      <div
        className={
          viewMode === 'grid'
            ? `
              grid gap-3 sm:gap-4 lg:gap-5
              grid-cols-2 
              sm:grid-cols-3 
              lg:grid-cols-4 
              xl:grid-cols-5
              2xl:grid-cols-6
            `
            : 'space-y-2 sm:space-y-3'
        }
      >
        {filteredFiles.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            viewMode={viewMode}
            onClick={() => handleFileClick(file)}
          />
        ))}
      </div>

      {/* Viewers */}
      {viewerType === 'photo' && selectedFile && (
        <PhotoViewer
          photo={selectedFile}
          photos={filteredFiles.filter(f => f.file_type === 'photo')}
          onClose={closeViewer}
        />
      )}

      {viewerType === 'video' && selectedFile && (
        <VideoPlayer
          video={selectedFile}
          onClose={closeViewer}
        />
      )}
    </>
  );
}