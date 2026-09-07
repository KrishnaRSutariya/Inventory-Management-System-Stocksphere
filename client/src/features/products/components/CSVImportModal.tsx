import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { importProductsCsv } from '../api/products.api';
import { toast } from 'sonner';

export interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    totalProcessed: number;
    successCount: number;
    failureCount: number;
    errors: Array<{ row: number; reason: string }>;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a CSV file');
      return;
    }

    setIsLoading(true);
    try {
      const summary = await importProductsCsv(file);
      setResult(summary);
      toast.success(`Processed ${summary.totalProcessed} records (${summary.successCount} successful)`);
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to import CSV');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Bulk Import Products from CSV"
      description="Upload a CSV file with columns: Product Name, SKU, Category, Quantity, Unit Price, Supplier"
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={handleClose}>
            {result ? 'Done' : 'Cancel'}
          </Button>
          {!result && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleUpload}
              disabled={!file}
              isLoading={isLoading}
              leftIcon={<UploadCloud className="w-4 h-4" />}
            >
              Start Import
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-4">
        {!result ? (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900/40 text-center">
            <UploadCloud className="w-10 h-10 text-blue-500 mb-3" />
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {file ? file.name : 'Choose CSV file to upload'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports UTF-8 CSV formatted spreadsheets up to 5MB
            </p>
            <label className="mt-4">
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer shadow-xs">
                <FileText className="w-4 h-4" />
                <span>Browse Files</span>
              </span>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                  {result.successCount}
                </p>
                <p className="text-xs text-emerald-600">Imported Successfully</p>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                <AlertCircle className="w-5 h-5 text-rose-600 mx-auto mb-1" />
                <p className="text-xl font-bold text-rose-700 dark:text-rose-300">
                  {result.failureCount}
                </p>
                <p className="text-xs text-rose-600">Failed Records</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs space-y-1 max-h-40 overflow-y-auto">
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  Row Validation Errors:
                </p>
                {result.errors.map((err, i) => (
                  <p key={i} className="text-rose-600 dark:text-rose-400">
                    Row {err.row}: {err.reason}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
