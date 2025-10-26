"use client";
import React, { useEffect, useState } from "react";
import ErrorPublicPage from "@/components/error-public-page";
import LoadingPage from "@/components/loading";
import PricingDisplay from "@/components/product/product-pricing";
import ProductTabs from "@/components/product/product-tabs";
import RelatedProduct from "@/components/product/related-product";
import VariantSelector from "@/components/product/variant-selector";
import { ProductGallery } from "@/components/product/product-galery";
import { Separator } from "@/components/ui/separator";
import { getById } from "@/lib/apiService";
import { ProductData, VariantRow } from "@/lib/types/product";
import { Download, ShoppingCart } from "lucide-react";
import { useParams } from "next/navigation";
import { enrichProduct, hasTag } from "@/lib/helpers/product";
import { useCurrency } from "@/context/CurrencyContext";
import { useSession } from "next-auth/react";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { currency } = useCurrency();
  const { data: session } = useSession();

  const [selectedVariant, setSelectedVariant] = useState<{
    selectedVariantTypes: Record<string, string | undefined>;
    selectedVariantDetail: VariantRow;
  }>();

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const renderCTAButtons = () => {
    return (
      <div className="space-y-3">
        {session?.user.role === "reseller" ? (
          <button className="w-full bg-primary/90 hover:bg-primary text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-3 mt-4">
            {/* Add to Cart */}
            <button
              className="w-full bg-primary/90 hover:bg-primary text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              onClick={() => console.log("Add to cart")}
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>

            {/* Buy Now */}
            <button
              className="w-full border-1 border-primary cursor-pointer bg-white hover:bg-secondary text-primary py-3 px-6 rounded-lg font-semibold transition-colors"
              onClick={() => console.log("Buy now")}
            >
              Buy Now
            </button>
          </div>
        )}

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

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getById<ProductData>("/api/admin/products", slug);

      if (response.data) {
        setProduct(response.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return <ErrorPublicPage errorMessage={error} />;
  }

  if (!product) {
    return <ErrorPublicPage errorMessage="Page Not Found" />;
  }

  const isEssentialOrBasic = hasTag(product.tags, "Essentials").isFound
    ? hasTag(product.tags, "Essentials")
    : hasTag(product.tags, "Basic");

  const enrichProductData = enrichProduct(product, currency);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            {/* Product Gallery */}
            <ProductGallery
              product={{
                productName: product.productName,
                slug: product.slug,
                tags: product.tags || [],
                createdAt: product.createdAt,
              }}
              productMedia={[
                ...[
                  ...(product.productMedia || []),
                  ...(enrichProductData.variantImages || []),
                ].filter(
                  (
                    img
                  ): img is {
                    imageUrl: string;
                    imagePublicId: string;
                    type: string;
                  } => !!img.imageUrl && !!img.imagePublicId && !!img.type
                ),
              ]}
              selectedVariant={selectedVariant}
            />

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
                  {product?.productName}
                </h1>
              </div>
              {/* optional */}
              <p className="text-lg text-gray-600">
                {product.categoryDetail.name}
              </p>

              {/* if product essential or basic */}
              {isEssentialOrBasic.isFound && (
                <div className="flex gap-2">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    {isEssentialOrBasic.tagToCheck}
                  </span>
                </div>
              )}
            </div>

            {/* Pricing Display */}
            {selectedVariant && (
              <PricingDisplay
                selectedVariant={selectedVariant}
                moq={product.moq}
              />
            )}

            {/* Variant Selector */}
            <VariantSelector
              productVariant={product.productVariantsData || []}
              moq={product.moq || 1}
              attributes={enrichProductData.attributes}
              setSelectedVariant={setSelectedVariant}
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
