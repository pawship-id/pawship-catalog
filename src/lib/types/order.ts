export interface IOrderDetail {
  productId: string;
  productName: string;
  categoryId?: string; // Category ID for B2B discount calculation
  quantity: number;
  stock: number;
  preOrder: { enabled: boolean; leadTime: string };
  variantId: string;
  variantName: string;
  sku?: string; // SKU of the variant
  originalPrice: any; // Original price before any discount (for both B2B and B2C)
  discountedPrice?: any; // Price after discount (if discount applied)
  image: {
    imagePublicId: string;
    imageUrl: string;
  };
  subTotal: number;
  discountPercentage?: number; // Discount percentage applied (if any)
  moq?: number; // Minimum Order Quantity per product (for resellers)
  resellerPricing?: {
    currency: string;
    tiers: Array<{
      name: string;
      minimumQuantity: number;
      discount: number;
      categoryProduct: string | string[];
    }>;
  };
}

/**
 * Snapshot of a promotion applied to an order, written by the Promotion Engine
 * at checkout. Numbers are in the order currency (`discountCurrency`).
 */
export interface IAppliedPromotion {
  promotionId: string;
  code: string;
  name: string;
  trigger: string;
  stackable?: boolean;
  rewardsSummary?: string;
  productDiscount: number; // total product-side discount
  shippingDiscount: number; // shipping discount contributed by this promotion
  freeGift?: {
    productId: string;
    variantId: string;
    variantName?: string;
    quantity: number;
  } | null;
  discountCurrency: string;
}

export interface IStatusLog {
  status: string;
  date: Date;
  username: string;
}

export interface IPaymentProof {
  imageUrl: string;
  imagePublicId: string;
  orderInvoice?: string;
  note?: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface IShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  district: string;
  zipCode: string;
  address: string;
}

export interface OrderForm {
  orderDate: Date;
  invoiceNumber: string;
  totalAmount: number;
  status:
    | "pending confirmation"
    | "awaiting payment"
    | "payment confirmed"
    | "processing"
    | "shipped";
  orderType: "B2C" | "B2B";
  shippingAddress: IShippingAddress;
  orderDetails: IOrderDetail[];
  shippingCost: number;
  discountShipping: number;
  currency: string;
  appliedPromotions?: IAppliedPromotion[];
  promotionDiscount?: number; // total promotion benefit (product + shipping), order currency
}

export interface OrderData {
  _id: string;
  orderDate: Date;
  invoiceNumber: string;
  totalAmount: number;
  status:
    | "pending confirmation"
    | "awaiting payment"
    | "payment confirmed"
    | "processing"
    | "shipped";
  orderType: "B2C" | "B2B";
  shippingAddress: IShippingAddress;
  orderDetails: IOrderDetail[];
  shippingCost: number;
  discountShipping: number;
  currency: string;
  appliedPromotions?: IAppliedPromotion[];
  promotionDiscount?: number; // total promotion benefit (product + shipping), order currency
  baseRupiah?: number; // Rupiah rate of `currency`, snapshotted when the order was created
  snapshoot_baserupiah?: number; // Previous `baseRupiah` kept when an admin overrides the rate
  grossRevenue?: number; // Revenue in IDR before the product & shipping discount
  netRevenue?: number; // Revenue in IDR after every discount
  /** @deprecated Superseded by `netRevenue`. Only present on orders created before it existed; never written anymore. */
  revenue?: number;
  createdAt?: Date; // Set by mongoose timestamps, returned by the API
  statusLog: IStatusLog[];
  paymentProofs: IPaymentProof[];
  deleted?: boolean;
  deletedAt?: Date;
  deletedBy?: string;
}
