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
import { evaluatePromotion, type UsageStats } from "@/lib/helpers/promotion-engine";
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

  await Promise.all(
    applied.map(async (ap) => {
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
