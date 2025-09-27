import { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Building, Clock, Edit, Save, X, Camera, Shield, Key, Globe, Settings, IndianRupee, TrendingUp, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { CustomCalendar } from '@/components/ui/custom-calendar';
import { useToast } from '@/hooks/use-toast';
import { EmployeeEditModal } from '@/components/employees/EmployeeEditModal';

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

export function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Create employee object from user data
  const employeeData: Employee = {
    id: user?.id || 'EMP-001',
    firstName: user?.firstName || 'John',
    lastName: user?.lastName || 'Doe',
    email: user?.email || 'john.doe@company.com',
    phone: user?.phone || '+1 (555) 123-4567',
    role: user?.role || 'employee',
    department: user?.department || 'Engineering',
    status: 'Active',
    joinDate: user?.joinDate || '2024-01-15',
    location: user?.location || 'New York, NY',
    salary: 75000,
    attendanceRate: 95,
    lastReview: '2024-03-15'
  };

  const [profileData, setProfileData] = useState({
    firstName: employeeData.firstName,
    lastName: employeeData.lastName,
    email: employeeData.email,
    phone: employeeData.phone,
    location: employeeData.location,
    department: employeeData.department,
    role: employeeData.role,
    joinDate: employeeData.joinDate,
    salary: employeeData.salary,
    status: employeeData.status,
    attendanceRate: employeeData.attendanceRate,
    lastReview: employeeData.lastReview,
    bio: 'Passionate about creating innovative solutions and driving team success.',
    timezone: 'UTC-5 (EST)',
    language: 'English'
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleEmployeeUpdated = (updatedEmployee: Employee) => {
    setProfileData(prev => ({
      ...prev,
      firstName: updatedEmployee.firstName,
      lastName: updatedEmployee.lastName,
      email: updatedEmployee.email,
      phone: updatedEmployee.phone,
      location: updatedEmployee.location,
      department: updatedEmployee.department,
      role: updatedEmployee.role,
      joinDate: updatedEmployee.joinDate,
      salary: updatedEmployee.salary,
      status: updatedEmployee.status,
      attendanceRate: updatedEmployee.attendanceRate,
      lastReview: updatedEmployee.lastReview
    }));
    
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'text-red-600';
      case 'general_manager':
        return 'text-purple-600';
      case 'hr':
        return 'text-blue-600';
      case 'project_coordinator':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRoleLabel = (role: string) => {
    return role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Employee';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and account settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleEditClick}
            className="bg-gradient-primary shadow-primary"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="relative mx-auto w-24 h-24">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl">
                  {profileData.firstName[0]}{profileData.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <CardTitle className="text-xl">
              {profileData.firstName} {profileData.lastName}
            </CardTitle>
            <CardDescription>
              <Badge 
                variant="outline" 
                className={getRoleColor(profileData.role)}
              >
                {getRoleLabel(profileData.role)}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Employee ID</p>
              <p className="font-mono text-sm font-medium">{employeeData.id}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Member since</p>
              <p className="font-medium">
                {new Date(profileData.joinDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long'
                })}
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Department</span>
                <span className="font-medium">{profileData.department}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium">{profileData.location}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge 
                  variant={profileData.status === 'Active' ? 'default' : 'secondary'}
                  className={profileData.status === 'Active' ? 'text-green-600' : 'text-gray-600'}
                >
                  {profileData.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{profileData.firstName}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{profileData.lastName}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Email Address</Label>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{profileData.email}</span>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{profileData.phone}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{profileData.location}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Bio</Label>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{profileData.bio}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Work Information
              </CardTitle>
              <CardDescription>
                Your professional details and work information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{profileData.department}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{getRoleLabel(profileData.role)}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Join Date</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {new Date(profileData.joinDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Employee ID</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm font-medium">{employeeData.id}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance & Salary Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance & Salary
              </CardTitle>
              <CardDescription>
                Your performance metrics and compensation details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Annual Salary</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-lg">₹{profileData.salary.toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Attendance Rate</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{profileData.attendanceRate}%</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Last Review</Label>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {profileData.lastReview ? new Date(profileData.lastReview).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'No review yet'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Preferences
              </CardTitle>
              <CardDescription>
                Customize your account settings and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{profileData.timezone}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{profileData.language}</span>
                  </div>
                </div>
              </div>
              
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Employee Edit Modal */}
      <EmployeeEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        employee={employeeData}
        onEmployeeUpdated={handleEmployeeUpdated}
      />
    </div>
  );
}
