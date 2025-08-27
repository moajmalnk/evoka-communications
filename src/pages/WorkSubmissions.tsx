import { useState } from 'react';
import { Plus, Search, MoreHorizontal, Calendar, User, FileText, Clock } from 'lucide-react';
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

// Mock work submission data
const mockSubmissions = [
  {
    id: 'WS-001',
    title: 'Homepage Wireframes Completed',
    task: 'Design Homepage Wireframes',
    project: 'Website Redesign',
    employee: 'John Doe',
    coordinator: 'Alice Johnson',
    timeSpent: '8 hours',
    submissionDate: '2024-01-20T14:30:00Z',
    status: 'Pending Review',
    description: 'Completed wireframes for all homepage sections including hero, features, and footer.',
    attachments: ['wireframes-v1.pdf', 'notes.txt'],
  },
  {
    id: 'WS-002',
    title: 'Database Schema Implementation',
    task: 'Setup Database Schema',
    project: 'Mobile App Development',
    employee: 'Jane Smith',
    coordinator: 'Bob Smith',
    timeSpent: '12 hours',
    submissionDate: '2024-01-19T16:45:00Z',
    status: 'Approved',
    description: 'Successfully implemented the complete database schema with all required tables and relationships.',
    attachments: ['schema.sql', 'documentation.md'],
  },
  {
    id: 'WS-003',
    title: 'Brand Guidelines Document',
    task: 'Create Brand Guidelines',
    project: 'Brand Identity Design',
    employee: 'Mike Johnson',
    coordinator: 'Carol Davis',
    timeSpent: '16 hours',
    submissionDate: '2024-01-18T11:20:00Z',
    status: 'Needs Revision',
    description: 'Created comprehensive brand guidelines including logo usage, color palette, and typography.',
    attachments: ['brand-guidelines.pdf', 'logo-files.zip'],
  },
  {
    id: 'WS-004',
    title: 'Content Strategy Draft',
    task: 'Content Strategy Planning',
    project: 'Marketing Campaign',
    employee: 'Sarah Wilson',
    coordinator: 'David Wilson',
    timeSpent: '6 hours',
    submissionDate: '2024-01-17T09:15:00Z',
    status: 'Rejected',
    description: 'Initial draft of content strategy focusing on social media and email campaigns.',
    attachments: ['strategy-draft.docx'],
  },
];

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'status-completed';
    case 'pending review':
      return 'status-pending';
    case 'needs revision':
      return 'status-in-progress';
    case 'rejected':
      return 'status-rejected';
    default:
      return '';
  }
};

export function WorkSubmissions() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredSubmissions = mockSubmissions.filter(submission => {
    const matchesSearch = submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.employee.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || submission.status.toLowerCase() === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getPageTitle = () => {
    if (user?.role === 'employee') return 'My Work Submissions';
    if (user?.role === 'project_coordinator') return 'Work Submissions Review';
    return 'Work Submissions';
  };

  const getPageDescription = () => {
    if (user?.role === 'employee') return 'Submit and track your completed work';
    if (user?.role === 'project_coordinator') return 'Review and approve employee work submissions';
    return 'Monitor all work submissions across projects';
  };

  const canApprove = user?.role === 'project_coordinator' || user?.role === 'admin' || user?.role === 'general_manager';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{getPageTitle()}</h1>
          <p className="text-muted-foreground">{getPageDescription()}</p>
        </div>
        {user?.role === 'employee' && (
          <Button className="bg-gradient-primary shadow-primary">
            <Plus className="mr-2 h-4 w-4" />
            Submit Work
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search submissions or projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending review">Pending Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="needs revision">Needs Revision</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
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
                  <TableCell>
                    <div>
                      <div className="font-medium">{submission.title}</div>
                      <div className="text-sm text-muted-foreground">{submission.id}</div>
                      <div className="text-sm text-muted-foreground">Task: {submission.task}</div>
                    </div>
                  </TableCell>
                  <TableCell>{submission.project}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {submission.employee}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {submission.timeSpent}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={`border ${getStatusColor(submission.status)}`}
                    >
                      {submission.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
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
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {submission.attachments.length > 0 && (
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            View Attachments
                          </DropdownMenuItem>
                        )}
                        {canApprove && submission.status === 'Pending Review' && (
                          <>
                            <DropdownMenuItem className="text-success">
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-warning">
                              Request Revision
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Reject
                            </DropdownMenuItem>
                          </>
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
    </div>
  );
}