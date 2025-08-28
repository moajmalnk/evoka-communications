import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { Calendar, Download, TrendingUp, Users, DollarSign, Clock, FileText, Building2, Receipt, User, CheckCircle, XCircle, AlertTriangle, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { projectService } from '@/lib/projectService';
import { taskService } from '@/lib/taskService';
import { workSubmissionService } from '@/lib/workSubmissionService';
import { invoiceService } from '@/lib/invoiceService';
import { attendanceService } from '@/lib/attendanceService';
import { financeService } from '@/lib/financeService';

export function Reports() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState('last-6-months');
  const [reportType, setReportType] = useState('overview');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for charts (in a real app, this would come from the services)
  const projectData = [
    { name: 'Jan', completed: 12, active: 8, planning: 5, onHold: 2 },
    { name: 'Feb', completed: 15, active: 12, planning: 3, onHold: 1 },
    { name: 'Mar', completed: 18, active: 10, planning: 7, onHold: 3 },
    { name: 'Apr', completed: 22, active: 15, planning: 4, onHold: 2 },
    { name: 'May', completed: 20, active: 18, planning: 6, onHold: 1 },
    { name: 'Jun', completed: 25, active: 14, planning: 8, onHold: 2 },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 45000, expenses: 32000, profit: 13000 },
    { month: 'Feb', revenue: 52000, expenses: 35000, profit: 17000 },
    { month: 'Mar', revenue: 48000, expenses: 33000, profit: 15000 },
    { month: 'Apr', revenue: 61000, expenses: 42000, profit: 19000 },
    { month: 'May', revenue: 58000, expenses: 38000, profit: 20000 },
    { month: 'Jun', revenue: 67000, expenses: 45000, profit: 22000 },
  ];

  const employeeProductivity = [
    { name: 'John Doe', tasks: 45, hours: 180, efficiency: 92 },
    { name: 'Jane Smith', tasks: 38, hours: 165, efficiency: 88 },
    { name: 'Mike Johnson', tasks: 42, hours: 175, efficiency: 90 },
    { name: 'Sarah Wilson', tasks: 35, hours: 155, efficiency: 85 },
    { name: 'David Brown', tasks: 28, hours: 140, efficiency: 82 },
  ];

  const attendanceData = [
    { day: 'Mon', present: 45, absent: 5, late: 3, remote: 2 },
    { day: 'Tue', present: 48, absent: 2, late: 1, remote: 3 },
    { day: 'Wed', present: 47, absent: 3, late: 2, remote: 1 },
    { day: 'Thu', present: 46, absent: 4, late: 1, remote: 2 },
    { day: 'Fri', present: 44, absent: 6, late: 2, remote: 3 },
  ];

  const leaveData = [
    { type: 'Annual Leave', approved: 15, pending: 3, rejected: 1 },
    { type: 'Sick Leave', approved: 8, pending: 2, rejected: 0 },
    { type: 'Personal Leave', approved: 12, pending: 1, rejected: 2 },
    { type: 'Maternity Leave', approved: 3, pending: 0, rejected: 0 },
    { type: 'Other', approved: 5, pending: 1, rejected: 1 },
  ];

  const pettyExpensesData = [
    { category: 'Office Supplies', amount: 1250, count: 15 },
    { category: 'Travel', amount: 3200, count: 8 },
    { category: 'Meals', amount: 1800, count: 25 },
    { category: 'Equipment', amount: 2100, count: 6 },
    { category: 'Other', amount: 950, count: 12 },
  ];

  const salaryData = [
    { month: 'Jan', total: 45000, average: 4500, count: 10 },
    { month: 'Feb', total: 46000, average: 4600, count: 10 },
    { month: 'Mar', total: 47000, average: 4700, count: 10 },
    { month: 'Apr', total: 48000, average: 4800, count: 10 },
    { month: 'May', total: 49000, average: 4900, count: 10 },
    { month: 'Jun', total: 50000, average: 5000, count: 10 },
  ];

  const handleExportPDF = () => {
    // PDF export logic would go here
    console.log('Exporting PDF...');
  };

  const handleExportExcel = () => {
    // Excel export logic would go here
    console.log('Exporting Excel...');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'active': return 'text-blue-600';
      case 'planning': return 'text-yellow-600';
      case 'onHold': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'active': return 'secondary';
      case 'planning': return 'outline';
      case 'onHold': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your agency performance and operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                    <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                    <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                    <SelectItem value="last-year">Last Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview Report</SelectItem>
                  <SelectItem value="work">Work Reports</SelectItem>
                  <SelectItem value="financial">Financial Reports</SelectItem>
                  <SelectItem value="attendance">Attendance Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Specific Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Month</Label>
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$331,000</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              +15.2% from last period
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects Completed</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">112</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              +23% from last period
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Productivity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              +5% from last period
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Project Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45 days</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              -8% from last period
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Reports Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="work">Work Reports</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Status Over Time</CardTitle>
                <CardDescription>Monthly breakdown of project statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={projectData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completed" stackId="a" fill="#22c55e" />
                    <Bar dataKey="active" stackId="a" fill="#3b82f6" />
                    <Bar dataKey="planning" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="onHold" stackId="a" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Expenses</CardTitle>
                <CardDescription>Monthly financial performance overview</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="expenses" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Work Reports Tab */}
        <TabsContent value="work" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Daily Task Completion Summary</CardTitle>
                <CardDescription>Task completion trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={projectData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={3} />
                    <Line type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Employee Productivity</CardTitle>
                <CardDescription>Tasks completed vs hours worked by employee</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={employeeProductivity} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="tasks" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Work Submission Status</CardTitle>
              <CardDescription>Current status of all work submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">24</div>
                  <div className="text-sm text-muted-foreground">Pending Review</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">156</div>
                  <div className="text-sm text-muted-foreground">Approved</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">8</div>
                  <div className="text-sm text-muted-foreground">Rejected</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">12</div>
                  <div className="text-sm text-muted-foreground">Needs Revision</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Reports Tab */}
        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Trend</CardTitle>
                <CardDescription>Revenue growth over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={3} />
                    <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Petty Expenses by Category</CardTitle>
                <CardDescription>Breakdown of petty cash expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pettyExpensesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="amount"
                    >
                      {pettyExpensesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff6b6b'][index]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Client Invoices Summary</CardTitle>
                <CardDescription>Invoice status and payment tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Invoices</span>
                    <Badge variant="outline">156</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Paid</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">124</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Pending</span>
                    <Badge variant="outline" className="text-yellow-600">28</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overdue</span>
                    <Badge variant="destructive">4</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Salary Reports</CardTitle>
                <CardDescription>Monthly salary trends and statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salaryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Bar dataKey="total" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Attendance Reports Tab */}
        <TabsContent value="attendance" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Attendance Pattern</CardTitle>
                <CardDescription>Employee attendance throughout the week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="present" stackId="a" fill="#22c55e" />
                    <Bar dataKey="remote" stackId="a" fill="#3b82f6" />
                    <Bar dataKey="late" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="absent" stackId="a" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leave Reports Summary</CardTitle>
                <CardDescription>Leave requests by type and status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={leaveData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="type" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="approved" stackId="a" fill="#22c55e" />
                    <Bar dataKey="pending" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="rejected" stackId="a" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Attendance Summary</CardTitle>
              <CardDescription>Overall attendance statistics for the month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">92%</div>
                  <div className="text-sm text-muted-foreground">Attendance Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">1,080</div>
                  <div className="text-sm text-muted-foreground">Total Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">45</div>
                  <div className="text-sm text-muted-foreground">Late Arrivals</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">12</div>
                  <div className="text-sm text-muted-foreground">Absences</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detailed Data Tables */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Reports Data</CardTitle>
          <CardDescription>Export and analyze detailed data for each report type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Project Status Report
              </Button>
              <Button variant="outline" size="sm">
                <Building2 className="mr-2 h-4 w-4" />
                Client Invoice Report
              </Button>
              <Button variant="outline" size="sm">
                <Receipt className="mr-2 h-4 w-4" />
                Expense Report
              </Button>
              <Button variant="outline" size="sm">
                <User className="mr-2 h-4 w-4" />
                Employee Performance
              </Button>
              <Button variant="outline" size="sm">
                <CheckCircle className="mr-2 h-4 w-4" />
                Attendance Summary
              </Button>
              <Button variant="outline" size="sm">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Leave Management
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}