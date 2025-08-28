import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Save,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Percent,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
  createdAt: string;
}

interface TaxSettings {
  enabled: boolean;
  defaultRate: number;
  rates: { [key: string]: number };
}

export function Settings() {
  const { toast } = useToast();
  
  // Categories state
  const [projectCategories, setProjectCategories] = useState<Category[]>([
    { id: '1', name: 'Web Development', description: 'Website and web application projects', color: '#3b82f6', isActive: true, createdAt: '2024-01-01' },
    { id: '2', name: 'Mobile App', description: 'Mobile application development', color: '#10b981', isActive: true, createdAt: '2024-01-01' },
    { id: '3', name: 'Design', description: 'UI/UX and graphic design projects', color: '#f59e0b', isActive: true, createdAt: '2024-01-01' },
    { id: '4', name: 'Consulting', description: 'Business and technical consulting', color: '#8b5cf6', isActive: true, createdAt: '2024-01-01' },
  ]);

  const [taskCategories, setTaskCategories] = useState<Category[]>([
    { id: '1', name: 'Development', description: 'Coding and programming tasks', color: '#3b82f6', isActive: true, createdAt: '2024-01-01' },
    { id: '2', name: 'Testing', description: 'Quality assurance and testing', color: '#ef4444', isActive: true, createdAt: '2024-01-01' },
    { id: '3', name: 'Documentation', description: 'Writing and documentation', color: '#10b981', isActive: true, createdAt: '2024-01-01' },
    { id: '4', name: 'Research', description: 'Research and analysis tasks', color: '#f59e0b', isActive: true, createdAt: '2024-01-01' },
  ]);

  const [leaveCategories, setLeaveCategories] = useState<Category[]>([
    { id: '1', name: 'Annual Leave', description: 'Regular vacation time', color: '#10b981', isActive: true, createdAt: '2024-01-01' },
    { id: '2', name: 'Sick Leave', description: 'Health-related time off', color: '#ef4444', isActive: true, createdAt: '2024-01-01' },
    { id: '3', name: 'Personal Leave', description: 'Personal time off', color: '#f59e0b', isActive: true, createdAt: '2024-01-01' },
    { id: '4', name: 'Maternity Leave', description: 'Maternity and parental leave', color: '#8b5cf6', isActive: true, createdAt: '2024-01-01' },
  ]);

  const [paymentCategories, setPaymentCategories] = useState<Category[]>([
    { id: '1', name: 'Office Supplies', description: 'Office materials and supplies', color: '#3b82f6', isActive: true, createdAt: '2024-01-01' },
    { id: '2', name: 'Travel', description: 'Business travel expenses', color: '#10b981', isActive: true, createdAt: '2024-01-01' },
    { id: '3', name: 'Equipment', description: 'Hardware and equipment purchases', color: '#f59e0b', isActive: true, createdAt: '2024-01-01' },
    { id: '4', name: 'Software', description: 'Software licenses and subscriptions', color: '#8b5cf6', isActive: true, createdAt: '2024-01-01' },
  ]);

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
  const [currentCategoryType, setCurrentCategoryType] = useState<'project' | 'task' | 'leave' | 'payment'>('project');

  // Form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    isActive: true
  });

  const handleSaveCategory = () => {
    if (!categoryForm.name.trim()) {
      toast({ title: 'Error', description: 'Category name is required', variant: 'destructive' });
      return;
    }

    const newCategory: Category = {
      id: editingCategory?.id || Date.now().toString(),
      name: categoryForm.name.trim(),
      description: categoryForm.description.trim(),
      color: categoryForm.color,
      isActive: categoryForm.isActive,
      createdAt: editingCategory?.createdAt || new Date().toISOString()
    };

    let updatedCategories: Category[];
    let setterFunction: (categories: Category[]) => void;

    switch (currentCategoryType) {
      case 'project':
        setterFunction = setProjectCategories;
        updatedCategories = editingCategory 
          ? projectCategories.map(c => c.id === editingCategory.id ? newCategory : c)
          : [...projectCategories, newCategory];
        break;
      case 'task':
        setterFunction = setTaskCategories;
        updatedCategories = editingCategory 
          ? taskCategories.map(c => c.id === editingCategory.id ? newCategory : c)
          : [...taskCategories, newCategory];
        break;
      case 'leave':
        setterFunction = setLeaveCategories;
        updatedCategories = editingCategory 
          ? leaveCategories.map(c => c.id === editingCategory.id ? newCategory : c)
          : [...leaveCategories, newCategory];
        break;
      case 'payment':
        setterFunction = setPaymentCategories;
        updatedCategories = editingCategory 
          ? paymentCategories.map(c => c.id === editingCategory.id ? newCategory : c)
          : [...paymentCategories, newCategory];
        break;
      default:
        return;
    }

    setterFunction(updatedCategories);
    toast({ 
      title: 'Success', 
      description: `Category ${editingCategory ? 'updated' : 'created'} successfully!` 
    });
    closeCategoryModal();
  };

  const handleDeleteCategory = (categoryId: string, categoryType: 'project' | 'task' | 'leave' | 'payment') => {
    let setterFunction: (categories: Category[]) => void;
    let currentCategories: Category[];

    switch (categoryType) {
      case 'project':
        setterFunction = setProjectCategories;
        currentCategories = projectCategories;
        break;
      case 'task':
        setterFunction = setTaskCategories;
        currentCategories = taskCategories;
        break;
      case 'leave':
        setterFunction = setLeaveCategories;
        currentCategories = leaveCategories;
        break;
      case 'payment':
        setterFunction = setPaymentCategories;
        currentCategories = paymentCategories;
        break;
      default:
        return;
    }

    const updatedCategories = currentCategories.filter(c => c.id !== categoryId);
    setterFunction(updatedCategories);
    toast({ title: 'Success', description: 'Category deleted successfully!' });
  };

  const openCategoryModal = (type: 'project' | 'task' | 'leave' | 'payment', category?: Category) => {
    setCurrentCategoryType(type);
    setModalMode(category ? 'edit' : 'create');
    setEditingCategory(category || null);
    
    if (category) {
      setCategoryForm({
        name: category.name,
        description: category.description || '',
        color: category.color,
        isActive: category.isActive
      });
    } else {
      setCategoryForm({
        name: '',
        description: '',
        color: '#3b82f6',
        isActive: true
      });
    }
    
    setIsCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      description: '',
      color: '#3b82f6',
      isActive: true
    });
  };

  const handleSaveSettings = () => {
    // Save all settings logic would go here
    toast({ title: 'Success', description: 'Settings saved successfully!' });
  };

  const handleResetSettings = () => {
    // Reset to default settings logic would go here
    toast({ title: 'Info', description: 'Settings reset to defaults' });
  };

  const getCategoryTypeLabel = (type: 'project' | 'task' | 'leave' | 'payment') => {
    switch (type) {
      case 'project': return 'Project';
      case 'task': return 'Task';
      case 'leave': return 'Leave';
      case 'payment': return 'Payment';
      default: return type;
    }
  };

  const renderCategoryTable = (categories: Category[], type: 'project' | 'task' | 'leave' | 'payment') => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold capitalize">{type} Categories</h3>
        <Button onClick={() => openCategoryModal(type)} size="sm" className="bg-gradient-primary shadow-primary">
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-6 gap-4 p-4 font-medium text-sm border-b bg-muted/50">
          <div>Name</div>
          <div>Description</div>
          <div>Color</div>
          <div>Status</div>
          <div>Created</div>
          <div>Actions</div>
        </div>
        
        {categories.map((category) => (
          <div key={category.id} className="grid grid-cols-6 gap-4 p-4 border-b items-center hover:bg-muted/30 transition-colors">
            <div className="font-medium">{category.name}</div>
            <div className="text-sm text-muted-foreground">{category.description || '-'}</div>
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full border shadow-sm"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-sm font-mono">{category.color}</span>
            </div>
            <div>
              <Badge variant={category.isActive ? 'default' : 'secondary'}>
                {category.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {new Date(category.createdAt).toLocaleDateString()}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => openCategoryModal(type, category)}
                className="hover:bg-blue-50 hover:border-blue-200"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDeleteCategory(category.id, type)}
                className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleResetSettings}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset to Default
          </Button>
          <Button onClick={handleSaveSettings} className="bg-gradient-primary shadow-primary">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
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
              <CardDescription>
                Manage categories for projects, tasks, leave types, and payment classifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {renderCategoryTable(projectCategories, 'project')}
              <Separator />
              {renderCategoryTable(taskCategories, 'task')}
              <Separator />
              {renderCategoryTable(leaveCategories, 'leave')}
              <Separator />
              {renderCategoryTable(paymentCategories, 'payment')}
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

      {/* Enhanced Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {modalMode === 'create' ? 'Create New Category' : 'Edit Category'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {modalMode === 'create' ? 'Add a new' : 'Update'} {getCategoryTypeLabel(currentCategoryType).toLowerCase()} category
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeCategoryModal}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 space-y-6">
              <div>
                <Label htmlFor="category-name" className="text-sm font-medium text-gray-700">
                  Category Name *
                </Label>
                <Input
                  id="category-name"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={`Enter ${getCategoryTypeLabel(currentCategoryType).toLowerCase()} category name`}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="category-description" className="text-sm font-medium text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="category-description"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description for this category"
                  className="mt-2"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="category-color" className="text-sm font-medium text-gray-700">
                  Category Color
                </Label>
                <div className="mt-2 space-y-3">
                  <div className="flex items-center gap-3">
                    <Input
                      id="category-color"
                      type="color"
                      value={categoryForm.color}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, color: e.target.value }))}
                      className="w-12 h-12 p-1 rounded-lg border-2 border-gray-200 hover:border-gray-300 cursor-pointer"
                    />
                    <div className="flex-1">
                      <Input
                        value={categoryForm.color}
                        onChange={(e) => setCategoryForm(prev => ({ ...prev, color: e.target.value }))}
                        placeholder="#3b82f6"
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border shadow-sm"
                      style={{ backgroundColor: categoryForm.color }}
                    />
                    <span className="text-xs text-gray-500">Preview</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="category-active" className="text-sm font-medium text-gray-700">
                    Category Status
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    {categoryForm.isActive ? 'Active categories are available for use' : 'Inactive categories are hidden'}
                  </p>
                </div>
                <Switch
                  id="category-active"
                  checked={categoryForm.isActive}
                  onCheckedChange={(checked) => 
                    setCategoryForm(prev => ({ ...prev, isActive: checked }))
                  }
                />
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
              <Button 
                variant="outline" 
                onClick={closeCategoryModal} 
                className="flex-1 hover:bg-white"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveCategory} 
                className="flex-1 bg-gradient-primary shadow-primary hover:shadow-primary/80"
              >
                {modalMode === 'create' ? 'Create Category' : 'Update Category'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
