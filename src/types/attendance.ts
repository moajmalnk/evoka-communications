export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  totalHours: number;
  status: AttendanceStatus;
  notes?: string;
  location?: string;
  ipAddress?: string;
  deviceInfo?: string;
  createdAt: string;
  updatedAt: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'remote' | 'on_leave';

export interface AttendanceFormData {
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  notes?: string;
  location?: string;
}

export interface AttendanceFilters {
  searchTerm: string;
  status: string;
  employee: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  requestedAt: string;
  coordinatorApproval?: {
    approved: boolean;
    approvedBy: string;
    approvedAt: string;
    comments?: string;
  };
  hrApproval?: {
    approved: boolean;
    approvedBy: string;
    approvedAt: string;
    comments?: string;
  };
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export type LeaveStatus = 'pending' | 'coordinator_approved' | 'hr_approved' | 'rejected' | 'cancelled';

export interface LeaveFormData {
  employeeId?: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  attachments?: string[];
}

export interface LeaveCategory {
  id: string;
  name: string;
  description?: string;
  maxDays: number;
  color: string;
  isActive: boolean;
  requiresApproval: boolean;
}

export interface LeaveFilters {
  searchTerm: string;
  status: string;
  leaveType: string;
  employee: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface AttendanceStats {
  totalEmployees: number;
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  remote: number;
  onLeave: number;
  attendanceRate: number;
  averageHours: number;
}
