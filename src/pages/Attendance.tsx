import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Plus, 
  Upload, 
  Filter, 
  Search, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  FileText, 
  CalendarDays, 
  User, 
  RotateCcw,
  GitPullRequestArrow,
  Download,
  Check,
  X,
  MessageCircle,
  UserCheck,
  UserX
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { AttendanceRecord, AttendanceStatus, LeaveRequest, LeaveStatus } from '@/types/attendance';
import { attendanceService, mockLeaveCategories } from '@/lib/attendanceService';
import { mockEmployees } from '@/lib/taskService';
import { AttendanceStats } from '@/components/attendance/AttendanceStats';
import { AttendanceEntryModal } from '@/components/attendance/AttendanceEntryModal';
import { CSVUploadModal } from '@/components/attendance/CSVUploadModal';
import { LeaveRequestModal } from '@/components/attendance/LeaveRequestModal';
import { LeaveRequestEditModal } from '@/components/attendance/LeaveRequestEditModal';
import { useToast } from '@/hooks/use-toast';
import { CustomClock } from '@/components/ui/custom-clock';
import { CustomCalendar } from '@/components/ui/custom-calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Utility functions
const getUserDisplayName = (record: AttendanceRecord | LeaveRequest): string => {
  return record.employeeName || "Unknown User";
};

const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case "admin": return "Admin";
    case "general_manager": return "General Manager";
    case "project_coordinator": return "Project Coordinator";
    case "employee": return "Employee";
    case "hr": return "HR";
    default: return "Unknown Role";
  }
};

