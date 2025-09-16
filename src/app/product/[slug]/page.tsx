"use client";
import { ProductGallery } from "@/components/product/product-galery";
import PricingDisplay from "@/components/product/product-pricing";
import ProductTabs from "@/components/product/product-tabs";
import RelatedProduct from "@/components/product/related-product";
import VariantSelector from "@/components/product/variant-selector";
import { Separator } from "@/components/ui/separator";
import { Download, ShoppingCart } from "lucide-react";
import React, { useState } from "react";

export default function ProductDetailPage() {
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState(1);

  const handleVariantChange = (variantId: string, value: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantId]: value,
    }));
  };

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
  };

  const renderCTAButtons = () => {
    return (
      <div className="space-y-3">
        <button className="w-full bg-primary/90 hover:bg-primary text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Add to Cart
        </button>

        <Separator className="mb-5 mt-5" />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">
            Need to place a bulk order?
          </h3>
          <p className="text-blue-800 text-sm mb-3">
            For orders over 100 pieces or custom requirements, download our bulk
            order template and get personalized pricing from your account
            manager.
          </p>
          <button className="flex font-semibold items-center gap-2 text-blue-800 hover:text-blue-900  text-sm cursor-pointer">
            <Download className="w-4 h-4" />
            Download Bulk Order Template
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            {/* Product Gallery */}
            <ProductGallery />

            <div className="hidden lg:block">
              <ProductTabs />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  Magician BIP Set
                </h1>
              </div>
              {/* optional */}
              <p className="text-lg text-gray-600">Lorem Ipsum</p>
              {/* if product essential or basic */}
              <div className="flex gap-2">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  Essentials
                </span>
              </div>
            </div>

            {/* Pricing Display */}
            <PricingDisplay />

            {/* Variant Selector */}
            <VariantSelector
              onVariantChange={handleVariantChange}
              onQuantityChange={handleQuantityChange}
            />

            {/* CTA Buttons */}
            {renderCTAButtons()}
          </div>
        </div>

        {/* Tabs Section */}
        <div className="lg:hidden">
          <ProductTabs />
        </div>

        <RelatedProduct />
      </div>
    </div>
  );
}
