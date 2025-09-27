import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FolderKanban,
  CheckSquare,
  Users,
  TrendingUp,
  Clock,
  IndianRupee,
  Plus,
  ArrowUpRight,
} from 'lucide-react';

// Mock data for dashboard stats
const getDashboardStats = (role: string) => {
  const baseStats = [
    { title: 'Active Projects', value: '12', icon: FolderKanban, trend: '+2.5%' },
    { title: 'Pending Tasks', value: '24', icon: CheckSquare, trend: '+12%' },
    { title: 'Team Members', value: '8', icon: Users, trend: '+1' },
    { title: 'Revenue', value: '₹45,231', icon: IndianRupee, trend: '+23%' },
  ];

  switch (role) {
    case 'employee':
      return [
        { title: 'My Tasks', value: '8', icon: CheckSquare, trend: '+2' },
        { title: 'Completed', value: '15', icon: TrendingUp, trend: '+5' },
        { title: 'Hours Logged', value: '42', icon: Clock, trend: '+8h' },
        { title: 'Projects', value: '3', icon: FolderKanban, trend: '0' },
      ];
    case 'hr':
      return [
        { title: 'Total Employees', value: '45', icon: Users, trend: '+3' },
        { title: 'Present Today', value: '42', icon: Clock, trend: '93%' },
        { title: 'Leave Requests', value: '7', icon: CheckSquare, trend: '+2' },
        { title: 'Payroll', value: '₹125,000', icon: IndianRupee, trend: '+5%' },
      ];
    default:
      return baseStats;
  }
};

const getRecentActivities = (role: string) => {
  const baseActivities = [
    { title: 'New project "Website Redesign" created', time: '2 minutes ago', type: 'project' },
    { title: 'Task "Design Homepage" completed', time: '1 hour ago', type: 'task' },
    { title: 'Invoice #INV-2024-001 paid', time: '3 hours ago', type: 'invoice' },
    { title: 'New team member John Doe added', time: '1 day ago', type: 'user' },
  ];

  switch (role) {
    case 'employee':
      return [
        { title: 'Task "Create wireframes" assigned to you', time: '30 minutes ago', type: 'task' },
        { title: 'Work submission approved', time: '2 hours ago', type: 'approval' },
        { title: 'New comment on "Mobile App Design"', time: '4 hours ago', type: 'comment' },
        { title: 'Attendance marked for today', time: '8 hours ago', type: 'attendance' },
      ];
    default:
      return baseActivities;
  }
};

const getQuickActions = (role: string) => {
  const baseActions = [
    { title: 'Create Project', icon: FolderKanban, url: '/projects/new' },
    { title: 'Add Task', icon: CheckSquare, url: '/tasks/new' },
    { title: 'Generate Invoice', icon: IndianRupee, url: '/invoicing/new' },
    { title: 'Add Employee', icon: Users, url: '/employees/new' },
  ];

  switch (role) {
    case 'employee':
      return [
        { title: 'Submit Work', icon: CheckSquare, url: '/work-submissions/new' },
        { title: 'View My Tasks', icon: FolderKanban, url: '/tasks' },
        { title: 'Check Attendance', icon: Clock, url: '/attendance' },
      ];
    default:
      return baseActions.slice(0, 3);
  }
};

export function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  const stats = getDashboardStats(user.role);
  const activities = getRecentActivities(user.role);
  const quickActions = getQuickActions(user.role);

  const getRoleDisplayName = (role: string) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user.firstName}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening in your {getRoleDisplayName(user.role)} dashboard today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3 text-success" />
                {stat.trend} from last month
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Your latest updates and notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {activity.type}
                </Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4">
              View All Activities
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for your role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start"
              >
                <action.icon className="mr-2 h-4 w-4" />
                {action.title}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}