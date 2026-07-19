/**
 * Promotion Engine — pure evaluation, never mutates the cart.
 *
 * The engine only decides whether a promotion applies and how much it is worth.
 * It performs NO database access: the caller (an API route) loads the promotion
 * plus usage counts and passes them in. This keeps the engine trivially unit
 * testable and usable from both admin and public checkout flows.
 *
 * Condition and reward behaviour live in registries keyed by `type`, so a new
 * promotion type is added by registering one evaluator/calculator here (+ one
 * validator in promotion-validation.ts) — no engine rewrite, no hard-coding.
 */

import { currencyFormat } from "@/lib/helpers";
import type {
  ConditionType,
  EvaluationCart,
  EvaluationCartItem,
  EvaluationCustomer,
  FreeGiftResult,
  PromotionData,
  PromotionEvaluationResult,
  RewardType,
  Tier,
} from "@/lib/types/promotion";

export interface UsageStats {
  totalUsed: number; // usages across all customers
  customerUsed: number; // usages by this customer
}

export interface EvaluateArgs {
  promotion: PromotionData;
  cart: EvaluationCart;
  customer: EvaluationCustomer;
  currency: string;
  now: Date;
  usageStats: UsageStats;
}

interface EvalContext {
  cart: EvaluationCart;
  customer: EvaluationCustomer;
  currency: string;
  now: Date;
  eligibleItems: EvaluationCartItem[];
  eligibleSubtotal: number; // Σ subTotal of items matching appliesTo, order currency
}

interface RewardResult {
  discount: number;
  shippingDiscount: number;
  freeGift: FreeGiftResult | null;
}

const fail = (reason: string): PromotionEvaluationResult => ({
  valid: false,
  reason,
});

// ---------------------------------------------------------------------------
// appliesTo matching
// ---------------------------------------------------------------------------

export function matchesAppliesTo(
  item: EvaluationCartItem,
  appliesTo: PromotionData["appliesTo"]
): boolean {
  if (!appliesTo || appliesTo.scope === "ALL") return true;
  const ids = (appliesTo.ids ?? []).map(String);
  switch (appliesTo.scope) {
    case "PRODUCTS":
      return ids.includes(String(item.productId));
    case "VARIANTS":
      return ids.includes(String(item.variantId));
    case "CATEGORIES":
      return item.categoryId ? ids.includes(String(item.categoryId)) : false;
    case "BRANDS":
      return false; // reserved — no Brand model yet
    default:
      return true;
  }
}

// ---------------------------------------------------------------------------
// Condition evaluators (registry)
// ---------------------------------------------------------------------------

type ConditionResult = { pass: boolean; reason?: string };

const conditionEvaluators: Record<
  ConditionType,
  (config: any, ctx: EvalContext) => ConditionResult
> = {
  MINIMUM_PURCHASE: (config, ctx) => {
    const required = Number(config?.minPurchase?.[ctx.currency] ?? 0);
    if (ctx.cart.subtotal >= required) return { pass: true };
    return {
      pass: false,
      reason: `Minimum purchase ${currencyFormat(required, ctx.currency)}`,
    };
  },
  CATEGORY_SPEND: (config, ctx) => {
    const required = Number(config?.categorySpend?.[ctx.currency] ?? 0);
    const spent = ctx.cart.items
      .filter((i) => String(i.categoryId) === String(config?.categoryId))
      .reduce((s, i) => s + i.subTotal, 0);
    if (spent >= required) return { pass: true };
    return {
      pass: false,
      reason: `Spend ${currencyFormat(required, ctx.currency)} on the required category`,
    };
  },
  BUY_PRODUCT: (config, ctx) => {
    const required = Number(config?.quantity ?? 1);
    const qty = ctx.cart.items
      .filter(
        (i) =>
          (config?.variantId ? String(i.variantId) === String(config.variantId) : true) &&
          (config?.productId ? String(i.productId) === String(config.productId) : true)
      )
      .reduce((s, i) => s + i.quantity, 0);
    if (qty >= required) return { pass: true };
    return {
      pass: false,
      reason: `Requires at least ${required} of the qualifying product`,
    };
  },
  CUSTOMER_TYPE: (config, ctx) => {
    if (ctx.customer.type === config?.customerType) return { pass: true };
    return {
      pass: false,
      reason: `Only for ${String(config?.customerType ?? "").toLowerCase()} customers`,
    };
  },
  FIRST_PURCHASE: (_config, ctx) =>
    (ctx.customer.orderCount ?? 0) === 0
      ? { pass: true }
      : { pass: false, reason: "Valid for your first purchase only" },
  NEW_CUSTOMER: (_config, ctx) =>
    (ctx.customer.orderCount ?? 0) === 0
      ? { pass: true }
      : { pass: false, reason: "Valid for new customers only" },
};

