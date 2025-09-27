import { useState } from 'react';
import { X, Bell, AlertTriangle, CheckCircle, XCircle, Clock, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

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

interface NotificationCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
}

export function NotificationCreateModal({ isOpen, onClose, onCreateNotification }: NotificationCreateModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'info' as const,
    title: '',
    message: '',
    priority: 'medium' as const,
    category: 'general' as const,
    senderName: '',
    senderRole: '',
    actionUrl: '',
    relatedId: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    if (formData.senderName && !formData.senderRole) {
      newErrors.senderRole = 'Sender role is required when sender name is provided';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const notificationData: Omit<Notification, 'id' | 'timestamp'> = {
        type: formData.type,
        title: formData.title.trim(),
        message: formData.message.trim(),
        isRead: false,
        priority: formData.priority,
        category: formData.category,
        ...(formData.senderName && formData.senderRole && {
          sender: {
            name: formData.senderName.trim(),
            role: formData.senderRole.trim()
          }
        }),
        ...(formData.actionUrl && { actionUrl: formData.actionUrl.trim() }),
        ...(formData.relatedId && { relatedId: formData.relatedId.trim() })
      };

      onCreateNotification(notificationData);
      
      // Reset form
      setFormData({
        type: 'info',
        title: '',
        message: '',
        priority: 'medium',
        category: 'general',
        senderName: '',
        senderRole: '',
        actionUrl: '',
        relatedId: ''
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create notification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      type: 'info',
      title: '',
      message: '',
      priority: 'medium',
      category: 'general',
      senderName: '',
      senderRole: '',
      actionUrl: '',
      relatedId: ''
    });
    setErrors({});
    onClose();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'reminder':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Create New Notification
          </DialogTitle>
          <DialogDescription>
            Create a new notification to send to users or system alerts.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Notification Type and Priority */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Notification Type</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-gray-500" />
                        Info
                      </div>
                    </SelectItem>
                    <SelectItem value="success">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Success
                      </div>
                    </SelectItem>
                    <SelectItem value="warning">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        Warning
                      </div>
                    </SelectItem>
                    <SelectItem value="error">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        Error
                      </div>
                    </SelectItem>
                    <SelectItem value="reminder">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        Reminder
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Title and Category */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter notification title"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Enter notification message"
                className={`min-h-[100px] ${errors.message ? 'border-red-500' : ''}`}
              />
              {errors.message && (
                <p className="text-sm text-red-500">{errors.message}</p>
              )}
            </div>

            {/* Sender Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Sender Information (Optional)</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="senderName">Sender Name</Label>
                  <Input
                    id="senderName"
                    value={formData.senderName}
                    onChange={(e) => handleInputChange('senderName', e.target.value)}
                    placeholder="Enter sender name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="senderRole">Sender Role</Label>
                  <Input
                    id="senderRole"
                    value={formData.senderRole}
                    onChange={(e) => handleInputChange('senderRole', e.target.value)}
                    placeholder="Enter sender role"
                    className={errors.senderRole ? 'border-red-500' : ''}
                  />
                  {errors.senderRole && (
                    <p className="text-sm text-red-500">{errors.senderRole}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Additional Information (Optional)</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="actionUrl">Action URL</Label>
                  <Input
                    id="actionUrl"
                    value={formData.actionUrl}
                    onChange={(e) => handleInputChange('actionUrl', e.target.value)}
                    placeholder="Enter action URL"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="relatedId">Related ID</Label>
                  <Input
                    id="relatedId"
                    value={formData.relatedId}
                    onChange={(e) => handleInputChange('relatedId', e.target.value)}
                    placeholder="Enter related ID"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-gradient-primary shadow-primary">
              <Bell className="mr-2 h-4 w-4" />
              {isLoading ? 'Creating...' : 'Create Notification'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
