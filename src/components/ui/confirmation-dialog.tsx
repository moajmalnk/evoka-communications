import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  isLoading?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  isLoading = false,
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="space-y-6 text-center">
          <div className="flex justify-center">
            {variant === 'destructive' ? (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border-2 border-red-200">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 border-2 border-blue-200">
                <X className="h-8 w-8 text-blue-600" />
              </div>
            )}
          </div>
          <div className="space-y-3">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {title}
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 leading-relaxed">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={isLoading}
            className={`w-full sm:w-auto order-1 sm:order-2 ${
              variant === 'destructive' 
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-red-200' 
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 shadow-blue-200'
            } shadow-lg transition-all duration-200`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
