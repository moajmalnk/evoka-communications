export interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  projectId: string;
  projectName: string;
  dateIssued: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
  notes?: string;
  terms?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  paidAt?: string;
  overdueAt?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category?: string;
}

export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';

export interface InvoiceFormData {
  clientId: string;
  projectId: string;
  dateIssued: string;
  dueDate: string;
  items: InvoiceItem[];
  taxRate: number;
  notes?: string;
  terms?: string;
}

export interface InvoiceFilters {
  searchTerm: string;
  status: string;
  client: string;
  project: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface BillingSettings {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyLogo?: string;
  defaultTaxRate: number;
  currency: string;
  paymentTerms: string;
  invoicePrefix: string;
  invoiceNumbering: 'sequential' | 'year_based';
}
