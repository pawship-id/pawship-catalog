import mongoose, { Document, Schema, Types } from "mongoose";
import softDelete from "mongoose-delete";

export interface ITierDiscount {
  name: string;
  minimumQuantity: number;
  discount: number;
  categoryProduct: string;
}

export interface IResellerCategory extends Document {
  resellerCategoryName: string;
  currency: string;
  tierDiscount: ITierDiscount[];
  slug: string;
  isActive: boolean;
  deleted?: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const TierDiscountSchema = new Schema<ITierDiscount>(
  {
    name: {
      type: String,
      required: [true, "Please input a name"],
    },
    minimumQuantity: {
      type: Number,
      required: [true, "Please input a minimum quantity"],
      min: 0,
      default: 0,
    },
    discount: {
      type: Number,
      required: [true, "Please input a discount"],
      min: 0,
      max: 100,
      default: 0,
    },
    categoryProduct: {
      type: String,
    },
  },
  { _id: false }
);

const ResellerCategorySchema = new Schema<IResellerCategory>(
  {
    resellerCategoryName: {
      type: String,
      required: [true, "Please input a reseller category name"],
    },
    currency: {
      type: String,
      required: [true, "Please input a currency"],
      uppercase: true,
    },
    tierDiscount: {
      type: [TierDiscountSchema],
    },
    slug: {
      type: String,
    },
    isActive: {
      type: Boolean,
      required: [true, "Please input a status"],
      default: true,
    },
  },
  { timestamps: true }
);

// mongoose-delete plugin for soft delete
ResellerCategorySchema.plugin(softDelete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: "all",
});

const ResellerCategory =
  mongoose.models.ResellerCategory ||
  mongoose.model("ResellerCategory", ResellerCategorySchema);

export default ResellerCategory;