// ---------------------------------------------------------------------------
// Reward calculators (registry) — all amounts in the order currency
// ---------------------------------------------------------------------------

const rewardCalculators: Record<
  RewardType,
  (config: any, ctx: EvalContext) => RewardResult
> = {
  PERCENTAGE_DISCOUNT: (config, ctx) => {
    const pct = Number(config?.percentage ?? 0);
    let discount = (ctx.eligibleSubtotal * pct) / 100;
    const cap = config?.maxDiscount?.[ctx.currency];
    if (typeof cap === "number" && Number.isFinite(cap)) {
      discount = Math.min(discount, cap);
    }
    return { discount, shippingDiscount: 0, freeGift: null };
  },
  FIXED_DISCOUNT: (config, ctx) => {
    const amount = Number(config?.amount?.[ctx.currency] ?? 0);
    // never discount more than the eligible items are worth
    return {
      discount: Math.min(amount, ctx.eligibleSubtotal),
      shippingDiscount: 0,
      freeGift: null,
    };
  },
  SHIPPING_DISCOUNT: (config, ctx) => {
    const amount = Number(config?.amount?.[ctx.currency] ?? 0);
    return {
      discount: 0,
      shippingDiscount: Math.min(amount, ctx.cart.shippingCost),
      freeGift: null,
    };
  },
  FREE_SHIPPING: (_config, ctx) => ({
    discount: 0,
    shippingDiscount: ctx.cart.shippingCost,
    freeGift: null,
  }),
  FREE_GIFT: (config) => ({
    discount: 0,
    shippingDiscount: 0,
    freeGift: { selection: config?.selection, gifts: config?.gifts ?? [] },
  }),
};

// ---------------------------------------------------------------------------
// Tier resolution — highest tier whose threshold ≤ cart subtotal
// ---------------------------------------------------------------------------

export function resolveTier(
  tiers: Tier[],
  currency: string,
  subtotal: number
): Tier | null {
  const qualifying = (tiers ?? [])
    .filter((t) => subtotal >= Number(t.threshold?.[currency] ?? Infinity))
    .sort(
      (a, b) =>
        Number(b.threshold?.[currency] ?? 0) - Number(a.threshold?.[currency] ?? 0)
    );
  return qualifying[0] ?? null;
}

// ---------------------------------------------------------------------------
// Customer rules
// ---------------------------------------------------------------------------

function checkCustomerRules(
  rules: PromotionData["customerRules"],
  customer: EvaluationCustomer
): ConditionResult {
  if (!rules) return { pass: true };
  if (rules.resellerOnly && customer.type !== "RESELLER") {
    return { pass: false, reason: "This promotion is for resellers only" };
  }
  if (rules.newCustomerOnly && (customer.orderCount ?? 0) > 0) {
    return { pass: false, reason: "This promotion is for new customers only" };
  }
  if (rules.firstPurchaseOnly && (customer.orderCount ?? 0) > 0) {
    return { pass: false, reason: "This promotion is for first purchase only" };
  }
  return { pass: true };
}

// ---------------------------------------------------------------------------
// Orchestrator — the brief's evaluation flow
// ---------------------------------------------------------------------------

