export interface FinancialTransaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  subcategory: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  status: TransactionStatus;
  reference: string;
  referenceType: 'client_payment' | 'salary' | 'petty_cash' | 'other';
  referenceId?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export type TransactionStatus = 'pending' | 'gm_approved' | 'admin_approved' | 'rejected';

export interface ClientPayment {
  id: string;
  clientId: string;
  clientName: string;
  projectId: string;
  projectName: string;
  invoiceId?: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  status: TransactionStatus;
  reference: string;
  notes?: string;
  attachments?: string[];
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export type PaymentMethod = 'bank_transfer' | 'credit_card' | 'cash' | 'check' | 'paypal' | 'other';

export interface SalaryRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  payPeriod: string;
  baseSalary: number;
  overtime: number;
  bonuses: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  currency: string;
  status: TransactionStatus;
  paymentDate: string;
  reference: string;
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface PettyCash {
  id: string;
  employeeId: string;
  employeeName: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  status: TransactionStatus;
  receiptNumber?: string;
  reference: string;
  notes?: string;
  attachments?: string[];
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface TransactionCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  subcategories: string[];
  isActive: boolean;
  color: string;
}

export interface TransactionFilters {
  searchTerm: string;
  type: string;
  category: string;
  subcategory: string;
  status: string;
  dateRange: {
    start: string;
    end: string;
  };
  amountRange: {
    min: number;
    max: number;
  };
}

export interface FinanceStats {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  pendingApprovals: number;
  gmApproved: number;
  adminApproved: number;
  rejected: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  incomeGrowth: number;
  expenseGrowth: number;
  profitGrowth: number;
}

export interface ApprovalRequest {
  id: string;
  transactionId: string;
  transactionType: 'client_payment' | 'salary' | 'petty_cash';
  amount: number;
  description: string;
  requestedBy: string;
  requestedAt: string;
  currentStatus: TransactionStatus;
  requiresAdminApproval: boolean;
  gmApprovedAt?: string;
  adminApprovedAt?: string;
}
