import { useState, useEffect } from 'react';
import { Tag, Loader2 } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { Category, CategoryType } from '@/lib/categoryService';

// Remove duplicate Category interface - using the one from categoryService

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Category) => void;
  mode: 'create' | 'edit';
  categoryType: CategoryType;
  editingCategory?: Category | null;
}

export function CategoryModal({
  isOpen,
  onClose,
  onSave,
  mode,
  categoryType,
  editingCategory
}: CategoryModalProps) {
  const { toast } = useToast();
  
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });

  // Update form when editing category changes
  useEffect(() => {
    if (editingCategory) {
      setCategoryForm({
        name: editingCategory.name,
        description: editingCategory.description || ''
      });
    } else {
      setCategoryForm({
        name: '',
        description: ''
      });
    }
  }, [editingCategory]);

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

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!categoryForm.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const newCategory: Category = {
        id: editingCategory?.id || '',
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim(),
        createdAt: editingCategory?.createdAt || new Date().toISOString()
      };

      await onSave(newCategory);
      handleClose();
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: 'Error',
        description: 'Failed to save category. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCategoryForm({
      name: '',
      description: ''
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {/* <Tag className="h-5 w-5" /> */}
            {mode === 'create' ? `Create New ${getCategoryTypeLabel(categoryType)} Category` : `Edit ${getCategoryTypeLabel(categoryType)} Category`}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 'Add a new' : 'Update'} {getCategoryTypeLabel(categoryType).toLowerCase()} category to organize your system.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Tag className="h-4 w-4" />
              {getCategoryTypeLabel(categoryType)} Category Information
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="category-name">Category Name *</Label>
              <Input
                id="category-name"
                placeholder={`Enter ${getCategoryTypeLabel(categoryType).toLowerCase()} category name`}
                value={categoryForm.name}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-description">Description</Label>
              <Textarea
                id="category-description"
                placeholder="Optional description for this category"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="bg-gradient-primary shadow-primary"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                mode === 'create' ? `Create ${getCategoryTypeLabel(categoryType)} Category` : `Update ${getCategoryTypeLabel(categoryType)} Category`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
