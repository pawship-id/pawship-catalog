import mongoose, { Document, Schema, Types } from "mongoose";
import softDelete from "mongoose-delete";

/**
 * One document per (promotion applied to an order). Backs quota enforcement,
 * per-customer usage limits, audit and reporting.
 *
 * Customers are intentionally NOT stored on the Promotion document — usage is
 * tracked here instead.
 */
export interface IPromotionUsage extends Document {
  promotionId: Types.ObjectId;
  promotionCode: string;
  userId: string;
  orderId?: Types.ObjectId;
  orderInvoice?: string;
  currency: string;
  discountApplied: Record<string, number>; // MoneyMap snapshot, e.g. { IDR: 30000 }
  rewardSnapshot?: any;
  usedAt: Date;
  deleted?: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PromotionUsageSchema = new Schema<IPromotionUsage>(
  {
    promotionId: {
      type: Schema.Types.ObjectId,
      ref: "Promotion",
      required: true,
      index: true,
    },
    promotionCode: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", index: true },
    orderInvoice: { type: String },
    currency: { type: String, required: true },
    discountApplied: { type: Schema.Types.Mixed, default: {} },
    rewardSnapshot: { type: Schema.Types.Mixed },
    usedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: "promotion_usages" }
);

// Fast per-customer usage counting.
PromotionUsageSchema.index({ promotionId: 1, userId: 1 });

PromotionUsageSchema.plugin(softDelete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: "all",
});

const PromotionUsage =
  mongoose.models.PromotionUsage ||
  mongoose.model<IPromotionUsage>("PromotionUsage", PromotionUsageSchema);

export default PromotionUsage;
