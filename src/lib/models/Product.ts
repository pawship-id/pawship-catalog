import mongoose, { Document, Schema, Types } from "mongoose";
import softDelete from "mongoose-delete";
import { VariantRow, VariantType } from "@/lib/types/product";

export interface IProduct extends Document {
  sku: string;
  productName: string;
  categoryId: Types.ObjectId;
  moq: number;
  productDescription: string;
  sizeProduct?: {
    imageUrl: string;
    imagePublicId: string;
  };
  productMedia?: {
    imageUrl: string;
    imagePublicId: string;
  }[];
  tags?: string[];
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
    sku: {
      type: String,
      required: [true, "Please input a SKU"],
    },
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
    sizeProduct: {
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
    productMedia: [
      {
        _id: false, // Opsional: Untuk mencegah Mongoose membuat _id otomatis di setiap item array
        imageUrl: {
          type: String,
          required: true, // Opsional: Tambahkan validasi
        },
        imagePublicId: {
          type: String,
          required: true, // Opsional: Tambahkan validasi
        },
        type: {
          // Ini adalah tipe media: 'image' atau 'video'
          type: String,
          enum: ["image", "video"], // Disarankan: Batasi tipe string yang valid
          required: true,
        },
      },
    ],
    tags: {
      type: [String],
    },
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
    variantRows: [
      {
        type: Schema.Types.ObjectId,
        ref: "ProductVarian", // Nama model yang direferensikan
      },
    ],
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

const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;
