import { api } from './api';
import { User, UserRole } from './types/auth';

class AuthService {
  private static instance: AuthService;
  private user: User | null = null;

  static getInstance() {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  getCurrentUser(): User | null {
    if (!this.user) {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        this.user = JSON.parse(stored);
        
        // Check if this is an old cached user with incorrect role mapping
        // If the user has role 'employee' but should be 'admin', clear the cache
        if (this.user.role === 'employee' && this.user.email === 'alex.thompson@company.com') {
          console.log('Detected cached user with incorrect role. Clearing cache...');
          this.clearUserCache();
          return null;
        }
      }
    }
    return this.user;
  }

  getUserProfile(): Record<string, unknown> | null {
    const stored = localStorage.getItem('userProfile');
    return stored ? JSON.parse(stored) : null;
  }

  clearUserCache(): void {
    this.user = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userProfile');
    console.log('User cache cleared. Please log in again.');
  }

  async login(email: string, password: string): Promise<User> {
    try {
      // Call the real backend API
      const response = await api.login({ email, password });
      
      if (!response.user) {
        throw new Error('Invalid response from server');
      }

      // Extract name from username or email for better user experience
      const username = response.user.username || email.split('@')[0];
      const nameParts = username.split('.');
      
      // Map backend user data to frontend User interface
      console.log('Backend role received:', response.user.role);
      const mappedRole = this.mapBackendRoleToFrontendRole(response.user.role || 'employee');
      console.log('Mapped role:', mappedRole);
      
      const user: User = {
        id: response.user.id.toString(),
        email: response.user.email,
        firstName: nameParts[0] || username,
        lastName: nameParts[1] || '',
        role: mappedRole,
        isActive: response.user.is_active ?? true,
        avatar: response.profile?.avatar || undefined,
      };

      this.user = user;
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // Store additional user data if profile exists
      if (response.profile) {
        localStorage.setItem('userProfile', JSON.stringify(response.profile));
      }
      
      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Invalid credentials. Please check your email and password.');
    }
  }

  async logout(): Promise<void> {
    try {
      // Clear API tokens
      await api.logout();
    } catch (error) {
      console.warn('Logout API call failed:', error);
    }
    
    this.user = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userProfile');
  }

  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    const hasAccessToken = localStorage.getItem('access_token');
    return user !== null && hasAccessToken !== null;
  }

  hasRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  private mapBackendRoleToFrontendRole(backendRole: string): UserRole {
    // Map your backend roles to frontend roles
    const roleMap: Record<string, UserRole> = {
      'admin': 'admin',
      'general_manager': 'general_manager',
      'project_coordinator': 'project_coordinator',
      'employee': 'employee',
      'hr': 'hr',
      'OPERATION_ADMIN': 'admin', // Map OPERATION_ADMIN to admin role
    };
    
    return roleMap[backendRole] || 'employee';
  }
}

export const authService = AuthService.getInstance();

// Make authService available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).authService = authService;
}
