import { 
  FinancialTransaction, 
  TransactionStatus, 
  ClientPayment, 
  PaymentMethod, 
  SalaryRecord, 
  PettyCash,
  TransactionCategory,
  FinanceStats,
  ApprovalRequest
} from '@/types/finance';
import { mockClients } from './invoiceService';
import { mockEmployees } from './taskService';
import { mockProjects } from './projectService';

// Mock transaction categories
export const mockTransactionCategories: TransactionCategory[] = [
  {
    id: 'client_payments',
    name: 'Client Payments',
    type: 'income',
    subcategories: ['Website Development', 'Mobile App', 'Design Services', 'Consulting'],
    isActive: true,
    color: '#10b981',
  },
  {
    id: 'salaries',
    name: 'Salaries',
    type: 'expense',
    subcategories: ['Base Salary', 'Overtime', 'Bonuses', 'Allowances'],
    isActive: true,
    color: '#ef4444',
  },
  {
    id: 'office_expenses',
    name: 'Office Expenses',
    type: 'expense',
    subcategories: ['Rent', 'Utilities', 'Internet', 'Maintenance'],
    isActive: true,
    color: '#8b5cf6',
  },
  {
    id: 'software_licenses',
    name: 'Software Licenses',
    type: 'expense',
    subcategories: ['Adobe Suite', 'Development Tools', 'Cloud Services', 'Security'],
    isActive: true,
    color: '#f59e0b',
  },
  {
    id: 'marketing',
    name: 'Marketing',
    type: 'expense',
    subcategories: ['Digital Ads', 'Content Creation', 'SEO', 'Social Media'],
    isActive: true,
    color: '#ec4899',
  },
  {
    id: 'petty_cash',
    name: 'Petty Cash',
    type: 'expense',
    subcategories: ['Office Supplies', 'Meals', 'Transport', 'Miscellaneous'],
    isActive: true,
    color: '#6b7280',
  },
];

// Mock financial transactions
export const mockFinancialTransactions: FinancialTransaction[] = [
  {
    id: 'txn-1',
    type: 'income',
    category: 'Client Payments',
    subcategory: 'Website Development',
    description: 'Website Redesign - Tech Corp',
    amount: 15000,
    currency: 'USD',
    date: '2024-01-25',
    status: 'admin_approved',
    reference: 'INV-2024-001',
    referenceType: 'client_payment',
    referenceId: 'cp-1',
    approvedBy: 'admin-1',
    approvedAt: '2024-01-26T10:00:00Z',
    createdAt: '2024-01-25T09:00:00Z',
    updatedAt: '2024-01-26T10:00:00Z',
    createdBy: 'gm-1',
  },
  {
    id: 'txn-2',
    type: 'expense',
    category: 'Salaries',
    subcategory: 'Base Salary',
    description: 'January 2024 Salaries',
    amount: -45000,
    currency: 'USD',
    date: '2024-01-31',
    status: 'admin_approved',
    reference: 'PAY-2024-01',
    referenceType: 'salary',
    referenceId: 'sal-1',
    approvedBy: 'admin-1',
    approvedAt: '2024-01-30T14:00:00Z',
    createdAt: '2024-01-29T16:00:00Z',
    updatedAt: '2024-01-30T14:00:00Z',
    createdBy: 'hr-1',
  },
  {
    id: 'txn-3',
    type: 'expense',
    category: 'Office Expenses',
    subcategory: 'Utilities',
    description: 'Monthly office utilities',
    amount: -1200,
    currency: 'USD',
    date: '2024-01-20',
    status: 'gm_approved',
    reference: 'EXP-2024-003',
    referenceType: 'other',
    notes: 'Electricity, water, and internet bills',
    createdAt: '2024-01-20T11:00:00Z',
    updatedAt: '2024-01-21T09:00:00Z',
    createdBy: 'admin-1',
  },
  {
    id: 'txn-4',
    type: 'income',
    category: 'Client Payments',
    subcategory: 'Mobile App',
    description: 'Mobile App Development - StartupXYZ (Partial)',
    amount: 10000,
    currency: 'USD',
    date: '2024-01-22',
    status: 'admin_approved',
    reference: 'INV-2024-002',
    referenceType: 'client_payment',
    referenceId: 'cp-2',
    approvedBy: 'admin-1',
    approvedAt: '2024-01-23T15:00:00Z',
    createdAt: '2024-01-22T10:00:00Z',
    updatedAt: '2024-01-23T15:00:00Z',
    createdBy: 'gm-1',
  },
  {
    id: 'txn-5',
    type: 'expense',
    category: 'Software Licenses',
    subcategory: 'Adobe Suite',
    description: 'Adobe Creative Suite - Annual License',
    amount: -2400,
    currency: 'USD',
    date: '2024-01-15',
    status: 'pending',
    reference: 'EXP-2024-001',
    referenceType: 'other',
    notes: 'Annual subscription renewal',
    createdAt: '2024-01-15T13:00:00Z',
    updatedAt: '2024-01-15T13:00:00Z',
    createdBy: 'admin-1',
  },
];

