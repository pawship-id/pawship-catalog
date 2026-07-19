/**
 * Reusable promotion validation.
 *
 * Single source of truth for the shape of each Condition/Reward `config`,
 * dispatched on `type`. Used by BOTH:
 *   - the Mongoose custom validators on the Promotion sub-schemas, and
 *   - the API route handlers (which return the collected messages as a 400).
 *
 * Adding a new condition/reward type = add one entry here (+ one evaluator in
 * promotion-engine.ts). No schema change required.
 */

import {
  APPLIES_TO_SCOPES,
  CONDITION_TYPES,
  CUSTOMER_TYPES,
  FREE_GIFT_SELECTIONS,
  PROMOTION_STATUSES,
  PROMOTION_TRIGGERS,
  REWARD_TYPES,
  type Condition,
  type ConditionType,
  type MoneyMap,
  type Reward,
  type RewardType,
  type Tier,
} from "@/lib/types/promotion";

// ---------------------------------------------------------------------------
// Small shared checks
// ---------------------------------------------------------------------------

function isPlainObject(v: any): v is Record<string, any> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

/** A MoneyMap must be a non-empty object of finite, non-negative numbers. */
export function validateMoneyMap(map: any, label: string): string[] {
  if (!isPlainObject(map) || Object.keys(map).length === 0) {
    return [`${label} must have at least one currency value`];
  }
  const errors: string[] = [];
  for (const [code, value] of Object.entries(map)) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      errors.push(`${label} for ${code} must be a number`);
    } else if (value < 0) {
      errors.push(`${label} for ${code} cannot be negative`);
    }
  }
  return errors;
}

// ---------------------------------------------------------------------------
// Condition config validators (registry)
// ---------------------------------------------------------------------------

type Validator = (config: any) => string[];

export const conditionConfigValidators: Record<ConditionType, Validator> = {
  MINIMUM_PURCHASE: (c) => validateMoneyMap(c?.minPurchase, "Minimum purchase"),
  CATEGORY_SPEND: (c) => {
    const errors: string[] = [];
    if (!c?.categoryId) errors.push("Category spend requires a categoryId");
    errors.push(...validateMoneyMap(c?.categorySpend, "Category spend"));
    return errors;
  },
  BUY_PRODUCT: (c) => {
    const errors: string[] = [];
    if (!c?.productId && !c?.variantId) {
      errors.push("Buy product requires a productId or variantId");
    }
    if (typeof c?.quantity !== "number" || c.quantity < 1) {
      errors.push("Buy product quantity must be at least 1");
    }
    return errors;
  },
  CUSTOMER_TYPE: (c) =>
    CUSTOMER_TYPES.includes(c?.customerType)
      ? []
      : [`Customer type must be one of ${CUSTOMER_TYPES.join(", ")}`],
  FIRST_PURCHASE: () => [],
  NEW_CUSTOMER: () => [],
};

// ---------------------------------------------------------------------------
// Reward config validators (registry)
// ---------------------------------------------------------------------------

export const rewardConfigValidators: Record<RewardType, Validator> = {
  PERCENTAGE_DISCOUNT: (c) => {
    const errors: string[] = [];
    if (typeof c?.percentage !== "number" || !Number.isFinite(c.percentage)) {
      errors.push("Percentage discount requires a numeric percentage");
    } else if (c.percentage < 0 || c.percentage > 100) {
      errors.push("Percentage must be between 0 and 100");
    }
    if (c?.maxDiscount != null) {
      errors.push(...validateMoneyMap(c.maxDiscount, "Max discount"));
    }
    return errors;
  },
  FIXED_DISCOUNT: (c) => validateMoneyMap(c?.amount, "Fixed discount amount"),
  SHIPPING_DISCOUNT: (c) =>
    validateMoneyMap(c?.amount, "Shipping discount amount"),
  FREE_SHIPPING: () => [],
  FREE_GIFT: (c) => {
    const errors: string[] = [];
    if (!FREE_GIFT_SELECTIONS.includes(c?.selection)) {
      errors.push(
        `Free gift selection must be one of ${FREE_GIFT_SELECTIONS.join(", ")}`
      );
    }
    if (!Array.isArray(c?.gifts) || c.gifts.length === 0) {
      errors.push("Free gift requires at least one gift product");
    } else {
      c.gifts.forEach((g: any, i: number) => {
        if (!g?.variantId && !g?.productId) {
          errors.push(`Free gift #${i + 1} requires a product or variant`);
        }
        if (typeof g?.quantity !== "number" || g.quantity < 1) {
          errors.push(`Free gift #${i + 1} quantity must be at least 1`);
        }
      });
    }
    return errors;
  },
};

// ---------------------------------------------------------------------------
// Subdocument-level validators (used by Mongoose custom `validate`)
// ---------------------------------------------------------------------------

