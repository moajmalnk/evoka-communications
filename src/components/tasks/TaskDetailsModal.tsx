import { useState } from 'react';
import { X, Download, Calendar, User, Tag, Building2, FileText, Clock, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { Task, TaskPriority, TaskStatus } from '@/types/task';

interface TaskDetailsModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  categories: Array<{ id: string; name: string; color: string }>;
  employees: Array<{ id: string; name: string; role: string; department: string }>;
  projects: Array<{ id: string; name: string; status: string }>;
}

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

export function TaskDetailsModal({
  task,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  categories,
  employees,
  projects,
}: TaskDetailsModalProps) {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!task) return null;

  const category = categories.find(c => c.id === task.category);
  const employee = employees.find(e => e.id === task.assignedEmployee);
  const project = projects.find(p => p.id === task.projectId);

  const canEdit = user?.role === 'admin' || 
                  user?.role === 'general_manager' || 
                  user?.role === 'project_coordinator';

  const canDelete = user?.role === 'admin' || user?.role === 'general_manager';

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';

  const handleDelete = async () => {
    if (!canDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(task.id);
      onClose();
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateProgress = () => {
    const start = new Date(task.startDate);
    const end = new Date(task.dueDate);
    const today = new Date();
    
    if (today < start) return 0;
    if (today > end) return 100;
    
    const total = end.getTime() - start.getTime();
    const elapsed = today.getTime() - start.getTime();
    return Math.round((elapsed / total) * 100);
  };

  const progress = calculateProgress();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {task.title}
          </DialogTitle>
          <DialogDescription>
            Task ID: {task.id} • Created on {new Date(task.createdAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Tag className="h-3 w-3" />
                  {category?.name || 'Unknown Category'}
                </Badge>
                <Badge 
                  variant={getPriorityVariant(task.priority)}
                  className={getPriorityColor(task.priority)}
                >
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                </Badge>
                <Badge 
                  variant={getStatusVariant(task.status)}
                  className={getStatusColor(task.status)}
                >
                  {getStatusLabel(task.status)}
                </Badge>
                {isOverdue && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Overdue
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {task.description || 'No description provided'}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {canEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(task)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {canDelete && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Task Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Project Information */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Project Information
                </h3>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{project?.name || 'Unknown Project'}</p>
                  <p className="text-sm text-muted-foreground">Project ID: {task.projectId}</p>
                </div>
              </div>

              {/* Assigned Employee */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Assigned Employee
                </h3>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{employee?.name || 'Unknown Employee'}</p>
                  <p className="text-sm text-muted-foreground">Department: {employee?.department || 'N/A'}</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Task Timeline
                </h3>
                <div className="p-3 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Start Date:</span>
                    <span className="font-medium">{new Date(task.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Due Date:</span>
                    <span className={`font-medium ${isOverdue ? 'text-destructive' : ''}`}>
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Duration:</span>
                    <span className="font-medium">
                      {Math.ceil((new Date(task.dueDate).getTime() - new Date(task.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Progress */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Task Progress
                </h3>
                <div className="p-3 bg-muted rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Timeline Progress:</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <div className="w-full bg-muted-foreground rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {progress < 100 ? `${100 - progress}% remaining` : 'Task timeline completed'}
                  </p>
                </div>
              </div>

              {/* Attachments */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Attachments ({task.attachments.length})
                </h3>
                {task.attachments.length > 0 ? (
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
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
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
          </div>

          {/* Additional Information */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Additional Information</h3>
            <div className="p-3 bg-muted rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Created by:</span>
                  <p className="font-medium">Project Coordinator</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last updated:</span>
                  <p className="font-medium">{new Date(task.updatedAt).toLocaleDateString()}</p>
                </div>
                {task.completedAt && (
                  <div>
                    <span className="text-muted-foreground">Completed on:</span>
                    <p className="font-medium">{new Date(task.completedAt).toLocaleDateString()}</p>
                  </div>
                )}
                {task.notes && (
                  <div className="md:col-span-2">
                    <span className="text-muted-foreground">Notes:</span>
                    <p className="font-medium">{task.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
