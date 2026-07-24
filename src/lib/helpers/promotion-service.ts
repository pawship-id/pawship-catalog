/**
 * Server-side promotion service — the thin DB layer around the pure engine.
 *
 * The engine (promotion-engine.ts) is intentionally DB-free. This module loads
 * the usage counts and customer order history the engine needs, then delegates
 * the actual decision to it. Shared by the evaluate/available routes AND the
 * order create/edit handlers that persist usage.
 */

import Order from "@/lib/models/Order";
import Promotion from "@/lib/models/Promotion";
import PromotionUsage from "@/lib/models/PromotionUsage";
import dbConnect from "@/lib/mongodb";
import {
  evaluatePromotion,
  summarizeBenefits,
  type UsageStats,
} from "@/lib/helpers/promotion-engine";
import { roundMoney } from "@/lib/helpers/currency-helper";
import type { IAppliedPromotion } from "@/lib/types/order";
import type {
  EvaluationCart,
  EvaluationCustomer,
  PromotionData,
  PromotionEvaluationResult,
} from "@/lib/types/promotion";

/**
 * Number of prior orders for a customer. "first purchase" / "new customer"
 * rules derive from this — there is no such flag on the User document.
 */
export async function getCustomerOrderCount(userId?: string): Promise<number> {
  if (!userId) return 0;
  await dbConnect();
  return Order.countDocuments({ userId });
}

export async function getUsageStats(
  promotionId: string,
  userId?: string
): Promise<UsageStats> {
  await dbConnect();
  const [totalUsed, customerUsed] = await Promise.all([
    PromotionUsage.countDocuments({ promotionId }),
    userId
      ? PromotionUsage.countDocuments({ promotionId, userId })
      : Promise.resolve(0),
  ]);
  return { totalUsed, customerUsed };
}

export interface EvaluateInput {
  cart: EvaluationCart;
  customer: EvaluationCustomer;
  currency: string;
  now?: Date;
}

/** Evaluate a single already-loaded promotion against a cart. */
export async function evaluatePromotionDoc(
  promotion: PromotionData,
  { cart, customer, currency, now }: EvaluateInput
): Promise<PromotionEvaluationResult> {
  const orderCount =
    customer.orderCount != null
      ? customer.orderCount
      : await getCustomerOrderCount(customer.userId);

  const usageStats = await getUsageStats(
    String((promotion as any)._id),
    customer.userId
  );

  return evaluatePromotion({
    promotion,
    cart,
    customer: { ...customer, orderCount },
    currency,
    now: now ?? new Date(),
    usageStats,
  });
}

/** Look up a promotion by code and evaluate it (manual-code entry path). */
export async function evaluateByCode(
  code: string,
  input: EvaluateInput
): Promise<{ promotion?: PromotionData; result: PromotionEvaluationResult }> {
  await dbConnect();
  const normalized = String(code || "").trim().toUpperCase();
  if (!normalized) {
    return { result: { valid: false, reason: "Promotion code is required" } };
  }

  const promotion = await Promotion.findOne({ code: normalized }).lean();
  if (!promotion) {
    return { result: { valid: false, reason: "Promotion code not found" } };
  }

  const result = await evaluatePromotionDoc(promotion as any, input);
  return { promotion: promotion as any, result };
}

/**
 * Promotions eligible to appear in the Admin Order selector: ACTIVE, CODE
 * trigger, and the checkout date within the promo window. Each is optionally
 * annotated with an evaluation result (disabled reason) when a cart is given.
 */
export async function listAvailablePromotions(
  input?: Partial<EvaluateInput>
): Promise<Array<PromotionData & { evaluation?: PromotionEvaluationResult }>> {
  await dbConnect();
  const now = input?.now ?? new Date();

  const promotions = (await Promotion.find({
    status: "ACTIVE",
    trigger: "CODE",
    startAt: { $lte: now },
    endAt: { $gte: now },
  })
    .sort({ priority: -1, createdAt: -1 })
    .lean()) as unknown as PromotionData[];

  if (!input?.cart || !input?.currency) {
    return promotions;
  }

  const customer: EvaluationCustomer = input.customer ?? { type: "RETAIL" };
  return Promise.all(
    promotions.map(async (promotion) => ({
      ...promotion,
      evaluation: await evaluatePromotionDoc(promotion, {
        cart: input.cart!,
        customer,
        currency: input.currency!,
        now,
      }),
    }))
  );
}

// ---------------------------------------------------------------------------
// Authoritative re-evaluation at order submit
// ---------------------------------------------------------------------------

export interface ResolveAppliedInput {
  codes: string[];
  cart: EvaluationCart;
  customer: EvaluationCustomer;
  currency: string;
  now?: Date;
}

export interface ResolveAppliedResult {
  appliedPromotions: IAppliedPromotion[];
  promotionDiscount: number; // rounded to the currency, total product + shipping benefit
  invalid: { code: string; reason: string }[];
}

