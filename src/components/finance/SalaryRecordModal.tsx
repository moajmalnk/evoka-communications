import { useState, useEffect } from 'react';
import { DollarSign, User, Calendar, Calculator, FileText, Upload } from 'lucide-react';
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
import { useAuth } from '@/contexts/AuthContext';
import { SalaryRecord } from '@/types/finance';
import { mockEmployees } from '@/lib/taskService';

interface SalaryRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<SalaryRecord>) => void;
  salary?: SalaryRecord | null;
  mode: 'create' | 'edit';
}

const initialFormData: Partial<SalaryRecord> = {
  employeeId: '',
  employeeName: '',
  payPeriod: '',
  baseSalary: 0,
  overtime: 0,
  bonuses: 0,
  allowances: 0,
  deductions: 0,
  netSalary: 0,
  currency: 'USD',
  paymentDate: '',
  notes: '',
};

export function SalaryRecordModal({
  isOpen,
  onClose,
  onSubmit,
  salary,
  mode,
}: SalaryRecordModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<SalaryRecord>>(initialFormData);
  const [errors, setErrors] = useState<Partial<SalaryRecord>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when editing
  useEffect(() => {
    if (salary && mode === 'edit') {
      setFormData({
        employeeId: salary.employeeId,
        employeeName: salary.employeeName,
        payPeriod: salary.payPeriod,
        baseSalary: salary.baseSalary,
        overtime: salary.overtime,
        bonuses: salary.bonuses,
        allowances: salary.allowances,
        deductions: salary.deductions,
        netSalary: salary.netSalary,
        currency: salary.currency,
        paymentDate: salary.paymentDate,
        notes: salary.notes || '',
      });
    } else {
      setFormData(initialFormData);
    }
  }, [salary, mode]);

  const validateForm = (): boolean => {
    const newErrors: Partial<SalaryRecord> = {};

    if (!formData.employeeId) {
      newErrors.employeeId = 'Employee is required';
    }
    if (!formData.payPeriod) {
      newErrors.payPeriod = 'Pay period is required';
    }
    if (!formData.baseSalary || formData.baseSalary < 0) {
      newErrors.baseSalary = 'Base salary must be 0 or greater';
    }
    if (formData.overtime && formData.overtime < 0) {
      newErrors.overtime = 'Overtime cannot be negative';
    }
    if (formData.bonuses && formData.bonuses < 0) {
      newErrors.bonuses = 'Bonuses cannot be negative';
    }
    if (formData.allowances && formData.allowances < 0) {
      newErrors.allowances = 'Allowances cannot be negative';
    }
    if (formData.deductions && formData.deductions < 0) {
      newErrors.deductions = 'Deductions cannot be negative';
    }
    if (!formData.paymentDate) {
      newErrors.paymentDate = 'Payment date is required';
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
      console.error('Error saving salary record:', error);
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

  const calculateNetSalary = () => {
    const base = formData.baseSalary || 0;
    const overtime = formData.overtime || 0;
    const bonuses = formData.bonuses || 0;
    const allowances = formData.allowances || 0;
    const deductions = formData.deductions || 0;
    
    return base + overtime + bonuses + allowances - deductions;
  };

  const canManageSalaries = user?.role === 'admin' || user?.role === 'general_manager' || user?.role === 'hr';

  if (!canManageSalaries) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {mode === 'create' ? 'Create Salary Record' : 'Edit Salary Record'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Create a new salary record for an employee'
              : 'Update salary record information'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee and Pay Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee *</Label>
              <Select value={formData.employeeId} onValueChange={handleEmployeeChange}>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="payPeriod">Pay Period *</Label>
              <Input
                id="payPeriod"
                placeholder="e.g., January 2024"
                value={formData.payPeriod}
                onChange={(e) => setFormData(prev => ({ ...prev, payPeriod: e.target.value }))}
                className={errors.payPeriod ? 'border-destructive' : ''}
              />
              {errors.payPeriod && <p className="text-sm text-destructive">{errors.payPeriod}</p>}
            </div>
          </div>

          {/* Salary Components */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="baseSalary">Base Salary *</Label>
              <Input
                id="baseSalary"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.baseSalary}
                onChange={(e) => setFormData(prev => ({ ...prev, baseSalary: parseFloat(e.target.value) || 0 }))}
                className={errors.baseSalary ? 'border-destructive' : ''}
              />
              {errors.baseSalary && <p className="text-sm text-destructive">{errors.baseSalary}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="overtime">Overtime</Label>
              <Input
                id="overtime"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.overtime}
                onChange={(e) => setFormData(prev => ({ ...prev, overtime: parseFloat(e.target.value) || 0 }))}
                className={errors.overtime ? 'border-destructive' : ''}
              />
              {errors.overtime && <p className="text-sm text-destructive">{errors.overtime}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bonuses">Bonuses</Label>
              <Input
                id="bonuses"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.bonuses}
                onChange={(e) => setFormData(prev => ({ ...prev, bonuses: parseFloat(e.target.value) || 0 }))}
                className={errors.bonuses ? 'border-destructive' : ''}
              />
              {errors.bonuses && <p className="text-sm text-destructive">{errors.bonuses}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="allowances">Allowances</Label>
              <Input
                id="allowances"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.allowances}
                onChange={(e) => setFormData(prev => ({ ...prev, allowances: parseFloat(e.target.value) || 0 }))}
                className={errors.allowances ? 'border-destructive' : ''}
              />
              {errors.allowances && <p className="text-sm text-destructive">{errors.allowances}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deductions">Deductions</Label>
              <Input
                id="deductions"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.deductions}
                onChange={(e) => setFormData(prev => ({ ...prev, deductions: parseFloat(e.target.value) || 0 }))}
                className={errors.deductions ? 'border-destructive' : ''}
              />
              {errors.deductions && <p className="text-sm text-destructive">{errors.deductions}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date *</Label>
              <Input
                id="paymentDate"
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                className={errors.paymentDate ? 'border-destructive' : ''}
              />
              {errors.paymentDate && <p className="text-sm text-destructive">{errors.paymentDate}</p>}
            </div>
          </div>

          {/* Net Salary Calculation */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Net Salary Calculation:</span>
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-muted-foreground" />
                <span className="text-lg font-bold text-green-600">
                  ${calculateNetSalary().toFixed(2)}
                </span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Base Salary + Overtime + Bonuses + Allowances - Deductions
            </div>
          </div>

          {/* Currency */}
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

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about the salary record..."
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
              Upload payslips, contracts, or other supporting documents
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-gradient-primary shadow-primary">
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Record' : 'Update Record'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
