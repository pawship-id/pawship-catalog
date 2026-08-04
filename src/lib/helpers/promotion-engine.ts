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
import { getTiersBasis } from "@/lib/helpers/promotion-validation";
import { PROMOTION_CHANNELS } from "@/lib/types/promotion";
import type {
  ConditionType,
  EvaluationCart,
  EvaluationCartItem,
  EvaluationCustomer,
  FreeGiftResult,
  PromotionChannel,
  PromotionData,
  PromotionEvaluationResult,
  RewardType,
  Tier,
  TierBasis,
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
  /**
   * Sales channel the checkout is happening on. Optional on purpose: when the
   * caller omits it every channel restriction is skipped, so callers that
   * predate channels behave exactly as they did before.
   */
  channel?: PromotionChannel;
}

interface EvalContext {
  cart: EvaluationCart;
  customer: EvaluationCustomer;
  currency: string;
  now: Date;
  channel?: PromotionChannel;
  eligibleItems: EvaluationCartItem[];
  eligibleSubtotal: number; // Σ subTotal of items matching appliesTo, order currency
  eligibleQuantity: number; // Σ quantity of items matching appliesTo
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
// Channel matching
// ---------------------------------------------------------------------------

/**
 * An absent or empty channel list means "every channel", which is what makes
 * the field safe on documents saved before channels existed. A missing
 * `channel` argument means the caller does not care and every list matches.
 */
export function channelAllows(
  channels: PromotionChannel[] | undefined,
  channel?: PromotionChannel
): boolean {
  if (!channel) return true;
  if (!Array.isArray(channels) || channels.length === 0) return true;
  return channels.includes(channel);
}

// ---------------------------------------------------------------------------
// Tier resolution — highest tier the cart qualifies for, on this channel
// ---------------------------------------------------------------------------

/**
 * A tier's threshold as a comparable number. `Infinity` for a tier that carries
 * no usable threshold, so it can never win.
 */
function tierThresholdValue(
  tier: Tier,
  basis: TierBasis,
  currency: string
): number {
  const raw =
    basis === "QUANTITY"
      ? tier?.thresholdQuantity
      : tier?.threshold?.[currency];
  const value = Number(raw ?? Infinity);
  return Number.isFinite(value) ? value : Infinity;
}

export interface ResolveTierOptions {
  /** Eligible pieces in the cart — only read on the QUANTITY basis. */
  quantity?: number;
  channel?: PromotionChannel;
}

/**
 * The highest tier the cart reaches. `subtotal` is used on the SPEND basis and
 * `opts.quantity` on the QUANTITY basis. The first three parameters keep their
 * original meaning and position so existing callers are unaffected.
 */
export function resolveTier(
  tiers: Tier[],
  currency: string,
  subtotal: number,
  opts?: ResolveTierOptions
): Tier | null {
  const basis = getTiersBasis(tiers);
  if (!basis) return null;

  const measured =
    basis === "QUANTITY" ? Number(opts?.quantity ?? 0) : subtotal;

  const qualifying = (tiers ?? [])
    .filter((t) => channelAllows(t.channels, opts?.channel))
    .filter((t) => measured >= tierThresholdValue(t, basis, currency))
    .sort(
      (a, b) =>
        tierThresholdValue(b, basis, currency) -
        tierThresholdValue(a, basis, currency)
    );
  return qualifying[0] ?? null;
}

/**
 * Why no tier applied. The shortfall is measured against the tiers available on
 * THIS channel, so a WhatsApp customer holding 5 pieces is told the real bar
 * ("Minimum 10 pcs") rather than the web-only 1-piece tier they cannot use.
 */
function describeTierShortfall(
  tiers: Tier[],
  currency: string,
  channel?: PromotionChannel
): string {
  const available = (tiers ?? []).filter((t) =>
    channelAllows(t.channels, channel)
  );
  if (available.length === 0) {
    return "This promotion is not available on this channel";
  }
  const basis = getTiersBasis(tiers) ?? "SPEND";
  const lowest = Math.min(
    ...available.map((t) => tierThresholdValue(t, basis, currency))
  );
  return basis === "QUANTITY"
    ? `Minimum ${lowest} pcs`
    : `Minimum purchase ${currencyFormat(lowest, currency)}`;
}

/** Human-readable threshold for one tier, e.g. "10 pcs" or "Rp300.000". */
export function describeTierThreshold(
  tier: Tier,
  basis: TierBasis,
  currency: string
): string {
  return basis === "QUANTITY"
    ? `${Number(tier?.thresholdQuantity ?? 0)} pcs`
    : currencyFormat(Number(tier?.threshold?.[currency] ?? 0), currency);
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
  channel,
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

  // 4b. Channel — checked before appliesTo so an off-channel promotion says so
  // plainly instead of being masked by "no items qualify".
  if (!channelAllows(promotion.channels, channel)) {
    return fail("This promotion is not available on this channel");
  }

  // Build the eligible-item context from appliesTo
  const eligibleItems = cart.items.filter((i) =>
    matchesAppliesTo(i, promotion.appliesTo)
  );
  if (promotion.appliesTo?.scope !== "ALL" && eligibleItems.length === 0) {
    return fail("No items in the cart qualify for this promotion");
  }
  const eligibleSubtotal = eligibleItems.reduce((s, i) => s + i.subTotal, 0);
  const eligibleQuantity = eligibleItems.reduce((s, i) => s + i.quantity, 0);
  const ctx: EvalContext = {
    cart,
    customer,
    currency,
    now,
    channel,
    eligibleItems,
    eligibleSubtotal,
    eligibleQuantity,
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
    // SPEND tiers keep comparing against the whole-cart subtotal (unchanged
    // behaviour); QUANTITY tiers count the pieces that match `appliesTo`.
    appliedTier = resolveTier(promotion.tiers, currency, cart.subtotal, {
      quantity: eligibleQuantity,
      channel,
    });
    if (!appliedTier) {
      return fail(describeTierShortfall(promotion.tiers, currency, channel));
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

function describeReward(
  type: RewardType,
  config: any,
  currency: string
): string {
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
}

/** One tier, broken into parts so a card can lay it out however it likes. */
export interface TierSummary {
  /** e.g. "10 pcs" or "Rp 300.000" */
  threshold: string;
  /** e.g. "10% off" or "20% off + Free shipping" */
  rewards: string;
  /**
   * Set only when this tier runs on FEWER channels than the promotion — e.g.
   * "WEB only". A tier that matches the promotion's own channels needs no note,
   * otherwise every line of a two-channel promo would carry the same noise.
   */
  channelNote?: string;
}

/**
 * Tier breakdown, lowest threshold first. Pass `channel` to drop the tiers a
 * customer cannot reach on that channel.
 */
export function describeTiers(
  promotion: PromotionData,
  currency = "IDR",
  channel?: PromotionChannel
): TierSummary[] {
  const tiers = promotion.tiers ?? [];
  if (tiers.length === 0) return [];
  const basis = getTiersBasis(tiers) ?? "SPEND";
  const promoChannels = promotion.channels?.length
    ? promotion.channels
    : [...PROMOTION_CHANNELS];

  return tiers
    .filter((t) => channelAllows(t.channels, channel))
    .slice()
    .sort(
      (a, b) =>
        tierThresholdValue(a, basis, currency) -
        tierThresholdValue(b, basis, currency)
    )
    .map((tier) => {
      const tierChannels = tier.channels?.length ? tier.channels : promoChannels;
      const narrowed = tierChannels.length < promoChannels.length;
      return {
        threshold: describeTierThreshold(tier, basis, currency),
        rewards:
          (tier.rewards ?? [])
            .map((r) => describeReward(r.type, r.config, currency))
            .filter(Boolean)
            .join(" + ") || "Special promotion",
        channelNote: narrowed ? `${tierChannels.join(", ")} only` : undefined,
      };
    });
}

/**
 * One line per tier — e.g. ["1 pcs → 5% off", "10 pcs → 10% off"]. Channel
 * notes are left out; use `describeTiers` where they matter.
 */
export function summarizeTiers(
  promotion: PromotionData,
  currency = "IDR",
  channel?: PromotionChannel
): string[] {
  return describeTiers(promotion, currency, channel).map(
    (t) => `${t.threshold} → ${t.rewards}`
  );
}

/** Short benefit summary for a promotion card, formatted in `currency`. */
export function summarizeBenefits(
  promotion: PromotionData,
  currency = "IDR",
  channel?: PromotionChannel
): string {
  // Tiers supersede the top-level rewards in the engine, so listing both would
  // advertise a benefit that can never apply.
  const tierLines = summarizeTiers(promotion, currency, channel);
  if (tierLines.length > 0) return tierLines.join(" · ");

  const parts = (promotion.rewards ?? [])
    .map((reward) => describeReward(reward.type, reward.config, currency))
    .filter(Boolean);
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
