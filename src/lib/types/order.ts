export interface IOrderDetail {
  productId: string;
  productName: string;
  quantity: number;
  stock: number;
  preOrder: { enabled: boolean; leadTime: string };
  variantId: string;
  variantName: string;
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
  status: "pending confirmation" | "paid" | "processing" | "shipped";
  orderType: "B2C" | "B2B";
  shippingAddress: IShippingAddress;
  orderDetails: IOrderDetail[];
  shippingCost: number;
  currency: string;
}

export interface OrderData {
  _id: string;
  orderDate: Date;
  invoiceNumber: string;
  totalAmount: number;
  status: "pending confirmation" | "paid" | "processing" | "shipped";
  orderType: "B2C" | "B2B";
  shippingAddress: IShippingAddress;
  orderDetails: IOrderDetail[];
  shippingCost: number;
  currency: string;
  deleted?: boolean;
  deletedAt?: Date;
  deletedBy?: string;
}
