import { useState, useEffect } from 'react';
import { Plus, Filter, Search, MoreHorizontal, Calendar, User, Tag, Eye, Edit, Trash2, Download, FileText } from 'lucide-react';
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
import { useAuth } from '@/contexts/AuthContext';
import { Project, ProjectStatus } from '@/types/project';
import { projectService, mockProjectCategories, mockClients, mockCoordinators } from '@/lib/projectService';
import { ProjectCreateModal } from '@/components/projects/ProjectCreateModal';
import { ProjectDetailsModal } from '@/components/projects/ProjectDetailsModal';
import { ProjectEditModal } from '@/components/projects/ProjectEditModal';
import { ProjectStats } from '@/components/projects/ProjectStats';
import { useToast } from '@/hooks/use-toast';

export function Projects() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    planning: 0,
    inProgress: 0,
    onHold: 0,
    completed: 0,
    completionRate: 0,
  });
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [coordinatorFilter, setCoordinatorFilter] = useState('all');
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Filter projects when filters change
  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, statusFilter, categoryFilter, coordinatorFilter]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const [projectsData, statsData] = await Promise.all([
        projectService.getProjects(),
        projectService.getProjectStats(),
      ]);
      
      // Filter projects based on user role
      let filteredData = projectsData;
      if (user?.role === 'project_coordinator') {
        filteredData = projectsData.filter(project => project.assignedCoordinator === user.id);
      }
      
      setProjects(filteredData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load projects. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(project => project.category === categoryFilter);
    }

    // Coordinator filter
    if (coordinatorFilter !== 'all') {
      filtered = filtered.filter(project => project.assignedCoordinator === coordinatorFilter);
    }

    setFilteredProjects(filtered);
  };

  const handleCreateProject = async (data: any) => {
    try {
      setIsCreating(true);
      const newProject = await projectService.createProject(data, user?.id || '');
      
      // Refresh projects list
      await loadProjects();
      
      toast({
        title: 'Success',
        description: `Project "${newProject.name}" created successfully!`,
      });
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setIsDetailsModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsEditModalOpen(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await projectService.deleteProject(projectId);
      await loadProjects();
      
      toast({
        title: 'Success',
        description: 'Project deleted successfully!',
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete project. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateProject = async (projectId: string, data: Partial<any>) => {
    try {
      await projectService.updateProject(projectId, data);
      await loadProjects();
      
      toast({
        title: 'Success',
        description: 'Project updated successfully!',
      });
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const canCreateProject = user?.role === 'admin' || 
                          user?.role === 'general_manager' || 
                          user?.role === 'project_coordinator';

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

  const calculateProgress = (project: Project) => {
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    const today = new Date();
    
    if (today < start) return 0;
    if (today > end) return 100;
    
    const total = end.getTime() - start.getTime();
    const elapsed = today.getTime() - start.getTime();
    return Math.round((elapsed / total) * 100);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">
              Manage and track all your projects in one place
            </p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage and track all your projects in one place
          </p>
        </div>
        {canCreateProject && (
          <Button 
            className="bg-gradient-primary shadow-primary"
            onClick={() => setIsCreateModalOpen(true)}
            disabled={isCreating}
          >
            <Plus className="mr-2 h-4 w-4" />
            {isCreating ? 'Creating...' : 'New Project'}
          </Button>
        )}
      </div>

      {/* Project Statistics */}
      <ProjectStats stats={stats} />

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
                placeholder="Search projects, clients, or descriptions..."
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
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {mockProjectCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={coordinatorFilter} onValueChange={setCoordinatorFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Coordinator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Coordinators</SelectItem>
                {mockCoordinators.map((coordinator) => (
                  <SelectItem key={coordinator.id} value={coordinator.id}>
                    {coordinator.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Projects ({filteredProjects.length})</CardTitle>
          <CardDescription>
            A comprehensive list of all projects with their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Coordinator</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => {
                const category = mockProjectCategories.find(c => c.id === project.category);
                const coordinator = mockCoordinators.find(c => c.id === project.assignedCoordinator);
                const client = mockClients.find(c => c.id === project.clientName);
                const progress = calculateProgress(project);

                return (
                  <TableRow key={project.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell onClick={() => handleViewProject(project)}>
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-muted-foreground">{project.id}</div>
                      </div>
                    </TableCell>
                    <TableCell onClick={() => handleViewProject(project)}>
                      {client?.name || 'Unknown Client'}
                    </TableCell>
                    <TableCell onClick={() => handleViewProject(project)}>
                      <Badge variant="outline" className="gap-1">
                        <Tag className="h-3 w-3" />
                        {category?.name || 'Unknown Category'}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={() => handleViewProject(project)}>
                      <Badge 
                        variant={getStatusVariant(project.status)}
                        className={getStatusColor(project.status)}
                      >
                        {getStatusLabel(project.status)}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={() => handleViewProject(project)}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {coordinator?.name || 'Unknown Coordinator'}
                      </div>
                    </TableCell>
                    <TableCell onClick={() => handleViewProject(project)}>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(project.startDate).toLocaleDateString()} - 
                        {new Date(project.endDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell onClick={() => handleViewProject(project)}>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{progress}%</span>
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
                          <DropdownMenuItem onClick={() => handleViewProject(project)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {canCreateProject && (
                            <DropdownMenuItem onClick={() => handleEditProject(project)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Project
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            View Tasks
                          </DropdownMenuItem>
                          {user?.role === 'admin' || user?.role === 'general_manager' ? (
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteProject(project.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Project
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

          {filteredProjects.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No projects found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Creation Modal */}
      <ProjectCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
        categories={mockProjectCategories}
        coordinators={mockCoordinators}
        clients={mockClients}
      />

      {/* Project Details Modal */}
      <ProjectDetailsModal
        project={selectedProject}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedProject(null);
        }}
        onEdit={handleEditProject}
        onDelete={handleDeleteProject}
        categories={mockProjectCategories}
        coordinators={mockCoordinators}
        clients={mockClients}
      />

      {/* Project Edit Modal */}
      <ProjectEditModal
        project={selectedProject}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProject(null);
        }}
        onSubmit={handleUpdateProject}
        categories={mockProjectCategories}
        coordinators={mockCoordinators}
        clients={mockClients}
      />
    </div>
  );
}