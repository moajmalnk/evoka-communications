import { useState } from 'react';
import { UserCircle, Mail, Phone, MapPin, Building2, Calendar, IndianRupee, FileText, Edit, Trash2, Clock, TrendingUp, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface Client {
  id: string;
  name: string;
  email: string;
  phone_number: string; // Changed from 'phone'
  company?: string; // Made optional
  industry: string;
  status: string;
  created_at: string; // Changed from 'joinDate'
  address?: string; // Changed from 'location'
  total_projects: number; // Changed from 'totalProjects'
  active_projects: number; // Changed from 'activeProjects'
  completed_projects: number; // Changed from 'completedProjects'
  total_revenue: number; // Changed from 'totalRevenue'
  updated_at: string; // Changed from 'lastContact'
  notes?: string;
  display_name?: string;
  industry_display?: string;
  status_display?: string;
  project_success_rate?: number;
}

interface ClientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onEdit?: (client: Client) => void;
  onDelete?: (client: Client) => void;
  onDeactivate?: (client: Client) => void;
  onActivate?: (client: Client) => void;
}

export function ClientDetailsModal({ isOpen, onClose, client, onEdit, onDelete, onDeactivate, onActivate }: ClientDetailsModalProps) {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeactivateConfirmOpen, setIsDeactivateConfirmOpen] = useState(false);
  const [isActivateConfirmOpen, setIsActivateConfirmOpen] = useState(false);
  
  if (!client) return null;

  // Safe data access with fallbacks
  const getSafeString = (value: any, fallback: string = 'N/A') => {
    return value || fallback;
  };

  const getSafeNumber = (value: any, fallback: number = 0) => {
    return typeof value === 'number' ? value : fallback;
  };

  const getSafeDate = (value: any, fallback: string = new Date().toISOString()) => {
    return value || fallback;
  };

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'prospect':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'text-white';
      case 'inactive':
        return 'text-muted-foreground';
      case 'prospect':
        return 'text-yellow-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(client);
      setIsDeleteConfirmOpen(false);
      onClose();
    } catch (error) {
      console.error('Error deleting client:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeactivateClick = () => {
    setIsDeactivateConfirmOpen(true);
  };

  const handleDeactivateConfirm = async () => {
    if (!onDeactivate) return;
    
    setIsDeactivating(true);
    try {
      await onDeactivate(client);
      setIsDeactivateConfirmOpen(false);
      onClose();
    } catch (error) {
      console.error('Error deactivating client:', error);
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleActivateClick = () => {
    setIsActivateConfirmOpen(true);
  };

  const handleActivateConfirm = async () => {
    if (!onActivate) return;
    
    setIsActivating(true);
    try {
      await onActivate(client);
      setIsActivateConfirmOpen(false);
      onClose();
    } catch (error) {
      console.error('Error activating client:', error);
    } finally {
      setIsActivating(false);
    }
  };

  // Safe data extraction
  const safeClient = {
    name: getSafeString(client.name, 'Unknown Client'),
    email: getSafeString(client.email),
    phone: getSafeString(client.phone_number),
    company: getSafeString(client.company),
    industry: getSafeString(client.industry_display || client.industry),
    status: getSafeString(client.status_display || client.status),
    joinDate: getSafeDate(client.created_at),
    location: getSafeString(client.address),
    totalProjects: getSafeNumber(client.total_projects),
    activeProjects: getSafeNumber(client.active_projects),
    completedProjects: getSafeNumber(client.completed_projects),
    totalRevenue: getSafeNumber(client.total_revenue),
    lastContact: getSafeDate(client.updated_at),
    notes: getSafeString(client.notes, 'No notes available'),
    id: getSafeString(client.id, 'Unknown ID')
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 relative">
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl font-bold">
                  {safeClient.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl font-bold">
                  {safeClient.name}
                </DialogTitle>
                <DialogDescription className="text-base">
                  Client ID: {safeClient.id} • Joined {formatDate(safeClient.joinDate)}
                </DialogDescription>
                <div className="mt-2">
                  <Badge 
                    variant={getStatusVariant(safeClient.status)}
                    className={getStatusColor(safeClient.status)}
                  >
                    {safeClient.status}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Edit Button */}
              {onEdit && (
                <Button 
                  onClick={() => onEdit(client)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              )}
              
              {/* Activate/Deactivate Button */}
              {safeClient.status.toLowerCase() === 'active' ? (
                onDeactivate && (
                  <Button 
                    onClick={handleDeactivateClick}
                    variant="outline"
                    size="sm"
                    className="gap-2 text-orange-600 border-orange-600 hover:bg-orange-600 hover:text-white"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Deactivate
                  </Button>
                )
              ) : (
                onActivate && (
                  <Button 
                    onClick={handleActivateClick}
                    variant="outline"
                    size="sm"
                    className="gap-2 text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Activate
                  </Button>
                )
              )}
              
              {/* Delete Button */}
              {onDelete && (
                <Button 
                  onClick={handleDeleteClick}
                  variant="outline"
                  size="sm"
                  className="gap-2 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Client Details Card */}
              <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <UserCircle className="h-5 w-5" />
                  Client Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Client Name</label>
                    <p className="text-slate-400">{safeClient.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Company</label>
                    <p className="text-slate-400">{safeClient.company}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Industry</label>
                    <p className="text-slate-400">{safeClient.industry}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information Card */}
              <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Email Address</label>
                    <p className="text-slate-400">{safeClient.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone Number</label>
                    <p className="text-slate-400">{safeClient.phone_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <p className="text-slate-400">{safeClient.location}</p>
                  </div>
                </div>
              </div>

              {/* Project Overview Card */}
              <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Project Overview
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Total Projects</label>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="font-medium text-lg">{safeClient.totalProjects}</span>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((safeClient.totalProjects / 10) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Active Projects</label>
                    <p className="text-green-600 text-lg font-semibold">{safeClient.activeProjects}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Completed Projects</label>
                    <p className="text-slate-400">{safeClient.completedProjects}</p>
                  </div>
                </div>
              </div>

              {/* Additional Information Card */}
              {safeClient.notes && safeClient.notes !== 'No notes available' && (
                <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Additional Information
                  </h3>
                  <div>
                    <label className="text-sm font-medium">Notes</label>
                    <p className="text-slate-400">{safeClient.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Timeline Card */}
              <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Client Timeline
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Client Since</label>
                    <p className="text-slate-400">{formatDate(safeClient.joinDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last Contact</label>
                    <p className="text-slate-400">{formatDate(safeClient.lastContact)}</p>
                  </div>
                </div>
              </div>

              {/* Financial Information Card */}
              <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <IndianRupee className="h-5 w-5" />
                  Financial Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Total Revenue</label>
                    <p className="text-slate-400 text-xl font-bold">₹{safeClient.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Avg Revenue/Project</label>
                    <p className="text-slate-400 text-lg font-semibold">
                      ₹{safeClient.totalProjects > 0 ? Math.round(safeClient.totalRevenue / safeClient.totalProjects).toLocaleString() : '0'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Dialogs */}
        <ConfirmationDialog
          isOpen={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Client"
          description={`Are you sure you want to delete ${safeClient.name}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
          isLoading={isDeleting}
        />

        <ConfirmationDialog
          isOpen={isDeactivateConfirmOpen}
          onClose={() => setIsDeactivateConfirmOpen(false)}
          onConfirm={handleDeactivateConfirm}
          title="Deactivate Client"
          description={`Are you sure you want to deactivate ${safeClient.name}? They will no longer have access to the system.`}
          confirmText="Deactivate"
          cancelText="Cancel"
          variant="destructive"
          isLoading={isDeactivating}
        />

        <ConfirmationDialog
          isOpen={isActivateConfirmOpen}
          onClose={() => setIsActivateConfirmOpen(false)}
          onConfirm={handleActivateConfirm}
          title="Activate Client"
          description={`Are you sure you want to activate ${safeClient.name}? They will regain access to the system.`}
          confirmText="Activate"
          cancelText="Cancel"
          variant="default"
          isLoading={isActivating}
        />
      </DialogContent>
    </Dialog>
  );
}