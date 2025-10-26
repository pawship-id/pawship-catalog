import React from "react";
import Tooltip from "./tooltip";
import { VariantRow } from "@/lib/types/product";
import { useCurrency } from "@/context/CurrencyContext";
import { useSession } from "next-auth/react";

interface PriceTier {
  quantity: number;
  discount: number;
  unitPrice: number;
}

interface PricingDisplayProps {
  variantProduct: VariantRow;
  moq: number;
}

export default function PricingDisplay({
  variantProduct,
  moq,
}: PricingDisplayProps) {
  // Static data
  const { currency, format } = useCurrency();
  const { data: session } = useSession();

  const tiers: PriceTier[] = [
    { quantity: 10, discount: 15, unitPrice: 210_000 },
    { quantity: 30, discount: 25, unitPrice: 190_000 },
    { quantity: 50, discount: 30, unitPrice: 175_000 },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="text-2xl font-semibold text-gray-900">
          {format(variantProduct.price[currency])}
        </div>

        {session?.user.role === "reseller" && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-semibold text-gray-900">
                Reseller Discount Tiers
              </h3>
              <Tooltip />
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Qty
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
                  {tiers.map((tier, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {tier.quantity}+
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
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
