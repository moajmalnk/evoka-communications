export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
}

export type UserRole = 'admin' | 'general_manager' | 'project_coordinator' | 'employee' | 'hr';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Mock authentication for demo purposes
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@agency.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    isActive: true,
  },
  {
    id: '2',
    email: 'gm@agency.com',
    firstName: 'General',
    lastName: 'Manager',
    role: 'general_manager',
    isActive: true,
  },
  {
    id: '3',
    email: 'coordinator@agency.com',
    firstName: 'Project',
    lastName: 'Coordinator',
    role: 'project_coordinator',
    isActive: true,
  },
  {
    id: '4',
    email: 'employee@agency.com',
    firstName: 'John',
    lastName: 'Employee',
    role: 'employee',
    isActive: true,
  },
  {
    id: '5',
    email: 'hr@agency.com',
    firstName: 'HR',
    lastName: 'Manager',
    role: 'hr',
    isActive: true,
  },
];

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
      }
    }
    return this.user;
  }

  async login(email: string, password: string): Promise<User> {
    // Mock login - in real app, this would call an API
    const user = mockUsers.find(u => u.email === email);
    if (!user || password !== 'demo123') {
      throw new Error('Invalid credentials');
    }
    
    this.user = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  }

  async logout(): Promise<void> {
    this.user = null;
    localStorage.removeItem('currentUser');
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  hasRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }
}

export const authService = AuthService.getInstance();