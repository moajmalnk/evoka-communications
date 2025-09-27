import { Task, TaskFormData, TaskPriority, TaskStatus } from '@/types/task';
import { mockProjects } from './projectService';

// Mock task categories
export const mockTaskCategories = [
  { id: 'design', name: 'Design', color: '#f59e0b', isActive: true },
  { id: 'development', name: 'Development', color: '#8b5cf6', isActive: true },
  { id: 'marketing', name: 'Marketing', color: '#10b981', isActive: true },
  { id: 'content', name: 'Content', color: '#ec4899', isActive: true },
  { id: 'testing', name: 'Testing', color: '#06b6d4', isActive: true },
  { id: 'planning', name: 'Planning', color: '#f97316', isActive: true },
  { id: 'research', name: 'Research', color: '#84cc16', isActive: true },
];

// Mock employees
export const mockEmployees = [
  { id: 'emp-1', name: 'John Doe', role: 'employee', department: 'Design' },
  { id: 'emp-2', name: 'Jane Smith', role: 'employee', department: 'Development' },
  { id: 'emp-3', name: 'Mike Johnson', role: 'employee', department: 'Marketing' },
  { id: 'emp-4', name: 'Sarah Wilson', role: 'employee', department: 'Content' },
  { id: 'emp-5', name: 'David Brown', role: 'employee', department: 'Testing' },
  { id: 'emp-6', name: 'Emily Davis', role: 'employee', department: 'Design' },
  { id: 'emp-7', name: 'Alex Turner', role: 'employee', department: 'Development' },
  { id: 'emp-8', name: 'Emma Taylor', role: 'employee', department: 'Marketing' },
];

