import { useState } from 'react';
import { Bell, Mail, MessageSquare, Calendar, AlertTriangle, CheckCircle, XCircle, Clock, Settings, Filter, Search, MoreHorizontal, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { NotificationCreateModal } from '@/components/notifications/NotificationCreateModal';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'reminder';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'system' | 'project' | 'task' | 'meeting' | 'payment' | 'general';
  sender?: {
    name: string;
    avatar?: string;
    role: string;
  };
  actionUrl?: string;
  relatedId?: string;
}

export function Notifications() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Mock notifications data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'notif-001',
      type: 'success',
      title: 'Project Completed Successfully',
      message: 'The website redesign project has been completed and delivered to the client.',
      timestamp: '2024-03-15T10:30:00Z',
      isRead: false,
      priority: 'high',
      category: 'project',
      sender: {
        name: 'Sarah Johnson',
        role: 'Project Manager'
      },
      actionUrl: '/projects/proj-001'
    },
    {
      id: 'notif-002',
      type: 'warning',
      title: 'Task Deadline Approaching',
      message: 'The task "Update user documentation" is due in 2 days.',
      timestamp: '2024-03-15T09:15:00Z',
      isRead: false,
      priority: 'medium',
      category: 'task',
      relatedId: 'task-123'
    },
    {
      id: 'notif-003',
      type: 'info',
      title: 'New Team Member Added',
      message: 'John Smith has been added to the Development team.',
      timestamp: '2024-03-15T08:45:00Z',
      isRead: true,
      priority: 'low',
      category: 'system',
      sender: {
        name: 'HR Department',
        role: 'Human Resources'
      }
    },
    {
      id: 'notif-004',
      type: 'reminder',
      title: 'Meeting Reminder',
      message: 'Weekly team standup meeting starts in 30 minutes.',
      timestamp: '2024-03-15T08:00:00Z',
      isRead: false,
      priority: 'high',
      category: 'meeting',
      actionUrl: '/meetings/weekly-standup'
    },
    {
      id: 'notif-005',
      type: 'error',
      title: 'Payment Processing Failed',
      message: 'Failed to process payment for invoice INV-2024-001. Please check payment details.',
      timestamp: '2024-03-14T16:20:00Z',
      isRead: true,
      priority: 'high',
      category: 'payment',
      actionUrl: '/invoices/INV-2024-001'
    },
    {
      id: 'notif-006',
      type: 'success',
      title: 'Leave Request Approved',
      message: 'Your vacation request for March 20-25 has been approved.',
      timestamp: '2024-03-14T14:30:00Z',
      isRead: true,
      priority: 'medium',
      category: 'general',
      sender: {
        name: 'Manager',
        role: 'HR Manager'
      }
    },
    {
      id: 'notif-007',
      type: 'info',
      title: 'System Maintenance Scheduled',
      message: 'Scheduled maintenance will occur on Sunday from 2:00 AM to 4:00 AM.',
      timestamp: '2024-03-14T12:00:00Z',
      isRead: false,
      priority: 'medium',
      category: 'system'
    },
    {
      id: 'notif-008',
      type: 'reminder',
      title: 'Performance Review Due',
      message: 'Your quarterly performance review is due next week.',
      timestamp: '2024-03-14T10:30:00Z',
      isRead: true,
      priority: 'high',
      category: 'general',
      sender: {
        name: 'HR Department',
        role: 'Human Resources'
      }
    }
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'reminder':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'error':
        return 'border-l-red-500 bg-red-50';
      case 'reminder':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesCategory = filterCategory === 'all' || notification.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || notification.priority === filterPriority;
    
    return matchesSearch && matchesType && matchesCategory && matchesPriority;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    toast({
      title: "All Notifications Marked as Read",
      description: "All notifications have been marked as read.",
    });
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    toast({
      title: "Notification Deleted",
      description: "The notification has been deleted.",
    });
  };

  const clearAllRead = () => {
    setNotifications(prev => prev.filter(n => !n.isRead));
    toast({
      title: "Read Notifications Cleared",
      description: "All read notifications have been cleared.",
    });
  };

  const createNotification = (newNotification: Omit<Notification, 'id' | 'timestamp'>) => {
    const notification: Notification = {
      ...newNotification,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    
    setNotifications(prev => [notification, ...prev]);
    toast({
      title: "Notification Created",
      description: "A new notification has been created successfully.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with your latest notifications and alerts
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* <Badge variant="outline" className="gap-2">
            <Bell className="h-4 w-4" />
            {unreadCount} unread
          </Badge> */}
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-primary shadow-primary"
          >
            <Bell className="mr-2 h-4 w-4" />
            Create Notification
          </Button>
          <Button
            variant="outline"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <Check className="mr-2 h-4 w-4" />
            Mark All Read
          </Button>
          {/* <Button
            variant="outline"
            onClick={clearAllRead}
            disabled={notifications.filter(n => n.isRead).length === 0}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Read
          </Button> */}
        </div>
      </div>

      {/* Filters */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="task">Task</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card> */}

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notifications found</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm || filterType !== 'all' || filterCategory !== 'all' || filterPriority !== 'all'
                  ? 'Try adjusting your filters to see more notifications.'
                  : 'You\'re all caught up! No new notifications at the moment.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all duration-200 hover:shadow-md ${
                !notification.isRead ? 'ring-2 ring-blue-200' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {notification.sender ? (
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                          {notification.sender.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        {getTypeIcon(notification.type)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <div className="h-2 w-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatTimestamp(notification.timestamp)}</span>
                          <span>•</span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getPriorityColor(notification.priority)}`}
                          >
                            {notification.priority}
                          </Badge>
                          <span>•</span>
                          <span className="capitalize">{notification.category}</span>
                          {notification.sender && (
                            <>
                              <span>•</span>
                              <span>by {notification.sender.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Mark as read
                          </Button>
                        )} */}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {!notification.isRead && (
                              <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark as read
                              </DropdownMenuItem>
                            )}
                            {notification.actionUrl && (
                              <DropdownMenuItem>
                                <Bell className="mr-2 h-4 w-4" />
                                View details
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => deleteNotification(notification.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Notification Modal */}
      <NotificationCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateNotification={createNotification}
      />
    </div>
  );
}
