import React, { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { ProductVariant } from "@/app/product/[slug]/page";

interface VariantSelectorProps {
  variants: ProductVariant[];
  stock: number;
  moq?: number;
  onVariantChange: (variantId: string, value: string) => void;
  onQuantityChange: (quantity: number) => void;
}

const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  stock,
  moq = 1,
  onVariantChange,
  onQuantityChange,
}) => {
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState(moq);

  const variantTypes = [...new Set(variants.map((v) => v.type))];

  const getVariantsByType = (type: string) => {
    return variants.filter((v) => v.type === type);
  };

  const handleVariantSelect = (
    type: string,
    variantId: string,
    value: string
  ) => {
    const newSelectedVariants = { ...selectedVariants, [type]: value };
    setSelectedVariants(newSelectedVariants);
    onVariantChange(variantId, value);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= moq && newQuantity <= stock) {
      setQuantity(newQuantity);
      onQuantityChange(newQuantity);
    }
  };

  return (
    <div className="space-y-6">
      {/* Variant Selection */}
      {variantTypes.map((type) => {
        const typeVariants = getVariantsByType(type);

        return (
          <div key={type} className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900 capitalize">
              {type}
            </label>
            <div className="flex flex-wrap gap-2">
              {typeVariants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() =>
                    handleVariantSelect(type, variant.id, variant.value)
                  }
                  disabled={!variant.available}
                  className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                    selectedVariants[type] === variant.value
                      ? "border-orange-400 bg-orange-50 text-orange-700"
                      : variant.available
                      ? "border-gray-300 hover:border-gray-400 text-gray-700"
                      : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {variant.value}
                  {!variant.available && (
                    <span className="ml-1 text-xs">(Out of Stock)</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* Stock Status */}
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            stock > 0 ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <span className="text-sm text-gray-600">
          {stock > 0 ? "In Stock" : "Pre-Order (Ships in 5-20 days)"}
        </span>
        {stock > 0 && stock <= 10 && (
          <span className="text-sm text-orange-600 font-medium">
            Only {stock} left!
          </span>
        )}
      </div>

      {/* Quantity Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-900">
          Quantity
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= moq}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Minus className="w-4 h-4" />
          </button>

          <input
            type="number"
            value={quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
            min={moq}
            max={stock}
            className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />

          <button
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= stock}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
          </button>

          {moq > 1 && <span className="text-sm text-gray-500">Min: {moq}</span>}
        </div>
      </div>
    </div>
  );
};

export default VariantSelector;
