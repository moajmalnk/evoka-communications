import { useState, useEffect } from 'react';
import { X, UserCircle, Mail, Phone, MapPin, Building2, Calendar, IndianRupee, FileText, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { useToast } from '@/hooks/use-toast';

// Import the correct types and constants
import { Client, ClientUpdateData, INDUSTRY_CHOICES, STATUS_CHOICES, IndustryChoice, StatusChoice } from '@/lib/clientService';

interface ClientEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onClientUpdated: (client: ClientUpdateData) => void;
}

// Use the valid industry choices from the API
const industries = [
  { value: INDUSTRY_CHOICES.TECHNOLOGY, label: 'Technology' },
  { value: INDUSTRY_CHOICES.HEALTHCARE, label: 'Healthcare' },
  { value: INDUSTRY_CHOICES.FINANCE, label: 'Finance' },
  { value: INDUSTRY_CHOICES.RETAIL, label: 'Retail' },
  { value: INDUSTRY_CHOICES.EDUCATION, label: 'Education' },
  { value: INDUSTRY_CHOICES.MANUFACTURING, label: 'Manufacturing' },
  { value: INDUSTRY_CHOICES.CONSULTING, label: 'Consulting' },
  { value: INDUSTRY_CHOICES.REAL_ESTATE, label: 'Real Estate' },
  { value: INDUSTRY_CHOICES.ENTERTAINMENT, label: 'Entertainment' },
  { value: INDUSTRY_CHOICES.OTHER, label: 'Other' },
];

// Use the valid status choices from the API
const statuses = [
  { value: STATUS_CHOICES.ACTIVE, label: 'Active' },
  { value: STATUS_CHOICES.INACTIVE, label: 'Inactive' },
  { value: STATUS_CHOICES.PROSPECT, label: 'Prospect' }
];

export function ClientEditModal({ isOpen, onClose, client, onClientUpdated }: ClientEditModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<ClientUpdateData>({
    name: '',
    email: '',
    phone_number: '',
    address: '',
    company: '',
    industry: INDUSTRY_CHOICES.TECHNOLOGY,
    status: STATUS_CHOICES.ACTIVE,
    notes: ''
  });

  // Populate form data when client changes
  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        phone_number: client.phone_number || '', // Changed from phone to phone_number
        address: client.address || '', // Changed from location to address
        company: client.company || '',
        industry: (client.industry as IndustryChoice) || INDUSTRY_CHOICES.TECHNOLOGY,
        status: (client.status as StatusChoice) || STATUS_CHOICES.ACTIVE,
        notes: client.notes || ''
      });
    }
  }, [client]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Client name is required';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone_number?.trim()) { // Changed from phone to phone_number
      newErrors.phone_number = 'Phone number is required';
    }

    if (!formData.company?.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (!formData.industry) {
      newErrors.industry = 'Industry is required';
    }

    if (!formData.address?.trim()) { // Changed from location to address
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value 
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleIndustryChange = (value: IndustryChoice) => {
    handleInputChange('industry', value);
  };

  const handleStatusChange = (value: StatusChoice) => {
    handleInputChange('status', value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!client || !validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call the parent handler which will make the API call
      await onClientUpdated(formData);
      
      // Success toast will be shown by the parent component
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Error in ClientEditModal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!client) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5" />
            Edit Client
          </DialogTitle>
          <DialogDescription>
            Update {client.name}'s information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <UserCircle className="h-4 w-4" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Client Name *</Label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="pl-10"
                    placeholder="Enter client name"
                  />
                </div>
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10"
                    placeholder="Enter email address"
                  />
                </div>
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone_number"
                    value={formData.phone_number || ''}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    className="pl-10"
                    placeholder="Enter phone number"
                  />
                </div>
                {errors.phone_number && <p className="text-sm text-red-500">{errors.phone_number}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="address"
                    value={formData.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="pl-10"
                    placeholder="Enter address"
                  />
                </div>
                {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
              </div>
            </div>
          </div>

          {/* Company Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Company Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company Name *</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="company"
                    value={formData.company || ''}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="pl-10"
                    placeholder="Enter company name"
                  />
                </div>
                {errors.company && <p className="text-sm text-red-500">{errors.company}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Select 
                  value={formData.industry} 
                  onValueChange={handleIndustryChange}
                >
                  <SelectTrigger className={errors.industry ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry.value} value={industry.value}>
                        {industry.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.industry && <p className="text-sm text-red-500">{errors.industry}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Additional Information
            </h3>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Enter any additional notes about the client..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-gradient-primary shadow-primary">
              {isLoading ? 'Updating...' : 'Update Client'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}