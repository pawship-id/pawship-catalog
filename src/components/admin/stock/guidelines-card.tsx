"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FileText } from "lucide-react";

export default function GuidelinesCard() {
  return (
    <Card className="bg-blue-50 border border-blue-200">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="guidelines" className="border-none">
          <AccordionTrigger className="px-6 pt-6 pb-2 hover:no-underline">
            <div className="flex items-start gap-3 text-left">
              <FileText className="h-5 w-5 text-blue-900 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 text-lg">
                  CSV Guidelines
                </h3>
                <p className="text-sm text-blue-800 font-normal">
                  Follow these guidelines for successful stock updates
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="space-y-4 pt-2">
              <div>
                <h4 className="font-medium text-blue-900 mb-2">
                  📋 Required Format
                </h4>
                <div className="bg-gray-200 p-3 rounded-md font-mono text-sm">
                  <div>sku,stock</div>
                  <div>SKU-COLLAR-001,150</div>
                  <div>SKU-HARNESS-002,200</div>
                  <div>SKU-LEASH-003,75</div>
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
                  <li>Stock must be a valid number (0 or positive)</li>
                  <li>File must be in CSV format (.csv extension)</li>
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
                  <li>Keep a backup of your CSV file</li>
                  <li>Check the logs after upload to verify updates</li>
                </ul>
              </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
