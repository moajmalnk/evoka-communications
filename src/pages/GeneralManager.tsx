import { useState } from 'react';
import { 
  Building2, Search, MoreHorizontal, Eye, CheckCircle, XCircle, Clock, 
  TrendingUp, TrendingDown, DollarSign, Users, FileText, Calendar, Filter 
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

// Mock data for General Manager dashboard
const mockProjects = [
  {
    id: 'PRJ-001',
    name: 'Website Redesign',
    client: 'TechCorp Inc.',
    status: 'In Progress',
    progress: 75,
    teamSize: 8,
    budget: 50000,
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    priority: 'High'
  },
  {
    id: 'PRJ-002',
    name: 'Brand Identity Package',
    client: 'StartupXYZ',
    status: 'Completed',
    progress: 100,
    teamSize: 5,
    budget: 25000,
    startDate: '2023-11-01',
    endDate: '2024-02-28',
    priority: 'Medium'
  },
  {
    id: 'PRJ-003',
    name: 'Marketing Campaign',
    client: 'Global Retail',
    status: 'Planning',
    progress: 25,
    teamSize: 12,
    budget: 75000,
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    priority: 'High'
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

export function GeneralManager() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

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

  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status.toLowerCase() === statusFilter;
    const matchesPriority = priorityFilter === 'all' || project.priority.toLowerCase() === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const pendingApprovals = mockWorkApprovals.filter(w => w.status === 'Pending').length;
  const totalProjects = mockProjects.length;
  const activeProjects = mockProjects.filter(p => p.status === 'In Progress').length;
  const completedProjects = mockProjects.filter(p => p.status === 'Completed').length;
  const totalBudget = mockProjects.reduce((sum, p) => sum + p.budget, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">General Manager Dashboard</h1>
          <p className="text-muted-foreground">
            Oversee projects, approve work, and manage company operations
          </p>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <CustomClock variant="detailed" />
          <div className="flex gap-2">
            <Button className="bg-gradient-primary shadow-primary">
              <Building2 className="mr-2 h-4 w-4" />
              New Project
            </Button>
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              Company-wide
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
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${(totalBudget / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground">
              All projects
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="work_approvals">Work Approvals</TabsTrigger>
          <TabsTrigger value="financial_approvals">Financial Approvals</TabsTrigger>
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
                    placeholder="Search projects, employees, or approvals..."
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
                    <SelectItem value="approvals">Approvals</SelectItem>
                    <SelectItem value="employees">Employees</SelectItem>
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
                  <Building2 className="h-5 w-5" />
                  Company Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Projects</span>
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
                  <Users className="h-5 w-5" />
                  Team Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Pending Approvals</span>
                    <span className="font-medium text-yellow-600">{pendingApprovals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Budget</span>
                    <span className="font-medium text-green-600">${(totalBudget / 1000).toFixed(0)}K</span>
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
                    <span className="text-sm text-muted-foreground">Avg Project Duration</span>
                    <span className="font-medium">45 days</span>
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
              <CardTitle>Projects Overview ({filteredProjects.length})</CardTitle>
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
                      <TableHead>Team Size</TableHead>
                      <TableHead>Budget</TableHead>
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
                          <div className="font-medium text-green-600">
                            ${project.budget.toLocaleString()}
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
                              <DropdownMenuItem><CheckCircle className="mr-2 h-4 w-4" />Approve</DropdownMenuItem>
                              <DropdownMenuItem><XCircle className="mr-2 h-4 w-4" />Reject</DropdownMenuItem>
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

        <TabsContent value="work_approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Work Approvals ({mockWorkApprovals.length})</CardTitle>
              <CardDescription>
                Review and approve employee work submissions
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
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockWorkApprovals.map((approval) => (
                      <TableRow key={approval.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                                {approval.employeeName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="font-medium">{approval.employeeName}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{approval.projectName}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{approval.workType}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(approval.submittedDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={approval.status === 'Approved' ? 'default' : 
                                   approval.status === 'Pending' ? 'secondary' : 'destructive'}
                          >
                            {approval.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={approval.priority === 'High' ? 'destructive' : 
                                   approval.priority === 'Medium' ? 'secondary' : 'outline'}
                          >
                            {approval.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {approval.status === 'Pending' && (
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

        <TabsContent value="financial_approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Approvals ({mockFinancialApprovals.length})</CardTitle>
              <CardDescription>
                Review and approve financial transactions and expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Submitted By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockFinancialApprovals.map((approval) => (
                      <TableRow key={approval.id} className="hover:bg-muted/50">
                        <TableCell>
                          <Badge variant="outline">{approval.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{approval.description}</div>
                        </TableCell>
                        <TableCell>
                          <div className={`font-bold ${approval.type === 'Invoice' ? 'text-green-600' : 'text-red-600'}`}>
                            ${approval.amount.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{approval.submittedBy}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(approval.submittedDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={approval.status === 'Approved' ? 'default' : 
                                   approval.status === 'Pending' ? 'secondary' : 'destructive'}
                          >
                            {approval.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{approval.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {approval.status === 'Pending' && (
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
      </Tabs>
    </div>
  );
}
