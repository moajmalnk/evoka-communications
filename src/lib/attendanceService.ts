import { 
  AttendanceRecord, 
  AttendanceFormData, 
  AttendanceStatus, 
  LeaveRequest, 
  LeaveFormData, 
  LeaveStatus, 
  LeaveCategory,
  AttendanceStats 
} from '@/types/attendance';
import { mockEmployees } from './taskService';

// Mock leave categories
export const mockLeaveCategories: LeaveCategory[] = [
  {
    id: 'annual',
    name: 'Annual Leave',
    description: 'Regular annual vacation days',
    maxDays: 25,
    color: '#10b981',
    isActive: true,
    requiresApproval: true,
  },
  {
    id: 'sick',
    name: 'Sick Leave',
    description: 'Medical and health-related leave',
    maxDays: 15,
    color: '#ef4444',
    isActive: true,
    requiresApproval: false,
  },
  {
    id: 'personal',
    name: 'Personal Leave',
    description: 'Personal and family matters',
    maxDays: 10,
    color: '#8b5cf6',
    isActive: true,
    requiresApproval: true,
  },
  {
    id: 'maternity',
    name: 'Maternity Leave',
    description: 'Maternity and parental leave',
    maxDays: 90,
    color: '#ec4899',
    isActive: true,
    requiresApproval: true,
  },
  {
    id: 'bereavement',
    name: 'Bereavement Leave',
    description: 'Loss of family member',
    maxDays: 5,
    color: '#6b7280',
    isActive: true,
    requiresApproval: false,
  },
];

// Mock attendance data
export const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: 'att-1',
    employeeId: 'emp-1',
    employeeName: 'John Doe',
    date: '2024-01-29',
    checkIn: '09:00',
    checkOut: '18:30',
    totalHours: 9.5,
    status: 'present',
    notes: '',
    location: 'Office',
    ipAddress: '192.168.1.100',
    deviceInfo: 'Desktop - Chrome',
    createdAt: '2024-01-29T09:00:00Z',
    updatedAt: '2024-01-29T18:30:00Z',
  },
  {
    id: 'att-2',
    employeeId: 'emp-2',
    employeeName: 'Jane Smith',
    date: '2024-01-29',
    checkIn: '08:45',
    checkOut: '17:45',
    totalHours: 9.0,
    status: 'present',
    notes: '',
    location: 'Office',
    ipAddress: '192.168.1.101',
    deviceInfo: 'Desktop - Firefox',
    createdAt: '2024-01-29T08:45:00Z',
    updatedAt: '2024-01-29T17:45:00Z',
  },
  {
    id: 'att-3',
    employeeId: 'emp-3',
    employeeName: 'Mike Johnson',
    date: '2024-01-29',
    checkIn: '10:15',
    checkOut: '19:00',
    totalHours: 8.75,
    status: 'late',
    notes: 'Traffic delay',
    location: 'Office',
    ipAddress: '192.168.1.102',
    deviceInfo: 'Mobile - Safari',
    createdAt: '2024-01-29T10:15:00Z',
    updatedAt: '2024-01-29T19:00:00Z',
  },
  {
    id: 'att-4',
    employeeId: 'emp-4',
    employeeName: 'Sarah Wilson',
    date: '2024-01-29',
    checkIn: '',
    checkOut: '',
    totalHours: 0,
    status: 'absent',
    notes: 'Sick leave',
    location: '',
    createdAt: '2024-01-29T00:00:00Z',
    updatedAt: '2024-01-29T00:00:00Z',
  },
  {
    id: 'att-5',
    employeeId: 'emp-5',
    employeeName: 'David Brown',
    date: '2024-01-29',
    checkIn: '09:30',
    checkOut: '14:30',
    totalHours: 5.0,
    status: 'half_day',
    notes: 'Personal appointment',
    location: 'Office',
    ipAddress: '192.168.1.103',
    deviceInfo: 'Desktop - Edge',
    createdAt: '2024-01-29T09:30:00Z',
    updatedAt: '2024-01-29T14:30:00Z',
  },
  {
    id: 'att-6',
    employeeId: 'emp-6',
    employeeName: 'Emily Davis',
    date: '2024-01-29',
    checkIn: '08:30',
    checkOut: '17:30',
    totalHours: 9.0,
    status: 'remote',
    notes: 'Working from home',
    location: 'Remote',
    ipAddress: '203.0.113.1',
    deviceInfo: 'Laptop - Chrome',
    createdAt: '2024-01-29T08:30:00Z',
    updatedAt: '2024-01-29T17:30:00Z',
  },
];

