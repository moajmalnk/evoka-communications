import { WorkSubmission, WorkSubmissionFormData, WorkSubmissionStatus, WorkSubmissionReview } from '@/types/workSubmission';
import { mockTasks, mockEmployees } from './taskService';
import { mockProjects } from './projectService';

// Mock coordinators
const mockCoordinators = [
  { id: 'coord-1', name: 'Alice Johnson', role: 'project_coordinator' },
  { id: 'coord-2', name: 'Bob Smith', role: 'project_coordinator' },
  { id: 'coord-3', name: 'Carol Davis', role: 'project_coordinator' },
  { id: 'coord-4', name: 'David Wilson', role: 'project_coordinator' },
  { id: 'coord-5', name: 'Emma Brown', role: 'project_coordinator' },
];

// Mock work submissions data
export const mockWorkSubmissions: WorkSubmission[] = [
  {
    id: 'WS-001',
    taskId: 'T-001',
    taskTitle: 'Design Homepage Wireframes',
    projectId: 'P-001',
    projectName: 'Website Redesign',
    employeeId: 'emp-1',
    employeeName: 'John Doe',
    coordinatorId: 'coord-1',
    coordinatorName: 'Alice Johnson',
    title: 'Homepage Wireframes Completed',
    description: 'Completed wireframes for all homepage sections including hero, features, and footer. The design follows modern UI/UX principles with responsive layouts and accessibility considerations.',
    timeSpent: 8.5,
    attachments: [
      {
        id: 'att-1',
        name: 'wireframes-v1.pdf',
        url: '/attachments/wireframes-v1.pdf',
        size: 5242880,
        type: 'application/pdf',
        uploadedAt: '2024-01-20T14:30:00Z',
      },
      {
        id: 'att-2',
        name: 'design-notes.txt',
        url: '/attachments/design-notes.txt',
        size: 2048,
        type: 'text/plain',
        uploadedAt: '2024-01-20T14:30:00Z',
      },
    ],
    submissionDate: '2024-01-20T14:30:00Z',
    status: 'pending_review',
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
  },
  {
    id: 'WS-002',
    taskId: 'T-002',
    taskTitle: 'Setup Database Schema',
    projectId: 'P-002',
    projectName: 'Mobile App Development',
    employeeId: 'emp-2',
    employeeName: 'Jane Smith',
    coordinatorId: 'coord-2',
    coordinatorName: 'Bob Smith',
    title: 'Database Schema Implementation',
    description: 'Successfully implemented the complete database schema with all required tables and relationships. Includes proper indexing, constraints, and documentation for future development.',
    timeSpent: 12.0,
    attachments: [
      {
        id: 'att-3',
        name: 'schema.sql',
        url: '/attachments/schema.sql',
        size: 1048576,
        type: 'application/sql',
        uploadedAt: '2024-01-19T16:45:00Z',
      },
      {
        id: 'att-4',
        name: 'database-documentation.md',
        url: '/attachments/database-documentation.md',
        size: 8192,
        type: 'text/markdown',
        uploadedAt: '2024-01-19T16:45:00Z',
      },
    ],
    submissionDate: '2024-01-19T16:45:00Z',
    status: 'approved',
    reviewDate: '2024-01-20T10:15:00Z',
    reviewedBy: 'coord-2',
    reviewerRole: 'project_coordinator',
    feedback: 'Excellent work on the database schema. Well-structured and properly documented. Ready for development phase.',
    createdAt: '2024-01-19T16:45:00Z',
    updatedAt: '2024-01-20T10:15:00Z',
  },
  {
    id: 'WS-003',
    taskId: 'T-003',
    taskTitle: 'Create Brand Guidelines',
    projectId: 'P-003',
    projectName: 'Brand Identity Design',
    employeeId: 'emp-6',
    employeeName: 'Emily Davis',
    coordinatorId: 'coord-3',
    coordinatorName: 'Carol Davis',
    title: 'Brand Guidelines Document',
    description: 'Created comprehensive brand guidelines including logo usage, color palette, typography, and brand voice guidelines. All assets are properly organized and ready for client review.',
    timeSpent: 16.0,
    attachments: [
      {
        id: 'att-5',
        name: 'brand-guidelines.pdf',
        url: '/attachments/brand-guidelines.pdf',
        size: 10485760,
        type: 'application/pdf',
        uploadedAt: '2024-01-18T11:20:00Z',
      },
      {
        id: 'att-6',
        name: 'logo-files.zip',
        url: '/attachments/logo-files.zip',
        size: 20971520,
        type: 'application/zip',
        uploadedAt: '2024-01-18T11:20:00Z',
      },
    ],
    submissionDate: '2024-01-18T11:20:00Z',
    status: 'needs_revision',
    reviewDate: '2024-01-19T14:30:00Z',
    reviewedBy: 'coord-3',
    reviewerRole: 'project_coordinator',
    feedback: 'Great work overall, but client requested additional sections for social media guidelines and brand voice examples. Please add these sections.',
    rejectionReason: 'Missing social media guidelines and brand voice examples',
    createdAt: '2024-01-18T11:20:00Z',
    updatedAt: '2024-01-19T14:30:00Z',
  },
  {
    id: 'WS-004',
    taskId: 'T-004',
    taskTitle: 'Content Strategy Planning',
    projectId: 'P-004',
    projectName: 'Marketing Campaign',
    employeeId: 'emp-3',
    employeeName: 'Mike Johnson',
    coordinatorId: 'coord-4',
    coordinatorName: 'David Wilson',
    title: 'Content Strategy Draft',
    description: 'Initial draft of content strategy focusing on social media and email campaigns. Includes content calendar, messaging framework, and distribution channels.',
    timeSpent: 6.0,
    attachments: [
      {
        id: 'att-7',
        name: 'strategy-draft.docx',
        url: '/attachments/strategy-draft.docx',
        size: 1572864,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        uploadedAt: '2024-01-17T09:15:00Z',
      },
    ],
    submissionDate: '2024-01-17T09:15:00Z',
    status: 'rejected',
    reviewDate: '2024-01-18T16:45:00Z',
    reviewedBy: 'coord-4',
    reviewerRole: 'project_coordinator',
    feedback: 'The strategy lacks depth and doesn\'t align with the client\'s target audience. Please revise with more detailed audience analysis and competitive research.',
    rejectionReason: 'Strategy lacks depth and audience alignment',
    createdAt: '2024-01-17T09:15:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
  },
  {
    id: 'WS-005',
    taskId: 'T-005',
    taskTitle: 'Frontend Component Development',
    projectId: 'P-001',
    projectName: 'Website Redesign',
    employeeId: 'emp-7',
    employeeName: 'Alex Turner',
    coordinatorId: 'coord-1',
    coordinatorName: 'Alice Johnson',
    title: 'React Components Implementation',
    description: 'Developed reusable React components for the website including navigation, forms, and interactive elements. All components are responsive and follow accessibility guidelines.',
    timeSpent: 14.5,
    attachments: [
      {
        id: 'att-8',
        name: 'components-library.zip',
        url: '/attachments/components-library.zip',
        size: 5242880,
        type: 'application/zip',
        uploadedAt: '2024-01-21T15:20:00Z',
      },
      {
        id: 'att-9',
        name: 'component-docs.md',
        url: '/attachments/component-docs.md',
        size: 4096,
        type: 'text/markdown',
        uploadedAt: '2024-01-21T15:20:00Z',
      },
    ],
    submissionDate: '2024-01-21T15:20:00Z',
    status: 'pending_review',
    createdAt: '2024-01-21T15:20:00Z',
    updatedAt: '2024-01-21T15:20:00Z',
  },
];

