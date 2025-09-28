import { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { jobRoleCategoryService, departmentCategoryService, Category } from '@/lib/categoryService';

interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  job_role: string;
  department: string;
  status: string;
  join_date: string;
  address: string;
  annual_salary: number;
  date_of_birth?: string;
  blood_group?: string;
  account_holder_name?: string;
  account_number?: string;
  bank_name?: string;
  bank_branch?: string;
  ifsc_code?: string;
  notes?: string;
  // Display fields from API
  job_role_name?: string;
  department_name?: string;
  full_name?: string;
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
  
  // Category names state
  const [jobRoleName, setJobRoleName] = useState<string>('');
  const [departmentName, setDepartmentName] = useState<string>('');
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Load category names when employee data is available
  useEffect(() => {
    if (employee) {
      loadCategoryNames();
    }
  }, [employee]);

  const loadCategoryNames = async () => {
    if (!employee) return;
    
    setIsLoadingCategories(true);
    try {
      // If names are already provided in the employee data, use them
      if (employee.job_role_name && employee.department_name) {
        setJobRoleName(employee.job_role_name);
        setDepartmentName(employee.department_name);
        return;
      }

      // Otherwise, fetch the names from the category APIs
      const promises = [];
      
      if (employee.job_role) {
        promises.push(
          jobRoleCategoryService.getById(employee.job_role)
            .then(role => setJobRoleName(role.name))
            .catch(error => {
              console.error('Error fetching job role:', error);
              setJobRoleName('Unknown Role');
            })
        );
      }

      if (employee.department) {
        promises.push(
          departmentCategoryService.getById(employee.department)
            .then(dept => setDepartmentName(dept.name))
            .catch(error => {
              console.error('Error fetching department:', error);
              setDepartmentName('Unknown Department');
            })
        );
      }

      await Promise.all(promises);
    } catch (error) {
      console.error('Error loading category names:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

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
      case 'onleave':
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
        return 'text-green-600';
      case 'onleave':
        return 'text-yellow-600';
      case 'inactive':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusDisplay = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'active': 'Active',
      'onleave': 'On Leave',
      'inactive': 'Inactive'
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDisplayName = () => {
    return employee.full_name || `${employee.first_name} ${employee.last_name}`;
  };

  const getAvatarFallback = () => {
    const firstName = employee.first_name || '';
    const lastName = employee.last_name || '';
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || '??';
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 relative">
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl font-bold">
                  {getAvatarFallback()}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl font-bold">
                  {getDisplayName()}
                </DialogTitle>
                <DialogDescription className="text-base">
                  Employee ID: {employee.employee_id} <br /> 
                  Joined {formatDate(employee.join_date)}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Edit Button */}
              {onEdit && (
                <Button 
                  onClick={() => onEdit(employee)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              )}
              
              {/* Activate/Deactivate Button */}
              {employee.status.toLowerCase() === 'active' ? (
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
              {/* Employee Details Card */}
              <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Employee Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Full Name</label>
                    <p className="text-slate-400">{getDisplayName()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Employee ID</label>
                    <p className="text-slate-400 font-mono">{employee.employee_id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Job Role</label>
                    <p className="text-slate-400">
                      {isLoadingCategories ? 'Loading...' : jobRoleName || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Department</label>
                    <p className="text-slate-400">
                      {isLoadingCategories ? 'Loading...' : departmentName || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Badge 
                      variant={getStatusVariant(employee.status)}
                      className={getStatusColor(employee.status)}
                    >
                      {getStatusDisplay(employee.status)}
                    </Badge>
                  </div>
                  {employee.date_of_birth && (
                    <div>
                      <label className="text-sm font-medium">Date of Birth</label>
                      <p className="text-slate-400">{formatDate(employee.date_of_birth)}</p>
                    </div>
                  )}
                  {employee.blood_group && (
                    <div>
                      <label className="text-sm font-medium">Blood Group</label>
                      <p className="text-slate-400">{employee.blood_group}</p>
                    </div>
                  )}
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
                    <p className="text-slate-400">{employee.phone_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Address</label>
                    <p className="text-slate-400">{employee.address}</p>
                  </div>
                </div>
              </div>

              {/* Bank Information Card */}
              {(employee.account_holder_name || employee.account_number || employee.bank_name) && (
                <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Bank Account Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {employee.account_holder_name && (
                      <div>
                        <label className="text-sm font-medium">Account Holder</label>
                        <p className="text-slate-400">{employee.account_holder_name}</p>
                      </div>
                    )}
                    {employee.account_number && (
                      <div>
                        <label className="text-sm font-medium">Account Number</label>
                        <p className="text-slate-400 font-mono">{employee.account_number}</p>
                      </div>
                    )}
                    {employee.bank_name && (
                      <div>
                        <label className="text-sm font-medium">Bank Name</label>
                        <p className="text-slate-400">{employee.bank_name}</p>
                      </div>
                    )}
                    {employee.bank_branch && (
                      <div>
                        <label className="text-sm font-medium">Bank Branch</label>
                        <p className="text-slate-400">{employee.bank_branch}</p>
                      </div>
                    )}
                    {employee.ifsc_code && (
                      <div>
                        <label className="text-sm font-medium">IFSC Code</label>
                        <p className="text-slate-400 font-mono">{employee.ifsc_code}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes Card */}
              {employee.notes && (
                <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Additional Notes
                  </h3>
                  <div>
                    <p className="text-slate-400 whitespace-pre-wrap">{employee.notes}</p>
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
                  Employment Timeline
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Join Date</label>
                    <p className="text-slate-400">{formatDate(employee.join_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Time in Company</label>
                    <p className="text-slate-400">{getTimeInCompany(employee.join_date)}</p>
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
                    <p className="text-slate-400 text-xl font-bold">₹{employee.annual_salary?.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Monthly Salary</label>
                    <p className="text-slate-400 text-lg font-semibold">
                      ₹{Math.round(employee.annual_salary / 12).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Weekly Salary</label>
                    <p className="text-slate-400">
                      ₹{Math.round(employee.annual_salary / 52).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Daily Salary</label>
                    <p className="text-slate-400">
                      ₹{Math.round(employee.annual_salary / 365).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Hourly Rate (40h/wk)</label>
                    <p className="text-slate-400">
                      ₹{Math.round(employee.annual_salary / 52 / 40).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Card */}
              <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Current Status
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Employment Status</label>
                    <div className="mt-1">
                      <Badge 
                        variant={getStatusVariant(employee.status)}
                        className={getStatusColor(employee.status)}
                      >
                        {getStatusDisplay(employee.status)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Employee Since</label>
                    <p className="text-slate-400">{formatDate(employee.join_date)}</p>
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
          description={`Are you sure you want to delete ${getDisplayName()}? This action cannot be undone.`}
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
          description={`Are you sure you want to deactivate ${getDisplayName()}? They will no longer have access to the system.`}
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
          description={`Are you sure you want to activate ${getDisplayName()}? They will regain access to the system.`}
          confirmText="Activate"
          cancelText="Cancel"
          variant="default"
          isLoading={isActivating}
        />
      </DialogContent>
    </Dialog>
  );
}