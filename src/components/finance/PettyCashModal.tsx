import { useState, useEffect } from 'react';
import { IndianRupee, User, Calendar, Receipt, FileText, Upload } from 'lucide-react';
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
import { PettyCash } from '@/types/finance';
import { mockEmployees } from '@/lib/taskService';
import { CustomCalendar } from '@/components/ui/custom-calendar';
import { cn } from '@/lib/utils';

interface PettyCashModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<PettyCash>) => void;
  pettyCash?: PettyCash | null;
  mode: 'create' | 'edit';
}

const initialFormData: Partial<PettyCash> = {
  employeeId: '',
  employeeName: '',
  category: '',
  description: '',
  amount: 0,
  currency: 'USD',
  date: new Date().toISOString().split('T')[0],
  receiptNumber: '',
  notes: '',
};

export function PettyCashModal({
  isOpen,
  onClose,
  onSubmit,
  pettyCash,
  mode,
}: PettyCashModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<PettyCash>>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  // Initialize form data when editing
  useEffect(() => {
    if (pettyCash && mode === 'edit') {
      setFormData({
        employeeId: pettyCash.employeeId,
        employeeName: pettyCash.employeeName,
        category: pettyCash.category,
        description: pettyCash.description,
        amount: pettyCash.amount,
        currency: pettyCash.currency,
        date: pettyCash.date,
        receiptNumber: pettyCash.receiptNumber || '',
        notes: pettyCash.notes || '',
      });
    } else {
      setFormData({
        ...initialFormData,
        employeeId: user?.role === 'employee' ? user.id : '',
      });
    }
  }, [pettyCash, mode, user]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeId) {
      newErrors.employeeId = 'Employee is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.description) {
      newErrors.description = 'Description is required';
    }
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
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
      console.error('Error saving petty cash record:', error);
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

  const handleEmployeeChange = (employeeId: string) => {
    const employee = mockEmployees.find(e => e.id === employeeId);
    if (employee) {
      setFormData(prev => ({
        ...prev,
        employeeId,
        employeeName: employee.name,
      }));
    }
  };

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

  const pettyCashCategories = [
    'Office Supplies',
    'Meals',
    'Transport',
    'Printing',
    'Postage',
    'Maintenance',
    'Entertainment',
    'Miscellaneous',
  ];

  const canManagePettyCash = user?.role === 'admin' || user?.role === 'general_manager' || user?.role === 'hr';
  const canEditEmployee = user?.role === 'admin' || user?.role === 'general_manager' || user?.role === 'hr';
  const isEmployee = user?.role === 'employee';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5" />
            {mode === 'create' ? 'Record Petty Cash Expense' : 'Edit Petty Cash Record'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Record a new petty cash expense'
              : 'Update petty cash record information'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Selection */}
          <div className="space-y-2">
            <Label htmlFor="employeeId">Employee *</Label>
            <Select 
              value={formData.employeeId} 
              onValueChange={handleEmployeeChange}
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
                You can only record expenses for yourself
              </p>
            )}
          </div>

          {/* Category and Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {pettyCashCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                className={errors.amount ? 'border-destructive' : ''}
              />
              {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
            </div>
          </div>

          {/* Description and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                placeholder="Brief description of the expense"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={errors.description ? 'border-destructive' : ''}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Expense Date *</Label>
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground",
                      errors.date && "border-destructive"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formData.date ? formatDateForDisplay(formData.date) : "Select expense date"}
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
          </div>

          {/* Receipt Number and Currency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="receiptNumber">Receipt Number (Optional)</Label>
              <Input
                id="receiptNumber"
                placeholder="e.g., RCP-001"
                value={formData.receiptNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, receiptNumber: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select 
                value={formData.currency} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                  <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional details about the expense..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
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
              Upload receipts, invoices, or other supporting documents
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-gradient-primary shadow-primary">
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Record Expense' : 'Update Record'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
