import { useState, useEffect } from 'react';
import { Plus, Search, Mail, Phone, MapPin, Calendar, IndianRupee, User, CheckCircle, TrendingUp } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { EmployeeCreateModal } from '@/components/employees/EmployeeCreateModal';
import { EmployeeEditModal } from '@/components/employees/EmployeeEditModal';
import { EmployeeDetailsModal } from '@/components/employees/EmployeeDetailsModal';
import { UserFilters } from '@/components/common/UserFilters';
import { employeeApi } from '../lib/employeeService';

// Update the interface to match your actual API response
interface Employee {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  job_role_name: string;
  department_name: string;
  status: string;
  join_date: string;
  // These fields might not be in the list response but in detail response
  first_name?: string;
  last_name?: string;
  job_role?: string;
  department?: string;
  annual_salary?: number;
  address?: string;
  monthly_salary?: number;
  employment_duration?: number;
  profile_picture?: string;
  date_of_birth?: string;
  blood_group?: string;
  account_holder_name?: string;
  account_number?: string;
  bank_name?: string;
  bank_branch?: string;
  ifsc_code?: string;
  notes?: string;
  documents?: any[];
  created_at?: string;
  updated_at?: string;
}

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
  };
}

export function Employees() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // Employee data state
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Load employees on component mount and when filters change
  useEffect(() => {
    loadEmployees();
  }, [searchTerm, statusFilter, departmentFilter]);

  const loadEmployees = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (departmentFilter !== 'all') params.department = departmentFilter;

      const response = await employeeApi.getAll(params);
      const apiResponse: DjangoApiResponse<Employee> = response.data;

      if (apiResponse.results && Array.isArray(apiResponse.results)) {
        console.log('Employees loaded:', apiResponse.results);
        setEmployees(apiResponse.results);
      } else {
        console.warn('API returned no results:', apiResponse);
        setEmployees([]);
      }
    } catch (error: any) {
      console.error('Error loading employees:', error);
      toast({
        title: "Error",
        description: "Failed to load employees",
        variant: "destructive",
      });
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.job_role_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || 
      (employee.department_name || '').toLowerCase() === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Calculate stats based on actual data
  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const totalEmployees = employees.length;

  // Modal handlers
  const handleCreateEmployee = async (newEmployeeData: any): Promise<boolean> => {
    try {
      const response = await employeeApi.create(newEmployeeData);
      
      // Reload employees to get the updated list with proper structure
      await loadEmployees();
      toast({
        title: "Success",
        description: "Employee created successfully",
      });
      return true;
    } catch (error: any) {
      console.error('Error creating employee:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to create employee",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleUpdateEmployee = async (updatedEmployeeData: any): Promise<boolean> => {
    if (!selectedEmployee) return false;
    
    try {
      await employeeApi.update(selectedEmployee.id, updatedEmployeeData);
      
      // Reload employees to get the updated list
      await loadEmployees();
      toast({
        title: "Success",
        description: "Employee updated successfully",
      });
      return true;
    } catch (error: any) {
      console.error('Error updating employee:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to update employee",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleViewEmployee = async (employee: Employee): Promise<void> => {
    try {
      // Fetch full employee details - this should return the complete employee object
      const response = await employeeApi.getById(employee.id);
      const apiResponse: any = response.data;
      
      // Handle the response format - it might be different from the list response
      const employeeData = apiResponse.results?.[0] || apiResponse.data || apiResponse;
      if (employeeData) {
        setSelectedEmployee(employeeData);
        setIsDetailsModalOpen(true);
      } else {
        // If detail endpoint returns same structure, use the existing employee data
        setSelectedEmployee(employee);
        setIsDetailsModalOpen(true);
      }
    } catch (error: any) {
      console.error('Error loading employee details:', error);
      // Even if detail fetch fails, show the basic info we have
      setSelectedEmployee(employee);
      setIsDetailsModalOpen(true);
    }
  };

  const handleEditEmployee = (employee: Employee): void => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
  };

  const handleDeleteEmployee = async (employee: Employee): Promise<boolean> => {
    try {
      await employeeApi.delete(employee.id);
      await loadEmployees();
      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });
      return true;
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to delete employee",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDeactivateEmployee = async (employee: Employee): Promise<boolean> => {
    try {
      await employeeApi.partialUpdate(employee.id, { status: 'inactive' });
      await loadEmployees();
      toast({
        title: "Success",
        description: "Employee deactivated successfully",
      });
      return true;
    } catch (error: any) {
      console.error('Error deactivating employee:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to deactivate employee",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleActivateEmployee = async (employee: Employee): Promise<boolean> => {
    try {
      await employeeApi.partialUpdate(employee.id, { status: 'active' });
      await loadEmployees();
      toast({
        title: "Success",
        description: "Employee activated successfully",
      });
      return true;
    } catch (error: any) {
      console.error('Error activating employee:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to activate employee",
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
    setSelectedEmployee(null);
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
  const getAvatarFallback = (employee: Employee): string => {
    if (!employee.full_name) return '??';
    return employee.full_name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Role-based permissions
  const canManageEmployees = user?.role === 'admin' || user?.role === 'general_manager' || user?.role === 'hr';
  const canViewSalaries = user?.role === 'admin' || user?.role === 'general_manager' || user?.role === 'hr';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">
            Manage your team members and their information
          </p>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          {canManageEmployees && (
            <Button 
              className="bg-gradient-primary shadow-primary"
              onClick={() => setIsCreateModalOpen(true)}
              disabled={isLoading}
            >
              <Plus className="mr-2 h-4 w-4" />
              {isLoading ? 'Loading...' : 'Add Employee'}
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              All employees
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Currently working
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
              {/* Note: Salary might not be in list response */}
              ₹{employees.some(emp => emp.annual_salary) 
                ? Math.round(employees.reduce((sum, emp) => sum + (emp.annual_salary || 0), 0) / employees.length).toLocaleString()
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Company average
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalEmployees > 0 ? Math.round((activeEmployees / totalEmployees) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Active employees
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">All Employees</TabsTrigger>
          <TabsTrigger value="active">Active Employees</TabsTrigger>
          <TabsTrigger value="inactive">Inactive Employees</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <UserFilters
            title="Employee Filters"
            searchPlaceholder="Search employees by name, email, or role..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filterValue={departmentFilter}
            onFilterChange={setDepartmentFilter}
            filterOptions={[
              { value: 'all', label: 'All Departments' },
              { value: 'development', label: 'Development' },
              { value: 'design', label: 'Design' },
              { value: 'management', label: 'Management' },
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

          <Card>
            <CardHeader>
              <CardTitle>All Employees ({filteredEmployees.length})</CardTitle>
              <CardDescription>
                Complete directory of team members with contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading employees...</div>
              ) : filteredEmployees.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No employees found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Join Date</TableHead>
                        {canViewSalaries && <TableHead>Salary</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees.map((employee) => (
                        <TableRow 
                          key={employee.id} 
                          className="hover:bg-muted/50 cursor-pointer" 
                          onClick={() => handleViewEmployee(employee)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                                  {getAvatarFallback(employee)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {employee.full_name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {employee.employee_id}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{employee.job_role_name}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{employee.department_name}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={getStatusVariant(employee.status)}
                              className={getStatusColor(employee.status)}
                            >
                              {getStatusDisplay(employee.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-3 w-3" />
                                {employee.email}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {employee.phone_number}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {new Date(employee.join_date).toLocaleDateString()}
                            </div>
                          </TableCell>
                          {canViewSalaries && (
                            <TableCell>
                              <div className="font-medium text-green-600">
                                {employee.annual_salary 
                                  ? `₹${employee.annual_salary.toLocaleString()}`
                                  : 'N/A'
                                }
                              </div>
                            </TableCell>
                          )}
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
    title="Active Employee Filters"
    searchPlaceholder="Search active employees by name, email, or role..."
    searchValue={searchTerm}
    onSearchChange={setSearchTerm}
    filterValue={departmentFilter}
    onFilterChange={setDepartmentFilter}
    filterOptions={[
      { value: 'all', label: 'All Departments' },
      { value: 'development', label: 'Development' },
      { value: 'design', label: 'Design' },
      { value: 'management', label: 'Management' },
      { value: 'marketing', label: 'Marketing' },
    ]}
    filterPlaceholder="Department"
    onReset={resetFilters}
  />

  <Card>
    <CardHeader>
      <CardTitle>Active Employees ({employees.filter(e => e.status === 'active').length})</CardTitle>
      <CardDescription>
        Employees currently working and active in the system
      </CardDescription>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="text-center py-8">Loading employees...</div>
      ) : employees.filter(e => e.status === 'active').length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No active employees found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Join Date</TableHead>
                {canViewSalaries && <TableHead>Salary</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees
                .filter(e => e.status === 'active')
                .filter(employee => {
                  const matchesSearch = 
                    employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (employee.job_role_name || '').toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesDepartment = departmentFilter === 'all' || 
                    (employee.department_name || '').toLowerCase() === departmentFilter;
                  return matchesSearch && matchesDepartment;
                })
                .map((employee) => (
                  <TableRow 
                    key={employee.id} 
                    className="hover:bg-muted/50 cursor-pointer" 
                    onClick={() => handleViewEmployee(employee)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                            {getAvatarFallback(employee)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {employee.full_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {employee.employee_id}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{employee.job_role_name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{employee.department_name}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3" />
                          {employee.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {employee.phone_number}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(employee.join_date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    {canViewSalaries && (
                      <TableCell>
                        <div className="font-medium text-green-600">
                          {employee.annual_salary 
                            ? `₹${employee.annual_salary.toLocaleString()}`
                            : 'N/A'
                          }
                        </div>
                      </TableCell>
                    )}
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
    title="Inactive Employee Filters"
    searchPlaceholder="Search inactive employees by name, email, or role..."
    searchValue={searchTerm}
    onSearchChange={setSearchTerm}
    filterValue={departmentFilter}
    onFilterChange={setDepartmentFilter}
    filterOptions={[
      { value: 'all', label: 'All Departments' },
      { value: 'development', label: 'Development' },
      { value: 'design', label: 'Design' },
      { value: 'management', label: 'Management' },
      { value: 'marketing', label: 'Marketing' },
    ]}
    filterPlaceholder="Department"
    onReset={resetFilters}
  />

  <Card>
    <CardHeader>
      <CardTitle>Inactive Employees ({employees.filter(e => e.status === 'inactive').length})</CardTitle>
      <CardDescription>
        Employees with inactive status in the system
      </CardDescription>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="text-center py-8">Loading employees...</div>
      ) : employees.filter(e => e.status === 'inactive').length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No inactive employees found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Join Date</TableHead>
                {canViewSalaries && <TableHead>Salary</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees
                .filter(e => e.status === 'inactive')
                .filter(employee => {
                  const matchesSearch = 
                    employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (employee.job_role_name || '').toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesDepartment = departmentFilter === 'all' || 
                    (employee.department_name || '').toLowerCase() === departmentFilter;
                  return matchesSearch && matchesDepartment;
                })
                .map((employee) => (
                  <TableRow 
                    key={employee.id} 
                    className="hover:bg-muted/50 cursor-pointer" 
                    onClick={() => handleViewEmployee(employee)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                            {getAvatarFallback(employee)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {employee.full_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {employee.employee_id}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{employee.job_role_name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{employee.department_name}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3" />
                          {employee.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {employee.phone_number}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(employee.join_date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    {canViewSalaries && (
                      <TableCell>
                        <div className="font-medium text-green-600">
                          {employee.annual_salary 
                            ? `₹${employee.annual_salary.toLocaleString()}`
                            : 'N/A'
                          }
                        </div>
                      </TableCell>
                    )}
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

      {/* Employee Modals */}
      <EmployeeCreateModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModals}
        onEmployeeCreated={handleCreateEmployee}
      />

      <EmployeeEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        employee={selectedEmployee}
        onEmployeeUpdated={handleUpdateEmployee}
      />

      <EmployeeDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseModals}
        employee={selectedEmployee}
        onEdit={handleEditEmployee}
        onDelete={handleDeleteEmployee}
        onDeactivate={handleDeactivateEmployee}
        onActivate={handleActivateEmployee}
      />
    </div>
  );
}