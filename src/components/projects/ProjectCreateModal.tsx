import { useState, useEffect } from 'react';
import { X, Upload, FileText, Calendar, User, Tag, Building2 } from 'lucide-react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectFormData, ProjectStatus, ProjectAttachment } from '@/types/project';
import { CustomCalendar } from '@/components/ui/custom-calendar';
import { CustomTimePicker } from '@/components/ui/custom-time-picker';

interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => void;
  categories: Array<{ id: string; name: string; color: string }>;
  coordinators: Array<{ id: string; name: string; role: string }>;
  clients: Array<{ id: string; name: string }>;
}

const initialFormData: ProjectFormData = {
  name: '',
  clientName: '',
  category: '',
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
  description: '',
  assignedCoordinator: '',
  status: 'planning',
};

export function ProjectCreateModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  coordinators,
  clients,
}: ProjectCreateModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
  const [attachments, setAttachments] = useState<ProjectAttachment[]>([]);
  const [errors, setErrors] = useState<Partial<ProjectFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  // Auto-set project coordinator if user is a project coordinator
  useEffect(() => {
    if (user?.role === 'project_coordinator' && user?.id) {
      setFormData(prev => ({ ...prev, assignedCoordinator: user.id }));
    }
  }, [user]);

  // Filter coordinators based on user role
  const getAvailableCoordinators = () => {
    if (user?.role === 'admin') {
      return coordinators.filter(c => c.role === 'project_coordinator');
    } else if (user?.role === 'general_manager') {
      return coordinators.filter(c => c.role === 'project_coordinator');
    } else if (user?.role === 'project_coordinator') {
      return coordinators.filter(c => c.id === user.id);
    }
    return [];
  };

  // Filter clients based on user role
  const getAvailableClients = () => {
    if (user?.role === 'admin' || user?.role === 'general_manager') {
      return clients;
    } else if (user?.role === 'project_coordinator') {
      // In a real app, this would filter based on assigned clients
      return clients;
    }
    return [];
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ProjectFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    if (!formData.clientName) {
      newErrors.clientName = 'Client is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'End date cannot be before start date';
    }
    
    // Time validation
    if (formData.startTime && formData.endTime) {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
      
      if (formData.startDate === formData.endDate && formData.startTime >= formData.endTime) {
        newErrors.endTime = 'End time must be after start time';
      }
    }
    if (!formData.assignedCoordinator) {
      newErrors.assignedCoordinator = 'Project coordinator is required';
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
      console.error('Error creating project:', error);
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
    const newAttachments: ProjectAttachment[] = files.map((file, index) => ({
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

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleStartDateChange = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    setFormData(prev => ({ ...prev, startDate: `${year}-${month}-${day}` }));
    setStartDateOpen(false);
  };

  const handleEndDateChange = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    setFormData(prev => ({ ...prev, endDate: `${year}-${month}-${day}` }));
    setEndDateOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create New Project
          </DialogTitle>
          <DialogDescription>
            Fill in the project details below. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Project Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter project name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Project Category *</Label>
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
              <Label htmlFor="description">Project Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the project scope, objectives, and deliverables..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>
          </div>

          {/* Client and Assignment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Client & Assignment
            </h3>
            
            <div className={`grid gap-4 ${user?.role === 'project_coordinator' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
              <div className="space-y-2">
                <Label htmlFor="clientName">Client *</Label>
                <Select value={formData.clientName} onValueChange={(value) => setFormData(prev => ({ ...prev, clientName: value }))}>
                  <SelectTrigger className={errors.clientName ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableClients().map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.clientName && <p className="text-sm text-destructive">{errors.clientName}</p>}
              </div>

              {/* Only show coordinator selection for admin and general manager */}
              {(user?.role === 'admin' || user?.role === 'general_manager') && (
                <div className="space-y-2">
                  <Label htmlFor="assignedCoordinator">Project Coordinator *</Label>
                  <Select value={formData.assignedCoordinator} onValueChange={(value) => setFormData(prev => ({ ...prev, assignedCoordinator: value }))}>
                    <SelectTrigger className={errors.assignedCoordinator ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select coordinator" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableCoordinators().map((coordinator) => (
                        <SelectItem key={coordinator.id} value={coordinator.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3" />
                            {coordinator.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.assignedCoordinator && <p className="text-sm text-destructive">{errors.assignedCoordinator}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Project Timeline
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${errors.startDate ? 'border-destructive' : ''}`}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.startDate ? formatDateForDisplay(formData.startDate) : 'Pick a start date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CustomCalendar
                      date={formData.startDate ? new Date(formData.startDate) : new Date()}
                      onDateChange={handleStartDateChange}
                      variant="inline"
                    />
                  </PopoverContent>
                </Popover>
                {errors.startDate && <p className="text-sm text-destructive">{errors.startDate}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${errors.endDate ? 'border-destructive' : ''}`}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.endDate ? formatDateForDisplay(formData.endDate) : 'Pick an end date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CustomCalendar
                      date={formData.endDate ? new Date(formData.endDate) : new Date()}
                      onDateChange={handleEndDateChange}
                      variant="inline"
                    />
                  </PopoverContent>
                </Popover>
                {errors.endDate && <p className="text-sm text-destructive">{errors.endDate}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <CustomTimePicker
                  value={formData.startTime}
                  onChange={(time) => setFormData({ ...formData, startTime: time })}
                  placeholder="Select start time"
                  className={errors.startTime ? 'border-destructive' : ''}
                />
                {errors.startTime && <p className="text-sm text-destructive">{errors.startTime}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <CustomTimePicker
                  value={formData.endTime}
                  onChange={(time) => setFormData({ ...formData, endTime: time })}
                  placeholder="Select end time"
                  className={errors.endTime ? 'border-destructive' : ''}
                />
                {errors.endTime && <p className="text-sm text-destructive">{errors.endTime}</p>}
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Project Attachments
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
              Project Status
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="status">Initial Status</Label>
              <Select value={formData.status} onValueChange={(value: ProjectStatus) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-gradient-primary shadow-primary">
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
