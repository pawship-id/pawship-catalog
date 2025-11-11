"use client";
import React, { useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "./ui/button";
import { ProductData, VariantRow } from "@/lib/types/product";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/context/CurrencyContext";
import { TagData } from "@/lib/types/tag";
import { isNewArrival } from "@/lib/helpers/product";
import { useSession } from "next-auth/react";
import AddToCartModal from "./add-to-cart-modal";

interface ProductCardProps {
  product: ProductData;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currency, format } = useCurrency();
  const { data: session } = useSession();

  const router = useRouter();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const productMedia =
    product.productMedia?.length > 0 ? product.productMedia.slice(0, 2) : [];

  const variants: VariantRow[] | undefined = product.productVariantsData;

  const isReseller = session?.user.role === "reseller";

  // Calculate minimum price
  // For reseller: always use original price
  // For customer: use discounted price if available, otherwise original price
  const minPrice = Math.min(
    ...(variants || []).map((v: VariantRow) => {
      if (isReseller) {
        return v.price[currency] || Infinity;
      }
      return v.discountedPrice?.[currency] || v.price[currency] || Infinity;
    })
  );

  // Check if any variant has a discounted price for the selected currency
  const hasDiscount = variants?.some(
    (v: VariantRow) => v.discountedPrice && v.discountedPrice[currency]
  );

  // Get original minimum price (before discount) - only for non-reseller
  const minOriginalPrice =
    hasDiscount && !isReseller
      ? Math.min(
          ...(variants || []).map(
            (v: VariantRow) => v.price[currency] ?? Infinity
          )
        )
      : null;

  // const discount =
  //   product.originalPrice && product.originalPrice[currency]
  //     ? Math.round(
  //         ((product.originalPrice[currency] - product.price[currency]) /
  //           product.originalPrice[currency]) *
  //           100
  //       )
  //     : 0;

  return (
    <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col max-w-xs">
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        {
          isNewArrival(product.createdAt) ? (
            <span className="bg-emerald-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              New Arrivals
            </span>
          ) : product.tags?.some(
              (tag: TagData) => tag.tagName.toLowerCase() === "best sellers"
            ) ? (
            <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              Best Sellers
            </span>
          ) : (
            <p>diskon</p>
          )
          // product.originalPrice && discount > 0 ? (
          //   <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
          //     -{discount}%
          //   </span>
          // ) : null
        }
      </div>

      {/* Main Image */}
      <div
        onClick={() => router.push(`/product/${product.slug}`)}
        className="relative aspect-square overflow-hidden cursor-pointer"
        onMouseEnter={() => {
          if (productMedia?.length > 1) setCurrentImageIndex(1);
        }}
        onMouseLeave={() => setCurrentImageIndex(0)}
      >
        <div className="relative w-full h-full">
          {productMedia?.map((image, index) => (
            <img
              key={index}
              src={image.imageUrl}
              alt={`Image product ${product.productName} - ${index + 1}`}
              className={`aspect-square absolute w-full h-full inset-0 object-cover transition-opacity duration-500 ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>

        {/* Thumbnails */}
        {productMedia?.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {productMedia.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentImageIndex
                    ? "bg-white scale-125"
                    : "bg-white/60 hover:bg-white/80"
                } cursor-pointer`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Name + Wishlist */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-gray-700 transition-colors duration-200 flex-1 pr-2">
            {product.productName}
          </h3>
          <Heart
            onClick={() => setIsLiked(!isLiked)}
            className={`w-5 h-5 transition-colors duration-200 flex-shrink-0 ${
              isLiked
                ? "fill-red-500 text-red-500"
                : "text-gray-600 hover:text-red-500"
            } cursor-pointer`}
          />
        </div>

        {/* Bottom: Price + Button */}
        <div className="mt-auto">
          <div className="mb-3">
            {/* Only show strikethrough price for non-reseller users */}
            {minOriginalPrice && (
              <p className="text-sm text-gray-400 line-through">
                {format(minOriginalPrice)}
              </p>
            )}
            <p className="text-lg font-bold text-gray-900">
              {format(minPrice)}
            </p>
          </div>

          <Button
            variant="outline"
            onClick={handleAddToCart}
            className="w-full py-1 bg-primary/85 text-white border-primary rounded-lg font-semibold transition-all duration-200 hover:bg-primary hover:text-white flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Add to Cart Modal */}
      <AddToCartModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={product}
      />
    </div>
  );
}
