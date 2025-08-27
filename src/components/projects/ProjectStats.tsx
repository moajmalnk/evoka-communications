import { Calendar, Users, Target, TrendingUp, Clock, CheckCircle, AlertCircle, PlayCircle, PauseCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProjectStatsProps {
  stats: {
    total: number;
    planning: number;
    inProgress: number;
    onHold: number;
    completed: number;
    completionRate: number;
  };
}

export function ProjectStats({ stats }: ProjectStatsProps) {
  const statCards = [
    {
      title: 'Total Projects',
      value: stats.total,
      description: 'All active projects',
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      description: 'Currently active',
      icon: PlayCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Planning',
      value: stats.planning,
      description: 'In planning phase',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'On Hold',
      value: stats.onHold,
      description: 'Temporarily paused',
      icon: PauseCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Completed',
      value: stats.completed,
      description: 'Successfully delivered',
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Completion Rate',
      value: `${stats.completionRate}%`,
      description: 'Success rate',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