// Mock client payments
export const mockClientPayments: ClientPayment[] = [
  {
    id: 'cp-1',
    clientId: 'client-1',
    clientName: 'Tech Corp',
    projectId: 'P-001',
    projectName: 'Website Redesign',
    invoiceId: 'INV-2024-001',
    amount: 15000,
    currency: 'USD',
    paymentMethod: 'bank_transfer',
    paymentDate: '2024-01-25',
    status: 'admin_approved',
    reference: 'CP-2024-001',
    notes: 'Full payment received for website redesign project',
    approvedBy: 'admin-1',
    approvedAt: '2024-01-26T10:00:00Z',
    createdAt: '2024-01-25T09:00:00Z',
    updatedAt: '2024-01-26T10:00:00Z',
    createdBy: 'gm-1',
  },
  {
    id: 'cp-2',
    clientId: 'client-2',
    clientName: 'StartupXYZ',
    projectId: 'P-002',
    projectName: 'Mobile App Development',
    invoiceId: 'INV-2024-002',
    amount: 10000,
    currency: 'USD',
    paymentMethod: 'credit_card',
    paymentDate: '2024-01-22',
    status: 'admin_approved',
    reference: 'CP-2024-002',
    notes: 'Partial payment for phase 1 completion',
    approvedBy: 'admin-1',
    approvedAt: '2024-01-23T15:00:00Z',
    createdAt: '2024-01-22T10:00:00Z',
    updatedAt: '2024-01-23T15:00:00Z',
    createdBy: 'gm-1',
  },
  {
    id: 'cp-3',
    clientId: 'client-3',
    clientName: 'Fashion Brand',
    projectId: 'P-003',
    projectName: 'Brand Identity Design',
    invoiceId: 'INV-2024-003',
    amount: 8680,
    currency: 'USD',
    paymentMethod: 'check',
    paymentDate: '2024-01-28',
    status: 'pending',
    reference: 'CP-2024-003',
    notes: 'Payment received via check, awaiting clearance',
    createdAt: '2024-01-28T14:00:00Z',
    updatedAt: '2024-01-28T14:00:00Z',
    createdBy: 'gm-1',
  },
];

// Mock salary records
export const mockSalaryRecords: SalaryRecord[] = [
  {
    id: 'sal-1',
    employeeId: 'emp-1',
    employeeName: 'John Doe',
    payPeriod: 'January 2024',
    baseSalary: 7500,
    overtime: 500,
    bonuses: 1000,
    allowances: 300,
    deductions: 800,
    netSalary: 8500,
    currency: 'USD',
    status: 'admin_approved',
    paymentDate: '2024-01-31',
    reference: 'SAL-2024-01-001',
    notes: 'Regular monthly salary with overtime and bonus',
    approvedBy: 'admin-1',
    approvedAt: '2024-01-30T14:00:00Z',
    createdAt: '2024-01-29T16:00:00Z',
    updatedAt: '2024-01-30T14:00:00Z',
    createdBy: 'hr-1',
  },
  {
    id: 'sal-2',
    employeeId: 'emp-2',
    employeeName: 'Jane Smith',
    payPeriod: 'January 2024',
    baseSalary: 8500,
    overtime: 300,
    bonuses: 1200,
    allowances: 400,
    deductions: 900,
    netSalary: 9500,
    currency: 'USD',
    status: 'admin_approved',
    paymentDate: '2024-01-31',
    reference: 'SAL-2024-01-002',
    notes: 'Monthly salary with performance bonus',
    approvedBy: 'admin-1',
    approvedAt: '2024-01-30T14:00:00Z',
    createdAt: '2024-01-29T16:00:00Z',
    updatedAt: '2024-01-30T14:00:00Z',
    createdBy: 'hr-1',
  },
  {
    id: 'sal-3',
    employeeId: 'emp-3',
    employeeName: 'Mike Johnson',
    payPeriod: 'January 2024',
    baseSalary: 6000,
    overtime: 200,
    bonuses: 800,
    allowances: 250,
    deductions: 700,
    netSalary: 6550,
    currency: 'USD',
    status: 'gm_approved',
    paymentDate: '2024-01-31',
    reference: 'SAL-2024-01-003',
    notes: 'Monthly salary pending admin approval',
    approvedBy: 'gm-1',
    approvedAt: '2024-01-30T10:00:00Z',
    createdAt: '2024-01-29T16:00:00Z',
    updatedAt: '2024-01-30T10:00:00Z',
    createdBy: 'hr-1',
  },
];

