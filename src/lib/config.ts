// API Configuration
export const BASE_URL = import.meta.env.VITE_APP_BASE_URL || 'http://localhost:8000/api/v1';
export const MEDIA_URL = import.meta.env.VITE_APP_MEDIA_URL || 'http://localhost:8000/media/';
export const DEBUG = import.meta.env.VITE_APP_DEBUG === 'true';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: 'accounts/login/',
  REFRESH: 'accounts/refresh/',
  ROLES: 'accounts/roles/',
  FORGOT_PASSWORD: 'accounts/auth/forgot-password/',
  RESET_PASSWORD: 'accounts/auth/reset-password/',
  VERIFY_RESET_TOKEN: 'accounts/auth/verify-reset-token/',
  
  // Configuration endpoints
  CONFIGURATIONS: 'configurations/',
} as const;

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
} as const;

// Token refresh settings
export const TOKEN_REFRESH_SETTINGS = {
  REFRESH_THRESHOLD_MINUTES: 5, // Refresh token 5 minutes before expiry
  REFRESH_INTERVAL_MINUTES: 4, // Proactive refresh every 4 minutes
} as const;
