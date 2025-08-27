import { useState } from 'react';
import { X, Download, Calendar, User, Tag, Building2, FileText, Clock, Edit, Trash2 } from 'lucide-react';
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
import { Project, ProjectStatus } from '@/types/project';

interface ProjectDetailsModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  categories: Array<{ id: string; name: string; color: string }>;
  coordinators: Array<{ id: string; name: string; role: string }>;
  clients: Array<{ id: string; name: string }>;
}

const getStatusVariant = (status: ProjectStatus) => {
  switch (status) {
    case 'completed':
      return 'default';
    case 'in_progress':
      return 'secondary';
    case 'planning':
      return 'outline';
    case 'on_hold':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getStatusColor = (status: ProjectStatus) => {
  switch (status) {
    case 'completed':
      return 'text-green-600';
    case 'in_progress':
      return 'text-blue-600';
    case 'planning':
      return 'text-yellow-600';
    case 'on_hold':
      return 'text-red-600';
    default:
      return 'text-muted-foreground';
  }
};

const getStatusLabel = (status: ProjectStatus) => {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'in_progress':
      return 'In Progress';
    case 'planning':
      return 'Planning';
    case 'on_hold':
      return 'On Hold';
    default:
      return status;
  }
};

export function ProjectDetailsModal({
  project,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  categories,
  coordinators,
  clients,
}: ProjectDetailsModalProps) {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!project) return null;

  const category = categories.find(c => c.id === project.category);
  const coordinator = coordinators.find(c => c.id === project.assignedCoordinator);
  const client = clients.find(c => c.id === project.clientName);

  const canEdit = user?.role === 'admin' || 
                  user?.role === 'general_manager' || 
                  (user?.role === 'project_coordinator' && user.id === project.assignedCoordinator);

  const canDelete = user?.role === 'admin' || user?.role === 'general_manager';

  const handleDelete = async () => {
    if (!canDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(project.id);
      onClose();
    } catch (error) {
      console.error('Error deleting project:', error);
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
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
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
            {project.name}
          </DialogTitle>
          <DialogDescription>
            Project ID: {project.id} • Created on {new Date(project.createdAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Tag className="h-3 w-3" />
                  {category?.name || 'Unknown Category'}
                </Badge>
                <Badge 
                  variant={getStatusVariant(project.status)}
                  className={getStatusColor(project.status)}
                >
                  {getStatusLabel(project.status)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {project.description || 'No description provided'}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {canEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(project)}>
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

          {/* Project Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Client Information */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Client Information
                </h3>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{client?.name || 'Unknown Client'}</p>
                </div>
              </div>

              {/* Project Coordinator */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Project Coordinator
                </h3>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{coordinator?.name || 'Unknown Coordinator'}</p>
                  <p className="text-sm text-muted-foreground">Role: Project Coordinator</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Project Timeline
                </h3>
                <div className="p-3 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Start Date:</span>
                    <span className="font-medium">{new Date(project.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">End Date:</span>
                    <span className="font-medium">{new Date(project.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Duration:</span>
                    <span className="font-medium">
                      {Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
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
                  Project Progress
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
                    {progress < 100 ? `${100 - progress}% remaining` : 'Project timeline completed'}
                  </p>
                </div>
              </div>

              {/* Attachments */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Attachments ({project.attachments.length})
                </h3>
                {project.attachments.length > 0 ? (
                  <div className="space-y-2">
                    {project.attachments.map((attachment) => (
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
                  <p className="font-medium">System</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last updated:</span>
                  <p className="font-medium">{new Date(project.updatedAt).toLocaleDateString()}</p>
                </div>
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
