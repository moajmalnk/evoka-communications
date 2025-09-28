import { useState, useEffect } from 'react';
import { 
  Users, Search, MoreHorizontal, Eye, Edit, Clock, IndianRupee, 
  Calendar, Filter, UserPlus, FileText, TrendingUp, CheckCircle, XCircle, RotateCcw,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { useToast } from '@/hooks/use-toast';
import { EmployeeCreateModal } from '@/components/employees/EmployeeCreateModal';
import { EmployeeEditModal } from '@/components/employees/EmployeeEditModal';
import { EmployeeDetailsModal } from '@/components/employees/EmployeeDetailsModal';
import { UserFilters } from '@/components/common/UserFilters';
import { generalManagerApi, GeneralManager } from '@/lib/gmService';

interface DjangoApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
  search_term?: string;
  filters?: {
    status: string;
    department: string;
    job_role: string;
    management_level: string;
  };
}

export function GeneralManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // General Manager modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [selectedGeneralManager, setSelectedGeneralManager] = useState<GeneralManager | null>(null);
  
  // General Manager data state
  const [generalManagers, setGeneralManagers] = useState<GeneralManager[]>([]);

  // Load General Managers on component mount and when filters change
  useEffect(() => {
    loadGeneralManagers();
  }, [searchTerm, statusFilter, departmentFilter]);

  const loadGeneralManagers = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (departmentFilter !== 'all') params.department = departmentFilter;

      const response = await generalManagerApi.getAll(params);
      const apiResponse: DjangoApiResponse<GeneralManager> = response.data;

      if (apiResponse.results && Array.isArray(apiResponse.results)) {
        console.log('General managers loaded:', apiResponse.results);
        setGeneralManagers(apiResponse.results);
      } else {
        console.warn('API returned no results:', apiResponse);
        setGeneralManagers([]);
      }
    } catch (error: any) {
      console.error('Error loading general managers:', error);
      toast({
        title: "Error",
        description: "Failed to load general managers",
        variant: "destructive",
      });
      setGeneralManagers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter General Managers based on search and filters
  const filteredGeneralManagers = generalManagers.filter(gm => {
    const matchesSearch = 
      gm.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gm.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (gm.job_role_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || gm.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || 
      (gm.department_name || '').toLowerCase() === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Calculate stats based on actual data
  const activeGeneralManagers = generalManagers.filter(e => e.status === 'active').length;
  const totalGeneralManagers = generalManagers.length;
  const seniorManagers = generalManagers.filter(e => e.is_senior_manager).length;
  const avgSalary = generalManagers.length > 0 
    ? Math.round(generalManagers.reduce((sum, gm) => sum + (gm.annual_salary || 0), 0) / generalManagers.length)
    : 0;

  // Modal handlers for General Managers
  const handleCreateGeneralManager = async (newGMData: any): Promise<boolean> => {
    try {
      const response = await generalManagerApi.create(newGMData);
      
      // Reload General Managers to get the updated list with proper structure
      await loadGeneralManagers();
      toast({
        title: "Success",
        description: "General manager created successfully",
      });
      return true;
    } catch (error: any) {
      console.error('Error creating general manager:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to create general manager",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleUpdateGeneralManager = async (updatedGMData: any): Promise<boolean> => {
    if (!selectedGeneralManager) return false;
    
    try {
      await generalManagerApi.update(selectedGeneralManager.id, updatedGMData);
      
      // Reload General Managers to get the updated list
      await loadGeneralManagers();
      toast({
        title: "Success",
        description: "General manager updated successfully",
      });
      return true;
    } catch (error: any) {
      console.error('Error updating general manager:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to update general manager",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleViewGeneralManager = async (gm: GeneralManager): Promise<void> => {
    try {
      // Fetch full General Manager details
      const response = await generalManagerApi.getById(gm.id);
      const apiResponse: any = response.data;
      
      // Handle the response format
      const gmData = apiResponse.results?.[0] || apiResponse.data || apiResponse;
      if (gmData) {
        setSelectedGeneralManager(gmData);
        setIsDetailsModalOpen(true);
      } else {
        setSelectedGeneralManager(gm);
        setIsDetailsModalOpen(true);
      }
    } catch (error: any) {
      console.error('Error loading general manager details:', error);
      setSelectedGeneralManager(gm);
      setIsDetailsModalOpen(true);
    }
  };

  const handleEditGeneralManager = (gm: GeneralManager): void => {
    setSelectedGeneralManager(gm);
    setIsEditModalOpen(true);
  };

  const handleDeleteGeneralManager = async (gm: GeneralManager): Promise<boolean> => {
    try {
      await generalManagerApi.delete(gm.id);
      await loadGeneralManagers();
      toast({
        title: "Success",
        description: "General manager deleted successfully",
      });
      return true;
    } catch (error: any) {
      console.error('Error deleting general manager:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to delete general manager",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDeactivateGeneralManager = async (gm: GeneralManager): Promise<boolean> => {
    try {
      await generalManagerApi.partialUpdate(gm.id, { status: 'inactive' });
      await loadGeneralManagers();
      toast({
        title: "Success",
        description: "General manager deactivated successfully",
      });
      return true;
    } catch (error: any) {
      console.error('Error deactivating general manager:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to deactivate general manager",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleActivateGeneralManager = async (gm: GeneralManager): Promise<boolean> => {
    try {
      await generalManagerApi.partialUpdate(gm.id, { status: 'active' });
      await loadGeneralManagers();
      toast({
        title: "Success",
        description: "General manager activated successfully",
      });
      return true;
    } catch (error: any) {
      console.error('Error activating general manager:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to activate general manager",
        variant: "destructive",
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
    setSelectedGeneralManager(null);
  };

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
  const getAvatarFallback = (gm: GeneralManager): string => {
    if (!gm.full_name) return 'GM';
    return gm.full_name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Role verification - Admin and General Manager have access
  if (user?.role !== 'admin' && user?.role !== 'general_manager') {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">General Manager Management</h1>
          <p className="text-muted-foreground">
            Manage general managers, their teams, and oversee operations
          </p>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <Button 
            className="bg-gradient-primary shadow-primary" 
            onClick={() => setIsCreateModalOpen(true)}
            disabled={isLoading}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {isLoading ? 'Loading...' : 'Add General Manager'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Managers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGeneralManagers}</div>
            <p className="text-xs text-muted-foreground">
              All general managers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Managers</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeGeneralManagers}</div>
            <p className="text-xs text-muted-foreground">
              Currently working
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Senior Managers</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{seniorManagers}</div>
            <p className="text-xs text-muted-foreground">
              Senior leadership
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Salary</CardTitle>
            <IndianRupee className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{avgSalary.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Management average
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="managers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="managers">All Managers</TabsTrigger>
          <TabsTrigger value="active">Active Managers</TabsTrigger>
          <TabsTrigger value="inactive">Inactive Managers</TabsTrigger>
        </TabsList>

        <TabsContent value="managers" className="space-y-4">
          <UserFilters
            title="General Manager Filters"
            searchPlaceholder="Search managers by name, email, or role..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filterValue={departmentFilter}
            onFilterChange={setDepartmentFilter}
            filterOptions={[
              { value: 'all', label: 'All Departments' },
              { value: 'operations', label: 'Operations' },
              { value: 'management', label: 'Management' },
              { value: 'development', label: 'Development' },
              { value: 'marketing', label: 'Marketing' },
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

          {/* General Managers Table */}
          <Card>
            <CardHeader>
              <CardTitle>All General Managers ({filteredGeneralManagers.length})</CardTitle>
              <CardDescription>
                Complete directory of general managers with information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading general managers...</div>
              ) : filteredGeneralManagers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No general managers found matching your search criteria.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>General Manager</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Management Level</TableHead>
                        <TableHead>Salary</TableHead>
                        <TableHead>Join Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGeneralManagers.map((gm) => (
                        <TableRow 
                          key={gm.id} 
                          className="hover:bg-muted/50 cursor-pointer" 
                          onClick={() => handleViewGeneralManager(gm)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                                  {getAvatarFallback(gm)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {gm.full_name}
                                </div>
                                <div className="text-sm text-muted-foreground">{gm.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{gm.job_role_name}</div>
                            <div className="text-sm text-muted-foreground">{gm.gm_id}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{gm.department_name}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={getStatusVariant(gm.status)}
                              className={getStatusColor(gm.status)}
                            >
                              {getStatusDisplay(gm.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {gm.management_level || 'Standard'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-green-600">
                              ₹{gm.annual_salary?.toLocaleString() || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(gm.join_date).toLocaleDateString()}
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

        <TabsContent value="active" className="space-y-4">
          <UserFilters
            title="Active Manager Filters"
            searchPlaceholder="Search active managers by name, email, or role..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filterValue={departmentFilter}
            onFilterChange={setDepartmentFilter}
            filterOptions={[
              { value: 'all', label: 'All Departments' },
              { value: 'operations', label: 'Operations' },
              { value: 'management', label: 'Management' },
              { value: 'development', label: 'Development' },
              { value: 'marketing', label: 'Marketing' },
            ]}
            filterPlaceholder="Department"
            onReset={resetFilters}
          />

          <Card>
            <CardHeader>
              <CardTitle>Active General Managers ({generalManagers.filter(e => e.status === 'active').length})</CardTitle>
              <CardDescription>
                General managers currently working and overseeing operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading general managers...</div>
              ) : generalManagers.filter(e => e.status === 'active').length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No active general managers found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>General Manager</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Management Level</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Salary</TableHead>
                        <TableHead>Join Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {generalManagers
                        .filter(e => e.status === 'active')
                        .filter(gm => {
                          const matchesSearch = 
                            gm.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            gm.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (gm.job_role_name || '').toLowerCase().includes(searchTerm.toLowerCase());
                          const matchesDepartment = departmentFilter === 'all' || 
                            (gm.department_name || '').toLowerCase() === departmentFilter;
                          return matchesSearch && matchesDepartment;
                        })
                        .map((gm) => (
                          <TableRow 
                            key={gm.id} 
                            className="hover:bg-muted/50 cursor-pointer" 
                            onClick={() => handleViewGeneralManager(gm)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                                    {getAvatarFallback(gm)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {gm.full_name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">{gm.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{gm.job_role_name}</div>
                              <div className="text-sm text-muted-foreground">{gm.gm_id}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{gm.department_name}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {gm.management_level || 'Standard'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {gm.years_of_experience ? `${gm.years_of_experience} years` : 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-green-600">
                                ₹{gm.annual_salary?.toLocaleString() || 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {new Date(gm.join_date).toLocaleDateString()}
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
            title="Inactive Manager Filters"
            searchPlaceholder="Search inactive managers by name, email, or role..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filterValue={departmentFilter}
            onFilterChange={setDepartmentFilter}
            filterOptions={[
              { value: 'all', label: 'All Departments' },
              { value: 'operations', label: 'Operations' },
              { value: 'management', label: 'Management' },
              { value: 'development', label: 'Development' },
              { value: 'marketing', label: 'Marketing' },
            ]}
            filterPlaceholder="Department"
            onReset={resetFilters}
          />

          <Card>
            <CardHeader>
              <CardTitle>Inactive General Managers ({generalManagers.filter(e => e.status === 'inactive').length})</CardTitle>
              <CardDescription>
                General managers with inactive status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading general managers...</div>
              ) : generalManagers.filter(e => e.status === 'inactive').length === 0 ? (
                <div className="text-center py-8">
                  <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No inactive general managers found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>General Manager</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Management Level</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Salary</TableHead>
                        <TableHead>Join Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {generalManagers
                        .filter(e => e.status === 'inactive')
                        .filter(gm => {
                          const matchesSearch = 
                            gm.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            gm.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (gm.job_role_name || '').toLowerCase().includes(searchTerm.toLowerCase());
                          const matchesDepartment = departmentFilter === 'all' || 
                            (gm.department_name || '').toLowerCase() === departmentFilter;
                          return matchesSearch && matchesDepartment;
                        })
                        .map((gm) => (
                          <TableRow 
                            key={gm.id} 
                            className="hover:bg-muted/50 cursor-pointer" 
                            onClick={() => handleViewGeneralManager(gm)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                                    {getAvatarFallback(gm)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {gm.full_name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">{gm.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{gm.job_role_name}</div>
                              <div className="text-sm text-muted-foreground">{gm.gm_id}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{gm.department_name}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {gm.management_level || 'Standard'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {gm.years_of_experience ? `${gm.years_of_experience} years` : 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-green-600">
                                ₹{gm.annual_salary?.toLocaleString() || 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {new Date(gm.join_date).toLocaleDateString()}
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

      {/* Using employee modals with General Manager data */}
      <EmployeeCreateModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModals}
        onEmployeeCreated={handleCreateGeneralManager}
        title="Add General Manager"
      />

      <EmployeeEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        employee={selectedGeneralManager}
        onEmployeeUpdated={handleUpdateGeneralManager}
        title="Edit General Manager"
      />

      <EmployeeDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseModals}
        employee={selectedGeneralManager}
        onEdit={handleEditGeneralManager}
        onDelete={handleDeleteGeneralManager}
        onDeactivate={handleDeactivateGeneralManager}
        onActivate={handleActivateGeneralManager}
        title="General Manager Details"
      />
    </div>
  );
}