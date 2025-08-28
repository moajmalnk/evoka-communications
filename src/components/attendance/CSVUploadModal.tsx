import { useState, useRef } from 'react';
import { Upload, FileText, Download, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CSVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (csvData: string) => Promise<{ success: number; errors: string[] }>;
}

export function CSVUploadModal({
  isOpen,
  onClose,
  onUpload,
}: CSVUploadModalProps) {
  const [csvData, setCsvData] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvData(content);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!csvData.trim()) {
      return;
    }

    setIsUploading(true);
    try {
      const result = await onUpload(csvData);
      setUploadResult(result);
    } catch (error) {
      console.error('Error uploading CSV:', error);
      setUploadResult({ success: 0, errors: ['Upload failed. Please try again.'] });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setCsvData('');
    setUploadResult(null);
    setIsUploading(false);
    onClose();
  };

  const downloadTemplate = () => {
    const template = `employeeId,date,checkIn,checkOut,notes,location
emp-1,2024-01-29,09:00,18:00,Regular day,Office
emp-2,2024-01-29,08:45,17:45,Early start,Office
emp-3,2024-01-29,10:15,19:00,Traffic delay,Office`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const csvFormat = `CSV Format:
- employeeId: Employee ID (e.g., emp-1)
- date: Date in YYYY-MM-DD format
- checkIn: Check-in time in HH:MM format (optional)
- checkOut: Check-out time in HH:MM format (optional)
- notes: Additional notes (optional)
- location: Work location (optional, defaults to Office)`;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Import Attendance
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to import multiple attendance records at once
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* CSV Format Information */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Required CSV Format:</p>
                <pre className="text-xs bg-muted p-2 rounded whitespace-pre-wrap">{csvFormat}</pre>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={downloadTemplate}
                  className="mt-2"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="csvFile">Upload CSV File</Label>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose File
              </Button>
              {csvData && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCsvData('')}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* CSV Data Preview */}
          <div className="space-y-2">
            <Label htmlFor="csvData">CSV Data Preview</Label>
            <Textarea
              id="csvData"
              placeholder="Paste CSV data here or upload a file..."
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
          </div>

          {/* Upload Results */}
          {uploadResult && (
            <div className="space-y-2">
              <Label>Upload Results</Label>
              <div className="space-y-2">
                <Alert className={uploadResult.success > 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  {uploadResult.success > 0 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium">
                        {uploadResult.success > 0 
                          ? `Successfully imported ${uploadResult.success} records`
                          : 'No records were imported'
                        }
                      </p>
                      {uploadResult.errors.length > 0 && (
                        <div>
                          <p className="font-medium text-red-600">Errors:</p>
                          <ul className="text-sm text-red-600 list-disc list-inside">
                            {uploadResult.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Close
          </Button>
          <Button 
            type="submit" 
            disabled={isUploading || !csvData.trim()} 
            onClick={handleSubmit}
            className="bg-gradient-primary shadow-primary"
          >
            {isUploading ? 'Uploading...' : 'Import Records'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
