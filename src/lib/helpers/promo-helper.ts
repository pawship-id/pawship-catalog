/**
 * Helper functions for applying active promotions to products
 * This file handles the logic for checking active promos and calculating discounted prices
 */

export interface ActivePromo {
  _id: string;
  promoName: string;
  startDate: Date;
  endDate: Date;
  products: {
    productId: string;
    variants: {
      variantId: string;
      originalPrice: Record<string, number>;
      discountPercentage: Record<string, number>;
      discountedPrice: Record<string, number>;
      isActive: boolean;
    }[];
  }[];
  isActive: boolean;
}

/**
 * Check if a promo is currently active based on dates
 */
export function isPromoActive(promo: ActivePromo): boolean {
  if (!promo.isActive) return false;

  const now = new Date();
  const startDate = new Date(promo.startDate);
  const endDate = new Date(promo.endDate);

  return now >= startDate && now <= endDate;
}

/**
 * Get active promo for a specific product variant
 */
export function getActivePromoForVariant(
  productId: string,
  variantId: string,
  activePromos: ActivePromo[]
): ActivePromo["products"][0]["variants"][0] | null {
  for (const promo of activePromos) {
    if (!isPromoActive(promo)) continue;

    const promoProduct = promo.products.find((p) => p.productId === productId);

    if (promoProduct) {
      const promoVariant = promoProduct.variants.find(
        (v) => v.variantId === variantId && v.isActive
      );

      if (promoVariant) {
        return promoVariant;
      }
    }
  }

  return null;
}

/**
 * Calculate final price for a variant considering active promos
 * For retail customers: Apply promo discount if available
 * For resellers: Always use base price (no promo discount)
 */
export function calculateFinalPrice(
  basePrice: number,
  currency: string,
  productId: string,
  variantId: string,
  activePromos: ActivePromo[],
  isReseller: boolean = false
): {
  finalPrice: number;
  originalPrice: number;
  hasDiscount: boolean;
  discountPercentage: number;
} {
  // Resellers always get base price
  if (isReseller) {
    return {
      finalPrice: basePrice,
      originalPrice: basePrice,
      hasDiscount: false,
      discountPercentage: 0,
    };
  }

  // Check for active promo
  const promoVariant = getActivePromoForVariant(
    productId,
    variantId,
    activePromos
  );

  if (promoVariant) {
    const discountedPrice = promoVariant.discountedPrice[currency];
    const discountPercentage = promoVariant.discountPercentage[currency] || 0;

    if (discountedPrice !== undefined && discountedPrice < basePrice) {
      return {
        finalPrice: discountedPrice,
        originalPrice: basePrice,
        hasDiscount: true,
        discountPercentage,
      };
    }
  }

  // No promo or promo not applicable
  return {
    finalPrice: basePrice,
    originalPrice: basePrice,
    hasDiscount: false,
    discountPercentage: 0,
  };
}

/**
 * Get minimum price for a product considering all variants and active promos
 */
export function getProductMinPrice(
  variants: Array<{
    _id: string;
    price?: Record<string, number>;
  }>,
  productId: string,
  currency: string,
  activePromos: ActivePromo[],
  isReseller: boolean = false
): {
  minPrice: number;
  minOriginalPrice: number | null;
  hasDiscount: boolean;
  maxDiscountPercentage: number;
} {
  let minPrice = Infinity;
  let minOriginalPrice: number | null = null;
  let hasDiscount = false;
  let maxDiscountPercentage = 0;

  for (const variant of variants) {
    const basePrice = variant.price?.[currency];
    if (!basePrice) continue;

    const priceInfo = calculateFinalPrice(
      basePrice,
      currency,
      productId,
      variant._id,
      activePromos,
      isReseller
    );

    // Update minPrice and track its original price
    if (priceInfo.finalPrice < minPrice) {
      minPrice = priceInfo.finalPrice;
      // Store the original price of the variant that has the minimum final price
      if (priceInfo.hasDiscount) {
        minOriginalPrice = priceInfo.originalPrice;
        hasDiscount = true;
      } else {
        minOriginalPrice = null;
      }
    }

    // Track max discount percentage across all variants
    if (priceInfo.hasDiscount) {
      hasDiscount = true;
      if (priceInfo.discountPercentage > maxDiscountPercentage) {
        maxDiscountPercentage = priceInfo.discountPercentage;
      }
    }
  }

  return {
    minPrice: minPrice === Infinity ? 0 : minPrice,
    minOriginalPrice,
    hasDiscount,
    maxDiscountPercentage,
  };
}
