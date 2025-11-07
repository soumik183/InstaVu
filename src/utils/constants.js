// File type categories
export const FILE_TYPES = {
  PHOTO: 'photo',
  VIDEO: 'video',
  DOCUMENT: 'document',
  OTHER: 'other',
};

// API status
export const API_STATUS = {
  ACTIVE: 'active',
  ERROR: 'error',
  FULL: 'full',
  DISCONNECTED: 'disconnected',
};

// Storage limits
export const STORAGE = {
  DEFAULT_LIMIT: 5368709120, // 5GB in bytes
  WARNING_THRESHOLD: 0.8, // 80%
  CRITICAL_THRESHOLD: 0.95, // 95%
};

// Connection speeds
export const CONNECTION_SPEED = {
  FAST: 'fast',
  MEDIUM: 'medium',
  SLOW: 'slow',
};

// Allowed MIME types
export const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Videos
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  // Archives
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
];

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  SETUP: '/setup',
  DASHBOARD: '/dashboard',
  PHOTOS: '/dashboard/photos',
  VIDEOS: '/dashboard/videos',
  DOCUMENTS: '/dashboard/documents',
  FAVORITES: '/dashboard/favorites',
};

// Local storage keys
export const STORAGE_KEYS = {
  REMEMBERED_EMAIL: 'remembered_email',
  REMEMBERED_PASSWORD: 'remembered_password',
  THEME: 'theme',
  VIEW_MODE: 'view_mode',
};