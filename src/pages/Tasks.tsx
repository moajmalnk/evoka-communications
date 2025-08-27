import { useState } from 'react';
import { Plus, Filter, Search, MoreHorizontal, Calendar, User, AlertCircle } from 'lucide-react';
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

// Mock task data
const mockTasks = [
  {
    id: 'T-001',
    title: 'Design Homepage Wireframes',
    project: 'Website Redesign',
    category: 'Design',
    priority: 'High',
    status: 'In Progress',
    assignedTo: 'John Doe',
    dueDate: '2024-01-20',
    description: 'Create wireframes for the homepage layout',
  },
  {
    id: 'T-002', 
    title: 'Setup Database Schema',
    project: 'Mobile App Development',
    category: 'Development',
    priority: 'Medium',
    status: 'Pending',
    assignedTo: 'Jane Smith',
    dueDate: '2024-01-25',
    description: 'Design and implement the database structure',
  },
  {
    id: 'T-003',
    title: 'Create Brand Guidelines',
    project: 'Brand Identity Design',
    category: 'Design',
    priority: 'Low',
    status: 'Completed',
    assignedTo: 'Mike Johnson',
    dueDate: '2024-01-15',
    description: 'Develop comprehensive brand guidelines document',
  },
  {
    id: 'T-004',
    title: 'Content Strategy Planning',
    project: 'Marketing Campaign',
    category: 'Marketing',
    priority: 'High',
    status: 'Rejected',
    assignedTo: 'Sarah Wilson',
    dueDate: '2024-01-30',
    description: 'Plan content strategy for the upcoming campaign',
  },
];

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'priority-high';
    case 'medium':
      return 'priority-medium';
    case 'low':
      return 'priority-low';
    default:
      return '';
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'status-completed';
    case 'in progress':
      return 'status-in-progress';
    case 'pending':
      return 'status-pending';
    case 'rejected':
      return 'status-rejected';
    default:
      return '';
  }
};

const isOverdue = (dueDate: string) => {
  return new Date(dueDate) < new Date();
};

export function Tasks() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filteredTasks = mockTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status.toLowerCase() === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority.toLowerCase() === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPageTitle = () => {
    return user?.role === 'employee' ? 'My Tasks' : 'All Tasks';
  };

  const getPageDescription = () => {
    return user?.role === 'employee' 
      ? 'View and manage tasks assigned to you'
      : 'Manage and track all tasks across projects';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{getPageTitle()}</h1>
          <p className="text-muted-foreground">{getPageDescription()}</p>
        </div>
        {user?.role !== 'employee' && (
          <Button className="bg-gradient-primary shadow-primary">
            <Plus className="mr-2 h-4 w-4" />
            New Task
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
                placeholder="Search tasks or projects..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks ({filteredTasks.length})</CardTitle>
          <CardDescription>
            {user?.role === 'employee' 
              ? 'Your assigned tasks and their current status'
              : 'Complete list of tasks across all projects'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <div className="font-medium">{task.title}</div>
                      <div className="text-sm text-muted-foreground">{task.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>{task.project}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`border ${getPriorityColor(task.priority)}`}
                    >
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={`border ${getStatusColor(task.status)}`}
                    >
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {task.assignedTo}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className={isOverdue(task.dueDate) && task.status !== 'Completed' ? 'text-destructive font-medium' : ''}>
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                      {isOverdue(task.dueDate) && task.status !== 'Completed' && (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
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
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        {user?.role !== 'employee' && (
                          <>
                            <DropdownMenuItem>Edit Task</DropdownMenuItem>
                            <DropdownMenuItem>Reassign</DropdownMenuItem>
                          </>
                        )}
                        {user?.role === 'employee' && task.status === 'In Progress' && (
                          <DropdownMenuItem>Submit Work</DropdownMenuItem>
                        )}
                        {user?.role !== 'employee' && (
                          <DropdownMenuItem className="text-destructive">
                            Delete Task
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredTasks.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No tasks found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}