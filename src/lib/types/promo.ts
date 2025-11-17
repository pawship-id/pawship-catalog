export interface PromoVariant {
  variantId: string;
  variantName: string;
  originalPrice: Record<string, number>;
  discountPercentage: Record<string, number>; // Per currency
  discountedPrice: Record<string, number>;
  isActive: boolean;
  image?: {
    imageUrl: string;
    imagePublicId: string;
  };
}

export interface PromoProduct {
  productId: string;
  productName: string;
  variants: PromoVariant[];
}

export interface PromoData {
  _id: string;
  promoName: string;
  startDate: string | Date;
  endDate: string | Date;
  products: PromoProduct[];
  isActive: boolean;
  deleted?: boolean;
  deletedAt?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface PromoForm {
  promoName: string;
  startDate: string; // Always string for form input
  endDate: string; // Always string for form input
  products: PromoProduct[];
  isActive: boolean;
}