// Memoized components
const AttendanceRow = memo(({
  record,
  onEdit,
  onDelete,
  onView,
}: {
  record: AttendanceRecord;
  onEdit: (record: AttendanceRecord) => void;
  onDelete: (record: AttendanceRecord) => void;
  onView: (record: AttendanceRecord) => void;
}) => {
  const getStatusColor = useCallback((status: AttendanceStatus) => {
    switch (status) {
      case "present": return "bg-green-500 text-white";
      case "absent": return "bg-red-500 text-white";
      case "late": return "bg-yellow-500 text-white";
      case "half_day": return "bg-blue-500 text-white";
      case "remote": return "bg-purple-500 text-white";
      case "on_leave": return "bg-gray-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  }, []);

  const getStatusLabel = useCallback((status: AttendanceStatus) => {
    switch (status) {
      case "present": return "Present";
      case "absent": return "Absent";
      case "late": return "Late";
      case "half_day": return "Half Day";
      case "remote": return "Remote";
      case "on_leave": return "On Leave";
      default: return status;
    }
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const userName = getUserDisplayName(record);

  return (
    <TableRow className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => onView(record)}>
      <TableCell>
        <div className="space-y-1">
          <p className="font-medium text-sm">{userName}</p>
          <p className="text-xs text-muted-foreground">{record.employeeId}</p>
        </div>
      </TableCell>
      <TableCell>
        <Badge className={getStatusColor(record.status)}>
          {getStatusLabel(record.status)}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <p className="text-sm">{formatDate(record.date)}</p>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <p className="text-sm font-mono">{record.checkIn || "-"}</p>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <p className="text-sm font-mono">{record.checkOut || "-"}</p>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <p className="text-sm">{record.notes || "-"}</p>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(record); }}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(record); }} className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

AttendanceRow.displayName = "AttendanceRow";

const LeaveRequestRow = memo(({
  leave,
  onView,
  onApprove,
  onReject,
  onDiscussion,
}: {
  leave: LeaveRequest;
  onView: (leave: LeaveRequest) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDiscussion: (id: string) => void;
}) => {
  const getStatusColor = useCallback((status: LeaveStatus) => {
    switch (status) {
      case "hr_approved": return "bg-green-500 text-white";
      case "pending": return "bg-yellow-500 text-white";
      case "rejected": return "bg-red-500 text-white";
      case "coordinator_approved": return "bg-blue-500 text-white";
      case "cancelled": return "bg-gray-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const userName = getUserDisplayName(leave);

  return (
    <TableRow className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => onView(leave)}>
      <TableCell>
        <div className="space-y-1">
          <p className="font-medium text-sm">{userName}</p>
          <p className="text-xs text-muted-foreground">{leave.employeeId}</p>
        </div>
      </TableCell>
      <TableCell>
        <Badge className={getStatusColor(leave.status)}>
          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1).replace('_', ' ')}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <p className="text-sm">{formatDate(leave.startDate)}</p>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <p className="text-sm">{formatDate(leave.endDate)}</p>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <p className="text-sm">{leave.reason}</p>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {(leave.status === "pending" || leave.status === "coordinator_approved") && (
            <>
              <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white" onClick={(e) => { e.stopPropagation(); onApprove(leave.id); }}>
                <Check className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive hover:text-white" onClick={(e) => { e.stopPropagation(); onReject(leave.id); }}>
                <X className="h-4 w-4" />
              </Button>
              {leave.status === "pending" && (
                <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white" onClick={(e) => { e.stopPropagation(); onDiscussion(leave.id); }}>
                  <MessageCircle className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
          {(leave.status === "hr_approved" || leave.status === "rejected" || leave.status === "cancelled") && (
            <Button variant="outline" size="sm" disabled className={
              leave.status === "hr_approved" ? "text-green-600 border-green-600 bg-green-600/10" :
              leave.status === "rejected" ? "text-destructive border-destructive bg-destructive/10" :
              "text-muted-foreground"
            }>
              {leave.status === "hr_approved" ? "Approved" : 
               leave.status === "rejected" ? "Rejected" : 
               leave.status}
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
});

LeaveRequestRow.displayName = "LeaveRequestRow";

export function Attendance() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([
    {
      id: 'ATT-001',
      employeeId: 'emp-1',
      employeeName: 'John Doe',
      date: '2024-12-19',
      checkIn: '09:00',
      checkOut: '17:30',
      totalHours: 8.5,
      status: 'present',
      location: 'Office',
      notes: 'Regular attendance',
      createdAt: '2024-12-19T09:00:00Z',
      updatedAt: '2024-12-19T17:30:00Z',
    },
    {
      id: 'ATT-002',
      employeeId: 'emp-2',
      employeeName: 'Jane Smith',
      date: '2024-12-19',
      checkIn: '08:45',
      checkOut: '18:00',
      totalHours: 9.25,
      status: 'present',
      location: 'Office',
      notes: 'Early arrival',
      createdAt: '2024-12-19T09:00:00Z',
      updatedAt: '2024-12-19T17:30:00Z',
    },
    {
      id: 'ATT-003',
      employeeId: 'emp-3',
      employeeName: 'Mike Johnson',
      date: '2024-12-19',
      checkIn: '09:15',
      checkOut: '17:45',
      totalHours: 8.5,
      status: 'late',
      location: 'Office',
      notes: 'Traffic delay',
      createdAt: '2024-12-19T09:00:00Z',
      updatedAt: '2024-12-19T17:30:00Z',
    },
    {
      id: 'ATT-004',
      employeeId: 'emp-4',
      employeeName: 'Sarah Wilson',
      date: '2024-12-19',
      checkIn: '09:00',
      checkOut: '13:00',
      totalHours: 4.0,
      status: 'half_day',
      location: 'Office',
      notes: 'Medical appointment',
      createdAt: '2024-12-19T09:00:00Z',
      updatedAt: '2024-12-19T17:30:00Z',
    },
    {
      id: 'ATT-005',
      employeeId: 'emp-5',
      employeeName: 'David Brown',
      date: '2024-12-19',
      checkIn: '09:00',
      checkOut: '17:30',
      totalHours: 8.5,
      status: 'remote',
      location: 'Home',
      notes: 'Working from home',
      createdAt: '2024-12-19T09:00:00Z',
      updatedAt: '2024-12-19T17:30:00Z',
    },
    {
      id: 'ATT-006',
      employeeId: 'emp-6',
      employeeName: 'Lisa Davis',
      date: '2024-12-19',
      checkIn: null,
      checkOut: null,
      totalHours: 0,
      status: 'absent',
      location: 'N/A',
      notes: 'Sick leave',
      createdAt: '2024-12-19T09:00:00Z',
      updatedAt: '2024-12-19T17:30:00Z',
    },
    {
      id: 'ATT-007',
      employeeId: 'emp-7',
      employeeName: 'Tom Wilson',
      date: '2024-12-19',
      checkIn: null,
      checkOut: null,
      totalHours: 0,
      status: 'on_leave',
      location: 'N/A',
      notes: 'Annual leave',
      createdAt: '2024-12-19T09:00:00Z',
      updatedAt: '2024-12-19T17:30:00Z',
    },
    {
      id: 'ATT-008',
      employeeId: 'emp-8',
      employeeName: 'Emma Taylor',
      date: '2024-12-19',
      checkIn: '09:30',
      checkOut: '18:00',
      totalHours: 8.5,
      status: 'present',
      location: 'Office',
      notes: 'Client meeting',
      createdAt: '2024-12-19T09:00:00Z',
      updatedAt: '2024-12-19T17:30:00Z',
    },
  ]);
  const [filteredAttendance, setFilteredAttendance] = useState<AttendanceRecord[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    {
      id: 'LR-001',
      employeeId: 'emp-1',
      employeeName: 'John Doe',
      leaveType: 'annual',
      startDate: '2024-12-23',
      endDate: '2024-12-27',
      totalDays: 5,
      reason: 'Family vacation',
      status: 'pending',
      requestedAt: '2024-12-19T09:00:00Z',
      createdAt: '2024-12-19T09:00:00Z',
      updatedAt: '2024-12-19T09:00:00Z',
    },
    {
      id: 'LR-002',
      employeeId: 'emp-2',
      employeeName: 'Jane Smith',
      leaveType: 'sick',
      startDate: '2024-12-20',
      endDate: '2024-12-20',
      totalDays: 1,
      reason: 'Medical appointment',
      status: 'hr_approved',
      requestedAt: '2024-12-18T14:30:00Z',
      hrApproval: {
        approved: true,
        approvedBy: 'HR Manager',
        approvedAt: '2024-12-18T16:00:00Z',
        comments: 'Approved for medical appointment',
      },
      createdAt: '2024-12-18T14:30:00Z',
      updatedAt: '2024-12-18T16:00:00Z',
    },
    {
      id: 'LR-003',
      employeeId: 'emp-3',
      employeeName: 'Mike Johnson',
      leaveType: 'personal',
      startDate: '2024-12-24',
      endDate: '2024-12-24',
      totalDays: 1,
      reason: 'Personal matters',
      status: 'coordinator_approved',
      requestedAt: '2024-12-17T11:15:00Z',
      coordinatorApproval: {
        approved: true,
        approvedBy: 'Project Coordinator',
        approvedAt: '2024-12-17T15:30:00Z',
        comments: 'Approved by coordinator',
      },
      createdAt: '2024-12-17T11:15:00Z',
      updatedAt: '2024-12-17T15:30:00Z',
    },
    {
      id: 'LR-004',
      employeeId: 'emp-4',
      employeeName: 'Sarah Wilson',
      leaveType: 'annual',
      startDate: '2024-12-30',
      endDate: '2025-01-03',
      totalDays: 5,
      reason: 'New Year holiday',
      status: 'pending',
      requestedAt: '2024-12-19T10:45:00Z',
      createdAt: '2024-12-19T10:45:00Z',
      updatedAt: '2024-12-19T10:45:00Z',
    },
    {
      id: 'LR-005',
      employeeId: 'emp-5',
      employeeName: 'David Brown',
      leaveType: 'sick',
      startDate: '2024-12-21',
      endDate: '2024-12-21',
      totalDays: 1,
      reason: 'Flu symptoms',
      status: 'rejected',
      requestedAt: '2024-12-20T08:20:00Z',
      hrApproval: {
        approved: false,
        approvedBy: 'HR Manager',
        approvedAt: '2024-12-20T10:00:00Z',
        comments: 'Please provide medical certificate',
      },
      createdAt: '2024-12-20T08:20:00Z',
      updatedAt: '2024-12-20T10:00:00Z',
    },
    {
      id: 'LR-006',
      employeeId: 'emp-6',
      employeeName: 'Lisa Davis',
      leaveType: 'annual',
      startDate: '2024-12-25',
      endDate: '2024-12-25',
      totalDays: 1,
      reason: 'Christmas Day',
      status: 'hr_approved',
      requestedAt: '2024-12-15T13:00:00Z',
      coordinatorApproval: {
        approved: true,
        approvedBy: 'Project Coordinator',
        approvedAt: '2024-12-15T14:30:00Z',
        comments: 'Coordinator approved',
      },
      hrApproval: {
        approved: true,
        approvedBy: 'HR Manager',
        approvedAt: '2024-12-15T16:00:00Z',
        comments: 'HR approved',
      },
      createdAt: '2024-12-15T13:00:00Z',
      updatedAt: '2024-12-15T16:00:00Z',
    },
    {
      id: 'LR-007',
      employeeId: 'emp-7',
      employeeName: 'Tom Wilson',
      leaveType: 'personal',
      startDate: '2024-12-26',
      endDate: '2024-12-26',
      totalDays: 1,
      reason: 'Personal emergency',
      status: 'pending',
      requestedAt: '2024-12-19T16:30:00Z',
      createdAt: '2024-12-19T16:30:00Z',
      updatedAt: '2024-12-19T16:30:00Z',
    },
    {
      id: 'LR-008',
      employeeId: 'emp-8',
      employeeName: 'Emma Taylor',
      leaveType: 'annual',
      startDate: '2024-12-28',
      endDate: '2024-12-31',
      totalDays: 4,
      reason: 'Year-end break',
      status: 'coordinator_approved',
      requestedAt: '2024-12-16T09:45:00Z',
      coordinatorApproval: {
        approved: true,
        approvedBy: 'Project Coordinator',
        approvedAt: '2024-12-16T11:00:00Z',
        comments: 'Coordinator approved for year-end break',
      },
      createdAt: '2024-12-16T09:45:00Z',
      updatedAt: '2024-12-16T11:00:00Z',
    },
  ]);
  const [leaveBalance] = useState([
    {
      employeeId: 'emp-1',
      employeeName: 'John Doe',
      annualLeave: { total: 25, used: 8, remaining: 17 },
      sickLeave: { total: 10, used: 3, remaining: 7 },
      personalLeave: { total: 5, used: 1, remaining: 4 },
    },
    {
      employeeId: 'emp-2',
      employeeName: 'Jane Smith',
      annualLeave: { total: 25, used: 12, remaining: 13 },
      sickLeave: { total: 10, used: 2, remaining: 8 },
      personalLeave: { total: 5, used: 0, remaining: 5 },
    },
    {
      employeeId: 'emp-3',
      employeeName: 'Mike Johnson',
      annualLeave: { total: 25, used: 15, remaining: 10 },
      sickLeave: { total: 10, used: 1, remaining: 9 },
      personalLeave: { total: 5, used: 2, remaining: 3 },
    },
  ]);
  const [stats, setStats] = useState({
    totalEmployees: 8,
    present: 3,
    absent: 1,
    late: 1,
    halfDay: 1,
    remote: 1,
    onLeave: 1,
    attendanceRate: 87.5,
    averageHours: 6.2,
  });
  
  // Filter states
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [showDateFilters, setShowDateFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent' | 'late' | 'half_day' | 'remote' | 'on_leave'>('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  
  // Tab state
  const [activeTab, setActiveTab] = useState('attendance');
  
  // Modal states
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isLeaveEditModalOpen, setIsLeaveEditModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<LeaveRequest | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load data on component mount
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Using dummy data instead of API calls
      // const [attendanceData, leaveData, statsData] = await Promise.all([
      //   attendanceService.getAttendanceRecords(),
      //   attendanceService.getLeaveRequests(),
      //   attendanceService.getAttendanceStats(),
      // ]);
      
      // setAttendanceRecords(attendanceData);
      // setLeaveRequests(leaveData);
      // setStats(statsData);
      
      // Dummy data is already set in useState for attendanceRecords and leaveRequests
      
      // Dummy data is already set in useState, just set loading to false
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load attendance data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter data based on search and filters
  const filteredAttendanceRecords = useMemo(() => {
    let filtered = attendanceRecords;

    if (searchTerm) {
      filtered = filtered.filter(record => {
        const userName = getUserDisplayName(record);
        return userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               record.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
               record.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
               record.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    if (selectedDate) {
      const selectedDateStr = selectedDate.toISOString().split('T')[0];
      filtered = filtered.filter(record => record.date === selectedDateStr);
    }

    if (fromDate && toDate) {
      const fromDateStr = fromDate.toISOString().split('T')[0];
      const toDateStr = toDate.toISOString().split('T')[0];
      filtered = filtered.filter(record => record.date >= fromDateStr && record.date <= toDateStr);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    if (employeeFilter !== 'all') {
      filtered = filtered.filter(record => record.employeeId === employeeFilter);
    }

    return filtered;
  }, [attendanceRecords, searchTerm, selectedDate, fromDate, toDate, statusFilter, employeeFilter]);

  const filteredLeaveRequests = useMemo(() => {
    let filtered = leaveRequests;

    if (searchTerm) {
      filtered = filtered.filter(request => {
        const userName = getUserDisplayName(request);
        return userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               request.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
               request.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
               request.reason.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    return filtered;
  }, [leaveRequests, searchTerm]);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setEmployeeFilter('all');
    setSelectedDate(undefined);
    setFromDate(undefined);
    setToDate(undefined);
    setCurrentPage(1);
  };

  // Event handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleStatusFilterChange = useCallback((status: typeof statusFilter) => {
    setStatusFilter(status);
    setCurrentPage(1);
  }, []);

  const handleViewRecord = useCallback((record: AttendanceRecord) => {
    toast({ title: "View Record", description: `Viewing attendance record for ${getUserDisplayName(record)}` });
  }, [toast]);

  const handleViewLeave = useCallback((leave: LeaveRequest) => {
    toast({ title: "View Leave", description: `Viewing leave request for ${getUserDisplayName(leave)}` });
  }, [toast]);

  const handleEditAttendance = useCallback((record: AttendanceRecord) => {
    setSelectedRecord(record);
    setModalMode('edit');
    setIsAttendanceModalOpen(true);
  }, []);

  const handleDeleteRecord = useCallback(async (recordId: string) => {
    try {
      await attendanceService.deleteAttendanceRecord(recordId);
      await loadData();
      toast({
        title: 'Success',
        description: 'Attendance record deleted successfully!',
      });
    } catch (error) {
      console.error('Error deleting record:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete attendance record. Please try again.',
        variant: 'destructive',
      });
    }
  }, [loadData, toast]);

  const handleDeleteAttendance = useCallback((record: AttendanceRecord) => {
    handleDeleteRecord(record.id);
  }, [handleDeleteRecord]);

  const handleApproveLeave = useCallback((id: string) => {
    setLeaveRequests(prev => prev.map(leave => 
      leave.id === id ? { ...leave, status: "hr_approved" as const } : leave
    ));
    toast({ title: "Success", description: "Leave request approved" });
  }, [toast]);

  const handleRejectLeave = useCallback((id: string) => {
    setLeaveRequests(prev => prev.map(leave => 
      leave.id === id ? { ...leave, status: "rejected" as const } : leave
    ));
    toast({ title: "Success", description: "Leave request rejected" });
  }, [toast]);

  const handleDiscussionLeave = useCallback((id: string) => {
    setLeaveRequests(prev => prev.map(leave => 
      leave.id === id ? { ...leave, status: "coordinator_approved" as const } : leave
    ));
    toast({ title: "Success", description: "Leave request moved to coordinator approval" });
  }, [toast]);

  // Pagination
  const paginatedAttendanceRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAttendanceRecords.slice(startIndex, startIndex + pageSize);
  }, [filteredAttendanceRecords, currentPage, pageSize]);

  const paginatedLeaveRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredLeaveRequests.slice(startIndex, startIndex + pageSize);
  }, [filteredLeaveRequests, currentPage, pageSize]);

  const handleAttendanceSubmit = async (data: AttendanceRecord) => {
    try {
      setIsSaving(true);
      if (modalMode === 'create') {
        await attendanceService.createAttendanceRecord(data);
        toast({
          title: 'Success',
          description: 'Attendance record created successfully!',
        });
      } else {
        await attendanceService.updateAttendanceRecord(selectedRecord!.id, data);
        toast({
          title: 'Success',
          description: 'Attendance record updated successfully!',
        });
      }
      await loadData();
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast({
        title: 'Error',
        description: 'Failed to save attendance record. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCSVUpload = async (csvData: string) => {
    try {
      const result = await attendanceService.bulkImportAttendance(csvData);
      await loadData();
      
      if (result.success > 0) {
        toast({
          title: 'Success',
          description: `Successfully imported ${result.success} attendance records!`,
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error uploading CSV:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload CSV. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleLeaveSubmit = async (data: LeaveRequest) => {
    try {
      setIsSaving(true);
      // Use employeeId from form data, fallback to user ID if not provided
      const employeeId = data.employeeId || user?.id || '';
      await attendanceService.createLeaveRequest(data, employeeId);
      toast({
        title: 'Success',
        description: 'Leave request submitted successfully!',
      });
      await loadData();
    } catch (error) {
      console.error('Error submitting leave request:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit leave request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditLeaveRequest = (leaveRequest: LeaveRequest) => {
    setSelectedLeaveRequest(leaveRequest);
    setIsLeaveEditModalOpen(true);
  };

  const handleUpdateLeaveRequest = async (data: Partial<LeaveRequest>) => {
    if (!selectedLeaveRequest) return;
    
    try {
      setIsSaving(true);
      await attendanceService.updateLeaveRequest(selectedLeaveRequest.id, data);
      toast({
        title: 'Success',
        description: 'Leave request updated successfully!',
      });
      await loadData();
    } catch (error) {
      console.error('Error updating leave request:', error);
      toast({
        title: 'Error',
        description: 'Failed to update leave request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditRecord = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setModalMode('edit');
    setIsAttendanceModalOpen(true);
  };

  const canManageAttendance = user?.role === 'admin' || user?.role === 'general_manager' || user?.role === 'hr';
  const canEditAttendance = user?.role === 'admin' || user?.role === 'general_manager' || user?.role === 'hr';
  const canDeleteAttendance = user?.role === 'admin' || user?.role === 'general_manager';
  const isEmployee = user?.role === 'employee';

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'late':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'half_day':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'remote':
        return <Calendar className="h-4 w-4 text-purple-600" />;
      case 'on_leave':
        return <CalendarDays className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return 'default';
      case 'absent':
        return 'destructive';
      case 'late':
        return 'secondary';
      case 'half_day':
        return 'outline';
      case 'remote':
        return 'outline';
      case 'on_leave':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return 'text-gray-100';
      case 'absent':
        return 'text-red-700';
      case 'late':
        return 'text-yellow-600';
      case 'half_day':
        return 'text-blue-500';
      case 'remote':
        return 'text-purple-600';
      case 'on_leave':
        return 'text-gray-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusLabel = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return 'Present';
      case 'absent':
        return 'Absent';
      case 'late':
        return 'Late';
      case 'half_day':
        return 'Half Day';
      case 'remote':
        return 'Remote';
      case 'on_leave':
        return 'On Leave';
      default:
        return status;
    }
  };

  const getLeaveStatusVariant = (status: LeaveStatus) => {
    switch (status) {
      case 'pending':
        return 'outline';
      case 'coordinator_approved':
        return 'secondary';
      case 'hr_approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'cancelled':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getLeaveStatusColor = (status: LeaveStatus) => {
    switch (status) {
      case 'pending':
        return 'text-blue-600';
      case 'coordinator_approved':
        return 'text-yellow-600';
      case 'hr_approved':
        return 'text-gray-100';
      case 'rejected':
        return 'text-red-600';
      case 'cancelled':
        return 'text-gray-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getLeaveStatusLabel = (status: LeaveStatus) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'coordinator_approved':
        return 'Coordinator Approved';
      case 'hr_approved':
        return 'HR Approved';
      case 'rejected':
        return 'Rejected';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Attendance Management</h1>
            <p className="text-muted-foreground">
              Monitor employee attendance and working hours
            </p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEmployee ? 'My Attendance' : 'Attendance Management'}
          </h1>
          <p className="text-muted-foreground">
            {isEmployee 
              ? 'Track your work hours and attendance history'
              : `Monitor employee attendance and working hours (${filteredAttendanceRecords.length} records)`
            }
          </p>
        </div>
        <div className="flex gap-2">
          {canManageAttendance && (
            <Button variant="outline" className="gap-2">
              <GitPullRequestArrow className="w-4 h-4" />
              <span className="hidden lg:block">Leave Request</span>
            </Button>
          )}
          {canManageAttendance && (
            <Button className="gap-2" onClick={() => {
              if (activeTab === 'leave-request') {
                setIsLeaveModalOpen(true);
              } else {
                setSelectedRecord(null);
                setModalMode('create');
                setIsAttendanceModalOpen(true);
              }
            }}>
              <Plus className="w-4 h-4" />
              <span className="hidden lg:block">
                {activeTab === 'leave-request' ? 'Request Leave' : 'Mark Attendance'}
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Attendance & Leave Statistics */}
      <AttendanceStats stats={stats} leaveRequests={leaveRequests} activeTab={activeTab} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="attendance">Daily Attendance</TabsTrigger>
          <TabsTrigger value="leave-request">Leave Requests</TabsTrigger>
          <TabsTrigger value="upload">CSV Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Attendance Records</CardTitle>
                  <CardDescription>
                    View and manage attendance records ({filteredAttendanceRecords.length} total, {paginatedAttendanceRecords.length} on this page)
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-stretch gap-2 w-full">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search attendance..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-8 w-full"
                      />
                    </div>
                  </div>
                  <div className="relative flex-1 min-w-[200px]">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {selectedDate ? selectedDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }) : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CustomCalendar
                          date={selectedDate || new Date()}
                          onDateChange={setSelectedDate}
                          variant="inline"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowDateFilters(!showDateFilters)}
                    className="flex-shrink-0 min-w-[100px]"
                  >
                    Filters
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={resetFilters}
                    className="flex-shrink-0 min-w-[100px]"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Date Range Filters */}
            {showDateFilters && (
              <CardContent className="border-t">
                <div className="space-y-4 py-4">
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Date Range Filter</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">From Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal mt-1"
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {fromDate ? fromDate.toLocaleDateString() : 'Select start date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CustomCalendar
                              date={fromDate || new Date()}
                              onDateChange={setFromDate}
                              variant="inline"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">To Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal mt-1"
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {toDate ? toDate.toLocaleDateString() : 'Select end date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CustomCalendar
                              date={toDate || new Date()}
                              onDateChange={setToDate}
                              variant="inline"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>

                  {/* Role and Status Filters */}
                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Filter by Status</Label>
                        <div className="mt-1">
                          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="present">Present</SelectItem>
                              <SelectItem value="absent">Absent</SelectItem>
                              <SelectItem value="late">Late</SelectItem>
                              <SelectItem value="half_day">Half Day</SelectItem>
                              <SelectItem value="remote">Remote</SelectItem>
                              <SelectItem value="on_leave">On Leave</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Filter by Employee</Label>
                        <div className="mt-1">
                          <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select employee" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Employees</SelectItem>
                              {mockEmployees.map((employee) => (
                                <SelectItem key={employee.id} value={employee.id}>
                                  {employee.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}

            <CardContent>
              {paginatedAttendanceRecords.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name & Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time In</TableHead>
                        <TableHead>Time Out</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedAttendanceRecords.map((record) => (
                        <AttendanceRow
                          key={record.id}
                          record={record}
                          onView={handleViewRecord}
                          onEdit={handleEditAttendance}
                          onDelete={handleDeleteAttendance}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No attendance records found matching your search.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="leave-request" className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold">Leave Requests</h3>
            </div>
          </div>
          {paginatedLeaveRequests.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name & Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLeaveRequests.map((leave) => (
                    <LeaveRequestRow
                      key={leave.id}
                      leave={leave}
                      onView={handleViewLeave}
                      onApprove={handleApproveLeave}
                      onReject={handleRejectLeave}
                      onDiscussion={handleDiscussionLeave}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No leave requests found.
              </p>
            </div>
          )}
        </TabsContent>

        {/* CSV Upload Tab */}
        <TabsContent value="upload" className="space-y-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Upload Attendance CSV</CardTitle>
              <CardDescription>
                Upload attendance data using CSV file format with headers: date, employee_id, employee_name, status, check_in, check_out, location, notes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-muted/50 rounded-full">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium">Drop your CSV file here or click to browse</p>
                  </div>
                  <Button variant="outline" className="gap-2" onClick={() => setIsCSVModalOpen(true)}>
                    <Upload className="w-4 h-4" />
                    Choose CSV file
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* Modals */}
      <AttendanceEntryModal
        isOpen={isAttendanceModalOpen}
        onClose={() => {
          setIsAttendanceModalOpen(false);
          setSelectedRecord(null);
        }}
        onSubmit={handleAttendanceSubmit}
        record={selectedRecord}
        mode={modalMode}
      />

      <CSVUploadModal
        isOpen={isCSVModalOpen}
        onClose={() => setIsCSVModalOpen(false)}
        onUpload={handleCSVUpload}
      />

      <LeaveRequestModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onSubmit={handleLeaveSubmit}
      />

      <LeaveRequestEditModal
        leaveRequest={selectedLeaveRequest}
        isOpen={isLeaveEditModalOpen}
        onClose={() => {
          setIsLeaveEditModalOpen(false);
          setSelectedLeaveRequest(null);
        }}
        onSubmit={handleUpdateLeaveRequest}
      />
    </div>
  );
}