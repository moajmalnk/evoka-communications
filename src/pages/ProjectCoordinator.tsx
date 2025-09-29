import { useState, useEffect } from 'react';
import { 
  FolderOpen, Search, MoreHorizontal, Eye, CheckCircle, XCircle, Clock, 
  TrendingUp, Users, FileText, Calendar, Filter, Plus, Target, CheckSquare, Edit, RotateCcw,
  Mail, Phone, MapPin, Building, Briefcase, DollarSign, CalendarDays, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { useAuth } from '@/contexts/AuthContext';
import { EmployeeCreateModal } from '@/components/employees/EmployeeCreateModal';
import { EmployeeEditModal } from '@/components/employees/EmployeeEditModal';
import { EmployeeDetailsModal } from '@/components/employees/EmployeeDetailsModal';
import { ProjectDetailsModal } from '@/components/projects/ProjectDetailsModal';
import { WorkSubmissionReviewModal } from '@/components/workSubmissions/WorkSubmissionDetailsModal';
import { UserFilters } from '@/components/common/UserFilters';
import { ProjectStatus } from '@/types/project';
import { WorkSubmissionStatus } from '@/types/workSubmission';
import { useToast } from '@/hooks/use-toast';
import { 
  projectCoordinatorApi, 
  ProjectCoordinator as ProjectCoordinatorType,
  CreateProjectCoordinatorData
} from '@/lib/projectCoordinatorService';

// Updated Project Coordinator interface based on your actual API response
interface ProjectCoordinator {
  id: string;
  coordinator_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  job_role: string;
  job_role_name?: string;
  department: string;
  department_name?: string;
  status: 'active' | 'onleave' | 'inactive';
  join_date: string;
  address: string;
  annual_salary: number;
  monthly_salary?: number;
  employment_duration?: number;
  full_name: string;
  date_of_birth?: string;
  blood_group?: string;
  account_holder_name?: string;
  account_number?: string;
  bank_name?: string;
  bank_branch?: string;
  ifsc_code?: string;
  notes?: string;
  max_concurrent_projects: number;
  specialization?: string;
  current_project_count?: number;
  is_available_for_new_projects?: boolean;
}

interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
  filters?: {
    status: string;
    department: string;
    job_role: string;
    max_projects: string;
  };
  search_term?: string;
}

