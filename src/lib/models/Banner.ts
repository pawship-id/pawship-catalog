import mongoose, { Document, Schema, Types } from "mongoose";
import softDelete from "mongoose-delete";

export interface IBanner extends Document {
  title?: string;
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
    desktop: {
      text: string;
      url: string;
      color: string;
      position: {
        x: number; // percentage 0-100
        y: number; // percentage 0-100
      };
    };
    mobile?: {
      text: string;
      url: string;
      color: string;
      position: {
        x: number; // percentage 0-100
        y: number; // percentage 0-100
      };
    };
  };
  style?: {
    desktop?: {
      textColor?: string;
      overlayColor?: string;
      textPosition?: {
        x: number; // percentage 0-100
        y: number; // percentage 0-100
      };
    };
    mobile?: {
      textColor?: string;
      overlayColor?: string;
      textPosition?: {
        x: number; // percentage 0-100
        y: number; // percentage 0-100
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
    title: {
      type: String,
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
        desktop: {
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
              _id: false,
              type: {
                x: {
                  type: Number,
                  default: 50, // center horizontally
                },
                y: {
                  type: Number,
                  default: 70, // near bottom
                },
              },
            },
          },
        },
        mobile: {
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
            },
            position: {
              _id: false,
              type: {
                x: {
                  type: Number,
                },
                y: {
                  type: Number,
                },
              },
            },
          },
        },
      },
    },
    // Style is optional. If omitted, frontend should fall back to sensible defaults.
    style: {
      _id: false,
      type: {
        desktop: {
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
              _id: false,
              type: {
                x: {
                  type: Number,
                  default: 50,
                },
                y: {
                  type: Number,
                  default: 50,
                },
              },
            },
          },
        },
        mobile: {
          _id: false,
          type: {
            textColor: {
              type: String,
            },
            overlayColor: {
              type: String,
            },
            textPosition: {
              _id: false,
              type: {
                x: {
                  type: Number,
                },
                y: {
                  type: Number,
                },
              },
            },
          },
        },
      },
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: false,
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
