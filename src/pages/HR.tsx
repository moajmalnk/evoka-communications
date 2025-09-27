import { useState } from 'react';
import { 
  Users, Search, MoreHorizontal, Eye, Edit, Clock, IndianRupee, 
  Calendar, Filter, UserPlus, FileText, TrendingUp, CheckCircle, XCircle, RotateCcw
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
import { EmployeeCreateModal } from '@/components/employees/EmployeeCreateModal';
import { EmployeeEditModal } from '@/components/employees/EmployeeEditModal';
import { EmployeeDetailsModal } from '@/components/employees/EmployeeDetailsModal';
import { PayrollDetailsModal } from '@/components/payroll/PayrollDetailsModal';
import { UserFilters } from '@/components/common/UserFilters';

// Employee interface
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: string;
  joinDate: string;
  location: string;
  salary: number;
  attendanceRate: number;
  lastReview?: string;
  notes?: string;
}

// PayrollRecord interface
interface PayrollRecord {
  id: string;
  employeeName: string;
  employeeId: string;
  payPeriod: string;
  baseSalary: number;
  overtime: number;
  bonuses: number;
  deductions: number;
  netSalary: number;
  paymentDate: string;
  status: string;
}

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
  
  // Employee modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // Payroll modal states
  const [isPayrollDetailsModalOpen, setIsPayrollDetailsModalOpen] = useState(false);
  const [selectedPayrollRecord, setSelectedPayrollRecord] = useState<PayrollRecord | null>(null);
  
  // Employee data state
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);

  // Employee modal handlers
  const handleCreateEmployee = (newEmployee: Employee) => {
    setEmployees(prev => [...prev, newEmployee]);
  };

  const handleUpdateEmployee = (updatedEmployee: Employee) => {
    setEmployees(prev => 
      prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp)
    );
  };

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDetailsModalOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDetailsModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    setEmployees(prev => prev.filter(emp => emp.id !== employee.id));
  };

  const handleDeactivateEmployee = async (employee: Employee) => {
    setEmployees(prev => 
      prev.map(emp => 
        emp.id === employee.id 
          ? { ...emp, status: 'Inactive' }
          : emp
      )
    );
  };

  const handleActivateEmployee = async (employee: Employee) => {
    setEmployees(prev => 
      prev.map(emp => 
        emp.id === employee.id 
          ? { ...emp, status: 'Active' }
          : emp
      )
    );
  };

  // Payroll modal handlers
  const handleViewPayrollRecord = (payrollRecord: PayrollRecord) => {
    setSelectedPayrollRecord(payrollRecord);
    setIsPayrollDetailsModalOpen(true);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDepartmentFilter('all');
  };

  const handleClosePayrollModal = () => {
    setIsPayrollDetailsModalOpen(false);
    setSelectedPayrollRecord(null);
  };

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
          {/* <CustomClock variant="detailed" /> */}
          <Button className="bg-gradient-primary shadow-primary" onClick={() => setIsCreateModalOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Hr Manager
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total HR</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              All HR managers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active HR</CardTitle>
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
            <CardTitle className="text-sm font-medium">Avg. Salary</CardTitle>
            <IndianRupee className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{avgSalary.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Company average
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
      </div>

      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">All HR</TabsTrigger>
          <TabsTrigger value="active">Active HR</TabsTrigger>
          <TabsTrigger value="inactive">Inactive HR</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <UserFilters
            title="HR Filters"
            searchPlaceholder="Search HR by name, email, or role..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filterValue={departmentFilter}
            onFilterChange={setDepartmentFilter}
            filterOptions={[
              { value: 'all', label: 'All Departments' },
              { value: 'development', label: 'Development' },
              { value: 'design', label: 'Design' },
              { value: 'management', label: 'Management' },
              { value: 'marketing', label: 'Marketing' },
            ]}
            filterPlaceholder="Department"
            onReset={resetFilters}
            showStatusFilter={true}
            statusValue={statusFilter}
            onStatusChange={setStatusFilter}
            statusOptions={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'on leave', label: 'On Leave' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />

          {/* HR Table */}
          <Card>
            <CardHeader>
              <CardTitle>All HR ({filteredEmployees.length})</CardTitle>
              <CardDescription>
                Complete directory of HR team members with information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredEmployees.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>HR Manager</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Salary</TableHead>
                        <TableHead>Attendance</TableHead>
                        <TableHead>Last Review</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees.map((employee) => (
                        <TableRow key={employee.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => handleViewEmployee(employee)}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
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
                              ₹{employee.salary.toLocaleString()}
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No HR managers found matching your search criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <UserFilters
            title="Active HR Filters"
            searchPlaceholder="Search active HR by name, email, or role..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filterValue={departmentFilter}
            onFilterChange={setDepartmentFilter}
            filterOptions={[
              { value: 'all', label: 'All Departments' },
              { value: 'development', label: 'Development' },
              { value: 'design', label: 'Design' },
              { value: 'management', label: 'Management' },
              { value: 'marketing', label: 'Marketing' },
            ]}
            filterPlaceholder="Department"
            onReset={resetFilters}
          />

          <Card>
            <CardHeader>
              <CardTitle>Active HR ({mockEmployees.filter(e => e.status === 'Active').length})</CardTitle>
              <CardDescription>
                HR managers currently working
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mockEmployees.filter(e => e.status === 'Active').length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>HR Manager</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Salary</TableHead>
                        <TableHead>Attendance</TableHead>
                        <TableHead>Last Review</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockEmployees.filter(e => e.status === 'Active').map((employee) => (
                        <TableRow key={employee.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => handleViewEmployee(employee)}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
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
                            <div className="font-medium text-green-600">
                              ₹{employee.salary.toLocaleString()}
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No active HR managers found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          <UserFilters
            title="Inactive HR Filters"
            searchPlaceholder="Search inactive HR by name, email, or role..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filterValue={departmentFilter}
            onFilterChange={setDepartmentFilter}
            filterOptions={[
              { value: 'all', label: 'All Departments' },
              { value: 'development', label: 'Development' },
              { value: 'design', label: 'Design' },
              { value: 'management', label: 'Management' },
              { value: 'marketing', label: 'Marketing' },
            ]}
            filterPlaceholder="Department"
            onReset={resetFilters}
          />

          <Card>
            <CardHeader>
              <CardTitle>Inactive HR ({mockEmployees.filter(e => e.status === 'Inactive').length})</CardTitle>
              <CardDescription>
                HR managers with inactive status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mockEmployees.filter(e => e.status === 'Inactive').length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>HR Manager</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Salary</TableHead>
                        <TableHead>Attendance</TableHead>
                        <TableHead>Last Review</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockEmployees.filter(e => e.status === 'Inactive').map((employee) => (
                        <TableRow key={employee.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => handleViewEmployee(employee)}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
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
                            <div className="font-medium text-green-600">
                              ₹{employee.salary.toLocaleString()}
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No inactive HR managers found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Employee Modals */}
      <EmployeeCreateModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModals}
        onEmployeeCreated={handleCreateEmployee}
      />

      <EmployeeEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        employee={selectedEmployee}
        onEmployeeUpdated={handleUpdateEmployee}
      />

      <EmployeeDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseModals}
        employee={selectedEmployee}
        onEdit={handleEditEmployee}
        onDelete={handleDeleteEmployee}
        onDeactivate={handleDeactivateEmployee}
        onActivate={handleActivateEmployee}
      />

      <PayrollDetailsModal
        isOpen={isPayrollDetailsModalOpen}
        onClose={handleClosePayrollModal}
        payrollRecord={selectedPayrollRecord}
      />
    </div>
  );
}
