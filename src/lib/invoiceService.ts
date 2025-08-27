import { Invoice, InvoiceFormData, InvoiceStatus, InvoiceItem, Client, BillingSettings } from '@/types/invoice';
import { mockProjects } from './projectService';

// Mock clients data
export const mockClients: Client[] = [
  {
    id: 'client-1',
    name: 'Tech Corp',
    email: 'billing@techcorp.com',
    phone: '+1 (555) 123-4567',
    address: '123 Tech Street, Silicon Valley, CA 94025',
    taxId: 'TAX-123456789',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'client-2',
    name: 'StartupXYZ',
    email: 'finance@startupxyz.com',
    phone: '+1 (555) 987-6543',
    address: '456 Innovation Ave, Austin, TX 73301',
    taxId: 'TAX-987654321',
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'client-3',
    name: 'Fashion Brand',
    email: 'accounts@fashionbrand.com',
    phone: '+1 (555) 456-7890',
    address: '789 Style Blvd, New York, NY 10001',
    taxId: 'TAX-456789123',
    isActive: true,
    createdAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'client-4',
    name: 'Local Business',
    email: 'billing@localbusiness.com',
    phone: '+1 (555) 789-0123',
    address: '321 Main Street, Local City, LC 12345',
    taxId: 'TAX-789123456',
    isActive: true,
    createdAt: '2024-01-05T00:00:00Z',
  },
];

// Mock billing settings
export const mockBillingSettings: BillingSettings = {
  companyName: 'Evoka Communications',
  companyAddress: '123 Business Park, Suite 100, Business City, BC 12345',
  companyPhone: '+1 (555) 000-0000',
  companyEmail: 'billing@evoka.com',
  defaultTaxRate: 8.5,
  currency: 'USD',
  paymentTerms: 'Net 30',
  invoicePrefix: 'INV',
  invoiceNumbering: 'year_based',
};

// Mock invoice data
export const mockInvoices: Invoice[] = [
  {
    id: 'INV-2024-001',
    clientId: 'client-1',
    clientName: 'Tech Corp',
    projectId: 'P-001',
    projectName: 'Website Redesign',
    dateIssued: '2024-01-15',
    dueDate: '2024-02-15',
    items: [
      {
        id: 'item-1',
        description: 'UI/UX Design',
        quantity: 80,
        unitPrice: 100,
        total: 8000,
        category: 'Design',
      },
      {
        id: 'item-2',
        description: 'Frontend Development',
        quantity: 70,
        unitPrice: 100,
        total: 7000,
        category: 'Development',
      },
    ],
    subtotal: 15000,
    taxRate: 8.5,
    taxAmount: 1275,
    totalAmount: 16275,
    paidAmount: 16275,
    status: 'paid',
    notes: 'Website redesign completed successfully. Client very satisfied with the results.',
    terms: 'Net 30 - Payment due within 30 days of invoice date.',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    createdBy: 'admin-1',
    paidAt: '2024-01-20T00:00:00Z',
  },
  {
    id: 'INV-2024-002',
    clientId: 'client-2',
    clientName: 'StartupXYZ',
    projectId: 'P-002',
    projectName: 'Mobile App Development',
    dateIssued: '2024-01-20',
    dueDate: '2024-02-20',
    items: [
      {
        id: 'item-3',
        description: 'Mobile App Development',
        quantity: 200,
        unitPrice: 120,
        total: 24000,
        category: 'Development',
      },
      {
        id: 'item-4',
        description: 'API Integration',
        quantity: 25,
        unitPrice: 80,
        total: 2000,
        category: 'Development',
      },
    ],
    subtotal: 26000,
    taxRate: 8.5,
    taxAmount: 2210,
    totalAmount: 28210,
    paidAmount: 10000,
    status: 'partially_paid',
    notes: 'Phase 1 completed. Remaining payment due upon project completion.',
    terms: '50% upfront, 50% upon completion',
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-01-22T00:00:00Z',
    createdBy: 'admin-1',
  },
  {
    id: 'INV-2024-003',
    clientId: 'client-3',
    clientName: 'Fashion Brand',
    projectId: 'P-003',
    projectName: 'Brand Identity Design',
    dateIssued: '2024-01-25',
    dueDate: '2024-02-25',
    items: [
      {
        id: 'item-5',
        description: 'Logo Design',
        quantity: 40,
        unitPrice: 100,
        total: 4000,
        category: 'Design',
      },
      {
        id: 'item-6',
        description: 'Brand Guidelines',
        quantity: 40,
        unitPrice: 100,
        total: 4000,
        category: 'Design',
      },
    ],
    subtotal: 8000,
    taxRate: 8.5,
    taxAmount: 680,
    totalAmount: 8680,
    paidAmount: 0,
    status: 'pending',
    notes: 'Brand identity package delivered. Awaiting client approval and payment.',
    terms: 'Net 30 - Payment due within 30 days of invoice date.',
    createdAt: '2024-01-25T00:00:00Z',
    updatedAt: '2024-01-25T00:00:00Z',
    createdBy: 'admin-1',
  },
  {
    id: 'INV-2024-004',
    clientId: 'client-4',
    clientName: 'Local Business',
    projectId: 'P-004',
    projectName: 'Marketing Campaign',
    dateIssued: '2023-12-15',
    dueDate: '2024-01-15',
    items: [
      {
        id: 'item-7',
        description: 'Content Creation',
        quantity: 30,
        unitPrice: 100,
        total: 3000,
        category: 'Marketing',
      },
      {
        id: 'item-8',
        description: 'Social Media Management',
        quantity: 20,
        unitPrice: 100,
        total: 2000,
        category: 'Marketing',
      },
    ],
    subtotal: 5000,
    taxRate: 8.5,
    taxAmount: 425,
    totalAmount: 5425,
    paidAmount: 0,
    status: 'overdue',
    notes: 'Marketing campaign completed successfully. Payment overdue.',
    terms: 'Net 30 - Payment due within 30 days of invoice date.',
    createdAt: '2023-12-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    createdBy: 'admin-1',
    overdueAt: '2024-01-15T00:00:00Z',
  },
];

