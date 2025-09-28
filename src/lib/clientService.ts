// services/clientApi.ts
import { AxiosResponse } from 'axios';
import axiosInstance from './api';
import { ApiResponse } from './projectCoordinatorService';

// Client Interfaces
export interface Client {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  address?: string;
  company?: string;
  industry: string;
  industry_display?: string;
  status: 'active' | 'inactive' | 'prospect';
  status_display?: string;
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_revenue: number;
  notes?: string;
  display_name?: string;
  project_success_rate?: number;
  average_revenue_per_project?: number;
  contact_info?: ContactInfo;
  created_at: string;
  updated_at: string;
}

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  address?: string;
}

// Valid industry choices based on backend
export const INDUSTRY_CHOICES = {
  TECHNOLOGY: 'technology',
  HEALTHCARE: 'healthcare',
  FINANCE: 'finance',
  RETAIL: 'retail',
  EDUCATION: 'education',
  MANUFACTURING: 'manufacturing',
  CONSULTING: 'consulting',
  REAL_ESTATE: 'real_estate',
  ENTERTAINMENT: 'entertainment',
  OTHER: 'other'
} as const;

export type IndustryChoice = typeof INDUSTRY_CHOICES[keyof typeof INDUSTRY_CHOICES];

// Valid status choices
export const STATUS_CHOICES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PROSPECT: 'prospect'
} as const;

export type StatusChoice = typeof STATUS_CHOICES[keyof typeof STATUS_CHOICES];

export interface ClientCreateData {
  name: string;
  email: string;
  phone_number: string;
  address?: string;
  company?: string;
  industry: IndustryChoice;
  status?: StatusChoice;
  notes?: string;
}

export interface ClientUpdateData extends Partial<ClientCreateData> {}

export interface ClientFilters {
  search?: string;
  status?: string;
  industry?: string;
  min_projects?: number;
  max_projects?: number;
  min_revenue?: number;
  max_revenue?: number;
}

export interface ClientsResponse {
  status: string;
  data?: Client[];
  results?: Client[];
  count?: number;
  next?: string | null;
  previous?: string | null;
  search_term?: string;
  filters?: {
    status: string;
    industry: string;
    min_projects: string;
    max_projects: string;
    min_revenue: string;
    max_revenue: string;
  };
  message?: string;
  errors?: any;
}

interface ClientParams {
  search?: string;
  status?: string;
  industry?: string;
  job_role?: string;
  page_size?: number;
  page?: number;
}

export const clientApi = {
  // Get all clients with filters
  getAll: (params: ClientParams = {}): Promise<AxiosResponse<ApiResponse<Client[]>>> => {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.industry) queryParams.append('industry', params.industry);
    if (params.job_role) queryParams.append('job_role', params.job_role);
    if (params.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    
    const queryString = queryParams.toString();
    const url = `/profiles/clients/${queryString ? `?${queryString}` : ''}`;
    
    return axiosInstance.get(url);
  },

  // Get single client
  getById: (id: string): Promise<AxiosResponse<ApiResponse<Client>>> => {
    return axiosInstance.get(`/profiles/clients/${id}/`);
  },

  // Create client
  create: (clientData: ClientCreateData): Promise<AxiosResponse<ApiResponse<Client>>> => {
    // Ensure status is properly set
    const data = {
      ...clientData,
      status: clientData.status || STATUS_CHOICES.ACTIVE
    };

    return axiosInstance.post('/profiles/clients/', data);
  },

  // Update client (full update)
  update: (id: string, clientData: Partial<ClientUpdateData>): Promise<AxiosResponse<ApiResponse<Client>>> => {
    return axiosInstance.put(`/profiles/clients/${id}/`, clientData);
  },

  // Partial update client
  partialUpdate: (id: string, clientData: Partial<ClientUpdateData>): Promise<AxiosResponse<ApiResponse<Client>>> => {
    return axiosInstance.patch(`/profiles/clients/${id}/`, clientData);
  },

  // Delete client
  delete: (id: string): Promise<AxiosResponse<ApiResponse<void>>> => {
    return axiosInstance.delete(`/profiles/clients/${id}/`);
  },
};