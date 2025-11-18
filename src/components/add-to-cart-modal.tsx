"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShoppingCart } from "lucide-react";
import { ProductData, VariantRow } from "@/lib/types/product";
import { useCurrency } from "@/context/CurrencyContext";
import { useSession } from "next-auth/react";
import { showErrorAlert, showSuccessAlert } from "@/lib/helpers/sweetalert2";
import { ProductGallery } from "@/components/product/product-galery";
import VariantSelector from "@/components/product/variant-selector";
import PricingDisplay from "@/components/product/product-pricing";
import { enrichProduct } from "@/lib/helpers/product";
import { useRouter } from "next/navigation";

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductData | null;
}

export default function AddToCartModal({
  isOpen,
  onClose,
  product,
}: AddToCartModalProps) {
  const { currency } = useCurrency();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState<{
    selectedVariantTypes: Record<string, string>;
    selectedVariantDetail: VariantRow;
  }>();
  const [quantity, setQuantity] = useState(1);
  const [disabledAddToCart, setDisabledAddToCart] = useState(true);

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setQuantity(product.moq || 1);
      setSelectedVariant(undefined);
    }
  }, [product]);

  // Validate add to cart button
  useEffect(() => {
    let isDisabled = true;

    if (selectedVariant && product) {
      const selectedTypeCount = Object.keys(
        selectedVariant.selectedVariantTypes
      ).length;
      const selectedVariantCount = Object.keys(
        selectedVariant.selectedVariantDetail.attrs
      ).length;

      isDisabled = selectedTypeCount !== selectedVariantCount;

      if (
        !product.preOrder?.enabled &&
        quantity > selectedVariant.selectedVariantDetail.stock
      ) {
        isDisabled = true;
      }

      // if (quantity < (product.moq || 1)) {
      //   isDisabled = true;
      // }
    }

    setDisabledAddToCart(isDisabled);
  }, [selectedVariant, quantity, product]);

  if (!product) return null;

  const enrichProductData = enrichProduct(product, currency);

  const handleAddToCart = () => {
    // Check if user is logged in
    if (!session || status !== "authenticated") {
      router.push("/login");
      showErrorAlert(undefined, "Please login first");
      return;
    }

    if (!selectedVariant) return;

    const cartItem = {
      productId: product._id,
      variantId: selectedVariant.selectedVariantDetail._id,
      quantity: quantity,
    };

    // Get existing cart
    const existingCart = JSON.parse(localStorage.getItem("cartItem") || "[]");

    // Check if item already exists
    const existingItemIndex = existingCart.findIndex(
      (item: any) =>
        item.variantId === selectedVariant.selectedVariantDetail._id
    );

    if (existingItemIndex > -1) {
      // Update quantity
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      existingCart.push(cartItem);
    }

    localStorage.setItem("cartItem", JSON.stringify(existingCart));

    showSuccessAlert(
      "Added to Cart",
      `${product.productName} (${selectedVariant.selectedVariantDetail.name}) has been added to your cart!`
    );

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="lg:max-w-[60vw] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold"></DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
          {/* Left Side - Product Gallery */}
          <div>
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
          </div>

          {/* Right Side - Product Info */}
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {product?.productName}
                </h1>
              </div>

              {/* category */}
              {product.categoryDetail.name.toLowerCase() === "essential" ||
              product.categoryDetail.name.toLowerCase() === "basic" ? (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  {product.categoryDetail.name}
                </span>
              ) : (
                <span
                  className={`bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium`}
                >
                  {product.categoryDetail.name}
                </span>
              )}
            </div>

            {/* Pricing Display */}
            {selectedVariant && (
              <PricingDisplay
                selectedVariant={selectedVariant}
                moq={product.moq}
                productId={product._id}
                resellerPricing={product.resellerPricing}
              />
            )}

            {/* Variant Selector */}
            <VariantSelector
              productVariant={product.productVariantsData || []}
              quantity={quantity || 1}
              setQuantity={setQuantity}
              moq={product.moq || 1}
              attributes={enrichProductData.attributes}
              setSelectedVariant={setSelectedVariant}
              preOrder={product.preOrder}
            />

            {/* CTA Buttons */}
            <button
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                disabledAddToCart
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-primary/90 hover:bg-primary text-white cursor-pointer"
              }`}
              onClick={handleAddToCart}
              disabled={disabledAddToCart}
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
