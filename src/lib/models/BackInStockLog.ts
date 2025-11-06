import mongoose, { Schema, Document, Types } from "mongoose";

/**
 * Interface untuk BackInStockLog Document
 * Mencatat history restock produk dari bulk update
 */
export interface IBackInStockLog extends Document {
  productId: Types.ObjectId;
  variantId: Types.ObjectId;
  sku: string;
  oldStock: number;
  newStock: number;
  updatedBy: string; // email atau username admin
  updatedAt: Date;
}

/**
 * Schema untuk BackInStockLog
 * Collection ini menyimpan log setiap kali ada perubahan stock
 * dari fitur bulk update (CSV upload)
 */
const BackInStockLogSchema = new Schema<IBackInStockLog>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true, // Index untuk query performa
    },
    variantId: {
      type: Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: true,
      index: true,
    },
    sku: {
      type: String,
      required: true,
      index: true, // Index untuk search by SKU
    },
    oldStock: {
      type: Number,
      required: true,
      default: 0,
    },
    newStock: {
      type: Number,
      required: true,
      default: 0,
    },
    updatedBy: {
      type: String,
      required: true, // Email admin yang melakukan update
    },
    updatedAt: {
      type: Date,
      default: Date.now,
      index: true, // Index untuk sorting by date
    },
  },
  {
    timestamps: true, // Otomatis tambah createdAt & updatedAt
    collection: "back_in_stock_logs",
  }
);

// Compound index untuk query kombinasi (product + tanggal)
BackInStockLogSchema.index({ productId: 1, updatedAt: -1 });

// Compound index untuk query kombinasi (variant + tanggal)
BackInStockLogSchema.index({ variantId: 1, updatedAt: -1 });

/**
 * Export model
 * Gunakan singleton pattern untuk menghindari re-compile saat hot reload
 */
const BackInStockLog =
  mongoose.models.BackInStockLog ||
  mongoose.model<IBackInStockLog>("BackInStockLog", BackInStockLogSchema);

export default BackInStockLog;
