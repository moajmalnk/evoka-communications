export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
}

export type UserRole =
  | 'admin'
  | 'general_manager'
  | 'project_coordinator'
  | 'employee'
  | 'hr'
  // New roles per Evoka workflow
  | 'bdm'
  | 'crm'
  | 'cd'
  | 'acd'
  | 'copywriter'
  | 'production'
  | 'billing';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
