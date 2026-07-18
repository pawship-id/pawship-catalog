"use client";

import { useEffect, useState } from "react";
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
import { Coins, Info } from "lucide-react";
import { currencyFormat } from "@/lib/helpers";
import { showErrorAlert, showSuccessAlert } from "@/lib/helpers/sweetalert2";

interface OverrideBaseRupiahModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  currency: string;
  /** baseRupiah currently stored on the order (the active rate) */
  currentBaseRupiah?: number;
  /** snapshot of the rate at order time, if the order was already overridden */
  snapshootBaseRupiah?: number;
  onSuccess: () => void;
}

export function OverrideBaseRupiahModal({
  isOpen,
  onClose,
  orderId,
  currency,
  currentBaseRupiah,
  snapshootBaseRupiah,
  onSuccess,
}: OverrideBaseRupiahModalProps) {
  const [value, setValue] = useState<string>("");
  const [currentRate, setCurrentRate] = useState<number | null>(null);
  const [loadingRate, setLoadingRate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const code = (currency || "").toUpperCase();

  // The rupiah rate the order was placed with: the snapshot once overridden,
  // otherwise the value still on the order (never overridden yet).
  const purchaseBaseRupiah = snapshootBaseRupiah ?? currentBaseRupiah;

  // When the modal opens, reset the (empty) input and fetch the currency's
  // current rate from the collection — only to show it as info, not to prefill.
  useEffect(() => {
    if (!isOpen) return;

    setValue("");

    const fetchCurrentRate = async () => {
      try {
        setLoadingRate(true);

        const res = await fetch("/api/admin/currencies", {
          cache: "no-store",
        });
        const result = await res.json();

        let rate: number | null = null;
        if (result?.success && Array.isArray(result.data)) {
          const match = result.data.find(
            (c: { name: string; baseRupiah: number }) =>
              (c.name || "").toUpperCase() === code
          );
          if (match && typeof match.baseRupiah === "number") {
            rate = match.baseRupiah;
          }
        }

        // Rupiah is the base currency, so its rate is always 1.
        if (rate === null && code === "IDR") {
          rate = 1;
        }

        setCurrentRate(rate);
      } catch (err) {
        console.error(err);
        setCurrentRate(null);
      } finally {
        setLoadingRate(false);
      }
    };

    fetchCurrentRate();
  }, [isOpen, code]);

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    const newBaseRupiah = Number(value);
    if (!Number.isFinite(newBaseRupiah) || newBaseRupiah <= 0) {
      showErrorAlert(undefined, "Base rupiah must be a number greater than 0");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch(
        `/api/admin/orders/override-base-rupiah/${orderId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ baseRupiah: newBaseRupiah }),
        }
      );
      const result = await res.json();

      if (result.success) {
        showSuccessAlert(
          undefined,
          "Base rupiah has been overridden successfully"
        );
        onSuccess();
        onClose();
      } else {
        showErrorAlert(
          undefined,
          result.message || "Failed to override base rupiah"
        );
      }
    } catch (err) {
      console.error(err);
      showErrorAlert(undefined, "Failed to override base rupiah");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Override Base Rupiah</DialogTitle>
          <DialogDescription>
            Ganti rate rupiah ({code}) yang tersimpan di order ini. Revenue akan
            dihitung ulang dari rate baru.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Rupiah rate the order was placed with */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs font-medium text-gray-500">
                Rupiah saat beli
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {purchaseBaseRupiah != null
                  ? `${currencyFormat(purchaseBaseRupiah, "IDR")} / ${code}`
                  : "-"}
              </p>
            </div>

            {/* Rupiah rate currently active on the order */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs font-medium text-gray-500">
                Base rupiah sekarang
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {currentBaseRupiah != null
                  ? `${currencyFormat(currentBaseRupiah, "IDR")} / ${code}`
                  : "-"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseRupiah" className="text-sm font-medium">
              Base Rupiah Baru *
            </Label>
            <Input
              id="baseRupiah"
              type="number"
              min={0}
              step="any"
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={submitting}
              placeholder="Masukkan base rupiah baru"
            />

            {/* Info only: the currency's current rate in the collection */}
            <div className="flex items-start gap-1.5 text-xs text-blue-600">
              <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
              <span>
                {loadingRate
                  ? "Mengambil nilai currency saat ini..."
                  : currentRate !== null
                    ? `Nilai currency ${code} saat ini di collection: ${currencyFormat(
                        currentRate,
                        "IDR"
                      )} / ${code}.`
                    : `Nilai currency ${code} saat ini tidak ditemukan di collection.`}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="gap-2"
          >
            {submitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Coins className="h-4 w-4" />
                Override
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
