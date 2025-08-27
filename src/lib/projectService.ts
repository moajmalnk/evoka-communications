import { Project, ProjectFormData, ProjectStatus } from '@/types/project';

// Mock data for demonstration
export const mockProjectCategories = [
  { id: 'web-dev', name: 'Web Development', color: '#8b5cf6', isActive: true },
  { id: 'mobile-dev', name: 'Mobile Development', color: '#06b6d4', isActive: true },
  { id: 'design', name: 'Design', color: '#f59e0b', isActive: true },
  { id: 'marketing', name: 'Marketing', color: '#10b981', isActive: true },
  { id: 'consulting', name: 'Consulting', color: '#ef4444', isActive: true },
  { id: 'content', name: 'Content Creation', color: '#ec4899', isActive: true },
];

export const mockClients = [
  { id: 'client-1', name: 'Tech Corp' },
  { id: 'client-2', name: 'StartupXYZ' },
  { id: 'client-3', name: 'Fashion Brand' },
  { id: 'client-4', name: 'Local Business' },
  { id: 'client-5', name: 'Healthcare Inc' },
  { id: 'client-6', name: 'Education First' },
];

export const mockCoordinators = [
  { id: 'coord-1', name: 'Alice Johnson', role: 'project_coordinator' },
  { id: 'coord-2', name: 'Bob Smith', role: 'project_coordinator' },
  { id: 'coord-3', name: 'Carol Davis', role: 'project_coordinator' },
  { id: 'coord-4', name: 'David Wilson', role: 'project_coordinator' },
  { id: 'coord-5', name: 'Emma Brown', role: 'project_coordinator' },
];

export const mockProjects: Project[] = [
  {
    id: 'P-001',
    name: 'Website Redesign',
    clientName: 'client-1',
    category: 'web-dev',
    startDate: '2024-01-15',
    endDate: '2024-03-15',
    description: 'Complete redesign of the corporate website with modern UI/UX and improved functionality.',
    attachments: [
      {
        id: 'att-1',
        name: 'Project_Brief.pdf',
        url: '/attachments/project-brief.pdf',
        size: 2048576,
        type: 'application/pdf',
        uploadedAt: '2024-01-15T10:00:00Z',
      },
      {
        id: 'att-2',
        name: 'Design_Mockups.zip',
        url: '/attachments/design-mockups.zip',
        size: 15728640,
        type: 'application/zip',
        uploadedAt: '2024-01-16T14:30:00Z',
      },
    ],
    assignedCoordinator: 'coord-1',
    status: 'in_progress',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-20T16:45:00Z',
    createdBy: 'admin-1',
  },
  {
    id: 'P-002',
    name: 'Mobile App Development',
    clientName: 'client-2',
    category: 'mobile-dev',
    startDate: '2024-02-01',
    endDate: '2024-06-01',
    description: 'Development of a cross-platform mobile application for startup business management.',
    attachments: [
      {
        id: 'att-3',
        name: 'Requirements_Doc.docx',
        url: '/attachments/requirements.docx',
        size: 1048576,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        uploadedAt: '2024-02-01T11:00:00Z',
      },
    ],
    assignedCoordinator: 'coord-2',
    status: 'planning',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z',
    createdBy: 'gm-1',
  },
  {
    id: 'P-003',
    name: 'Brand Identity Design',
    clientName: 'client-3',
    category: 'design',
    startDate: '2023-11-01',
    endDate: '2024-01-01',
    description: 'Complete brand identity package including logo, color palette, typography, and brand guidelines.',
    attachments: [
      {
        id: 'att-4',
        name: 'Brand_Guidelines.pdf',
        url: '/attachments/brand-guidelines.pdf',
        size: 5242880,
        type: 'application/pdf',
        uploadedAt: '2024-01-01T15:00:00Z',
      },
      {
        id: 'att-5',
        name: 'Logo_Files.zip',
        url: '/attachments/logo-files.zip',
        size: 20971520,
        type: 'application/zip',
        uploadedAt: '2024-01-01T15:30:00Z',
      },
    ],
    assignedCoordinator: 'coord-3',
    status: 'completed',
    createdAt: '2023-11-01T09:00:00Z',
    updatedAt: '2024-01-01T16:00:00Z',
    createdBy: 'admin-1',
  },
  {
    id: 'P-004',
    name: 'Marketing Campaign',
    clientName: 'client-4',
    category: 'marketing',
    startDate: '2024-01-10',
    endDate: '2024-04-10',
    description: 'Comprehensive digital marketing campaign including social media, email marketing, and PPC advertising.',
    attachments: [
      {
        id: 'att-6',
        name: 'Campaign_Strategy.pdf',
        url: '/attachments/campaign-strategy.pdf',
        size: 1572864,
        type: 'application/pdf',
        uploadedAt: '2024-01-10T13:00:00Z',
      },
    ],
    assignedCoordinator: 'coord-4',
    status: 'on_hold',
    createdAt: '2024-01-10T12:00:00Z',
    updatedAt: '2024-01-25T11:20:00Z',
    createdBy: 'gm-1',
  },
];

