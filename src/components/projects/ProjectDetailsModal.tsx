import { useState } from 'react';
import { X, Download, Calendar, User, Tag, Building2, FileText, Clock, Edit, Trash2, Target, AlertTriangle, List, CheckSquare, Layers, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { CustomCalendar } from '@/components/ui/custom-calendar';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

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

// Dummy data for tasks and sub-tasks
const dummyTasks = [
  {
    id: 'TASK-001',
    title: 'Design Website Layout',
    type: 'main',
    status: 'in_progress',
    priority: 'high',
    assignedTo: 'John Doe',
    dueDate: '2024-02-15',
    subTasks: [
      {
        id: 'TASK-001-1',
        title: 'Create Wireframes',
        status: 'completed',
        priority: 'medium',
        assignedTo: 'Jane Smith',
        dueDate: '2024-02-10',
      },
      {
        id: 'TASK-001-2',
        title: 'Design Homepage',
        status: 'in_progress',
        priority: 'high',
        assignedTo: 'Bob Johnson',
        dueDate: '2024-02-12',
      },
      {
        id: 'TASK-001-3',
        title: 'Create Mobile Responsive Design',
        status: 'pending',
        priority: 'medium',
        assignedTo: 'Sarah Wilson',
        dueDate: '2024-02-14',
      },
    ],
  },
  {
    id: 'TASK-002',
    title: 'Implement Backend API',
    type: 'main',
    status: 'pending',
    priority: 'high',
    assignedTo: 'Alice Brown',
    dueDate: '2024-02-20',
    subTasks: [
      {
        id: 'TASK-002-1',
        title: 'Set up Database Schema',
        status: 'pending',
        priority: 'medium',
        assignedTo: 'Charlie Wilson',
        dueDate: '2024-02-18',
      },
      {
        id: 'TASK-002-2',
        title: 'Create User Authentication',
        status: 'pending',
        priority: 'high',
        assignedTo: 'David Lee',
        dueDate: '2024-02-19',
      },
    ],
  },
  {
    id: 'TASK-003',
    title: 'Frontend Development',
    type: 'main',
    status: 'completed',
    priority: 'medium',
    assignedTo: 'Emma Davis',
    dueDate: '2024-02-10',
    subTasks: [
      {
        id: 'TASK-003-1',
        title: 'Setup React Components',
        status: 'completed',
        priority: 'low',
        assignedTo: 'Tom Anderson',
        dueDate: '2024-02-05',
      },
    ],
  },
  {
    id: 'TASK-004',
    title: 'Testing & Quality Assurance',
    type: 'main',
    status: 'in_progress',
    priority: 'medium',
    assignedTo: 'Lisa Garcia',
    dueDate: '2024-02-25',
    subTasks: [
      {
        id: 'TASK-004-1',
        title: 'Unit Testing',
        status: 'completed',
        priority: 'medium',
        assignedTo: 'Mike Taylor',
        dueDate: '2024-02-15',
      },
      {
        id: 'TASK-004-2',
        title: 'Integration Testing',
        status: 'in_progress',
        priority: 'high',
        assignedTo: 'Lisa Garcia',
        dueDate: '2024-02-20',
      },
      {
        id: 'TASK-004-3',
        title: 'User Acceptance Testing',
        status: 'pending',
        priority: 'medium',
        assignedTo: 'Rachel Martinez',
        dueDate: '2024-02-23',
      },
    ],
  },
];

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
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  if (!project) return null;

  const category = categories.find(c => c.id === project.category);
  const coordinator = coordinators.find(c => c.id === project.assignedCoordinator);
  const client = clients.find(c => c.id === project.clientName);

  const canEdit = user?.role === 'admin' || 
                  user?.role === 'general_manager' || 
                  (user?.role === 'project_coordinator' && user.id === project.assignedCoordinator);

  const canDelete = user?.role === 'admin' || user?.role === 'general_manager';

  const handleDeleteClick = () => {
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!canDelete || !project) return;
    
    setIsDeleting(true);
    try {
      await onDelete(project.id);
      onClose();
    } catch (error) {
      console.error('Error deleting project:', error);
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl font-bold">
                    {project.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-background border-2 border-background rounded-full">
                  <Building2 className="h-4 w-4" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <DialogTitle className="text-2xl font-bold">
                    {project.name}
                  </DialogTitle>
                </div>
                <DialogDescription className="text-sm text-muted-foreground">
                  Project ID: {project.id} • Created {new Date(project.createdAt).toLocaleDateString()}
                </DialogDescription>
                <Badge 
                  variant={getStatusVariant(project.status)}
                  className="text-xs font-medium"
                >
                  {getStatusLabel(project.status)}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canEdit && (
                <Button 
                  onClick={() => onEdit(project)}
                  variant="ghost"
                  size="sm"
                  className="text-blue-700 hover:text-blue-700 border border-blue-300 hover:border-blue-400"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {canDelete && (
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Project Details
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Tasks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 mt-6">
            {/* Project Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Project Information Card */}
                <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Project Details</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Project Name</label>
                      <p className="font-medium text-slate-400 mt-1">{project.name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium">Project ID</label>
                        <p className="font-mono text-sm text-slate-400 mt-1">{project.id}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Category</label>
                        <p className="text-slate-400 mt-1">{category?.name || 'Unknown Category'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium">Client</label>
                        <p className="font-medium text-slate-400 mt-1">{client?.name || 'Unknown Client'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Project Coordinator</label>
                        <p className="font-medium text-slate-400 mt-1">{coordinator?.name || 'Unknown Coordinator'}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <div className="mt-1">
                        <Badge 
                          variant={getStatusVariant(project.status)}
                          className="text-xs font-medium"
                        >
                          {getStatusLabel(project.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {project.description && (
                  <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <FileText className="h-5 w-5" />
                      <h3 className="text-lg font-semibold">Project Description</h3>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-slate-400 leading-relaxed">{project.description}</p>
                    </div>
                  </div>
                )}
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
                      <label className="text-sm font-medium">Start Date</label>
                      <div className="mt-1">
                        <CustomCalendar 
                          date={new Date(project.startDate)} 
                          variant="compact" 
                          format="short"
                          showIcon={false}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">End Date</label>
                      <div className="mt-1">
                        <CustomCalendar 
                          date={new Date(project.endDate)} 
                          variant="compact" 
                          format="short"
                          showIcon={false}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Duration</label>
                      <p className="text-sm text-slate-400 mt-1">
                        {Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Card */}
                <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Progress</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Timeline Progress</label>
                      <p className="text-2xl font-bold text-slate-400 mt-1">{progress}%</p>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400">
                      {progress < 100 ? `${100 - progress}% remaining` : 'Project timeline completed'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Attachments Section */}
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
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6 mt-6">
            <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <CheckSquare className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Project Tasks</h3>
              </div>
              <div className="space-y-4">
                {dummyTasks.map((task) => (
                  <div key={task.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-none">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{task.title}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            task.status === 'completed' ? 'text-green-600 border-green-300' :
                            task.status === 'in_progress' ? 'text-blue-600 border-blue-300' :
                            'text-amber-600 border-amber-300'
                          }`}
                        >
                          {task.status.replace('_', ' ')}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs  ${
                            task.priority === 'high' ? 'text-red-600 bg-red-50' :
                            task.priority === 'medium' ? 'text-amber-600 bg-amber-50' :
                            'text-green-600 bg-green-50'
                          }`}
                        >
                          {task.priority} Priority
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-slate-600 mb-2">
                      Assigned to: {task.assignedTo} | Due: {task.dueDate}
                    </div>
                    {task.subTasks && task.subTasks.length > 0 && (
                      <div className="ml-6 space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <Layers className="h-3 w-3" />
                          Sub-tasks ({task.subTasks.length}):
                        </div>
                        {task.subTasks.map((subTask) => (
                          <div key={subTask.id} className="flex items-center justify-between p-2 rounded hover:bg-transparent">
                            <div className="flex items-center gap-2">
                              <Layers className="h-3 w-3 text-slate-500" />
                              <span className="text-sm">{subTask.title}</span>
                              <Badge 
                                variant="outline" 
                                className={`text-xs hover:bg-transparent ${
                                  subTask.status === 'completed' ? 'text-green-600 border-green-300' :
                                  subTask.status === 'in_progress' ? 'text-blue-600 border-blue-300' :
                                  'text-amber-600 border-amber-300'
                                }`}
                              >
                                {subTask.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className="text-xs text-slate-500">
                              {subTask.assignedTo} | {subTask.dueDate}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Project"
        description={`Are you sure you want to delete "${project.name}"? This action cannot be undone.`}
        confirmText="Delete Project"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isDeleting}
      />
    </Dialog>
  );
}
