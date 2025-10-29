import mongoose, { Document, Schema } from "mongoose";
import { IOrderDetail, IShippingAddress } from "../types/order";

export interface IOrder extends Document {
  orderDate: Date;
  invoiceNumber: string;
  totalAmount: number;
  status: "pending" | "confirm" | "process" | "done";
  shippingAddress: IShippingAddress;
  orderDetails: IOrderDetail[];
  shippingCost: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderDetailSchema = new Schema<IOrderDetail>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
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
      enum: ["pending", "confirm", "process", "done"],
      default: "pending",
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
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

export default Order;
