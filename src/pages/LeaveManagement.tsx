import { useState } from 'react';
import { Plus, Search, MoreHorizontal, Calendar, User, Clock } from 'lucide-react';
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

// Mock leave data
const mockLeaveRequests = [
  {
    id: 'LR-001',
    employeeName: 'John Doe',
    employeeId: 'EMP-001',
    leaveType: 'Sick Leave',
    startDate: '2024-02-05',
    endDate: '2024-02-07',
    days: 3,
    reason: 'Flu symptoms and fever',
    status: 'Approved',
    appliedDate: '2024-02-02',
    approvedBy: 'Alice Johnson',
  },
  {
    id: 'LR-002',
    employeeName: 'Jane Smith',
    employeeId: 'EMP-002',
    leaveType: 'Annual Leave',
    startDate: '2024-02-15',
    endDate: '2024-02-20',
    days: 6,
    reason: 'Family vacation',
    status: 'Pending',
    appliedDate: '2024-01-28',
    approvedBy: null,
  },
  {
    id: 'LR-003',
    employeeName: 'Mike Johnson',
    employeeId: 'EMP-003',
    leaveType: 'Personal Leave',
    startDate: '2024-02-12',
    endDate: '2024-02-12',
    days: 1,
    reason: 'Medical appointment',
    status: 'Approved',
    appliedDate: '2024-02-08',
    approvedBy: 'HR Manager',
  },
  {
    id: 'LR-004',
    employeeName: 'Sarah Wilson',
    employeeId: 'EMP-004',
    leaveType: 'Maternity Leave',
    startDate: '2024-03-01',
    endDate: '2024-05-31',
    days: 92,
    reason: 'Maternity leave for newborn',
    status: 'Approved',
    appliedDate: '2024-01-15',
    approvedBy: 'HR Manager',
  },
  {
    id: 'LR-005',
    employeeName: 'David Brown',
    employeeId: 'EMP-005',
    leaveType: 'Annual Leave',
    startDate: '2024-02-25',
    endDate: '2024-02-28',
    days: 4,
    reason: 'Extended weekend getaway',
    status: 'Rejected',
    appliedDate: '2024-02-20',
    approvedBy: 'Alice Johnson',
  },
];

const leaveBalance = [
  {
    employeeId: 'EMP-001',
    employeeName: 'John Doe',
    annualLeave: { total: 25, used: 8, remaining: 17 },
    sickLeave: { total: 10, used: 3, remaining: 7 },
    personalLeave: { total: 5, used: 1, remaining: 4 },
  },
  {
    employeeId: 'EMP-002',
    employeeName: 'Jane Smith',
    annualLeave: { total: 25, used: 12, remaining: 13 },
    sickLeave: { total: 10, used: 2, remaining: 8 },
    personalLeave: { total: 5, used: 0, remaining: 5 },
  },
  {
    employeeId: 'EMP-003',
    employeeName: 'Mike Johnson',
    annualLeave: { total: 25, used: 15, remaining: 10 },
    sickLeave: { total: 10, used: 1, remaining: 9 },
    personalLeave: { total: 5, used: 2, remaining: 3 },
  },
];

const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'rejected':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'text-success';
    case 'pending':
      return 'text-warning';
    case 'rejected':
      return 'text-destructive';
    default:
      return 'text-muted-foreground';
  }
};

const getLeaveTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'annual leave':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'sick leave':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'personal leave':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'maternity leave':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export function LeaveManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('requests');

  const filteredRequests = mockLeaveRequests.filter(request => {
    const matchesSearch = request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status.toLowerCase() === statusFilter;
    const matchesType = leaveTypeFilter === 'all' || request.leaveType.toLowerCase() === leaveTypeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const pendingRequests = mockLeaveRequests.filter(r => r.status === 'Pending').length;
  const approvedRequests = mockLeaveRequests.filter(r => r.status === 'Approved').length;
  const totalDaysRequested = mockLeaveRequests.reduce((sum, r) => sum + r.days, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
          <p className="text-muted-foreground">
            Manage employee leave requests and track leave balances
          </p>
        </div>
        <Button className="bg-gradient-primary shadow-primary">
          <Plus className="mr-2 h-4 w-4" />
          New Leave Policy
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{pendingRequests}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved This Month</CardTitle>
            <Calendar className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{approvedRequests}</div>
            <p className="text-xs text-muted-foreground">
              Successfully approved
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Days Requested</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDaysRequested}</div>
            <p className="text-xs text-muted-foreground">
              All requests combined
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Leave Days</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(totalDaysRequested / mockLeaveRequests.length)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per employee
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button 
          variant={activeTab === 'requests' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('requests')}
          className="px-4"
        >
          Leave Requests
        </Button>
        <Button 
          variant={activeTab === 'balance' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('balance')}
          className="px-4"
        >
          Leave Balance
        </Button>
      </div>

      {activeTab === 'requests' && (
        <>
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by employee name or reason..."
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Leave Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="annual leave">Annual Leave</SelectItem>
                    <SelectItem value="sick leave">Sick Leave</SelectItem>
                    <SelectItem value="personal leave">Personal Leave</SelectItem>
                    <SelectItem value="maternity leave">Maternity Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Leave Requests Table */}
          <Card>
            <CardHeader>
              <CardTitle>Leave Requests ({filteredRequests.length})</CardTitle>
              <CardDescription>
                All employee leave requests with approval status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                                {request.employeeName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{request.employeeName}</div>
                              <div className="text-sm text-muted-foreground">{request.employeeId}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getLeaveTypeColor(request.leaveType)}>
                            {request.leaveType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {new Date(request.startDate).toLocaleDateString()} - 
                              {new Date(request.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{request.days} days</div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={getStatusVariant(request.status)}
                            className={getStatusColor(request.status)}
                          >
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(request.appliedDate).toLocaleDateString()}
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
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              {request.status === 'Pending' && (
                                <>
                                  <DropdownMenuItem className="text-success">
                                    Approve Request
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">
                                    Reject Request
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem>View Employee Profile</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'balance' && (
        <Card>
          <CardHeader>
            <CardTitle>Employee Leave Balance</CardTitle>
            <CardDescription>
              Current leave balance for all employees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {leaveBalance.map((employee) => (
                <div key={employee.employeeId} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar>
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                        {employee.employeeName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{employee.employeeName}</div>
                      <div className="text-sm text-muted-foreground">{employee.employeeId}</div>
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <div className="text-sm font-medium text-blue-600 mb-2">Annual Leave</div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Used: {employee.annualLeave.used}</span>
                        <span>Remaining: {employee.annualLeave.remaining}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(employee.annualLeave.used / employee.annualLeave.total) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-red-600 mb-2">Sick Leave</div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Used: {employee.sickLeave.used}</span>
                        <span>Remaining: {employee.sickLeave.remaining}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: `${(employee.sickLeave.used / employee.sickLeave.total) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-green-600 mb-2">Personal Leave</div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Used: {employee.personalLeave.used}</span>
                        <span>Remaining: {employee.personalLeave.remaining}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(employee.personalLeave.used / employee.personalLeave.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}