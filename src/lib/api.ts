import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { BASE_URL, STORAGE_KEYS, TOKEN_REFRESH_SETTINGS } from './config';
import { jwtDecode } from 'jwt-decode';

// Types
interface TokenPayload {
  exp: number;
  iat: number;
  jti: string;
  token_type: string;
  user_id: number;
  username: string;
}

interface AuthTokens {
  access: string;
  refresh: string;
  user?: {
    id: number;
    email: string;
    username: string;
    role: string;
    is_active: boolean;
    date_joined: string;
  };
  profile?: any;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  pagination?: {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
  };
}

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
class TokenManager {
  private static refreshPromise: Promise<string> | null = null;

  static getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  static setTokens(tokens: AuthTokens): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh);
  }

  static clearTokens(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const currentTime = Date.now() / 1000;
      const expiryTime = decoded.exp;
      const threshold = TOKEN_REFRESH_SETTINGS.REFRESH_THRESHOLD_MINUTES * 60;
      
      return (expiryTime - currentTime) < threshold;
    } catch (error) {
      return true;
    }
  }

  static async refreshAccessToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this._performRefresh();
    
    try {
      const newAccessToken = await this.refreshPromise;
      return newAccessToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  private static async _performRefresh(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(`${BASE_URL}accounts/refresh/`, {
        refresh: refreshToken,
      });

      const { access } = response.data;
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access);
      return access;
    } catch (error) {
      this.clearTokens();
      throw new Error('Token refresh failed');
    }
  }
}

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    let accessToken = TokenManager.getAccessToken();
    
    if (accessToken && TokenManager.isTokenExpired(accessToken)) {
      try {
        accessToken = await TokenManager.refreshAccessToken();
      } catch (error) {
        TokenManager.clearTokens();
        // Redirect to login or handle error
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await TokenManager.refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        TokenManager.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API service methods
export const api = {
  // Auth methods
  async login(credentials: { email: string; password: string }): Promise<AuthTokens> {
    const response = await axiosInstance.post('accounts/login/', credentials);
    const tokens: AuthTokens = response.data;
    TokenManager.setTokens(tokens);
    return tokens;
  },

  async logout(): Promise<void> {
    TokenManager.clearTokens();
  },

  async getRoles(): Promise<any[]> {
    const response = await axiosInstance.get('accounts/roles/');
    return response.data.data || [];
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const response = await axiosInstance.post('accounts/auth/forgot-password/', { email });
    return response.data;
  },

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const response = await axiosInstance.post('accounts/auth/reset-password/', {
      token,
      new_password: newPassword,
    });
    return response.data;
  },

  async verifyResetToken(token: string): Promise<{ success: boolean; message: string; email?: string }> {
    const response = await axiosInstance.post('accounts/auth/verify-reset-token/', { token });
    return response.data;
  },

  // Generic API methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.get(url, config);
    return response.data;
  },

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.post(url, data, config);
    return response.data;
  },

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.put(url, data, config);
    return response.data;
  },

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.patch(url, data, config);
    return response.data;
  },

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.delete(url, config);
    return response.data;
  },
};

// Proactive token refresh
let refreshInterval: NodeJS.Timeout | null = null;

export const startTokenRefresh = (): void => {
  if (refreshInterval) return;

  refreshInterval = setInterval(async () => {
    const accessToken = TokenManager.getAccessToken();
    if (accessToken && TokenManager.isTokenExpired(accessToken)) {
      try {
        await TokenManager.refreshAccessToken();
      } catch (error) {
        console.error('Proactive token refresh failed:', error);
        TokenManager.clearTokens();
      }
    }
  }, TOKEN_REFRESH_SETTINGS.REFRESH_INTERVAL_MINUTES * 60 * 1000);
};

export const stopTokenRefresh = (): void => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

export default axiosInstance;
