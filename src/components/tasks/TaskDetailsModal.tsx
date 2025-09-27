import { useState } from 'react';
import { Target, Calendar, User, Clock, FileText, Edit, X, Trash2, CheckCircle, XCircle, AlertTriangle, Layers, Download, Eye, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { CustomCalendar } from '@/components/ui/custom-calendar';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Task, TaskPriority, TaskStatus } from '@/types/task';

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onApprove?: (taskId: string) => void;
  onReject?: (taskId: string) => void;
  categories?: Array<{ id: string; name: string; color: string }>;
  employees?: Array<{ id: string; name: string }>;
  projects?: Array<{ id: string; name: string }>;
}

const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'default';
    case 'in progress':
      return 'secondary';
    case 'pending':
      return 'outline';
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    case 'in progress':
      return 'text-blue-700 bg-blue-50 border-blue-200';
    case 'pending':
      return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'cancelled':
      return 'text-red-700 bg-red-50 border-red-200';
    default:
      return 'text-slate-700 bg-slate-50 border-slate-200';
  }
};

const getPriorityVariant = (priority: string) => {
  switch (priority.toLowerCase()) {
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

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'text-red-700 bg-red-50 border-red-200';
    case 'medium':
      return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'low':
      return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    default:
      return 'text-slate-700 bg-slate-50 border-slate-200';
  }
};

