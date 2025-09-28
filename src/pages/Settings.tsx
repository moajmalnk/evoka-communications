import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Save,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Percent,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CategoryModal } from '@/components/settings/CategoryModal';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { categoryService, Category, CategoryType } from '@/lib/categoryService';
import { useAuth } from '@/contexts/AuthContext';

// Remove duplicate Category interface - using the one from categoryService

interface TaxSettings {
  enabled: boolean;
  defaultRate: number;
  rates: { [key: string]: number };
}

interface ApiErrorData {
  detail?: string;
  message?: string;
  name?: string[];
  [key: string]: unknown;
}

export function Settings() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  // Categories state - now using a single object to store all categories
  const [categories, setCategories] = useState<Record<CategoryType, Category[]>>({
    project: [],
    task: [],
    leave: [],
    payment: [],
    finance: [],
    jobrole: [],
    department: []
  });

  // Loading states for each category type
  const [loadingStates, setLoadingStates] = useState<Record<CategoryType, boolean>>({
    project: false,
    task: false,
    leave: false,
    payment: false,
    finance: false,
    jobrole: false,
    department: false
  });

  const [isSaving, setIsSaving] = useState(false);
  const [activeCategoryTab, setActiveCategoryTab] = useState<CategoryType>('project');

  // Delete confirmation states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string; type: CategoryType } | null>(null);

  // Tax settings state
  const [taxSettings, setTaxSettings] = useState<TaxSettings>({
    enabled: true,
    defaultRate: 15.0,
    rates: {
      'Standard': 15.0,
      'Reduced': 8.0,
      'Zero': 0.0,
    }
  });

  // Modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentCategoryType, setCurrentCategoryType] = useState<CategoryType>('project');

  // Load categories for the active tab when it changes
  useEffect(() => {
    loadCategoryByType(activeCategoryTab);
  }, [activeCategoryTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadCategoryByType = async (type: CategoryType, forceReload = false) => {
    // Skip if already loaded and not forcing reload
    if (!forceReload && categories[type].length > 0) {
      return;
    }

    try {
      setLoadingStates(prev => ({ ...prev, [type]: true }));
      const categoryData = await categoryService.getCategories(type);
      setCategories(prev => ({ ...prev, [type]: categoryData }));
    } catch (error: unknown) {
      console.error(`Error loading ${type} categories:`, error);
      
      // Extract error message from API response
      let errorMessage = `Failed to load ${type} categories. Please try again.`;
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: ApiErrorData } };
        const errorData = axiosError.response?.data;
        
        if (errorData?.detail) {
          errorMessage = errorData.detail;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as { message: string }).message;
      }
      
       toast({
         title: 'Error',
         description: errorMessage,
         variant: 'destructive',
         duration: 5000, // Auto-close after 5 seconds
       });
    } finally {
      setLoadingStates(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSaveCategory = async (newCategory: Category) => {
    try {
      // Check authentication before making API calls
      if (!isAuthenticated) {
         toast({
           title: 'Authentication Required',
           description: 'Please log in to create or update categories.',
           variant: 'destructive',
           duration: 5000, // Auto-close after 5 seconds
         });
        return;
      }

      console.log('Attempting to save category:', {
        category: newCategory,
        editingCategory,
        currentCategoryType,
        isAuthenticated,
        user
      });

      setIsSaving(true);
      
      if (editingCategory) {
        // Update existing category
        await categoryService.updateCategory(currentCategoryType, editingCategory.id, {
          name: newCategory.name,
          description: newCategory.description,
        });
      } else {
        // Create new category
        await categoryService.createCategory(currentCategoryType, {
          name: newCategory.name,
          description: newCategory.description,
        });
      }

      // Reload the specific category type
      await loadCategoryByType(currentCategoryType, true);
      
       toast({ 
         title: 'Success', 
         description: `Category ${editingCategory ? 'updated' : 'created'} successfully!`,
         duration: 3000, // Auto-close after 3 seconds
       });
      closeCategoryModal();
     } catch (error: unknown) {
       console.error('Error saving category:', error);
       
       // Extract error message from API response
       let errorMessage = `Failed to ${editingCategory ? 'update' : 'create'} category. Please try again.`;
       
       if (error && typeof error === 'object' && 'response' in error) {
         const axiosError = error as { 
           response?: { 
             data?: ApiErrorData;
             name?: string[];
           } 
         };
         
         console.log('Axios error response:', axiosError.response);
         console.log('Response data:', axiosError.response?.data);
         console.log('Response name:', axiosError.response?.name);
         
         // Check if error is in response.data
         const errorData = axiosError.response?.data;
         if (errorData?.name && Array.isArray(errorData.name)) {
           errorMessage = errorData.name[0]; // Get first error message
           console.log('Using data.name error:', errorMessage);
         } else if (errorData?.detail) {
           errorMessage = errorData.detail;
           console.log('Using data.detail error:', errorMessage);
         } else if (errorData?.message) {
           errorMessage = errorData.message;
           console.log('Using data.message error:', errorMessage);
         } else if (typeof errorData === 'string') {
           errorMessage = errorData;
           console.log('Using data string error:', errorMessage);
         }
         
         // Check if error is directly in response (as shown in your console log)
         if (axiosError.response?.name && Array.isArray(axiosError.response.name)) {
           errorMessage = axiosError.response.name[0];
           console.log('Using response.name error:', errorMessage);
         }
       } else if (error && typeof error === 'object' && 'message' in error) {
         errorMessage = (error as { message: string }).message;
         console.log('Using error.message:', errorMessage);
       }
       
       console.log('Final error message:', errorMessage);
      
       toast({
         title: 'Error',
         description: errorMessage,
         variant: 'destructive',
         duration: 5000, // Auto-close after 5 seconds
       });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryType: CategoryType) => {
    try {
      await categoryService.deleteCategory(categoryType, categoryId);
      
      // Reload the specific category type
      await loadCategoryByType(categoryType, true);
      
       toast({ 
         title: 'Success', 
         description: 'Category deleted successfully!',
         duration: 3000, // Auto-close after 3 seconds
       });
    } catch (error: unknown) {
      console.error('Error deleting category:', error);
      
      // Extract error message from API response
      let errorMessage = 'Failed to delete category. Please try again.';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: ApiErrorData } };
        const errorData = axiosError.response?.data;
        
        if (errorData?.detail) {
          errorMessage = errorData.detail;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as { message: string }).message;
      }
      
       toast({
         title: 'Error',
         description: errorMessage,
         variant: 'destructive',
         duration: 5000, // Auto-close after 5 seconds
       });
    }
  };

  const openDeleteDialog = (category: Category, categoryType: CategoryType) => {
    setCategoryToDelete({
      id: category.id,
      name: category.name,
      type: categoryType
    });
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  const confirmDelete = async () => {
    if (categoryToDelete) {
      await handleDeleteCategory(categoryToDelete.id, categoryToDelete.type);
      closeDeleteDialog();
    }
  };

  const openCategoryModal = (type: CategoryType, category?: Category) => {
    setCurrentCategoryType(type);
    setModalMode(category ? 'edit' : 'create');
    setEditingCategory(category || null);
    setIsCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
  };

  const getCategoryTypeLabel = (type: CategoryType) => {
    switch (type) {
      case 'project': return 'Project';
      case 'task': return 'Task';
      case 'leave': return 'Leave';
      case 'payment': return 'Payment';
      case 'finance': return 'Finance';
      case 'jobrole': return 'Job Role';
      case 'department': return 'Department';
      default: return type;
    }
  };

  const renderCategoryTable = (type: CategoryType) => {
    const categoryData = categories[type];
    const isLoading = loadingStates[type];
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold capitalize">{getCategoryTypeLabel(type)} Categories</h3>
          <Button 
            onClick={() => openCategoryModal(type)} 
            size="sm" 
            className="bg-gradient-primary shadow-primary"
            disabled={isSaving}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add {getCategoryTypeLabel(type)} Category
          </Button>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-4 gap-4 p-4 font-medium text-sm border-b bg-muted/50">
            <div>Name</div>
            <div>Description</div>
            <div>Created</div>
            <div>Actions</div>
          </div>
          
          {isLoading ? (
            <div className="space-y-4 p-4">
              {/* Skeleton for table rows */}
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 p-4 border-b">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              ))}
            </div>
          ) : categoryData.length === 0 ? (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              No {getCategoryTypeLabel(type).toLowerCase()} categories found. Click "Add Category" to create one.
            </div>
          ) : (
            categoryData.map((category) => (
              <div key={category.id} className="grid grid-cols-4 gap-4 p-4 border-b items-center hover:bg-muted/30 transition-colors">
                <div className="font-medium">{category.name}</div>
                <div className="text-sm text-muted-foreground">{category.description || '-'}</div>
                <div className="text-sm text-muted-foreground">
                  {(category.createdAt || category.created_at) ? new Date(category.createdAt || category.created_at!).toLocaleDateString() : '-'}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openCategoryModal(type, category)}
                    className="hover:bg-blue-50 hover:border-blue-200"
                    disabled={isSaving}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openDeleteDialog(category, type)}
                    className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                    disabled={isSaving}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage system categories, tax settings, and configuration
          </p>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="tax" className="flex items-center gap-2">
            <Percent className="h-4 w-4" />
            Tax Settings
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Categories Management</CardTitle>
              {/* <CardDescription>
                Manage categories for projects, tasks, leave types, payment classifications, finance, job roles, and departments
              </CardDescription> */}
            </CardHeader>
            <CardContent>
              <Tabs value={activeCategoryTab} onValueChange={(value) => setActiveCategoryTab(value as CategoryType)} className="space-y-4">
                <TabsList className="grid w-full grid-cols-7">
                  <TabsTrigger value="project">Project</TabsTrigger>
                  <TabsTrigger value="task">Task</TabsTrigger>
                  <TabsTrigger value="leave">Leave</TabsTrigger>
                  <TabsTrigger value="payment">Payment</TabsTrigger>
                  <TabsTrigger value="finance">Finance</TabsTrigger>
                  <TabsTrigger value="jobrole">Job Role</TabsTrigger>
                  <TabsTrigger value="department">Department</TabsTrigger>
                </TabsList>
                
                <TabsContent value="project" className="space-y-4">
                  {renderCategoryTable('project')}
                </TabsContent>
                
                <TabsContent value="task" className="space-y-4">
                  {renderCategoryTable('task')}
                </TabsContent>
                
                <TabsContent value="leave" className="space-y-4">
                  {renderCategoryTable('leave')}
                </TabsContent>
                
                <TabsContent value="payment" className="space-y-4">
                  {renderCategoryTable('payment')}
                </TabsContent>
                
                <TabsContent value="finance" className="space-y-4">
                  {renderCategoryTable('finance')}
                </TabsContent>
                
                <TabsContent value="jobrole" className="space-y-4">
                  {renderCategoryTable('jobrole')}
                </TabsContent>
                
                <TabsContent value="department" className="space-y-4">
                  {renderCategoryTable('department')}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Settings Tab */}
        <TabsContent value="tax" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax Configuration</CardTitle>
              <CardDescription>
                Configure tax settings and rates for invoicing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="tax-enabled">Enable Tax System</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable tax calculations in invoices
                  </p>
                </div>
                <Switch
                  id="tax-enabled"
                  checked={taxSettings.enabled}
                  onCheckedChange={(checked) => 
                    setTaxSettings(prev => ({ ...prev, enabled: checked }))
                  }
                />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <Label htmlFor="default-tax-rate">Default Tax Rate (%)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="default-tax-rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={taxSettings.defaultRate}
                    onChange={(e) => 
                      setTaxSettings(prev => ({ ...prev, defaultRate: parseFloat(e.target.value) || 0 }))
                    }
                    className="w-32"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Tax Rate Categories</Label>
                <div className="space-y-3">
                  {Object.entries(taxSettings.rates).map(([name, rate]) => (
                    <div key={name} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{name}</span>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={rate}
                          onChange={(e) => 
                            setTaxSettings(prev => ({
                              ...prev,
                              rates: { ...prev.rates, [name]: parseFloat(e.target.value) || 0 }
                            }))
                          }
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified about important updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications in the app
                    </p>
                  </div>
                  <Switch id="push-notifications" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={closeCategoryModal}
        onSave={handleSaveCategory}
        mode={modalMode}
        categoryType={currentCategoryType}
        editingCategory={editingCategory}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete Category"
        description={`Are you sure you want to delete the category "${categoryToDelete?.name}"? This action cannot be undone and will permanently remove the category from the system.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isSaving}
      />
    </div>
  );
}
