import { useState } from 'react';
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

// Client interface
interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  status: string;
  joinDate: string;
  location: string;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  lastContact: string;
  notes?: string;
}

// Mock data for Clients
const mockClients: Client[] = [
  {
    id: 'CLIENT-001',
    name: 'John Smith',
    email: 'john.smith@techcorp.com',
    phone: '+1 (555) 123-4567',
    company: 'TechCorp Inc.',
    industry: 'Technology',
    status: 'Active',
    joinDate: '2023-01-15',
    location: 'New York, NY',
    totalProjects: 5,
    activeProjects: 2,
    completedProjects: 3,
    totalRevenue: 125000,
    lastContact: '2024-03-15',
    notes: 'High priority client, prefers weekly updates'
  },
  {
    id: 'CLIENT-002',
    name: 'Sarah Johnson',
    email: 'sarah.j@startupxyz.com',
    phone: '+1 (555) 234-5678',
    company: 'StartupXYZ',
    industry: 'Startup',
    status: 'Active',
    joinDate: '2023-03-20',
    location: 'San Francisco, CA',
    totalProjects: 3,
    activeProjects: 1,
    completedProjects: 2,
    totalRevenue: 75000,
    lastContact: '2024-03-10',
    notes: 'Budget-conscious, requires detailed proposals'
  },
  {
    id: 'CLIENT-003',
    name: 'Mike Wilson',
    email: 'mike.wilson@globalretail.com',
    phone: '+1 (555) 345-6789',
    company: 'Global Retail',
    industry: 'Retail',
    status: 'Inactive',
    joinDate: '2022-08-10',
    location: 'Chicago, IL',
    totalProjects: 2,
    activeProjects: 0,
    completedProjects: 2,
    totalRevenue: 50000,
    lastContact: '2023-12-15',
    notes: 'Project completed, potential for future work'
  },
  {
    id: 'CLIENT-004',
    name: 'Emily Davis',
    email: 'emily.davis@healthplus.com',
    phone: '+1 (555) 456-7890',
    company: 'HealthPlus',
    industry: 'Healthcare',
    status: 'Active',
    joinDate: '2024-01-05',
    location: 'Boston, MA',
    totalProjects: 1,
    activeProjects: 1,
    completedProjects: 0,
    totalRevenue: 30000,
    lastContact: '2024-03-20',
    notes: 'New client, very responsive to communication'
  }
];

export function Clients() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Client data state
  const [clients, setClients] = useState<Client[]>(mockClients);

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

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status.toLowerCase() === statusFilter;
    const matchesIndustry = industryFilter === 'all' || client.industry.toLowerCase() === industryFilter;
    
    return matchesSearch && matchesStatus && matchesIndustry;
  });

  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'Active').length;
  const inactiveClients = clients.filter(c => c.status === 'Inactive').length;
  const totalRevenue = clients.reduce((sum, c) => sum + c.totalRevenue, 0);
  const avgRevenuePerClient = totalClients > 0 ? Math.round(totalRevenue / totalClients) : 0;

  // Modal handlers
  const handleCreateClient = (newClient: Client) => {
    setClients(prev => [...prev, newClient]);
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClients(prev => 
      prev.map(client => client.id === updatedClient.id ? updatedClient : client)
    );
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
          {/* <CustomClock variant="detailed" /> */}
          <div className="flex gap-2">
            <Button 
              className="bg-gradient-primary shadow-primary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </div>
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
        </TabsList>


        <TabsContent value="clients" className="space-y-4">
          <UserFilters
            title="Client Filters"
            searchPlaceholder="Search clients by name, company, or email..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filterValue={industryFilter}
            onFilterChange={setIndustryFilter}
            filterOptions={[
              { value: 'all', label: 'All Industries' },
              { value: 'technology', label: 'Technology' },
              { value: 'startup', label: 'Startup' },
              { value: 'retail', label: 'Retail' },
              { value: 'healthcare', label: 'Healthcare' },
            ]}
            filterPlaceholder="Industry"
            onReset={resetFilters}
            showStatusFilter={true}
            statusValue={statusFilter}
            onStatusChange={setStatusFilter}
            statusOptions={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
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
                      <TableHead>Last Contact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
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
                          <div className="font-medium">{client.company}</div>
                          <div className="text-sm text-muted-foreground">{client.location}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{client.industry}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={client.status === 'Active' ? 'default' : 'secondary'}
                          >
                            {client.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{client.totalProjects} total</div>
                            <div className="text-muted-foreground">
                              {client.activeProjects} active, {client.completedProjects} completed
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-green-600">
                            ₹{(client.totalRevenue / 1000).toFixed(0)}K
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(client.lastContact).toLocaleDateString()}
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

        <TabsContent value="active" className="space-y-4">
          <UserFilters
            title="Active Client Filters"
            searchPlaceholder="Search active clients by name, company, or email..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filterValue={industryFilter}
            onFilterChange={setIndustryFilter}
            filterOptions={[
              { value: 'all', label: 'All Industries' },
              { value: 'technology', label: 'Technology' },
              { value: 'startup', label: 'Startup' },
              { value: 'retail', label: 'Retail' },
              { value: 'healthcare', label: 'Healthcare' },
            ]}
            filterPlaceholder="Industry"
            onReset={resetFilters}
          />

          <Card>
            <CardHeader>
              <CardTitle>Active Clients ({clients.filter(c => c.status === 'Active').length})</CardTitle>
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
                      <TableHead>Last Contact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.filter(c => c.status === 'Active').map((client) => (
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
                          <div className="font-medium">{client.company}</div>
                          <div className="text-sm text-muted-foreground">{client.location}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{client.industry}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{client.totalProjects} total</div>
                            <div className="text-muted-foreground">
                              {client.activeProjects} active, {client.completedProjects} completed
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-green-600">
                            ₹{(client.totalRevenue / 1000).toFixed(0)}K
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(client.lastContact).toLocaleDateString()}
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
            filterOptions={[
              { value: 'all', label: 'All Industries' },
              { value: 'technology', label: 'Technology' },
              { value: 'startup', label: 'Startup' },
              { value: 'retail', label: 'Retail' },
              { value: 'healthcare', label: 'Healthcare' },
            ]}
            filterPlaceholder="Industry"
            onReset={resetFilters}
          />

          <Card>
            <CardHeader>
              <CardTitle>Inactive Clients ({clients.filter(c => c.status === 'Inactive').length})</CardTitle>
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
                      <TableHead>Last Contact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.filter(c => c.status === 'Inactive').map((client) => (
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
                          <div className="font-medium">{client.company}</div>
                          <div className="text-sm text-muted-foreground">{client.location}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{client.industry}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{client.totalProjects} total</div>
                            <div className="text-muted-foreground">
                              {client.activeProjects} active, {client.completedProjects} completed
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-green-600">
                            ₹{(client.totalRevenue / 1000).toFixed(0)}K
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(client.lastContact).toLocaleDateString()}
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
