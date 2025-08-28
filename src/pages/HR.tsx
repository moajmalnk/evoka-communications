import { useState } from 'react';
import { 
  Users, Search, MoreHorizontal, Eye, Edit, Clock, DollarSign, 
  Calendar, Filter, UserPlus, FileText, TrendingUp, CheckCircle, XCircle 
} from 'lucide-react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { CustomClock } from '@/components/ui/custom-clock';
import { CustomCalendar } from '@/components/ui/custom-calendar';

// Mock data for HR dashboard
const mockEmployees = [
  {
    id: 'EMP-001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@agency.com',
    phone: '+1 (555) 123-4567',
    role: 'Senior Developer',
    department: 'Development',
    status: 'Active',
    joinDate: '2023-01-15',
    location: 'New York, NY',
    salary: 85000,
    attendanceRate: 95,
    lastReview: '2024-01-15'
  },
  {
    id: 'EMP-002',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@agency.com',
    phone: '+1 (555) 234-5678',
    role: 'UX Designer',
    department: 'Design',
    status: 'Active',
    joinDate: '2023-03-20',
    location: 'San Francisco, CA',
    salary: 75000,
    attendanceRate: 92,
    lastReview: '2024-02-01'
  },
  {
    id: 'EMP-003',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@agency.com',
    phone: '+1 (555) 345-6789',
    role: 'Project Manager',
    department: 'Management',
    status: 'Active',
    joinDate: '2022-08-10',
    location: 'Chicago, IL',
    salary: 90000,
    attendanceRate: 98,
    lastReview: '2024-01-30'
  }
];

const mockLeaveRequests = [
  {
    id: 'LR-001',
    employeeName: 'Sarah Wilson',
    employeeId: 'EMP-004',
    leaveType: 'Annual Leave',
    startDate: '2024-04-01',
    endDate: '2024-04-05',
    days: 5,
    reason: 'Family vacation',
    status: 'Pending',
    submittedDate: '2024-03-10'
  },
  {
    id: 'LR-002',
    employeeName: 'David Brown',
    employeeId: 'EMP-005',
    leaveType: 'Sick Leave',
    startDate: '2024-03-20',
    endDate: '2024-03-22',
    days: 3,
    reason: 'Medical appointment',
    status: 'Approved',
    submittedDate: '2024-03-18'
  },
  {
    id: 'LR-003',
    employeeName: 'Emily Davis',
    employeeId: 'EMP-006',
    leaveType: 'Personal Leave',
    startDate: '2024-05-15',
    endDate: '2024-05-17',
    days: 3,
    reason: 'Personal matters',
    status: 'Rejected',
    submittedDate: '2024-03-12'
  }
];

const mockPayrollRecords = [
  {
    id: 'PR-001',
    employeeName: 'John Doe',
    employeeId: 'EMP-001',
    payPeriod: 'March 2024',
    baseSalary: 85000,
    overtime: 2000,
    bonuses: 5000,
    deductions: 1500,
    netSalary: 90500,
    paymentDate: '2024-03-31',
    status: 'Paid'
  },
  {
    id: 'PR-002',
    employeeName: 'Jane Smith',
    employeeId: 'EMP-002',
    payPeriod: 'March 2024',
    baseSalary: 75000,
    overtime: 1500,
    bonuses: 3000,
    deductions: 1200,
    netSalary: 78300,
    paymentDate: '2024-03-31',
    status: 'Paid'
  }
];

