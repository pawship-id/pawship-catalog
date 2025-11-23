"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clock, User, FileText, ChevronLeft, ChevronRight } from "lucide-react";

interface PaymentProof {
  imageUrl: string;
  imagePublicId: string;
  note?: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface PaymentProofDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  proof: PaymentProof | null;
  proofNumber?: number;
  totalProofs?: number;
  onNext?: () => void;
  onPrev?: () => void;
}

export function PaymentProofDetailModal({
  isOpen,
  onClose,
  proof,
  proofNumber,
  totalProofs,
  onNext,
  onPrev,
}: PaymentProofDetailModalProps) {
  if (!proof) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="md:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Payment Proof {proofNumber ? `#${proofNumber}` : ""}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image */}
          <div className="flex justify-center">
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src={proof.imageUrl}
                alt="Payment proof"
                className="w-full h-full object-contain cursor-pointer"
                onClick={() => window.open(proof.imageUrl, "_blank")}
              />
            </div>
          </div>

          <Separator />

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <FileText className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Note</p>
                <p className="text-sm text-gray-600">
                  {proof.note ? proof.note : "-"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Upload Date
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(proof.uploadedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <User className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Uploaded By
                </p>
                <p className="text-sm text-gray-600">{proof.uploadedBy}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center gap-4">
            <Button
              onClick={onPrev}
              variant="outline"
              disabled={!onPrev || proofNumber === 1}
              className="flex-1"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button
              onClick={onNext}
              variant="outline"
              disabled={!onNext || proofNumber === totalProofs}
              className="flex-1"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
