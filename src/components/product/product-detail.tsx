"use client";
import React, { useState } from "react";
import { ShoppingCart, Zap, Download, ArrowLeft } from "lucide-react";
import ProductGallery from "./product-galery";
import ProductTabs from "./product-tabs";
import VariantSelector from "./variant-selector";
import PricingDisplay from "./pricing-display";
import { Currency, Product, User } from "@/app/product/[slug]/page";

interface ProductDetailProps {
  product: Product;
  user: User;
  currency: Currency;
}

const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  user,
  currency,
}) => {
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState(
    user.type === "b2b" ? product.moq[currency] : 1
  );

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
    if (user.type === "b2b") {
      return (
        <div className="space-y-3">
          <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </button>

          <div className="border-t border-gray-200 pt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                Need to place a bulk order?
              </h3>
              <p className="text-blue-800 text-sm mb-3">
                For orders over 100 pieces or custom requirements, download our
                bulk order template and get personalized pricing from your
                account manager.
              </p>
              <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
                <Download className="w-4 h-4" />
                Download Bulk Order Template
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex gap-3">
        <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Add to Cart
        </button>
        <button className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
          <Zap className="w-5 h-5" />
          Buy Now
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Gallery */}
          <div>
            <ProductGallery product={product} />
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {product.title}
                </h1>
                {user.type === "b2b" && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                    B2B
                  </span>
                )}
              </div>
              {product.subtitle && (
                <p className="text-lg text-gray-600">{product.subtitle}</p>
              )}
              {product.isBasicEssential && (
                <div className="flex gap-2">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    Essentials
                  </span>
                </div>
              )}
            </div>

            {/* Pricing */}
            <PricingDisplay
              product={product}
              user={user}
              selectedCurrency={currency}
            />

            {/* Variants & Quantity */}
            <VariantSelector
              variants={product.variants}
              stock={product.stock}
              moq={user.type === "b2b" ? product.moq[currency] : 1}
              onVariantChange={handleVariantChange}
              onQuantityChange={handleQuantityChange}
            />

            {/* CTA Buttons */}
            {renderCTAButtons()}
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-16">
          <ProductTabs product={product} user={user} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
