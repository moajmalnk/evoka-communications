import { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, MessageSquare, FileText, Download, Clock, User, Building2, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { WorkSubmission, WorkSubmissionStatus, WorkSubmissionReview } from '@/types/workSubmission';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface WorkSubmissionReviewModalProps {
  submission: WorkSubmission | null;
  isOpen: boolean;
  onClose: () => void;
  onReview: (submissionId: string, review: WorkSubmissionReview) => void;
  onEdit?: (submission: WorkSubmission) => void;
  onDelete?: (submissionId: string) => void;
}

export function WorkSubmissionReviewModal({
  submission,
  isOpen,
  onClose,
  onReview,
  onEdit,
  onDelete,
}: WorkSubmissionReviewModalProps) {
  const { user } = useAuth();
  const [reviewData, setReviewData] = useState<WorkSubmissionReview>({
    submissionId: '',
    status: 'pending_review',
    feedback: '',
    rejectionReason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  if (!submission) return null;

  const getStatusVariant = (status: WorkSubmissionStatus) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending_review':
        return 'outline';
      case 'rejected':
        return 'destructive';
      case 'needs_revision':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: WorkSubmissionStatus) => {
    switch (status) {
      case 'approved':
        return 'text-white';
      case 'pending_review':
        return 'text-yellow-600';
      case 'needs_revision':
        return 'text-orange-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusLabel = (status: WorkSubmissionStatus) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'pending_review':
        return 'Pending Review';
      case 'needs_revision':
        return 'Needs Revision';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const handleReview = async (status: WorkSubmissionStatus) => {
    if (!submission) return;

    const review: WorkSubmissionReview = {
      submissionId: submission.id,
      status,
      feedback: reviewData.feedback,
      rejectionReason: status === 'rejected' ? reviewData.rejectionReason : undefined,
    };

    setIsSubmitting(true);
    try {
      await onReview(submission.id, review);
      handleClose();
    } catch (error) {
      console.error('Error reviewing submission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReviewData({
      submissionId: '',
      status: 'pending_review',
      feedback: '',
      rejectionReason: '',
    });
    setIsSubmitting(false);
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canReview = user?.role === 'project_coordinator' || 
                   user?.role === 'admin' || 
                   user?.role === 'general_manager';

  const canEdit = user?.role === 'admin' || 
                  user?.role === 'general_manager' || 
                  (user?.role === 'employee' && user.id === submission.employeeId);

  const canDelete = user?.role === 'admin' || 
                   user?.role === 'general_manager' || 
                   (user?.role === 'employee' && user.id === submission.employeeId);

  const handleDeleteClick = () => {
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!canDelete || !submission || !onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(submission.id);
      onClose();
    } catch (error) {
      console.error('Error deleting submission:', error);
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl font-bold">
                    {submission.title.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-background border-2 border-background rounded-full">
                  <FileText className="h-4 w-4" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <DialogTitle className="text-2xl font-bold">
                    {submission.title}
                  </DialogTitle>
                </div>
                <DialogDescription className="text-sm text-muted-foreground">
                  Submission ID: {submission.id} • Submitted {new Date(submission.submissionDate).toLocaleDateString()}
                </DialogDescription>
                <Badge 
                  variant={getStatusVariant(submission.status)}
                  className="text-xs font-medium"
                >
                  {getStatusLabel(submission.status)}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canEdit && onEdit && (
                <Button 
                  onClick={() => onEdit(submission)}
                  variant="ghost"
                  size="sm"
                  className="text-blue-700 hover:text-blue-700 border border-blue-300 hover:border-blue-400"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {canDelete && onDelete && (
                <Button 
                  onClick={handleDeleteClick}
                  variant="ghost"
                  size="sm"
                  className="text-red-700 hover:text-red-700 border border-red-300 hover:border-red-400"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Submission Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Submission Information Card */}
              <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Submission Details</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Submission Title</label>
                    <p className="font-medium text-slate-400 mt-1">{submission.title}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium">Submission ID</label>
                      <p className="font-mono text-sm text-slate-400 mt-1">{submission.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <div className="mt-1">
                        <Badge 
                          variant={getStatusVariant(submission.status)}
                          className="text-xs font-medium"
                        >
                          {getStatusLabel(submission.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium">Task</label>
                      <p className="font-medium text-slate-400 mt-1">{submission.taskTitle}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Project</label>
                      <p className="font-medium text-slate-400 mt-1">{submission.projectName}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium">Employee</label>
                      <p className="font-medium text-slate-400 mt-1">{submission.employeeName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Time Spent</label>
                      <p className="font-medium text-slate-400 mt-1">{submission.timeSpent} hours</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Description */}
              <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Work Description</h3>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-slate-400 leading-relaxed">{submission.description}</p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Submission Timeline */}
              <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Timeline</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Submitted Date</label>
                    <p className="text-sm text-slate-400 mt-1">
                      {new Date(submission.submissionDate).toLocaleDateString()}
                    </p>
                  </div>
                  {submission.reviewDate && (
                    <div>
                      <label className="text-sm font-medium">Review Date</label>
                      <p className="text-sm text-slate-400 mt-1">
                        {new Date(submission.reviewDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium">Last Updated</label>
                    <p className="text-sm text-slate-400 mt-1">
                      {new Date(submission.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Employee Information */}
              <div className="border border-slate-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <User className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Employee Info</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Employee Name</label>
                    <p className="font-medium text-slate-400 mt-1">{submission.employeeName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Employee ID</label>
                    <p className="text-sm text-slate-400 mt-1">{submission.employeeId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Coordinator</label>
                    <p className="font-medium text-slate-400 mt-1">{submission.coordinatorName}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Attachments ({submission.attachments.length})
            </h3>
            {submission.attachments.length > 0 ? (
              <div className="space-y-2">
                {submission.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{attachment.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.size)} • {new Date(attachment.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">No attachments uploaded</p>
              </div>
            )}
          </div>

          {/* Review Section */}
          {canReview && submission.status === 'pending_review' && (
            <>
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Review & Feedback
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="feedback">Feedback (Optional)</Label>
                  <Textarea
                    id="feedback"
                    placeholder="Provide constructive feedback on the submitted work..."
                    value={reviewData.feedback}
                    onChange={(e) => setReviewData(prev => ({ ...prev, feedback: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rejectionReason">Rejection Reason (Required if rejecting)</Label>
                  <Textarea
                    id="rejectionReason"
                    placeholder="Explain why the work is being rejected and what needs to be improved..."
                    value={reviewData.rejectionReason}
                    onChange={(e) => setReviewData(prev => ({ ...prev, rejectionReason: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
            </>
          )}

          {/* Previous Review Information */}
          {submission.status !== 'pending_review' && (
            <>
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Review Information
                </h3>
                
                <div className="p-3 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge 
                      variant={getStatusVariant(submission.status)}
                      className={getStatusColor(submission.status)}
                    >
                      {getStatusLabel(submission.status)}
                    </Badge>
                  </div>
                  {submission.reviewDate && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Reviewed on:</span>
                      <span className="text-sm font-medium">
                        {new Date(submission.reviewDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {submission.feedback && (
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Feedback:</span>
                      <p className="text-sm">{submission.feedback}</p>
                    </div>
                  )}
                  {submission.rejectionReason && (
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Rejection Reason:</span>
                      <p className="text-sm">{submission.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          
          {canReview && submission.status === 'pending_review' && (
            <>
              <Button
                variant="outline"
                onClick={() => handleReview('needs_revision')}
                disabled={isSubmitting}
                className="border-orange-500 text-orange-600 hover:bg-orange-600"
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Request Revision
              </Button>
              
              <Button
                 className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => handleReview('rejected')}
                disabled={isSubmitting || !reviewData.rejectionReason.trim()}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
              
              <Button
                onClick={() => handleReview('approved')}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Work Submission"
        description={`Are you sure you want to delete "${submission.title}"? This action cannot be undone.`}
        confirmText="Delete Submission"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isDeleting}
      />
    </Dialog>
  );
}
