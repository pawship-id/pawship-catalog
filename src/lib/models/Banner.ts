import mongoose, { Document, Schema, Types } from "mongoose";
import softDelete from "mongoose-delete";

type AlignmentHorizontal = "left" | "center" | "right";
type AlignmentVertical = "top" | "center" | "bottom";

export interface IBanner extends Document {
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
    position: {
      desktop: {
        horizontal: AlignmentHorizontal;
        vertical: AlignmentVertical;
      };
      mobile?: {
        horizontal: AlignmentHorizontal;
        vertical: AlignmentVertical;
      };
    };
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
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        color: {
          type: String,
          default: "#FF6B35",
        },
        position: {
          _id: false,
          type: {
            desktop: {
              _id: false,
              type: {
                horizontal: {
                  type: String,
                  enum: ["left", "center", "right"],
                  required: true,
                },
                vertical: {
                  type: String,
                  enum: ["top", "center", "bottom"],
                  required: true,
                },
              },
              required: true,
            },
            mobile: {
              _id: false,
              type: {
                horizontal: {
                  type: String,
                  enum: ["left", "center", "right"],
                },
                vertical: {
                  type: String,
                  enum: ["top", "center", "bottom"],
                },
              },
            },
          },
          required: true,
        },
      },
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
