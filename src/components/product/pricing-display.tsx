import React from "react";
import { Info } from "lucide-react";
import { formatPrice } from "@/lib/utils/currency";
import { Currency, Product, User } from "@/app/product/[slug]/page";

interface PricingDisplayProps {
  product: Product;
  user: User;
  selectedCurrency: Currency;
}

const PricingDisplay: React.FC<PricingDisplayProps> = ({
  product,
  user,
  selectedCurrency,
}) => {
  const renderB2CPrice = () => {
    const price = product.retailPrice[selectedCurrency];

    return (
      <div className="space-y-2">
        <div className="text-3xl font-bold text-gray-900">
          {formatPrice(price, selectedCurrency)}
        </div>
      </div>
    );
  };

  const renderB2BPrice = () => {
    const tiers = product.resellerPrice[selectedCurrency];
    const retailPrice = product.retailPrice[selectedCurrency];

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm text-gray-500">Retail Price</div>
          <div className="text-2xl font-semibold text-gray-400 line-through">
            {formatPrice(retailPrice, selectedCurrency)}
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-semibold text-gray-900">Reseller Pricing</h3>
            <div className="group relative">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-sm rounded-lg p-3 w-64 z-10">
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

        {product.isBasicEssential && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm text-blue-800">
              <strong>MOQ:</strong> {product.moq[selectedCurrency]} pieces
              minimum order for this product.
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {user.type === "b2b" ? renderB2BPrice() : renderB2CPrice()}
    </div>
  );
};

export default PricingDisplay;