class WorkSubmissionService {
  private static instance: WorkSubmissionService;
  private submissions: WorkSubmission[] = [...mockWorkSubmissions];

  static getInstance() {
    if (!WorkSubmissionService.instance) {
      WorkSubmissionService.instance = new WorkSubmissionService();
    }
    return WorkSubmissionService.instance;
  }

  // Generate unique work submission ID
  private generateSubmissionId(): string {
    const lastSubmission = this.submissions[this.submissions.length - 1];
    if (!lastSubmission) return 'WS-001';
    
    const lastNumber = parseInt(lastSubmission.id.substring(3));
    const nextNumber = lastNumber + 1;
    return `WS-${nextNumber.toString().padStart(3, '0')}`;
  }

  // Get all work submissions
  async getWorkSubmissions(): Promise<WorkSubmission[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.submissions];
  }

  // Get work submission by ID
  async getWorkSubmissionById(id: string): Promise<WorkSubmission | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.submissions.find(submission => submission.id === id) || null;
  }

  // Get work submissions by employee
  async getWorkSubmissionsByEmployee(employeeId: string): Promise<WorkSubmission[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.submissions.filter(submission => submission.employeeId === employeeId);
  }

  // Get work submissions by project
  async getWorkSubmissionsByProject(projectId: string): Promise<WorkSubmission[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.submissions.filter(submission => submission.projectId === projectId);
  }

  // Get work submissions by coordinator
  async getWorkSubmissionsByCoordinator(coordinatorId: string): Promise<WorkSubmission[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.submissions.filter(submission => submission.coordinatorId === coordinatorId);
  }

  // Create new work submission
  async createWorkSubmission(data: WorkSubmissionFormData, employeeId: string): Promise<WorkSubmission> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const task = mockTasks.find(t => t.id === data.taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const project = mockProjects.find(p => p.id === task.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const employee = mockEmployees.find(e => e.id === employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    const coordinator = mockCoordinators.find(c => c.id === task.createdBy);
    if (!coordinator) {
      throw new Error('Project coordinator not found');
    }

    const newSubmission: WorkSubmission = {
      id: this.generateSubmissionId(),
      taskId: data.taskId,
      taskTitle: task.title,
      projectId: task.projectId,
      projectName: project.name,
      employeeId,
      employeeName: employee.name,
      coordinatorId: task.createdBy,
      coordinatorName: coordinator.name,
      title: data.title,
      description: data.description,
      timeSpent: data.timeSpent,
      attachments: data.attachments,
      submissionDate: new Date().toISOString(),
      status: 'pending_review',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.submissions.push(newSubmission);
    return newSubmission;
  }

  // Review work submission
  async reviewWorkSubmission(submissionId: string, review: WorkSubmissionReview, reviewerId: string, reviewerRole: string): Promise<WorkSubmission> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const submissionIndex = this.submissions.findIndex(s => s.id === submissionId);
    if (submissionIndex === -1) {
      throw new Error('Work submission not found');
    }

    const updatedSubmission = {
      ...this.submissions[submissionIndex],
      status: review.status,
      reviewDate: new Date().toISOString(),
      reviewedBy: reviewerId,
      reviewerRole,
      feedback: review.feedback,
      rejectionReason: review.rejectionReason,
      updatedAt: new Date().toISOString(),
    };

    this.submissions[submissionIndex] = updatedSubmission;
    return updatedSubmission;
  }

  // Delete work submission
  async deleteWorkSubmission(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const submissionIndex = this.submissions.findIndex(s => s.id === id);
    if (submissionIndex === -1) {
      throw new Error('Work submission not found');
    }

    this.submissions.splice(submissionIndex, 1);
  }

  // Get work submission statistics
  async getWorkSubmissionStats() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const total = this.submissions.length;
    const pendingReview = this.submissions.filter(s => s.status === 'pending_review').length;
    const approved = this.submissions.filter(s => s.status === 'approved').length;
    const rejected = this.submissions.filter(s => s.status === 'rejected').length;
    const needsRevision = this.submissions.filter(s => s.status === 'needs_revision').length;

    return {
      total,
      pendingReview,
      approved,
      rejected,
      needsRevision,
      approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
    };
  }

  // Search work submissions
  async searchWorkSubmissions(query: string): Promise<WorkSubmission[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const lowercaseQuery = query.toLowerCase();
    
    return this.submissions.filter(submission => 
      submission.title.toLowerCase().includes(lowercaseQuery) ||
      submission.description.toLowerCase().includes(lowercaseQuery) ||
      submission.projectName.toLowerCase().includes(lowercaseQuery) ||
      submission.employeeName.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Get work submissions by status
  async getWorkSubmissionsByStatus(status: WorkSubmissionStatus): Promise<WorkSubmission[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.submissions.filter(submission => submission.status === status);
  }

  // Get pending review submissions
  async getPendingReviewSubmissions(): Promise<WorkSubmission[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.submissions.filter(submission => submission.status === 'pending_review');
  }
}

export const workSubmissionService = WorkSubmissionService.getInstance();