class ProjectService {
  private static instance: ProjectService;
  private projects: Project[] = [...mockProjects];

  static getInstance() {
    if (!ProjectService.instance) {
      ProjectService.instance = new ProjectService();
    }
    return ProjectService.instance;
  }

  // Generate unique project ID
  private generateProjectId(): string {
    const lastProject = this.projects[this.projects.length - 1];
    if (!lastProject) return 'P-001';
    
    const lastNumber = parseInt(lastProject.id.substring(2));
    const nextNumber = lastNumber + 1;
    return `P-${nextNumber.toString().padStart(3, '0')}`;
  }

  // Get all projects
  async getProjects(): Promise<Project[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.projects];
  }

  // Get project by ID
  async getProjectById(id: string): Promise<Project | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.projects.find(project => project.id === id) || null;
  }

  // Create new project
  async createProject(data: ProjectFormData, createdBy: string): Promise<Project> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newProject: Project = {
      id: this.generateProjectId(),
      name: data.name,
      clientName: data.clientName,
      category: data.category,
      startDate: data.startDate,
      endDate: data.endDate,
      description: data.description,
      attachments: [],
      assignedCoordinator: data.assignedCoordinator,
      status: data.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy,
    };

    this.projects.push(newProject);
    return newProject;
  }

  // Update project
  async updateProject(id: string, data: Partial<ProjectFormData>): Promise<Project> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const projectIndex = this.projects.findIndex(project => project.id === id);
    if (projectIndex === -1) {
      throw new Error('Project not found');
    }

    const updatedProject = {
      ...this.projects[projectIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.projects[projectIndex] = updatedProject;
    return updatedProject;
  }

  // Delete project
  async deleteProject(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const projectIndex = this.projects.findIndex(project => project.id === id);
    if (projectIndex === -1) {
      throw new Error('Project not found');
    }

    this.projects.splice(projectIndex, 1);
  }

  // Get projects by coordinator
  async getProjectsByCoordinator(coordinatorId: string): Promise<Project[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.projects.filter(project => project.assignedCoordinator === coordinatorId);
  }

  // Get projects by client
  async getProjectsByClient(clientId: string): Promise<Project[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.projects.filter(project => project.clientName === clientId);
  }

  // Get projects by status
  async getProjectsByStatus(status: ProjectStatus): Promise<Project[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.projects.filter(project => project.status === status);
  }

  // Search projects
  async searchProjects(query: string): Promise<Project[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const lowercaseQuery = query.toLowerCase();
    
    return this.projects.filter(project => 
      project.name.toLowerCase().includes(lowercaseQuery) ||
      project.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Get project statistics
  async getProjectStats() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const total = this.projects.length;
    const planning = this.projects.filter(p => p.status === 'planning').length;
    const inProgress = this.projects.filter(p => p.status === 'in_progress').length;
    const onHold = this.projects.filter(p => p.status === 'on_hold').length;
    const completed = this.projects.filter(p => p.status === 'completed').length;

    return {
      total,
      planning,
      inProgress,
      onHold,
      completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }
}

export const projectService = ProjectService.getInstance();
