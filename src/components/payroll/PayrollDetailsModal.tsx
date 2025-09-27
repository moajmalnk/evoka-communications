import { useState } from 'react';
import { X, Download, Calendar, Building2, FileText, IndianRupee, Edit, Trash2, AlertTriangle, CheckCircle, CreditCard, User, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { CustomCalendar } from '@/components/ui/custom-calendar';

interface PayrollRecord {
  id: string;
  employeeName: string;
  employeeId: string;
  payPeriod: string;
  baseSalary: number;
  overtime: number;
  bonuses: number;
  deductions: number;
  netSalary: number;
  paymentDate: string;
  status: string;
}

interface PayrollDetailsModalProps {
  payrollRecord: PayrollRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (payrollRecord: PayrollRecord) => void;
  onDelete?: (payrollRecordId: string) => void;
  onProcessPayment?: (payrollRecordId: string) => void;
}

const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'processing':
      return 'outline';
    case 'failed':
      return 'destructive';
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'text-green-600';
    case 'pending':
      return 'text-yellow-600';
    case 'processing':
      return 'text-blue-600';
    case 'failed':
      return 'text-red-600';
    case 'cancelled':
      return 'text-red-600';
    default:
      return 'text-muted-foreground';
  }
};

const getStatusLabel = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'Paid';
    case 'pending':
      return 'Pending';
    case 'processing':
      return 'Processing';
    case 'failed':
      return 'Failed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

export function PayrollDetailsModal({
  payrollRecord,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onProcessPayment,
}: PayrollDetailsModalProps) {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!payrollRecord) return null;

  const canEdit = user?.role === 'admin' || user?.role === 'hr';
  const canDelete = user?.role === 'admin' || user?.role === 'hr';
  const canProcessPayment = user?.role === 'admin' || user?.role === 'hr';

  const totalEarnings = payrollRecord.baseSalary + payrollRecord.overtime + payrollRecord.bonuses;
  const deductionPercentage = (payrollRecord.deductions / totalEarnings) * 100;
  const isOverdue = new Date(payrollRecord.paymentDate) < new Date() && payrollRecord.status !== 'paid' && payrollRecord.status !== 'cancelled';

  const handleDelete = async () => {
    if (!canDelete || !onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(payrollRecord.id);
      onClose();
    } catch (error) {
      console.error('Error deleting payroll record:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleProcessPayment = () => {
    if (!canProcessPayment || !onProcessPayment) return;
    onProcessPayment(payrollRecord.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Payroll Record {payrollRecord.id}
          </DialogTitle>
          <DialogDescription>
            {payrollRecord.payPeriod} • Employee: {payrollRecord.employeeName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payroll Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Building2 className="h-3 w-3" />
                  {payrollRecord.employeeId}
                </Badge>
                <Badge 
                  variant={getStatusVariant(payrollRecord.status)}
                  className={getStatusColor(payrollRecord.status)}
                >
                  {getStatusLabel(payrollRecord.status)}
                </Badge>
                {isOverdue && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Overdue
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Net Salary: ₹{payrollRecord.netSalary.toLocaleString()}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button> */}
              {canEdit && onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(payrollRecord)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {canDelete && onDelete && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Payroll Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Employee Information */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Employee Information
                </h3>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{payrollRecord.employeeName}</p>
                  <p className="text-sm text-muted-foreground">Employee ID: {payrollRecord.employeeId}</p>
                </div>
              </div>

              {/* Pay Period Information */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Pay Period Information
                </h3>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{payrollRecord.payPeriod}</p>
                  <p className="text-sm text-muted-foreground">Period: {payrollRecord.payPeriod}</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Payment Timeline
                </h3>
                <div className="p-3 bg-muted rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Payment Date:</span>
                    <CustomCalendar 
                      date={new Date(payrollRecord.paymentDate)} 
                      variant="compact" 
                      format="short"
                      showIcon={false}
                      className={isOverdue ? 'text-destructive font-medium' : ''}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge 
                      variant={getStatusVariant(payrollRecord.status)}
                      className={getStatusColor(payrollRecord.status)}
                    >
                      {getStatusLabel(payrollRecord.status)}
                    </Badge>
                  </div>
                  {isOverdue && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Days Overdue:</span>
                      <span className="font-medium text-destructive">
                        {Math.ceil((Date.now() - new Date(payrollRecord.paymentDate).getTime()) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Payment Status */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <IndianRupee className="h-4 w-4" />
                  Payment Status
                </h3>
                <div className="p-3 bg-muted rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Net Salary:</span>
                    <span className="font-medium">₹{payrollRecord.netSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Earnings:</span>
                    <span className="font-medium text-green-600">₹{totalEarnings.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Deductions:</span>
                    <span className="font-medium text-red-600">₹{payrollRecord.deductions.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-muted-foreground rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${100 - deductionPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {(100 - deductionPercentage).toFixed(1)}% take-home pay
                  </p>
                </div>
              </div>

              {/* Earnings Breakdown */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Earnings Breakdown
                </h3>
                <div className="space-y-2">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Base Salary</p>
                        <p className="text-xs text-muted-foreground">Regular pay</p>
                      </div>
                      <span className="font-medium">₹{payrollRecord.baseSalary.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Overtime</p>
                        <p className="text-xs text-muted-foreground">Extra hours</p>
                      </div>
                      <span className="font-medium text-green-600">+₹{payrollRecord.overtime.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Bonuses</p>
                        <p className="text-xs text-muted-foreground">Performance bonus</p>
                      </div>
                      <span className="font-medium text-green-600">+₹{payrollRecord.bonuses.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tax and Totals */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Deductions & Totals</h3>
            <div className="p-3 bg-muted rounded-lg">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Earnings:</span>
                  <span>₹{totalEarnings.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Deductions:</span>
                  <span className="text-red-600">-₹{payrollRecord.deductions.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Net Salary:</span>
                  <span>₹{payrollRecord.netSalary.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Additional Information</h3>
            <div className="p-3 bg-muted rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Processed by:</span>
                  <p className="font-medium">HR Department</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last updated:</span>
                  <p className="font-medium">{new Date().toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Deduction Rate:</span>
                  <p className="font-medium">{deductionPercentage.toFixed(1)}%</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Take-home Rate:</span>
                  <p className="font-medium">{(100 - deductionPercentage).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {canProcessPayment && payrollRecord.status !== 'paid' && payrollRecord.status !== 'cancelled' && (
              <Button variant="outline" onClick={handleProcessPayment}>
                <CreditCard className="h-4 w-4 mr-2" />
                Process Payment
              </Button>
            )}
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
