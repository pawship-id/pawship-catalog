import mongoose, { Schema, Document, Types } from "mongoose";
import softDelete from "mongoose-delete";

export interface ICollection extends Document {
  name: string;
  slug: string;
  displayOnHomepage: boolean;
  rules: "tag" | "category" | "custom";
  ruleIds: string[]; // Array of IDs based on rule type
  desktopImageUrl: string;
  desktopImagePublicId: string;
  mobileImageUrl?: string;
  mobileImagePublicId?: string;
  deleted?: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CollectionSchema = new Schema<ICollection>(
  {
    name: {
      type: String,
      required: [true, "Collection name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
    },
    displayOnHomepage: {
      type: Boolean,
      default: false,
    },
    rules: {
      type: String,
      enum: ["tag", "category", "custom"],
      required: [true, "Rule type is required"],
    },
    ruleIds: {
      type: [String],
      default: [],
      validate: {
        validator: function (ids: string[]) {
          return ids.length > 0;
        },
        message: "At least one item must be selected",
      },
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
  },
  {
    timestamps: true,
  }
);

// mongoose-delete plugin for soft delete
CollectionSchema.plugin(softDelete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: "all",
});

// Index for faster queries
CollectionSchema.index({ displayOnHomepage: 1 });
CollectionSchema.index({ rules: 1 });

const Collection =
  mongoose.models.Collection ||
  mongoose.model<ICollection>("Collection", CollectionSchema);

export default Collection;
