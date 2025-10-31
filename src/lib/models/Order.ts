import mongoose, { Document, Schema } from "mongoose";
import { IOrderDetail, IShippingAddress } from "../types/order";

export interface IOrder extends Document {
  orderDate: Date;
  invoiceNumber: string;
  totalAmount: number;
  status: "pending confirmation" | "paid" | "processing" | "shipped";
  shippingAddress: IShippingAddress;
  orderDetails: IOrderDetail[];
  shippingCost: number;
  currency: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderDetailSchema = new Schema<IOrderDetail>(
  {
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    variantId: { type: String, required: true },
    variantName: { type: String, required: true },
    price: {
      type: Object,
      required: true,
    },
    image: {
      imagePublicId: { type: String, required: true },
      imageUrl: { type: String, required: true },
    },
    subTotal: { type: Number, required: true },
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

const OrderSchema = new Schema<IOrder>(
  {
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
    status: {
      type: String,
      enum: ["pending confirmation", "paid", "processing", "shipped"],
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
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

export default Order;
