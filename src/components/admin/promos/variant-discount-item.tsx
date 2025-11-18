"use client";
import React, { useState } from "react";
import { Trash2, Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PromoVariant } from "@/lib/types/promo";
import VariantPriceModal from "./variant-price-modal";

interface VariantDiscountItemProps {
  variant: PromoVariant;
  currencies: string[];
  onUpdate: (variant: PromoVariant) => void;
}

export default function VariantDiscountItem({
  variant,
  currencies,
  onUpdate,
}: VariantDiscountItemProps) {
  const [showPriceModal, setShowPriceModal] = useState(false);

  const handleActiveToggle = (checked: boolean) => {
    const updated = {
      ...variant,
      isActive: checked,
    };
    onUpdate(updated);
  };

  const handlePriceUpdate = (updatedVariant: PromoVariant) => {
    onUpdate(updatedVariant);
  };

  // Get summary of discounts
  const getDiscountSummary = () => {
    const discounts = currencies.map(
      (currency) => variant.discountPercentage[currency] || 0
    );
    const uniqueDiscounts = [...new Set(discounts)];

    if (uniqueDiscounts.length === 1) {
      return `${uniqueDiscounts[0]}% for all currencies`;
    } else {
      return `${Math.min(...discounts)}% - ${Math.max(...discounts)}%`;
    }
  };

  return (
    <div>
      <div className="flex items-start gap-4">
        {/* Variant Image */}
        <img
          src={variant.image?.imageUrl || "/placeholder.png"}
          alt={variant.variantName}
          className="w-15 h-15 object-cover rounded border"
        />

        {/* Variant Info & Controls */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-sm">{variant.variantName}</h4>
              <p className="text-xs text-gray-500 mt-1">
                Discount: {getDiscountSummary()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Avaiable stock: {variant.stock}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Active Toggle */}
              <div className="flex items-center gap-2">
                <Label
                  htmlFor={`active-${variant.variantId}`}
                  className="text-sm"
                >
                  Active
                </Label>
                <Switch
                  id={`active-${variant.variantId}`}
                  checked={variant.isActive}
                  onCheckedChange={handleActiveToggle}
                  className="data-[state=unchecked]:bg-gray-200"
                />
              </div>

              {/* Setting Price Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPriceModal(true)}
                disabled={!variant.isActive}
                className={`flex items-center gap-2 ${
                  !variant.isActive ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Settings className="h-4 w-4" />
                Setting Price
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Price Modal */}

      <VariantPriceModal
        isOpen={showPriceModal}
        onClose={() => setShowPriceModal(false)}
        variant={variant}
        currencies={currencies}
        onApply={handlePriceUpdate}
      />
    </div>
  );
}
