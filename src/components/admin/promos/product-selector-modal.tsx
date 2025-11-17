"use client";
import React, { useEffect, useState } from "react";
import { X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductData } from "@/lib/types/product";
import { getAll } from "@/lib/apiService";
import { cn } from "@/lib/utils";

interface ProductSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedProducts: ProductData[]) => void;
  excludeProductIds?: string[];
}

export default function ProductSelectorModal({
  isOpen,
  onClose,
  onConfirm,
  excludeProductIds = [],
}: ProductSelectorModalProps) {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductData[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  useEffect(() => {
    const filtered = products.filter(
      (product) =>
        product.productName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !excludeProductIds.includes(product._id)
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products, excludeProductIds]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await getAll<ProductData>("/api/admin/products");
      if (response.data) {
        setProducts(response.data.filter((p) => !p.deleted));
        setFilteredProducts(
          response.data.filter(
            (p) => !p.deleted && !excludeProductIds.includes(p._id)
          )
        );
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = (product: ProductData) => {
    setSelectedProducts((prev) => {
      const exists = prev.find((p) => p._id === product._id);
      if (exists) {
        return prev.filter((p) => p._id !== product._id);
      } else {
        return [...prev, product];
      }
    });
  };

  const handleConfirm = () => {
    onConfirm(selectedProducts);
    setSelectedProducts([]);
    setSearchTerm("");
    onClose();
  };

  const handleClose = () => {
    setSelectedProducts([]);
    setSearchTerm("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold">Select Product</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              className="pl-10 border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
              placeholder="Search product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchTerm ? "No products found" : "No products available"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map((product) => {
                const isSelected = selectedProducts.some(
                  (p) => p._id === product._id
                );
                return (
                  <label
                    key={product._id}
                    className={cn(
                      "flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleProduct(product)}
                      className="border-gray-300"
                    />
                    <div className="flex items-center gap-4 flex-1">
                      <img
                        src={
                          product.productMedia.find((m) => m.type === "image")
                            ?.imageUrl || "/placeholder.png"
                        }
                        alt={product.productName}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{product.productName}</h3>
                        <p className="text-sm text-gray-500">
                          {product.productVariantsData?.length || 0} variant(s)
                        </p>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <p className="text-sm text-gray-600">
            {selectedProducts.length} selected product
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedProducts.length === 0}
            >
              Confirmation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
