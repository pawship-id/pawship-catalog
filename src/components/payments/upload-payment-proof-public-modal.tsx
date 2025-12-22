"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { showErrorAlert, showSuccessAlert } from "@/lib/helpers/sweetalert2";

interface UploadPaymentProofPublicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadPaymentProofPublicModal({
  isOpen,
  onClose,
}: UploadPaymentProofPublicModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [orderInvoice, setOrderInvoice] = useState("");
  const [note, setNote] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showErrorAlert(undefined, "Please choose a file to upload");
      return;
    }

    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("file", selectedFile);
      fd.append("orderInvoice", orderInvoice || "");
      fd.append("note", note || "");

      const res = await fetch(`/api/public/payment-proof`, {
        method: "POST",
        body: fd,
      });
      const result = await res.json();

      if (result.success) {
        showSuccessAlert(
          undefined,
          "Payment receipt received. We'll verify and update your order status soon"
        );
        setOrderInvoice("");
        setNote("");
        setSelectedFile(null);
        onClose();
      } else {
        showErrorAlert(
          undefined,
          result.message || "Failed to upload payment proof"
        );
      }
    } catch (err) {
      console.error(err);
      showErrorAlert(undefined, "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setSelectedFile(null);
      setOrderInvoice("");
      setNote("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Payment Proof</DialogTitle>
          <DialogDescription>
            Upload your payment receipt or proof of transfer. Supported formats:
            JPG, PNG, PDF (Max 5MB).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="file" className="text-sm font-medium">
              Choose File *
            </Label>
            <Input
              id="file"
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="cursor-pointer"
              disabled={uploading}
            />
            {selectedFile && (
              <p className="text-xs text-gray-600">
                Selected: {selectedFile.name} (
                {(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="orderInvoice" className="text-sm font-medium">
              Order Invoice Number (Optional)
            </Label>
            <Input
              id="orderInvoice"
              type="text"
              placeholder="e.g., INV-20231225-001"
              value={orderInvoice}
              onChange={(e) => setOrderInvoice(e.target.value)}
              disabled={uploading}
            />
            <p className="text-xs text-gray-500">
              If you have an invoice number, enter it here for faster processing
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note" className="text-sm font-medium">
              Note (Optional)
            </Label>
            <Textarea
              id="note"
              placeholder="Add any additional information about this payment..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="resize-none"
              disabled={uploading}
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={uploading || !selectedFile}
            className="gap-2"
          >
            {uploading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
