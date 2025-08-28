import { useState } from 'react';
import { 
  FolderOpen, Search, MoreHorizontal, Eye, CheckCircle, XCircle, Clock, 
  TrendingUp, Users, FileText, Calendar, Filter, Plus, Target, CheckSquare, Edit 
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

// Mock data for Project Coordinator dashboard
const mockAssignedProjects = [
  {
    id: 'PRJ-001',
    name: 'Website Redesign',
    client: 'TechCorp Inc.',
    status: 'In Progress',
    progress: 75,
    teamSize: 8,
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    priority: 'High',
    assignedEmployees: ['John Doe', 'Jane Smith', 'Mike Johnson']
  },
  {
    id: 'PRJ-002',
    name: 'Brand Identity Package',
    client: 'StartupXYZ',
    status: 'Completed',
    progress: 100,
    teamSize: 5,
    startDate: '2023-11-01',
    endDate: '2024-02-28',
    priority: 'Medium',
    assignedEmployees: ['Sarah Wilson', 'David Brown']
  },
  {
    id: 'PRJ-003',
    name: 'Marketing Campaign',
    client: 'Global Retail',
    status: 'Planning',
    progress: 25,
    teamSize: 12,
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    priority: 'High',
    assignedEmployees: ['Emily Davis', 'Alex Turner', 'Lisa Chen']
  }
];

const mockDailyTasks = [
  {
    id: 'TASK-001',
    title: 'Design Homepage Mockup',
    projectName: 'Website Redesign',
    assignedTo: 'Jane Smith',
    priority: 'High',
    status: 'In Progress',
    dueDate: '2024-03-20',
    estimatedHours: 8,
    actualHours: 4
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
    actualHours: 5
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
    actualHours: 0
  }
];

const mockWorkSubmissions = [
  {
    id: 'WS-001',
    employeeName: 'Jane Smith',
    projectName: 'Website Redesign',
    workType: 'Design Mockup',
    submittedDate: '2024-03-15',
    status: 'Pending Review',
    priority: 'High',
    timeSpent: 8,
    description: 'Completed homepage design with responsive layout'
  },
  {
    id: 'WS-002',
    employeeName: 'John Doe',
    projectName: 'Website Redesign',
    workType: 'Frontend Development',
    submittedDate: '2024-03-14',
    status: 'Approved',
    priority: 'Medium',
    timeSpent: 6,
    description: 'Implemented contact form with validation'
  },
  {
    id: 'WS-003',
    employeeName: 'Sarah Wilson',
    projectName: 'Brand Identity Package',
    workType: 'Logo Design',
    submittedDate: '2024-03-13',
    status: 'Rejected',
    priority: 'Low',
    timeSpent: 4,
    description: 'Initial logo concepts - needs revision'
  }
];

export function ProjectCoordinator() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

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

  const filteredProjects = mockAssignedProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status.toLowerCase() === statusFilter;
    const matchesPriority = priorityFilter === 'all' || project.priority.toLowerCase() === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalProjects = mockAssignedProjects.length;
  const activeProjects = mockAssignedProjects.filter(p => p.status === 'In Progress').length;
  const completedProjects = mockAssignedProjects.filter(p => p.status === 'Completed').length;
  const pendingReviews = mockWorkSubmissions.filter(w => w.status === 'Pending Review').length;
  const totalTeamMembers = mockAssignedProjects.reduce((sum, p) => sum + p.teamSize, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Coordinator Dashboard</h1>
          <p className="text-muted-foreground">
            Manage assigned projects, assign daily tasks, and verify work submissions
          </p>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <CustomClock variant="detailed" />
          <div className="flex gap-2">
            <Button className="bg-gradient-primary shadow-primary">
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
            <Button variant="outline">
              <CheckSquare className="mr-2 h-4 w-4" />
              Assign Task
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              Under management
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              In progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{completedProjects}</div>
            <p className="text-xs text-muted-foreground">
              Successfully delivered
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingReviews}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{totalTeamMembers}</div>
            <p className="text-xs text-muted-foreground">
              Across projects
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Assigned Projects</TabsTrigger>
          <TabsTrigger value="daily_tasks">Daily Tasks</TabsTrigger>
          <TabsTrigger value="work_submissions">Work Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Search and Filter Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="h-5 w-5" />Quick Search & Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search projects, tasks, or submissions..."
                    className="pl-10"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Filter by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    <SelectItem value="projects">Projects</SelectItem>
                    <SelectItem value="tasks">Tasks</SelectItem>
                    <SelectItem value="submissions">Submissions</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Advanced Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Overview Content */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Project Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Assigned Projects</span>
                    <span className="font-medium">{totalProjects}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Active Projects</span>
                    <span className="font-medium text-green-600">{activeProjects}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Completed Projects</span>
                    <span className="font-medium text-blue-600">{completedProjects}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  Task Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Pending Reviews</span>
                    <span className="font-medium text-yellow-600">{pendingReviews}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Team Members</span>
                    <span className="font-medium text-purple-600">{totalTeamMembers}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Success Rate</span>
                    <span className="font-medium text-green-600">
                      {totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg Project Progress</span>
                    <span className="font-medium">
                      {totalProjects > 0 ? Math.round(mockAssignedProjects.reduce((sum, p) => sum + p.progress, 0) / totalProjects) : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          {/* Project Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />Project Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search projects by name or client..."
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
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="in progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Projects Table */}
          <Card>
            <CardHeader>
              <CardTitle>Assigned Projects ({filteredProjects.length})</CardTitle>
              <CardDescription>
                Monitor project progress and team performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Timeline</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjects.map((project) => (
                      <TableRow key={project.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="font-medium">{project.name}</div>
                          <div className="text-sm text-muted-foreground">{project.id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{project.client}</div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={project.status === 'Completed' ? 'default' : 
                                   project.status === 'In Progress' ? 'secondary' : 'outline'}
                          >
                            {project.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{project.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {project.teamSize}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{new Date(project.startDate).toLocaleDateString()}</div>
                            <div className="text-muted-foreground">
                              to {new Date(project.endDate).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={project.priority === 'High' ? 'destructive' : 
                                   project.priority === 'Medium' ? 'secondary' : 'outline'}
                          >
                            {project.priority}
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
                              <DropdownMenuItem><CheckSquare className="mr-2 h-4 w-4" />Assign Tasks</DropdownMenuItem>
                              <DropdownMenuItem><Users className="mr-2 h-4 w-4" />Manage Team</DropdownMenuItem>
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

        <TabsContent value="daily_tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Tasks ({mockDailyTasks.length})</CardTitle>
              <CardDescription>
                Monitor task assignments and progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Time Tracking</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockDailyTasks.map((task) => (
                      <TableRow key={task.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="font-medium">{task.title}</div>
                          <div className="text-sm text-muted-foreground">{task.id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{task.projectName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                                {task.assignedTo.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{task.assignedTo}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={task.priority === 'High' ? 'destructive' : 
                                   task.priority === 'Medium' ? 'secondary' : 'outline'}
                          >
                            {task.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={task.status === 'Completed' ? 'default' : 
                                   task.status === 'In Progress' ? 'secondary' : 'outline'}
                          >
                            {task.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{task.actualHours}h / {task.estimatedHours}h</div>
                            <div className="text-muted-foreground">
                              {Math.round((task.actualHours / task.estimatedHours) * 100)}% complete
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="mr-2 h-4 w-4" />View
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="mr-2 h-4 w-4" />Edit
                            </Button>
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

        <TabsContent value="work_submissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Work Submissions ({mockWorkSubmissions.length})</CardTitle>
              <CardDescription>
                Review and verify employee work submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Work Type</TableHead>
                      <TableHead>Submitted Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Time Spent</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockWorkSubmissions.map((submission) => (
                      <TableRow key={submission.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                                {submission.employeeName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="font-medium">{submission.employeeName}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{submission.projectName}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{submission.workType}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(submission.submittedDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={submission.status === 'Approved' ? 'default' : 
                                   submission.status === 'Pending Review' ? 'secondary' : 'destructive'}
                          >
                            {submission.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={submission.priority === 'High' ? 'destructive' : 
                                   submission.priority === 'Medium' ? 'secondary' : 'outline'}
                          >
                            {submission.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{submission.timeSpent}h</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {submission.status === 'Pending Review' && (
                              <>
                                <Button size="sm" variant="outline" className="text-green-600">
                                  <CheckCircle className="mr-2 h-4 w-4" />Approve
                                </Button>
                                <Button size="sm" variant="outline" className="text-red-600">
                                  <XCircle className="mr-2 h-4 w-4" />Reject
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="outline">
                              <Eye className="mr-2 h-4 w-4" />View
                            </Button>
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
      </Tabs>

      {/* Custom Components Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Custom Components Demo
          </CardTitle>
          <CardDescription>
            Showcasing our custom clock and calendar components in the Project Coordinator dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Clock Variants</h4>
              <div className="space-y-2">
                <CustomClock variant="compact" />
                <CustomClock variant="default" />
                <CustomClock variant="detailed" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Calendar Variants</h4>
              <div className="space-y-2">
                <CustomCalendar variant="compact" />
                <CustomCalendar variant="date-display" />
                <CustomCalendar variant="default" />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Date Formats</h4>
              <div className="space-y-2">
                <CustomCalendar variant="compact" format="short" />
                <CustomCalendar variant="compact" format="long" />
                <CustomCalendar variant="compact" format="relative" />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Interactive Calendar</h4>
              <CustomCalendar variant="inline" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
