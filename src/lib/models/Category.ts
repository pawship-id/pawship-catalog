import mongoose, { Document, Schema, Types } from "mongoose";
import softDelete from "mongoose-delete";

export interface ICategory extends Document {
  name: string;
  slug?: string;
  imageUrl?: string;
  isSubCategory: boolean;
  isDisplayed: boolean;
  parentCategoryId?: Types.ObjectId;
  imagePublicId?: string;
  deleted?: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Please input a name"],
    },
    slug: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    imagePublicId: {
      type: String,
    },
    isSubCategory: {
      type: Boolean,
      required: [true, "Please input a sub category"],
    },
    isDisplayed: {
      type: Boolean,
      required: [true, "Please input a displayed"],
    },
    parentCategoryId: {
      type: Types.ObjectId,
      ref: "Category",
    },
  },
  {
    timestamps: true,
  }
);

// mongoose-delete plugin for soft delete
CategorySchema.plugin(softDelete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: "all",
});

// middleware to encrypt passwords before they are stored
CategorySchema.pre("save", async function (next) {
  let processedName = this.name;

  // handle "/" characters by replacing with "-"
  if (processedName.includes("/")) {
    processedName = processedName.replace(/\//g, "-");
  }

  // handle spaces with split and join
  this.slug = processedName.toLowerCase().split(" ").join("-");

  next();
});

const Category =
  mongoose.models.Category || mongoose.model("Category", CategorySchema);

export default Category;
