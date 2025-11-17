"use client";
import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { PromoVariant } from "@/lib/types/promo";

interface VariantDiscountItemProps {
  variant: PromoVariant;
  currencies: string[];
  onUpdate: (variant: PromoVariant) => void;
  onRemove?: () => void;
}

export default function VariantDiscountItem({
  variant,
  currencies,
  onUpdate,
  onRemove,
}: VariantDiscountItemProps) {
  const [localVariant, setLocalVariant] = useState<PromoVariant>(variant);

  useEffect(() => {
    setLocalVariant(variant);
  }, [variant]);

  const handleDiscountChange = (currency: string, value: string) => {
    const discountPercentage = parseFloat(value) || 0;
    const validDiscount = Math.max(0, Math.min(100, discountPercentage));

    // Calculate discounted price for this specific currency
    const originalPrice = localVariant.originalPrice[currency] || 0;
    const newDiscountedPrice = originalPrice * (1 - validDiscount / 100);

    const updated = {
      ...localVariant,
      discountPercentage: {
        ...localVariant.discountPercentage,
        [currency]: validDiscount,
      },
      discountedPrice: {
        ...localVariant.discountedPrice,
        [currency]: newDiscountedPrice,
      },
    };

    setLocalVariant(updated);
    onUpdate(updated);
  };

  const handleDiscountedPriceChange = (currency: string, value: string) => {
    const discountedPrice = parseFloat(value) || 0;
    const originalPrice = localVariant.originalPrice[currency] || 0;

    // Calculate discount percentage from discounted price for this currency
    const discountPercentage =
      originalPrice > 0
        ? ((originalPrice - discountedPrice) / originalPrice) * 100
        : 0;

    const validDiscount = Math.max(0, Math.min(100, discountPercentage));

    const updated = {
      ...localVariant,
      discountPercentage: {
        ...localVariant.discountPercentage,
        [currency]: validDiscount,
      },
      discountedPrice: {
        ...localVariant.discountedPrice,
        [currency]: discountedPrice,
      },
    };

    setLocalVariant(updated);
    onUpdate(updated);
  };

  const handleActiveToggle = (checked: boolean) => {
    const updated = {
      ...localVariant,
      isActive: checked,
    };
    setLocalVariant(updated);
    onUpdate(updated);
  };

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-white">
      <div className="flex items-start gap-4">
        {/* Variant Image */}
        <img
          src={localVariant.image?.imageUrl || "/placeholder.png"}
          alt={localVariant.variantName}
          className="w-20 h-20 object-cover rounded border"
        />

        {/* Variant Info & Controls */}
        <div className="flex-1 space-y-4">
          {/* Variant Name & Actions */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{localVariant.variantName}</h4>
              <p className="text-sm text-gray-500">
                Variant ID: {localVariant.variantId}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label htmlFor={`active-${variant.variantId}`}>Active</Label>
                <Switch
                  id={`active-${variant.variantId}`}
                  checked={localVariant.isActive}
                  onCheckedChange={handleActiveToggle}
                />
              </div>
              {onRemove && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onRemove}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Prices by Currency with Discount Percentage */}
          <div className="grid md:grid-cols-2 gap-4">
            {currencies.map((currency) => (
              <div key={currency} className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  {currency.toUpperCase()} Pricing
                </Label>
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs text-gray-500">
                      Original Price
                    </Label>
                    <Input
                      type="number"
                      value={localVariant.originalPrice[currency] || 0}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">
                      Discount (%)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={localVariant.discountPercentage[currency] || 0}
                      onChange={(e) =>
                        handleDiscountChange(currency, e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">
                      Discounted Price
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        localVariant.discountedPrice[currency]?.toFixed(2) || 0
                      }
                      onChange={(e) =>
                        handleDiscountedPriceChange(currency, e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
