import { AxiosResponse } from 'axios';
import axiosInstance from './api';

export interface ProjectCoordinator {
  id: string;
  coordinator_id: string; // Backend uses coordinator_id, not pc_id
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  job_role: string; // This is the ID
  job_role_name?: string; // This is the name
  department: string; // This is the ID  
  department_name?: string; // This is the name
  status: 'active' | 'onleave' | 'inactive';
  join_date: string;
  address: string;
  annual_salary: number;
  monthly_salary?: number;
  employment_duration?: number;
  profile_picture?: string;
  full_name: string;
  date_of_birth?: string;
  blood_group?: string;
  account_holder_name?: string;
  account_number?: string;
  bank_name?: string;
  bank_branch?: string;
  ifsc_code?: string;
  notes?: string;
  documents?: Document[];
  created_at?: string;
  updated_at?: string;
  current_project_count?: number; // Backend uses current_project_count, not current_active_projects
  max_concurrent_projects: number; // Backend field name
  specialization?: string; // Backend field name
  is_available_for_new_projects?: boolean;
}

export interface Document {
  id: string;
  document_type: string;
  file: string;
  file_url?: string;
  description?: string;
  created_at: string;
}

export interface ApiResponse<T> {
  status: string;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  count?: number;
  next?: string;
  previous?: string;
}

export interface ProjectCoordinatorParams {
  search?: string;
  status?: string;
  department?: string; // This should be department ID, not name
  job_role?: string; // This should be job_role ID, not name
  page_size?: number;
  page?: number;
}

export interface CreateProjectCoordinatorData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  job_role: string; // ID, not name
  department: string; // ID, not name
  address: string;
  annual_salary: string | number;
  join_date: string;
  status?: 'active' | 'onleave' | 'inactive';
  date_of_birth?: string;
  blood_group?: string;
  account_holder_name?: string;
  account_number?: string;
  bank_name?: string;
  bank_branch?: string;
  ifsc_code?: string;
  notes?: string;
  max_concurrent_projects?: number; // Backend field name
  specialization?: string; // Backend field name
  document_files?: File[];
  document_types?: string[];
  document_descriptions?: string[];
}

export const projectCoordinatorApi = {
  // Get all project coordinators with filters
  getAll: (params: ProjectCoordinatorParams = {}): Promise<AxiosResponse<ApiResponse<ProjectCoordinator[]>>> => {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.department) queryParams.append('department', params.department);
    if (params.job_role) queryParams.append('job_role', params.job_role);
    if (params.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    
    const queryString = queryParams.toString();
    const url = `/profiles/project-coordinators/${queryString ? `?${queryString}` : ''}`;
    
    return axiosInstance.get(url);
  },

  // Get single project coordinator
  getById: (id: string): Promise<AxiosResponse<ApiResponse<ProjectCoordinator>>> => {
    return axiosInstance.get(`/profiles/project-coordinators/${id}/`);
  },

  // Create project coordinator
  create: (coordinatorData: CreateProjectCoordinatorData): Promise<AxiosResponse<ApiResponse<ProjectCoordinator>>> => {
    const formData = new FormData();
    
    // Append basic fields
    Object.keys(coordinatorData).forEach(key => {
      const value = coordinatorData[key as keyof CreateProjectCoordinatorData];
      
      if (key === 'document_files' || key === 'document_types' || key === 'document_descriptions') {
        // Handle arrays separately
        const arrayValue = value as any[];
        arrayValue?.forEach((item, index) => {
          if (item !== null && item !== undefined) {
            formData.append(`${key}[${index}]`, item);
          }
        });
      } else if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    return axiosInstance.post('/profiles/project-coordinators/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Update project coordinator (full update)
  update: (id: string, coordinatorData: Partial<CreateProjectCoordinatorData>): Promise<AxiosResponse<ApiResponse<ProjectCoordinator>>> => {
    // Add validation to prevent the error
    if (!coordinatorData || typeof coordinatorData !== 'object') {
      throw new Error('Invalid data provided for update');
    }

    const formData = new FormData();
    
    // Safely get keys after validation
    Object.keys(coordinatorData).forEach(key => {
      const value = coordinatorData[key as keyof CreateProjectCoordinatorData];
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    return axiosInstance.put(`/profiles/project-coordinators/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Partial update project coordinator
  partialUpdate: (id: string, coordinatorData: Partial<CreateProjectCoordinatorData>): Promise<AxiosResponse<ApiResponse<ProjectCoordinator>>> => {
    // Add validation
    if (!coordinatorData || typeof coordinatorData !== 'object') {
      throw new Error('Invalid data provided for update');
    }

    const formData = new FormData();
    
    Object.keys(coordinatorData).forEach(key => {
      const value = coordinatorData[key as keyof CreateProjectCoordinatorData];
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    return axiosInstance.patch(`/profiles/project-coordinators/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete project coordinator
  delete: (id: string): Promise<AxiosResponse<ApiResponse<void>>> => {
    return axiosInstance.delete(`/profiles/project-coordinators/${id}/`);
  },
};