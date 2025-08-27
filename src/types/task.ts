export interface Task {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  category: string;
  description: string;
  priority: TaskPriority;
  startDate: string;
  dueDate: string;
  attachments: TaskAttachment[];
  assignedEmployee: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  completedAt?: string;
  notes?: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'rejected';

export interface TaskFormData {
  title: string;
  projectId: string;
  category: string;
  description: string;
  priority: TaskPriority;
  startDate: string;
  dueDate: string;
  assignedEmployee: string;
  status: TaskStatus;
}

export interface TaskFilters {
  searchTerm: string;
  status: string;
  priority: string;
  category: string;
  project: string;
  assignedEmployee: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface TaskCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
}
