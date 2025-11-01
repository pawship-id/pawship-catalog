import mongoose, { Document, Schema } from "mongoose";
import softDelete from "mongoose-delete";

export interface ITag extends Document {
  tagName: string;
}

const TagSchema = new Schema<ITag>(
  {
    tagName: {
      type: String,
      required: [true, "Please input a tag name"],
    },
  },
  {
    timestamps: true,
  }
);

// mongoose-delete plugin for soft delete
TagSchema.plugin(softDelete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: "all",
});

const Tag = mongoose.models.Tag || mongoose.model("Tag", TagSchema);

export default Tag;
