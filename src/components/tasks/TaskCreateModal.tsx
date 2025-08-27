import { useState, useEffect } from 'react';
import { X, Upload, FileText, Calendar, User, Tag, Building2, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { TaskFormData, TaskPriority, TaskStatus, TaskAttachment } from '@/types/task';
import { mockProjects } from '@/lib/projectService';

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
  categories: Array<{ id: string; name: string; color: string }>;
  employees: Array<{ id: string; name: string; role: string; department: string }>;
  projects: Array<{ id: string; name: string; status: string }>;
}

const initialFormData: TaskFormData = {
  title: '',
  projectId: '',
  category: '',
  description: '',
  priority: 'medium',
  startDate: '',
  dueDate: '',
  assignedEmployee: '',
  status: 'pending',
};

export function TaskCreateModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  employees,
  projects,
}: TaskCreateModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<TaskFormData>(initialFormData);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [errors, setErrors] = useState<Partial<TaskFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter projects based on user role
  const getAvailableProjects = () => {
    if (user?.role === 'admin' || user?.role === 'general_manager') {
      return projects.filter(p => p.status !== 'completed');
    } else if (user?.role === 'project_coordinator') {
      // In a real app, this would filter based on assigned projects
      return projects.filter(p => p.status !== 'completed');
    }
    return [];
  };

  // Filter employees based on user role
  const getAvailableEmployees = () => {
    if (user?.role === 'admin' || user?.role === 'general_manager') {
      return employees.filter(e => e.role === 'employee');
    } else if (user?.role === 'project_coordinator') {
      // In a real app, this would filter based on project team members
      return employees.filter(e => e.role === 'employee');
    }
    return [];
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<TaskFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }
    if (!formData.projectId) {
      newErrors.projectId = 'Project is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    if (formData.startDate && formData.dueDate && new Date(formData.startDate) >= new Date(formData.dueDate)) {
      newErrors.dueDate = 'Due date must be after start date';
    }
    if (!formData.assignedEmployee) {
      newErrors.assignedEmployee = 'Assigned employee is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setAttachments([]);
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newAttachments: TaskAttachment[] = files.map((file, index) => ({
      id: `temp-${Date.now()}-${index}`,
      name: file.name,
      url: URL.createObjectURL(file),
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    }));

    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(a => a.id !== attachmentId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create New Task
          </DialogTitle>
          <DialogDescription>
            Fill in the task details below. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Task Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter task title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className={errors.title ? 'border-destructive' : ''}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Task Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Task Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the task requirements, objectives, and deliverables..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>
          </div>

          {/* Project and Assignment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Project & Assignment
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectId">Project *</Label>
                <Select value={formData.projectId} onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}>
                  <SelectTrigger className={errors.projectId ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableProjects().map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.projectId && <p className="text-sm text-destructive">{errors.projectId}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedEmployee">Assigned Employee *</Label>
                <Select value={formData.assignedEmployee} onValueChange={(value) => setFormData(prev => ({ ...prev, assignedEmployee: value }))}>
                  <SelectTrigger className={errors.assignedEmployee ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableEmployees().map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          {employee.name} ({employee.department})
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.assignedEmployee && <p className="text-sm text-destructive">{errors.assignedEmployee}</p>}
              </div>
            </div>
          </div>

          {/* Timeline and Priority */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timeline & Priority
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className={errors.startDate ? 'border-destructive' : ''}
                />
                {errors.startDate && <p className="text-sm text-destructive">{errors.startDate}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className={errors.dueDate ? 'border-destructive' : ''}
                />
                {errors.dueDate && <p className="text-sm text-destructive">{errors.dueDate}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value: TaskPriority) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <Badge variant="outline" className="text-green-600">Low</Badge>
                  </SelectItem>
                  <SelectItem value="medium">
                    <Badge variant="outline" className="text-yellow-600">Medium</Badge>
                  </SelectItem>
                  <SelectItem value="high">
                    <Badge variant="outline" className="text-red-600">High</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Task Attachments
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="attachments">Upload Files</Label>
              <Input
                id="attachments"
                type="file"
                multiple
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                className="cursor-pointer"
              />
              <p className="text-sm text-muted-foreground">
                Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF (Max 10MB per file)
              </p>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Files</Label>
                <div className="space-y-2">
                  {attachments.map((attachment) => (
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
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(attachment.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Task Status
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="status">Initial Status</Label>
              <Select value={formData.status} onValueChange={(value: TaskStatus) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">
                    <Badge variant="outline" className="text-yellow-600">Pending</Badge>
                  </SelectItem>
                  <SelectItem value="in_progress">
                    <Badge variant="secondary" className="text-blue-600">In Progress</Badge>
                  </SelectItem>
                  <SelectItem value="completed">
                    <Badge variant="default" className="text-green-600">Completed</Badge>
                  </SelectItem>
                  <SelectItem value="rejected">
                    <Badge variant="destructive">Rejected</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-gradient-primary shadow-primary">
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
