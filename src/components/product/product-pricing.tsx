import React, { useMemo } from "react";
import Tooltip from "./tooltip";
import { VariantRow } from "@/lib/types/product";
import { useCurrency } from "@/context/CurrencyContext";
import { useSession } from "next-auth/react";

interface PriceTier {
  quantity: number;
  discount: number;
  unitPrice: number;
}

interface ResellerTier {
  name: string;
  minimumQuantity: number;
  discount: number;
  categoryProduct: string | string[];
}

interface PricingDisplayProps {
  selectedVariant: {
    selectedVariantTypes: Record<string, string | undefined>;
    selectedVariantDetail: VariantRow;
  };
  moq: number;
  resellerPricing?: {
    currency: string;
    tiers: ResellerTier[];
  };
}

export default function PricingDisplay({
  selectedVariant,
  moq,
  resellerPricing,
}: PricingDisplayProps) {
  const { data: session } = useSession();

  // Determine which currency to use:
  // 1. If reseller pricing exists, use its currency as default
  // 2. Otherwise, use the currency from context (user can change from navbar)
  const { currency: userCurrency, format } = useCurrency();

  // Use reseller currency if available and user is reseller, otherwise use user selected currency
  const effectiveCurrency = useMemo(() => {
    if (session?.user.role === "reseller" && resellerPricing) {
      // Check if user selected currency is available in variant prices
      const variantPrices = selectedVariant.selectedVariantDetail.price;
      if (variantPrices[userCurrency as keyof typeof variantPrices]) {
        return userCurrency;
      }
      // Fallback to reseller pricing currency
      return resellerPricing.currency;
    }
    return userCurrency;
  }, [session, resellerPricing, userCurrency, selectedVariant]);

  // Get base price based on effective currency
  const basePrice = useMemo(() => {
    const variantPrices = selectedVariant.selectedVariantDetail.price;
    return variantPrices[effectiveCurrency as keyof typeof variantPrices] || 0;
  }, [selectedVariant, effectiveCurrency]);

  // Calculate tier prices with discount
  const calculatedTiers = useMemo(() => {
    if (!resellerPricing || !resellerPricing.tiers) return [];

    return resellerPricing.tiers.map((tier) => {
      const discountAmount = (basePrice * tier.discount) / 100;
      const unitPrice = basePrice - discountAmount;

      return {
        name: tier.name,
        quantity: tier.minimumQuantity,
        discount: tier.discount,
        unitPrice: Math.round(unitPrice),
      };
    });
  }, [resellerPricing, basePrice]);

  // Show reseller pricing if user is reseller and has pricing tiers
  const showResellerPricing =
    session?.user.role === "reseller" &&
    resellerPricing &&
    calculatedTiers.length > 0;

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-semibold text-gray-900">
            {format(basePrice)}
          </div>
          {showResellerPricing && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
              Base Price
            </span>
          )}
        </div>

        {showResellerPricing && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-semibold text-gray-900">
                Your Reseller Discount Tiers
              </h3>
              <Tooltip />
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Tier
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Min Qty
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Discount
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Unit Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {calculatedTiers.map((tier, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-700">
                        {tier.name}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {tier.quantity}+
                      </td>
                      <td className="px-4 py-3 text-sm text-green-700 font-semibold">
                        {tier.discount}%
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-orange-600">
                        {format(tier.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-2 text-xs text-gray-500">
              * Prices shown in {effectiveCurrency}. Discount applies
              automatically at checkout.
            </div>
          </div>
        )}
      </div>

      {moq > 1 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm text-blue-800">
            <strong>MOQ:</strong> {moq} pieces minimum order for this product.
          </div>
        </div>
      )}
    </div>
  );
}
