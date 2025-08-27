import { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, MessageSquare, FileText, Download, Clock, User, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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

interface WorkSubmissionReviewModalProps {
  submission: WorkSubmission | null;
  isOpen: boolean;
  onClose: () => void;
  onReview: (submissionId: string, review: WorkSubmissionReview) => void;
}

export function WorkSubmissionReviewModal({
  submission,
  isOpen,
  onClose,
  onReview,
}: WorkSubmissionReviewModalProps) {
  const { user } = useAuth();
  const [reviewData, setReviewData] = useState<WorkSubmissionReview>({
    submissionId: '',
    status: 'pending_review',
    feedback: '',
    rejectionReason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!submission) return null;

  const getStatusVariant = (status: WorkSubmissionStatus) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'in_progress':
        return 'secondary';
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
        return 'text-green-600';
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Review Work Submission
          </DialogTitle>
          <DialogDescription>
            Review the submitted work and provide feedback or approval
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Submission Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge 
                  variant={getStatusVariant(submission.status)}
                  className={getStatusColor(submission.status)}
                >
                  {getStatusLabel(submission.status)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Submitted on {new Date(submission.submissionDate).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-xl font-semibold">{submission.title}</h3>
              <p className="text-sm text-muted-foreground">
                Task: {submission.taskTitle} • Project: {submission.projectName}
              </p>
            </div>
          </div>

          <Separator />

          {/* Submission Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Employee Information */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Employee Information
                </h3>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{submission.employeeName}</p>
                  <p className="text-sm text-muted-foreground">Employee ID: {submission.employeeId}</p>
                </div>
              </div>

              {/* Project Information */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Project Information
                </h3>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{submission.projectName}</p>
                  <p className="text-sm text-muted-foreground">Project ID: {submission.projectId}</p>
                </div>
              </div>

              {/* Time Information */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time Information
                </h3>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{submission.timeSpent} hours</p>
                  <p className="text-sm text-muted-foreground">
                    Submitted: {new Date(submission.submissionDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Work Description */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Work Description
                </h3>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">{submission.description}</p>
                </div>
              </div>

              {/* Attachments */}
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
            </div>
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
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
          
          {canReview && submission.status === 'pending_review' && (
            <>
              <Button
                variant="outline"
                onClick={() => handleReview('needs_revision')}
                disabled={isSubmitting}
                className="border-orange-500 text-orange-600 hover:bg-orange-50"
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Request Revision
              </Button>
              
              <Button
                variant="destructive"
                onClick={() => handleReview('rejected')}
                disabled={isSubmitting || !reviewData.rejectionReason.trim()}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
              
              <Button
                onClick={() => handleReview('approved')}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
