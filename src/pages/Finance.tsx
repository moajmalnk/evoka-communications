import { useState, useEffect } from 'react';
import { DollarSign, Plus, Filter, Search, MoreHorizontal, Eye, Edit, Trash2, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown, FileText, Building2, User, Receipt } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { FinancialTransaction, TransactionStatus, ClientPayment, SalaryRecord, PettyCash } from '@/types/finance';
import { financeService, mockTransactionCategories } from '@/lib/financeService';
import { FinanceStats } from '@/components/finance/FinanceStats';
import { ClientPaymentModal } from '@/components/finance/ClientPaymentModal';
import { SalaryRecordModal } from '@/components/finance/SalaryRecordModal';
import { PettyCashModal } from '@/components/finance/PettyCashModal';
import { useToast } from '@/hooks/use-toast';

export function Finance() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<FinancialTransaction[]>([]);
  const [clientPayments, setClientPayments] = useState<ClientPayment[]>([]);
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [pettyCash, setPettyCash] = useState<PettyCash[]>([]);
  const [stats, setStats] = useState({
    totalIncome: 0, totalExpenses: 0, netProfit: 0, pendingApprovals: 0,
    gmApproved: 0, adminApproved: 0, rejected: 0, monthlyIncome: 0,
    monthlyExpenses: 0, monthlyProfit: 0, incomeGrowth: 0, expenseGrowth: 0, profitGrowth: 0
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  const [isClientPaymentModalOpen, setIsClientPaymentModalOpen] = useState(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [isPettyCashModalOpen, setIsPettyCashModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadData(); }, []);
  useEffect(() => { filterTransactions(); }, [transactions, searchTerm, typeFilter, categoryFilter, statusFilter, dateRange]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [transactionsData, clientPaymentsData, salaryData, pettyCashData, statsData] = await Promise.all([
        financeService.getFinancialTransactions(),
        financeService.getClientPayments(),
        financeService.getSalaryRecords(),
        financeService.getPettyCash(),
        financeService.getFinanceStats(),
      ]);
      
      setTransactions(transactionsData);
      setClientPayments(clientPaymentsData);
      setSalaryRecords(salaryData);
      setPettyCash(pettyCashData);
      setStats(statsData);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load financial data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;
    if (typeFilter !== 'all') filtered = filtered.filter(t => t.type === typeFilter);
    if (categoryFilter !== 'all') filtered = filtered.filter(t => t.category === categoryFilter);
    if (statusFilter !== 'all') filtered = filtered.filter(t => t.status === statusFilter);
    if (dateRange.start) filtered = filtered.filter(t => new Date(t.date) >= new Date(dateRange.start));
    if (dateRange.end) filtered = filtered.filter(t => new Date(t.date) <= new Date(dateRange.end));
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.reference.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredTransactions(filtered);
  };

  const handleClientPaymentSubmit = async (data: any) => {
    try {
      await financeService.createClientPayment(data, user?.id || '');
      toast({ title: 'Success', description: 'Client payment recorded successfully!' });
      await loadData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save client payment', variant: 'destructive' });
    }
  };

  const handleSalarySubmit = async (data: any) => {
    try {
      await financeService.createSalaryRecord(data, user?.id || '');
      toast({ title: 'Success', description: 'Salary record created successfully!' });
      await loadData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save salary record', variant: 'destructive' });
    }
  };

  const handlePettyCashSubmit = async (data: any) => {
    try {
      await financeService.createPettyCash(data, user?.id || '');
      toast({ title: 'Success', description: 'Petty cash expense recorded successfully!' });
      await loadData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save petty cash record', variant: 'destructive' });
    }
  };

  const handleApproveByGM = async (transactionId: string) => {
    try {
      await financeService.approveByGM(transactionId, user?.id || '');
      await loadData();
      toast({ title: 'Success', description: 'Transaction approved by GM successfully!' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to approve transaction', variant: 'destructive' });
    }
  };

  const handleApproveByAdmin = async (transactionId: string) => {
    try {
      await financeService.approveByAdmin(transactionId, user?.id || '');
      await loadData();
      toast({ title: 'Success', description: 'Transaction approved by Admin successfully!' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to approve transaction', variant: 'destructive' });
    }
  };

  const handleRejectTransaction = async (transactionId: string, reason: string) => {
    try {
      await financeService.rejectTransaction(transactionId, user?.id || '', reason);
      await loadData();
      toast({ title: 'Success', description: 'Transaction rejected successfully!' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to reject transaction', variant: 'destructive' });
    }
  };

  const canManageFinance = user?.role === 'admin' || user?.role === 'general_manager';
  const canApproveByGM = user?.role === 'general_manager';
  const canApproveByAdmin = user?.role === 'admin';
  const canReject = user?.role === 'admin' || user?.role === 'general_manager';

  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'gm_approved': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'admin_approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: TransactionStatus) => {
    switch (status) {
      case 'pending': return 'outline';
      case 'gm_approved': return 'secondary';
      case 'admin_approved': return 'default';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'gm_approved': return 'text-blue-600';
      case 'admin_approved': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusLabel = (status: TransactionStatus) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'gm_approved': return 'GM Approved';
      case 'admin_approved': return 'Admin Approved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Management</h1>
            <p className="text-muted-foreground">Manage financial transactions and company expenses</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Management</h1>
          <p className="text-muted-foreground">Manage financial transactions, client payments, and company expenses</p>
        </div>
        {canManageFinance && (
          <div className="flex flex-col gap-2 md:flex-row">
            <Button variant="outline" onClick={() => { setSelectedItem(null); setModalMode('create'); setIsClientPaymentModalOpen(true); }}>
              <DollarSign className="mr-2 h-4 w-4" />Record Payment
            </Button>
            <Button variant="outline" onClick={() => { setSelectedItem(null); setModalMode('create'); setIsSalaryModalOpen(true); }}>
              <User className="mr-2 h-4 w-4" />Create Salary
            </Button>
            <Button onClick={() => { setSelectedItem(null); setModalMode('create'); setIsPettyCashModalOpen(true); }} className="bg-gradient-primary shadow-primary">
              <Receipt className="mr-2 h-4 w-4" />Record Expense
            </Button>
          </div>
        )}
      </div>

      {/* Financial Statistics */}
      <FinanceStats stats={stats} />

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="client_payments">Client Payments</TabsTrigger>
          <TabsTrigger value="salaries">Salary Records</TabsTrigger>
          <TabsTrigger value="petty_cash">Petty Cash</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Filter className="h-5 w-5" />Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger><SelectValue placeholder="All Categories" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {mockTransactionCategories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger><SelectValue placeholder="All Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="gm_approved">GM Approved</SelectItem>
                      <SelectItem value="admin_approved">Admin Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search transactions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History ({filteredTransactions.length})</CardTitle>
              <CardDescription>All financial transactions with approval status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {transaction.type === 'income' ? 
                              <TrendingUp className="h-4 w-4 text-green-600" /> : 
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            }
                            <Badge variant="outline" className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                              {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{transaction.category}</div>
                            <div className="text-sm text-muted-foreground">{transaction.subcategory}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-medium">{transaction.description}</div>
                            <div className="text-sm text-muted-foreground">{transaction.reference}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            ${Math.abs(transaction.amount).toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{new Date(transaction.date).toLocaleDateString()}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(transaction.status)}
                            <Badge variant={getStatusVariant(transaction.status)} className={getStatusColor(transaction.status)}>
                              {getStatusLabel(transaction.status)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />View Details</DropdownMenuItem>
                              {transaction.status === 'pending' && canApproveByGM && (
                                <DropdownMenuItem onClick={() => handleApproveByGM(transaction.id)}>
                                  <CheckCircle className="mr-2 h-4 w-4" />Approve (GM)
                                </DropdownMenuItem>
                              )}
                              {transaction.status === 'gm_approved' && canApproveByAdmin && (
                                <DropdownMenuItem onClick={() => handleApproveByAdmin(transaction.id)}>
                                  <CheckCircle className="mr-2 h-4 w-4" />Approve (Admin)
                                </DropdownMenuItem>
                              )}
                              {canReject && transaction.status !== 'rejected' && (
                                <DropdownMenuItem className="text-destructive" onClick={() => handleRejectTransaction(transaction.id, 'Rejected by user')}>
                                  <XCircle className="mr-2 h-4 w-4" />Reject
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {filteredTransactions.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No transactions found for the selected criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="client_payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Payments ({clientPayments.length})</CardTitle>
              <CardDescription>Track all client payments received</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientPayments.map((payment) => (
                      <TableRow key={payment.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                                {payment.clientName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{payment.clientName}</div>
                              <div className="text-sm text-muted-foreground">{payment.projectName}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {payment.projectName}
                            {payment.invoiceId && <div className="text-muted-foreground">Invoice: {payment.invoiceId}</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-green-600">${payment.amount.toLocaleString()}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{payment.paymentMethod.replace('_', ' ')}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{new Date(payment.paymentDate).toLocaleDateString()}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(payment.status)}
                            <Badge variant={getStatusVariant(payment.status)} className={getStatusColor(payment.status)}>
                              {getStatusLabel(payment.status)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />View Details</DropdownMenuItem>
                              {canManageFinance && (
                                <DropdownMenuItem onClick={() => { setSelectedItem(payment); setModalMode('edit'); setIsClientPaymentModalOpen(true); }}>
                                  <Edit className="mr-2 h-4 w-4" />Edit Payment
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salaries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Salary Records ({salaryRecords.length})</CardTitle>
              <CardDescription>Track employee salary payments and records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Pay Period</TableHead>
                      <TableHead>Base Salary</TableHead>
                      <TableHead>Net Salary</TableHead>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salaryRecords.map((salary) => (
                      <TableRow key={salary.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                                {salary.employeeName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="font-medium">{salary.employeeName}</div>
                          </div>
                        </TableCell>
                        <TableCell><div className="text-sm">{salary.payPeriod}</div></TableCell>
                        <TableCell><div className="font-medium">${salary.baseSalary.toLocaleString()}</div></TableCell>
                        <TableCell><div className="font-bold text-green-600">${salary.netSalary.toLocaleString()}</div></TableCell>
                        <TableCell><div className="text-sm">{new Date(salary.paymentDate).toLocaleDateString()}</div></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(salary.status)}
                            <Badge variant={getStatusVariant(salary.status)} className={getStatusColor(salary.status)}>
                              {getStatusLabel(salary.status)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />View Details</DropdownMenuItem>
                              {canManageFinance && (
                                <DropdownMenuItem onClick={() => { setSelectedItem(salary); setModalMode('edit'); setIsSalaryModalOpen(true); }}>
                                  <Edit className="mr-2 h-4 w-4" />Edit Record
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="petty_cash" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Petty Cash Records ({pettyCash.length})</CardTitle>
              <CardDescription>Track petty cash expenses and reimbursements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pettyCash.map((expense) => (
                      <TableRow key={expense.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                                {expense.employeeName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="font-medium">{expense.employeeName}</div>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline">{expense.category}</Badge></TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-medium">{expense.description}</div>
                            {expense.receiptNumber && <div className="text-sm text-muted-foreground">Receipt: {expense.receiptNumber}</div>}
                          </div>
                        </TableCell>
                        <TableCell><div className="font-bold text-red-600">${expense.amount.toLocaleString()}</div></TableCell>
                        <TableCell><div className="text-sm">{new Date(expense.date).toLocaleDateString()}</div></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(expense.status)}
                            <Badge variant={getStatusVariant(expense.status)} className={getStatusColor(expense.status)}>
                              {getStatusLabel(expense.status)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />View Details</DropdownMenuItem>
                              {canManageFinance && (
                                <DropdownMenuItem onClick={() => { setSelectedItem(expense); setModalMode('edit'); setIsPettyCashModalOpen(true); }}>
                                  <Edit className="mr-2 h-4 w-4" />Edit Record
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ClientPaymentModal
        isOpen={isClientPaymentModalOpen}
        onClose={() => { setIsClientPaymentModalOpen(false); setSelectedItem(null); }}
        onSubmit={handleClientPaymentSubmit}
        payment={selectedItem}
        mode={modalMode}
      />

      <SalaryRecordModal
        isOpen={isSalaryModalOpen}
        onClose={() => { setIsSalaryModalOpen(false); setSelectedItem(null); }}
        onSubmit={handleSalarySubmit}
        salary={selectedItem}
        mode={modalMode}
      />

      <PettyCashModal
        isOpen={isPettyCashModalOpen}
        onClose={() => { setIsPettyCashModalOpen(false); setSelectedItem(null); }}
        onSubmit={handlePettyCashSubmit}
        pettyCash={selectedItem}
        mode={modalMode}
      />
    </div>
  );
}