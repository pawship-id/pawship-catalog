import mongoose, { Document, Schema, Types } from "mongoose";
import softDelete from "mongoose-delete";
import { VariantType } from "@/lib/types/product";

export interface IProduct extends Document {
  productName: string;
  categoryId: Types.ObjectId;
  moq: number;
  productDescription: string;
  sizeProduct?: {
    imageUrl: string;
    imagePublicId: string;
  }[];
  productMedia?: {
    imageUrl: string;
    imagePublicId: string;
  }[];
  tags?: Types.ObjectId[];
  exclusive: {
    enabled: boolean;
    country: string[];
  };
  preOrder: {
    enabled: boolean;
    leadTime: string;
  };
  variantTypes?: VariantType[];
  variantRows?: Types.ObjectId[];
  marketingLinks?: string[];
  slug?: string;
  deleted?: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
}

const VariantTypeSchema = new Schema<VariantType>(
  {
    name: {
      type: String,
    },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    productName: {
      type: String,
      required: [true, "Please input a product name"],
      uppercase: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    moq: {
      type: Number,
    },
    productDescription: {
      type: String,
      required: [true, "Please input a product description"],
    },
    sizeProduct: [
      {
        _id: false,
        imageUrl: {
          type: String,
        },
        imagePublicId: {
          type: String,
        },
      },
    ],
    productMedia: [
      {
        _id: false,
        imageUrl: {
          type: String,
          required: true,
        },
        imagePublicId: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["image", "video"],
          required: true,
        },
      },
    ],
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    exclusive: {
      _id: false,
      type: {
        enabled: {
          type: Boolean,
          default: false,
        },
        country: {
          type: [String],
        },
      },
    },
    preOrder: {
      _id: false,
      type: {
        enabled: {
          type: Boolean,
          default: false,
        },
        leadTime: {
          type: String,
        },
      },
    },
    variantTypes: {
      type: [VariantTypeSchema],
    },
    marketingLinks: {
      type: [String],
    },
    slug: {
      type: String,
    },
  },
  { timestamps: true }
);

// mongoose-delete plugin for soft delete
ProductSchema.plugin(softDelete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: "all",
});

ProductSchema.virtual("productVariantsData", {
  ref: "ProductVariant",
  localField: "_id",
  foreignField: "productId",
  justOne: false,
});

ProductSchema.virtual("categoryDetail", {
  ref: "Category",
  localField: "categoryId",
  foreignField: "_id",
  justOne: true,
});

ProductSchema.set("toObject", { virtuals: true });
ProductSchema.set("toJSON", { virtuals: true });

const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;
