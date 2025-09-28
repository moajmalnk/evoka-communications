import { useState, useEffect } from 'react';
import { 
  Users, Search, MoreHorizontal, Eye, Edit, Clock, IndianRupee, 
  Calendar, Filter, UserPlus, FileText, TrendingUp, CheckCircle, XCircle, RotateCcw
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
import { CustomClock } from '@/components/ui/custom-clock';
import { CustomCalendar } from '@/components/ui/custom-calendar';
import { EmployeeCreateModal } from '@/components/employees/EmployeeCreateModal';
import { EmployeeEditModal } from '@/components/employees/EmployeeEditModal';
import { EmployeeDetailsModal } from '@/components/employees/EmployeeDetailsModal';
import { PayrollDetailsModal } from '@/components/payroll/PayrollDetailsModal';
import { UserFilters } from '@/components/common/UserFilters';
import { hrApi, HR } from '@/lib/hrService';

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

// PayrollRecord interface (keep existing)
interface PayrollRecord {
  id: string;
  employeeName: string;
  employeeId: string;
  payPeriod: string;
  baseSalary: number;
  overtime: number;
  bonuses: number;
  deductions: number;
  netSalary: number;
  paymentDate: string;
  status: string;
}

// Mock data for leave requests and payroll (keep existing)
const mockLeaveRequests = [
  {
    id: 'LR-001',
    employeeName: 'Sarah Wilson',
    employeeId: 'EMP-004',
    leaveType: 'Annual Leave',
    startDate: '2024-04-01',
    endDate: '2024-04-05',
    days: 5,
    reason: 'Family vacation',
    status: 'Pending',
    submittedDate: '2024-03-10'
  },
  {
    id: 'LR-002',
    employeeName: 'David Brown',
    employeeId: 'EMP-005',
    leaveType: 'Sick Leave',
    startDate: '2024-03-20',
    endDate: '2024-03-22',
    days: 3,
    reason: 'Medical appointment',
    status: 'Approved',
    submittedDate: '2024-03-18'
  }
];

const mockPayrollRecords = [
  {
    id: 'PR-001',
    employeeName: 'John Doe',
    employeeId: 'EMP-001',
    payPeriod: 'March 2024',
    baseSalary: 85000,
    overtime: 2000,
    bonuses: 5000,
    deductions: 1500,
    netSalary: 90500,
    paymentDate: '2024-03-31',
    status: 'Paid'
  }
];

export function HR() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // HR modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [selectedHR, setSelectedHR] = useState<HR | null>(null);
  
  // Payroll modal states
  const [isPayrollDetailsModalOpen, setIsPayrollDetailsModalOpen] = useState(false);
  const [selectedPayrollRecord, setSelectedPayrollRecord] = useState<PayrollRecord | null>(null);
  
  // HR data state
  const [hrStaff, setHRStaff] = useState<HR[]>([]);

  // Load HR staff on component mount and when filters change
  useEffect(() => {
    loadHRStaff();
  }, [searchTerm, statusFilter, departmentFilter]);

  const loadHRStaff = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (departmentFilter !== 'all') params.department = departmentFilter;

      const response = await hrApi.getAll(params);
      const apiResponse: DjangoApiResponse<HR> = response.data;

      if (apiResponse.results && Array.isArray(apiResponse.results)) {
        console.log('HR staff loaded:', apiResponse.results);
        setHRStaff(apiResponse.results);
      } else {
        console.warn('API returned no results:', apiResponse);
        setHRStaff([]);
      }
    } catch (error: any) {
      console.error('Error loading HR staff:', error);
      toast({
        title: "Error",
        description: "Failed to load HR staff",
        variant: "destructive",
      });
      setHRStaff([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter HR staff based on search and filters
  const filteredHRStaff = hrStaff.filter(hr => {
    const matchesSearch = 
      hr.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hr.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (hr.job_role_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || hr.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || 
      (hr.department_name || '').toLowerCase() === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Calculate stats based on actual data
  const activeHRStaff = hrStaff.filter(e => e.status === 'active').length;
  const totalHRStaff = hrStaff.length;
  const pendingLeaveRequests = mockLeaveRequests.filter(l => l.status === 'Pending').length;
  const avgSalary = hrStaff.length > 0 
    ? Math.round(hrStaff.reduce((sum, hr) => sum + (hr.annual_salary || 0), 0) / hrStaff.length)
    : 0;

  // Modal handlers for HR staff
  const handleCreateHR = async (newHRData: any): Promise<boolean> => {
    try {
      const response = await hrApi.create(newHRData);
      
      // Reload HR staff to get the updated list with proper structure
      await loadHRStaff();
      toast({
        title: "Success",
        description: "HR staff created successfully",
      });
      return true;
    } catch (error: any) {
      console.error('Error creating HR staff:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to create HR staff",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleUpdateHR = async (updatedHRData: any): Promise<boolean> => {
    if (!selectedHR) return false;
    
    try {
      await hrApi.update(selectedHR.id, updatedHRData);
      
      // Reload HR staff to get the updated list
      await loadHRStaff();
      toast({
        title: "Success",
        description: "HR staff updated successfully",
      });
      return true;
    } catch (error: any) {
      console.error('Error updating HR staff:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to update HR staff",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleViewHR = async (hr: HR): Promise<void> => {
    try {
      // Fetch full HR details
      const response = await hrApi.getById(hr.id);
      const apiResponse: any = response.data;
      
      // Handle the response format
      const hrData = apiResponse.results?.[0] || apiResponse.data || apiResponse;
      if (hrData) {
        setSelectedHR(hrData);
        setIsDetailsModalOpen(true);
      } else {
        setSelectedHR(hr);
        setIsDetailsModalOpen(true);
      }
    } catch (error: any) {
      console.error('Error loading HR details:', error);
      setSelectedHR(hr);
      setIsDetailsModalOpen(true);
    }
  };

  const handleEditHR = (hr: HR): void => {
    setSelectedHR(hr);
    setIsEditModalOpen(true);
  };

  const handleDeleteHR = async (hr: HR): Promise<boolean> => {
    try {
      await hrApi.delete(hr.id);
      await loadHRStaff();
      toast({
        title: "Success",
        description: "HR staff deleted successfully",
      });
      return true;
    } catch (error: any) {
      console.error('Error deleting HR staff:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to delete HR staff",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDeactivateHR = async (hr: HR): Promise<boolean> => {
    try {
      await hrApi.partialUpdate(hr.id, { status: 'inactive' });
      await loadHRStaff();
      toast({
        title: "Success",
        description: "HR staff deactivated successfully",
      });
      return true;
    } catch (error: any) {
      console.error('Error deactivating HR staff:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to deactivate HR staff",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleActivateHR = async (hr: HR): Promise<boolean> => {
    try {
      await hrApi.partialUpdate(hr.id, { status: 'active' });
      await loadHRStaff();
      toast({
        title: "Success",
        description: "HR staff activated successfully",
      });
      return true;
    } catch (error: any) {
      console.error('Error activating HR staff:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to activate HR staff",
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
    setSelectedHR(null);
  };

  // Payroll modal handlers (keep existing)
  const handleViewPayrollRecord = (payrollRecord: PayrollRecord) => {
    setSelectedPayrollRecord(payrollRecord);
    setIsPayrollDetailsModalOpen(true);
  };

  const handleClosePayrollModal = () => {
    setIsPayrollDetailsModalOpen(false);
    setSelectedPayrollRecord(null);
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
  const getAvatarFallback = (hr: HR): string => {
    if (!hr.full_name) return 'HR';
    return hr.full_name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Role verification - Admin and HR have access
  if (user?.role !== 'admin' && user?.role !== 'hr') {
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
          <h1 className="text-3xl font-bold tracking-tight">HR Management</h1>
          <p className="text-muted-foreground">
            Manage HR staff, attendance, salaries, and leave requests
          </p>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <Button 
            className="bg-gradient-primary shadow-primary" 
            onClick={() => setIsCreateModalOpen(true)}
            disabled={isLoading}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {isLoading ? 'Loading...' : 'Add HR Manager'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total HR</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHRStaff}</div>
            <p className="text-xs text-muted-foreground">
              All HR managers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active HR</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeHRStaff}</div>
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
              ₹{avgSalary.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Company average
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Leave</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingLeaveRequests}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">All HR</TabsTrigger>
          <TabsTrigger value="active">Active HR</TabsTrigger>
          <TabsTrigger value="inactive">Inactive HR</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <UserFilters
            title="HR Filters"
            searchPlaceholder="Search HR by name, email, or role..."
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

          {/* HR Table */}
          <Card>
            <CardHeader>
              <CardTitle>All HR ({filteredHRStaff.length})</CardTitle>
              <CardDescription>
                Complete directory of HR team members with information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading HR staff...</div>
              ) : filteredHRStaff.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No HR managers found matching your search criteria.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>HR Manager</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Salary</TableHead>
                        <TableHead>Join Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHRStaff.map((hr) => (
                        <TableRow 
                          key={hr.id} 
                          className="hover:bg-muted/50 cursor-pointer" 
                          onClick={() => handleViewHR(hr)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                                  {getAvatarFallback(hr)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {hr.full_name}
                                </div>
                                <div className="text-sm text-muted-foreground">{hr.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{hr.job_role_name}</div>
                            <div className="text-sm text-muted-foreground">{hr.hr_id}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{hr.department_name}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={getStatusVariant(hr.status)}
                              className={getStatusColor(hr.status)}
                            >
                              {getStatusDisplay(hr.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-green-600">
                              ₹{hr.annual_salary?.toLocaleString() || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(hr.join_date).toLocaleDateString()}
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
            title="Active HR Filters"
            searchPlaceholder="Search active HR by name, email, or role..."
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
              <CardTitle>Active HR ({hrStaff.filter(e => e.status === 'active').length})</CardTitle>
              <CardDescription>
                HR managers currently working
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading HR staff...</div>
              ) : hrStaff.filter(e => e.status === 'active').length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No active HR managers found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>HR Manager</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Salary</TableHead>
                        <TableHead>Join Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hrStaff
                        .filter(e => e.status === 'active')
                        .filter(hr => {
                          const matchesSearch = 
                            hr.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            hr.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (hr.job_role_name || '').toLowerCase().includes(searchTerm.toLowerCase());
                          const matchesDepartment = departmentFilter === 'all' || 
                            (hr.department_name || '').toLowerCase() === departmentFilter;
                          return matchesSearch && matchesDepartment;
                        })
                        .map((hr) => (
                          <TableRow 
                            key={hr.id} 
                            className="hover:bg-muted/50 cursor-pointer" 
                            onClick={() => handleViewHR(hr)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                                    {getAvatarFallback(hr)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {hr.full_name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">{hr.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{hr.job_role_name}</div>
                              <div className="text-sm text-muted-foreground">{hr.hr_id}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{hr.department_name}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-green-600">
                                ₹{hr.annual_salary?.toLocaleString() || 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {new Date(hr.join_date).toLocaleDateString()}
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
            title="Inactive HR Filters"
            searchPlaceholder="Search inactive HR by name, email, or role..."
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
              <CardTitle>Inactive HR ({hrStaff.filter(e => e.status === 'inactive').length})</CardTitle>
              <CardDescription>
                HR managers with inactive status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading HR staff...</div>
              ) : hrStaff.filter(e => e.status === 'inactive').length === 0 ? (
                <div className="text-center py-8">
                  <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No inactive HR managers found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>HR Manager</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Salary</TableHead>
                        <TableHead>Join Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hrStaff
                        .filter(e => e.status === 'inactive')
                        .filter(hr => {
                          const matchesSearch = 
                            hr.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            hr.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (hr.job_role_name || '').toLowerCase().includes(searchTerm.toLowerCase());
                          const matchesDepartment = departmentFilter === 'all' || 
                            (hr.department_name || '').toLowerCase() === departmentFilter;
                          return matchesSearch && matchesDepartment;
                        })
                        .map((hr) => (
                          <TableRow 
                            key={hr.id} 
                            className="hover:bg-muted/50 cursor-pointer" 
                            onClick={() => handleViewHR(hr)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                                    {getAvatarFallback(hr)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {hr.full_name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">{hr.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{hr.job_role_name}</div>
                              <div className="text-sm text-muted-foreground">{hr.hr_id}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{hr.department_name}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-green-600">
                                ₹{hr.annual_salary?.toLocaleString() || 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {new Date(hr.join_date).toLocaleDateString()}
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

      {/* For now, using employee modals with HR data */}
      <EmployeeCreateModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModals}
        onEmployeeCreated={handleCreateHR}
        title="Add HR Manager"
      />

      <EmployeeEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        employee={selectedHR}
        onEmployeeUpdated={handleUpdateHR}
        title="Edit HR Manager"
      />

      <EmployeeDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseModals}
        employee={selectedHR}
        onEdit={handleEditHR}
        onDelete={handleDeleteHR}
        onDeactivate={handleDeactivateHR}
        onActivate={handleActivateHR}
        title="HR Manager Details"
      />

      <PayrollDetailsModal
        isOpen={isPayrollDetailsModalOpen}
        onClose={handleClosePayrollModal}
        payrollRecord={selectedPayrollRecord}
      />
    </div>
  );
}