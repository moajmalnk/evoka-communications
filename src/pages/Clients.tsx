import { useState, useEffect } from 'react';
import { 
  Building2, Search, MoreHorizontal, Eye, Edit, Trash2, Plus, 
  Mail, Phone, MapPin, Calendar, IndianRupee, Users, FileText, Filter,
  CheckCircle, XCircle, Clock, TrendingUp, AlertTriangle, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { CustomClock } from '@/components/ui/custom-clock';
import { CustomCalendar } from '@/components/ui/custom-calendar';
import { ClientCreateModal } from '@/components/clients/ClientCreateModal';
import { ClientEditModal } from '@/components/clients/ClientEditModal';
import { ClientDetailsModal } from '@/components/clients/ClientDetailsModal';
import { UserFilters } from '@/components/common/UserFilters';
import { clientApi, Client, ClientCreateData, ClientUpdateData } from '@/lib/clientService';
import { toast } from 'sonner';

export function Clients() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Client data state
  const [clients, setClients] = useState<Client[]>([]);

  // Role verification - Admin, General Manager, and HR have access
  if (user?.role !== 'admin' && user?.role !== 'general_manager' && user?.role !== 'hr') {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Fetch clients
  // Fetch clients - UPDATED VERSION
const fetchClients = async () => {
  try {
    setIsLoading(true);
    const params: any = {};
    
    if (searchTerm) params.search = searchTerm;
    if (statusFilter !== 'all') params.status = statusFilter;
    if (industryFilter !== 'all') params.industry = industryFilter;
    
    const response = await clientApi.getAll(params);
    
    // Handle the actual API response structure
    if (response.data && (response.data.results || response.data.data)) {
      // Use results array if it exists, otherwise use data array
      const clientsData = response.data.results || response.data.data || [];
      setClients(clientsData);
    } else {
      toast.error('Failed to fetch clients: Invalid response format');
      setClients([]);
    }
  } catch (error) {
    console.error('Error fetching clients:', error);
    toast.error('Failed to load clients');
    setClients([]);
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    fetchClients();
  }, [searchTerm, statusFilter, industryFilter]);

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status.toLowerCase() === statusFilter;
    const matchesIndustry = industryFilter === 'all' || client.industry.toLowerCase() === industryFilter;
    
    return matchesSearch && matchesStatus && matchesIndustry;
  });

  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'active').length;
  const inactiveClients = clients.filter(c => c.status === 'inactive').length;
  const prospectClients = clients.filter(c => c.status === 'prospect').length;
  const totalRevenue = clients.reduce((sum, c) => sum + c.total_revenue, 0);
  const avgRevenuePerClient = totalClients > 0 ? Math.round(totalRevenue / totalClients) : 0;

  // Modal handlers
  const handleCreateClient = async (newClientData: ClientCreateData) => {
    try {
      const response = await clientApi.create(newClientData);
      
      if (response.data.status === 'success') {
        const createdClient = response.data.data;
        setClients(prev => [...prev, createdClient]);
        toast.success('Client created successfully');
        handleCloseModals();
      } else {
        toast.error('Failed to create client');
      }
    } catch (error) {
      console.error('Error creating client:', error);
      toast.error('Failed to create client');
    }
  };

  const handleUpdateClient = async (updatedClientData: ClientUpdateData) => {
    if (!selectedClient) return;
    
    try {
      const response = await clientApi.update(selectedClient.id, updatedClientData);
      
      if (response.data.status === 'success') {
        const updatedClient = response.data.data;
        setClients(prev => 
          prev.map(client => client.id === updatedClient.id ? updatedClient : client)
        );
        toast.success('Client updated successfully');
        handleCloseModals();
      } else {
        toast.error('Failed to update client');
      }
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Failed to update client');
    }
  };

  const handleDeleteClient = async (clientId: string) => {
  try {
    // Add confirmation dialog
    if (!confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      return;
    }

    const response = await clientApi.delete(clientId);
    
    console.log('Full delete response:', response);
    
    // Check multiple success conditions
    const isSuccess = 
      response.data?.status === 'success' ||
      response.status === 200 ||
      response.status === 204 ||
      response.data?.message?.includes('success') ||
      response.data?.detail?.includes('success');

    if (isSuccess) {
      // Update local state immediately for better UX
      setClients(prev => prev.filter(client => client.id !== clientId));
      toast.success('Client deleted successfully');
      
      // Also refresh from server to ensure consistency
      setTimeout(() => {
        fetchClients();
      }, 100);
    } else {
      const errorMessage = response.data?.message || response.data?.detail || 'Failed to delete client';
      toast.error(errorMessage);
    }
  } catch (error: any) {
    console.error('Error deleting client:', error);
    
    // More detailed error handling
    let errorMessage = 'Failed to delete client';
    
    if (error.response?.data) {
      errorMessage = 
        error.response.data.message ||
        error.response.data.detail ||
        error.response.data.error ||
        JSON.stringify(error.response.data);
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    toast.error(errorMessage);
  }
};

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setIsDetailsModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setIsEditModalOpen(true);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setIndustryFilter('all');
  };

  const handleCloseModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDetailsModalOpen(false);
    setSelectedClient(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default' as const, className: 'bg-green-100 text-green-800 hover:bg-green-100' },
      inactive: { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800 hover:bg-gray-100' },
      prospect: { variant: 'outline' as const, className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getIndustryOptions = () => {
    const industries = Array.from(new Set(clients.map(client => client.industry).filter(Boolean)));
    return [
      { value: 'all', label: 'All Industries' },
      ...industries.map(industry => ({ value: industry.toLowerCase(), label: industry }))
    ];
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
            <p className="text-muted-foreground">Loading clients...</p>
          </div>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
          <p className="text-muted-foreground">
            Manage client relationships and track project history
          </p>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <Button 
            className="bg-gradient-primary shadow-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">
              All clients
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeClients}</div>
            <p className="text-xs text-muted-foreground">
              Currently working
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{(totalRevenue / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ₹{(avgRevenuePerClient / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground">
              Per client
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="clients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="clients">All Clients</TabsTrigger>
          <TabsTrigger value="active">Active Clients</TabsTrigger>
          <TabsTrigger value="inactive">Inactive Clients</TabsTrigger>
          <TabsTrigger value="prospect">Prospects</TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          <UserFilters
            title="Client Filters"
            searchPlaceholder="Search clients by name, company, or email..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filterValue={industryFilter}
            onFilterChange={setIndustryFilter}
            filterOptions={getIndustryOptions()}
            filterPlaceholder="Industry"
            onReset={resetFilters}
            showStatusFilter={true}
            statusValue={statusFilter}
            onStatusChange={setStatusFilter}
            statusOptions={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'prospect', label: 'Prospect' },
            ]}
          />

          {/* Clients Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Clients ({filteredClients.length})</CardTitle>
              <CardDescription>
                Complete list of all clients and their information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Projects</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <Building2 className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">No clients found</p>
                            <Button 
                              variant="outline" 
                              onClick={() => setIsCreateModalOpen(true)}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Client
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredClients.map((client) => (
                        <TableRow key={client.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => handleViewClient(client)}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                                  {client.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{client.name}</div>
                                <div className="text-sm text-muted-foreground">{client.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{client.company || 'N/A'}</div>
                            <div className="text-sm text-muted-foreground">{client.address}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{client.industry}</Badge>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(client.status)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{client.total_projects} total</div>
                              <div className="text-muted-foreground">
                                {client.active_projects} active, {client.completed_projects} completed
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-green-600">
                              ₹{(client.total_revenue / 1000).toFixed(0)}K
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {new Date(client.updated_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => e.stopPropagation()} // Stop propagation on trigger
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewClient(client);
                                  }}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditClient(client);
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClient(client.id, e);
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <UserFilters
            title="Active Client Filters"
            searchPlaceholder="Search active clients by name, company, or email..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filterValue={industryFilter}
            onFilterChange={setIndustryFilter}
            filterOptions={getIndustryOptions()}
            filterPlaceholder="Industry"
            onReset={resetFilters}
          />

          <Card>
            <CardHeader>
              <CardTitle>Active Clients ({activeClients})</CardTitle>
              <CardDescription>
                Clients currently working on projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Projects</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.filter(c => c.status === 'active').map((client) => (
                      <TableRow key={client.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => handleViewClient(client)}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                                {client.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{client.name}</div>
                              <div className="text-sm text-muted-foreground">{client.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{client.company || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">{client.address}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{client.industry}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{client.total_projects} total</div>
                            <div className="text-muted-foreground">
                              {client.active_projects} active, {client.completed_projects} completed
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-green-600">
                            ₹{(client.total_revenue / 1000).toFixed(0)}K
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(client.updated_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          <UserFilters
            title="Inactive Client Filters"
            searchPlaceholder="Search inactive clients by name, company, or email..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filterValue={industryFilter}
            onFilterChange={setIndustryFilter}
            filterOptions={getIndustryOptions()}
            filterPlaceholder="Industry"
            onReset={resetFilters}
          />

          <Card>
            <CardHeader>
              <CardTitle>Inactive Clients ({inactiveClients})</CardTitle>
              <CardDescription>
                Clients with no current active projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Projects</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.filter(c => c.status === 'inactive').map((client) => (
                      <TableRow key={client.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => handleViewClient(client)}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                                {client.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{client.name}</div>
                              <div className="text-sm text-muted-foreground">{client.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{client.company || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">{client.address}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{client.industry}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{client.total_projects} total</div>
                            <div className="text-muted-foreground">
                              {client.active_projects} active, {client.completed_projects} completed
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-green-600">
                            ₹{(client.total_revenue / 1000).toFixed(0)}K
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(client.updated_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prospect" className="space-y-4">
          <UserFilters
            title="Prospect Client Filters"
            searchPlaceholder="Search prospect clients by name, company, or email..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filterValue={industryFilter}
            onFilterChange={setIndustryFilter}
            filterOptions={getIndustryOptions()}
            filterPlaceholder="Industry"
            onReset={resetFilters}
          />

          <Card>
            <CardHeader>
              <CardTitle>Prospect Clients ({prospectClients})</CardTitle>
              <CardDescription>
                Potential clients for future projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Contact Info</TableHead>
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.filter(c => c.status === 'prospect').map((client) => (
                      <TableRow key={client.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => handleViewClient(client)}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                                {client.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{client.name}</div>
                              <div className="text-sm text-muted-foreground">{client.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{client.company || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">{client.address}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{client.industry}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {client.phone_number}
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {client.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(client.updated_at).toLocaleDateString()}
                          </div>
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

      {/* Client Modals */}
      <ClientCreateModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModals}
        onClientCreated={handleCreateClient}
      />

      <ClientEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        client={selectedClient}
        onClientUpdated={handleUpdateClient}
      />

      <ClientDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseModals}
        client={selectedClient}
        onEdit={handleEditClient}
      />
    </div>
  );
}