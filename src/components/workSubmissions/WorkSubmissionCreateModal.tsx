import { useState, useEffect } from 'react';
import { X, Upload, FileText, Clock, User, Building2, Task } from 'lucide-react';
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
import { useAuth } from '@/contexts/AuthContext';
import { WorkSubmissionFormData, WorkSubmissionAttachment } from '@/types/workSubmission';
import { mockTasks } from '@/lib/taskService';

interface WorkSubmissionCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WorkSubmissionFormData) => void;
  employeeId: string;
}

const initialFormData: WorkSubmissionFormData = {
  taskId: '',
  title: '',
  description: '',
  timeSpent: 0,
  attachments: [],
};

export function WorkSubmissionCreateModal({
  isOpen,
  onClose,
  onSubmit,
  employeeId,
}: WorkSubmissionCreateModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<WorkSubmissionFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<WorkSubmissionFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get available tasks for the employee
  const getAvailableTasks = () => {
    return mockTasks.filter(task => 
      task.assignedEmployee === employeeId && 
      task.status === 'in_progress'
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<WorkSubmissionFormData> = {};

    if (!formData.taskId) {
      newErrors.taskId = 'Task is required';
    }
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (formData.timeSpent <= 0) {
      newErrors.timeSpent = 'Time spent must be greater than 0';
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
      console.error('Error creating work submission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newAttachments: WorkSubmissionAttachment[] = files.map((file, index) => ({
      id: `temp-${Date.now()}-${index}`,
      name: file.name,
      url: URL.createObjectURL(file),
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    }));

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }));
  };

  const removeAttachment = (attachmentId: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(a => a.id !== attachmentId)
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const availableTasks = getAvailableTasks();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Submit Work
          </DialogTitle>
          <DialogDescription>
            Submit your completed work for review and approval. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Task className="h-4 w-4" />
              Task Information
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="taskId">Select Task *</Label>
              <Select value={formData.taskId} onValueChange={(value) => setFormData(prev => ({ ...prev, taskId: value }))}>
                <SelectTrigger className={errors.taskId ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Choose the task you completed" />
                </SelectTrigger>
                <SelectContent>
                  {availableTasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{task.title}</span>
                        <span className="text-sm text-muted-foreground">{task.projectName}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.taskId && <p className="text-sm text-destructive">{errors.taskId}</p>}
              {availableTasks.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No active tasks found. You can only submit work for tasks that are currently in progress.
                </p>
              )}
            </div>
          </div>

          {/* Work Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Work Details
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="title">Work Title *</Label>
              <Input
                id="title"
                placeholder="Enter a descriptive title for your work"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Work Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what you accomplished, the approach you took, and any important details..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={errors.description ? 'border-destructive' : ''}
                rows={4}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeSpent">Time Spent (Hours) *</Label>
              <Input
                id="timeSpent"
                type="number"
                step="0.5"
                min="0.5"
                placeholder="Enter time spent in hours (e.g., 8.5)"
                value={formData.timeSpent}
                onChange={(e) => setFormData(prev => ({ ...prev, timeSpent: parseFloat(e.target.value) || 0 }))}
                className={errors.timeSpent ? 'border-destructive' : ''}
              />
              {errors.timeSpent && <p className="text-sm text-destructive">{errors.timeSpent}</p>}
              <p className="text-sm text-muted-foreground">
                Enter the total time you spent on this task in hours (can include decimals like 8.5 for 8 hours 30 minutes)
              </p>
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Work Attachments
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="attachments">Upload Files</Label>
              <Input
                id="attachments"
                type="file"
                multiple
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.zip,.rar,.sql,.md,.txt"
                className="cursor-pointer"
              />
              <p className="text-sm text-muted-foreground">
                Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, ZIP, RAR, SQL, MD, TXT (Max 25MB per file)
              </p>
            </div>

            {formData.attachments.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Files</Label>
                <div className="space-y-2">
                  {formData.attachments.map((attachment) => (
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || availableTasks.length === 0} className="bg-gradient-primary shadow-primary">
              {isSubmitting ? 'Submitting...' : 'Submit Work'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
