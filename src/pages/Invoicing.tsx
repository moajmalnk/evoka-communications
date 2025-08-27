import { useState } from 'react';
import { Plus, Search, MoreHorizontal, Calendar, DollarSign, FileText, Download } from 'lucide-react';
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

// Mock invoice data
const mockInvoices = [
  {
    id: 'INV-2024-001',
    clientName: 'Tech Corp',
    projectName: 'Website Redesign',
    dateIssued: '2024-01-15',
    dueDate: '2024-02-15',
    totalAmount: 15000,
    paidAmount: 15000,
    status: 'Paid',
    items: [
      { description: 'UI/UX Design', quantity: 80, unitPrice: 100 },
      { description: 'Frontend Development', quantity: 70, unitPrice: 100 },
    ],
  },
  {
    id: 'INV-2024-002',
    clientName: 'StartupXYZ',
    projectName: 'Mobile App Development',
    dateIssued: '2024-01-20',
    dueDate: '2024-02-20',
    totalAmount: 25000,
    paidAmount: 10000,
    status: 'Partially Paid',
    items: [
      { description: 'Mobile App Development', quantity: 200, unitPrice: 120 },
      { description: 'API Integration', quantity: 25, unitPrice: 80 },
    ],
  },
  {
    id: 'INV-2024-003',
    clientName: 'Fashion Brand',
    projectName: 'Brand Identity Design',
    dateIssued: '2024-01-25',
    dueDate: '2024-02-25',
    totalAmount: 8000,
    paidAmount: 0,
    status: 'Pending',
    items: [
      { description: 'Logo Design', quantity: 40, unitPrice: 100 },
      { description: 'Brand Guidelines', quantity: 40, unitPrice: 100 },
    ],
  },
  {
    id: 'INV-2024-004',
    clientName: 'Local Business',
    projectName: 'Marketing Campaign',
    dateIssued: '2023-12-15',
    dueDate: '2024-01-15',
    totalAmount: 5000,
    paidAmount: 0,
    status: 'Overdue',
    items: [
      { description: 'Content Creation', quantity: 30, unitPrice: 100 },
      { description: 'Social Media Management', quantity: 20, unitPrice: 100 },
    ],
  },
];

const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'default';
    case 'partially paid':
      return 'secondary';
    case 'pending':
      return 'outline';
    case 'overdue':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'text-success';
    case 'partially paid':
      return 'text-warning';
    case 'pending':
      return 'text-blue-600';
    case 'overdue':
      return 'text-destructive';
    default:
      return 'text-muted-foreground';
  }
};

export function Invoicing() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredInvoices = mockInvoices.filter(invoice => {
    const matchesSearch = invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status.toLowerCase() === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = mockInvoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0);
  const pendingAmount = mockInvoices.reduce((sum, invoice) => sum + (invoice.totalAmount - invoice.paidAmount), 0);

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
        <div className="flex flex-col gap-2 md:flex-row">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button className="bg-gradient-primary shadow-primary">
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {mockInvoices.filter(i => i.status !== 'Paid').length} invoices
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$38,000</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <FileText className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {mockInvoices.filter(i => i.status === 'Overdue').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
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
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partially paid">Partially Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
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
                  <TableRow key={invoice.id} className="cursor-pointer hover:bg-muted/50">
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
                      <div className="font-medium">${invoice.totalAmount.toLocaleString()}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${invoice.paidAmount.toLocaleString()}</div>
                      {invoice.paidAmount < invoice.totalAmount && (
                        <div className="text-sm text-muted-foreground">
                          ${(invoice.totalAmount - invoice.paidAmount).toLocaleString()} remaining
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={getStatusVariant(invoice.status)}
                        className={getStatusColor(invoice.status)}
                      >
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className={invoice.status === 'Overdue' ? 'text-destructive font-medium' : ''}>
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            View Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem>Edit Invoice</DropdownMenuItem>
                          {invoice.status !== 'Paid' && (
                            <DropdownMenuItem>Record Payment</DropdownMenuItem>
                          )}
                          <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Delete Invoice
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
    </div>
  );
}