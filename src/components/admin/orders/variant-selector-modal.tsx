"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { currencyFormat } from "@/lib/helpers";
import { ProductData } from "@/lib/types/product";

interface VariantSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductData | null;
  onSelectVariant: (variantId: string) => void;
  currency: string;
}

export default function VariantSelectorModal({
  isOpen,
  onClose,
  product,
  onSelectVariant,
  currency,
}: VariantSelectorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Variant</DialogTitle>
          <DialogDescription>
            Choose a variant for {product?.productName}. Quantity will be set to
            1 (you can adjust it in the table).
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          {product?.productVariantsData?.map((variant) => {
            const isOutOfStock = !variant.stock || variant.stock === 0;
            const canPreOrder = product.preOrder?.enabled;
            const isAvailable = !isOutOfStock || canPreOrder;

            return (
              <div
                key={variant._id}
                onClick={() => isAvailable && onSelectVariant(variant._id)}
                className={`border rounded-lg p-4 transition-all ${
                  !isAvailable
                    ? "opacity-50 bg-gray-100 cursor-not-allowed"
                    : "hover:border-primary hover:bg-gray-50 cursor-pointer"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={
                        variant.image?.imageUrl ||
                        product.productMedia.find((m) => m.type === "image")
                          ?.imageUrl ||
                        "/placeholder.jpg"
                      }
                      alt={variant.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h4
                        className={`font-semibold ${
                          !isAvailable ? "text-gray-500" : "text-gray-900"
                        }`}
                      >
                        {variant.name}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        SKU: {variant.sku || "-"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p
                          className={`text-sm ${
                            isOutOfStock && !canPreOrder
                              ? "text-red-600 font-medium"
                              : "text-gray-600"
                          }`}
                        >
                          Stock: {variant.stock || 0}
                        </p>
                        {isOutOfStock && canPreOrder && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                            Pre-Order Available
                          </span>
                        )}
                        {isOutOfStock && !canPreOrder && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        !isAvailable ? "text-gray-500" : "text-gray-900"
                      }`}
                    >
                      {currencyFormat(variant.price?.[currency] || 0, currency)}
                    </p>
                    {isAvailable ? (
                      <span className="text-sm text-primary font-medium">
                        Click to add
                      </span>
                    ) : (
                      <span className="text-sm text-red-600 font-medium">
                        Unavailable
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {(!product?.productVariantsData ||
            product.productVariantsData.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              No variants available for this product
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