export function validateConditionConfig(condition: Condition): string[] {
  const validator = conditionConfigValidators[condition?.type];
  if (!validator) return [`Unknown condition type: ${condition?.type}`];
  return validator(condition?.config ?? {});
}

export function validateRewardConfig(reward: Reward): string[] {
  const validator = rewardConfigValidators[reward?.type];
  if (!validator) return [`Unknown reward type: ${reward?.type}`];
  return validator(reward?.config ?? {});
}

// ---------------------------------------------------------------------------
// Whole-payload validation (used by the POST/PUT route handlers)
// ---------------------------------------------------------------------------

export interface PromotionPayloadLike {
  name?: any;
  code?: any;
  trigger?: any;
  status?: any;
  priority?: any;
  startAt?: any;
  endAt?: any;
  appliesTo?: { scope?: any; ids?: any };
  conditions?: Condition[];
  rewards?: Reward[];
  tiers?: Tier[];
  limits?: { maxDiscount?: MoneyMap; maxUsagePerCustomer?: any; totalQuota?: any };
}

/**
 * Validate a full create/update payload. Returns a flat list of human-readable
 * errors ([] means valid) so the handler can respond with 400 + the messages.
 */
export function validatePromotionPayload(body: PromotionPayloadLike): string[] {
  const errors: string[] = [];

  if (!body?.name || String(body.name).trim() === "") {
    errors.push("Promotion name is required");
  }
  if (!body?.code || String(body.code).trim() === "") {
    errors.push("Promotion code is required");
  }
  if (body?.trigger && !PROMOTION_TRIGGERS.includes(body.trigger)) {
    errors.push(`Trigger must be one of ${PROMOTION_TRIGGERS.join(", ")}`);
  }
  if (body?.status && !PROMOTION_STATUSES.includes(body.status)) {
    errors.push(`Status must be one of ${PROMOTION_STATUSES.join(", ")}`);
  }

  const start = body?.startAt ? new Date(body.startAt) : null;
  const end = body?.endAt ? new Date(body.endAt) : null;
  if (!start || Number.isNaN(start.getTime())) errors.push("Start date is required");
  if (!end || Number.isNaN(end.getTime())) errors.push("End date is required");
  if (start && end && end.getTime() <= start.getTime()) {
    errors.push("End date must be after start date");
  }

  if (body?.priority != null && (typeof body.priority !== "number" || body.priority < 0)) {
    errors.push("Priority must be 0 or greater");
  }

  const scope = body?.appliesTo?.scope;
  if (scope && !APPLIES_TO_SCOPES.includes(scope)) {
    errors.push(`Applies-to scope must be one of ${APPLIES_TO_SCOPES.join(", ")}`);
  }
  if (scope && scope !== "ALL") {
    const ids = body?.appliesTo?.ids;
    if (!Array.isArray(ids) || ids.length === 0) {
      errors.push(`Applies-to scope ${scope} requires at least one selected item`);
    }
  }

  (body?.conditions ?? []).forEach((condition, i) => {
    validateConditionConfig(condition).forEach((e) =>
      errors.push(`Condition #${i + 1}: ${e}`)
    );
  });

  (body?.rewards ?? []).forEach((reward, i) => {
    validateRewardConfig(reward).forEach((e) =>
      errors.push(`Reward #${i + 1}: ${e}`)
    );
  });

  // A promotion must grant something: at least one reward or one tier.
  if ((body?.rewards ?? []).length === 0 && (body?.tiers ?? []).length === 0) {
    errors.push("Promotion must have at least one reward or tier");
  }

  (body?.tiers ?? []).forEach((tier, i) => {
    validateMoneyMap(tier?.threshold, `Tier #${i + 1} threshold`).forEach((e) =>
      errors.push(e)
    );
    if (!Array.isArray(tier?.rewards) || tier.rewards.length === 0) {
      errors.push(`Tier #${i + 1} requires at least one reward`);
    } else {
      tier.rewards.forEach((reward, j) => {
        validateRewardConfig(reward).forEach((e) =>
          errors.push(`Tier #${i + 1} reward #${j + 1}: ${e}`)
        );
      });
    }
  });

  const limits = body?.limits;
  if (limits) {
    if (limits.maxDiscount != null) {
      errors.push(...validateMoneyMap(limits.maxDiscount, "Max discount"));
    }
    if (
      limits.maxUsagePerCustomer != null &&
      (typeof limits.maxUsagePerCustomer !== "number" || limits.maxUsagePerCustomer < 0)
    ) {
      errors.push("Max usage per customer cannot be negative");
    }
    if (
      limits.totalQuota != null &&
      (typeof limits.totalQuota !== "number" || limits.totalQuota < 0)
    ) {
      errors.push("Total quota cannot be negative");
    }
  }

  return errors;
}
