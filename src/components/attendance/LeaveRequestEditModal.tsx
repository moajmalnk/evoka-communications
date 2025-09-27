import { useState, useEffect } from 'react';
import { Calendar, FileText, Upload, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { LeaveRequest, LeaveFormData, LeaveCategory, LeaveStatus } from '@/types/attendance';
import { mockLeaveCategories } from '@/lib/attendanceService';
import { mockEmployees } from '@/lib/taskService';
import { CustomCalendar } from '@/components/ui/custom-calendar';

interface LeaveRequestEditModalProps {
  leaveRequest: LeaveRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<LeaveFormData>) => void;
}

const initialFormData: LeaveFormData = {
  employeeId: '',
  leaveType: '',
  startDate: '',
  endDate: '',
  reason: '',
  attachments: [],
};

export function LeaveRequestEditModal({
  leaveRequest,
  isOpen,
  onClose,
  onSubmit,
}: LeaveRequestEditModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<LeaveFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<LeaveFormData>>({});
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when leaveRequest changes
  useEffect(() => {
    if (leaveRequest) {
      setFormData({
        employeeId: leaveRequest.employeeId,
        leaveType: leaveRequest.leaveType,
        startDate: leaveRequest.startDate,
        endDate: leaveRequest.endDate,
        reason: leaveRequest.reason,
        attachments: leaveRequest.attachments || [],
      });
      setErrors({});
    } else {
      setFormData(initialFormData);
      setErrors({});
    }
  }, [leaveRequest]);

  const validateForm = (): boolean => {
    const newErrors: Partial<LeaveFormData> = {};

    if (!formData.employeeId) {
      newErrors.employeeId = 'Employee is required';
    }
    if (!formData.leaveType) {
      newErrors.leaveType = 'Leave type is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (startDate > endDate) {
        newErrors.endDate = 'End date cannot be before start date';
      }
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStartDateChange = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    setFormData(prev => ({ ...prev, startDate: `${year}-${month}-${day}` }));
    setIsStartDateOpen(false);
  };

  const handleEndDateChange = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    setFormData(prev => ({ ...prev, endDate: `${year}-${month}-${day}` }));
    setIsEndDateOpen(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileNames = Array.from(files).map(file => file.name);
      setFormData(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), ...fileNames],
      }));
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error updating leave request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: LeaveStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
      case 'coordinator_approved':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Coordinator Approved</Badge>;
      case 'hr_approved':
        return <Badge variant="outline" className="text-green-600 border-green-600">HR Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600">Rejected</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="text-gray-600 border-gray-600">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const canEdit = leaveRequest?.status === 'pending' || leaveRequest?.status === 'coordinator_approved';

  if (!leaveRequest) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Edit Leave Request
          </DialogTitle>
          <DialogDescription>
            Update your leave request details. Only pending and coordinator-approved requests can be edited.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Status */}
          <div className="space-y-2">
            <Label>Current Status</Label>
            <div className="flex items-center gap-2">
              {getStatusBadge(leaveRequest.status)}
              {!canEdit && (
                <span className="text-sm text-muted-foreground">
                  (Cannot edit - {leaveRequest.status === 'hr_approved' ? 'Already approved by HR' : 
                   leaveRequest.status === 'rejected' ? 'Request was rejected' : 
                   leaveRequest.status === 'cancelled' ? 'Request was cancelled' : 'Unknown status'})
                </span>
              )}
            </div>
          </div>

          {/* Employee Selection */}
          <div className="space-y-2">
            <Label htmlFor="employeeId">Employee *</Label>
            <Select 
              value={formData.employeeId} 
              onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
              disabled={!canEdit}
            >
              <SelectTrigger className={errors.employeeId ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {mockEmployees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>{employee.name}</span>
                      <span className="text-sm text-muted-foreground">({employee.department})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.employeeId && <p className="text-sm text-destructive">{errors.employeeId}</p>}
          </div>

          {/* Leave Type */}
          <div className="space-y-2">
            <Label htmlFor="leaveType">Leave Type *</Label>
            <Select
              value={formData.leaveType}
              onValueChange={(value) => setFormData({ ...formData, leaveType: value })}
              disabled={!canEdit}
            >
              <SelectTrigger className={errors.leaveType ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {mockLeaveCategories.map((category: LeaveCategory) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.leaveType && <p className="text-sm text-destructive">{errors.leaveType}</p>}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal h-10 ${
                      errors.startDate ? 'border-destructive' : ''
                    }`}
                    disabled={!canEdit}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formData.startDate ? (
                      new Date(formData.startDate).toLocaleDateString()
                    ) : (
                      'Select start date'
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CustomCalendar
                    mode="single"
                    selected={formData.startDate ? new Date(formData.startDate) : undefined}
                    onSelect={handleStartDateChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.startDate && <p className="text-sm text-destructive">{errors.startDate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal h-10 ${
                      errors.endDate ? 'border-destructive' : ''
                    }`}
                    disabled={!canEdit}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formData.endDate ? (
                      new Date(formData.endDate).toLocaleDateString()
                    ) : (
                      'Select end date'
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CustomCalendar
                    mode="single"
                    selected={formData.endDate ? new Date(formData.endDate) : undefined}
                    onSelect={handleEndDateChange}
                    disabled={(date) => 
                      date < new Date() || 
                      (formData.startDate && date < new Date(formData.startDate))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.endDate && <p className="text-sm text-destructive">{errors.endDate}</p>}
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              placeholder="Please provide a reason for your leave request..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className={errors.reason ? 'border-destructive' : ''}
              disabled={!canEdit}
              rows={3}
            />
            {errors.reason && <p className="text-sm text-destructive">{errors.reason}</p>}
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label htmlFor="attachments">Attachments</Label>
            <div className="space-y-2">
              <Input
                id="attachments"
                type="file"
                multiple
                onChange={handleFileUpload}
                disabled={!canEdit}
                className="cursor-pointer"
              />
              {formData.attachments && formData.attachments.length > 0 && (
                <div className="space-y-1">
                  {formData.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">{attachment}</span>
                      </div>
                      {canEdit && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Approval Information */}
          {leaveRequest.coordinatorApproval && (
            <div className="space-y-2 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">Coordinator Approval</h4>
              <div className="text-sm text-blue-800">
                <p><strong>Status:</strong> {leaveRequest.coordinatorApproval.approved ? 'Approved' : 'Rejected'}</p>
                <p><strong>Approved by:</strong> {leaveRequest.coordinatorApproval.approvedBy}</p>
                <p><strong>Date:</strong> {new Date(leaveRequest.coordinatorApproval.approvedAt).toLocaleDateString()}</p>
                {leaveRequest.coordinatorApproval.comments && (
                  <p><strong>Comments:</strong> {leaveRequest.coordinatorApproval.comments}</p>
                )}
              </div>
            </div>
          )}

          {leaveRequest.hrApproval && (
            <div className="space-y-2 p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900">HR Approval</h4>
              <div className="text-sm text-green-800">
                <p><strong>Status:</strong> {leaveRequest.hrApproval.approved ? 'Approved' : 'Rejected'}</p>
                <p><strong>Approved by:</strong> {leaveRequest.hrApproval.approvedBy}</p>
                <p><strong>Date:</strong> {new Date(leaveRequest.hrApproval.approvedAt).toLocaleDateString()}</p>
                {leaveRequest.hrApproval.comments && (
                  <p><strong>Comments:</strong> {leaveRequest.hrApproval.comments}</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {canEdit && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Request'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
