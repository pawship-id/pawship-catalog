import mongoose, { Schema, Types } from "mongoose";
import softDelete from "mongoose-delete";

export interface IPromoVariant {
  variantId: Types.ObjectId;
  variantName: string;
  originalPrice: Record<string, number>;
  discountPercentage: Record<string, number>; // Per currency
  discountedPrice: Record<string, number>;
  isActive: boolean;
  image?: {
    imageUrl: string;
    imagePublicId: string;
  };
}

export interface IPromoProduct {
  productId: Types.ObjectId;
  productName: string;
  image?: {
    imageUrl: string;
    imagePublicId: string;
  };
  variants: IPromoVariant[];
}

export interface IPromo extends Document {
  promoName: string;
  startDate: Date;
  endDate: Date;
  products: IPromoProduct[];
  isActive: boolean;
  deleted?: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PromoVariantSchema = new Schema(
  {
    variantId: {
      type: Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: true,
    },
    variantName: {
      type: String,
      required: true,
    },
    originalPrice: {
      type: Map,
      of: Number,
      required: true,
    },
    discountPercentage: {
      type: Map,
      of: Number,
      required: true,
      validate: {
        validator: function (v: Map<string, number>) {
          // Validate each currency's discount is between 0-100
          for (const [, value] of v) {
            if (value < 0 || value > 100) return false;
          }
          return true;
        },
        message:
          "Discount percentage must be between 0 and 100 for all currencies",
      },
    },
    discountedPrice: {
      type: Map,
      of: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    image: {
      _id: false,
      type: {
        imageUrl: String,
        imagePublicId: String,
      },
    },
  },
  { _id: false }
);

const PromoProductSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    image: {
      _id: false,
      type: {
        imageUrl: String,
        imagePublicId: String,
      },
    },
    variants: [PromoVariantSchema],
  },
  { _id: false }
);

const PromoSchema = new Schema<IPromo>(
  {
    promoName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    products: [PromoProductSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, collection: "promos" }
);

// Validate end date is after start date
PromoSchema.pre("save", function (next) {
  if (this.endDate <= this.startDate) {
    next(new Error("End date must be after start date"));
  }
  next();
});

// mongoose-delete plugin for soft delete
PromoSchema.plugin(softDelete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: "all",
});

const Promo = mongoose.models.Promo || mongoose.model("Promo", PromoSchema);

export default Promo;
