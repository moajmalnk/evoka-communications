import { useState } from 'react';
import { 
  Building2, Search, MoreHorizontal, Eye, CheckCircle, XCircle, Clock, 
  TrendingUp, TrendingDown, IndianRupee, Users, FileText, Calendar, Filter, RotateCcw, Edit
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
import { ProjectDetailsModal } from '@/components/projects/ProjectDetailsModal';
import { UserFilters } from '@/components/common/UserFilters';
import { ProjectStatus } from '@/types/project';

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

// Project interface
interface Project {
  id: string;
  name: string;
  clientName: string;
  category: string;
  startDate: string;
  endDate: string;
  description: string;
  assignedCoordinator: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  attachments: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
    uploadedAt: string;
  }>;
}

// Mock data for General Manager dashboard
const mockProjects: Project[] = [
  {
    id: 'PRJ-001',
    name: 'Website Redesign',
    clientName: 'TechCorp Inc.',
    category: 'web-development',
    status: 'in_progress' as ProjectStatus,
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    description: 'Complete redesign of the company website with modern UI/UX',
    assignedCoordinator: 'PC-001',
    createdAt: '2024-01-10',
    updatedAt: '2024-03-15',
    createdBy: 'GM-001',
    attachments: []
  },
  {
    id: 'PRJ-002',
    name: 'Brand Identity Package',
    clientName: 'StartupXYZ',
    category: 'branding',
    status: 'completed' as ProjectStatus,
    startDate: '2023-11-01',
    endDate: '2024-02-28',
    description: 'Complete brand identity package including logo, colors, and guidelines',
    assignedCoordinator: 'PC-001',
    createdAt: '2023-10-25',
    updatedAt: '2024-02-28',
    createdBy: 'GM-001',
    attachments: []
  },
  {
    id: 'PRJ-003',
    name: 'Marketing Campaign',
    clientName: 'Global Retail',
    category: 'marketing',
    status: 'planning' as ProjectStatus,
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    description: 'Comprehensive marketing campaign for new product launch',
    assignedCoordinator: 'PC-001',
    createdAt: '2024-02-15',
    updatedAt: '2024-03-01',
    createdBy: 'GM-001',
    attachments: []
  }
];

const mockWorkApprovals = [
  {
    id: 'WA-001',
    employeeName: 'John Doe',
    projectName: 'Website Redesign',
    workType: 'Design Mockup',
    submittedDate: '2024-03-15',
    status: 'Pending',
    priority: 'High'
  },
  {
    id: 'WA-002',
    employeeName: 'Jane Smith',
    projectName: 'Brand Identity Package',
    workType: 'Logo Design',
    submittedDate: '2024-03-14',
    status: 'Approved',
    priority: 'Medium'
  },
  {
    id: 'WA-003',
    employeeName: 'Mike Johnson',
    projectName: 'Marketing Campaign',
    workType: 'Copywriting',
    submittedDate: '2024-03-13',
    status: 'Rejected',
    priority: 'Low'
  }
];

const mockFinancialApprovals = [
  {
    id: 'FA-001',
    type: 'Expense',
    description: 'Software Licenses',
    amount: 2500,
    submittedBy: 'Sarah Wilson',
    submittedDate: '2024-03-15',
    status: 'Pending',
    category: 'Technology'
  },
  {
    id: 'FA-002',
    type: 'Invoice',
    description: 'Client Payment - TechCorp',
    amount: 15000,
    submittedBy: 'Finance Team',
    submittedDate: '2024-03-14',
    status: 'Approved',
    category: 'Revenue'
  }
];

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

