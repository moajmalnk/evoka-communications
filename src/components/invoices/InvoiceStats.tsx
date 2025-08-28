import { DollarSign, FileText, Clock, CheckCircle, AlertTriangle, TrendingUp, XCircle, CreditCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CustomClock } from '@/components/ui/custom-clock';

interface InvoiceStatsProps {
  stats: {
    total: number;
    draft: number;
    pending: number;
    paid: number;
    partiallyPaid: number;
    overdue: number;
    cancelled: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    collectionRate: number;
  };
}

export function InvoiceStats({ stats }: InvoiceStatsProps) {
  const statCards = [
    {
      title: 'Current Time',
      value: <CustomClock variant="compact" showIcon={false} />,
      description: 'Live time display',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      isCustom: true,
    },
    {
      title: 'Total Invoices',
      value: stats.total,
      description: 'All invoices',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalAmount.toLocaleString()}`,
      description: 'Total invoiced amount',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Pending Payments',
      value: `$${stats.pendingAmount.toLocaleString()}`,
      description: 'Awaiting payment',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Paid Amount',
      value: `$${stats.paidAmount.toLocaleString()}`,
      description: 'Successfully collected',
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Collection Rate',
      value: `${stats.collectionRate}%`,
      description: 'Payment success rate',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Overdue',
      value: stats.overdue,
      description: 'Past due invoices',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
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
            <div className={stat.isCustom ? '' : 'text-2xl font-bold'}>
              {stat.value}
            </div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
