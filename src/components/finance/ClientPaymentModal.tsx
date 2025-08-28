import { useState, useEffect } from 'react';
import { DollarSign, Building2, Calendar, CreditCard, FileText, Upload } from 'lucide-react';
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
import { ClientPayment, PaymentMethod } from '@/types/finance';
import { mockClients } from '@/lib/invoiceService';
import { mockProjects } from '@/lib/projectService';

interface ClientPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<ClientPayment>) => void;
  payment?: ClientPayment | null;
  mode: 'create' | 'edit';
}

const initialFormData: Partial<ClientPayment> = {
  clientId: '',
  clientName: '',
  projectId: '',
  projectName: '',
  invoiceId: '',
  amount: 0,
  currency: 'USD',
  paymentMethod: 'bank_transfer',
  paymentDate: new Date().toISOString().split('T')[0],
  notes: '',
};

export function ClientPaymentModal({
  isOpen,
  onClose,
  onSubmit,
  payment,
  mode,
}: ClientPaymentModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<ClientPayment>>(initialFormData);
  const [errors, setErrors] = useState<Partial<ClientPayment>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when editing
  useEffect(() => {
    if (payment && mode === 'edit') {
      setFormData({
        clientId: payment.clientId,
        clientName: payment.clientName,
        projectId: payment.projectId,
        projectName: payment.projectName,
        invoiceId: payment.invoiceId || '',
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        paymentDate: payment.paymentDate,
        notes: payment.notes || '',
      });
    } else {
      setFormData(initialFormData);
    }
  }, [payment, mode]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ClientPayment> = {};

    if (!formData.clientId) {
      newErrors.clientId = 'Client is required';
    }
    if (!formData.projectId) {
      newErrors.projectId = 'Project is required';
    }
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.paymentDate) {
      newErrors.paymentDate = 'Payment date is required';
    }
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
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
      console.error('Error saving client payment:', error);
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

  const handleClientChange = (clientId: string) => {
    const client = mockClients.find(c => c.id === clientId);
    if (client) {
      setFormData(prev => ({
        ...prev,
        clientId,
        clientName: client.name,
      }));
    }
  };

  const handleProjectChange = (projectId: string) => {
    const project = mockProjects.find(p => p.id === projectId);
    if (project) {
      setFormData(prev => ({
        ...prev,
        projectId,
        projectName: project.name,
      }));
    }
  };

  const canManagePayments = user?.role === 'admin' || user?.role === 'general_manager';

  if (!canManagePayments) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {mode === 'create' ? 'Record Client Payment' : 'Edit Client Payment'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Record a new client payment received'
              : 'Update client payment information'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client and Project Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Client *</Label>
              <Select value={formData.clientId} onValueChange={handleClientChange}>
                <SelectTrigger className={errors.clientId ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {mockClients.filter(client => client.isActive).map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {client.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clientId && <p className="text-sm text-destructive">{errors.clientId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectId">Project *</Label>
              <Select value={formData.projectId} onValueChange={handleProjectChange}>
                <SelectTrigger className={errors.projectId ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {mockProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.projectId && <p className="text-sm text-destructive">{errors.projectId}</p>}
            </div>
          </div>

          {/* Invoice and Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceId">Invoice ID (Optional)</Label>
              <Input
                id="invoiceId"
                placeholder="e.g., INV-2024-001"
                value={formData.invoiceId}
                onChange={(e) => setFormData(prev => ({ ...prev, invoiceId: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount *</Label>
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

          {/* Payment Method and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select 
                value={formData.paymentMethod} 
                onValueChange={(value: PaymentMethod) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
              >
                <SelectTrigger className={errors.paymentMethod ? 'border-destructive' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Bank Transfer
                    </div>
                  </SelectItem>
                  <SelectItem value="credit_card">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Credit Card
                    </div>
                  </SelectItem>
                  <SelectItem value="cash">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Cash
                    </div>
                  </SelectItem>
                  <SelectItem value="check">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Check
                    </div>
                  </SelectItem>
                  <SelectItem value="paypal">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      PayPal
                    </div>
                  </SelectItem>
                  <SelectItem value="other">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Other
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.paymentMethod && <p className="text-sm text-destructive">{errors.paymentMethod}</p>}
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
              placeholder="Additional notes about the payment..."
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
              Upload payment receipts, bank statements, or other supporting documents
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-gradient-primary shadow-primary">
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Record Payment' : 'Update Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