/**
 * Re-evaluate a set of promo CODES against a cart, server-side, and return the
 * authoritative applied promotions + total discount. The order-submit routes
 * call this so client-supplied discount numbers are never trusted: only the
 * codes are read, and every discount / quota / eligibility check is recomputed
 * here by the engine. Callers should reject the request when `invalid` is
 * non-empty.
 */
export async function resolveAppliedPromotions({
  codes,
  cart,
  customer,
  currency,
  now,
}: ResolveAppliedInput): Promise<ResolveAppliedResult> {
  const uniqueCodes = Array.from(
    new Set(
      (codes ?? [])
        .map((c) => String(c || "").trim().toUpperCase())
        .filter(Boolean)
    )
  );

  const invalid: { code: string; reason: string }[] = [];
  const applied: IAppliedPromotion[] = [];

  for (const code of uniqueCodes) {
    const { result } = await evaluateByCode(code, {
      cart,
      customer,
      currency,
      now,
    });
    if (!result.valid) {
      invalid.push({ code, reason: result.reason });
      continue;
    }
    const promo = result.promotion;
    const gift = result.freeGift?.gifts?.[0];
    applied.push({
      promotionId: String((promo as any)._id),
      code: promo.code,
      name: promo.name,
      trigger: promo.trigger,
      stackable: !!promo.stackable,
      rewardsSummary: summarizeBenefits(promo, currency),
      productDiscount: result.discount,
      shippingDiscount: result.shippingDiscount,
      freeGift: gift
        ? {
            productId: gift.productId,
            variantId: gift.variantId,
            variantName: gift.variantName,
            quantity: gift.quantity,
          }
        : null,
      discountCurrency: currency,
    });
  }

  // Validate the stacking combination (mirror the client rule): the only legal
  // final sets are exactly one non-stackable promo, OR any number of stackable
  // promos. A crafted request that stacks a non-stackable with anything else is
  // flagged so the caller rejects it.
  const nonStackable = applied.filter((p) => !p.stackable);
  if (nonStackable.length > 0 && applied.length > 1) {
    const keep = nonStackable[0].code;
    for (const p of applied) {
      if (p.code !== keep) {
        invalid.push({
          code: p.code,
          reason: "Cannot be combined with other promotions",
        });
      }
    }
  }

  const promotionDiscount = roundMoney(
    applied.reduce(
      (s, p) => s + (p.productDiscount || 0) + (p.shippingDiscount || 0),
      0
    ),
    currency
  );

  return { appliedPromotions: applied, promotionDiscount, invalid };
}

// ---------------------------------------------------------------------------
// Usage persistence (audit + quota) — called from the order create/edit routes
// ---------------------------------------------------------------------------

interface OrderLike {
  _id: any;
  userId: string;
  invoiceNumber?: string;
  currency: string;
  appliedPromotions?: IAppliedPromotion[];
}

/** Create a promotion_usages record per applied promotion and bump usedCount. */
export async function recordOrderPromotionUsages(order: OrderLike): Promise<void> {
  const applied = order.appliedPromotions ?? [];
  if (applied.length === 0) return;
  await dbConnect();

  // Idempotency guard: skip any promotion already recorded for this order, so a
  // create-path retry (or double-submit) can't double-record usage or usedCount.
  // The edit path reconciles separately via clearOrderPromotionUsages first.
  const existing = await PromotionUsage.find({ orderId: order._id })
    .select("promotionCode")
    .lean();
  const alreadyRecorded = new Set(existing.map((u: any) => u.promotionCode));

  await Promise.all(
    applied
      .filter((ap) => !alreadyRecorded.has(ap.code))
      .map(async (ap) => {
      const discount = (ap.productDiscount || 0) + (ap.shippingDiscount || 0);
      await PromotionUsage.create({
        promotionId: ap.promotionId,
        promotionCode: ap.code,
        userId: order.userId,
        orderId: order._id,
        orderInvoice: order.invoiceNumber,
        currency: order.currency,
        discountApplied: { [order.currency]: discount },
        rewardSnapshot: { freeGift: ap.freeGift ?? null },
      });
      await Promotion.updateOne(
        { _id: ap.promotionId },
        { $inc: { usedCount: 1 } }
      );
    })
  );
}

/** Remove usages for an order and decrement usedCount (never below 0). */
export async function clearOrderPromotionUsages(orderId: any): Promise<void> {
  await dbConnect();
  const existing = await PromotionUsage.find({ orderId }).lean();
  await Promise.all(
    existing.map((u: any) =>
      Promotion.updateOne(
        { _id: u.promotionId, usedCount: { $gt: 0 } },
        { $inc: { usedCount: -1 } }
      )
    )
  );
  await PromotionUsage.deleteMany({ orderId });
}

/** Reconcile usages to the order's current appliedPromotions (edit path). */
export async function syncOrderPromotionUsages(order: OrderLike): Promise<void> {
  await clearOrderPromotionUsages(order._id);
  await recordOrderPromotionUsages(order);
}