export function TaskDetailsModal({
  isOpen,
  onClose,
  task,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  categories = [],
  employees = [],
  projects = [],
}: TaskDetailsModalProps) {
  const { user } = useAuth();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  if (!task) return null;

  const canEdit = user?.role === 'admin' || user?.role === 'project_coordinator';
  const canDelete = user?.role === 'admin' || user?.role === 'project_coordinator';
  const canApprove = user?.role === 'admin' || user?.role === 'project_coordinator';

  // Get employee name from ID
  const assignedEmployee = employees.find(emp => emp.id === task.assignedEmployee);
  const employeeName = assignedEmployee?.name || 'Unknown Employee';

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed' && task.status !== 'rejected';
  const progressPercentage = 0; // Task doesn't have estimatedHours/actualHours in the current type
  const timeRemaining = 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTimeInCompany = (joinDate: string) => {
    const start = new Date(joinDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return `${years} year${years > 1 ? 's' : ''}${remainingMonths > 0 ? ` ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`;
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!onDelete || !task) return;
    
    setIsDeleting(true);
    try {
      await onDelete(task.id);
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
    }
  };


  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Dummy sub-tasks data
  const dummySubTasks = [
    {
      id: 'SUB-001',
      title: 'Research and Analysis',
      status: 'completed',
      priority: 'medium',
      assignedTo: 'Jane Smith',
      dueDate: '2024-02-10',
    },
    {
      id: 'SUB-002',
      title: 'Create Initial Draft',
      status: 'in_progress',
      priority: 'high',
      assignedTo: 'Bob Johnson',
      dueDate: '2024-02-12',
    },
    {
      id: 'SUB-003',
      title: 'Review and Feedback',
      status: 'pending',
      priority: 'medium',
      assignedTo: 'Sarah Wilson',
      dueDate: '2024-02-14',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl font-bold">
                    {employeeName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-background border-2 border-background rounded-full">
                  {task.taskType === 'sub' ? (
                    <Layers className="h-4 w-4" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <DialogTitle className="text-2xl font-bold">
                    {task.title}
                  </DialogTitle>
                  
                </div>
                <DialogDescription className="text-sm text-muted-foreground">
                  Task ID: {task.id} • Created {formatDate(task.createdAt)}
                </DialogDescription>
                <Badge 
                    variant={task.taskType === 'sub' ? 'secondary' : 'default'}
                    className="text-xs font-medium"
                  >
                    {task.taskType === 'sub' ? 'Sub Task' : 'Main Task'}
                  </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canEdit && onEdit && (
                <Button 
                  onClick={() => onEdit(task)}
                  variant="ghost"
                  size="sm"
                  className="text-blue-700 hover:text-blue-700 border border-blue-300 hover:border-blue-400"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {canDelete && onDelete && (
                <Button 
                  onClick={handleDeleteClick}
                  variant="ghost"
                  size="sm"
                  className="text-red-700 hover:text-red-700 border border-red-300 hover:border-red-400"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        {task.taskType === 'main' ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Details
              </TabsTrigger>
              <TabsTrigger value="subtasks" className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                Sub Tasks
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6 mt-6">
          {/* Task Status Overview - Simplified */}
          {/* <div className="rounded-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-slate-500" />
                  <span className="font-semibold">Project:</span>
                  <Badge variant="outline" className="gap-1 border-slate-300 text-slate-700">
                    {task.projectName}
                  </Badge>
                </div>
                {task.taskType === 'sub' && task.parentTaskTitle && (
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">Parent:</span>
                    <span className="text-sm font-medium text-slate-700">{task.parentTaskTitle}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isOverdue && (
                  <Badge variant="destructive" className="gap-1 animate-pulse">
                    <AlertTriangle className="h-3 w-3" />
                    Overdue
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator /> */}
              {/* Project & Parent Task Information */}
              <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Project Information</h3>
                <div className="flex items-center gap-2">
                {isOverdue && (
                  <Badge variant="destructive" className="gap-1 animate-pulse">
                    <AlertTriangle className="h-3 w-3" />
                    Overdue
                  </Badge>
                )}
              </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Project</label>
                    <p className="font-medium text-slate-400 mt-1">{task.projectName}</p>
                  </div>
                  {task.taskType === 'sub' && task.parentTaskTitle && (
                    <div className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Layers className="h-4 w-4 text-slate-500" />
                        <span className="text-sm font-medium ">Parent Task</span>
                      </div>
                      <p className="font-medium text-slate-400">{task.parentTaskTitle}</p>
                      <p className="text-xs text-slate-400">This is a sub task under the main task above</p>
                    </div>
                  )}
                </div>
              </div>

          {/* Task Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Task Information Card */}
              <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Task Information</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <p className="font-medium text-slate-400 mt-1">{task.title}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium">Task ID</label>
                      <p className="font-mono text-sm text-slate-400 mt-1">{task.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <p className="text-slate-400 mt-1">{task.category}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium">Assigned To</label>
                      <div className="flex items-center gap-3 mt-1">
                        {/* <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                            {employeeName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar> */}
                        <p className="font-medium text-slate-400">{employeeName}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Priority</label>
                      <div className="mt-1">
                        <Badge 
                          variant={getPriorityVariant(task.priority)}
                          className={getPriorityColor(task.priority)}
                        >
                          {task.priority} Priority
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <div className="mt-1">
                      <Badge 
                        variant={getStatusVariant(task.status)}
                        className={getStatusColor(task.status)}
                      >
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>



            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Timeline Card */}
              <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Timeline</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Due Date</label>
                    <div className="mt-1">
                      <CustomCalendar 
                        date={new Date(task.dueDate)} 
                        variant="compact" 
                        format="short"
                        showIcon={false}
                        className={isOverdue ? 'text-destructive font-medium' : ''}
                      />
                    </div>
                    {isOverdue && (
                      <p className="text-xs text-destructive mt-1">
                        {Math.ceil((Date.now() - new Date(task.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days overdue
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Created</label>
                    <p className="text-sm text-slate-400 mt-1">{formatDate(task.createdAt)}</p>
                  </div>
                  {task.completedAt && (
                    <div>
                      <label className="text-sm font-medium">Completed</label>
                      <p className="text-sm text-slate-400 mt-1">{formatDate(task.completedAt)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Task Type Card */}
              {/* <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  {task.taskType === 'sub' ? (
                    <Layers className="h-5 w-5" />
                  ) : (
                    <FileText className="h-5 w-5" />
                  )}
                  <h3 className="text-lg font-semibold">Task Type</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Type</span>
                    <Badge 
                      variant={task.taskType === 'sub' ? 'secondary' : 'default'}
                      className="text-xs font-medium"
                    >
                      {task.taskType === 'sub' ? 'Sub Task' : 'Main Task'}
                    </Badge>
                  </div>
                  {task.taskType === 'sub' && (
                    <div className="border border-slate-200 rounded-lg p-3">
                      <p className="text-xs text-slate-700 font-medium">Sub Task</p>
                      <p className="text-xs">This task is part of a larger main task</p>
                    </div>
                  )}
                  {task.taskType === 'main' && (
                    <div className="border border-slate-200 rounded-lg p-3">
                      <p className="text-xs font-medium">Main Task</p>
                      <p className="text-xs text-slate-400">This is a primary task that may have sub tasks</p>
                    </div>
                  )}
                </div>
              </div> */}
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Task Description</h3>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="text-slate-400 leading-relaxed">{task.description}</p>
              </div>
            </div>
          )}

          {/* Attachments Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Attachments ({task.attachments?.length || 0})
            </h3>
            
            {/* Existing Attachments */}
            {task.attachments && task.attachments.length > 0 ? (
              <div className="space-y-2">
                {task.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{attachment.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.size)} • {new Date(attachment.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(attachment.url, '_blank')}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = attachment.url;
                          link.download = attachment.name;
                          link.click();
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">No attachments uploaded</p>
              </div>
            )}
          </div>

          {/* Notes
          {task.notes && (
            <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Notes</h3>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="text-slate-400 leading-relaxed">{task.notes}</p>
              </div>
            </div>
          )} */}

          {/* Action Buttons */}
          {/* {task.status === 'pending' && canApprove && (
            <div className="border border-slate-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Quick Actions</h3>
              </div>
              <div className="flex gap-3">
                {onApprove && (
                  <Button 
                    onClick={() => onApprove(task.id)}
                    className="bg-slate-700 hover:bg-slate-800 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Task
                  </Button>
                )}
                {onReject && (
                  <Button 
                    onClick={() => onReject(task.id)}
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:text-slate-700 hover:bg-slate-50 hover:border-slate-400"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Task
                  </Button>
                )}
              </div>
            </div>
          )} */}
          </TabsContent>

          <TabsContent value="subtasks" className="space-y-6 mt-6">
            <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <CheckSquare className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Sub Tasks</h3>
              </div>
              <div className="space-y-4">
                {dummySubTasks.map((subTask) => (
                  <div key={subTask.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{subTask.title}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            subTask.status === 'completed' ? 'text-green-600 border-green-300' :
                            subTask.status === 'in_progress' ? 'text-blue-600 border-blue-300' :
                            'text-amber-600 border-amber-300'
                          }`}
                        >
                          {subTask.status.replace('_', ' ')}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            subTask.priority === 'high' ? 'text-red-600 bg-red-50' :
                            subTask.priority === 'medium' ? 'text-amber-600 bg-amber-50' :
                            'text-green-600 bg-green-50'
                          }`}
                        >
                          {subTask.priority} Priority
                        </Badge>
                      </div>
                    
                    </div>
                    <div className="text-sm text-slate-600 mb-2">
                      Assigned to: {subTask.assignedTo} | Due: {subTask.dueDate}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        ) : (
          <div className="space-y-6 mt-6">
            {/* Project & Parent Task Information */}
            <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Target className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Project Information</h3>
                <div className="flex items-center gap-2">
                  {isOverdue && (
                    <Badge variant="destructive" className="gap-1 animate-pulse">
                      <AlertTriangle className="h-3 w-3" />
                      Overdue
                    </Badge>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Project</label>
                  <p className="font-medium text-slate-400 mt-1">{task.projectName}</p>
                </div>
                {task.taskType === 'sub' && task.parentTaskTitle && (
                  <div className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Layers className="h-4 w-4 text-slate-500" />
                      <span className="text-sm font-medium">Parent Task</span>
                    </div>
                    <p className="font-medium text-slate-400">{task.parentTaskTitle}</p>
                    <p className="text-xs text-slate-400">This is a sub task under the main task above</p>
                  </div>
                )}
              </div>
            </div>

            {/* Task Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Task Information Card */}
                <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Task Information</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Title</label>
                      <p className="font-medium text-slate-400 mt-1">{task.title}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium">Task ID</label>
                        <p className="font-mono text-sm text-slate-400 mt-1">{task.id}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Category</label>
                        <p className="text-slate-400 mt-1">{task.category}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium">Assigned To</label>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="font-medium text-slate-400">{employeeName}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Priority</label>
                        <div className="mt-1">
                          <Badge 
                            variant={getPriorityVariant(task.priority)}
                            className={getPriorityColor(task.priority)}
                          >
                            {task.priority} Priority
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <div className="mt-1">
                        <Badge 
                          variant={getStatusVariant(task.status)}
                          className={getStatusColor(task.status)}
                        >
                          {task.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Timeline Card */}
                <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Timeline</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Due Date</label>
                      <div className="mt-1">
                        <CustomCalendar 
                          date={new Date(task.dueDate)} 
                          variant="compact" 
                          format="short"
                          showIcon={false}
                          className={isOverdue ? 'text-destructive font-medium' : ''}
                        />
                      </div>
                      {isOverdue && (
                        <p className="text-xs text-destructive mt-1">
                          {Math.ceil((Date.now() - new Date(task.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days overdue
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium">Created</label>
                      <p className="text-sm text-slate-400 mt-1">{formatDate(task.createdAt)}</p>
                    </div>
                    {task.completedAt && (
                      <div>
                        <label className="text-sm font-medium">Completed</label>
                        <p className="text-sm text-slate-400 mt-1">{formatDate(task.completedAt)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Task Description</h3>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-slate-400 leading-relaxed">{task.description}</p>
                </div>
              </div>
            )}

            {/* Attachments Section */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Attachments ({task.attachments?.length || 0})
              </h3>
              
              {/* Existing Attachments */}
              {task.attachments && task.attachments.length > 0 ? (
                <div className="space-y-2">
                  {task.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{attachment.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(attachment.size)} • {new Date(attachment.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(attachment.url, '_blank')}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = attachment.url;
                            link.download = attachment.name;
                            link.click();
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">No attachments uploaded</p>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Task"
        description={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmText="Delete Task"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isDeleting}
      />
    </Dialog>
  );
}