export function GeneralManager() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  // Employee modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // Project modal states
  const [isProjectDetailsModalOpen, setIsProjectDetailsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Employee data state
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  
  // Project data state
  const [projects, setProjects] = useState<Project[]>(mockProjects);

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

  // Project modal handlers
  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setIsProjectDetailsModalOpen(true);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  const handleCloseProjectModal = () => {
    setIsProjectDetailsModalOpen(false);
    setSelectedProject(null);
  };

  // Role verification - Admin and General Manager have access
  if (user?.role !== 'admin' && user?.role !== 'general_manager') {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status.toLowerCase() === statusFilter;
    const matchesPriority = priorityFilter === 'all' || project.category.toLowerCase() === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const pendingApprovals = mockWorkApprovals.filter(w => w.status === 'Pending').length;
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'in_progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalBudget = 150000; // Mock total budget

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">General Managers</h1>
          <p className="text-muted-foreground">
            Manage general managers and track their performance
          </p>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          {/* <CustomClock variant="detailed" /> */}
          <div className="flex gap-2">
           
            <Button className="bg-gradient-primary shadow-primary" onClick={() => setIsCreateModalOpen(true)}>
              <Users className="mr-2 h-4 w-4" />
              Add General Manager
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Managers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">
              All managers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Managers</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{employees.filter(e => e.status === 'Active').length}</div>
            <p className="text-xs text-muted-foreground">
              Currently working
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Managers</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{employees.filter(e => e.status === 'Inactive').length}</div>
            <p className="text-xs text-muted-foreground">
              Not currently active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              Under management
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="managers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="managers">All General Managers</TabsTrigger>
          <TabsTrigger value="active">Active General Managers</TabsTrigger>
          <TabsTrigger value="inactive">Inactive General Managers</TabsTrigger>
        </TabsList>

        <TabsContent value="managers" className="space-y-4">
          <UserFilters
            title="General Manager Filters"
            searchPlaceholder="Search managers by name, email, or department..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filterValue={priorityFilter}
            onFilterChange={setPriorityFilter}
            filterOptions={[
              { value: 'all', label: 'All Departments' },
              { value: 'management', label: 'Management' },
              { value: 'operations', label: 'Operations' },
              { value: 'development', label: 'Development' },
            ]}
            filterPlaceholder="Department"
            onReset={resetFilters}
            showStatusFilter={true}
            statusValue={statusFilter}
            onStatusChange={setStatusFilter}
            statusOptions={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />

          {/* General Managers Table */}
            <Card>
              <CardHeader>
              <CardTitle>All General Managers ({employees.length})</CardTitle>
              <CardDescription>
                Complete list of all general managers and their information
              </CardDescription>
              </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Manager</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Overseeing Projects</TableHead>
                      <TableHead>Team Members</TableHead>
                      <TableHead>Join Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <div className="flex flex-col items-center gap-4">
                            <Users className="h-12 w-12 text-muted-foreground" />
                            <div>
                              <h3 className="text-lg font-medium">No General Managers Found</h3>
                              <p className="text-muted-foreground">
                                There are no general managers to display. Add a new manager to get started.
                              </p>
                  </div>
                            <Button 
                              className="bg-gradient-primary shadow-primary"
                              onClick={() => setIsCreateModalOpen(true)}
                            >
                              <Users className="mr-2 h-4 w-4" />
                              Add General Manager
                            </Button>
                  </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      employees.map((manager) => (
                        <TableRow key={manager.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => handleViewEmployee(manager)}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                                  {manager.firstName[0]}{manager.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{manager.firstName} {manager.lastName}</div>
                                <div className="text-sm text-muted-foreground">{manager.email}</div>
                  </div>
                </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline">{manager.department}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                              variant={manager.status === 'Active' ? 'default' : 'secondary'}
                              className={manager.status === 'Active' ? 'text-green-600' : 'text-muted-foreground'}
                          >
                              {manager.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{Math.floor(Math.random() * 5) + 1} active</div>
                              <div className="text-muted-foreground">
                                {Math.floor(Math.random() * 10) + 5} total
                  </div>
                  </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                              {Math.floor(Math.random() * 8) + 3}
                </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                              {new Date(manager.joinDate).toLocaleDateString()}
                  </div>
                        </TableCell>
                      </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <UserFilters
            title="Active Manager Filters"
            searchPlaceholder="Search active managers by name, email, or department..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filterValue={priorityFilter}
            onFilterChange={setPriorityFilter}
            filterOptions={[
              { value: 'all', label: 'All Departments' },
              { value: 'management', label: 'Management' },
              { value: 'operations', label: 'Operations' },
              { value: 'development', label: 'Development' },
            ]}
            filterPlaceholder="Department"
            onReset={resetFilters}
          />

          <Card>
            <CardHeader>
              <CardTitle>Active General Managers ({employees.filter(e => e.status === 'Active').length})</CardTitle>
              <CardDescription>
                General managers currently overseeing active projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Manager</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Active Projects</TableHead>
                      <TableHead>Team Size</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Last Activity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.filter(e => e.status === 'Active').length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <div className="flex flex-col items-center gap-4">
                            <Users className="h-12 w-12 text-muted-foreground" />
                            <div>
                              <h3 className="text-lg font-medium">No Active General Managers</h3>
                              <p className="text-muted-foreground">
                                There are no active general managers at the moment.
                              </p>
                            </div>
                            <Button 
                              className="bg-gradient-primary shadow-primary"
                              onClick={() => setIsCreateModalOpen(true)}
                            >
                              <Users className="mr-2 h-4 w-4" />
                              Add General Manager
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      employees.filter(e => e.status === 'Active').map((manager) => (
                        <TableRow key={manager.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => handleViewEmployee(manager)}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                                  {manager.firstName[0]}{manager.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                              <div>
                                <div className="font-medium">{manager.firstName} {manager.lastName}</div>
                                <div className="text-sm text-muted-foreground">{manager.email}</div>
                              </div>
                          </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline">{manager.department}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div 
                                  className="bg-green-500 h-2 rounded-full" 
                                  style={{ width: `${Math.floor(Math.random() * 40) + 60}%` }}
                              />
                            </div>
                              <span className="text-sm font-medium">{Math.floor(Math.random() * 3) + 2}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                              {Math.floor(Math.random() * 8) + 3}
                          </div>
                        </TableCell>
                        <TableCell>
                            <div className="text-sm">
                          <div className="font-medium text-green-600">
                                {Math.floor(Math.random() * 20) + 80}%
                              </div>
                              <div className="text-muted-foreground">Success rate</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                              {new Date().toLocaleDateString()}
                          </div>
                        </TableCell>
                      </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          <UserFilters
            title="Inactive Manager Filters"
            searchPlaceholder="Search inactive managers by name, email, or department..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filterValue={priorityFilter}
            onFilterChange={setPriorityFilter}
            filterOptions={[
              { value: 'all', label: 'All Departments' },
              { value: 'management', label: 'Management' },
              { value: 'operations', label: 'Operations' },
              { value: 'development', label: 'Development' },
            ]}
            filterPlaceholder="Department"
            onReset={resetFilters}
          />

          <Card>
            <CardHeader>
              <CardTitle>Inactive General Managers ({employees.filter(e => e.status === 'Inactive').length})</CardTitle>
              <CardDescription>
                General managers with no current active projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Manager</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Completed Projects</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.filter(e => e.status === 'Inactive').length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <div className="flex flex-col items-center gap-4">
                            <Users className="h-12 w-12 text-muted-foreground" />
                            <div>
                              <h3 className="text-lg font-medium">No Inactive General Managers</h3>
                              <p className="text-muted-foreground">
                                All general managers are currently active.
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      employees.filter(e => e.status === 'Inactive').map((manager) => (
                        <TableRow key={manager.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => handleViewEmployee(manager)}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                                  {manager.firstName[0]}{manager.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{manager.firstName} {manager.lastName}</div>
                                <div className="text-sm text-muted-foreground">{manager.email}</div>
                              </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline">{manager.department}</Badge>
                        </TableCell>
                        <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{Math.floor(Math.random() * 10) + 5} completed</div>
                              <div className="text-muted-foreground">
                                {Math.floor(Math.random() * 15) + 10} total projects
                              </div>
                          </div>
                        </TableCell>
                        <TableCell>
                            <div className="text-sm">
                              {new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                              variant="secondary"
                              className="text-muted-foreground"
                          >
                              {manager.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewEmployee(manager)}>
                                  <Eye className="mr-2 h-4 w-4" />View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditEmployee(manager)}>
                                  <Edit className="mr-2 h-4 w-4" />Edit Manager
                                </DropdownMenuItem>
                                <DropdownMenuItem><FileText className="mr-2 h-4 w-4" />View Report</DropdownMenuItem>
                                <DropdownMenuItem><Users className="mr-2 h-4 w-4" />Team Performance</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      ))
                    )}
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

      {/* Project Details Modal */}
      <ProjectDetailsModal
        project={selectedProject}
        isOpen={isProjectDetailsModalOpen}
        onClose={handleCloseProjectModal}
        onEdit={() => {}} // Placeholder - can be implemented later
        onDelete={() => {}} // Placeholder - can be implemented later
        categories={[
          { id: 'web-development', name: 'Web Development', color: 'blue' },
          { id: 'branding', name: 'Branding', color: 'purple' },
          { id: 'marketing', name: 'Marketing', color: 'green' }
        ]}
        coordinators={[
          { id: 'PC-001', name: 'Project Coordinator', role: 'project_coordinator' }
        ]}
        clients={[
          { id: 'CLIENT-001', name: 'TechCorp Inc.' },
          { id: 'CLIENT-002', name: 'StartupXYZ' },
          { id: 'CLIENT-003', name: 'Global Retail' }
        ]}
      />
    </div>
  );
}
