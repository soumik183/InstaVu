import { useState, useRef, useEffect } from 'react';
import { useStorage } from '../../context/StorageContext';
import {
  Close,
  Play,
  Pause,
  VolumeOn,
  VolumeOff,
  Fullscreen,
  ExitFullscreen,
  Forward10,
  Backward10,
  Download,
  Heart,
  HeartFilled,
  Trash,
} from '../../assets/icons';
import { formatDuration } from '../../utils/fileHelpers';

export default function VideoPlayer({ video, onClose }) {
  const { toggleFavorite, deleteFile, downloadFile } = useStorage();
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Player State
  const [playerState, setPlayerState] = useState({
    playing: false,
    currentTime: 0,
    duration: 0,
    volume: 80,
    muted: false,
    buffering: false,
    fullscreen: false,
    showControls: true,
    playbackRate: 1.0,
  });

  // Double-tap state
  const [tapState, setTapState] = useState({
    lastTap: 0,
    zone: null,
  });

  // Skip animation
  const [showSkip, setShowSkip] = useState(null);

  // Video Event Listeners
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleLoadedMetadata = () => {
      setPlayerState(prev => ({ ...prev, duration: videoElement.duration }));
    };

    const handleTimeUpdate = () => {
      setPlayerState(prev => ({ ...prev, currentTime: videoElement.currentTime }));
    };

    const handlePlay = () => {
      setPlayerState(prev => ({ ...prev, playing: true }));
    };

    const handlePause = () => {
      setPlayerState(prev => ({ ...prev, playing: false }));
    };

    const handleWaiting = () => {
      setPlayerState(prev => ({ ...prev, buffering: true }));
    };

    const handleCanPlay = () => {
      setPlayerState(prev => ({ ...prev, buffering: false }));
    };

    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('waiting', handleWaiting);
    videoElement.addEventListener('canplay', handleCanPlay);

    // Set initial volume
    videoElement.volume = playerState.volume / 100;

    return () => {
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('waiting', handleWaiting);
      videoElement.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  // Auto-hide controls in fullscreen
  useEffect(() => {
    if (playerState.playing && playerState.fullscreen) {
      controlsTimeoutRef.current = setTimeout(() => {
        setPlayerState(prev => ({ ...prev, showControls: false }));
      }, 3000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [playerState.playing, playerState.fullscreen, playerState.showControls]);

  const handleMouseMove = () => {
    setPlayerState(prev => ({ ...prev, showControls: true }));
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  };

  // Playback Controls
  const togglePlay = () => {
    const video = videoRef.current;
    if (playerState.playing) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * playerState.duration;
  };

  const handleVolumeChange = (e) => {
    const video = videoRef.current;
    const volume = parseInt(e.target.value);
    video.volume = volume / 100;
    setPlayerState(prev => ({ ...prev, volume, muted: volume === 0 }));
  };

  const toggleMute = () => {
    const video = videoRef.current;
    const newMuted = !playerState.muted;
    video.muted = newMuted;
    setPlayerState(prev => ({ ...prev, muted: newMuted }));
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    
    if (!playerState.fullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      }
      setPlayerState(prev => ({ ...prev, fullscreen: true }));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      setPlayerState(prev => ({ ...prev, fullscreen: false }));
    }
  };

  const skip = (seconds) => {
    const video = videoRef.current;
    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, playerState.duration));
  };

  const showSkipAnimation = (direction) => {
    setShowSkip(direction);
    setTimeout(() => setShowSkip(null), 600);
  };

  // Double-tap to Skip Implementation
  const handleVideoClick = (e) => {
    const now = Date.now();
    const rect = videoRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    // Determine tap zone
    let zone;
    if (x < width / 3) {
      zone = 'left';
    } else if (x > (width * 2) / 3) {
      zone = 'right';
    } else {
      zone = 'center';
    }

    // Double-tap detection
    if (now - tapState.lastTap < 300 && tapState.zone === zone) {
      // Double tap detected
      if (zone === 'left') {
        skip(-10);
        showSkipAnimation('backward');
      } else if (zone === 'right') {
        skip(10);
        showSkipAnimation('forward');
      }
      setTapState({ lastTap: 0, zone: null });
    } else {
      // First tap
      setTapState({ lastTap: now, zone });
      
      if (zone === 'center') {
        setTimeout(() => {
          if (tapState.lastTap === now) {
            togglePlay();
          }
        }, 300);
      }
    }
  };

  // Touch support for mobile
  const handleTouchEnd = (e) => {
    const touch = e.changedTouches[0];
    const rect = videoRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const width = rect.width;

    let zone;
    if (x < width / 3) {
      zone = 'left';
    } else if (x > (width * 2) / 3) {
      zone = 'right';
    } else {
      zone = 'center';
    }

    const now = Date.now();

    if (now - tapState.lastTap < 300 && tapState.zone === zone) {
      if (zone === 'left') {
        skip(-10);
        showSkipAnimation('backward');
      } else if (zone === 'right') {
        skip(10);
        showSkipAnimation('forward');
      }
      setTapState({ lastTap: 0, zone: null });
    } else {
      setTapState({ lastTap: now, zone });
      
      if (zone === 'center') {
        setTimeout(() => {
          if (tapState.lastTap === now) {
            togglePlay();
          }
        }, 300);
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          skip(-10);
          break;
        case 'ArrowRight':
          skip(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          const newVolumeUp = Math.min(100, playerState.volume + 10);
          handleVolumeChange({ target: { value: newVolumeUp } });
          break;
        case 'ArrowDown':
          e.preventDefault();
          const newVolumeDown = Math.max(0, playerState.volume - 10);
          handleVolumeChange({ target: { value: newVolumeDown } });
          break;
        case 'm':
        case 'M':
          toggleMute();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'Escape':
          if (playerState.fullscreen) {
            toggleFullscreen();
          } else {
            onClose();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerState]);

  // Action handlers
  const handleFavorite = async () => {
    await toggleFavorite(video.id);
  };

  const handleDownload = async () => {
    await downloadFile(video.id);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      await deleteFile(video.id);
      onClose();
    }
  };

  const progressPercent = (playerState.currentTime / playerState.duration) * 100 || 0;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black z-50 flex flex-col"
      style={{ width: '100vw', height: '100vh' }}
      onMouseMove={handleMouseMove}
    >
      {/* Video */}
      <div className="flex-1 flex items-center justify-center relative bg-black">
        <video
          ref={videoRef}
          src={video.storage_url}
          className="max-w-full max-h-full"
          onClick={handleVideoClick}
          onTouchEnd={handleTouchEnd}
        />

        {/* Skip Animations - Responsive */}
        {showSkip === 'backward' && (
          <div className="absolute left-4 sm:left-8 md:left-10 top-1/2 -translate-y-1/2 animate-fade-in pointer-events-none">
            <div className="bg-black/70 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-full text-lg sm:text-2xl font-bold flex items-center gap-2">
              <Backward10 className="w-6 h-6 sm:w-8 sm:h-8" />
              <span className="hidden sm:inline">10s</span>
            </div>
          </div>
        )}

        {showSkip === 'forward' && (
          <div className="absolute right-4 sm:right-8 md:right-10 top-1/2 -translate-y-1/2 animate-fade-in pointer-events-none">
            <div className="bg-black/70 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-full text-lg sm:text-2xl font-bold flex items-center gap-2">
              <span className="hidden sm:inline">10s</span>
              <Forward10 className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
        )}

        {/* Center Play Button */}
        {!playerState.playing && !playerState.buffering && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 transition"
          >
            <div className="bg-white/90 rounded-full p-4 sm:p-6 hover:bg-white transition">
              <Play className="w-12 h-12 sm:w-16 sm:h-16 text-primary-600" />
            </div>
          </button>
        )}

        {/* Buffering Spinner */}
        {playerState.buffering && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-white border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Controls - Responsive */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/80 to-transparent p-3 sm:p-4 md:p-6 transition-opacity duration-300 ${
          playerState.showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar - Full Width */}
        <div
          className="w-full h-1 sm:h-1.5 bg-white/30 rounded-full mb-3 sm:mb-4 cursor-pointer group"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-primary-500 rounded-full relative group-hover:h-2 transition-all"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition"></div>
          </div>
        </div>

        {/* Controls Row - Responsive Layout */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-white">
          {/* Left Controls */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto justify-center sm:justify-start">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-2 hover:bg-white/20 rounded-lg transition"
              aria-label={playerState.playing ? "Pause" : "Play"}
            >
              {playerState.playing ? (
                <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Play className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>

            {/* Skip Buttons */}
            <button
              onClick={() => skip(-10)}
              className="p-2 hover:bg-white/20 rounded-lg transition hidden sm:flex"
              aria-label="Skip backward 10 seconds"
            >
              <Backward10 className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button
              onClick={() => skip(10)}
              className="p-2 hover:bg-white/20 rounded-lg transition hidden sm:flex"
              aria-label="Skip forward 10 seconds"
            >
              <Forward10 className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Volume - Desktop Only */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-2 hover:bg-white/20 rounded-lg transition"
                aria-label={playerState.muted ? "Unmute" : "Mute"}
              >
                {playerState.muted || playerState.volume === 0 ? (
                  <VolumeOff className="w-6 h-6" />
                ) : (
                  <VolumeOn className="w-6 h-6" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={playerState.volume}
                onChange={handleVolumeChange}
                className="w-16 lg:w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${playerState.volume}%, rgba(255,255,255,0.3) ${playerState.volume}%, rgba(255,255,255,0.3) 100%)`
                }}
              />
              <span className="text-xs w-8">{playerState.volume}%</span>
            </div>

            {/* Time - Desktop */}
            <span className="text-xs sm:text-sm hidden sm:block">
              {formatDuration(playerState.currentTime)} / {formatDuration(playerState.duration)}
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
            {/* Mobile Volume Button */}
            <button
              onClick={toggleMute}
              className="md:hidden p-2 hover:bg-white/20 rounded-lg transition"
            >
              {playerState.muted || playerState.volume === 0 ? (
                <VolumeOff className="w-5 h-5" />
              ) : (
                <VolumeOn className="w-5 h-5" />
              )}
            </button>

            {/* Action Buttons */}
            <button
              onClick={handleFavorite}
              className="p-2 hover:bg-white/20 rounded-lg transition"
              aria-label={video.is_favorite ? "Remove from favorites" : "Add to favorites"}
            >
              {video.is_favorite ? (
                <HeartFilled className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
              ) : (
                <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>

            <button
              onClick={handleDownload}
              className="p-2 hover:bg-white/20 rounded-lg transition"
              aria-label="Download video"
            >
              <Download className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button
              onClick={handleDelete}
              className="p-2 hover:bg-white/20 rounded-lg transition"
              aria-label="Delete video"
            >
              <Trash className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/20 rounded-lg transition"
              aria-label={playerState.fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {playerState.fullscreen ? (
                <ExitFullscreen className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Fullscreen className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>

            {/* Close - Only show if not fullscreen */}
            {!playerState.fullscreen && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition"
                aria-label="Close video player"
              >
                <Close className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Hint */}
        <div className="sm:hidden text-center mt-2 text-gray-400 text-xs">
          Double-tap left/right to skip • Tap center to play/pause
        </div>
      </div>

      {/* Top Bar - Title */}
      <div
        className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-3 sm:p-4 transition-opacity duration-300 ${
          playerState.showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <h3 className="text-white font-semibold text-sm sm:text-base md:text-lg truncate pr-12">
          {video.original_name}
        </h3>
      </div>
    </div>
  );
}