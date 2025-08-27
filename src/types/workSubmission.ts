export interface WorkSubmission {
  id: string;
  taskId: string;
  taskTitle: string;
  projectId: string;
  projectName: string;
  employeeId: string;
  employeeName: string;
  coordinatorId: string;
  coordinatorName: string;
  title: string;
  description: string;
  timeSpent: number; // in hours
  attachments: WorkSubmissionAttachment[];
  submissionDate: string;
  status: WorkSubmissionStatus;
  reviewDate?: string;
  reviewedBy?: string;
  reviewerRole?: string;
  feedback?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkSubmissionAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export type WorkSubmissionStatus = 'pending_review' | 'approved' | 'rejected' | 'needs_revision';

export interface WorkSubmissionFormData {
  taskId: string;
  title: string;
  description: string;
  timeSpent: number;
  attachments: WorkSubmissionAttachment[];
}

export interface WorkSubmissionReview {
  submissionId: string;
  status: WorkSubmissionStatus;
  feedback?: string;
  rejectionReason?: string;
}

export interface WorkSubmissionFilters {
  searchTerm: string;
  status: string;
  project: string;
  employee: string;
  coordinator: string;
  dateRange: {
    start: string;
    end: string;
  };
}
