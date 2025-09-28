import { api } from './api';

// Category interface
export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isActive?: boolean;
  created_at?: string;
  updated_at?: string;
  // Also support camelCase for backward compatibility
  createdAt?: string;
  updatedAt?: string;
}

// API Response interface
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Category type mapping
export type CategoryType = 'project' | 'task' | 'leave' | 'payment' | 'finance' | 'jobrole' | 'department';

// Get API endpoint for category type
const getCategoryEndpoint = (type: CategoryType): string => {
  const endpoints = {
    project: '/configurations/project-categories/',
    task: '/configurations/task-categories/',
    leave: '/configurations/leave-categories/',
    payment: '/configurations/payment-categories/',
    finance: '/configurations/finance-categories/',
    jobrole: '/configurations/jobrole-categories/',
    department: '/configurations/department-categories/',
  };
  return endpoints[type];
};

// Generic category service functions
export const categoryService = {
  // Get all categories of a specific type
  async getCategories(type: CategoryType): Promise<Category[]> {
    try {
      console.log(`Fetching ${type} categories from:`, getCategoryEndpoint(type));
      const response = await api.get<Category[] | ApiResponse<Category[]>>(getCategoryEndpoint(type));
      console.log(`${type} categories API response:`, response);
      console.log(`${type} categories data:`, response);
      
      // Handle both direct array response and wrapped response
      const categories = Array.isArray(response) ? response : (response.data || []);
      return categories;
    } catch (error) {
      console.error(`Error fetching ${type} categories:`, error);
      throw error;
    }
  },

  // Get a specific category by ID
  async getCategory(type: CategoryType, id: string): Promise<Category> {
    try {
      console.log(`Fetching ${type} category with ID ${id} from:`, `${getCategoryEndpoint(type)}${id}/`);
      const response = await api.get<Category | ApiResponse<Category>>(`${getCategoryEndpoint(type)}${id}/`);
      console.log(`${type} category API response:`, response);
      console.log(`${type} category data:`, response);
      
      // Handle both direct object response and wrapped response
      const category = response && typeof response === 'object' && 'id' in response 
        ? response 
        : ((response as ApiResponse<Category>).data || null);
        
      if (!category) {
        throw new Error('Category not found');
      }
      return category;
    } catch (error) {
      console.error(`Error fetching ${type} category:`, error);
      throw error;
    }
  },

  // Create a new category
  async createCategory(type: CategoryType, categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    try {
      console.log(`Creating ${type} category:`, categoryData);
      console.log(`API endpoint:`, getCategoryEndpoint(type));
      
      const response = await api.post<Category | ApiResponse<Category>>(getCategoryEndpoint(type), {
        name: categoryData.name,
        description: categoryData.description || '',
      });
      
      console.log(`API response:`, response);
      
      // Handle both direct object response and wrapped response
      const category = response && typeof response === 'object' && 'id' in response 
        ? response 
        : ((response as ApiResponse<Category>).data || null);
        
      if (!category) {
        console.error('No data in response:', response);
        throw new Error('Failed to create category');
      }
      return category;
    } catch (error) {
      console.error(`Error creating ${type} category:`, error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      // Re-throw the original error to preserve error details
      throw error;
    }
  },

  // Update an existing category
  async updateCategory(type: CategoryType, id: string, categoryData: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Category> {
    try {
      console.log(`Updating ${type} category with ID ${id}:`, categoryData);
      console.log(`API endpoint:`, `${getCategoryEndpoint(type)}${id}/`);
      
      const response = await api.put<Category | ApiResponse<Category>>(`${getCategoryEndpoint(type)}${id}/`, {
        name: categoryData.name,
        description: categoryData.description || '',
      });
      
      console.log(`${type} category update API response:`, response);
      console.log(`${type} category update data:`, response);
      
      // Handle both direct object response and wrapped response
      const category = response && typeof response === 'object' && 'id' in response 
        ? response 
        : ((response as ApiResponse<Category>).data || null);
        
      if (!category) {
        throw new Error('Failed to update category');
      }
      return category;
    } catch (error) {
      console.error(`Error updating ${type} category:`, error);
      throw error;
    }
  },

  // Partially update an existing category
  async patchCategory(type: CategoryType, id: string, categoryData: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Category> {
    try {
      console.log(`Patching ${type} category with ID ${id}:`, categoryData);
      console.log(`API endpoint:`, `${getCategoryEndpoint(type)}${id}/`);
      
      const response = await api.patch<Category | ApiResponse<Category>>(`${getCategoryEndpoint(type)}${id}/`, {
        name: categoryData.name,
        description: categoryData.description || '',
      });
      
      console.log(`${type} category patch API response:`, response);
      console.log(`${type} category patch data:`, response);
      
      // Handle both direct object response and wrapped response
      const category = response && typeof response === 'object' && 'id' in response 
        ? response 
        : ((response as ApiResponse<Category>).data || null);
        
      if (!category) {
        throw new Error('Failed to update category');
      }
      return category;
    } catch (error) {
      console.error(`Error patching ${type} category:`, error);
      throw error;
    }
  },

  // Delete a category
  async deleteCategory(type: CategoryType, id: string): Promise<void> {
    try {
      console.log(`Deleting ${type} category with ID ${id} from:`, `${getCategoryEndpoint(type)}${id}/`);
      const response = await api.delete(`${getCategoryEndpoint(type)}${id}/`);
      console.log(`${type} category delete API response:`, response);
    } catch (error) {
      console.error(`Error deleting ${type} category:`, error);
      throw error;
    }
  },

  // Bulk operations
  async createMultipleCategories(type: CategoryType, categories: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Category[]> {
    try {
      const promises = categories.map(category => this.createCategory(type, category));
      return await Promise.all(promises);
    } catch (error) {
      console.error(`Error creating multiple ${type} categories:`, error);
      throw error;
    }
  },

  // Get all categories for all types
  async getAllCategories(): Promise<Record<CategoryType, Category[]>> {
    try {
      console.log('Fetching all categories for all types...');
      const promises = Object.keys({
        project: 'project',
        task: 'task',
        leave: 'leave',
        payment: 'payment',
        finance: 'finance',
        jobrole: 'jobrole',
        department: 'department',
      } as Record<CategoryType, string>).map(type => 
        this.getCategories(type as CategoryType)
      );

      const results = await Promise.all(promises);
      
      console.log('All categories API results:', results);
      
      const allCategories = {
        project: results[0],
        task: results[1],
        leave: results[2],
        payment: results[3],
        finance: results[4],
        jobrole: results[5],
        department: results[6],
      };
      
      console.log('All categories data:', allCategories);
      
      return allCategories;
    } catch (error) {
      console.error('Error fetching all categories:', error);
      throw error;
    }
  }
};

// Type-specific service functions for convenience
export const projectCategoryService = {
  getAll: () => categoryService.getCategories('project'),
  getById: (id: string) => categoryService.getCategory('project', id),
  create: (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => categoryService.createCategory('project', data),
  update: (id: string, data: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>) => categoryService.updateCategory('project', id, data),
  patch: (id: string, data: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>) => categoryService.patchCategory('project', id, data),
  delete: (id: string) => categoryService.deleteCategory('project', id),
};

export const taskCategoryService = {
  getAll: () => categoryService.getCategories('task'),
  getById: (id: string) => categoryService.getCategory('task', id),
  create: (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => categoryService.createCategory('task', data),
  update: (id: string, data: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>) => categoryService.updateCategory('task', id, data),
  patch: (id: string, data: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>) => categoryService.patchCategory('task', id, data),
  delete: (id: string) => categoryService.deleteCategory('task', id),
};

export const leaveCategoryService = {
  getAll: () => categoryService.getCategories('leave'),
  getById: (id: string) => categoryService.getCategory('leave', id),
  create: (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => categoryService.createCategory('leave', data),
  update: (id: string, data: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>) => categoryService.updateCategory('leave', id, data),
  patch: (id: string, data: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>) => categoryService.patchCategory('leave', id, data),
  delete: (id: string) => categoryService.deleteCategory('leave', id),
};

export const paymentCategoryService = {
  getAll: () => categoryService.getCategories('payment'),
  getById: (id: string) => categoryService.getCategory('payment', id),
  create: (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => categoryService.createCategory('payment', data),
  update: (id: string, data: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>) => categoryService.updateCategory('payment', id, data),
  patch: (id: string, data: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>) => categoryService.patchCategory('payment', id, data),
  delete: (id: string) => categoryService.deleteCategory('payment', id),
};

export const financeCategoryService = {
  getAll: () => categoryService.getCategories('finance'),
  getById: (id: string) => categoryService.getCategory('finance', id),
  create: (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => categoryService.createCategory('finance', data),
  update: (id: string, data: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>) => categoryService.updateCategory('finance', id, data),
  patch: (id: string, data: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>) => categoryService.patchCategory('finance', id, data),
  delete: (id: string) => categoryService.deleteCategory('finance', id),
};

export const jobRoleCategoryService = {
  getAll: () => categoryService.getCategories('jobrole'),
  getById: (id: string) => categoryService.getCategory('jobrole', id),
  create: (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => categoryService.createCategory('jobrole', data),
  update: (id: string, data: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>) => categoryService.updateCategory('jobrole', id, data),
  patch: (id: string, data: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>) => categoryService.patchCategory('jobrole', id, data),
  delete: (id: string) => categoryService.deleteCategory('jobrole', id),
};

export const departmentCategoryService = {
  getAll: () => categoryService.getCategories('department'),
  getById: (id: string) => categoryService.getCategory('department', id),
  create: (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => categoryService.createCategory('department', data),
  update: (id: string, data: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>) => categoryService.updateCategory('department', id, data),
  patch: (id: string, data: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>) => categoryService.patchCategory('department', id, data),
  delete: (id: string) => categoryService.deleteCategory('department', id),
};