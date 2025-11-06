"use client";

import { useState } from "react";
import { Upload, Download, History, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BulkUploadStock from "@/components/admin/stock/bulk-upload-stock";
import StockLogsTable from "@/components/admin/stock/stock-logs-table";

export default function StockManagementPage() {
  const [activeTab, setActiveTab] = useState("upload");

  const handleDownloadTemplate = () => {
    window.open("/api/admin/stock/template", "_blank");
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Stock Management
          </h1>
          <p className="text-muted-foreground">
            Bulk update product stock via CSV upload
          </p>
        </div>
        <Button
          onClick={handleDownloadTemplate}
          variant="outline"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Download Template
        </Button>
      </div>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>How it works:</strong> Upload a CSV file with columns{" "}
          <code className="px-1 py-0.5 bg-muted rounded text-sm">sku</code> and{" "}
          <code className="px-1 py-0.5 bg-muted rounded text-sm">stock</code>.
          The system will update matching products and log all changes.
        </AlertDescription>
      </Alert>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="h-4 w-4" />
            Bulk Upload
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <History className="h-4 w-4" />
            Update Logs
          </TabsTrigger>
        </TabsList>

        {/* Bulk Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <BulkUploadStock />

          {/* Guidelines Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                CSV Guidelines
              </CardTitle>
              <CardDescription>
                Follow these guidelines for successful stock updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">📋 Required Format</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm">
                  <div>sku,stock</div>
                  <div>SKU-COLLAR-001,150</div>
                  <div>SKU-HARNESS-002,200</div>
                  <div>SKU-LEASH-003,75</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">✅ Requirements</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>
                    Header row must be exactly: <code>sku,stock</code>
                  </li>
                  <li>
                    SKU must match exactly with products in database
                    (case-sensitive)
                  </li>
                  <li>Stock must be a valid number (0 or positive)</li>
                  <li>File must be in CSV format (.csv extension)</li>
                  <li>Maximum file size: 5MB</li>
                  <li>UTF-8 encoding recommended</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">⚠️ Important Notes</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>SKUs not found in database will be skipped</li>
                  <li>Negative stock values are not allowed</li>
                  <li>All updates are logged for audit trail</li>
                  <li>Changes take effect immediately</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">🎯 Best Practices</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Download and use the template for correct format</li>
                  <li>Test with a small batch first (5-10 rows)</li>
                  <li>Verify SKUs before uploading</li>
                  <li>Keep a backup of your CSV file</li>
                  <li>Check the logs after upload to verify updates</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <StockLogsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
