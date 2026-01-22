"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ProductData } from "@/lib/types/product";

interface ProductSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductData[];
  onSelectProduct: (product: ProductData) => void;
  loadingProducts?: boolean;
}

export default function ProductSelectorModal({
  isOpen,
  onClose,
  products,
  onSelectProduct,
  loadingProducts = false,
}: ProductSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter((product) =>
    product.productName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Product to Order</DialogTitle>
          <DialogDescription>
            Select a product to add to this order. You will then choose a
            variant.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search products..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loadingProducts ? (
            <div className="text-center py-8 text-gray-500">
              Loading products...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  onClick={() => onSelectProduct(product)}
                  className="border rounded-lg p-4 cursor-pointer hover:border-primary hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-start space-x-3">
                    <img
                      src={
                        product.productMedia?.find((m) => m.type === "image")
                          ?.imageUrl || "/placeholder.jpg"
                      }
                      alt={product.productName}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {product.productName}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {product.productDescription}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {product.productVariantsData?.length || 0} variants
                        </span>
                        <span className="text-sm font-medium text-primary">
                          Click to select
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loadingProducts && filteredProducts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No products found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
