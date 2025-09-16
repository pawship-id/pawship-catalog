import React, { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "../ui/button";

interface ProductVariant {
  id: string;
  type: string;
  value: string;
  available: boolean;
}

interface VariantSelectorProps {
  onVariantChange: (variantId: string, value: string) => void;
  onQuantityChange: (quantity: number) => void;
}

const VariantSelector: React.FC<VariantSelectorProps> = ({
  onVariantChange,
  onQuantityChange,
}) => {
  const variants: ProductVariant[] = [
    { id: "1", type: "size", value: "XS", available: true },
    { id: "2", type: "size", value: "S", available: true },
    { id: "3", type: "size", value: "M", available: true },
    { id: "4", type: "size", value: "L", available: false },
    { id: "5", type: "color", value: "Red", available: true },
    { id: "6", type: "color", value: "Blue", available: true },
    { id: "7", type: "color", value: "Green", available: true },
  ];

  const stock = 50;
  const moq = 10;

  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState(moq);
  const [inputValue, setInputValue] = useState(moq.toString());

  const variantTypes = [...new Set(variants.map((v) => v.type))];

  const getVariantsByType = (type: string) =>
    variants.filter((v) => v.type === type);

  const handleVariantSelect = (
    type: string,
    variantId: string,
    value: string
  ) => {
    const newSelectedVariants = { ...selectedVariants, [type]: value };
    setSelectedVariants(newSelectedVariants);
    onVariantChange(variantId, value);
  };

  const commitQuantity = (val: number) => {
    const clamped = Math.max(moq, Math.min(stock, val));
    setQuantity(clamped);
    setInputValue(clamped.toString());
    onQuantityChange(clamped);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    const num = Number(inputValue);
    if (!isNaN(num)) {
      commitQuantity(num);
    } else {
      setInputValue(quantity.toString()); // reset kalau invalid
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

      {/* Stock & Quantity */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              stock > 0 ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm text-gray-600">
            {stock > 0 ? `${stock} units available` : "Out of Stock"}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium">Quantity:</span>
          <div className="flex items-center border rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-l-none"
              onClick={() => commitQuantity(quantity - 1)}
              disabled={quantity <= moq}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <input
              type="number"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleBlur}
              min={moq}
              max={stock}
              className="w-20 px-3 text-center focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => commitQuantity(quantity + 1)}
              disabled={quantity >= stock}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariantSelector;
