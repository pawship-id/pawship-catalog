import React, { useState, useMemo, useEffect } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { VariantRow } from "@/lib/types/product";

interface VariantSelectorProps {
  productVariant: VariantRow[];
  attributes: Record<string, string[]>; // attributes from enrichProductData
  moq: number;
  setSelectedVariant: (value: {
    selectedVariantTypes: Record<string, string | undefined>;
    selectedVariantDetail: VariantRow;
  }) => void;
}

const VariantSelector: React.FC<VariantSelectorProps> = ({
  productVariant,
  attributes,
  moq,
  setSelectedVariant,
}) => {
  const [selectedVariantTypes, setSelectedVariantTypes] = useState<
    Record<string, string | undefined>
  >({});
  const [quantity, setQuantity] = useState(moq);
  const [inputValue, setInputValue] = useState(moq.toString());

  // handle select/unselect variant
  const handleVariantSelect = (attribute: string, value: string) => {
    setSelectedVariantTypes((prev) => ({
      ...prev,
      [attribute]: prev[attribute] === value ? undefined : value,
    }));
  };

  // filter variants that match selected Variant Types
  const filteredVariants = useMemo(() => {
    return productVariant.filter((variant) => {
      return Object.entries(selectedVariantTypes).every(([attr, val]) => {
        if (!val) return true; // ignore unselected attributes
        return variant.attrs[attr] === val;
      });
    });
  }, [productVariant, selectedVariantTypes]);

  // determine the maximum stock from the available variant combinations
  const maxStock =
    filteredVariants.length > 0
      ? Math.min(...filteredVariants?.map((v) => v.stock))
      : 0;

  // commit quantity according to stock
  const commitQuantity = (val: number) => {
    const clamped = Math.max(moq, Math.min(maxStock, val));

    setQuantity(clamped);
    setInputValue(clamped.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    const num = Number(inputValue);
    if (!isNaN(num)) {
      commitQuantity(num);
    } else {
      setInputValue(quantity.toString());
    }
  };

  // check if value is available for attribute
  const isVariantAvailable = (attribute: string, value: string) => {
    return productVariant.some((variant) => {
      if (variant.attrs[attribute] !== value) return false;
      return (
        Object.entries(selectedVariantTypes).every(([attr, val]) => {
          if (attr === attribute || !val) return true;
          return variant.attrs[attr] === val;
        }) && variant.stock > 0
      );
    });
  };

  // details of the selected variant (take the first suitable variant)
  const selectedVariantDetail: VariantRow | null = useMemo(() => {
    return filteredVariants.length > 0 ? filteredVariants[0] : null;
  }, [filteredVariants]);

  useEffect(() => {
    if (selectedVariantDetail) {
      setSelectedVariant({
        selectedVariantTypes,
        selectedVariantDetail,
      });

      if (quantity >= 1 && quantity > selectedVariantDetail.stock) {
        setQuantity(selectedVariantDetail.stock);
        setInputValue(selectedVariantDetail.stock.toString());
      }
    }
  }, [selectedVariantDetail]);

  return (
    <div className="space-y-6">
      {/* Variant Selection */}
      {Object.keys(attributes).map((attribute) => (
        <div key={attribute} className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900 capitalize">
            {attribute}
          </label>
          <div className="flex flex-wrap gap-2">
            {attributes[attribute].map((value) => {
              const available = isVariantAvailable(attribute, value);
              const selected = selectedVariantTypes[attribute] === value;
              return (
                <div key={value} className="relative">
                  <button
                    className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors
                      ${
                        selected
                          ? "border-orange-400 bg-orange-50 text-orange-700"
                          : available
                            ? "border-gray-300 hover:border-gray-400 text-gray-700"
                            : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                      }
                    `}
                    disabled={!available}
                    onClick={() => handleVariantSelect(attribute, value)}
                  >
                    {value}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Stock & Quantity */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              maxStock > 0 ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm text-gray-600">
            {maxStock > 0 ? `${maxStock} units available` : "Out of Stock"}
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
              max={maxStock}
              className="w-20 px-3 text-center focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => commitQuantity(quantity + 1)}
              disabled={quantity >= maxStock}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Debug Selected Variant */}
      {/* <pre>
        {JSON.stringify(
          { selectedVariantTypes, selectedVariantDetail },
          null,
          2
        )}
      </pre> */}
    </div>
  );
};

export default VariantSelector;
