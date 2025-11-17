"use client";
import React, { useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromoData, PromoVariant } from "@/lib/types/promo";
import ShowVariantPriceModal from "./show-variant-price-modal";
import { Badge } from "@/components/ui/badge";

interface ShowVariantDiscountItemProps {
  variant: PromoVariant;
  currencies: string[];
}

export default function ShowVariantDiscountItem({
  variant,
  currencies,
}: ShowVariantDiscountItemProps) {
  const [showPriceModal, setShowPriceModal] = useState(false);

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

  const getPromoStatus = (status: boolean) => {
    if (!status) {
      return { label: "Inactive", variant: "secondary" as const };
    }

    return { label: "Active", variant: "default" as const };
  };

  return (
    <div>
      <div className="flex items-start gap-4 mx-6">
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
              <h4 className="font-medium text-base">{variant.variantName}</h4>
              <p className="text-sm text-gray-500 mt-1">
                Discount: {getDiscountSummary()}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={getPromoStatus(variant.isActive).variant}>
                {getPromoStatus(variant.isActive).label}
              </Badge>

              {/* Setting Price Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPriceModal(true)}
                className={`flex items-center gap-2`}
              >
                <Eye className="h-4 w-4" />
                Show Price
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Price Modal */}
      <ShowVariantPriceModal
        isOpen={showPriceModal}
        onClose={() => setShowPriceModal(false)}
        variant={variant}
        currencies={currencies}
      />
    </div>
  );
}
