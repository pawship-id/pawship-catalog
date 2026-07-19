import mongoose, { Document, Schema, Types } from "mongoose";
import softDelete from "mongoose-delete";
import {
  APPLIES_TO_SCOPES,
  CONDITION_TYPES,
  PROMOTION_STATUSES,
  PROMOTION_TRIGGERS,
  REWARD_TYPES,
  type AppliesTo,
  type Condition,
  type CustomerRules,
  type PromotionLimits,
  type PromotionStatus,
  type PromotionTrigger,
  type Reward,
  type Tier,
} from "@/lib/types/promotion";
import {
  validateConditionConfig,
  validateRewardConfig,
} from "@/lib/helpers/promotion-validation";

export interface IPromotion extends Document {
  name: string;
  code: string;
  description?: string;
  trigger: PromotionTrigger;
  status: PromotionStatus;
  priority: number;
  stackable: boolean;
  startAt: Date;
  endAt: Date;
  appliesTo: AppliesTo;
  conditions: Condition[];
  rewards: Reward[];
  tiers: Tier[];
  customerRules: CustomerRules;
  limits: PromotionLimits;
  usedCount: number;
  deleted?: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Every per-currency amount (MoneyMap) is stored as a plain object, matching
// the Order model's `originalPrice` convention — not a Mongoose Map — so the
// engine can read `map[currency]` directly.

const ConditionSchema = new Schema<Condition>(
  {
    type: { type: String, enum: [...CONDITION_TYPES], required: true },
    config: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);
ConditionSchema.path("config").validate(function (this: any) {
  return validateConditionConfig({ type: this.type, config: this.config }).length === 0;
}, "Invalid condition configuration");

const RewardSchema = new Schema<Reward>(
  {
    type: { type: String, enum: [...REWARD_TYPES], required: true },
    config: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);
RewardSchema.path("config").validate(function (this: any) {
  return validateRewardConfig({ type: this.type, config: this.config }).length === 0;
}, "Invalid reward configuration");

const TierSchema = new Schema<Tier>(
  {
    threshold: { type: Schema.Types.Mixed, required: true }, // MoneyMap
    rewards: { type: [RewardSchema], default: [] },
  },
  { _id: false }
);

const AppliesToSchema = new Schema<AppliesTo>(
  {
    scope: {
      type: String,
      enum: [...APPLIES_TO_SCOPES],
      default: "ALL",
      required: true,
    },
    // Stored as strings (product / variant / category ids). These are never
    // populated — the engine compares them as strings — matching the Order
    // model's String productId/variantId convention.
    ids: { type: [String], default: [] },
  },
  { _id: false }
);

const CustomerRulesSchema = new Schema<CustomerRules>(
  {
    firstPurchaseOnly: { type: Boolean, default: false },
    newCustomerOnly: { type: Boolean, default: false },
    resellerOnly: { type: Boolean, default: false },
  },
  { _id: false }
);

const LimitsSchema = new Schema<PromotionLimits>(
  {
    maxDiscount: { type: Schema.Types.Mixed }, // MoneyMap (optional)
    maxUsagePerCustomer: { type: Number, min: 0 },
    totalQuota: { type: Number, min: 0 },
  },
  { _id: false }
);

const PromotionSchema = new Schema<IPromotion>(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      unique: true,
    },
    description: { type: String, trim: true },
    trigger: {
      type: String,
      enum: [...PROMOTION_TRIGGERS],
      default: "CODE",
    },
    status: {
      type: String,
      enum: [...PROMOTION_STATUSES],
      default: "ACTIVE",
    },
    priority: { type: Number, default: 0, min: 0 },
    stackable: { type: Boolean, default: false },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    appliesTo: {
      type: AppliesToSchema,
      default: () => ({ scope: "ALL", ids: [] }),
    },
    conditions: { type: [ConditionSchema], default: [] },
    rewards: { type: [RewardSchema], default: [] },
    tiers: { type: [TierSchema], default: [] },
    customerRules: {
      type: CustomerRulesSchema,
      default: () => ({}),
    },
    limits: { type: LimitsSchema, default: () => ({}) },
    usedCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, collection: "promotions" }
);

// Supports the "available promotions" query (status + trigger + date range).
PromotionSchema.index({ status: 1, trigger: 1, startAt: 1, endAt: 1 });

// Backstop for the create path (findByIdAndUpdate does NOT run this hook — the
// PUT handler re-checks dates manually).
PromotionSchema.pre("save", function (next) {
  if (this.endAt <= this.startAt) {
    return next(new Error("End date must be after start date"));
  }
  next();
});

PromotionSchema.plugin(softDelete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: "all",
});

const Promotion =
  mongoose.models.Promotion ||
  mongoose.model<IPromotion>("Promotion", PromotionSchema);

export default Promotion;