// Mock leave requests
export const mockLeaveRequests: LeaveRequest[] = [
  {
    id: 'leave-1',
    employeeId: 'emp-4',
    employeeName: 'Sarah Wilson',
    leaveType: 'sick',
    startDate: '2024-01-29',
    endDate: '2024-01-30',
    totalDays: 2,
    reason: 'Not feeling well, doctor appointment scheduled',
    status: 'hr_approved',
    requestedAt: '2024-01-28T16:00:00Z',
    hrApproval: {
      approved: true,
      approvedBy: 'hr-1',
      approvedAt: '2024-01-28T17:00:00Z',
      comments: 'Approved - Get well soon',
    },
    createdAt: '2024-01-28T16:00:00Z',
    updatedAt: '2024-01-28T17:00:00Z',
  },
  {
    id: 'leave-2',
    employeeId: 'emp-1',
    employeeName: 'John Doe',
    leaveType: 'annual',
    startDate: '2024-02-15',
    endDate: '2024-02-20',
    totalDays: 6,
    reason: 'Family vacation',
    status: 'coordinator_approved',
    requestedAt: '2024-01-25T10:00:00Z',
    coordinatorApproval: {
      approved: true,
      approvedBy: 'coord-1',
      approvedAt: '2024-01-26T14:00:00Z',
      comments: 'Approved - Enjoy your vacation',
    },
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-01-26T14:00:00Z',
  },
  {
    id: 'leave-3',
    employeeId: 'emp-3',
    employeeName: 'Mike Johnson',
    leaveType: 'personal',
    startDate: '2024-02-01',
    endDate: '2024-02-01',
    totalDays: 1,
    reason: 'Family event',
    status: 'pending',
    requestedAt: '2024-01-27T15:00:00Z',
    createdAt: '2024-01-27T15:00:00Z',
    updatedAt: '2024-01-27T15:00:00Z',
  },
];

class AttendanceService {
  private static instance: AttendanceService;
  private attendanceRecords: AttendanceRecord[] = [...mockAttendanceRecords];
  private leaveRequests: LeaveRequest[] = [...mockLeaveRequests];

  static getInstance() {
    if (!AttendanceService.instance) {
      AttendanceService.instance = new AttendanceService();
    }
    return AttendanceService.instance;
  }

  // Generate unique attendance record ID
  private generateAttendanceId(): string {
    const lastRecord = this.attendanceRecords[this.attendanceRecords.length - 1];
    if (!lastRecord) return 'att-1';
    
    const lastNumber = parseInt(lastRecord.id.substring(4));
    const nextNumber = lastNumber + 1;
    return `att-${nextNumber}`;
  }

  // Generate unique leave request ID
  private generateLeaveId(): string {
    const lastRequest = this.leaveRequests[this.leaveRequests.length - 1];
    if (!lastRequest) return 'leave-1';
    
    const lastNumber = parseInt(lastRequest.id.substring(6));
    const nextNumber = lastNumber + 1;
    return `leave-${nextNumber}`;
  }