class InvoiceService {
  private static instance: InvoiceService;
  private invoices: Invoice[] = [...mockInvoices];

  static getInstance() {
    if (!InvoiceService.instance) {
      InvoiceService.instance = new InvoiceService();
    }
    return InvoiceService.instance;
  }

  // Generate unique invoice ID
  private generateInvoiceId(): string {
    const currentYear = new Date().getFullYear();
    const yearInvoices = this.invoices.filter(inv => inv.id.includes(`-${currentYear}-`));
    const nextNumber = yearInvoices.length + 1;
    return `INV-${currentYear}-${nextNumber.toString().padStart(3, '0')}`;
  }

  // Get all invoices
  async getInvoices(): Promise<Invoice[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.invoices];
  }

  // Get invoice by ID
  async getInvoiceById(id: string): Promise<Invoice | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.invoices.find(invoice => invoice.id === id) || null;
  }

  // Get invoices by client
  async getInvoicesByClient(clientId: string): Promise<Invoice[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.invoices.filter(invoice => invoice.clientId === clientId);
  }

  // Get invoices by project
  async getInvoicesByProject(projectId: string): Promise<Invoice[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.invoices.filter(invoice => invoice.projectId === projectId);
  }

  // Create new invoice
  async createInvoice(data: InvoiceFormData, createdBy: string): Promise<Invoice> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const client = mockClients.find(c => c.id === data.clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    const project = mockProjects.find(p => p.id === data.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = (subtotal * data.taxRate) / 100;
    const totalAmount = subtotal + taxAmount;

    const newInvoice: Invoice = {
      id: this.generateInvoiceId(),
      clientId: data.clientId,
      clientName: client.name,
      projectId: data.projectId,
      projectName: project.name,
      dateIssued: data.dateIssued,
      dueDate: data.dueDate,
      items: data.items,
      subtotal,
      taxRate: data.taxRate,
      taxAmount,
      totalAmount,
      paidAmount: 0,
      status: 'pending',
      notes: data.notes,
      terms: data.terms,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy,
    };

    this.invoices.push(newInvoice);
    return newInvoice;
  }

  // Update invoice
  async updateInvoice(id: string, data: Partial<InvoiceFormData>): Promise<Invoice> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const invoiceIndex = this.invoices.findIndex(invoice => invoice.id === id);
    if (invoiceIndex === -1) {
      throw new Error('Invoice not found');
    }

    const updatedInvoice = { ...this.invoices[invoiceIndex] };

    // Update fields if provided
    if (data.clientId) {
      const client = mockClients.find(c => c.id === data.clientId);
      if (client) {
        updatedInvoice.clientId = data.clientId;
        updatedInvoice.clientName = client.name;
      }
    }

    if (data.projectId) {
      const project = mockProjects.find(p => p.id === data.projectId);
      if (project) {
        updatedInvoice.projectId = data.projectId;
        updatedInvoice.projectName = project.name;
      }
    }

    if (data.dateIssued) updatedInvoice.dateIssued = data.dateIssued;
    if (data.dueDate) updatedInvoice.dueDate = data.dueDate;
    if (data.items) {
      updatedInvoice.items = data.items;
      // Recalculate totals
      updatedInvoice.subtotal = data.items.reduce((sum, item) => sum + item.total, 0);
      updatedInvoice.taxAmount = (updatedInvoice.subtotal * updatedInvoice.taxRate) / 100;
      updatedInvoice.totalAmount = updatedInvoice.subtotal + updatedInvoice.taxAmount;
    }
    if (data.taxRate) {
      updatedInvoice.taxRate = data.taxRate;
      updatedInvoice.taxAmount = (updatedInvoice.subtotal * data.taxRate) / 100;
      updatedInvoice.totalAmount = updatedInvoice.subtotal + updatedInvoice.taxAmount;
    }
    if (data.notes !== undefined) updatedInvoice.notes = data.notes;
    if (data.terms !== undefined) updatedInvoice.terms = data.terms;

    updatedInvoice.updatedAt = new Date().toISOString();

    this.invoices[invoiceIndex] = updatedInvoice;
    return updatedInvoice;
  }

  // Record payment
  async recordPayment(invoiceId: string, amount: number): Promise<Invoice> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const invoiceIndex = this.invoices.findIndex(invoice => invoice.id === invoiceId);
    if (invoiceIndex === -1) {
      throw new Error('Invoice not found');
    }

    const updatedInvoice = { ...this.invoices[invoiceIndex] };
    updatedInvoice.paidAmount += amount;

    // Update status based on payment
    if (updatedInvoice.paidAmount >= updatedInvoice.totalAmount) {
      updatedInvoice.status = 'paid';
      updatedInvoice.paidAt = new Date().toISOString();
    } else if (updatedInvoice.paidAmount > 0) {
      updatedInvoice.status = 'partially_paid';
    }

    updatedInvoice.updatedAt = new Date().toISOString();

    this.invoices[invoiceIndex] = updatedInvoice;
    return updatedInvoice;
  }

  // Delete invoice
  async deleteInvoice(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const invoiceIndex = this.invoices.findIndex(invoice => invoice.id === id);
    if (invoiceIndex === -1) {
      throw new Error('Invoice not found');
    }

    this.invoices.splice(invoiceIndex, 1);
  }

  // Get invoice statistics
  async getInvoiceStats() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const total = this.invoices.length;
    const draft = this.invoices.filter(i => i.status === 'draft').length;
    const pending = this.invoices.filter(i => i.status === 'pending').length;
    const paid = this.invoices.filter(i => i.status === 'paid').length;
    const partiallyPaid = this.invoices.filter(i => i.status === 'partially_paid').length;
    const overdue = this.invoices.filter(i => i.status === 'overdue').length;
    const cancelled = this.invoices.filter(i => i.status === 'cancelled').length;

    const totalAmount = this.invoices.reduce((sum, i) => sum + i.totalAmount, 0);
    const paidAmount = this.invoices.reduce((sum, i) => sum + i.paidAmount, 0);
    const pendingAmount = totalAmount - paidAmount;

    return {
      total,
      draft,
      pending,
      paid,
      partiallyPaid,
      overdue,
      cancelled,
      totalAmount,
      paidAmount,
      pendingAmount,
      collectionRate: totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0,
    };
  }

  // Search invoices
  async searchInvoices(query: string): Promise<Invoice[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const lowercaseQuery = query.toLowerCase();
    
    return this.invoices.filter(invoice => 
      invoice.id.toLowerCase().includes(lowercaseQuery) ||
      invoice.clientName.toLowerCase().includes(lowercaseQuery) ||
      invoice.projectName.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Get invoices by status
  async getInvoicesByStatus(status: InvoiceStatus): Promise<Invoice[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.invoices.filter(invoice => invoice.status === status);
  }

  // Get overdue invoices
  async getOverdueInvoices(): Promise<Invoice[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const today = new Date();
    return this.invoices.filter(invoice => 
      new Date(invoice.dueDate) < today && 
      invoice.status !== 'paid' && 
      invoice.status !== 'cancelled'
    );
  }

  // Generate monthly summary
  async generateMonthlySummary(year: number, month: number): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const monthInvoices = this.invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.dateIssued);
      return invoiceDate >= startDate && invoiceDate <= endDate;
    });

    const totalInvoiced = monthInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
    const totalPaid = monthInvoices.reduce((sum, i) => sum + i.paidAmount, 0);
    const totalPending = totalInvoiced - totalPaid;

    return {
      year,
      month,
      totalInvoices: monthInvoices.length,
      totalInvoiced,
      totalPaid,
      totalPending,
      invoices: monthInvoices,
    };
  }
}

export const invoiceService = InvoiceService.getInstance();
