import { useState, useEffect, useRef } from 'react';
import { useStorage } from '../../context/StorageContext';
import {
  Close,
  Download,
  Heart,
  HeartFilled,
  Trash,
  ArrowLeft,
  ArrowRight,
  Plus,
  LoadingSpinner,
} from '../../assets/icons';
import { formatFileSize } from '../../utils/fileHelpers';

export default function PhotoViewer({ photo, photos, onClose }) {
  const { toggleFavorite, deleteFile, downloadFile } = useStorage();
  const imageRef = useRef(null);

  // State Management
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Find current photo index
  useEffect(() => {
    const index = photos.findIndex(p => p.id === photo.id);
    setCurrentIndex(index !== -1 ? index : 0);
  }, [photo, photos]);

  const currentPhoto = photos[currentIndex] || photo;

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case '0':
          resetZoom();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, zoom]);

  // Navigation Functions
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      resetZoom();
      setImageLoaded(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetZoom();
      setImageLoaded(false);
    }
  };

  // Zoom Functions
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const resetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // Mouse Wheel Zoom
  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  // Drag to Pan (when zoomed)
  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ 
        x: e.clientX - position.x, 
        y: e.clientY - position.y 
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Support for Mobile
  const handleTouchStart = (e) => {
    if (zoom > 1 && e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e) => {
    if (isDragging && zoom > 1 && e.touches.length === 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  // Double Click/Tap to Zoom
  const handleDoubleClick = () => {
    if (zoom === 1) {
      setZoom(2);
    } else {
      resetZoom();
    }
  };

  // Action Handlers
  const handleFavorite = async () => {
    await toggleFavorite(currentPhoto.id);
  };

  const handleDownload = async () => {
    setLoading(true);
    await downloadFile(currentPhoto.id);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      await deleteFile(currentPhoto.id);
      if (photos.length > 1) {
        if (currentIndex === photos.length - 1) {
          handlePrevious();
        } else {
          handleNext();
        }
      } else {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col" style={{ width: '100vw', height: '100vh' }}>
      {/* Top Bar - Responsive */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-3 sm:p-4 md:p-6 z-10">
        <div className="flex items-center justify-between text-white">
          {/* File Info */}
          <div className="flex-1 min-w-0 pr-4">
            <h3 className="font-semibold text-sm sm:text-base md:text-lg truncate">
              {currentPhoto.original_name}
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 mt-0.5">
              {currentPhoto.width} × {currentPhoto.height} • {formatFileSize(currentPhoto.file_size)}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition flex-shrink-0"
            aria-label="Close viewer"
          >
            <Close className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      {/* Image Container - Responsive */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden cursor-move p-4 sm:p-6 md:p-8"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      >
        {/* Loading State */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner className="w-12 h-12 sm:w-16 sm:h-16 text-primary-500" />
          </div>
        )}

        {/* Image */}
        <img
          ref={imageRef}
          src={currentPhoto.storage_url}
          alt={currentPhoto.original_name}
          className={`max-w-full max-h-full object-contain transition-transform duration-200 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
          }}
          draggable={false}
          onLoad={() => setImageLoaded(true)}
        />
      </div>

      {/* Navigation Arrows - Hidden on Mobile, Visible on Tablet+ */}
      {photos.length > 1 && (
        <>
          {currentIndex > 0 && (
            <button
              onClick={handlePrevious}
              className="hidden md:flex absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full transition text-white"
              aria-label="Previous photo"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          {currentIndex < photos.length - 1 && (
            <button
              onClick={handleNext}
              className="hidden md:flex absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full transition text-white"
              aria-label="Next photo"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          )}
        </>
      )}

      {/* Bottom Action Bar - Fully Responsive */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          {/* Action Buttons - Responsive Layout */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center sm:justify-start">
            {/* Favorite */}
            <button
              onClick={handleFavorite}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-white text-sm sm:text-base"
              aria-label={currentPhoto.is_favorite ? "Remove from favorites" : "Add to favorites"}
            >
              {currentPhoto.is_favorite ? (
                <HeartFilled className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              ) : (
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
              <span className="hidden sm:inline">Favorite</span>
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              disabled={loading}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-white text-sm sm:text-base disabled:opacity-50"
              aria-label="Download photo"
            >
              {loading ? (
                <LoadingSpinner className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
              <span className="hidden sm:inline">Download</span>
            </button>

            {/* Delete */}
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-red-500/80 hover:bg-red-600 rounded-lg transition text-white text-sm sm:text-base"
              aria-label="Delete photo"
            >
              <Trash className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>

          {/* Zoom Controls - Responsive */}
          <div className="flex items-center gap-2 text-white">
            <button
              onClick={handleZoomOut}
              className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-sm sm:text-base"
              aria-label="Zoom out"
            >
              −
            </button>
            <span className="px-3 text-sm sm:text-base min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-sm sm:text-base"
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              onClick={resetZoom}
              className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-sm sm:text-base hidden sm:block"
              aria-label="Reset zoom"
            >
              Reset
            </button>
          </div>

          {/* Photo Counter - Hidden on Small Mobile */}
          {photos.length > 1 && (
            <span className="text-white text-sm sm:text-base hidden xs:block">
              {currentIndex + 1} / {photos.length}
            </span>
          )}
        </div>

        {/* Mobile Navigation (Swipe Hint) */}
        <div className="md:hidden text-center mt-3 text-gray-400 text-xs">
          Swipe left/right to navigate • Double-tap to zoom
        </div>
      </div>
    </div>
  );
}