import { useState, useEffect, useCallback } from 'react';
import { Plus, Filter, Search, MoreHorizontal, Calendar, User, Tag, Eye, FileText, Clock, CheckCircle, XCircle, AlertTriangle, MessageSquare, RotateCcw, List, Layers } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Skeleton } from '@/components/ui/skeleton';
import { WorkSubmission, WorkSubmissionStatus, WorkSubmissionFormData } from '@/types/workSubmission';
import { workSubmissionService, mockWorkSubmissions } from '@/lib/workSubmissionService';
import { mockProjects } from '@/lib/projectService';
import { mockEmployees, taskService } from '@/lib/taskService';
import { WorkSubmissionCreateModal } from '@/components/workSubmissions/WorkSubmissionCreateModal';
import { WorkSubmissionReviewModal } from '@/components/workSubmissions/WorkSubmissionDetailsModal';
import { WorkSubmissionStats } from '@/components/workSubmissions/WorkSubmissionStats';
import { useToast } from '@/hooks/use-toast';

export function WorkSubmissions() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [submissions, setSubmissions] = useState<WorkSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<WorkSubmission[]>([]);
  const [mainTaskSubmissions, setMainTaskSubmissions] = useState<WorkSubmission[]>([]);
  const [subTaskSubmissions, setSubTaskSubmissions] = useState<WorkSubmission[]>([]);
  const [filteredMainTaskSubmissions, setFilteredMainTaskSubmissions] = useState<WorkSubmission[]>([]);
  const [filteredSubTaskSubmissions, setFilteredSubTaskSubmissions] = useState<WorkSubmission[]>([]);
  const [activeTab, setActiveTab] = useState<'main' | 'sub'>('main');
  const [parentTaskTitles, setParentTaskTitles] = useState<Record<string, string>>({});
  const [stats, setStats] = useState({
    total: 0,
    pendingReview: 0,
    approved: 0,
    rejected: 0,
    needsRevision: 0,
    approvalRate: 0,
  });
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<WorkSubmission | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const loadSubmissions = useCallback(async () => {
    try {
      setIsLoading(true);
      const [submissionsData, statsData] = await Promise.all([
        workSubmissionService.getWorkSubmissions(),
        workSubmissionService.getWorkSubmissionStats(),
      ]);
      
      // Filter submissions based on user role
      let filteredData = submissionsData;
      if (user?.role === 'employee') {
        filteredData = submissionsData.filter(submission => submission.employeeId === user.id);
      } else if (user?.role === 'project_coordinator') {
        // In a real app, this would filter based on assigned projects
        filteredData = submissionsData;
      }
      
      setSubmissions(filteredData);
      setStats(statsData);

      // Separate submissions by task type
      const mainTasks = [];
      const subTasks = [];
      const parentTaskMap: Record<string, string> = {};

      for (const submission of filteredData) {
        try {
          const task = await taskService.getTaskById(submission.taskId);
          if (task) {
            if (task.taskType === 'main') {
              mainTasks.push(submission);
            } else if (task.taskType === 'sub') {
              subTasks.push(submission);
              // Store parent task title for sub tasks
              if (task.parentTaskTitle) {
                parentTaskMap[submission.taskId] = task.parentTaskTitle;
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching task ${submission.taskId}:`, error);
          // If we can't determine the task type, default to main task
          mainTasks.push(submission);
        }
      }

      setMainTaskSubmissions(mainTasks);
      setSubTaskSubmissions(subTasks);
      setParentTaskTitles(parentTaskMap);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load work submissions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.role, toast]);

  const filterSubmissions = useCallback(() => {
    // Filter main task submissions
    let filteredMain = mainTaskSubmissions;

    // Search filter
    if (searchTerm) {
      filteredMain = filteredMain.filter(submission => 
        submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.taskTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filteredMain = filteredMain.filter(submission => submission.status === statusFilter);
    }

    // Project filter
    if (projectFilter !== 'all') {
      filteredMain = filteredMain.filter(submission => submission.projectId === projectFilter);
    }

    // Employee filter
    if (employeeFilter !== 'all') {
      filteredMain = filteredMain.filter(submission => submission.employeeId === employeeFilter);
    }

    setFilteredMainTaskSubmissions(filteredMain);

    // Filter sub task submissions
    let filteredSub = subTaskSubmissions;

    // Search filter
    if (searchTerm) {
      filteredSub = filteredSub.filter(submission => 
        submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.taskTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filteredSub = filteredSub.filter(submission => submission.status === statusFilter);
    }

    // Project filter
    if (projectFilter !== 'all') {
      filteredSub = filteredSub.filter(submission => submission.projectId === projectFilter);
    }

    // Employee filter
    if (employeeFilter !== 'all') {
      filteredSub = filteredSub.filter(submission => submission.employeeId === employeeFilter);
    }

    setFilteredSubTaskSubmissions(filteredSub);

    // Set combined filtered submissions for backward compatibility
    setFilteredSubmissions([...filteredMain, ...filteredSub]);
  }, [mainTaskSubmissions, subTaskSubmissions, searchTerm, statusFilter, projectFilter, employeeFilter]);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setProjectFilter('all');
    setEmployeeFilter('all');
  };

  const handleCreateSubmission = async (data: WorkSubmissionFormData) => {
    try {
      setIsCreating(true);
      const newSubmission = await workSubmissionService.createWorkSubmission(data, user?.id || '');
      
      // Refresh submissions list
      await loadSubmissions();
      
      toast({
        title: 'Success',
        description: `Work submission "${newSubmission.title}" created successfully!`,
      });
    } catch (error) {
      console.error('Error creating submission:', error);
      toast({
        title: 'Error',
        description: 'Failed to create work submission. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleViewSubmission = (submission: WorkSubmission) => {
    setSelectedSubmission(submission);
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmission = async (submissionId: string, review: { status: WorkSubmissionStatus; rejectionReason?: string }) => {
    try {
      const reviewData = {
        submissionId,
        status: review.status,
        feedback: review.rejectionReason || '',
        rejectionReason: review.rejectionReason
      };
      await workSubmissionService.reviewWorkSubmission(
        submissionId, 
        reviewData, 
        user?.id || '', 
        user?.role || ''
      );
      
      // Refresh submissions list
      await loadSubmissions();
      
      const action = review.status === 'approved' ? 'approved' : 
                    review.status === 'rejected' ? 'rejected' : 'requested revision for';
      
      toast({
        title: 'Success',
        description: `Work submission ${action} successfully!`,
      });
    } catch (error) {
      console.error('Error reviewing submission:', error);
      toast({
        title: 'Error',
        description: 'Failed to review submission. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const canCreateSubmission = user?.role === 'employee';
  const canReview = user?.role === 'project_coordinator' || 
                   user?.role === 'admin' || 
                   user?.role === 'general_manager';

  const getStatusVariant = (status: WorkSubmissionStatus) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending_review':
        return 'outline';
      case 'needs_revision':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: WorkSubmissionStatus) => {
    switch (status) {
      case 'approved':
        return 'text-white';
      case 'pending_review':
        return 'text-yellow-600';
      case 'needs_revision':
        return 'text-orange-600';
      case 'rejected':
        return 'text-red-700';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusLabel = (status: WorkSubmissionStatus) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'pending_review':
        return 'Pending Review';
      case 'needs_revision':
        return 'Needs Revision';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  // Skeleton loading components
  const SubmissionTableSkeleton = ({ showParentTask = false }: { showParentTask?: boolean }) => (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Work Submission</TableHead>
              {showParentTask && <TableHead>Parent Task</TableHead>}
              <TableHead>Project</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Time Spent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </TableCell>
                {showParentTask && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </TableCell>
                )}
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const FiltersSkeleton = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-16" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
          {user?.role !== 'employee' && (
            <Skeleton className="h-10 w-40" />
          )}
          <Skeleton className="h-10 w-20" />
        </div>
      </CardContent>
    </Card>
  );

  const StatsSkeleton = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-12 mb-1" />
            <Skeleton className="h-3 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Load submissions on component mount
  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  // Filter submissions when filters change
  useEffect(() => {
    filterSubmissions();
  }, [filterSubmissions]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          {canCreateSubmission && (
            <Skeleton className="h-10 w-32" />
          )}
        </div>

        {/* Stats Skeleton */}
        <StatsSkeleton />

        {/* Tabs Skeleton */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'main' | 'sub')} className="space-y-4">
          <TabsList>
            <TabsTrigger value="main">Main Tasks</TabsTrigger>
            <TabsTrigger value="sub">Sub Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="main" className="space-y-4">
            <FiltersSkeleton />
            <SubmissionTableSkeleton />
          </TabsContent>

          <TabsContent value="sub" className="space-y-4">
            <FiltersSkeleton />
            <SubmissionTableSkeleton showParentTask={true} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {user?.role === 'employee' ? 'My Work Submissions' : 
             user?.role === 'project_coordinator' ? 'Work Submissions Review' : 
             'Work Submissions'}
          </h1>
          <p className="text-muted-foreground">
            {user?.role === 'employee' 
              ? 'Submit and track your completed work'
              : user?.role === 'project_coordinator'
              ? 'Review and approve employee work submissions'
              : 'Monitor all work submissions across projects'
            }
          </p>
        </div>
        {canCreateSubmission && (
          <Button 
            className="bg-gradient-primary shadow-primary"
            onClick={() => setIsCreateModalOpen(true)}
            disabled={isCreating}
          >
            <Plus className="mr-2 h-4 w-4" />
            {isCreating ? 'Creating...' : 'Submit Work'}
          </Button>
        )}
      </div>

      {/* Work Submission Statistics */}
      <WorkSubmissionStats stats={stats} />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'main' | 'sub')} className="space-y-4">
        <TabsList>
          <TabsTrigger value="main">Main Tasks</TabsTrigger>
          <TabsTrigger value="sub">Sub Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="main" className="space-y-4">
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
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search submissions, projects, or employees..."
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
                    <SelectItem value="pending_review">Pending Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="needs_revision">Needs Revision</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {mockProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {user?.role !== 'employee' && (
                  <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                    <SelectTrigger className="w-full md:w-40">
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
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="w-full md:w-auto"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Main Task Submissions Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                Main Task Submissions ({filteredMainTaskSubmissions.length})
              </CardTitle>
              <CardDescription>
                {user?.role === 'employee' 
                  ? 'Your work submissions for main tasks and their review status'
                  : 'All work submissions for main tasks requiring review and approval'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Work Submission</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Time Spent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMainTaskSubmissions.map((submission) => (
                    <TableRow key={submission.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell onClick={() => handleViewSubmission(submission)}>
                        <div>
                          <div className="font-medium">{submission.title}</div>
                          <div className="text-sm text-muted-foreground">{submission.id}</div>
                          <div className="text-sm text-muted-foreground">Task: {submission.taskTitle}</div>
                        </div>
                      </TableCell>
                      <TableCell onClick={() => handleViewSubmission(submission)}>
                        {submission.projectName}
                      </TableCell>
                      <TableCell onClick={() => handleViewSubmission(submission)}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {submission.employeeName}
                        </div>
                      </TableCell>
                      <TableCell onClick={() => handleViewSubmission(submission)}>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {submission.timeSpent} hours
                        </div>
                      </TableCell>
                      <TableCell onClick={() => handleViewSubmission(submission)}>
                        <Badge 
                          variant={getStatusVariant(submission.status)}
                          className={getStatusColor(submission.status)}
                        >
                          {getStatusLabel(submission.status)}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={() => handleViewSubmission(submission)}>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm">
                              {new Date(submission.submissionDate).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(submission.submissionDate).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                     
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredMainTaskSubmissions.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No main task submissions found matching your criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sub" className="space-y-4">
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
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search submissions, projects, or employees..."
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
                    <SelectItem value="pending_review">Pending Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="needs_revision">Needs Revision</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {mockProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {user?.role !== 'employee' && (
                  <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                    <SelectTrigger className="w-full md:w-40">
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
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="w-full md:w-auto"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sub Task Submissions Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Sub Task Submissions ({filteredSubTaskSubmissions.length})
              </CardTitle>
              <CardDescription>
                {user?.role === 'employee' 
                  ? 'Your work submissions for sub tasks and their review status'
                  : 'All work submissions for sub tasks requiring review and approval'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Work Submission</TableHead>
                    <TableHead>Parent Task</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Time Spent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubTaskSubmissions.map((submission) => (
                    <TableRow key={submission.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell onClick={() => handleViewSubmission(submission)}>
                        <div>
                          <div className="font-medium">{submission.title}</div>
                          <div className="text-sm text-muted-foreground">{submission.id}</div>
                          <div className="text-sm text-muted-foreground">Task: {submission.taskTitle}</div>
                        </div>
                      </TableCell>
                      <TableCell onClick={() => handleViewSubmission(submission)}>
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {parentTaskTitles[submission.taskId] || 'Unknown Parent'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell onClick={() => handleViewSubmission(submission)}>
                        {submission.projectName}
                      </TableCell>
                      <TableCell onClick={() => handleViewSubmission(submission)}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {submission.employeeName}
                        </div>
                      </TableCell>
                      <TableCell onClick={() => handleViewSubmission(submission)}>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {submission.timeSpent} hours
                        </div>
                      </TableCell>
                      <TableCell onClick={() => handleViewSubmission(submission)}>
                        <Badge 
                          variant={getStatusVariant(submission.status)}
                          className={getStatusColor(submission.status)}
                        >
                          {getStatusLabel(submission.status)}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={() => handleViewSubmission(submission)}>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm">
                              {new Date(submission.submissionDate).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(submission.submissionDate).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </TableCell>
     
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredSubTaskSubmissions.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No sub task submissions found matching your criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Work Submission Creation Modal */}
      <WorkSubmissionCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmission}
        employeeId={user?.id || ''}
      />

      {/* Work Submission Review Modal */}
      <WorkSubmissionReviewModal
        submission={selectedSubmission}
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedSubmission(null);
        }}
        onReview={handleReviewSubmission}
      />
    </div>
  );
}