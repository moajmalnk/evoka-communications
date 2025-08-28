import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertTriangle, Plus, Upload, Filter, Search, MoreHorizontal, Eye, Edit, Trash2, FileText, CalendarDays } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useToast } from '@/hooks/use-toast';
import { CustomClock } from '@/components/ui/custom-clock';
import { CustomCalendar } from '@/components/ui/custom-calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function Attendance() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [filteredAttendance, setFilteredAttendance] = useState<AttendanceRecord[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0,
    remote: 0,
    onLeave: 0,
    attendanceRate: 0,
    averageHours: 0,
  });
  
  // Filter states
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Filter data when filters change
  useEffect(() => {
    filterAttendance();
  }, [attendanceRecords, selectedDate, statusFilter, employeeFilter, searchTerm]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [attendanceData, leaveData, statsData] = await Promise.all([
        attendanceService.getAttendanceRecords(),
        attendanceService.getLeaveRequests(),
        attendanceService.getAttendanceStats(),
      ]);
      
      setAttendanceRecords(attendanceData);
      setLeaveRequests(leaveData);
      setStats(statsData);
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
  };

  const filterAttendance = () => {
    let filtered = attendanceRecords;

    // Date filter
    if (selectedDate) {
      filtered = filtered.filter(record => record.date === selectedDate);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    // Employee filter
    if (employeeFilter !== 'all') {
      filtered = filtered.filter(record => record.employeeId === employeeFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAttendance(filtered);
  };

  const handleAttendanceSubmit = async (data: any) => {
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

  const handleLeaveSubmit = async (data: any) => {
    try {
      setIsSaving(true);
      await attendanceService.createLeaveRequest(data, user?.id || '');
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

  const handleEditRecord = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setModalMode('edit');
    setIsAttendanceModalOpen(true);
  };

  const handleDeleteRecord = async (recordId: string) => {
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
        return 'text-green-600';
      case 'absent':
        return 'text-red-600';
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
        return 'text-green-600';
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEmployee ? 'My Attendance' : 'Attendance Management'}
          </h1>
          <p className="text-muted-foreground">
            {isEmployee 
              ? 'Track your work hours and attendance history'
              : 'Monitor employee attendance and working hours'
            }
          </p>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          
          <div className="flex flex-col gap-2 md:flex-row">
            {canManageAttendance && (
              <>
                <Button 
                  variant="outline"
                  onClick={() => setIsCSVModalOpen(true)}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  CSV Upload
                </Button>
                <Button 
                  onClick={() => {
                    setSelectedRecord(null);
                    setModalMode('create');
                    setIsAttendanceModalOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Record
                </Button>
              </>
            )}
            {isEmployee && (
              <Button 
                onClick={() => setIsLeaveModalOpen(true)}
                className="bg-gradient-primary shadow-primary"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Request Leave
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Attendance Statistics */}
      <AttendanceStats stats={stats} />

      <Tabs defaultValue="attendance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leave">Leave Management</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-48 justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {new Date(selectedDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CustomCalendar
                        date={new Date(selectedDate)}
                        onDateChange={(date) => setSelectedDate(date.toISOString().split('T')[0])}
                        variant="inline"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
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
                {canManageAttendance && (
                  <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Employee" />
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
                )}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search employees or notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                {isEmployee ? 'My Attendance Record' : 'Daily Attendance'} ({filteredAttendance.length})
              </CardTitle>
              <CardDescription>
                {isEmployee 
                  ? 'Your daily attendance and work hours'
                  : `Attendance record for ${new Date(selectedDate).toLocaleDateString()}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Total Hours</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      {canManageAttendance && <TableHead className="w-10">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttendance.map((record) => (
                      <TableRow key={record.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                                {record.employeeName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{record.employeeName}</div>
                                                          <div className="text-sm text-muted-foreground">
                              <CustomCalendar 
                                date={new Date(record.date)} 
                                variant="compact" 
                                format="short"
                                showIcon={false}
                              />
                            </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {record.checkIn || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {record.checkOut || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{record.totalHours.toFixed(2)}h</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{record.location}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(record.status)}
                            <Badge 
                              variant={getStatusVariant(record.status)}
                              className={getStatusColor(record.status)}
                            >
                              {getStatusLabel(record.status)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {record.notes || '-'}
                          </div>
                        </TableCell>
                        {canManageAttendance && (
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditRecord(record)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Record
                                </DropdownMenuItem>
                                {canDeleteAttendance && (
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => handleDeleteRecord(record.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Record
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredAttendance.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No attendance records found for the selected criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave" className="space-y-4">
          {/* Leave Requests Table */}
          <Card>
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
              <CardDescription>
                Track leave requests and approval status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Total Days</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveRequests
                      .filter(request => isEmployee ? request.employeeId === user?.id : true)
                      .map((request) => (
                      <TableRow key={request.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                                {request.employeeName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{request.employeeName}</div>
                                                          <div className="text-sm text-muted-foreground">
                              <CustomCalendar 
                                date={new Date(request.requestedAt)} 
                                variant="compact" 
                                format="short"
                                showIcon={false}
                              />
                            </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ 
                                backgroundColor: mockLeaveCategories.find(cat => cat.id === request.leaveType)?.color || '#6b7280' 
                              }}
                            />
                            <span>{mockLeaveCategories.find(cat => cat.id === request.leaveType)?.name || request.leaveType}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div><CustomCalendar 
                              date={new Date(request.startDate)} 
                              variant="compact" 
                              format="short"
                              showIcon={false}
                            /></div>
                            <div className="text-muted-foreground">to</div>
                            <div><CustomCalendar 
                              date={new Date(request.endDate)} 
                              variant="compact" 
                              format="short"
                              showIcon={false}
                            /></div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{request.totalDays} day{request.totalDays !== 1 ? 's' : ''}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground max-w-xs truncate">
                            {request.reason}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={getLeaveStatusVariant(request.status)}
                            className={getLeaveStatusColor(request.status)}
                          >
                            {getLeaveStatusLabel(request.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-1 h-3 w-3" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {leaveRequests.filter(request => isEmployee ? request.employeeId === user?.id : true).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No leave requests found.</p>
                </div>
              )}
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
    </div>
  );
}