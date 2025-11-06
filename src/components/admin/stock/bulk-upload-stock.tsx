"use client";

import { useState, useRef } from "react";
import { Upload, FileUp, X, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  showConfirmAlert,
  showErrorAlert,
  showSuccessAlert,
} from "@/lib/helpers/sweetalert2";

interface UploadResult {
  success: boolean;
  updatedCount: number;
  skippedCount: number;
  skipped: string[];
  totalProcessed: number;
  message: string;
}

export default function BulkUploadStock() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith(".csv")) {
        showErrorAlert("Invalid File", "Please select a CSV file");
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        showErrorAlert("File Too Large", "Maximum file size is 5MB");
        return;
      }

      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showErrorAlert("No File", "Please select a CSV file first");
      return;
    }

    const confirm = await showConfirmAlert(
      "Upload CSV",
      `Are you sure you want to upload "${selectedFile.name}"? This will update stock for all matching SKUs.`
    );

    if (!confirm) return;

    setUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/admin/stock/bulk-update", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadResult(result);
        showSuccessAlert("Success!", result.message);
        // Clear file after successful upload
        handleRemoveFile();
      } else {
        // Show errors if any
        if (result.errors && result.errors.length > 0) {
          const errorList = result.errors.join("\n");
          showErrorAlert("Upload Failed", errorList);
        } else {
          showErrorAlert("Upload Failed", result.message);
        }
      }
    } catch (error: any) {
      showErrorAlert("Error", error.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload CSV File
          </CardTitle>
          <CardDescription>
            Upload a CSV file to bulk update product stock
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Input */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            {!selectedFile ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <FileUp className="h-12 w-12 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Click to select a CSV file or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    Maximum file size: 5MB
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="csv-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Select File
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <FileUp className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading and processing...</span>
                <span className="text-muted-foreground">Please wait</span>
              </div>
              <Progress value={undefined} className="w-full" />
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="w-full"
            size="lg"
          >
            {uploading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload & Update Stock
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Upload Result */}
      {uploadResult && (
        <Alert variant={uploadResult.success ? "default" : "destructive"}>
          {uploadResult.success ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>Upload Complete</AlertTitle>
          <AlertDescription>
            <div className="space-y-2 mt-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Updated: {uploadResult.updatedCount}
                </Badge>
                {uploadResult.skippedCount > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Skipped: {uploadResult.skippedCount}
                  </Badge>
                )}
                <Badge variant="outline">
                  Total Processed: {uploadResult.totalProcessed}
                </Badge>
              </div>

              {uploadResult.skipped && uploadResult.skipped.length > 0 && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm font-medium text-yellow-800 mb-1">
                    Skipped SKUs (not found in database):
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {uploadResult.skipped.map((sku) => (
                      <Badge
                        key={sku}
                        variant="outline"
                        className="text-xs bg-white"
                      >
                        {sku}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
