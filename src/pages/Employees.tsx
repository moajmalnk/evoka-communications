import { useState } from 'react';
import { Plus, Search, MoreHorizontal, Mail, Phone, MapPin, Calendar, Clock, IndianRupee, User, Eye, Edit, RotateCcw, CheckCircle, XCircle, TrendingUp, Filter } from 'lucide-react';
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
  attendanceRate?: number;
  lastReview?: string;
}

// Mock employee data
const mockEmployees: Employee[] = [
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
  },
  {
    id: 'EMP-004',
    firstName: 'Sarah',
    lastName: 'Wilson',
    email: 'sarah.wilson@agency.com',
    phone: '+1 (555) 456-7890',
    role: 'Marketing Specialist',
    department: 'Marketing',
    status: 'On Leave',
    joinDate: '2023-05-01',
    location: 'Austin, TX',
    salary: 60000,
  },
  {
    id: 'EMP-005',
    firstName: 'David',
    lastName: 'Brown',
    email: 'david.brown@agency.com',
    phone: '+1 (555) 567-8901',
    role: 'Junior Developer',
    department: 'Development',
    status: 'Inactive',
    joinDate: '2023-07-15',
    location: 'Seattle, WA',
    salary: 55000,
  },
];

const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'default';
    case 'on leave':
      return 'secondary';
    case 'inactive':
      return 'outline';
    default:
      return 'outline';
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'text-success';
    case 'on leave':
      return 'text-warning';
    case 'inactive':
      return 'text-muted-foreground';
    default:
      return 'text-muted-foreground';
  }
};

export function Employees() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // Employee data state
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || employee.status.toLowerCase() === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || employee.department.toLowerCase() === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const activeEmployees = employees.filter(e => e.status === 'Active').length;
  const totalEmployees = employees.length;
  const onLeave = employees.filter(e => e.status === 'On Leave').length;

  // Modal handlers
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

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDepartmentFilter('all');
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

  // Role-based permissions
  const canManageEmployees = user?.role === 'admin' || user?.role === 'general_manager' || user?.role === 'hr';
  const canViewAllEmployees = user?.role === 'admin' || user?.role === 'general_manager' || user?.role === 'hr' || user?.role === 'project_coordinator';
  const canEditEmployees = user?.role === 'admin' || user?.role === 'general_manager' || user?.role === 'hr';
  const canViewSalaries = user?.role === 'admin' || user?.role === 'general_manager' || user?.role === 'hr';
  const canViewAttendance = user?.role === 'admin' || user?.role === 'general_manager' || user?.role === 'hr';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">
            Manage your team members and their information
          </p>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          
          {canManageEmployees && (
            <Button 
              className="bg-gradient-primary shadow-primary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              All employees
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
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
              ₹{Math.round(employees.reduce((sum, emp) => sum + emp.salary, 0) / employees.length).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Company average
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((activeEmployees / totalEmployees) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Active employees
              </p>
            </CardContent>
          </Card>
      </div>

      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">All Employees</TabsTrigger>
          <TabsTrigger value="active">Active Employees</TabsTrigger>
          <TabsTrigger value="inactive">Inactive Employees</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <UserFilters
            title="Employee Filters"
            searchPlaceholder="Search employees by name, email, or role..."
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

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Employees ({filteredEmployees.length})</CardTitle>
          <CardDescription>
            Complete directory of team members with contact information
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
                      <TableHead>Location</TableHead>
                      <TableHead>Join Date</TableHead>
                      {canViewSalaries && <TableHead>Salary</TableHead>}
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
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {employee.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {employee.phone}
                          </div>
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
                        variant={getStatusVariant(employee.status)}
                        className={getStatusColor(employee.status)}
                      >
                        {employee.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {employee.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(employee.joinDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    {canViewSalaries && (
                      <TableCell>
                        <div className="font-medium text-green-600">
                          ₹{employee.salary.toLocaleString()}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <UserFilters
            title="Active Employee Filters"
            searchPlaceholder="Search active employees by name, email, or role..."
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
              <CardTitle>Active Employees ({employees.filter(e => e.status === 'Active').length})</CardTitle>
              <CardDescription>
                Employees currently working
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
                      <TableHead>Location</TableHead>
                      <TableHead>Join Date</TableHead>
                      {canViewSalaries && <TableHead>Salary</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.filter(e => e.status === 'Active').map((employee) => (
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
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {employee.email}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {employee.phone}
                              </div>
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
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {employee.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(employee.joinDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        {canViewSalaries && (
                          <TableCell>
                            <div className="font-medium text-green-600">
                              ₹{employee.salary.toLocaleString()}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          <UserFilters
            title="Inactive Employee Filters"
            searchPlaceholder="Search inactive employees by name, email, or role..."
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
              <CardTitle>Inactive Employees ({employees.filter(e => e.status === 'Inactive').length})</CardTitle>
              <CardDescription>
                Employees with inactive status
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
                      <TableHead>Location</TableHead>
                      <TableHead>Join Date</TableHead>
                      {canViewSalaries && <TableHead>Salary</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.filter(e => e.status === 'Inactive').map((employee) => (
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
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {employee.email}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {employee.phone}
                              </div>
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
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {employee.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(employee.joinDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        {canViewSalaries && (
                          <TableCell>
                            <div className="font-medium text-green-600">
                              ₹{employee.salary.toLocaleString()}
            </div>
                          </TableCell>
                        )}
  
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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
    </div>
  );
}