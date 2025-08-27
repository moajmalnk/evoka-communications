import { useState, useEffect } from 'react';
import { Plus, Filter, Search, MoreHorizontal, Calendar, User, Tag, Eye, Edit, Trash2, FileText, AlertTriangle, Clock, PlayCircle, CheckCircle, XCircle } from 'lucide-react';
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
import { Task, TaskPriority, TaskStatus } from '@/types/task';
import { taskService, mockTaskCategories, mockEmployees } from '@/lib/taskService';
import { mockProjects } from '@/lib/projectService';
import { TaskCreateModal } from '@/components/tasks/TaskCreateModal';
import { TaskDetailsModal } from '@/components/tasks/TaskDetailsModal';
import { TaskStats } from '@/components/tasks/TaskStats';
import { useToast } from '@/hooks/use-toast';

export function Tasks() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    rejected: 0,
    overdue: 0,
    completionRate: 0,
  });
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
  }, []);

  // Filter tasks when filters change
  useEffect(() => {
    filterTasks();
  }, [tasks, searchTerm, statusFilter, priorityFilter, categoryFilter, projectFilter, employeeFilter]);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const [tasksData, statsData] = await Promise.all([
        taskService.getTasks(),
        taskService.getTaskStats(),
      ]);
      
      // Filter tasks based on user role
      let filteredData = tasksData;
      if (user?.role === 'employee') {
        filteredData = tasksData.filter(task => task.assignedEmployee === user.id);
      }
      
      setTasks(filteredData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tasks. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = tasks;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.projectName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(task => task.category === categoryFilter);
    }

    // Project filter
    if (projectFilter !== 'all') {
      filtered = filtered.filter(task => task.projectId === projectFilter);
    }

    // Employee filter
    if (employeeFilter !== 'all') {
      filtered = filtered.filter(task => task.assignedEmployee === employeeFilter);
    }

    setFilteredTasks(filtered);
  };

  const handleCreateTask = async (data: any) => {
    try {
      setIsCreating(true);
      const newTask = await taskService.createTask(data, user?.id || '');
      
      // Refresh tasks list
      await loadTasks();
      
      toast({
        title: 'Success',
        description: `Task "${newTask.title}" created successfully!`,
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to create task. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setIsDetailsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    // TODO: Implement edit functionality
    toast({
      title: 'Coming Soon',
      description: 'Task editing will be available in the next update.',
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId);
      await loadTasks();
      
      toast({
        title: 'Success',
        description: 'Task deleted successfully!',
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete task. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const canCreateTask = user?.role === 'admin' || 
                       user?.role === 'general_manager' || 
                       user?.role === 'project_coordinator';

  const getPriorityVariant = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusVariant = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'in_progress':
        return 'text-blue-600';
      case 'pending':
        return 'text-yellow-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const isOverdue = (dueDate: string, status: TaskStatus) => {
    return new Date(dueDate) < new Date() && status !== 'completed';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground">
              Manage and track all tasks across projects
            </p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading tasks...</p>
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
            {user?.role === 'employee' ? 'My Tasks' : 'All Tasks'}
          </h1>
          <p className="text-muted-foreground">
            {user?.role === 'employee' 
              ? 'View and manage tasks assigned to you'
              : 'Manage and track all tasks across projects'
            }
          </p>
        </div>
        {canCreateTask && (
          <Button 
            className="bg-gradient-primary shadow-primary"
            onClick={() => setIsCreateModalOpen(true)}
            disabled={isCreating}
          >
            <Plus className="mr-2 h-4 w-4" />
            {isCreating ? 'Creating...' : 'New Task'}
          </Button>
        )}
      </div>

      {/* Task Statistics */}
      <TaskStats stats={stats} />

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
                placeholder="Search tasks, projects, or descriptions..."
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
                <SelectItem value="in_progress">In Progress</SelectItem>
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
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {mockTaskCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
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
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => {
                const category = mockTaskCategories.find(c => c.id === task.category);
                const employee = mockEmployees.find(e => e.id === task.assignedEmployee);
                const project = mockProjects.find(p => p.id === task.projectId);
                const overdue = isOverdue(task.dueDate, task.status);

                return (
                  <TableRow key={task.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell onClick={() => handleViewTask(task)}>
                      <div>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-muted-foreground">{task.id}</div>
                      </div>
                    </TableCell>
                    <TableCell onClick={() => handleViewTask(task)}>
                      {project?.name || 'Unknown Project'}
                    </TableCell>
                    <TableCell onClick={() => handleViewTask(task)}>
                      <Badge variant="outline" className="gap-1">
                        <Tag className="h-3 w-3" />
                        {category?.name || 'Unknown Category'}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={() => handleViewTask(task)}>
                      <Badge 
                        variant={getPriorityVariant(task.priority)}
                        className={getPriorityColor(task.priority)}
                      >
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={() => handleViewTask(task)}>
                      <Badge 
                        variant={getStatusVariant(task.status)}
                        className={getStatusColor(task.status)}
                      >
                        {getStatusLabel(task.status)}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={() => handleViewTask(task)}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {employee?.name || 'Unknown Employee'}
                      </div>
                    </TableCell>
                    <TableCell onClick={() => handleViewTask(task)}>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className={overdue ? 'text-destructive font-medium' : ''}>
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                        {overdue && (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
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
                          <DropdownMenuItem onClick={() => handleViewTask(task)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {canCreateTask && (
                            <DropdownMenuItem onClick={() => handleEditTask(task)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Task
                            </DropdownMenuItem>
                          )}
                          {user?.role !== 'employee' && (
                            <DropdownMenuItem>
                              <User className="mr-2 h-4 w-4" />
                              Reassign
                            </DropdownMenuItem>
                          )}
                          {user?.role === 'employee' && task.status === 'in_progress' && (
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" />
                              Submit Work
                            </DropdownMenuItem>
                          )}
                          {user?.role === 'admin' || user?.role === 'general_manager' ? (
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Task
                            </DropdownMenuItem>
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredTasks.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No tasks found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Creation Modal */}
      <TaskCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
        categories={mockTaskCategories}
        employees={mockEmployees}
        projects={mockProjects}
      />

      {/* Task Details Modal */}
      <TaskDetailsModal
        task={selectedTask}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedTask(null);
        }}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        categories={mockTaskCategories}
        employees={mockEmployees}
        projects={mockProjects}
      />
    </div>
  );
}