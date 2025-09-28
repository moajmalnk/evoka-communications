import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, IndianRupee, Building, UserCheck, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { CustomCalendar } from '@/components/ui/custom-calendar';
import { jobRoleCategoryService, departmentCategoryService, Category } from '@/lib/categoryService';

interface EmployeeCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmployeeCreated?: (employeeData: any) => Promise<boolean>;
}

export function EmployeeCreateModal({ isOpen, onClose, onEmployeeCreated }: EmployeeCreateModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [joinDateOpen, setJoinDateOpen] = useState(false);
  const [dobOpen, setDobOpen] = useState(false);
  
  // Categories state
  const [jobRoles, setJobRoles] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Category[]>([]);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: '',
    job_role: '',
    department: '',
    annual_salary: '',
    join_date: '',
    status: 'active',
    date_of_birth: '',
    blood_group: '',
    account_holder_name: '',
    account_number: '',
    bank_name: '',
    bank_branch: '',
    ifsc_code: '',
    notes: ''
  });

  const bloodGroups = [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
  ];

  // Load categories when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const [jobRolesData, departmentsData] = await Promise.all([
        jobRoleCategoryService.getAll(),
        departmentCategoryService.getAll()
      ]);
      
      setJobRoles(jobRolesData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: "Error",
        description: "Failed to load job roles and departments",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.job_role) {
      newErrors.job_role = 'Job role is required';
    }
    if (!formData.department) {
      newErrors.department = 'Department is required';
    }
    if (!formData.annual_salary) {
      newErrors.annual_salary = 'Annual salary is required';
    }
    if (!formData.join_date) {
      newErrors.join_date = 'Join date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const success = await onEmployeeCreated?.({
        ...formData,
        annual_salary: parseFloat(formData.annual_salary) || 0
      });

      if (success) {
        handleClose();
      }
    } catch (error) {
      console.error('Error creating employee:', error);
      toast({
        title: "Error",
        description: "Failed to create employee. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      address: '',
      job_role: '',
      department: '',
      annual_salary: '',
      join_date: '',
      status: 'active',
      date_of_birth: '',
      blood_group: '',
      account_holder_name: '',
      account_number: '',
      bank_name: '',
      bank_branch: '',
      ifsc_code: '',
      notes: ''
    });
    setErrors({});
    setIsLoading(false);
    onClose();
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDateChange = (date: Date, field: string) => {
    setFormData(prev => ({ ...prev, [field]: date.toISOString().split('T')[0] }));
    if (field === 'join_date') setJoinDateOpen(false);
    if (field === 'date_of_birth') setDobOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Create New Employee
          </DialogTitle>
          <DialogDescription>
            Add a new team member with all necessary information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="Enter first name"
                  className={errors.first_name ? 'border-destructive' : ''}
                />
                {errors.first_name && <p className="text-sm text-destructive">{errors.first_name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Enter last name"
                  className={errors.last_name ? 'border-destructive' : ''}
                />
                {errors.last_name && <p className="text-sm text-destructive">{errors.last_name}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="employee@company.com"
                    className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone_number"
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    placeholder="+1-555-0123"
                    className={`pl-10 ${errors.phone_number ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.phone_number && <p className="text-sm text-destructive">{errors.phone_number}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Popover open={dobOpen} onOpenChange={setDobOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.date_of_birth ? formatDateForDisplay(formData.date_of_birth) : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CustomCalendar
                      date={formData.date_of_birth ? new Date(formData.date_of_birth) : new Date()}
                      onDateChange={(date) => handleDateChange(date, 'date_of_birth')}
                      variant="inline"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="blood_group">Blood Group</Label>
                <Select value={formData.blood_group} onValueChange={(value) => handleInputChange('blood_group', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodGroups.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Full address"
                  className={`pl-10 min-h-[80px] ${errors.address ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
            </div>
          </div>

          {/* Work Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building className="h-4 w-4" />
              Work Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job_role">Job Role *</Label>
                <Select 
                  value={formData.job_role} 
                  onValueChange={(value) => handleInputChange('job_role', value)}
                  disabled={isLoadingCategories}
                >
                  <SelectTrigger className={errors.job_role ? 'border-destructive' : ''}>
                    <SelectValue placeholder={isLoadingCategories ? "Loading job roles..." : "Select job role"} />
                  </SelectTrigger>
                  <SelectContent>
                    {jobRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.job_role && <p className="text-sm text-destructive">{errors.job_role}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select 
                  value={formData.department} 
                  onValueChange={(value) => handleInputChange('department', value)}
                  disabled={isLoadingCategories}
                >
                  <SelectTrigger className={errors.department ? 'border-destructive' : ''}>
                    <SelectValue placeholder={isLoadingCategories ? "Loading departments..." : "Select department"} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && <p className="text-sm text-destructive">{errors.department}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="annual_salary">Annual Salary *</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="annual_salary"
                    type="number"
                    value={formData.annual_salary}
                    onChange={(e) => handleInputChange('annual_salary', e.target.value)}
                    placeholder="75000"
                    className={`pl-10 ${errors.annual_salary ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.annual_salary && <p className="text-sm text-destructive">{errors.annual_salary}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="join_date">Join Date *</Label>
                <Popover open={joinDateOpen} onOpenChange={setJoinDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${errors.join_date ? 'border-destructive' : ''}`}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.join_date ? formatDateForDisplay(formData.join_date) : 'Pick a join date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CustomCalendar
                      date={formData.join_date ? new Date(formData.join_date) : new Date()}
                      onDateChange={(date) => handleDateChange(date, 'join_date')}
                      variant="inline"
                    />
                  </PopoverContent>
                </Popover>
                {errors.join_date && <p className="text-sm text-destructive">{errors.join_date}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="onleave">On Leave</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bank Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Bank Account Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="account_holder_name">Account Holder Name</Label>
                <Input
                  id="account_holder_name"
                  value={formData.account_holder_name}
                  onChange={(e) => handleInputChange('account_holder_name', e.target.value)}
                  placeholder="Account holder name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_number">Account Number</Label>
                <Input
                  id="account_number"
                  value={formData.account_number}
                  onChange={(e) => handleInputChange('account_number', e.target.value)}
                  placeholder="Account number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  value={formData.bank_name}
                  onChange={(e) => handleInputChange('bank_name', e.target.value)}
                  placeholder="Bank name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_branch">Bank Branch</Label>
                <Input
                  id="bank_branch"
                  value={formData.bank_branch}
                  onChange={(e) => handleInputChange('bank_branch', e.target.value)}
                  placeholder="Bank branch"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ifsc_code">IFSC Code</Label>
                <Input
                  id="ifsc_code"
                  value={formData.ifsc_code}
                  onChange={(e) => handleInputChange('ifsc_code', e.target.value)}
                  placeholder="IFSC code"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about the employee..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || isLoadingCategories} 
              className="bg-gradient-primary shadow-primary"
            >
              {isLoading ? 'Creating...' : 'Create Employee'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}