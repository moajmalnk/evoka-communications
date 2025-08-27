import { useState, useEffect } from 'react';
import { Plus, Filter, Search, MoreHorizontal, Calendar, User, Tag, Eye, FileText, Clock, CheckCircle, XCircle, AlertTriangle, MessageSquare } from 'lucide-react';
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
import { WorkSubmission, WorkSubmissionStatus } from '@/types/workSubmission';
import { workSubmissionService, mockWorkSubmissions } from '@/lib/workSubmissionService';
import { mockProjects } from '@/lib/projectService';
import { mockEmployees } from '@/lib/taskService';
import { WorkSubmissionCreateModal } from '@/components/workSubmissions/WorkSubmissionCreateModal';
import { WorkSubmissionReviewModal } from '@/components/workSubmissions/WorkSubmissionReviewModal';
import { WorkSubmissionStats } from '@/components/workSubmissions/WorkSubmissionStats';
import { useToast } from '@/hooks/use-toast';

export function WorkSubmissions() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [submissions, setSubmissions] = useState<WorkSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<WorkSubmission[]>([]);
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

  // Load submissions on component mount
  useEffect(() => {
    loadSubmissions();
  }, []);

  // Filter submissions when filters change
  useEffect(() => {
    filterSubmissions();
  }, [submissions, searchTerm, statusFilter, projectFilter, employeeFilter]);

  const loadSubmissions = async () => {
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
  };

  const filterSubmissions = () => {
    let filtered = submissions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(submission => 
        submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(submission => submission.status === statusFilter);
    }

    // Project filter
    if (projectFilter !== 'all') {
      filtered = filtered.filter(submission => submission.projectId === projectFilter);
    }

    // Employee filter
    if (employeeFilter !== 'all') {
      filtered = filtered.filter(submission => submission.employeeId === employeeFilter);
    }

    setFilteredSubmissions(filtered);
  };

  const handleCreateSubmission = async (data: any) => {
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

  const handleReviewSubmission = async (submissionId: string, review: any) => {
    try {
      await workSubmissionService.reviewWorkSubmission(
        submissionId, 
        review, 
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
        return 'text-green-600';
      case 'pending_review':
        return 'text-yellow-600';
      case 'needs_revision':
        return 'text-orange-600';
      case 'rejected':
        return 'text-red-600';
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Work Submissions</h1>
            <p className="text-muted-foreground">
              Submit and track work for review and approval
            </p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading submissions...</p>
        </div>
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
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Work Submissions ({filteredSubmissions.length})</CardTitle>
          <CardDescription>
            {user?.role === 'employee' 
              ? 'Your work submissions and their review status'
              : 'All work submissions requiring review and approval'
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
              {filteredSubmissions.map((submission) => (
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
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewSubmission(submission)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {submission.attachments.length > 0 && (
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            View Attachments
                          </DropdownMenuItem>
                        )}
                        {canReview && submission.status === 'pending_review' && (
                          <>
                            <DropdownMenuItem 
                              className="text-green-600"
                              onClick={() => handleReviewSubmission(submission.id, { status: 'approved' })}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-orange-600"
                              onClick={() => handleReviewSubmission(submission.id, { status: 'needs_revision' })}
                            >
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              Request Revision
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleReviewSubmission(submission.id, { status: 'rejected', rejectionReason: 'Work does not meet requirements' })}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        {submission.status === 'needs_revision' && (
                          <DropdownMenuItem>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            View Feedback
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredSubmissions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No work submissions found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

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