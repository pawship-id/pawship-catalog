import mongoose, { Document, Schema, Types } from "mongoose";
import softDelete from "mongoose-delete";

export interface ICurrency extends Document {
  name: string;
  baseRupiah: number;
  deleted?: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const CurrencySchema = new Schema<ICurrency>(
  {
    name: {
      type: String,
      required: [true, "Please input a currency name"],
      uppercase: true,
      trim: true,
    },
    baseRupiah: {
      type: Number,
      required: [true, "Please input a base rupiah"],
      min: [0, "Base rupiah cannot be negative"],
    },
  },
  { timestamps: true, collection: "currencies" }
);

// mongoose-delete plugin for soft delete
CurrencySchema.plugin(softDelete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: "all",
});

const Currency =
  mongoose.models.Currency || mongoose.model("Currency", CurrencySchema);

export default Currency;
