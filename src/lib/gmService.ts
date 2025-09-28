import { AxiosResponse } from 'axios';
import axiosInstance from './api';

export interface GeneralManager {
  id: string;
  gm_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  job_role: string;
  job_role_name?: string;
  department: string;
  department_name?: string;
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
  is_senior_manager?: boolean;
  management_level?: string;
  years_of_experience?: number;
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

export interface GeneralManagerParams {
  search?: string;
  status?: string;
  department?: string;
  job_role?: string;
  management_level?: string;
  page_size?: number;
  page?: number;
}

export interface CreateGeneralManagerData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  job_role: string;
  department: string;
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
  is_senior_manager?: boolean;
  management_level?: string;
  years_of_experience?: number;
  document_files?: File[];
  document_types?: string[];
  document_descriptions?: string[];
}

export const generalManagerApi = {
  // Get all General Managers with filters
  getAll: (params: GeneralManagerParams = {}): Promise<AxiosResponse<ApiResponse<GeneralManager[]>>> => {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.department) queryParams.append('department', params.department);
    if (params.job_role) queryParams.append('job_role', params.job_role);
    if (params.management_level) queryParams.append('management_level', params.management_level);
    if (params.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    
    const queryString = queryParams.toString();
    const url = `/profiles/managers/${queryString ? `?${queryString}` : ''}`;
    
    return axiosInstance.get(url);
  },

  // Get single General Manager
  getById: (id: string): Promise<AxiosResponse<ApiResponse<GeneralManager>>> => {
    return axiosInstance.get(`/profiles/managers/${id}/`);
  },

  // Create General Manager
  create: (gmData: CreateGeneralManagerData): Promise<AxiosResponse<ApiResponse<GeneralManager>>> => {
    const formData = new FormData();
    
    // Append basic fields
    Object.keys(gmData).forEach(key => {
      const value = gmData[key as keyof CreateGeneralManagerData];
      
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

    return axiosInstance.post('/profiles/managers/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Update General Manager (full update)
  update: (id: string, gmData: Partial<CreateGeneralManagerData>): Promise<AxiosResponse<ApiResponse<GeneralManager>>> => {
    const formData = new FormData();
    
    Object.keys(gmData).forEach(key => {
      const value = gmData[key as keyof CreateGeneralManagerData];
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    return axiosInstance.put(`/profiles/managers/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Partial update General Manager
  partialUpdate: (id: string, gmData: Partial<CreateGeneralManagerData>): Promise<AxiosResponse<ApiResponse<GeneralManager>>> => {
    const formData = new FormData();
    
    Object.keys(gmData).forEach(key => {
      const value = gmData[key as keyof CreateGeneralManagerData];
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    return axiosInstance.patch(`/profiles/managers/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete General Manager
  delete: (id: string): Promise<AxiosResponse<ApiResponse<void>>> => {
    return axiosInstance.delete(`/profiles/managers/${id}/`);
  },
};