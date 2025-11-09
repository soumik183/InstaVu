// Application constants
export const APP_CONFIG = {
  name: 'InstaVault',
  version: '1.0.0',
  description: 'Unlimited Storage, Unlimited Possibilities'
};

// File upload constraints
export const FILE_CONSTRAINTS = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MIN_FILE_SIZE: 1024, // 1KB
  ALLOWED_IMAGE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ],
  ALLOWED_VIDEO_TYPES: [
    'video/mp4',
    'video/webm',
    'video/mov'
  ],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: '/auth',
  STORAGE: '/storage',
  FILES: '/files',
  USER: '/user'
};

// Storage bucket names
export const STORAGE_BUCKETS = {
  MAIN: 'instavault-storage',
  TEMP: 'instavault-temp',
  THUMBS: 'instavault-thumbs'
};

// Animation durations
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
};

// Local storage keys
export const STORAGE_KEYS = {
  REMEMBERED_EMAIL: 'remembered_email',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language'
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Please check your internet connection and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed size.',
  INVALID_FILE_TYPE: 'This file type is not supported.',
  UPLOAD_FAILED: 'Failed to upload file. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  FILE_UPLOADED: 'File uploaded successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  LOGGED_OUT: 'You have been logged out successfully'
};

// Route paths
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  SETUP: '/setup',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  FORGOT_PASSWORD: '/forgot-password'
};

// Status values
export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ERROR: 'error',
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

// File types
export const FILE_TYPES = {
  IMAGE: 'photo',
  VIDEO: 'video',
  DOCUMENT: 'document',
  OTHER: 'other'
};

// API connection speeds
export const CONNECTION_SPEEDS = {
  FAST: 'fast',
  MEDIUM: 'medium',
  SLOW: 'slow'
};

export default {
  APP_CONFIG,
  FILE_CONSTRAINTS,
  API_ENDPOINTS,
  STORAGE_BUCKETS,
  ANIMATION_DURATIONS,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ROUTES,
  STATUS,
  FILE_TYPES,
  CONNECTION_SPEEDS
};