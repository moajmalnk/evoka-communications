import { DollarSign, TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CustomClock } from '@/components/ui/custom-clock';

interface FinanceStatsProps {
  stats: {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    pendingApprovals: number;
    gmApproved: number;
    adminApproved: number;
    rejected: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlyProfit: number;
    incomeGrowth: number;
    expenseGrowth: number;
    profitGrowth: number;
  };
}

type TrendType = 'up' | 'down' | 'neutral';

export function FinanceStats({ stats }: FinanceStatsProps) {
  const statCards = [
    {
      title: 'Total Income',
      value: `$${stats.totalIncome.toLocaleString()}`,
      description: `+${stats.incomeGrowth}% from last month`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: 'up' as const,
    },
    {
      title: 'Total Expenses',
      value: `$${stats.totalExpenses.toLocaleString()}`,
      description: `+${stats.expenseGrowth}% from last month`,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      trend: 'down' as const,
    },
    {
      title: 'Net Profit',
      value: `$${stats.netProfit.toLocaleString()}`,
      description: `+${stats.profitGrowth}% from last month`,
      icon: DollarSign,
      color: stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: stats.netProfit >= 0 ? 'bg-green-50' : 'bg-red-50',
      trend: stats.netProfit >= 0 ? 'up' : 'down',
    },
    {
      title: 'Monthly Income',
      value: `$${stats.monthlyIncome.toLocaleString()}`,
      description: 'Current month',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: 'up' as const,
    },
    {
      title: 'Monthly Expenses',
      value: `$${stats.monthlyExpenses.toLocaleString()}`,
      description: 'Current month',
      icon: TrendingDown,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: 'down' as const,
    },
    {
      title: 'Monthly Profit',
      value: `$${stats.monthlyProfit.toLocaleString()}`,
      description: 'Current month',
      icon: DollarSign,
      color: stats.monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: stats.monthlyProfit >= 0 ? 'bg-green-50' : 'bg-red-50',
      trend: stats.monthlyProfit >= 0 ? 'up' : 'down',
    },
    {
      title: 'Current Time',
      value: <CustomClock variant="compact" />,
      description: 'Live time display',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: 'neutral' as const,
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals,
      description: 'Awaiting GM approval',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      trend: 'neutral' as const,
    },
    {
      title: 'GM Approved',
      value: stats.gmApproved,
      description: 'Awaiting admin approval',
      icon: CheckCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: 'neutral' as const,
    },
    {
      title: 'Admin Approved',
      value: stats.adminApproved,
      description: 'Fully approved',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: 'neutral' as const,
    },
    {
      title: 'Rejected',
      value: stats.rejected,
      description: 'Rejected transactions',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      trend: 'neutral' as const,
    },
  ];

  const getTrendIcon = (trend: TrendType) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {typeof stat.value === 'string' || typeof stat.value === 'number' ? stat.value : stat.value}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(stat.trend)}
              <span>{stat.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