export function ProjectCoordinator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  
  // Project Coordinator modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCoordinator, setSelectedCoordinator] = useState<ProjectCoordinator | null>(null);
  
  // Data states
  const [coordinators, setCoordinators] = useState<ProjectCoordinator[]>([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<{id: string, name: string}[]>([]);

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchCoordinators();
    fetchDepartments();
  }, [searchTerm, statusFilter, departmentFilter]);

  const fetchCoordinators = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (departmentFilter !== 'all') params.department = departmentFilter;
      
      const response = await projectCoordinatorApi.getAll(params);
      const data = response.data;
      
      console.log('API Response:', data);
      
      // Handle Django REST framework response format
      if (data.results && Array.isArray(data.results)) {
        setCoordinators(data.results);
      } else if (data.data && Array.isArray(data.data)) {
        // Alternative format
        setCoordinators(data.data);
      } else if (Array.isArray(data)) {
        // Direct array
        setCoordinators(data);
      } else {
        console.warn('Unexpected API response format:', data);
        setCoordinators([]);
      }
    } catch (error: any) {
      console.error('Error fetching coordinators:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load project coordinators',
        variant: 'destructive',
      });
      setCoordinators([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      // Mock departments - replace with actual API call
      const mockDepartments = [
        { id: '1', name: 'Development' },
        { id: '2', name: 'Design' },
        { id: '3', name: 'Marketing' },
        { id: '4', name: 'Operations' },
        { id: '5', name: 'Management' }
      ];
      setDepartments(mockDepartments);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  // Helper function to get department name
  const getDepartmentName = (deptId: string) => {
    const department = departments.find(dept => dept.id === deptId);
    return department ? department.name : deptId;
  };

  // Project Coordinator modal handlers
  const handleCreateCoordinator = async (coordinatorData: any): Promise<boolean> => {
    try {
      const response = await projectCoordinatorApi.create(coordinatorData);
      const data = response.data;
      
      if (data.status === 'success' && data.data) {
        await fetchCoordinators(); // Reload the list
        toast({
          title: 'Success',
          description: 'Project Coordinator created successfully',
        });
        
        // Show credentials if generated
        if (data.data.generated_username && data.data.generated_password) {
          toast({
            title: 'Login Credentials Generated',
            description: `Username: ${data.data.generated_username}, Password: ${data.data.generated_password}`,
            variant: 'default',
          });
        }
        return true;
      } else {
        throw new Error(data.message || 'Failed to create coordinator');
      }
    } catch (error: any) {
      console.error('Error creating coordinator:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create project coordinator',
        variant: 'destructive',
      });
      return false;
    }
  };

  const handleUpdateCoordinator = async (coordinatorData: any): Promise<boolean> => {
    if (!selectedCoordinator) return false;
    
    try {
      const response = await projectCoordinatorApi.update(selectedCoordinator.id, coordinatorData);
      const data = response.data;
      
      if (data.status === 'success' && data.data) {
        await fetchCoordinators(); // Reload the list
        toast({
          title: 'Success',
          description: 'Project Coordinator updated successfully',
        });
        return true;
      } else {
        throw new Error(data.message || 'Failed to update coordinator');
      }
    } catch (error: any) {
      console.error('Error updating coordinator:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update project coordinator',
        variant: 'destructive',
      });
      return false;
    }
  };

  const handleViewCoordinator = async (coordinator: ProjectCoordinator): Promise<void> => {
    try {
      // Fetch full coordinator details
      const response = await projectCoordinatorApi.getById(coordinator.id);
      const data = response.data;
      
      // Handle the response format
      const coordinatorData = data.results?.[0] || data.data || data;
      if (coordinatorData) {
        setSelectedCoordinator(coordinatorData);
        setIsDetailsModalOpen(true);
      } else {
        setSelectedCoordinator(coordinator);
        setIsDetailsModalOpen(true);
      }
    } catch (error: any) {
      console.error('Error loading coordinator details:', error);
      setSelectedCoordinator(coordinator);
      setIsDetailsModalOpen(true);
    }
  };

  const handleEditCoordinator = (coordinator: ProjectCoordinator): void => {
    // Remove focus from the current button before opening new modal
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    
    setSelectedCoordinator(coordinator);
    setIsDetailsModalOpen(false);
    // Add a small delay to ensure the details modal closes first
    setTimeout(() => {
      setIsEditModalOpen(true);
    }, 50);
  };

  // FIXED: Remove the extra confirmation - let EmployeeDetailsModal handle it
  const handleDeleteCoordinator = async (coordinator: ProjectCoordinator): Promise<boolean> => {
    try {
      const response = await projectCoordinatorApi.delete(coordinator.id);
      const data = response.data;
      
      if (data.status === 'success') {
        await fetchCoordinators(); // Refresh the list
        toast({
          title: 'Success',
          description: 'Project Coordinator deleted successfully',
        });
        return true;
      } else {
        throw new Error(data.message || 'Failed to delete coordinator');
      }
    } catch (error: any) {
      console.error('Error deleting coordinator:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete project coordinator',
        variant: 'destructive',
      });
      return false;
    }
  };

  const handleDeactivateCoordinator = async (coordinator: ProjectCoordinator): Promise<boolean> => {
    try {
      await projectCoordinatorApi.partialUpdate(coordinator.id, { status: 'inactive' });
      await fetchCoordinators();
      toast({
        title: 'Success',
        description: 'Project Coordinator deactivated successfully',
      });
      return true;
    } catch (error: any) {
      console.error('Error deactivating Project Coordinator:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to deactivate Project Coordinator',
        variant: 'destructive',
      });
      return false;
    }
  };

  const handleActivateCoordinator = async (coordinator: ProjectCoordinator): Promise<boolean> => {
    try {
      await projectCoordinatorApi.partialUpdate(coordinator.id, { status: 'active' });
      await fetchCoordinators();
      toast({
        title: 'Success',
        description: 'Project Coordinator activated successfully',
      });
      return true;
    } catch (error: any) {
      console.error('Error activating Project Coordinator:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to activate Project Coordinator',
        variant: 'destructive',
      });
      return false;
    }
  };

  const resetFilters = (): void => {
    setSearchTerm('');
    setStatusFilter('all');
    setDepartmentFilter('all');
  };

  const handleCloseModals = (): void => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDetailsModalOpen(false);
    setSelectedCoordinator(null);
  };

  // Filter coordinators based on search and filters (client-side fallback)
  const filteredCoordinators = coordinators.filter(coordinator => {
    const matchesSearch = 
      coordinator.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coordinator.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (coordinator.coordinator_id || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || coordinator.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || 
      (coordinator.department_name || getDepartmentName(coordinator.department) || '').toLowerCase() === departmentFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Calculate statistics
  const totalCoordinators = coordinators.length;
  const activeCoordinators = coordinators.filter(c => c.status === 'active').length;
  const onLeaveCoordinators = coordinators.filter(c => c.status === 'onleave').length;
  const inactiveCoordinators = coordinators.filter(c => c.status === 'inactive').length;
  const totalProjectsManaged = coordinators.reduce((sum, coord) => sum + (coord.current_project_count || 0), 0);

  // Helper functions
  const getStatusDisplay = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      'active': 'Active',
      'onleave': 'On Leave',
      'inactive': 'Inactive'
    };
    return statusMap[status] || status;
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case 'active':
        return 'default';
      case 'onleave':
        return 'secondary';
      case 'inactive':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'text-success';
      case 'onleave':
        return 'text-warning';
      case 'inactive':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  // Extract initials from full_name for avatar
  const getAvatarFallback = (coordinator: ProjectCoordinator): string => {
    if (!coordinator.full_name) return 'PC';
    return coordinator.full_name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Role verification - Admin and Project Coordinator have access
  if (user?.role !== 'admin' && user?.role !== 'project_coordinator') {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading && coordinators.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading project coordinators...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Coordinators</h1>
          <p className="text-muted-foreground">
            Manage project coordinators and track their performance
          </p>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <Button 
            className="bg-gradient-primary shadow-primary" 
            onClick={() => setIsCreateModalOpen(true)}
            disabled={loading}
          >
            <Users className="mr-2 h-4 w-4" />
            {loading ? 'Loading...' : 'Add Project Coordinator'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coordinators</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCoordinators}</div>
            <p className="text-xs text-muted-foreground">
              All coordinators
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Coordinators</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCoordinators}</div>
            <p className="text-xs text-muted-foreground">
              Currently working
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{onLeaveCoordinators}</div>
            <p className="text-xs text-muted-foreground">
              Currently on leave
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalProjectsManaged}</div>
            <p className="text-xs text-muted-foreground">
              Under management
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Coordinators</TabsTrigger>
          <TabsTrigger value="active">Active Coordinators</TabsTrigger>
          <TabsTrigger value="onleave">On Leave</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <UserFilters
            title="Project Coordinator Filters"
            searchPlaceholder="Search by name, email, or coordinator ID..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filterValue={departmentFilter}
            onFilterChange={setDepartmentFilter}
            filterOptions={[
              { value: 'all', label: 'All Departments' },
              ...departments.map(dept => ({ value: dept.name, label: dept.name }))
            ]}
            filterPlaceholder="Department"
            onReset={resetFilters}
            showStatusFilter={true}
            statusValue={statusFilter}
            onStatusChange={setStatusFilter}
            statusOptions={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'onleave', label: 'On Leave' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />

          {/* Project Coordinators Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Project Coordinators ({filteredCoordinators.length})</CardTitle>
              <CardDescription>
                Complete list of all project coordinators and their information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading project coordinators...</div>
              ) : filteredCoordinators.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No project coordinators found matching your search criteria.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Coordinator</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Current Projects</TableHead>
                        <TableHead>Monthly Salary</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCoordinators.map((coordinator) => (
                        <TableRow 
                          key={coordinator.id} 
                          className="hover:bg-muted/50 cursor-pointer" 
                          onClick={() => handleViewCoordinator(coordinator)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                                  {getAvatarFallback(coordinator)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {coordinator.full_name}
                                </div>
                                <div className="text-sm text-muted-foreground">{coordinator.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              {coordinator.coordinator_id}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {coordinator.department_name || getDepartmentName(coordinator.department) || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={getStatusVariant(coordinator.status)}
                              className={getStatusColor(coordinator.status)}
                            >
                              {getStatusDisplay(coordinator.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-muted rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full" 
                                  style={{ 
                                    width: `${((coordinator.current_project_count || 0) / coordinator.max_concurrent_projects) * 100}%` 
                                  }}
                                />
                              </div>
                              <span className="text-sm font-medium">
                                {coordinator.current_project_count || 0}/{coordinator.max_concurrent_projects}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-green-600">
                              ₹{coordinator.monthly_salary?.toLocaleString() || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(coordinator.join_date).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewCoordinator(coordinator)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditCoordinator(coordinator)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                {/* FIXED: Remove delete from dropdown menu since it's in the details modal */}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <UserFilters
            title="Active Coordinators Filters"
            searchPlaceholder="Search active coordinators by name, email, or ID..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filterValue={departmentFilter}
            onFilterChange={setDepartmentFilter}
            filterOptions={[
              { value: 'all', label: 'All Departments' },
              ...departments.map(dept => ({ value: dept.name, label: dept.name }))
            ]}
            filterPlaceholder="Department"
            onReset={resetFilters}
          />

          <Card>
            <CardHeader>
              <CardTitle>Active Coordinators ({activeCoordinators})</CardTitle>
              <CardDescription>
                Coordinators currently managing active projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading project coordinators...</div>
              ) : activeCoordinators === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No active project coordinators found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Coordinator</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Active Projects</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Join Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coordinators
                        .filter(c => c.status === 'active')
                        .filter(coordinator => {
                          const matchesSearch = 
                            coordinator.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            coordinator.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (coordinator.coordinator_id || '').toLowerCase().includes(searchTerm.toLowerCase());
                          const matchesDepartment = departmentFilter === 'all' || 
                            (coordinator.department_name || getDepartmentName(coordinator.department) || '').toLowerCase() === departmentFilter.toLowerCase();
                          return matchesSearch && matchesDepartment;
                        })
                        .map((coordinator) => (
                          <TableRow 
                            key={coordinator.id} 
                            className="hover:bg-muted/50 cursor-pointer" 
                            onClick={() => handleViewCoordinator(coordinator)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                                    {getAvatarFallback(coordinator)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {coordinator.full_name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">{coordinator.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono">
                                {coordinator.coordinator_id}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {coordinator.department_name || getDepartmentName(coordinator.department) || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm font-medium">
                                {coordinator.current_project_count || 0}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-muted-foreground">
                                Max: {coordinator.max_concurrent_projects}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {new Date(coordinator.join_date).toLocaleDateString()}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          <UserFilters
            title="Inactive Coordinators Filters"
            searchPlaceholder="Search inactive coordinators by name, email, or ID..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filterValue={departmentFilter}
            onFilterChange={setDepartmentFilter}
            filterOptions={[
              { value: 'all', label: 'All Departments' },
              ...departments.map(dept => ({ value: dept.name, label: dept.name }))
            ]}
            filterPlaceholder="Department"
            onReset={resetFilters}
          />

          <Card>
            <CardHeader>
              <CardTitle>Inactive Coordinators ({inactiveCoordinators})</CardTitle>
              <CardDescription>
                Coordinators with inactive status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading project coordinators...</div>
              ) : inactiveCoordinators === 0 ? (
                <div className="text-center py-8">
                  <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No inactive project coordinators found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Coordinator</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Salary</TableHead>
                        <TableHead>Join Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coordinators
                        .filter(c => c.status === 'inactive')
                        .filter(coordinator => {
                          const matchesSearch = 
                            coordinator.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            coordinator.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (coordinator.coordinator_id || '').toLowerCase().includes(searchTerm.toLowerCase());
                          const matchesDepartment = departmentFilter === 'all' || 
                            (coordinator.department_name || getDepartmentName(coordinator.department) || '').toLowerCase() === departmentFilter.toLowerCase();
                          return matchesSearch && matchesDepartment;
                        })
                        .map((coordinator) => (
                          <TableRow 
                            key={coordinator.id} 
                            className="hover:bg-muted/50 cursor-pointer" 
                            onClick={() => handleViewCoordinator(coordinator)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                                    {getAvatarFallback(coordinator)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {coordinator.full_name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">{coordinator.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono">
                                {coordinator.coordinator_id}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {coordinator.department_name || getDepartmentName(coordinator.department) || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-green-600">
                                ₹{coordinator.monthly_salary?.toLocaleString() || 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {new Date(coordinator.join_date).toLocaleDateString()}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <EmployeeCreateModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModals}
        onEmployeeCreated={handleCreateCoordinator}
        title="Add Project Coordinator"
      />

      <EmployeeEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        employee={selectedCoordinator}
        onEmployeeUpdated={handleUpdateCoordinator}
        title="Edit Project Coordinator"
      />

      <EmployeeDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseModals}
        employee={selectedCoordinator}
        onEdit={() => selectedCoordinator && handleEditCoordinator(selectedCoordinator)}
        onDelete={handleDeleteCoordinator}
        onDeactivate={handleDeactivateCoordinator}
        onActivate={handleActivateCoordinator}
        title="Project Coordinator Details"
      />
    </div>
  );
}

// test