import mongoose, { Schema, Types } from "mongoose";
import softDelete from "mongoose-delete";
import { VariantRow } from "@/lib/types/product";

export interface IProductVariant extends Document {
  codeRow: string;
  position: number;
  image?: File | string | null;
  sku: string;
  attrs: Record<string, string>;
  name: string;
  stock?: number;
  price?: any;
  selected?: boolean;
  deleted?: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
}

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    codeRow: {
      type: String,
    },
    position: {
      type: Number,
    },
    image: {
      _id: false,
      type: {
        imageUrl: {
          type: String,
        },
        imagePublicId: {
          type: String,
        },
      },
    },
    sku: {
      type: String,
    },
    attrs: {
      type: Map,
      of: String,
    },
    name: {
      type: String,
    },
    stock: {
      type: Number,
    },
    price: {
      type: Schema.Types.Mixed,
    },
    selected: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

// mongoose-delete plugin for soft delete
ProductVariantSchema.plugin(softDelete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: "all",
});

const ProductVariant =
  mongoose.models.ProductVariant ||
  mongoose.model("ProductVariant", ProductVariantSchema);

export default ProductVariant;
