import mongoose, { Document, Schema } from "mongoose";
import { IOrderDetail, IShippingAddress } from "../types/order";

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

export interface IOrder extends Document {
  userId: string;
  orderDate: Date;
  invoiceNumber: string;
  totalAmount: number;
  status:
    | "pending confirmation"
    | "awaiting payment"
    | "payment confirmed"
    | "processing"
    | "shipped";
  shippingAddress: IShippingAddress;
  orderDetails: IOrderDetail[];
  shippingCost: number;
  discountShipping: number;
  orderType: "B2C" | "B2B";
  currency: string;
  revenue?: number; // Revenue in IDR
  statusLog: IStatusLog[];
  paymentProofs: IPaymentProof[];
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderDetailSchema = new Schema<IOrderDetail>(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    variantId: { type: String, required: true },
    variantName: { type: String, required: true },
    sku: { type: String },
    originalPrice: {
      type: Object,
      required: true,
    },
    discountedPrice: {
      type: Object,
    },
    image: {
      imagePublicId: { type: String, required: true },
      imageUrl: { type: String, required: true },
    },
    subTotal: { type: Number, required: true },
    discountPercentage: {
      type: Number,
    },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName: {
      type: String,
      required: [true, "Please input a full name"],
    },
    email: {
      type: String,
      required: [true, "Please input a email"],
    },
    phone: {
      type: String,
      required: [true, "Please input a phone number"],
    },
    address: {
      type: String,
      required: [true, "Please input a address"],
    },
    country: {
      type: String,
      required: [true, "Please input a country"],
    },
    city: {
      type: String,
      required: [true, "Please input a zip"],
    },
    district: {
      type: String,
      required: [true, "Please input a district"],
    },
    zipCode: {
      type: String,
      required: [true, "Please input a zipcode"],
    },
  },
  { _id: false }
);

const StatusLogSchema = new Schema<IStatusLog>(
  {
    status: { type: String, required: true },
    date: { type: Date, default: Date.now },
    username: { type: String, required: true },
  },
  { _id: false }
);

const PaymentProofSchema = new Schema<IPaymentProof>(
  {
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, required: true },
    orderInvoice: { type: String },
    note: { type: String },
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingCost: {
      type: Number,
      default: 0,
    },
    discountShipping: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: [
        "pending confirmation",
        "awaiting payment",
        "payment confirmed",
        "processing",
        "shipped",
      ],
      default: "pending confirmation",
    },
    shippingAddress: {
      type: ShippingAddressSchema,
      required: true,
    },
    orderDetails: {
      type: [OrderDetailSchema],
      validate: [
        (val: IOrderDetail[]) => val.length > 0,
        "Order must have at least one detail",
      ],
    },
    currency: {
      type: String,
      required: true,
    },
    orderType: {
      type: String,
      enum: ["B2C", "B2B"],
      default: "B2C",
    },
    revenue: {
      type: Number,
      min: 0,
    },
    statusLog: {
      type: [StatusLogSchema],
      default: [],
    },
    paymentProofs: {
      type: [PaymentProofSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

export default Order;
