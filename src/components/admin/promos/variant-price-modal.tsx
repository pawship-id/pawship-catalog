"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PromoVariant } from "@/lib/types/promo";

interface VariantPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant: PromoVariant;
  currencies: string[];
  onApply: (variant: PromoVariant) => void;
}

export default function VariantPriceModal({
  isOpen,
  onClose,
  variant,
  currencies,
  onApply,
}: VariantPriceModalProps) {
  const [localVariant, setLocalVariant] = useState<PromoVariant>(variant);

  useEffect(() => {
    if (isOpen) {
      setLocalVariant(variant);
    }
  }, [isOpen, variant]);

  const handleDiscountChange = (currency: string, value: string) => {
    // Allow empty string, convert to 0 for calculation
    const discountPercentage = value === "" ? 0 : parseFloat(value);
    const validDiscount = Math.max(0, Math.min(100, discountPercentage));

    // Calculate discounted price for this specific currency
    const originalPrice = localVariant.originalPrice[currency] || 0;
    const calculatedPrice = originalPrice * (1 - validDiscount / 100);
    const newDiscountedPrice = parseFloat(calculatedPrice.toFixed(2)); // Round to 2 decimal places

    setLocalVariant((prev) => ({
      ...prev,
      discountPercentage: {
        ...prev.discountPercentage,
        [currency]: parseFloat(validDiscount.toFixed(2)),
      },
      discountedPrice: {
        ...prev.discountedPrice,
        [currency]: newDiscountedPrice,
      },
    }));
  };

  const handleDiscountedPriceChange = (currency: string, value: string) => {
    // Allow empty string, convert to 0 for calculation
    const discountedPrice = value === "" ? 0 : parseFloat(value);
    const originalPrice = localVariant.originalPrice[currency] || 0;

    // Calculate discount percentage from discounted price for this currency
    const calculatedPercentage =
      originalPrice > 0
        ? ((originalPrice - discountedPrice) / originalPrice) * 100
        : 0;

    const roundedPercentage = parseFloat(calculatedPercentage.toFixed(2)); // Round to 2 decimal places
    const validDiscount = Math.max(0, Math.min(100, roundedPercentage));

    setLocalVariant((prev) => ({
      ...prev,
      discountPercentage: {
        ...prev.discountPercentage,
        [currency]: validDiscount,
      },
      discountedPrice: {
        ...prev.discountedPrice,
        [currency]: discountedPrice,
      },
    }));
  };

  const handleApply = () => {
    onApply(localVariant);
    onClose();
  };

  const handleCancel = () => {
    setLocalVariant(variant); // Reset to original
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">
              Input Product for {localVariant.variantName}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Set discount and prices for each currency
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {currencies.map((currency) => (
              <div
                key={currency}
                className="border rounded-lg p-4 bg-gray-50 space-y-3"
              >
                <h3 className="font-semibold text-lg text-gray-900">
                  {currency}
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  {/* Base Price */}
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Base price</Label>
                    <Input
                      type="number"
                      value={localVariant.originalPrice[currency] || 0}
                      disabled
                      className="bg-white border-gray-300"
                    />
                  </div>

                  {/* Discount % */}
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Diskon %</Label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={
                        localVariant.discountPercentage[currency] === 0
                          ? ""
                          : localVariant.discountPercentage[currency]
                      }
                      onChange={(e) =>
                        handleDiscountChange(currency, e.target.value)
                      }
                      placeholder="0"
                      className="border-gray-300"
                    />
                  </div>

                  {/* Discounted Price */}
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">
                      Discounted price
                    </Label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={
                        localVariant.discountedPrice[currency] === 0
                          ? ""
                          : localVariant.discountedPrice[currency]
                      }
                      onChange={(e) =>
                        handleDiscountedPriceChange(currency, e.target.value)
                      }
                      className="border-gray-300"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply</Button>
        </div>
      </div>
    </div>
  );
}
