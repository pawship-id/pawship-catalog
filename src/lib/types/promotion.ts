/**
 * Promotion Engine — shared types.
 *
 * These enums are declared as `as const` tuples so the SAME source of truth
 * feeds both the Mongoose `enum: [...]` validators (in the model) and the
 * TypeScript union types used across the API, engine and UI.
 *
 * `config` on a Condition/Reward is intentionally a generic bag: the shape is
 * decided by `type` and validated by the registries in
 * `src/lib/helpers/promotion-validation.ts`. Adding a new condition/reward type
 * never requires a schema change — only a new registry entry.
 */

// ---------------------------------------------------------------------------
// Enums (single source of truth)
// ---------------------------------------------------------------------------

export const PROMOTION_TRIGGERS = ["CODE", "AUTOMATIC"] as const;
export type PromotionTrigger = (typeof PROMOTION_TRIGGERS)[number];

export const PROMOTION_STATUSES = ["ACTIVE", "INACTIVE"] as const;
export type PromotionStatus = (typeof PROMOTION_STATUSES)[number];

export const APPLIES_TO_SCOPES = [
  "ALL",
  "PRODUCTS",
  "VARIANTS",
  "CATEGORIES",
  "BRANDS", // reserved — no Brand model exists yet, not selectable in the UI
] as const;
export type AppliesToScope = (typeof APPLIES_TO_SCOPES)[number];

export const CONDITION_TYPES = [
  "MINIMUM_PURCHASE",
  "CATEGORY_SPEND",
  "BUY_PRODUCT",
  "CUSTOMER_TYPE",
  "FIRST_PURCHASE",
  "NEW_CUSTOMER",
] as const;
export type ConditionType = (typeof CONDITION_TYPES)[number];

export const REWARD_TYPES = [
  "PERCENTAGE_DISCOUNT",
  "FIXED_DISCOUNT",
  "SHIPPING_DISCOUNT",
  "FREE_SHIPPING",
  "FREE_GIFT",
] as const;
export type RewardType = (typeof REWARD_TYPES)[number];

export const FREE_GIFT_SELECTIONS = [
  "AUTO",
  "CUSTOMER_SELECT",
  "FIRST_AVAILABLE",
] as const;
export type FreeGiftSelection = (typeof FREE_GIFT_SELECTIONS)[number];

export const CUSTOMER_TYPES = ["RETAIL", "RESELLER"] as const;
export type CustomerType = (typeof CUSTOMER_TYPES)[number];

/** Per-currency amount map, e.g. `{ IDR: 300000, USD: 20 }`. */
export type MoneyMap = Record<string, number>;

// ---------------------------------------------------------------------------
// Condition / Reward / Tier config shapes (dispatched on `type`)
// ---------------------------------------------------------------------------

export interface GiftItem {
  productId: string;
  variantId: string;
  variantName?: string;
  quantity: number;
}

// Condition configs (cast the generic `config` bag to these per `type`)
export interface MinimumPurchaseConfig {
  minPurchase: MoneyMap;
}
export interface CategorySpendConfig {
  categoryId: string;
  categorySpend: MoneyMap;
}
export interface BuyProductConfig {
  productId?: string;
  variantId?: string;
  quantity: number;
}
export interface CustomerTypeConfig {
  customerType: CustomerType;
}
// FIRST_PURCHASE / NEW_CUSTOMER carry no config.

export interface Condition {
  type: ConditionType;
  config: Record<string, any>;
}

// Reward configs
export interface PercentageDiscountConfig {
  percentage: number; // 0–100
  maxDiscount?: MoneyMap;
}
export interface FixedDiscountConfig {
  amount: MoneyMap;
}
export interface ShippingDiscountConfig {
  amount: MoneyMap;
}
// FREE_SHIPPING carries no config.
export interface FreeGiftConfig {
  selection: FreeGiftSelection;
  gifts: GiftItem[];
}

export interface Reward {
  type: RewardType;
  config: Record<string, any>;
}

export interface Tier {
  threshold: MoneyMap;
  rewards: Reward[];
}

// ---------------------------------------------------------------------------
// Promotion document shapes
// ---------------------------------------------------------------------------

export interface AppliesTo {
  scope: AppliesToScope;
  ids: string[]; // product / variant / category ids depending on `scope`; empty for ALL
}

export interface CustomerRules {
  firstPurchaseOnly: boolean;
  newCustomerOnly: boolean;
  resellerOnly: boolean;
}

export interface PromotionLimits {
  maxDiscount?: MoneyMap;
  maxUsagePerCustomer?: number;
  totalQuota?: number;
}

/** Full promotion as returned by the API. */
export interface PromotionData {
  _id: string;
  name: string;
  code: string;
  description?: string;
  trigger: PromotionTrigger;
  status: PromotionStatus;
  priority: number;
  stackable: boolean;
  startAt: string | Date;
  endAt: string | Date;
  appliesTo: AppliesTo;
  conditions: Condition[];
  rewards: Reward[];
  tiers: Tier[];
  customerRules: CustomerRules;
  limits: PromotionLimits;
  usedCount: number;
  deleted?: boolean;
  deletedAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/** Payload the create/edit form submits. */
export interface PromotionForm {
  name: string;
  code: string;
  description?: string;
  trigger: PromotionTrigger;
  status: PromotionStatus;
  priority: number;
  stackable: boolean;
  startAt: string;
  endAt: string;
  appliesTo: AppliesTo;
  conditions: Condition[];
  rewards: Reward[];
  tiers: Tier[];
  customerRules: CustomerRules;
  limits: PromotionLimits;
}

// ---------------------------------------------------------------------------
// Promotion usage (audit / quota / reporting)
// ---------------------------------------------------------------------------

export interface PromotionUsageData {
  _id: string;
  promotionId: string;
  promotionCode: string;
  userId: string;
  orderId: string;
  orderInvoice?: string;
  currency: string;
  discountApplied: MoneyMap;
  rewardSnapshot?: any;
  usedAt: string | Date;
  createdAt?: string | Date;
}

// ---------------------------------------------------------------------------
// Engine evaluation contract (see src/lib/helpers/promotion-engine.ts)
// ---------------------------------------------------------------------------

export interface EvaluationCartItem {
  productId: string;
  variantId: string;
  categoryId?: string;
  quantity: number;
  unitPrice: number; // in the order currency
  subTotal: number; // unitPrice × quantity, in the order currency
}

export interface EvaluationCart {
  items: EvaluationCartItem[];
  subtotal: number; // Σ item.subTotal, in the order currency
  shippingCost: number; // in the order currency
}

export interface EvaluationCustomer {
  userId?: string;
  type: CustomerType; // RETAIL | RESELLER
  orderCount?: number; // number of prior (non-cancelled) orders — derived, not stored on User
}

export interface FreeGiftResult {
  selection: FreeGiftSelection;
  gifts: GiftItem[];
}

/** Numbers below are in the order currency. */
export interface PromotionEvaluationSuccess {
  valid: true;
  promotion: PromotionData;
  discount: number; // total product discount
  shippingDiscount: number;
  freeGift: FreeGiftResult | null;
  appliedTier: Tier | null;
  messages: string[];
}

export interface PromotionEvaluationFailure {
  valid: false;
  reason: string;
}

export type PromotionEvaluationResult =
  | PromotionEvaluationSuccess
  | PromotionEvaluationFailure;
