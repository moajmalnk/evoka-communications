import { useState, useEffect } from 'react';
import { X, Plus, Building2, Calendar, IndianRupee, FileText, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
import { Invoice, InvoiceFormData, InvoiceItem } from '@/types/invoice';
import { mockClients, mockBillingSettings } from '@/lib/invoiceService';
import { mockProjects } from '@/lib/projectService';
import { CustomCalendar } from '@/components/ui/custom-calendar';

interface InvoiceEditModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: Partial<InvoiceFormData>) => void;
}

export function InvoiceEditModal({
  invoice,
  isOpen,
  onClose,
  onSubmit,
}: InvoiceEditModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<InvoiceFormData & { invoiceType: 'monthly' | 'custom' }>({
    clientId: '',
    projectId: '',
    dateIssued: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [
      {
        id: 'item-1',
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
        category: '',
      },
    ],
    taxRate: 8.5,
    notes: '',
    terms: 'Net 30 - Payment due within 30 days of invoice date.',
    invoiceType: 'custom',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issueDateOpen, setIssueDateOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);

  // Initialize form data when invoice changes
  useEffect(() => {
    if (invoice) {
      setFormData({
        clientId: invoice.clientId,
        projectId: invoice.projectId,
        dateIssued: invoice.dateIssued,
        dueDate: invoice.dueDate,
        items: invoice.items || [
          {
            id: 'item-1',
            description: '',
            quantity: 1,
            unitPrice: 0,
            total: 0,
            category: '',
          },
        ],
        taxRate: invoice.taxRate || 8.5,
        notes: invoice.notes || '',
        terms: invoice.terms || 'Net 30 - Payment due within 30 days of invoice date.',
        invoiceType: 'custom', // Default to custom for existing invoices
      });
    }
  }, [invoice]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientId) {
      newErrors.clientId = 'Client is required';
    }
    if (!formData.projectId) {
      newErrors.projectId = 'Project is required';
    }
    if (!formData.dateIssued) {
      newErrors.dateIssued = 'Issue date is required';
    }
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    if (formData.dateIssued && formData.dueDate && new Date(formData.dateIssued) >= new Date(formData.dueDate)) {
      newErrors.dueDate = 'Due date must be after issue date';
    }
    if (formData.items.length === 0) {
      newErrors.items = 'At least one item is required';
    }

    // Validate items
    const itemErrors: string[] = [];
    formData.items.forEach((item, index) => {
      if (!item.description.trim()) {
        itemErrors.push(`Item ${index + 1}: Description is required`);
      }
      if (item.quantity <= 0) {
        itemErrors.push(`Item ${index + 1}: Quantity must be greater than 0`);
      }
      if (item.unitPrice < 0) {
        itemErrors.push(`Item ${index + 1}: Unit price cannot be negative`);
      }
    });

    if (itemErrors.length > 0) {
      newErrors.items = itemErrors.join('; ');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invoice || !validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(invoice.id, formData);
      handleClose();
    } catch (error) {
      console.error('Error updating invoice:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      clientId: '',
      projectId: '',
      dateIssued: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [
        {
          id: 'item-1',
          description: '',
          quantity: 1,
          unitPrice: 0,
          total: 0,
          category: '',
        },
      ],
      taxRate: 8.5,
      notes: '',
      terms: 'Net 30 - Payment due within 30 days of invoice date.',
      invoiceType: 'custom',
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      category: '',
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (itemId: string) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== itemId)
      }));
    }
  };

  const updateItem = (itemId: string, field: keyof InvoiceItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          // Recalculate total
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTaxAmount = () => {
    return (calculateSubtotal() * formData.taxRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTaxAmount();
  };

  const canEditInvoice = user?.role === 'admin' || user?.role === 'general_manager';

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleIssueDateChange = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    setFormData(prev => ({ ...prev, dateIssued: `${year}-${month}-${day}` }));
    setIssueDateOpen(false);
  };

  const handleDueDateChange = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    setFormData(prev => ({ ...prev, dueDate: `${year}-${month}-${day}` }));
    setDueDateOpen(false);
  };

  if (!canEditInvoice) {
    return null;
  }

  if (!invoice) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Edit Invoice
          </DialogTitle>
          <DialogDescription>
            Update invoice details and information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Invoice Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientId">Client *</Label>
                <Select value={formData.clientId} onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value }))}>
                  <SelectTrigger className={errors.clientId ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockClients.filter(client => client.isActive).map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.clientId && <p className="text-sm text-destructive">{errors.clientId}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectId">Project *</Label>
                <Select value={formData.projectId} onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateIssued">Issue Date *</Label>
                <Popover open={issueDateOpen} onOpenChange={setIssueDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ₹{errors.dateIssued ? 'border-destructive' : ''}`}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.dateIssued ? formatDateForDisplay(formData.dateIssued) : 'Pick an issue date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CustomCalendar
                      date={formData.dateIssued ? new Date(formData.dateIssued) : new Date()}
                      onDateChange={handleIssueDateChange}
                      variant="inline"
                    />
                  </PopoverContent>
                </Popover>
                {errors.dateIssued && <p className="text-sm text-destructive">{errors.dateIssued}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${errors.dueDate ? 'border-destructive' : ''}`}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.dueDate ? formatDateForDisplay(formData.dueDate) : 'Pick a due date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CustomCalendar
                      date={formData.dueDate ? new Date(formData.dueDate) : new Date()}
                      onDateChange={handleDueDateChange}
                      variant="inline"
                    />
                  </PopoverContent>
                </Popover>
                {errors.dueDate && <p className="text-sm text-destructive">{errors.dueDate}</p>}
              </div>
            </div>
          </div>

          {/* Invoice Type Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Invoice Type
            </h3>
            
            <RadioGroup 
              value={formData.invoiceType} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, invoiceType: value as 'monthly' | 'custom' }))}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="text-base font-normal">
                  Custom Bill
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly" className="text-base font-normal">
                  Monthly Bill
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Invoice Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Invoice Items
              </h3>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
            
            {errors.items && <p className="text-sm text-destructive">{errors.items}</p>}
            
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={item.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    {formData.items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor={`description-${item.id}`}>Description *</Label>
                      <Input
                        id={`description-${item.id}`}
                        placeholder="Item description"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`quantity-${item.id}`}>Quantity *</Label>
                      <Input
                        id={`quantity-${item.id}`}
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`unitPrice-${item.id}`}>Unit Price *</Label>
                      <Input
                        id={`unitPrice-${item.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Total: <span className="font-medium">₹{item.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tax and Totals */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              Tax & Totals
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="8.5"
                  value={formData.taxRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
            
            <div className="p-4 bg-muted rounded-lg space-y-2">
              {formData.taxRate > 0 && (
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{calculateSubtotal().toFixed(2)}</span>
                </div>
              )}
              {formData.taxRate > 0 && (
                <div className="flex justify-between">
                  <span>Tax ({formData.taxRate}%):</span>
                  <span>₹{calculateTaxAmount().toFixed(2)}</span>
                </div>
              )}
              <div className={`flex justify-between font-bold text-lg ${formData.taxRate > 0 ? 'border-t pt-2' : ''}`}>
                <span>Total:</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Additional Information
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes for the client..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="terms">Payment Terms</Label>
              <Textarea
                id="terms"
                placeholder="Payment terms and conditions..."
                value={formData.terms}
                onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-gradient-primary shadow-primary">
              {isSubmitting ? 'Updating...' : 'Update Invoice'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
