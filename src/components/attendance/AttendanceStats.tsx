import { Users, CheckCircle, XCircle, AlertTriangle, Clock, Monitor, Calendar, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CustomClock } from '@/components/ui/custom-clock';

interface AttendanceStatsProps {
  stats: {
    totalEmployees: number;
    present: number;
    absent: number;
    late: number;
    halfDay: number;
    remote: number;
    onLeave: number;
    attendanceRate: number;
    averageHours: number;
  };
  leaveRequests?: Array<{
    id: string;
    status: string;
    totalDays: number;
  }>;
  activeTab?: string;
}

export function AttendanceStats({ stats, leaveRequests = [], activeTab }: AttendanceStatsProps) {
  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      description: 'Company-wide',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Present',
      value: stats.present,
      description: `${stats.attendanceRate}% attendance rate`,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Absent',
      value: stats.absent,
      description: 'Requires follow-up',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Late',
      value: stats.late,
      description: 'Late arrivals',
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Half Day',
      value: stats.halfDay,
      description: 'Partial attendance',
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Remote',
      value: stats.remote,
      description: 'Working from home',
      icon: Monitor,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'On Leave',
      value: stats.onLeave,
      description: 'Approved leave',
      icon: Calendar,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
    {
      title: 'Average Hours',
      value: `${stats.averageHours}h`,
      description: 'Per employee today',
      icon: Clock,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
  ];

  // Leave request statistics
  const leaveStats = [
    {
      title: 'Pending Requests',
      value: leaveRequests.filter(r => r.status === 'pending').length,
      description: 'Awaiting approval',
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Approved This Month',
      value: leaveRequests.filter(r => r.status === 'hr_approved').length,
      description: 'Successfully approved',
      icon: Calendar,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Total Days Requested',
      value: leaveRequests.reduce((sum, r) => sum + r.totalDays, 0),
      description: 'All requests combined',
      icon: Calendar,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/10',
    },
    {
      title: 'Average Leave Days',
      value: Math.round(leaveRequests.reduce((sum, r) => sum + r.totalDays, 0) / Math.max(leaveRequests.length, 1)),
      description: 'Per employee',
      icon: User,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Attendance Statistics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Attendance Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={stat.isCustom ? '' : 'text-2xl font-bold'}>
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Leave Request Statistics - Only show for leave-request and leave-balance tabs */}
      {(activeTab === 'leave-request' || activeTab === 'leave-balance') && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Leave Request Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {leaveStats.map((stat, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
