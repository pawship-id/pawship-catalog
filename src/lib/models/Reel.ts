import mongoose, { Document, Schema } from "mongoose";
import softDelete from "mongoose-delete";

export interface IReel extends Document {
  thumbnailUrl: string;
  thumbnailPublicId: string;
  link: string;
  show: boolean;
  order: number;
  likes: number;
  views: number;
  deleted?: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReelSchema = new Schema<IReel>(
  {
    thumbnailUrl: {
      type: String,
      required: [true, "Thumbnail URL is required"],
      trim: true,
    },
    thumbnailPublicId: {
      type: String,
      required: [true, "Thumbnail public ID is required"],
      trim: true,
    },
    link: {
      type: String,
      required: [true, "Link is required"],
      trim: true,
    },
    show: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Add soft delete plugin
ReelSchema.plugin(softDelete, {
  deletedAt: true,
  overrideMethods: "all",
});

const Reel = mongoose.models.Reel || mongoose.model<IReel>("Reel", ReelSchema);

export default Reel;
