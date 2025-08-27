export interface Project {
  id: string;
  name: string;
  clientName: string;
  category: string;
  startDate: string;
  endDate: string;
  description: string;
  attachments: ProjectAttachment[];
  assignedCoordinator: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ProjectAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed';

export interface ProjectCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
}

export interface ProjectFormData {
  name: string;
  clientName: string;
  category: string;
  startDate: string;
  endDate: string;
  description: string;
  assignedCoordinator: string;
  status: ProjectStatus;
}

export interface ProjectFilters {
  searchTerm: string;
  status: string;
  category: string;
  coordinator: string;
  dateRange: {
    start: string;
    end: string;
  };
}
