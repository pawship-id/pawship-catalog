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

export interface IStatusLog {
  status: string;
  date: Date;
  username: string;
}

export interface IPaymentProof {
  imageUrl: string;
  imagePublicId: string;
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
  revenue?: number; // Revenue in IDR
  statusLog: IStatusLog[];
  paymentProofs: IPaymentProof[];
  deleted?: boolean;
  deletedAt?: Date;
  deletedBy?: string;
}