  // Get all attendance records
  async getAttendanceRecords(): Promise<AttendanceRecord[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.attendanceRecords];
  }

  // Get attendance record by ID
  async getAttendanceRecordById(id: string): Promise<AttendanceRecord | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.attendanceRecords.find(record => record.id === id) || null;
  }

  // Get attendance records by employee
  async getAttendanceRecordsByEmployee(employeeId: string): Promise<AttendanceRecord[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.attendanceRecords.filter(record => record.employeeId === employeeId);
  }

  // Get attendance records by date
  async getAttendanceRecordsByDate(date: string): Promise<AttendanceRecord[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.attendanceRecords.filter(record => record.date === date);
  }

  // Create new attendance record
  async createAttendanceRecord(data: AttendanceFormData): Promise<AttendanceRecord> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const employee = mockEmployees.find(e => e.id === data.employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Calculate total hours
    let totalHours = 0;
    let status: AttendanceStatus = 'absent';

    if (data.checkIn && data.checkOut) {
      const checkInTime = new Date(`2000-01-01T${data.checkIn}`);
      const checkOutTime = new Date(`2000-01-01T${data.checkOut}`);
      totalHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

      // Determine status based on hours and check-in time
      if (totalHours >= 8) {
        const standardCheckIn = new Date(`2000-01-01T09:00`);
        if (checkInTime > standardCheckIn) {
          status = 'late';
        } else {
          status = 'present';
        }
      } else if (totalHours >= 4) {
        status = 'half_day';
      } else {
        status = 'present';
      }
    }

    const newRecord: AttendanceRecord = {
      id: this.generateAttendanceId(),
      employeeId: data.employeeId,
      employeeName: employee.name,
      date: data.date,
      checkIn: data.checkIn || '',
      checkOut: data.checkOut || '',
      totalHours,
      status,
      notes: data.notes,
      location: data.location || 'Office',
      ipAddress: '192.168.1.100', // Mock IP
      deviceInfo: 'Desktop - Chrome', // Mock device info
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.attendanceRecords.push(newRecord);
    return newRecord;
  }

  // Update attendance record
  async updateAttendanceRecord(id: string, data: Partial<AttendanceFormData>): Promise<AttendanceRecord> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const recordIndex = this.attendanceRecords.findIndex(record => record.id === id);
    if (recordIndex === -1) {
      throw new Error('Attendance record not found');
    }

    const updatedRecord = { ...this.attendanceRecords[recordIndex] };

    // Update fields if provided
    if (data.checkIn !== undefined) updatedRecord.checkIn = data.checkIn;
    if (data.checkOut !== undefined) updatedRecord.checkOut = data.checkOut;
    if (data.notes !== undefined) updatedRecord.notes = data.notes;
    if (data.location !== undefined) updatedRecord.location = data.location;

    // Recalculate total hours and status
    if (data.checkIn || data.checkOut) {
      if (updatedRecord.checkIn && updatedRecord.checkOut) {
        const checkInTime = new Date(`2000-01-01T${updatedRecord.checkIn}`);
        const checkOutTime = new Date(`2000-01-01T${updatedRecord.checkOut}`);
        updatedRecord.totalHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

        // Determine status based on hours and check-in time
        if (updatedRecord.totalHours >= 8) {
          const standardCheckIn = new Date(`2000-01-01T09:00`);
          if (checkInTime > standardCheckIn) {
            updatedRecord.status = 'late';
          } else {
            updatedRecord.status = 'present';
          }
        } else if (updatedRecord.totalHours >= 4) {
          updatedRecord.status = 'half_day';
        } else {
          updatedRecord.status = 'present';
        }
      } else {
        updatedRecord.totalHours = 0;
        updatedRecord.status = 'absent';
      }
    }

    updatedRecord.updatedAt = new Date().toISOString();

    this.attendanceRecords[recordIndex] = updatedRecord;
    return updatedRecord;
  }

  // Delete attendance record
  async deleteAttendanceRecord(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const recordIndex = this.attendanceRecords.findIndex(record => record.id === id);
    if (recordIndex === -1) {
      throw new Error('Attendance record not found');
    }

    this.attendanceRecords.splice(recordIndex, 1);
  }

  // Bulk import attendance records from CSV
  async bulkImportAttendance(csvData: string): Promise<{ success: number; errors: string[] }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const lines = csvData.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    const records = lines.slice(1);
    
    let successCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < records.length; i++) {
      try {
        const values = records[i].split(',').map(v => v.trim());
        const recordData: any = {};
        
        headers.forEach((header, index) => {
          recordData[header] = values[index] || '';
        });

        // Validate required fields
        if (!recordData.employeeId || !recordData.date) {
          errors.push(`Row ${i + 2}: Missing required fields`);
          continue;
        }

        // Create attendance record
        await this.createAttendanceRecord({
          employeeId: recordData.employeeId,
          date: recordData.date,
          checkIn: recordData.checkIn || '',
          checkOut: recordData.checkOut || '',
          notes: recordData.notes || '',
          location: recordData.location || 'Office',
        });

        successCount++;
      } catch (error) {
        errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { success: successCount, errors };
  }

  // Get attendance statistics
  async getAttendanceStats(): Promise<AttendanceStats> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const totalEmployees = mockEmployees.length;
    const present = this.attendanceRecords.filter(r => r.status === 'present').length;
    const absent = this.attendanceRecords.filter(r => r.status === 'absent').length;
    const late = this.attendanceRecords.filter(r => r.status === 'late').length;
    const halfDay = this.attendanceRecords.filter(r => r.status === 'half_day').length;
    const remote = this.attendanceRecords.filter(r => r.status === 'remote').length;
    const onLeave = this.attendanceRecords.filter(r => r.status === 'on_leave').length;

    const totalHours = this.attendanceRecords.reduce((sum, r) => sum + r.totalHours, 0);
    const averageHours = this.attendanceRecords.length > 0 ? totalHours / this.attendanceRecords.length : 0;

    return {
      totalEmployees,
      present,
      absent,
      late,
      halfDay,
      remote,
      onLeave,
      attendanceRate: totalEmployees > 0 ? Math.round(((present + late + halfDay + remote) / totalEmployees) * 100) : 0,
      averageHours: Math.round(averageHours * 100) / 100,
    };
  }

  // Get all leave requests
  async getLeaveRequests(): Promise<LeaveRequest[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.leaveRequests];
  }

  // Get leave request by ID
  async getLeaveRequestById(id: string): Promise<LeaveRequest | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.leaveRequests.find(request => request.id === id) || null;
  }

  // Get leave requests by employee
  async getLeaveRequestsByEmployee(employeeId: string): Promise<LeaveRequest[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.leaveRequests.filter(request => request.employeeId === employeeId);
  }

  // Create new leave request
  async createLeaveRequest(data: LeaveFormData, employeeId: string): Promise<LeaveRequest> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('Creating leave request for employee ID:', employeeId);
    console.log('Available employees:', mockEmployees.map(e => e.id));
    
    // Handle ID mismatch between auth system and mock employees
    let employee = mockEmployees.find(e => e.id === employeeId);
    
    // If not found, try to map auth user ID to employee ID
    if (!employee) {
      const authToEmployeeMap: { [key: string]: string } = {
        '1': 'emp-1', // admin -> emp-1
        '2': 'emp-2', // general_manager -> emp-2
        '3': 'emp-3', // project_coordinator -> emp-3
        '4': 'emp-4', // employee -> emp-4
        '5': 'emp-5', // hr -> emp-5
      };
      
      const mappedEmployeeId = authToEmployeeMap[employeeId];
      if (mappedEmployeeId) {
        employee = mockEmployees.find(e => e.id === mappedEmployeeId);
      }
    }
    
    // If still not found, create a default employee entry
    if (!employee) {
      employee = {
        id: employeeId,
        name: 'Current User',
        role: 'employee',
        department: 'General'
      };
    }

    // Calculate total days
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const newRequest: LeaveRequest = {
      id: this.generateLeaveId(),
      employeeId,
      employeeName: employee.name,
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      totalDays,
      reason: data.reason,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      attachments: data.attachments,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.leaveRequests.push(newRequest);
    return newRequest;
  }

  // Update leave request
  async updateLeaveRequest(leaveId: string, data: Partial<LeaveFormData>): Promise<LeaveRequest> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const requestIndex = this.leaveRequests.findIndex(request => request.id === leaveId);
    if (requestIndex === -1) {
      throw new Error('Leave request not found');
    }

    const existingRequest = this.leaveRequests[requestIndex];
    
    // Only allow editing if status is pending or coordinator approved
    if (existingRequest.status !== 'pending' && existingRequest.status !== 'coordinator_approved') {
      throw new Error('Cannot edit leave request in current status');
    }

    // Calculate total days if dates are provided
    let totalDays = existingRequest.totalDays;
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }

    const updatedRequest: LeaveRequest = {
      ...existingRequest,
      leaveType: data.leaveType || existingRequest.leaveType,
      startDate: data.startDate || existingRequest.startDate,
      endDate: data.endDate || existingRequest.endDate,
      totalDays,
      reason: data.reason || existingRequest.reason,
      attachments: data.attachments || existingRequest.attachments,
      updatedAt: new Date().toISOString(),
    };

    this.leaveRequests[requestIndex] = updatedRequest;
    return updatedRequest;
  }

  // Approve leave request (Project Coordinator)
  async approveLeaveRequestByCoordinator(leaveId: string, approved: boolean, coordinatorId: string, comments?: string): Promise<LeaveRequest> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const requestIndex = this.leaveRequests.findIndex(request => request.id === leaveId);
    if (requestIndex === -1) {
      throw new Error('Leave request not found');
    }

    const updatedRequest = { ...this.leaveRequests[requestIndex] };
    
    updatedRequest.coordinatorApproval = {
      approved,
      approvedBy: coordinatorId,
      approvedAt: new Date().toISOString(),
      comments,
    };

    updatedRequest.status = approved ? 'coordinator_approved' : 'rejected';
    updatedRequest.updatedAt = new Date().toISOString();

    this.leaveRequests[requestIndex] = updatedRequest;
    return updatedRequest;
  }

  // Approve leave request (HR)
  async approveLeaveRequestByHR(leaveId: string, approved: boolean, hrId: string, comments?: string): Promise<LeaveRequest> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const requestIndex = this.leaveRequests.findIndex(request => request.id === leaveId);
    if (requestIndex === -1) {
      throw new Error('Leave request not found');
    }

    const updatedRequest = { ...this.leaveRequests[requestIndex] };
    
    updatedRequest.hrApproval = {
      approved,
      approvedBy: hrId,
      approvedAt: new Date().toISOString(),
      comments,
    };

    updatedRequest.status = approved ? 'hr_approved' : 'rejected';
    updatedRequest.updatedAt = new Date().toISOString();

    this.leaveRequests[requestIndex] = updatedRequest;
    return updatedRequest;
  }

  // Get leave categories
  async getLeaveCategories(): Promise<LeaveCategory[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [...mockLeaveCategories];
  }
}

export const attendanceService = AttendanceService.getInstance();
