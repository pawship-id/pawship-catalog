import mongoose, { Document, Schema, Types } from "mongoose";
import softDelete from "mongoose-delete";

export interface IBanner extends Document {
  title: string;
  description?: string;
  page:
    | "home"
    | "our-collection"
    | "reseller-program"
    | "reseller-whitelabeling"
    | "about-us"
    | "contact-us"
    | "stores"
    | "payment";
  desktopImageUrl: string;
  desktopImagePublicId: string;
  mobileImageUrl?: string;
  mobileImagePublicId?: string;
  button?: {
    text: string;
    url: string;
    color: string;
    position: "left" | "center" | "right";
  };
  style: {
    textColor: string;
    overlayColor?: string;
    textPosition: "left" | "center" | "right";
  };
  order: number;
  isActive: boolean;
  deleted?: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema = new Schema<IBanner>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    page: {
      type: String,
      enum: [
        "home",
        "our-collection",
        "reseller-program",
        "reseller-whitelabeling",
        "about-us",
        "contact-us",
        "stores",
        "payment",
      ],
      required: [true, "Page is required"],
      default: "home",
    },
    desktopImageUrl: {
      type: String,
      required: [true, "Desktop image is required"],
    },
    desktopImagePublicId: {
      type: String,
      required: [true, "Desktop image public ID is required"],
    },
    mobileImageUrl: {
      type: String,
    },
    mobileImagePublicId: {
      type: String,
    },
    button: {
      _id: false,
      type: {
        text: {
          type: String,
        },
        url: {
          type: String,
        },
        color: {
          type: String,
          default: "#FF6B35",
        },
        position: {
          type: String,
          enum: ["left", "center", "right"],
          default: "center",
        },
      },
    },
    style: {
      _id: false,
      type: {
        textColor: {
          type: String,
          default: "#FFFFFF",
        },
        overlayColor: {
          type: String,
        },
        textPosition: {
          type: String,
          enum: ["left", "center", "right"],
          default: "center",
        },
      },
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes
BannerSchema.index({ page: 1, isActive: 1, order: 1 });

// mongoose-delete plugin for soft delete
BannerSchema.plugin(softDelete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: "all",
});

const Banner = mongoose.models.Banner || mongoose.model("Banner", BannerSchema);

export default Banner;