// Mock tasks data
export const mockTasks: Task[] = [
  {
    id: 'T-001',
    title: 'Design Homepage Wireframes',
    projectId: 'P-001',
    projectName: 'Website Redesign',
    category: 'design',
    description: 'Create wireframes for the homepage layout including navigation, hero section, and content areas. Focus on user experience and modern design principles.',
    priority: 'high',
    startDate: '2024-01-15',
    dueDate: '2024-01-20',
    attachments: [
      {
        id: 'att-1',
        name: 'Design_Brief.pdf',
        url: '/attachments/design-brief.pdf',
        size: 1048576,
        type: 'application/pdf',
        uploadedAt: '2024-01-15T09:00:00Z',
      },
    ],
    assignedEmployee: 'emp-1',
    status: 'in_progress',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-18T14:30:00Z',
    createdBy: 'coord-1',
    notes: 'Client requested modern, minimalist design approach',
    taskType: 'main',
  },
  {
    id: 'T-002',
    title: 'Setup Database Schema',
    projectId: 'P-002',
    projectName: 'Mobile App Development',
    category: 'development',
    description: 'Design and implement the database structure for user management, content storage, and API endpoints. Ensure scalability and security.',
    priority: 'medium',
    startDate: '2024-01-20',
    dueDate: '2024-01-25',
    attachments: [
      {
        id: 'att-2',
        name: 'Database_Requirements.docx',
        url: '/attachments/database-requirements.docx',
        size: 2097152,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        uploadedAt: '2024-01-20T10:00:00Z',
      },
    ],
    assignedEmployee: 'emp-2',
    status: 'pending',
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-20T09:00:00Z',
    createdBy: 'coord-2',
    taskType: 'main',
  },
  {
    id: 'T-003',
    title: 'Create Brand Guidelines',
    projectId: 'P-003',
    projectName: 'Brand Identity Design',
    category: 'design',
    description: 'Develop comprehensive brand guidelines document including logo usage, color palette, typography, and brand voice guidelines.',
    priority: 'low',
    startDate: '2024-01-10',
    dueDate: '2024-01-15',
    attachments: [
      {
        id: 'att-3',
        name: 'Brand_Assets.zip',
        url: '/attachments/brand-assets.zip',
        size: 5242880,
        type: 'application/zip',
        uploadedAt: '2024-01-10T11:00:00Z',
      },
    ],
    assignedEmployee: 'emp-6',
    status: 'completed',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T16:00:00Z',
    createdBy: 'coord-3',
    completedAt: '2024-01-15T15:30:00Z',
    taskType: 'main',
  },
  {
    id: 'T-004',
    title: 'Content Strategy Planning',
    projectId: 'P-004',
    projectName: 'Marketing Campaign',
    category: 'marketing',
    description: 'Plan content strategy for the upcoming campaign including content calendar, messaging framework, and distribution channels.',
    priority: 'high',
    startDate: '2024-01-15',
    dueDate: '2024-01-30',
    attachments: [
      {
        id: 'att-4',
        name: 'Campaign_Brief.pdf',
        url: '/attachments/campaign-brief.pdf',
        size: 1572864,
        type: 'application/pdf',
        uploadedAt: '2024-01-15T13:00:00Z',
      },
    ],
    assignedEmployee: 'emp-3',
    status: 'rejected',
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-25T11:20:00Z',
    createdBy: 'coord-4',
    notes: 'Client requested significant changes to the strategy approach',
    taskType: 'main',
  },
  {
    id: 'T-005',
    title: 'Frontend Component Development',
    projectId: 'P-001',
    projectName: 'Website Redesign',
    category: 'development',
    description: 'Develop reusable React components for the website including navigation, forms, and interactive elements.',
    priority: 'medium',
    startDate: '2024-01-22',
    dueDate: '2024-01-28',
    attachments: [],
    assignedEmployee: 'emp-7',
    status: 'pending',
    createdAt: '2024-01-22T09:00:00Z',
    updatedAt: '2024-01-22T09:00:00Z',
    createdBy: 'coord-1',
    taskType: 'main',
  },
  {
    id: 'T-006',
    title: 'User Testing and Feedback',
    projectId: 'P-002',
    projectName: 'Mobile App Development',
    category: 'testing',
    description: 'Conduct user testing sessions and gather feedback on the mobile app prototype. Document findings and recommendations.',
    priority: 'low',
    startDate: '2024-01-26',
    dueDate: '2024-01-30',
    attachments: [],
    assignedEmployee: 'emp-5',
    status: 'pending',
    createdAt: '2024-01-26T10:00:00Z',
    updatedAt: '2024-01-26T10:00:00Z',
    createdBy: 'coord-2',
    taskType: 'main',
  },
  // Sub tasks
  {
    id: 'T-007',
    title: 'Create Navigation Component',
    projectId: 'P-001',
    projectName: 'Website Redesign',
    category: 'development',
    description: 'Develop the main navigation component with responsive design and accessibility features.',
    priority: 'medium',
    startDate: '2024-01-22',
    dueDate: '2024-01-24',
    attachments: [],
    assignedEmployee: 'emp-7',
    status: 'in_progress',
    createdAt: '2024-01-22T10:00:00Z',
    updatedAt: '2024-01-23T14:30:00Z',
    createdBy: 'coord-1',
    taskType: 'sub',
    parentTaskId: 'T-005',
    parentTaskTitle: 'Frontend Component Development',
  },
  {
    id: 'T-008',
    title: 'Design Color Palette',
    projectId: 'P-003',
    projectName: 'Brand Identity Design',
    category: 'design',
    description: 'Create a comprehensive color palette that reflects the brand identity and works across all media.',
    priority: 'low',
    startDate: '2024-01-10',
    dueDate: '2024-01-12',
    attachments: [],
    assignedEmployee: 'emp-6',
    status: 'completed',
    createdAt: '2024-01-10T11:00:00Z',
    updatedAt: '2024-01-12T16:00:00Z',
    createdBy: 'coord-3',
    completedAt: '2024-01-12T15:30:00Z',
    taskType: 'sub',
    parentTaskId: 'T-003',
    parentTaskTitle: 'Create Brand Guidelines',
  },
  {
    id: 'T-009',
    title: 'Create Form Components',
    projectId: 'P-001',
    projectName: 'Website Redesign',
    category: 'development',
    description: 'Develop reusable form components including input fields, validation, and submission handling.',
    priority: 'medium',
    startDate: '2024-01-25',
    dueDate: '2024-01-27',
    attachments: [],
    assignedEmployee: 'emp-7',
    status: 'in_progress',
    createdAt: '2024-01-25T09:00:00Z',
    updatedAt: '2024-01-26T14:30:00Z',
    createdBy: 'coord-1',
    taskType: 'sub',
    parentTaskId: 'T-005',
    parentTaskTitle: 'Frontend Component Development',
  },
  {
    id: 'T-010',
    title: 'API Integration Testing',
    projectId: 'P-002',
    projectName: 'Mobile App Development',
    category: 'testing',
    description: 'Test API integration endpoints and ensure proper data flow between frontend and backend.',
    priority: 'high',
    startDate: '2024-01-28',
    dueDate: '2024-01-30',
    attachments: [],
    assignedEmployee: 'emp-3',
    status: 'pending',
    createdAt: '2024-01-28T10:00:00Z',
    updatedAt: '2024-01-28T10:00:00Z',
    createdBy: 'coord-2',
    taskType: 'sub',
    parentTaskId: 'T-006',
    parentTaskTitle: 'User Testing and Feedback',
  },
];

class TaskService {
  private static instance: TaskService;
  private tasks: Task[] = [...mockTasks];

  static getInstance() {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
  }