// Mock petty cash records
export const mockPettyCash: PettyCash[] = [
  {
    id: 'pc-1',
    employeeId: 'emp-1',
    employeeName: 'John Doe',
    category: 'Office Supplies',
    description: 'Monthly office supplies purchase',
    amount: 150,
    currency: 'USD',
    date: '2024-01-20',
    status: 'admin_approved',
    receiptNumber: 'RCP-001',
    reference: 'PC-2024-001',
    notes: 'Printer paper, pens, notebooks, and other office supplies',
    approvedBy: 'admin-1',
    approvedAt: '2024-01-21T09:00:00Z',
    createdAt: '2024-01-20T15:00:00Z',
    updatedAt: '2024-01-21T09:00:00Z',
    createdBy: 'emp-1',
  },
  {
    id: 'pc-2',
    employeeId: 'emp-2',
    employeeName: 'Jane Smith',
    category: 'Meals',
    description: 'Client lunch meeting expenses',
    amount: 85,
    currency: 'USD',
    date: '2024-01-22',
    status: 'gm_approved',
    receiptNumber: 'RCP-002',
    reference: 'PC-2024-002',
    notes: 'Business lunch with Tech Corp client team',
    approvedBy: 'gm-1',
    approvedAt: '2024-01-23T11:00:00Z',
    createdAt: '2024-01-22T18:00:00Z',
    updatedAt: '2024-01-23T11:00:00Z',
    createdBy: 'emp-2',
  },
  {
    id: 'pc-3',
    employeeId: 'emp-3',
    employeeName: 'Mike Johnson',
    category: 'Transport',
    description: 'Client site visit transportation',
    amount: 45,
    currency: 'USD',
    date: '2024-01-24',
    status: 'pending',
    receiptNumber: 'RCP-003',
    reference: 'PC-2024-003',
    notes: 'Uber rides for client meetings and site visits',
    createdAt: '2024-01-24T16:00:00Z',
    updatedAt: '2024-01-24T16:00:00Z',
    createdBy: 'emp-3',
  },
];

class FinanceService {
  private static instance: FinanceService;
  private transactions: FinancialTransaction[] = [...mockFinancialTransactions];
  private clientPayments: ClientPayment[] = [...mockClientPayments];
  private salaryRecords: SalaryRecord[] = [...mockSalaryRecords];
  private pettyCash: PettyCash[] = [...mockPettyCash];

  static getInstance() {
    if (!FinanceService.instance) {
      FinanceService.instance = new FinanceService();
    }
    return FinanceService.instance;
  }

  // Generate unique IDs
  private generateId(prefix: string): string {
    const items = this.transactions.filter(t => t.id.startsWith(prefix));
    const nextNumber = items.length + 1;
    return `${prefix}-${nextNumber}`;
  }

