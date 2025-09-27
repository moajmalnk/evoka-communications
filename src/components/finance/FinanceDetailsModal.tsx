import { useState } from 'react';
import { X, Download, Calendar, IndianRupee, Tag, Building2, FileText, Clock, Edit, Trash2, AlertTriangle, CheckCircle, XCircle, User, Receipt } from 'lucide-react';
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
import { FinancialTransaction, TransactionStatus } from '@/types/finance';

interface FinanceDetailsModalProps {
  transaction: FinancialTransaction | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (transaction: FinancialTransaction) => void;
  onDelete: (transactionId: string) => void;
}

const getStatusVariant = (status: TransactionStatus) => {
  switch (status) {
    case 'pending':
      return 'secondary';
    case 'gm_approved':
      return 'default';
    case 'admin_approved':
      return 'default';
    case 'rejected':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getStatusColor = (status: TransactionStatus) => {
  switch (status) {
    case 'pending':
      return 'text-yellow-600';
    case 'gm_approved':
      return 'text-blue-600';
    case 'admin_approved':
      return 'text-white';
    case 'rejected':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

const getStatusLabel = (status: TransactionStatus) => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'gm_approved':
      return 'GM Approved';
    case 'admin_approved':
      return 'Admin Approved';
    case 'rejected':
      return 'Rejected';
    default:
      return 'Unknown';
  }
};

const getTypeColor = (type: 'income' | 'expense') => {
  return type === 'income' ? 'text-green-600' : 'text-red-600';
};

const getTypeIcon = (type: 'income' | 'expense') => {
  return type === 'income' ? '↗' : '↘';
};

export function FinanceDetailsModal({
  transaction,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: FinanceDetailsModalProps) {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!transaction) return null;

  const canEdit = user?.role === 'admin' || user?.role === 'general_manager';
  const canDelete = user?.role === 'admin';

  const handleDelete = async () => {
    if (!canDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(transaction.id);
      onClose();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Transaction Details
          </DialogTitle>
          <DialogDescription>
            View detailed information about this financial transaction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transaction Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${getTypeColor(transaction.type)}`}>
                  {getTypeIcon(transaction.type)}
                </span>
                <span className="text-2xl font-bold">
                  {formatCurrency(transaction.amount, transaction.currency)}
                </span>
                <Badge 
                  variant={getStatusVariant(transaction.status)}
                  className={getStatusColor(transaction.status)}
                >
                  {getStatusLabel(transaction.status)}
                </Badge>
              </div>
              <h3 className="text-lg font-semibold">{transaction.description}</h3>
              <p className="text-sm text-muted-foreground">Reference: {transaction.reference}</p>
            </div>
          </div>

          <Separator />

          {/* Transaction Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Transaction Details</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Type:</span>
                    <span className="font-medium capitalize">{transaction.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Category:</span>
                    <span className="font-medium">{transaction.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Subcategory:</span>
                    <span className="font-medium">{transaction.subcategory}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Reference Type:</span>
                    <span className="font-medium capitalize">{transaction.referenceType.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Dates</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Transaction Date:</span>
                    <span className="font-medium">{formatDate(transaction.date)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Created:</span>
                    <span className="font-medium">{formatDateTime(transaction.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Updated:</span>
                    <span className="font-medium">{formatDateTime(transaction.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Approval Status</h4>
                <div className="space-y-3">
                  {transaction.approvedBy && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Approved By:</span>
                      <span className="font-medium">{transaction.approvedBy}</span>
                    </div>
                  )}
                  {transaction.approvedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Approved At:</span>
                      <span className="font-medium">{formatDateTime(transaction.approvedAt)}</span>
                    </div>
                  )}
                  {transaction.rejectedBy && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Rejected By:</span>
                      <span className="font-medium">{transaction.rejectedBy}</span>
                    </div>
                  )}
                  {transaction.rejectedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Rejected At:</span>
                      <span className="font-medium">{formatDateTime(transaction.rejectedAt)}</span>
                    </div>
                  )}
                  {transaction.rejectionReason && (
                    <div className="flex items-start justify-between">
                      <span className="text-sm text-muted-foreground">Rejection Reason:</span>
                      <span className="font-medium text-right max-w-[200px]">{transaction.rejectionReason}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Additional Info</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Created By:</span>
                    <span className="font-medium">{transaction.createdBy}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Currency:</span>
                    <span className="font-medium">{transaction.currency}</span>
                  </div>
                  {transaction.referenceId && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Reference ID:</span>
                      <span className="font-medium">{transaction.referenceId}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {transaction.notes && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Notes</h4>
                <p className="text-sm bg-muted p-3 rounded-md">{transaction.notes}</p>
              </div>
            </>
          )}

          {/* Attachments */}
          {transaction.attachments && transaction.attachments.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Attachments</h4>
                <div className="space-y-2">
                  {transaction.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{attachment}</span>
                      <Button variant="ghost" size="sm" className="ml-auto">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {canDelete && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {canEdit && (
              <Button onClick={() => onEdit(transaction)} className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit Transaction
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
