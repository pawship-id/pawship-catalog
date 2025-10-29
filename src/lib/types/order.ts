export interface IOrderDetail {
  productId: string;
  quantity: number;
  subtotal: number;
}

export interface IShippingAddress {
  address: string;
  country: string;
  city: string;
  district: string;
  zipCode: string;
}

export interface OrderForm {
  orderDate: Date;
  invoiceNumber: string;
  totalAmount: number;
  status: "pending" | "confirm" | "process" | "done";
  shippingAddress: IShippingAddress;
  orderDetails: IOrderDetail[];
}

export interface OrderData {
  _id: string;
  orderDate: Date;
  invoiceNumber: string;
  totalAmount: number;
  status: "pending" | "confirm" | "process" | "done";
  shippingAddress: IShippingAddress;
  orderDetails: IOrderDetail[];
  deleted?: boolean;
  deletedAt?: Date;
  deletedBy?: string;
}
