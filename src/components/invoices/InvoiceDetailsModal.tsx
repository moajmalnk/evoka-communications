import { useState } from 'react';
import { X, Download, Calendar, Building2, FileText, IndianRupee, Edit, Trash2, AlertTriangle, CheckCircle, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { Invoice, InvoiceStatus } from '@/types/invoice';
import { CustomCalendar } from '@/components/ui/custom-calendar';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface InvoiceDetailsModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoiceId: string) => void;
  onRecordPayment: (invoiceId: string, amount: number) => void;
}

const getStatusVariant = (status: InvoiceStatus) => {
  switch (status) {
    case 'paid':
      return 'default';
    case 'partially_paid':
      return 'secondary';
    case 'pending':
      return 'outline';
    case 'overdue':
      return 'destructive';
    case 'draft':
      return 'outline';
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getStatusColor = (status: InvoiceStatus) => {
  switch (status) {
    case 'paid':
      return 'text-green-600';
    case 'partially_paid':
      return 'text-yellow-600';
    case 'pending':
      return 'text-blue-600';
    case 'overdue':
      return 'text-red-600';
    case 'draft':
      return 'text-muted-foreground';
    case 'cancelled':
      return 'text-red-600';
    default:
      return 'text-muted-foreground';
  }
};

const getStatusLabel = (status: InvoiceStatus) => {
  switch (status) {
    case 'paid':
      return 'Paid';
    case 'partially_paid':
      return 'Partially Paid';
    case 'pending':
      return 'Pending';
    case 'overdue':
      return 'Overdue';
    case 'draft':
      return 'Draft';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

export function InvoiceDetailsModal({
  invoice,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onRecordPayment,
}: InvoiceDetailsModalProps) {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  if (!invoice) return null;

  const canEdit = user?.role === 'admin' || user?.role === 'general_manager';
  const canDelete = user?.role === 'admin' || user?.role === 'general_manager';
  const canRecordPayment = user?.role === 'admin' || user?.role === 'general_manager';

  const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid' && invoice.status !== 'cancelled';
  const remainingAmount = invoice.totalAmount - invoice.paidAmount;
  const paymentProgress = (invoice.paidAmount / invoice.totalAmount) * 100;

  const handleDeleteClick = () => {
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!canDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(invoice.id);
      onClose();
    } catch (error) {
      console.error('Error deleting invoice:', error);
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  const handleRecordPayment = () => {
    if (!canRecordPayment) return;
    onRecordPayment(invoice.id, remainingAmount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl font-bold">
                    {invoice.clientName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-background border-2 border-background rounded-full">
                  <Building2 className="h-4 w-4" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <DialogTitle className="text-2xl font-bold">
                    Invoice {invoice.id}
                  </DialogTitle>
                </div>
                <DialogDescription className="text-sm text-muted-foreground">
                  Created {new Date(invoice.dateIssued).toLocaleDateString()} • Client: {invoice.clientName}
                </DialogDescription>
                <Badge 
                  variant={getStatusVariant(invoice.status)}
                  className="text-xs font-medium"
                >
                  {getStatusLabel(invoice.status)}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              {canEdit && (
                <Button 
                  onClick={() => onEdit(invoice)}
                  variant="ghost"
                  size="sm"
                  className="text-blue-700 hover:text-blue-700 border border-blue-300 hover:border-blue-400"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {canDelete && (
                <Button 
                  onClick={handleDeleteClick}
                  variant="ghost"
                  size="sm"
                  className="text-red-700 hover:text-red-700 border border-red-300 hover:border-red-400"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Invoice Information Card */}
              <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Invoice Details</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Invoice ID</label>
                    <p className="font-mono text-sm text-slate-400 mt-1">{invoice.id}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium">Client</label>
                      <p className="font-medium text-slate-400 mt-1">{invoice.clientName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Project</label>
                      <p className="font-medium text-slate-400 mt-1">{invoice.projectName}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <div className="mt-1 space-y-2">
                        <Badge 
                          variant={getStatusVariant(invoice.status)}
                          className="text-xs font-medium"
                        >
                          {getStatusLabel(invoice.status)}
                        </Badge>
                        {isOverdue && (
                          <Badge variant="destructive" className="text-xs ml-2">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Overdue
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Total Amount</label>
                      <p className="font-medium text-slate-400 mt-1">₹{invoice.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoice Items */}
              <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Invoice Items ({invoice.items?.length || 0})</h3>
                </div>
                {invoice.items && invoice.items.length > 0 ? (
                  <div className="space-y-2">
                    {invoice.items.map((item, index) => (
                      <div key={item.id || index} className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{item.description}</p>
                            <p className="text-xs text-muted-foreground">
                              Qty: {item.quantity} × ₹{item.unitPrice.toFixed(2)}
                            </p>
                          </div>
                          <span className="font-medium">₹{item.total.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">No items found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Timeline Card */}
              <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Timeline</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Issue Date</label>
                    <div className="mt-1">
                      <CustomCalendar 
                        date={new Date(invoice.dateIssued)} 
                        variant="compact" 
                        format="short"
                        showIcon={false}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Due Date</label>
                    <div className="mt-1">
                      <CustomCalendar 
                        date={new Date(invoice.dueDate)} 
                        variant="compact" 
                        format="short"
                        showIcon={false}
                        className={isOverdue ? 'text-destructive font-medium' : ''}
                      />
                    </div>
                  </div>
                  {invoice.paidAt && (
                    <div>
                      <label className="text-sm font-medium">Paid Date</label>
                      <div className="mt-1">
                        <CustomCalendar 
                          date={new Date(invoice.paidAt)} 
                          variant="compact" 
                          format="short"
                          showIcon={false}
                        />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium">Days Overdue</label>
                    <p className={`text-sm font-medium mt-1 ${isOverdue ? 'text-destructive' : 'text-slate-400'}`}>
                      {isOverdue ? Math.ceil((Date.now() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)) : 0} days
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <IndianRupee className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Payment Status</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Total Amount</label>
                    <p className="font-medium text-slate-400 mt-1">₹{invoice.totalAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Paid Amount</label>
                    <p className="font-medium text-green-600 mt-1">₹{invoice.paidAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Remaining</label>
                    <p className={`font-medium mt-1 ${remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ₹{remainingAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Progress</label>
                    <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${paymentProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {paymentProgress.toFixed(1)}% paid
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tax and Totals */}
          <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <IndianRupee className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Tax & Totals</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Subtotal:</span>
                <span className="font-medium">₹{(invoice.totalAmount - (invoice.totalAmount * invoice.taxRate / 100)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tax ({invoice.taxRate}%):</span>
                <span className="font-medium">₹{(invoice.totalAmount * invoice.taxRate / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-slate-200 pt-2">
                <span>Total:</span>
                <span>₹{invoice.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Additional Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Created by:</span>
                <p className="font-medium text-slate-400 mt-1">General Manager</p>
              </div>
              <div>
                <span className="text-slate-400">Last updated:</span>
                <p className="font-medium text-slate-400 mt-1">{new Date(invoice.updatedAt).toLocaleDateString()}</p>
              </div>
              {invoice.notes && (
                <div className="md:col-span-2">
                  <span className="text-slate-400">Notes:</span>
                  <p className="font-medium text-slate-400 mt-1">{invoice.notes}</p>
                </div>
              )}
              {invoice.terms && (
                <div className="md:col-span-2">
                  <span className="text-slate-400">Payment Terms:</span>
                  <p className="font-medium text-slate-400 mt-1">{invoice.terms}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {canRecordPayment && remainingAmount > 0 && invoice.status !== 'cancelled' && (
              <Button variant="outline" onClick={handleRecordPayment}>
                <CreditCard className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            )}
          </div>
        </DialogFooter> */}
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Invoice"
        description={`Are you sure you want to delete invoice "${invoice.id}"? This action cannot be undone.`}
        confirmText="Delete Invoice"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isDeleting}
      />
    </Dialog>
  );
}
