export interface IOrderDetail {
  productId: string;
  productName: string;
  quantity: number;
  stock?: number;
  variantId: string;
  variantName: string;
  price: any;
  image: {
    imagePublicId: string;
    imageUrl: string;
  };
  subTotal: number;
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
