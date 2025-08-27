import { useState } from 'react';
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock attendance data
const mockAttendance = [
  {
    id: '1',
    employeeName: 'John Doe',
    date: '2024-01-29',
    checkIn: '09:00 AM',
    checkOut: '06:30 PM',
    totalHours: '9h 30m',
    status: 'Present',
    notes: '',
  },
  {
    id: '2',
    employeeName: 'Jane Smith',
    date: '2024-01-29',
    checkIn: '08:45 AM',
    checkOut: '05:45 PM',
    totalHours: '9h 00m',
    status: 'Present',
    notes: '',
  },
  {
    id: '3',
    employeeName: 'Mike Johnson',
    date: '2024-01-29',
    checkIn: '10:15 AM',
    checkOut: '07:00 PM',
    totalHours: '8h 45m',
    status: 'Late',
    notes: 'Traffic delay',
  },
  {
    id: '4',
    employeeName: 'Sarah Wilson',
    date: '2024-01-29',
    checkIn: '-',
    checkOut: '-',
    totalHours: '0h 00m',
    status: 'Absent',
    notes: 'Sick leave',
  },
  {
    id: '5',
    employeeName: 'David Brown',
    date: '2024-01-29',
    checkIn: '09:30 AM',
    checkOut: '02:30 PM',
    totalHours: '5h 00m',
    status: 'Half Day',
    notes: 'Personal appointment',
  },
];

// Mock today's summary
const todaySummary = {
  totalEmployees: 15,
  present: 12,
  absent: 2,
  late: 1,
  halfDay: 1,
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'present':
      return <CheckCircle className="h-4 w-4 text-success" />;
    case 'absent':
      return <XCircle className="h-4 w-4 text-destructive" />;
    case 'late':
      return <AlertCircle className="h-4 w-4 text-warning" />;
    case 'half day':
      return <Clock className="h-4 w-4 text-blue-500" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'present':
      return 'default';
    case 'absent':
      return 'destructive';
    case 'late':
      return 'secondary';
    case 'half day':
      return 'outline';
    default:
      return 'outline';
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'present':
      return 'text-success';
    case 'absent':
      return 'text-destructive';
    case 'late':
      return 'text-warning';
    case 'half day':
      return 'text-blue-500';
    default:
      return 'text-muted-foreground';
  }
};

export function Attendance() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState('2024-01-29');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredAttendance = mockAttendance.filter(record => {
    const matchesStatus = statusFilter === 'all' || record.status.toLowerCase() === statusFilter;
    return matchesStatus;
  });

  const isEmployee = user?.role === 'employee';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEmployee ? 'My Attendance' : 'Attendance Management'}
          </h1>
          <p className="text-muted-foreground">
            {isEmployee 
              ? 'Track your work hours and attendance history'
              : 'Monitor employee attendance and working hours'
            }
          </p>
        </div>
        {isEmployee && (
          <div className="flex gap-2">
            <Button variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              Check In
            </Button>
            <Button variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              Check Out
            </Button>
          </div>
        )}
      </div>

      {/* Today's Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaySummary.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Company-wide</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{todaySummary.present}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((todaySummary.present / todaySummary.totalEmployees) * 100)}% attendance
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{todaySummary.absent}</div>
            <p className="text-xs text-muted-foreground">Requires follow-up</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late</CardTitle>
            <AlertCircle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{todaySummary.late}</div>
            <p className="text-xs text-muted-foreground">Late arrivals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Half Day</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{todaySummary.halfDay}</div>
            <p className="text-xs text-muted-foreground">Partial attendance</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-01-29">Today - Jan 29, 2024</SelectItem>
                  <SelectItem value="2024-01-28">Yesterday - Jan 28, 2024</SelectItem>
                  <SelectItem value="2024-01-27">Jan 27, 2024</SelectItem>
                  <SelectItem value="2024-01-26">Jan 26, 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="half day">Half Day</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isEmployee ? 'My Attendance Record' : 'Daily Attendance'} ({filteredAttendance.length})
          </CardTitle>
          <CardDescription>
            {isEmployee 
              ? 'Your daily attendance and work hours'
              : `Attendance record for ${new Date(selectedDate).toLocaleDateString()}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance.map((record) => (
                  <TableRow key={record.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                            {record.employeeName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{record.employeeName}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(record.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {record.checkIn}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {record.checkOut}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{record.totalHours}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(record.status)}
                        <Badge 
                          variant={getStatusVariant(record.status)}
                          className={getStatusColor(record.status)}
                        >
                          {record.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {record.notes || '-'}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredAttendance.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No attendance records found for the selected criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}