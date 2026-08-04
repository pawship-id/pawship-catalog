/**
 * Client-side re-evaluation of already-applied promotion codes.
 *
 * An applied promotion stores the discount it was worth AT THE MOMENT it was
 * applied. Change the cart afterwards — add an item, bump a quantity — and that
 * number goes stale: a tiered promo that granted 10% at 10 pcs still shows 10%
 * at 20 pcs. This re-runs the engine (through the evaluate endpoint) for every
 * applied code and returns a refreshed list.
 *
 * This is a display concern only. The order-submit routes re-resolve the codes
 * server-side via `resolveAppliedPromotions` and ignore whatever numbers the
 * client sends, so a stale value can never be persisted — it can only mislead
 * the admin filling in the form.
 */

import { describeTierThreshold, summarizeBenefits } from "@/lib/helpers/promotion-engine";
import { getTiersBasis } from "@/lib/helpers/promotion-validation";
import { mergeAutomaticPromotions } from "@/lib/helpers/promotion-stacking";
import type { IAppliedPromotion } from "@/lib/types/order";
import type {
  EvaluationCart,
  EvaluationCustomer,
  PromotionChannel,
  PromotionEvaluationResult,
} from "@/lib/types/promotion";

export interface RevalidateArgs {
  applied: IAppliedPromotion[];
  cart: EvaluationCart;
  customer: EvaluationCustomer;
  currency: string;
  channel?: PromotionChannel;
  /** Defaults to the admin endpoint; the public cart passes its own. */
  endpoint?: string;
  /**
   * Endpoint that resolves AUTOMATIC promotions for this cart. Defaults to the
   * admin one. Pass `null` to skip the automatic pass entirely.
   */
  automaticEndpoint?: string | null;
}

export interface RevalidateResult {
  applied: IAppliedPromotion[];
  /** Codes that no longer qualify, with the engine's reason. */
  dropped: { code: string; reason: string }[];
  /** False when every promotion survived with identical numbers. */
  changed: boolean;
}

function toEntry(
  previous: IAppliedPromotion,
  result: Extract<PromotionEvaluationResult, { valid: true }>,
  currency: string,
  channel?: PromotionChannel
): IAppliedPromotion {
  const promo = result.promotion;
  const gift = result.freeGift?.gifts?.[0];
  const basis = getTiersBasis(promo.tiers);
  return {
    ...previous,
    promotionId: String((promo as any)._id ?? previous.promotionId),
    name: promo.name,
    trigger: promo.trigger,
    stackable: !!promo.stackable,
    rewardsSummary: summarizeBenefits(promo, currency, channel),
    appliedTierLabel:
      result.appliedTier && basis
        ? describeTierThreshold(result.appliedTier, basis, currency)
        : undefined,
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
  };
}

export async function revalidateAppliedPromotions({
  applied,
  cart,
  customer,
  currency,
  channel,
  endpoint = "/api/admin/promotions/evaluate",
  automaticEndpoint = "/api/admin/promotions/automatic",
}: RevalidateArgs): Promise<RevalidateResult> {
  // Automatic promotions are re-resolved from scratch every time, so an empty
  // list is NOT an early exit: a cart that just crossed a threshold gains one
  // without the customer touching anything.
  const codeApplied = applied.filter((p) => p.trigger !== "AUTOMATIC");

  const evaluated = await Promise.all(
    codeApplied.map(async (entry) => {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: entry.code,
          cart,
          customer,
          currency,
          channel,
        }),
      });
      const json = await res.json();
      return { entry, result: json?.data as PromotionEvaluationResult | undefined };
    })
  );

  const refreshedCodes: IAppliedPromotion[] = [];
  const dropped: { code: string; reason: string }[] = [];

  for (const { entry, result } of evaluated) {
    // A failed request (network, 500) is not evidence the promotion became
    // invalid — keep what we had rather than silently dropping a valid promo.
    if (!result) {
      refreshedCodes.push(entry);
      continue;
    }
    if (!result.valid) {
      dropped.push({ code: entry.code, reason: result.reason });
      continue;
    }
    refreshedCodes.push(toEntry(entry, result, currency, channel));
  }

  // Automatic promotions are REPLACED, never merged with the previous set, so
  // one that stopped qualifying actually disappears from the screen.
  let automatic: IAppliedPromotion[] = [];
  if (automaticEndpoint) {
    try {
      const res = await fetch(automaticEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, customer, currency, channel }),
      });
      const json = await res.json();
      if (Array.isArray(json?.data)) automatic = json.data;
    } catch {
      // Same reasoning as above: a failed request is not a verdict. Keep the
      // automatic promotions already on screen rather than flickering them off.
      automatic = applied.filter((p) => p.trigger === "AUTOMATIC");
    }
  }

  const next = mergeAutomaticPromotions(refreshedCodes, automatic);

  const changed =
    dropped.length > 0 ||
    next.length !== applied.length ||
    next.some((p, i) => {
      const before = applied[i];
      return (
        before?.code !== p.code ||
        before?.productDiscount !== p.productDiscount ||
        before?.shippingDiscount !== p.shippingDiscount ||
        before?.appliedTierLabel !== p.appliedTierLabel
      );
    });

  return { applied: next, dropped, changed };
}
