import { useState, useEffect } from 'react';
import { Calendar, FileText, Upload, AlertCircle } from 'lucide-react';
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
import { LeaveFormData, LeaveCategory } from '@/types/attendance';
import { mockLeaveCategories } from '@/lib/attendanceService';
import { CustomCalendar } from '@/components/ui/custom-calendar';

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LeaveFormData) => void;
}

const initialFormData: LeaveFormData = {
  leaveType: '',
  startDate: '',
  endDate: '',
  reason: '',
  attachments: [],
};

export function LeaveRequestModal({
  isOpen,
  onClose,
  onSubmit,
}: LeaveRequestModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<LeaveFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<LeaveFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<LeaveCategory | null>(null);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<LeaveFormData> = {};

    if (!formData.leaveType) {
      newErrors.leaveType = 'Leave type is required';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Error submitting leave request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setErrors({});
    setIsSubmitting(false);
    setSelectedCategory(null);
    onClose();
  };

  const calculateTotalDays = () => {
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return totalDays;
    }
    return 0;
  };

  const handleLeaveTypeChange = (leaveType: string) => {
    setFormData(prev => ({ ...prev, leaveType }));
    const category = mockLeaveCategories.find(cat => cat.id === leaveType);
    setSelectedCategory(category || null);
  };

  const totalDays = calculateTotalDays();

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleStartDateChange = (date: Date) => {
    setFormData(prev => ({ ...prev, startDate: date.toISOString().split('T')[0] }));
    setStartDateOpen(false);
  };

  const handleEndDateChange = (date: Date) => {
    setFormData(prev => ({ ...prev, endDate: date.toISOString().split('T')[0] }));
    setEndDateOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Submit Leave Request
          </DialogTitle>
          <DialogDescription>
            Submit a leave request for approval. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Leave Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="leaveType">Leave Type *</Label>
            <Select value={formData.leaveType} onValueChange={handleLeaveTypeChange}>
              <SelectTrigger className={errors.leaveType ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {mockLeaveCategories.filter(cat => cat.isActive).map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.name}</span>
                      <Badge variant="outline" className="text-xs">
                        Max {category.maxDays} days
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.leaveType && <p className="text-sm text-destructive">{errors.leaveType}</p>}
            {selectedCategory && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">{selectedCategory.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    Max {selectedCategory.maxDays} days
                  </Badge>
                  {selectedCategory.requiresApproval && (
                    <Badge variant="secondary" className="text-xs">
                      Requires Approval
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${errors.startDate ? 'border-destructive' : ''}`}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formData.startDate ? formatDateForDisplay(formData.startDate) : 'Pick a start date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CustomCalendar
                    date={formData.startDate ? new Date(formData.startDate) : new Date()}
                    onDateChange={handleStartDateChange}
                    variant="inline"
                  />
                </PopoverContent>
              </Popover>
              {errors.startDate && <p className="text-sm text-destructive">{errors.startDate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${errors.endDate ? 'border-destructive' : ''}`}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formData.startDate ? formatDateForDisplay(formData.endDate) : 'Pick an end date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CustomCalendar
                    date={formData.endDate ? new Date(formData.endDate) : new Date()}
                    onDateChange={handleEndDateChange}
                    variant="inline"
                  />
                </PopoverContent>
              </Popover>
              {errors.endDate && <p className="text-sm text-destructive">{errors.endDate}</p>}
            </div>
          </div>

          {/* Total Days Display */}
          {totalDays > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Leave Days:</span>
                <Badge variant="default">{totalDays} day{totalDays !== 1 ? 's' : ''}</Badge>
              </div>
              {selectedCategory && totalDays > selectedCategory.maxDays && (
                <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>Exceeds maximum allowed days ({selectedCategory.maxDays})</span>
                </div>
              )}
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Leave *</Label>
            <Textarea
              id="reason"
              placeholder="Please provide a detailed reason for your leave request..."
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              className={errors.reason ? 'border-destructive' : ''}
              rows={4}
            />
            {errors.reason && <p className="text-sm text-destructive">{errors.reason}</p>}
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label htmlFor="attachments">Attachments (Optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="attachments"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="cursor-pointer"
              />
              <Button type="button" variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Upload supporting documents like medical certificates, travel itineraries, etc.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-gradient-primary shadow-primary">
              {isSubmitting ? 'Submitting...' : 'Submit Leave Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
