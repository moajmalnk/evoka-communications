import { useState, useEffect } from 'react';
import { Clock, Calendar, MapPin, FileText, User, Building2 } from 'lucide-react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { AttendanceFormData, AttendanceRecord } from '@/types/attendance';
import { mockEmployees } from '@/lib/taskService';
import { CustomCalendar } from '@/components/ui/custom-calendar';
import { CustomTimePicker } from '@/components/ui/custom-time-picker';

interface AttendanceEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AttendanceFormData) => void;
  record?: AttendanceRecord | null;
  mode: 'create' | 'edit';
}

const initialFormData: AttendanceFormData = {
  employeeId: '',
  date: new Date().toISOString().split('T')[0],
  checkIn: '',
  checkOut: '',
  notes: '',
  location: 'Office',
};

export function AttendanceEntryModal({
  isOpen,
  onClose,
  onSubmit,
  record,
  mode,
}: AttendanceEntryModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<AttendanceFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<AttendanceFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  // Initialize form data when editing
  useEffect(() => {
    if (record && mode === 'edit') {
      setFormData({
        employeeId: record.employeeId,
        date: record.date,
        checkIn: record.checkIn,
        checkOut: record.checkOut,
        notes: record.notes || '',
        location: record.location || 'Office',
      });
    } else {
      setFormData({
        ...initialFormData,
        employeeId: user?.role === 'employee' ? user.id : '',
      });
    }
  }, [record, mode, user]);

  const validateForm = (): boolean => {
    const newErrors: Partial<AttendanceFormData> = {};

    if (!formData.employeeId) {
      newErrors.employeeId = 'Employee is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    if (!formData.checkIn && !formData.checkOut) {
      newErrors.checkIn = 'At least check-in or check-out time is required';
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
      console.error('Error saving attendance:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  };

  const canEditEmployee = user?.role === 'admin' || user?.role === 'general_manager' || user?.role === 'hr';

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDateChange = (date: Date) => {
    setFormData(prev => ({ ...prev, date: date.toISOString().split('T')[0] }));
    setDateOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {mode === 'create' ? 'Add Attendance Record' : 'Edit Attendance Record'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Record employee check-in/check-out times and attendance details'
              : 'Update attendance record information'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Selection */}
          <div className="space-y-2">
            <Label htmlFor="employeeId">Employee *</Label>
            <Select 
              value={formData.employeeId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, employeeId: value }))}
              disabled={!canEditEmployee}
            >
              <SelectTrigger className={errors.employeeId ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {mockEmployees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {employee.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.employeeId && <p className="text-sm text-destructive">{errors.employeeId}</p>}
            {!canEditEmployee && (
              <p className="text-sm text-muted-foreground">
                You can only edit your own attendance records
              </p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${errors.date ? 'border-destructive' : ''}`}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {formData.date ? formatDateForDisplay(formData.date) : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CustomCalendar
                  date={formData.date ? new Date(formData.date) : new Date()}
                  onDateChange={handleDateChange}
                  variant="inline"
                />
              </PopoverContent>
            </Popover>
            {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
          </div>

          {/* Time Entry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkIn">Check In Time</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <CustomTimePicker
                    value={formData.checkIn}
                    onChange={(time) => setFormData(prev => ({ ...prev, checkIn: time }))}
                    placeholder="Select check-in time"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkOut">Check Out Time</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <CustomTimePicker
                    value={formData.checkOut}
                    onChange={(time) => setFormData(prev => ({ ...prev, checkOut: time }))}
                    placeholder="Select check-out time"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Select 
              value={formData.location} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Office">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Office
                  </div>
                </SelectItem>
                <SelectItem value="Remote">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Remote
                  </div>
                </SelectItem>
                <SelectItem value="Client Site">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Client Site
                  </div>
                </SelectItem>
                <SelectItem value="Travel">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Travel
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes or comments..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-gradient-primary shadow-primary">
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Add Record' : 'Update Record'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