export function evaluatePromotion({
  promotion,
  cart,
  customer,
  currency,
  now,
  usageStats,
}: EvaluateArgs): PromotionEvaluationResult {
  // 1. Active
  if (promotion.status !== "ACTIVE") return fail("Promotion is not active");

  // 2. Within date range
  const start = new Date(promotion.startAt);
  const end = new Date(promotion.endAt);
  if (now < start) return fail("Promotion has not started yet");
  if (now > end) return fail("Promotion expired");

  // 3. Quota
  const totalQuota = promotion.limits?.totalQuota;
  if (typeof totalQuota === "number" && (usageStats?.totalUsed ?? 0) >= totalQuota) {
    return fail("Quota exhausted");
  }
  const perCustomer = promotion.limits?.maxUsagePerCustomer;
  if (
    typeof perCustomer === "number" &&
    (usageStats?.customerUsed ?? 0) >= perCustomer
  ) {
    return fail("You have reached the usage limit for this promotion");
  }

  // 4. Customer rules
  const rulesCheck = checkCustomerRules(promotion.customerRules, customer);
  if (!rulesCheck.pass) return fail(rulesCheck.reason!);

  // Build the eligible-item context from appliesTo
  const eligibleItems = cart.items.filter((i) =>
    matchesAppliesTo(i, promotion.appliesTo)
  );
  if (promotion.appliesTo?.scope !== "ALL" && eligibleItems.length === 0) {
    return fail("No items in the cart qualify for this promotion");
  }
  const eligibleSubtotal = eligibleItems.reduce((s, i) => s + i.subTotal, 0);
  const ctx: EvalContext = {
    cart,
    customer,
    currency,
    now,
    eligibleItems,
    eligibleSubtotal,
  };

  // 5. Conditions (all must pass)
  for (const condition of promotion.conditions ?? []) {
    const evaluator = conditionEvaluators[condition.type];
    if (!evaluator) continue;
    const res = evaluator(condition.config ?? {}, ctx);
    if (!res.pass) return fail(res.reason ?? "Conditions not met");
  }

  // 6. Rewards — a non-empty `tiers` supersedes top-level `rewards`
  let activeRewards = promotion.rewards ?? [];
  let appliedTier: Tier | null = null;
  if ((promotion.tiers ?? []).length > 0) {
    appliedTier = resolveTier(promotion.tiers, currency, cart.subtotal);
    if (!appliedTier) {
      const lowest = Math.min(
        ...promotion.tiers.map((t) => Number(t.threshold?.[currency] ?? Infinity))
      );
      return fail(`Minimum purchase ${currencyFormat(lowest, currency)}`);
    }
    activeRewards = appliedTier.rewards ?? [];
  }

  let discount = 0;
  let shippingDiscount = 0;
  let freeGift: FreeGiftResult | null = null;
  const messages: string[] = [];

  for (const reward of activeRewards) {
    const calc = rewardCalculators[reward.type];
    if (!calc) continue;
    const r = calc(reward.config ?? {}, ctx);
    discount += r.discount;
    shippingDiscount += r.shippingDiscount;
    if (r.freeGift) freeGift = r.freeGift;
  }

  // 7. Apply the global max-discount cap and clamp shipping to the shipping cost
  const maxDiscount = promotion.limits?.maxDiscount?.[currency];
  if (typeof maxDiscount === "number" && Number.isFinite(maxDiscount)) {
    discount = Math.min(discount, maxDiscount);
  }
  discount = Math.max(0, discount);
  shippingDiscount = Math.max(0, Math.min(shippingDiscount, cart.shippingCost));

  return {
    valid: true,
    promotion,
    discount,
    shippingDiscount,
    freeGift,
    appliedTier,
    messages,
  };
}

// ---------------------------------------------------------------------------
// Card presenters (used by the available-promotions list & order cards)
// ---------------------------------------------------------------------------

/** Short benefit summary for a promotion card, formatted in `currency`. */
export function summarizeBenefits(
  promotion: PromotionData,
  currency = "IDR"
): string {
  const parts: string[] = [];
  const describeReward = (type: RewardType, config: any) => {
    switch (type) {
      case "PERCENTAGE_DISCOUNT":
        return `${config?.percentage ?? 0}% off`;
      case "FIXED_DISCOUNT":
        return `${currencyFormat(Number(config?.amount?.[currency] ?? 0), currency)} off`;
      case "SHIPPING_DISCOUNT":
        return "Shipping discount";
      case "FREE_SHIPPING":
        return "Free shipping";
      case "FREE_GIFT":
        return "Free gift";
      default:
        return "";
    }
  };

  if ((promotion.tiers ?? []).length > 0) {
    parts.push(`Up to ${promotion.tiers.length} spend tiers`);
  }
  for (const reward of promotion.rewards ?? []) {
    const text = describeReward(reward.type, reward.config);
    if (text) parts.push(text);
  }
  return parts.length ? parts.join(" · ") : "Special promotion";
}

/** Short condition/eligibility summary for a promotion card. */
export function summarizeConditions(
  promotion: PromotionData,
  currency = "IDR"
): string {
  const parts: string[] = [];
  for (const condition of promotion.conditions ?? []) {
    switch (condition.type) {
      case "MINIMUM_PURCHASE":
        parts.push(
          `Min. ${currencyFormat(Number(condition.config?.minPurchase?.[currency] ?? 0), currency)}`
        );
        break;
      case "CATEGORY_SPEND":
        parts.push("Category spend");
        break;
      case "BUY_PRODUCT":
        parts.push(`Buy ${condition.config?.quantity ?? 1}`);
        break;
      case "CUSTOMER_TYPE":
        parts.push(`${condition.config?.customerType ?? ""} only`);
        break;
      case "FIRST_PURCHASE":
        parts.push("First purchase");
        break;
      case "NEW_CUSTOMER":
        parts.push("New customers");
        break;
    }
  }
  if (promotion.customerRules?.resellerOnly) parts.push("Resellers only");
  if (promotion.customerRules?.firstPurchaseOnly) parts.push("First purchase");
  if (promotion.customerRules?.newCustomerOnly) parts.push("New customers");
  return parts.length ? parts.join(" · ") : "No conditions";
}
