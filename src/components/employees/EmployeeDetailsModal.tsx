import { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, IndianRupee, Building, Clock, TrendingUp, Edit, Trash2, AlertTriangle, CheckCircle, Building2, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { CustomCalendar } from '@/components/ui/custom-calendar';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: string;
  joinDate: string;
  location: string;
  salary: number;
  attendanceRate?: number;
  lastReview?: string;
}

interface EmployeeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
  onDeactivate?: (employee: Employee) => void;
  onActivate?: (employee: Employee) => void;
}

export function EmployeeDetailsModal({ isOpen, onClose, employee, onEdit, onDelete, onDeactivate, onActivate }: EmployeeDetailsModalProps) {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeactivateConfirmOpen, setIsDeactivateConfirmOpen] = useState(false);
  const [isActivateConfirmOpen, setIsActivateConfirmOpen] = useState(false);
  
  if (!employee) return null;



  const getTimeInCompany = (joinDate: string) => {
    const join = new Date(joinDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - join.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
    } else {
      return `${months} month${months > 1 ? 's' : ''}`;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'default';
      case 'on leave':
        return 'secondary';
      case 'inactive':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-white';
      case 'on leave':
        return 'text-yellow-600';
      case 'inactive':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleDeleteClick = () => {
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(employee);
      setIsDeleteConfirmOpen(false);
      onClose();
    } catch (error) {
      console.error('Error deleting employee:', error);
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
      await onDeactivate(employee);
      setIsDeactivateConfirmOpen(false);
      onClose();
    } catch (error) {
      console.error('Error deactivating employee:', error);
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
      await onActivate(employee);
      setIsActivateConfirmOpen(false);
      onClose();
    } catch (error) {
      console.error('Error activating employee:', error);
    } finally {
      setIsActivating(false);
    }
  };

console.log(employee);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 relative">
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl font-bold">
                  {employee.firstName[0]}{employee.lastName[0]}
                </AvatarFallback>
                {/* <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </div> */}
              </Avatar>
              <div>
                <DialogTitle className="text-2xl font-bold">
                  {employee.firstName} {employee.lastName}
                </DialogTitle>
                <DialogDescription className="text-base">
                  Employee ID: {employee.id} <br /> Joined {formatDate(employee.joinDate)}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Edit Button - Always visible for authorized users */}
              {
                <Button 
                  onClick={() => onEdit(employee)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              }
              
              {/* Activate/Deactivate Button - Conditional based on status */}
              {
                employee.status.toLowerCase() === 'active' ? (
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
                      <UserCheck className="h-4 w-4" />
                      Activate
                    </Button>
                  )
                )
              }
              
              {/* Delete Button - Always visible for authorized users */}
              {
                <Button 
                  onClick={handleDeleteClick}
                  variant="outline"
                  size="sm"
                  className="gap-2 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              }
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Employee Details Card */}
              <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Employee Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Full Name</label>
                    <p className="text-slate-400">{employee.firstName} {employee.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Employee ID</label>
                    <p className="text-slate-400 font-mono">{employee.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Job Role</label>
                    <p className="text-slate-400">{employee.role}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Department</label>
                    <p className="text-slate-400">{employee.department}</p>
                  </div>
                  <div >
                    <label className="text-sm font-medium">Status</label>
                    <Badge 
                      variant={getStatusVariant(employee.status)}
                      className={getStatusColor(employee.status)}
                    >
                      {employee.status}
                    </Badge>
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
                    <p className="text-slate-400">{employee.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone Number</label>
                    <p className="text-slate-400">{employee.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <p className="text-slate-400">{employee.location}</p>
                  </div>
                </div>
              </div>

              {/* Performance Card */}
              <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Overview
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Attendance Rate</label>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="font-medium text-lg">{employee.attendanceRate || 100}%</span>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${employee.attendanceRate || 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  {employee.lastReview && (
                    <div>
                      <label className="text-sm font-medium">Last Performance Review</label>
                      <p className="text-slate-400">{formatDate(employee.lastReview)}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium">Current Status</label>
                    <div className="mt-1">
                      <Badge 
                        variant={getStatusVariant(employee.status)}
                        className={getStatusColor(employee.status)}
                      >
                        {employee.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Timeline Card */}
              <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Employment Timeline
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Join Date</label>
                    <p className="text-slate-400">{formatDate(employee.joinDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Time in Company</label>
                    <p className="text-slate-400">{getTimeInCompany(employee.joinDate)}</p>
                  </div>
                </div>
              </div>

              {/* Salary Information Card */}
              <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <IndianRupee className="h-5 w-5" />
                  Salary Breakdown
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Annual Salary</label>
                    <p className="text-slate-400 text-xl font-bold">₹{employee.salary.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Monthly Salary</label>
                    <p className="text-slate-400 text-lg font-semibold">₹{Math.round(employee.salary / 12).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Weekly Salary</label>
                    <p className="text-slate-400">₹{Math.round(employee.salary / 52).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Daily Salary</label>
                    <p className="text-slate-400">₹{Math.round(employee.salary / 365).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Hourly Rate (40h/wk)</label>
                    <p className="text-slate-400">₹{Math.round(employee.salary / 52 / 40).toLocaleString()}</p>
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
          title="Delete Employee"
          description={`Are you sure you want to delete ${employee.firstName} ${employee.lastName}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
          isLoading={isDeleting}
        />

        <ConfirmationDialog
          isOpen={isDeactivateConfirmOpen}
          onClose={() => setIsDeactivateConfirmOpen(false)}
          onConfirm={handleDeactivateConfirm}
          title="Deactivate Employee"
          description={`Are you sure you want to deactivate ${employee.firstName} ${employee.lastName}? They will no longer have access to the system.`}
          confirmText="Deactivate"
          cancelText="Cancel"
          variant="destructive"
          isLoading={isDeactivating}
        />

        <ConfirmationDialog
          isOpen={isActivateConfirmOpen}
          onClose={() => setIsActivateConfirmOpen(false)}
          onConfirm={handleActivateConfirm}
          title="Activate Employee"
          description={`Are you sure you want to activate ${employee.firstName} ${employee.lastName}? They will regain access to the system.`}
          confirmText="Activate"
          cancelText="Cancel"
          variant="default"
          isLoading={isActivating}
        />
      </DialogContent>
    </Dialog>
  );
}
