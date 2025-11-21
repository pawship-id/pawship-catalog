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
import GuidelinesCard from "@/components/admin/stock/guidelines-card";

export default function StockManagementPage() {
  const [activeTab, setActiveTab] = useState("upload");

  const handleDownloadTemplate = () => {
    window.open("/api/admin/stock/template", "_blank");
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="mb-6 space-y-2">
          <h1 className="text-3xl font-playfair font-bold text-foreground">
            Stock Management
          </h1>
          <p className="text-muted-foreground text-lg">
            Bulk update product stock via XLXS upload
          </p>
        </div>
        <Button
          onClick={handleDownloadTemplate}
          className="gap-2 cursor-pointer"
        >
          <Download className="h-4 w-4" />
          Download Template
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 ">
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
        <TabsContent value="upload" className="space-y-6 mt-3">
          {/* Guidelines Card */}
          <Card className="bg-blue-50 border border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-semibold text-blue-900">
                <FileText className="h-5 w-5" />
                Upload Stock Guidelines
              </CardTitle>
              <CardDescription className=" text-blue-800 ">
                Follow these guidelines for successful stock updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-blue-900 mb-2">
                  📋 Required Format
                </h4>
                <div className="bg-white p-3 rounded-md border border-gray-300 inline-block">
                  <table className="text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-3 py-1.5 text-left font-semibold text-gray-700 border border-gray-300">
                          SKU
                        </th>
                        <th className="px-3 py-1.5 text-left font-semibold text-gray-700 border border-gray-300">
                          Stock
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-3 py-1.5 border border-gray-300 font-mono text-xs">
                          SKU-COLLAR-001
                        </td>
                        <td className="px-3 py-1.5 border border-gray-300 font-mono text-xs">
                          150
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-3 py-1.5 border border-gray-300 font-mono text-xs">
                          SKU-HARNESS-002
                        </td>
                        <td className="px-3 py-1.5 border border-gray-300 font-mono text-xs">
                          200
                        </td>
                      </tr>
                      <tr>
                        <td className="px-3 py-1.5 border border-gray-300 font-mono text-xs">
                          SKU-LEASH-003
                        </td>
                        <td className="px-3 py-1.5 border border-gray-300 font-mono text-xs">
                          75
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-blue-900 mb-2">
                  ✅ Requirements
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>
                    Header row must be exactly: <code>sku,stock</code>
                  </li>
                  <li>
                    SKU must match exactly with products in database
                    (case-sensitive)
                  </li>
                  <li>Stock must be a valid positive number</li>
                  <li>File must be in XLSX format (.xlsx extension)</li>
                  <li>Maximum file size: 5MB</li>
                  <li>UTF-8 encoding recommended</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-blue-900 mb-2">
                  ⚠️ Important Notes
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>SKUs not found in database will be skipped</li>
                  <li>Negative stock values are not allowed</li>
                  <li>All updates are logged for audit trail</li>
                  <li>Changes take effect immediately</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-blue-900 mb-2">
                  🎯 Best Practices
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Download and use the template for correct format</li>
                  <li>Test with a small batch first (5-10 rows)</li>
                  <li>Verify SKUs before uploading</li>
                  <li>Keep a backup of your XLSX (excel) file</li>
                  <li>Check the logs after upload to verify updates</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          {/* <GuidelinesCard /> */}

          <BulkUploadStock />
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4 mt-3">
          <StockLogsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
