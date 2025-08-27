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
import { useAuth } from '@/contexts/AuthContext';
import { Project, ProjectFormData, ProjectStatus, ProjectAttachment } from '@/types/project';

interface ProjectEditModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: Partial<ProjectFormData>) => void;
  categories: Array<{ id: string; name: string; color: string }>;
  coordinators: Array<{ id: string; name: string; role: string }>;
  clients: Array<{ id: string; name: string }>;
}

export function ProjectEditModal({
  project,
  isOpen,
  onClose,
  onSubmit,
  categories,
  coordinators,
  clients,
}: ProjectEditModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<ProjectFormData>>({});
  const [errors, setErrors] = useState<Partial<ProjectFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        clientName: project.clientName,
        category: project.category,
        startDate: project.startDate,
        endDate: project.endDate,
        description: project.description,
        assignedCoordinator: project.assignedCoordinator,
        status: project.status,
      });
    }
  }, [project]);

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

    if (formData.name && !formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!project || !validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(project.id, formData);
      handleClose();
    } catch (error) {
      console.error('Error updating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({});
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Edit Project: {project.name}
          </DialogTitle>
          <DialogDescription>
            Update the project details below. Only modified fields will be updated.
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
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  placeholder="Enter project name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Project Category</Label>
                <Select 
                  value={formData.category || ''} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
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
                value={formData.description || ''}
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client</Label>
                <Select 
                  value={formData.clientName || ''} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, clientName: value }))}
                >
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

              <div className="space-y-2">
                <Label htmlFor="assignedCoordinator">Project Coordinator</Label>
                <Select 
                  value={formData.assignedCoordinator || ''} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, assignedCoordinator: value }))}
                >
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
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className={errors.startDate ? 'border-destructive' : ''}
                />
                {errors.startDate && <p className="text-sm text-destructive">{errors.startDate}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className={errors.endDate ? 'border-destructive' : ''}
                />
                {errors.endDate && <p className="text-sm text-destructive">{errors.endDate}</p>}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Project Status
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status || ''} 
                onValueChange={(value: ProjectStatus) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">
                    <Badge variant="outline" className="text-yellow-600">Planning</Badge>
                  </SelectItem>
                  <SelectItem value="in_progress">
                    <Badge variant="secondary" className="text-blue-600">In Progress</Badge>
                  </SelectItem>
                  <SelectItem value="on_hold">
                    <Badge variant="destructive">On Hold</Badge>
                  </SelectItem>
                  <SelectItem value="completed">
                    <Badge variant="default" className="text-green-600">Completed</Badge>
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
              {isSubmitting ? 'Updating...' : 'Update Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
