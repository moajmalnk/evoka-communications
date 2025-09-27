import { useState, useEffect, useCallback } from 'react';
import { Plus, Filter, Search, MoreHorizontal, Calendar, IndianRupee, FileText, Download, Eye, Edit, Trash2, CreditCard, AlertTriangle, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Invoice, InvoiceStatus, InvoiceFormData } from '@/types/invoice';
import { invoiceService, mockClients } from '@/lib/invoiceService';
import { mockProjects } from '@/lib/projectService';
import { InvoiceCreateModal } from '@/components/invoices/InvoiceCreateModal';
import { InvoiceEditModal } from '@/components/invoices/InvoiceEditModal';
import { InvoiceDetailsModal } from '@/components/invoices/InvoiceDetailsModal';
import { InvoiceStats } from '@/components/invoices/InvoiceStats';
import { useToast } from '@/hooks/use-toast';
import { CustomClock } from '@/components/ui/custom-clock';
import { CustomCalendar } from '@/components/ui/custom-calendar';

export function Invoicing() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    pending: 0,
    paid: 0,
    partiallyPaid: 0,
    overdue: 0,
    cancelled: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    collectionRate: 0,
  });
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const loadInvoices = useCallback(async () => {
    try {
      setIsLoading(true);
      const [invoicesData, statsData] = await Promise.all([
        invoiceService.getInvoices(),
        invoiceService.getInvoiceStats(),
      ]);
      
      setInvoices(invoicesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast({
        title: 'Error',
        description: 'Failed to load invoices. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const filterInvoices = useCallback(() => {
    let filtered = invoices;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(invoice => 
        invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.projectName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }

    // Client filter
    if (clientFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.clientId === clientFilter);
    }

    // Project filter
    if (projectFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.projectId === projectFilter);
    }

    setFilteredInvoices(filtered);
  }, [invoices, searchTerm, statusFilter, clientFilter, projectFilter]);

  // Load invoices on component mount
  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  // Filter invoices when filters change
  useEffect(() => {
    filterInvoices();
  }, [filterInvoices]);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setClientFilter('all');
    setProjectFilter('all');
  };

  const handleCreateInvoice = async (data: InvoiceFormData) => {
    try {
      setIsCreating(true);
      const newInvoice = await invoiceService.createInvoice(data, user?.id || '');
      
      // Refresh invoices list
      await loadInvoices();
      
      toast({
        title: 'Success',
        description: `Invoice "${newInvoice.id}" created successfully!`,
      });
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to create invoice. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleRecordPayment = async (invoiceId: string, amount: number) => {
    try {
      await invoiceService.recordPayment(invoiceId, amount);
      await loadInvoices();
      
      toast({
        title: 'Success',
        description: `Payment of ₹${amount.toLocaleString()} recorded successfully!`,
      });
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to record payment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailsModalOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsEditModalOpen(true);
  };

  const handleUpdateInvoice = async (id: string, data: Partial<InvoiceFormData>) => {
    try {
      await invoiceService.updateInvoice(id, data);
      await loadInvoices();
      
      toast({
        title: 'Success',
        description: 'Invoice updated successfully!',
      });
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to update invoice. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      await invoiceService.deleteInvoice(invoiceId);
      await loadInvoices();
      
      toast({
        title: 'Success',
        description: 'Invoice deleted successfully!',
      });
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete invoice. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const canCreateInvoice = user?.role === 'admin' || user?.role === 'general_manager';
  const canEditInvoice = user?.role === 'admin' || user?.role === 'general_manager';
  const canDeleteInvoice = user?.role === 'admin' || user?.role === 'general_manager';

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
        return 'text-white';
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

  const isOverdue = (dueDate: string, status: InvoiceStatus) => {
    return new Date(dueDate) < new Date() && status !== 'paid' && status !== 'cancelled';
  };

  // Skeleton loading components
  const InvoiceTableSkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  {/* <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  const InvoiceCardSkeleton = () => (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-48" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const FiltersSkeleton = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-16" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-20" />
        </div>
      </CardContent>
    </Card>
  );

  const StatsSkeleton = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          {canCreateInvoice && (
            <Skeleton className="h-10 w-32" />
          )}
        </div>

        {/* Stats Skeleton */}
        <StatsSkeleton />

        {/* Tabs Skeleton */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <FiltersSkeleton />
            <InvoiceTableSkeleton />
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <InvoiceCardSkeleton key={index} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overdue" className="space-y-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <InvoiceCardSkeleton key={index} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="paid" className="space-y-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-28 mb-2" />
                <Skeleton className="h-4 w-40" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <InvoiceCardSkeleton key={index} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoicing & Billing</h1>
          <p className="text-muted-foreground">
            Manage client invoices and track payments
          </p>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          
          <div className="flex flex-col gap-2 md:flex-row">
            {canCreateInvoice && (
              <Button 
                className="bg-gradient-primary shadow-primary"
                onClick={() => setIsCreateModalOpen(true)}
                disabled={isCreating}
              >
                <Plus className="mr-2 h-4 w-4" />
                {isCreating ? 'Creating...' : 'New Invoice'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Statistics */}
      <InvoiceStats stats={stats} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search invoices, clients, or projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="partially_paid">Partially Paid</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={clientFilter} onValueChange={setClientFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    {mockClients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {mockProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="w-full md:w-auto"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Invoices Table */}
          <Card>
            <CardHeader>
              <CardTitle>Invoices ({filteredInvoices.length})</CardTitle>
              <CardDescription>
                Complete list of client invoices and their payment status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow 
                        key={invoice.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleViewInvoice(invoice)}
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium">{invoice.id}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(invoice.dateIssued).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{invoice.clientName}</TableCell>
                        <TableCell>{invoice.projectName}</TableCell>
                        <TableCell>
                          <div className="font-medium">₹{invoice.totalAmount.toLocaleString()}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">₹{invoice.paidAmount.toLocaleString()}</div>
                          {invoice.paidAmount < invoice.totalAmount && (
                            <div className="text-sm text-muted-foreground">
                              ₹{(invoice.totalAmount - invoice.paidAmount).toLocaleString()} remaining
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={getStatusVariant(invoice.status)}
                            className={getStatusColor(invoice.status)}
                          >
                            {getStatusLabel(invoice.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CustomCalendar 
                              date={new Date(invoice.dueDate)} 
                              variant="compact" 
                              format="short"
                              showIcon={false}
                              className={isOverdue(invoice.dueDate, invoice.status) ? 'text-destructive font-medium' : ''}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredInvoices.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No invoices found matching your criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search invoices, clients, or projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="partially_paid">Partially Paid</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={clientFilter} onValueChange={setClientFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    {mockClients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {mockProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="w-full md:w-auto"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pending Invoices Table */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Invoices ({invoices.filter(inv => inv.status === 'pending').length})</CardTitle>
              <CardDescription>
                Invoices awaiting payment from clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices
                      .filter(inv => inv.status === 'pending')
                      .map((invoice) => (
                        <TableRow 
                          key={invoice.id} 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleViewInvoice(invoice)}
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium">{invoice.id}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(invoice.dateIssued).toLocaleDateString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{invoice.clientName}</TableCell>
                          <TableCell>{invoice.projectName}</TableCell>
                          <TableCell>
                            <div className="font-medium">₹{invoice.totalAmount.toLocaleString()}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">₹{invoice.paidAmount.toLocaleString()}</div>
                            {invoice.paidAmount < invoice.totalAmount && (
                              <div className="text-sm text-muted-foreground">
                                ₹{(invoice.totalAmount - invoice.paidAmount).toLocaleString()} remaining
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CustomCalendar 
                                date={new Date(invoice.dueDate)} 
                                variant="compact" 
                                format="short"
                                showIcon={false}
                                className={isOverdue(invoice.dueDate, invoice.status) ? 'text-destructive font-medium' : ''}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>

              {invoices.filter(inv => inv.status === 'pending').length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No pending invoices found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search invoices, clients, or projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="partially_paid">Partially Paid</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={clientFilter} onValueChange={setClientFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    {mockClients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {mockProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="w-full md:w-auto"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Overdue Invoices Table */}
          <Card>
            <CardHeader>
              <CardTitle>Overdue Invoices ({invoices.filter(inv => inv.status === 'overdue').length})</CardTitle>
              <CardDescription>
                Invoices past their due date requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices
                      .filter(inv => inv.status === 'overdue')
                      .map((invoice) => (
                        <TableRow 
                          key={invoice.id} 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleViewInvoice(invoice)}
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium">{invoice.id}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(invoice.dateIssued).toLocaleDateString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{invoice.clientName}</TableCell>
                          <TableCell>{invoice.projectName}</TableCell>
                          <TableCell>
                            <div className="font-medium">₹{invoice.totalAmount.toLocaleString()}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">₹{invoice.paidAmount.toLocaleString()}</div>
                            {invoice.paidAmount < invoice.totalAmount && (
                              <div className="text-sm text-muted-foreground">
                                ₹{(invoice.totalAmount - invoice.paidAmount).toLocaleString()} remaining
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CustomCalendar 
                                date={new Date(invoice.dueDate)} 
                                variant="compact" 
                                format="short"
                                showIcon={false}
                                className={isOverdue(invoice.dueDate, invoice.status) ? 'text-destructive font-medium' : ''}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>

              {invoices.filter(inv => inv.status === 'overdue').length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No overdue invoices found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paid" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search invoices, clients, or projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="partially_paid">Partially Paid</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={clientFilter} onValueChange={setClientFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    {mockClients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {mockProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="w-full md:w-auto"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Paid Invoices Table */}
          <Card>
            <CardHeader>
              <CardTitle>Paid Invoices ({invoices.filter(inv => inv.status === 'paid').length})</CardTitle>
              <CardDescription>
                Successfully paid invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices
                      .filter(inv => inv.status === 'paid')
                      .map((invoice) => (
                        <TableRow 
                          key={invoice.id} 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleViewInvoice(invoice)}
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium">{invoice.id}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(invoice.dateIssued).toLocaleDateString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{invoice.clientName}</TableCell>
                          <TableCell>{invoice.projectName}</TableCell>
                          <TableCell>
                            <div className="font-medium">₹{invoice.totalAmount.toLocaleString()}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">₹{invoice.paidAmount.toLocaleString()}</div>
                            {invoice.paidAmount < invoice.totalAmount && (
                              <div className="text-sm text-muted-foreground">
                                ₹{(invoice.totalAmount - invoice.paidAmount).toLocaleString()} remaining
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CustomCalendar 
                                date={new Date(invoice.dueDate)} 
                                variant="compact" 
                                format="short"
                                showIcon={false}
                                className={isOverdue(invoice.dueDate, invoice.status) ? 'text-destructive font-medium' : ''}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>

              {invoices.filter(inv => inv.status === 'paid').length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No paid invoices found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invoice Creation Modal */}
      <InvoiceCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateInvoice}
      />

      {/* Invoice Edit Modal */}
      <InvoiceEditModal
        invoice={selectedInvoice}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedInvoice(null);
        }}
        onSubmit={handleUpdateInvoice}
      />

      {/* Invoice Details Modal */}
      <InvoiceDetailsModal
        invoice={selectedInvoice}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedInvoice(null);
        }}
        onEdit={handleEditInvoice}
        onDelete={handleDeleteInvoice}
        onRecordPayment={handleRecordPayment}
      />
    </div>
  );
}