  // Get all financial transactions
  async getFinancialTransactions(): Promise<FinancialTransaction[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.transactions];
  }

  // Get transaction by ID
  async getTransactionById(id: string): Promise<FinancialTransaction | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.transactions.find(t => t.id === id) || null;
  }

  // Create new transaction
  async createTransaction(data: Partial<FinancialTransaction>, createdBy: string): Promise<FinancialTransaction> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newTransaction: FinancialTransaction = {
      id: this.generateId('txn'),
      type: data.type || 'expense',
      category: data.category || '',
      subcategory: data.subcategory || '',
      description: data.description || '',
      amount: data.amount || 0,
      currency: data.currency || 'USD',
      date: data.date || new Date().toISOString().split('T')[0],
      status: 'pending',
      reference: data.reference || '',
      referenceType: data.referenceType || 'other',
      referenceId: data.referenceId,
      notes: data.notes,
      attachments: data.attachments,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy,
    };

    this.transactions.push(newTransaction);
    return newTransaction;
  }

  // Update transaction
  async updateTransaction(id: string, data: Partial<FinancialTransaction>): Promise<FinancialTransaction> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const transactionIndex = this.transactions.findIndex(t => t.id === id);
    if (transactionIndex === -1) {
      throw new Error('Transaction not found');
    }

    const updatedTransaction = { ...this.transactions[transactionIndex], ...data };
    updatedTransaction.updatedAt = new Date().toISOString();

    this.transactions[transactionIndex] = updatedTransaction;
    return updatedTransaction;
  }

  // Delete transaction
  async deleteTransaction(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const transactionIndex = this.transactions.findIndex(t => t.id === id);
    if (transactionIndex === -1) {
      throw new Error('Transaction not found');
    }

    this.transactions.splice(transactionIndex, 1);
  }

  // Get client payments
  async getClientPayments(): Promise<ClientPayment[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.clientPayments];
  }

  // Create client payment
  async createClientPayment(data: Partial<ClientPayment>, createdBy: string): Promise<ClientPayment> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newPayment: ClientPayment = {
      id: this.generateId('cp'),
      clientId: data.clientId || '',
      clientName: data.clientName || '',
      projectId: data.projectId || '',
      projectName: data.projectName || '',
      invoiceId: data.invoiceId,
      amount: data.amount || 0,
      currency: data.currency || 'USD',
      paymentMethod: data.paymentMethod || 'bank_transfer',
      paymentDate: data.paymentDate || new Date().toISOString().split('T')[0],
      status: 'pending',
      reference: data.reference || '',
      notes: data.notes,
      attachments: data.attachments,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy,
    };

    this.clientPayments.push(newPayment);
    return newPayment;
  }

  // Get salary records
  async getSalaryRecords(): Promise<SalaryRecord[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.salaryRecords];
  }

  // Create salary record
  async createSalaryRecord(data: Partial<SalaryRecord>, createdBy: string): Promise<SalaryRecord> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newSalary: SalaryRecord = {
      id: this.generateId('sal'),
      employeeId: data.employeeId || '',
      employeeName: data.employeeName || '',
      payPeriod: data.payPeriod || '',
      baseSalary: data.baseSalary || 0,
      overtime: data.overtime || 0,
      bonuses: data.bonuses || 0,
      allowances: data.allowances || 0,
      deductions: data.deductions || 0,
      netSalary: (data.baseSalary || 0) + (data.overtime || 0) + (data.bonuses || 0) + (data.allowances || 0) - (data.deductions || 0),
      currency: data.currency || 'USD',
      status: 'pending',
      paymentDate: data.paymentDate || '',
      reference: data.reference || '',
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy,
    };

    this.salaryRecords.push(newSalary);
    return newSalary;
  }

  // Get petty cash records
  async getPettyCash(): Promise<PettyCash[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.pettyCash];
  }

  // Create petty cash record
  async createPettyCash(data: Partial<PettyCash>, createdBy: string): Promise<PettyCash> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newPettyCash: PettyCash = {
      id: this.generateId('pc'),
      employeeId: data.employeeId || '',
      employeeName: data.employeeName || '',
      category: data.category || '',
      description: data.description || '',
      amount: data.amount || 0,
      currency: data.currency || 'USD',
      date: data.date || new Date().toISOString().split('T')[0],
      status: 'pending',
      receiptNumber: data.receiptNumber,
      reference: data.reference || '',
      notes: data.notes,
      attachments: data.attachments,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy,
    };

    this.pettyCash.push(newPettyCash);
    return newPettyCash;
  }

  // GM Approval
  async approveByGM(transactionId: string, gmId: string): Promise<FinancialTransaction> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const transactionIndex = this.transactions.findIndex(t => t.id === transactionId);
    if (transactionIndex === -1) {
      throw new Error('Transaction not found');
    }

    const updatedTransaction = { ...this.transactions[transactionIndex] };
    updatedTransaction.status = 'gm_approved';
    updatedTransaction.approvedBy = gmId;
    updatedTransaction.approvedAt = new Date().toISOString();
    updatedTransaction.updatedAt = new Date().toISOString();

    this.transactions[transactionIndex] = updatedTransaction;
    return updatedTransaction;
  }

  // Admin Approval
  async approveByAdmin(transactionId: string, adminId: string): Promise<FinancialTransaction> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const transactionIndex = this.transactions.findIndex(t => t.id === transactionId);
    if (transactionIndex === -1) {
      throw new Error('Transaction not found');
    }

    const updatedTransaction = { ...this.transactions[transactionIndex] };
    updatedTransaction.status = 'admin_approved';
    updatedTransaction.approvedBy = adminId;
    updatedTransaction.approvedAt = new Date().toISOString();
    updatedTransaction.updatedAt = new Date().toISOString();

    this.transactions[transactionIndex] = updatedTransaction;
    return updatedTransaction;
  }

  // Reject transaction
  async rejectTransaction(transactionId: string, rejectedBy: string, reason: string): Promise<FinancialTransaction> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const transactionIndex = this.transactions.findIndex(t => t.id === transactionId);
    if (transactionIndex === -1) {
      throw new Error('Transaction not found');
    }

    const updatedTransaction = { ...this.transactions[transactionIndex] };
    updatedTransaction.status = 'rejected';
    updatedTransaction.rejectedBy = rejectedBy;
    updatedTransaction.rejectedAt = new Date().toISOString();
    updatedTransaction.rejectionReason = reason;
    updatedTransaction.updatedAt = new Date().toISOString();

    this.transactions[transactionIndex] = updatedTransaction;
    return updatedTransaction;
  }

  // Get finance statistics
  async getFinanceStats(): Promise<FinanceStats> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const totalIncome = this.transactions
      .filter(t => t.type === 'income' && t.status === 'admin_approved')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpenses = Math.abs(this.transactions
      .filter(t => t.type === 'expense' && t.status === 'admin_approved')
      .reduce((sum, t) => sum + t.amount, 0));
      
    const netProfit = totalIncome - totalExpenses;
    
    const pendingApprovals = this.transactions.filter(t => t.status === 'pending').length;
    const gmApproved = this.transactions.filter(t => t.status === 'gm_approved').length;
    const adminApproved = this.transactions.filter(t => t.status === 'admin_approved').length;
    const rejected = this.transactions.filter(t => t.status === 'rejected').length;

    // Calculate monthly figures (simplified)
    const currentMonth = new Date().getMonth();
    const monthlyTransactions = this.transactions.filter(t => 
      new Date(t.date).getMonth() === currentMonth && t.status === 'admin_approved'
    );
    
    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const monthlyExpenses = Math.abs(monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0));
      
    const monthlyProfit = monthlyIncome - monthlyExpenses;

    return {
      totalIncome,
      totalExpenses,
      netProfit,
      pendingApprovals,
      gmApproved,
      adminApproved,
      rejected,
      monthlyIncome,
      monthlyExpenses,
      monthlyProfit,
      incomeGrowth: 12, // Mock growth percentages
      expenseGrowth: 5,
      profitGrowth: 18,
    };
  }

  // Get approval requests
  async getApprovalRequests(): Promise<ApprovalRequest[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const pendingTransactions = this.transactions.filter(t => 
      t.status === 'pending' || t.status === 'gm_approved'
    );
    
    return pendingTransactions.map(t => ({
      id: `ar-${t.id}`,
      transactionId: t.id,
      transactionType: t.referenceType as any,
      amount: t.amount,
      description: t.description,
      requestedBy: t.createdBy,
      requestedAt: t.createdAt,
      currentStatus: t.status,
      requiresAdminApproval: t.status === 'gm_approved',
      gmApprovedAt: t.status === 'gm_approved' ? t.approvedAt : undefined,
      adminApprovedAt: t.status === 'admin_approved' ? t.approvedAt : undefined,
    }));
  }

  // Get transaction categories
  async getTransactionCategories(): Promise<TransactionCategory[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [...mockTransactionCategories];
  }
}

export const financeService = FinanceService.getInstance();