  // Generate unique task ID
  private generateTaskId(): string {
    const lastTask = this.tasks[this.tasks.length - 1];
    if (!lastTask) return 'T-001';
    
    const lastNumber = parseInt(lastTask.id.substring(2));
    const nextNumber = lastNumber + 1;
    return `T-${nextNumber.toString().padStart(3, '0')}`;
  }

  // Get all tasks
  async getTasks(): Promise<Task[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.tasks];
  }

  // Get task by ID
  async getTaskById(id: string): Promise<Task | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.tasks.find(task => task.id === id) || null;
  }

  // Get tasks by project
  async getTasksByProject(projectId: string): Promise<Task[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.tasks.filter(task => task.projectId === projectId);
  }

  // Get tasks by employee
  async getTasksByEmployee(employeeId: string): Promise<Task[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.tasks.filter(task => task.assignedEmployee === employeeId);
  }

  // Create new task
  async createTask(data: TaskFormData, createdBy: string): Promise<Task> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const project = mockProjects.find(p => p.id === data.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const newTask: Task = {
      id: this.generateTaskId(),
      title: data.title,
      projectId: data.projectId,
      projectName: project.name,
      category: data.category,
      description: data.description,
      priority: data.priority,
      startDate: data.startDate,
      dueDate: data.dueDate,
      attachments: [],
      assignedEmployee: data.assignedEmployee,
      status: data.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy,
      taskType: data.taskType,
      parentTaskId: data.parentTaskId,
    };

    // If it's a sub task, set the parent task title
    if (data.taskType === 'sub' && data.parentTaskId) {
      const parentTask = this.tasks.find(t => t.id === data.parentTaskId);
      if (parentTask) {
        newTask.parentTaskTitle = parentTask.title;
      }
    }

    this.tasks.push(newTask);
    return newTask;
  }

  // Update task
  async updateTask(id: string, data: Partial<TaskFormData>): Promise<Task> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    const updatedTask = {
      ...this.tasks[taskIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    // Update project name if project ID changed
    if (data.projectId && data.projectId !== this.tasks[taskIndex].projectId) {
      const project = mockProjects.find(p => p.id === data.projectId);
      if (project) {
        updatedTask.projectName = project.name;
      }
    }

    // Set completed date if status changed to completed
    if (data.status === 'completed' && this.tasks[taskIndex].status !== 'completed') {
      updatedTask.completedAt = new Date().toISOString();
    }

    this.tasks[taskIndex] = updatedTask;
    return updatedTask;
  }

  // Delete task
  async deleteTask(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    this.tasks.splice(taskIndex, 1);
  }

  // Get task statistics
  async getTaskStats() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const total = this.tasks.length;
    const pending = this.tasks.filter(t => t.status === 'pending').length;
    const inProgress = this.tasks.filter(t => t.status === 'in_progress').length;
    const completed = this.tasks.filter(t => t.status === 'completed').length;
    const rejected = this.tasks.filter(t => t.status === 'rejected').length;
    const overdue = this.tasks.filter(t => 
      new Date(t.dueDate) < new Date() && t.status !== 'completed'
    ).length;

    return {
      total,
      pending,
      inProgress,
      completed,
      rejected,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  // Search tasks
  async searchTasks(query: string): Promise<Task[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const lowercaseQuery = query.toLowerCase();
    
    return this.tasks.filter(task => 
      task.title.toLowerCase().includes(lowercaseQuery) ||
      task.description.toLowerCase().includes(lowercaseQuery) ||
      task.projectName.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Get tasks by priority
  async getTasksByPriority(priority: TaskPriority): Promise<Task[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.tasks.filter(task => task.priority === priority);
  }

  // Get tasks by status
  async getTasksByStatus(status: TaskStatus): Promise<Task[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.tasks.filter(task => task.status === status);
  }

  // Get overdue tasks
  async getOverdueTasks(): Promise<Task[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.tasks.filter(task => 
      new Date(task.dueDate) < new Date() && task.status !== 'completed'
    );
  }

  // Get main tasks only
  async getMainTasks(): Promise<Task[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.tasks.filter(task => task.taskType === 'main');
  }

  // Get sub tasks only
  async getSubTasks(): Promise<Task[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.tasks.filter(task => task.taskType === 'sub');
  }

  // Get sub tasks for a specific main task
  async getSubTasksForMainTask(mainTaskId: string): Promise<Task[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.tasks.filter(task => 
      task.taskType === 'sub' && task.parentTaskId === mainTaskId
    );
  }

  // Get main tasks that can be used as parent tasks
  async getAvailableMainTasks(): Promise<Task[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.tasks.filter(task => task.taskType === 'main');
  }
}

export const taskService = TaskService.getInstance();
