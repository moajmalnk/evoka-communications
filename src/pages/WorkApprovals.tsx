import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  Eye,
  MessageSquare,
  FileText,
  User,
  Calendar
} from 'lucide-react';

export default function WorkApprovals() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedProject, setSelectedProject] = useState('all');

  const workSubmissions = [
    {
      id: 1,
      employee: 'John Doe',
      project: 'Website Redesign',
      task: 'Homepage Layout',
      submittedDate: '2024-01-15',
      dueDate: '2024-01-20',
      status: 'pending',
      priority: 'high',
      description: 'Completed the homepage layout with responsive design and modern UI elements.',
      attachments: 3,
      hours: 8.5
    },
    {
      id: 2,
      employee: 'Jane Smith',
      project: 'Mobile App',
      task: 'User Authentication',
      submittedDate: '2024-01-14',
      dueDate: '2024-01-18',
      status: 'approved',
      priority: 'medium',
      description: 'Implemented secure user authentication with JWT tokens and refresh token rotation.',
      attachments: 2,
      hours: 12.0
    },
    {
      id: 3,
      employee: 'Mike Johnson',
      project: 'E-commerce Platform',
      task: 'Payment Integration',
      submittedDate: '2024-01-13',
      dueDate: '2024-01-25',
      status: 'rejected',
      priority: 'high',
      description: 'Integrated Stripe payment gateway with webhook handling and error management.',
      attachments: 5,
      hours: 16.0
    },
    {
      id: 4,
      employee: 'Sarah Wilson',
      project: 'Dashboard Analytics',
      task: 'Data Visualization',
      submittedDate: '2024-01-12',
      dueDate: '2024-01-22',
      status: 'pending',
      priority: 'low',
      description: 'Created interactive charts and graphs for the analytics dashboard.',
      attachments: 4,
      hours: 10.5
    }
  ];

  const projects = ['Website Redesign', 'Mobile App', 'E-commerce Platform', 'Dashboard Analytics'];
  const statuses = ['pending', 'approved', 'rejected'];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default"><CheckCircle className="mr-1 h-3 w-3" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="default">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const filteredSubmissions = workSubmissions.filter(submission => {
    const matchesSearch = 
      submission.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.task.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || submission.status === selectedStatus;
    const matchesProject = selectedProject === 'all' || submission.project === selectedProject;
    
    return matchesSearch && matchesStatus && matchesProject;
  });

  const pendingCount = workSubmissions.filter(s => s.status === 'pending').length;
  const approvedCount = workSubmissions.filter(s => s.status === 'approved').length;
  const rejectedCount = workSubmissions.filter(s => s.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Work Approvals</h1>
          <p className="text-muted-foreground">
            Review and approve work submissions from your team
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button>
            <CheckCircle className="mr-2 h-4 w-4" />
            Bulk Approve
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workSubmissions.length}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">
              Successfully approved
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedCount}</div>
            <p className="text-xs text-muted-foreground">
              Needs revision
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by employee, project, or task..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="project">Project</Label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {projects.map(project => (
                        <SelectItem key={project} value={project}>{project}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Work Submissions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Work Submissions</CardTitle>
              <CardDescription>
                Review and manage all work submissions from your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">{submission.employee}</TableCell>
                      <TableCell>{submission.project}</TableCell>
                      <TableCell>{submission.task}</TableCell>
                      <TableCell>{submission.submittedDate}</TableCell>
                      <TableCell>{submission.dueDate}</TableCell>
                      <TableCell>{getPriorityBadge(submission.priority)}</TableCell>
                      <TableCell>{getStatusBadge(submission.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="mr-1 h-3 w-3" />
                            View
                          </Button>
                          {submission.status === 'pending' && (
                            <>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Approve
                              </Button>
                              <Button variant="destructive" size="sm">
                                <XCircle className="mr-1 h-3 w-3" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Review</CardTitle>
              <CardDescription>
                Work submissions awaiting your approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workSubmissions
                  .filter(s => s.status === 'pending')
                  .map((submission) => (
                    <Card key={submission.id} className="border-l-4 border-l-yellow-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{submission.task}</h3>
                              {getPriorityBadge(submission.priority)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {submission.employee} • {submission.project}
                            </p>
                            <p className="text-sm">{submission.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Submitted: {submission.submittedDate}</span>
                              <span>Due: {submission.dueDate}</span>
                              <span>Hours: {submission.hours}</span>
                              <span>Attachments: {submission.attachments}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="mr-1 h-3 w-3" />
                              Review
                            </Button>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Approve
                            </Button>
                            <Button variant="destructive" size="sm">
                              <XCircle className="mr-1 h-3 w-3" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approved Work</CardTitle>
              <CardDescription>
                Work submissions that have been approved
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workSubmissions
                  .filter(s => s.status === 'approved')
                  .map((submission) => (
                    <Card key={submission.id} className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{submission.task}</h3>
                              {getPriorityBadge(submission.priority)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {submission.employee} • {submission.project}
                            </p>
                            <p className="text-sm">{submission.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Approved: {submission.submittedDate}</span>
                              <span>Hours: {submission.hours}</span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-1 h-3 w-3" />
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Work</CardTitle>
              <CardDescription>
                Work submissions that need revision
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workSubmissions
                  .filter(s => s.status === 'rejected')
                  .map((submission) => (
                    <Card key={submission.id} className="border-l-4 border-l-red-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{submission.task}</h3>
                              {getPriorityBadge(submission.priority)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {submission.employee} • {submission.project}
                            </p>
                            <p className="text-sm">{submission.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Rejected: {submission.submittedDate}</span>
                              <span>Hours: {submission.hours}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="mr-1 h-3 w-3" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="mr-1 h-3 w-3" />
                              Add Feedback
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