export function HR() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Role verification - Admin and HR have access
  if (user?.role !== 'admin' && user?.role !== 'hr') {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const filteredEmployees = mockEmployees.filter(employee => {
    const matchesSearch = 
      `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || employee.status.toLowerCase() === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || employee.department.toLowerCase() === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const totalEmployees = mockEmployees.length;
  const activeEmployees = mockEmployees.filter(e => e.status === 'Active').length;
  const pendingLeaveRequests = mockLeaveRequests.filter(l => l.status === 'Pending').length;
  const totalPayroll = mockPayrollRecords.reduce((sum, p) => sum + p.netSalary, 0);
  const avgSalary = Math.round(mockEmployees.reduce((sum, emp) => sum + emp.salary, 0) / mockEmployees.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">HR Management</h1>
          <p className="text-muted-foreground">
            Manage employees, attendance, salaries, and leave requests
          </p>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <CustomClock variant="detailed" />
          <Button className="bg-gradient-primary shadow-primary">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Company-wide
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Currently working
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Leave</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingLeaveRequests}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${avgSalary.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Company average
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${(totalPayroll / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">Employee Management</TabsTrigger>
          <TabsTrigger value="leave_requests">Leave Requests</TabsTrigger>
          <TabsTrigger value="payroll">Payroll Records</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          {/* Employee Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />Employee Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search employees by name, email, or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on leave">On Leave</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Employees Table */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Directory ({filteredEmployees.length})</CardTitle>
              <CardDescription>
                Complete directory of team members with HR information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead>Last Review</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((employee) => (
                      <TableRow key={employee.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                                {employee.firstName[0]}{employee.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {employee.firstName} {employee.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">{employee.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{employee.role}</div>
                          <div className="text-sm text-muted-foreground">{employee.id}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{employee.department}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={employee.status === 'Active' ? 'default' : 'outline'}
                            className={employee.status === 'Active' ? 'text-green-600' : 'text-muted-foreground'}
                          >
                            {employee.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-green-600">
                            ${employee.salary.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${employee.attendanceRate}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{employee.attendanceRate}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(employee.lastReview).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />View Profile</DropdownMenuItem>
                              <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Edit Employee</DropdownMenuItem>
                              <DropdownMenuItem><Calendar className="mr-2 h-4 w-4" />View Attendance</DropdownMenuItem>
                              <DropdownMenuItem><DollarSign className="mr-2 h-4 w-4" />View Salary</DropdownMenuItem>
                              <DropdownMenuItem><FileText className="mr-2 h-4 w-4" />Performance Review</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave_requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leave Requests ({mockLeaveRequests.length})</CardTitle>
              <CardDescription>
                Review and approve employee leave requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockLeaveRequests.map((request) => (
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
                              <div className="text-sm text-muted-foreground">{request.employeeId}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{request.leaveType}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{new Date(request.startDate).toLocaleDateString()}</div>
                            <div className="text-muted-foreground">
                              to {new Date(request.endDate).toLocaleDateString()}
                            </div>
                            <div className="font-medium">{request.days} days</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="text-sm">{request.reason}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={request.status === 'Approved' ? 'default' : 
                                   request.status === 'Pending' ? 'secondary' : 'destructive'}
                          >
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(request.submittedDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {request.status === 'Pending' && (
                              <>
                                <Button size="sm" variant="outline" className="text-green-600">
                                  <CheckCircle className="mr-2 h-4 w-4" />Approve
                                </Button>
                                <Button size="sm" variant="outline" className="text-red-600">
                                  <XCircle className="mr-2 h-4 w-4" />Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Records ({mockPayrollRecords.length})</CardTitle>
              <CardDescription>
                Track employee salary payments and records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Pay Period</TableHead>
                      <TableHead>Base Salary</TableHead>
                      <TableHead>Overtime</TableHead>
                      <TableHead>Bonuses</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Net Salary</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPayrollRecords.map((record) => (
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
                              <div className="text-sm text-muted-foreground">{record.employeeId}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{record.payPeriod}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">${record.baseSalary.toLocaleString()}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-green-600">${record.overtime.toLocaleString()}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-green-600">${record.bonuses.toLocaleString()}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-red-600">${record.deductions.toLocaleString()}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-green-600">${record.netSalary.toLocaleString()}</div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={record.status === 'Paid' ? 'default' : 'outline'}
                            className={record.status === 'Paid' ? 'text-green-600' : 'text-muted-foreground'}
                          >
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />View Details</DropdownMenuItem>
                              <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Edit Record</DropdownMenuItem>
                              <DropdownMenuItem><FileText className="mr-2 h-4 w-4" />Generate Payslip</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
