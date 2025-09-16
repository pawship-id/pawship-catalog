import React from "react";
import { Info } from "lucide-react";

interface PriceTier {
  quantity: number;
  discount: number;
  unitPrice: number;
}

const PricingDisplay: React.FC = () => {
  // Static data
  const selectedCurrency = "IDR";
  const resellerPrice = { IDR: 210_000, SGD: 17.7, USD: 15 };
  const tiers: PriceTier[] = [
    { quantity: 10, discount: 15, unitPrice: 210_000 },
    { quantity: 30, discount: 25, unitPrice: 190_000 },
    { quantity: 50, discount: 30, unitPrice: 175_000 },
  ];
  const isBasicEssential = true;
  const moq = 50;

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(price);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="text-2xl font-semibold text-gray-900">
          {formatPrice(resellerPrice[selectedCurrency], selectedCurrency)}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <h3 className="font-semibold text-gray-900">
            Reseller Discount Tiers
          </h3>
          <div className="group relative">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-sm rounded-lg p-3 w-64 z-10 pointer-events-none">
              Quantities can be mixed within models, colors, and sizes. For
              basics/essentials products, quantity can only be mixed within
              colors and sizes.
            </div>
          </div>
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
                    {formatPrice(tier.unitPrice, selectedCurrency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isBasicEssential && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm text-blue-800">
            <strong>MOQ:</strong> {moq} pieces minimum order for this product.
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingDisplay;
