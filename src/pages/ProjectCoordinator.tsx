import { useState } from 'react';
import { 
  FolderOpen, Search, MoreHorizontal, Eye, CheckCircle, XCircle, Clock, 
  TrendingUp, Users, FileText, Calendar, Filter, Plus, Target, CheckSquare, Edit, RotateCcw
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
import { TaskCreateModal } from '@/components/tasks/TaskCreateModal';
import { TaskEditModal } from '@/components/tasks/TaskEditModal';
import { TaskDetailsModal } from '@/components/tasks/TaskDetailsModal';
import { ProjectDetailsModal } from '@/components/projects/ProjectDetailsModal';
import { WorkSubmissionReviewModal } from '@/components/workSubmissions/WorkSubmissionDetailsModal';
import { UserFilters } from '@/components/common/UserFilters';
import { ProjectStatus } from '@/types/project';
import { WorkSubmissionStatus } from '@/types/workSubmission';

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

// Task interface
interface Task {
  id: string;
  title: string;
  projectName: string;
  assignedTo: string;
  priority: string;
  status: string;
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
  description?: string;
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

// WorkSubmission interface
interface WorkSubmission {
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
  timeSpent: number;
  submissionDate: string;
  status: WorkSubmissionStatus;
  reviewDate?: string;
  reviewedBy?: string;
  reviewerRole?: string;
  feedback?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  attachments: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
    uploadedAt: string;
  }>;
}

// Mock data for Project Coordinator dashboard
const mockAssignedProjects: Project[] = [
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

const mockDailyTasks: Task[] = [
  {
    id: 'TASK-001',
    title: 'Design Homepage Mockup',
    projectName: 'Website Redesign',
    assignedTo: 'Jane Smith',
    priority: 'High',
    status: 'In Progress',
    dueDate: '2024-03-20',
    estimatedHours: 8,
    actualHours: 4,
    description: 'Create responsive homepage mockup with modern design elements'
  },
  {
    id: 'TASK-002',
    title: 'Develop Contact Form',
    projectName: 'Website Redesign',
    assignedTo: 'John Doe',
    priority: 'Medium',
    status: 'Completed',
    dueDate: '2024-03-18',
    estimatedHours: 6,
    actualHours: 5,
    description: 'Implement contact form with validation and email integration'
  },
  {
    id: 'TASK-003',
    title: 'Create Logo Concepts',
    projectName: 'Brand Identity Package',
    assignedTo: 'Sarah Wilson',
    priority: 'High',
    status: 'Pending',
    dueDate: '2024-03-22',
    estimatedHours: 10,
    actualHours: 0,
    description: 'Design multiple logo concepts for brand identity package'
  }
];

const mockWorkSubmissions: WorkSubmission[] = [
  {
    id: 'WS-001',
    taskId: 'TASK-001',
    taskTitle: 'Design Homepage Mockup',
    projectId: 'PRJ-001',
    projectName: 'Website Redesign',
    employeeId: 'EMP-002',
    employeeName: 'Jane Smith',
    coordinatorId: 'PC-001',
    coordinatorName: 'Project Coordinator',
    title: 'Homepage Design Mockup',
    description: 'Completed homepage design with responsive layout',
    timeSpent: 8,
    submissionDate: '2024-03-15',
    status: 'pending_review' as WorkSubmissionStatus,
    createdAt: '2024-03-15',
    updatedAt: '2024-03-15',
    attachments: []
  },
  {
    id: 'WS-002',
    taskId: 'TASK-002',
    taskTitle: 'Develop Contact Form',
    projectId: 'PRJ-001',
    projectName: 'Website Redesign',
    employeeId: 'EMP-001',
    employeeName: 'John Doe',
    coordinatorId: 'PC-001',
    coordinatorName: 'Project Coordinator',
    title: 'Contact Form Implementation',
    description: 'Implemented contact form with validation',
    timeSpent: 6,
    submissionDate: '2024-03-14',
    status: 'approved' as WorkSubmissionStatus,
    reviewDate: '2024-03-16',
    reviewedBy: 'PC-001',
    reviewerRole: 'project_coordinator',
    feedback: 'Great work! Form validation is working perfectly.',
    createdAt: '2024-03-14',
    updatedAt: '2024-03-16',
    attachments: []
  },
  {
    id: 'WS-003',
    taskId: 'TASK-003',
    taskTitle: 'Create Logo Concepts',
    projectId: 'PRJ-002',
    projectName: 'Brand Identity Package',
    employeeId: 'EMP-004',
    employeeName: 'Sarah Wilson',
    coordinatorId: 'PC-001',
    coordinatorName: 'Project Coordinator',
    title: 'Logo Design Concepts',
    description: 'Initial logo concepts - needs revision',
    timeSpent: 4,
    submissionDate: '2024-03-13',
    status: 'rejected' as WorkSubmissionStatus,
    reviewDate: '2024-03-14',
    reviewedBy: 'PC-001',
    reviewerRole: 'project_coordinator',
    feedback: 'Good start, but needs more refinement',
    rejectionReason: 'Client requested different color scheme and typography',
    createdAt: '2024-03-13',
    updatedAt: '2024-03-14',
    attachments: []
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

export function ProjectCoordinator() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  // Employee modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // Task modal states
  const [isTaskCreateModalOpen, setIsTaskCreateModalOpen] = useState(false);
  const [isTaskEditModalOpen, setIsTaskEditModalOpen] = useState(false);
  const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Project modal states
  const [isProjectDetailsModalOpen, setIsProjectDetailsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Work submission modal states
  const [isWorkSubmissionModalOpen, setIsWorkSubmissionModalOpen] = useState(false);
  const [selectedWorkSubmission, setSelectedWorkSubmission] = useState<WorkSubmission | null>(null);
  
  // Employee data state
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  
  // Task data state
  const [tasks, setTasks] = useState<Task[]>(mockDailyTasks);
  
  // Project data state
  const [projects, setProjects] = useState<Project[]>(mockAssignedProjects);
  
  // Work submission data state
  const [workSubmissions, setWorkSubmissions] = useState<WorkSubmission[]>(mockWorkSubmissions);

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

  // Task modal handlers
  const handleCreateTask = (newTask: Task) => {
    setTasks(prev => [...prev, newTask]);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => 
      prev.map(task => task.id === updatedTask.id ? updatedTask : task)
    );
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsTaskEditModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const handleApproveTask = (taskId: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, status: 'Completed' } : task
      )
    );
  };

  const handleRejectTask = (taskId: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, status: 'Cancelled' } : task
      )
    );
  };

  const handleCloseTaskModals = () => {
    setIsTaskCreateModalOpen(false);
    setIsTaskEditModalOpen(false);
    setIsTaskDetailsModalOpen(false);
    setSelectedTask(null);
  };

  // Project modal handlers
  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setIsProjectDetailsModalOpen(true);
  };

  const handleCloseProjectModal = () => {
    setIsProjectDetailsModalOpen(false);
    setSelectedProject(null);
  };

  // Work submission modal handlers
  const handleViewWorkSubmission = (workSubmission: WorkSubmission) => {
    setSelectedWorkSubmission(workSubmission);
    setIsWorkSubmissionModalOpen(true);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  const handleCloseWorkSubmissionModal = () => {
    setIsWorkSubmissionModalOpen(false);
    setSelectedWorkSubmission(null);
  };

  const handleReviewWorkSubmission = (submissionId: string, review: { status: WorkSubmissionStatus; feedback?: string; rejectionReason?: string }) => {
    setWorkSubmissions(prev => 
      prev.map(submission => 
        submission.id === submissionId 
          ? { 
              ...submission, 
              status: review.status,
              reviewDate: new Date().toISOString(),
              reviewedBy: user?.id || 'PC-001',
              reviewerRole: user?.role || 'project_coordinator',
              feedback: review.feedback,
              rejectionReason: review.rejectionReason,
              updatedAt: new Date().toISOString()
            }
          : submission
      )
    );
  };

  // Role verification - Admin and Project Coordinator have access
  if (user?.role !== 'admin' && user?.role !== 'project_coordinator') {
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

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'in_progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const pendingReviews = workSubmissions.filter(w => w.status === 'pending_review').length;
  const totalTeamMembers = projects.length * 3; // Mock calculation

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Coordinators</h1>
          <p className="text-muted-foreground">
            Manage project coordinators and track their performance
          </p>
        </div>
        <div className="flex gap-4 md:flex-row md:items-center">
          {/* <CustomClock variant="detailed" /> */}
          <div className="flex gap-2">
            
            <Button className="bg-gradient-primary shadow-primary" onClick={() => setIsCreateModalOpen(true)}>
              <Users className="mr-2 h-4 w-4" />
              Add Project Coordinator
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coordinators</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">
              All coordinators
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Coordinators</CardTitle>
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
            <CardTitle className="text-sm font-medium">Inactive Coordinators</CardTitle>
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
            <FolderOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              Under management
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="coordinators" className="space-y-4">
        <TabsList>
          <TabsTrigger value="coordinators">All Project Coordinators</TabsTrigger>
          <TabsTrigger value="active">Active Project Coordinators</TabsTrigger>
          <TabsTrigger value="inactive">Inactive Project Coordinators</TabsTrigger>
        </TabsList>

        <TabsContent value="coordinators" className="space-y-4">
          <UserFilters
            title="Project Coordinator Filters"
            searchPlaceholder="Search project coordinators by name or email..."
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

          {/* Project Coordinators Table */}
            <Card>
              <CardHeader>
              <CardTitle>All Project Coordinators ({employees.length})</CardTitle>
              <CardDescription>
                Complete list of all project coordinators and their information
              </CardDescription>
              </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project Coordinator</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned Projects</TableHead>
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
                              <h3 className="text-lg font-medium">No Project Coordinators Found</h3>
                              <p className="text-muted-foreground">
                                There are no project coordinators to display. Add a new coordinator to get started.
                              </p>
                  </div>
                            <Button 
                              className="bg-gradient-primary shadow-primary"
                              onClick={() => setIsCreateModalOpen(true)}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Project Coordinator
                            </Button>
                  </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      employees.map((employee) => (
                        <TableRow key={employee.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => handleViewEmployee(employee)}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                                  {employee.firstName[0]}{employee.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                                <div className="text-sm text-muted-foreground">{employee.email}</div>
                  </div>
                </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{employee.department}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={employee.status === 'Active' ? 'default' : 'secondary'}
                              className={employee.status === 'Active' ? 'text-green-600' : 'text-muted-foreground'}
                            >
                              {employee.status}
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
                              {new Date(employee.joinDate).toLocaleDateString()}
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
            title="Active Coordinator Filters"
            searchPlaceholder="Search active coordinators by name, email, or department..."
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
              <CardTitle>Active Project Coordinators ({employees.filter(e => e.status === 'Active').length})</CardTitle>
              <CardDescription>
                Project coordinators currently working on active projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project Coordinator</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Active Projects</TableHead>
                      <TableHead>Team Members</TableHead>
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
                              <h3 className="text-lg font-medium">No Active Project Coordinators</h3>
                              <p className="text-muted-foreground">
                                There are no active project coordinators at the moment.
                              </p>
                            </div>
                            <Button 
                              className="bg-gradient-primary shadow-primary"
                              onClick={() => setIsCreateModalOpen(true)}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Project Coordinator
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      employees.filter(e => e.status === 'Active').map((employee) => (
                      <TableRow key={employee.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => handleViewEmployee(employee)}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                                {employee.firstName[0]}{employee.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                              <div className="text-sm text-muted-foreground">{employee.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{employee.department}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${(Math.floor(Math.random() * 5) + 1) / 5 * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{Math.floor(Math.random() * 5) + 1}</span>
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
                            <div className="font-medium text-green-600">{Math.floor(Math.random() * 20) + 80}%</div>
                            <div className="text-muted-foreground">Success rate</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
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
            title="Inactive Coordinator Filters"
            searchPlaceholder="Search inactive coordinators by name, email, or department..."
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
              <CardTitle>Inactive Project Coordinators ({employees.filter(e => e.status === 'Inactive').length})</CardTitle>
              <CardDescription>
                Project coordinators with no current active projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project Coordinator</TableHead>
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
                              <h3 className="text-lg font-medium">No Inactive Project Coordinators</h3>
                              <p className="text-muted-foreground">
                                All project coordinators are currently active.
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      employees.filter(e => e.status === 'Inactive').map((employee) => (
                      <TableRow key={employee.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => handleViewEmployee(employee)}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                                {employee.firstName[0]}{employee.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                              <div className="text-sm text-muted-foreground">{employee.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{employee.department}</Badge>
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
                            Inactive
                          </Badge>
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

      {/* Task Modals */}
      <TaskCreateModal
        isOpen={isTaskCreateModalOpen}
        onClose={handleCloseTaskModals}
        onTaskCreated={handleCreateTask}
      />

      <TaskEditModal
        isOpen={isTaskEditModalOpen}
        onClose={handleCloseTaskModals}
        task={selectedTask}
        onTaskUpdated={handleUpdateTask}
      />

      <TaskDetailsModal
        isOpen={isTaskDetailsModalOpen}
        onClose={handleCloseTaskModals}
        task={selectedTask}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        onApprove={handleApproveTask}
        onReject={handleRejectTask}
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

      {/* Work Submission Review Modal */}
      <WorkSubmissionReviewModal
        submission={selectedWorkSubmission}
        isOpen={isWorkSubmissionModalOpen}
        onClose={handleCloseWorkSubmissionModal}
        onReview={handleReviewWorkSubmission}
      />
    </div>
  );
}
