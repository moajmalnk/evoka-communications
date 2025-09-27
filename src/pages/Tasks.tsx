import { useState, useEffect, useCallback } from 'react';
import { Plus, Filter, Search, MoreHorizontal, Calendar, User, Tag, Eye, Edit, Trash2, FileText, AlertTriangle, Clock, PlayCircle, CheckCircle, XCircle, RotateCcw, List, Layers } from 'lucide-react';
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
import { Task, TaskFormData, TaskPriority, TaskStatus } from '@/types/task';
import { taskService, mockTaskCategories, mockEmployees } from '@/lib/taskService';
import { mockProjects } from '@/lib/projectService';
import { TaskCreateModal } from '@/components/tasks/TaskCreateModal';
import { TaskEditModal } from '@/components/tasks/TaskEditModal';
import { TaskDetailsModal } from '@/components/tasks/TaskDetailsModal';
import { TaskStats } from '@/components/tasks/TaskStats';
import { useToast } from '@/hooks/use-toast';
import { CustomClock } from '@/components/ui/custom-clock';
import { CustomCalendar } from '@/components/ui/custom-calendar';

export function Tasks() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [mainTasks, setMainTasks] = useState<Task[]>([]);
  const [subTasks, setSubTasks] = useState<Task[]>([]);
  const [filteredMainTasks, setFilteredMainTasks] = useState<Task[]>([]);
  const [filteredSubTasks, setFilteredSubTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'main' | 'sub'>('main');
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const [tasksData, mainTasksData, subTasksData, statsData] = await Promise.all([
        taskService.getTasks(),
        taskService.getMainTasks(),
        taskService.getSubTasks(),
        taskService.getTaskStats(),
      ]);
      
      // Filter tasks based on user role
      let filteredData = tasksData;
      let filteredMainTasks = mainTasksData;
      let filteredSubTasks = subTasksData;
      
      if (user?.role === 'employee') {
        filteredData = tasksData.filter(task => task.assignedEmployee === user.id);
        filteredMainTasks = mainTasksData.filter(task => task.assignedEmployee === user.id);
        filteredSubTasks = subTasksData.filter(task => task.assignedEmployee === user.id);
      }
      
      setTasks(filteredData);
      setMainTasks(filteredMainTasks);
      setSubTasks(filteredSubTasks);
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
  }, [user?.role, user?.id, toast]);

  const filterTasks = useCallback(() => {
    const applyFilters = (taskList: Task[]) => {
      let filtered = taskList;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (task.parentTaskTitle && task.parentTaskTitle.toLowerCase().includes(searchTerm.toLowerCase()))
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

      return filtered;
    };

    const filteredMain = applyFilters(mainTasks);
    const filteredSub = applyFilters(subTasks);
    const filteredAll = applyFilters(tasks);

    setFilteredMainTasks(filteredMain);
    setFilteredSubTasks(filteredSub);
    setFilteredTasks(filteredAll);
  }, [mainTasks, subTasks, tasks, searchTerm, statusFilter, priorityFilter, categoryFilter, projectFilter, employeeFilter]);

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Filter tasks when filters change
  useEffect(() => {
    filterTasks();
  }, [filterTasks]);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setCategoryFilter('all');
    setProjectFilter('all');
    setEmployeeFilter('all');
  };

  const handleCreateTask = async (data: TaskFormData) => {
    try {
      setIsCreating(true);
      const newTask = await taskService.createTask(data, user?.id || '');
      
      // Refresh tasks list
      await loadTasks();
      
      toast({
        title: 'Success',
        description: `${data.taskType === 'sub' ? 'Sub task' : 'Main task'} "${newTask.title}" created successfully!`,
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

  interface TaskCreateData {
    title: string;
    description?: string;
    projectName: string;
    assignedTo: string;
    priority: string;
    status: string;
    dueDate: string;
    parentTaskId?: string;
  }

  const handleTaskCreated = async (task: TaskCreateData) => {
    try {
      setIsCreating(true);
      // Convert the task from TaskCreateModal format to TaskFormData format
      const taskData: TaskFormData = {
        title: task.title,
        description: task.description || '',
        projectId: task.projectName, // This might need adjustment based on actual project ID
        category: 'general', // Default category
        priority: task.priority.toLowerCase() as TaskPriority,
        status: task.status.toLowerCase() as TaskStatus,
        startDate: task.dueDate, // Use due date as start date
        dueDate: task.dueDate,
        startTime: '09:00', // Default start time
        dueTime: '17:00', // Default end time
        assignedEmployee: task.assignedTo, // This might need adjustment based on actual employee ID
        taskType: activeTab, // Use the current active tab to determine task type
        parentTaskId: activeTab === 'sub' ? task.parentTaskId : undefined,
      };
      
      await handleCreateTask(taskData);
    } catch (error) {
      console.error('Error handling task creation:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setIsDetailsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setIsDetailsModalOpen(false); // Close the details modal first
    setSelectedTask(task); // Keep the task selected
    setIsEditModalOpen(true); // Open the edit modal
  };

  const handleUpdateTask = async (id: string, data: Partial<TaskFormData>) => {
    try {
      await taskService.updateTask(id, data);
      await loadTasks();
      
      toast({
        title: 'Success',
        description: 'Task updated successfully!',
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task. Please try again.',
        variant: 'destructive',
      });
    }
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
        return 'text-white';
      case 'in_progress':
        return 'text-blue-600';
      case 'pending':
        return 'text-yellow-600';
      case 'rejected':
        return 'text-red-700';
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

  // Skeleton loading components
  const TaskTableSkeleton = ({ showParentTask = false }: { showParentTask?: boolean }) => (
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
              <TableHead>Task</TableHead>
              {showParentTask && <TableHead>Parent Task</TableHead>}
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
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
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
                  <Skeleton className="h-6 w-20 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20 rounded-full" />
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
                  <Skeleton className="h-8 w-8" />
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          {canCreateTask && (
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
            <TaskTableSkeleton />
          </TabsContent>

          <TabsContent value="sub" className="space-y-4">
            <FiltersSkeleton />
            <TaskTableSkeleton showParentTask={true} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          {canCreateTask && (
            <Button 
              className="bg-gradient-primary shadow-primary"
              onClick={() => setIsCreateModalOpen(true)}
              disabled={isCreating}
            >
              <Plus className="mr-2 h-4 w-4" />
              {isCreating ? 'Creating...' : 'New Tasks'}
            </Button>
          )}
        </div>
      </div>

      {/* Task Statistics */}
      <TaskStats stats={stats} />

      {/* Tabs for Main Tasks and Sub Tasks */}
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

      {/* Tasks Table */}
      <Card>
        <CardHeader>
              <CardTitle>Main Tasks ({filteredMainTasks.length})</CardTitle>
          <CardDescription>
            {user?.role === 'employee' 
                  ? 'Your assigned main tasks and their current status'
                  : 'Complete list of main tasks across all projects'
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
                  {filteredMainTasks.map((task) => {
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
                        <CustomCalendar 
                          date={new Date(task.dueDate)} 
                          variant="compact" 
                          format="short"
                          showIcon={false}
                          className={overdue ? 'text-destructive font-medium' : ''}
                        />
                        {overdue && (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

                  {filteredMainTasks.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No main tasks found matching your criteria.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sub" className="space-y-4">
              {/* Sub Tasks Filters */}
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
                        placeholder="Search sub tasks, parent tasks, or descriptions..."
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

              {/* Sub Tasks Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Sub Tasks ({filteredSubTasks.length})</CardTitle>
                  <CardDescription>
                    {user?.role === 'employee' 
                      ? 'Your assigned sub tasks and their current status'
                      : 'Complete list of sub tasks across all projects'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Parent Task</TableHead>
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
                      {filteredSubTasks.map((task) => {
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
                              <div className="flex items-center gap-2">
                                <Layers className="h-4 w-4 text-muted-foreground" />
                                {task.parentTaskTitle || 'Unknown Parent'}
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
                                <CustomCalendar 
                                  date={new Date(task.dueDate)} 
                                  variant="compact" 
                                  format="short"
                                  showIcon={false}
                                  className={overdue ? 'text-destructive font-medium' : ''}
                                />
                                {overdue && (
                                  <AlertTriangle className="h-4 w-4 text-destructive" />
                                )}
                              </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

                  {filteredSubTasks.length === 0 && (
            <div className="text-center py-8">
                      <p className="text-muted-foreground">No sub tasks found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
            </TabsContent>
          </Tabs>

      {/* Task Creation Modal */}
      <TaskCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTaskCreated={handleTaskCreated}
      />

      {/* Task Edit Modal */}
      <TaskEditModal
        task={selectedTask}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTask(null);
        }}
        onTaskUpdated={async (task) => {
          // Convert back to TaskFormData format
          const taskData: Partial<TaskFormData> = {
            title: task.title,
            description: task.description || '',
            priority: task.priority.toLowerCase() as TaskPriority,
            status: task.status.toLowerCase() as TaskStatus,
            dueDate: task.dueDate,
            startDate: task.dueDate,
            startTime: '09:00',
            dueTime: '17:00',
            assignedEmployee: task.assignedEmployee,
            // Note: estimatedHours and actualHours are not part of TaskFormData
            // They would need to be added to the Task type and TaskFormData interface
          };
          await handleUpdateTask(task.id, taskData);
        }}
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