/**
 * How code-driven and automatic promotions combine.
 *
 * Pure and dependency-free on purpose: the server applies this rule when it
 * resolves an order, and the cart applies the same rule to preview the total.
 * If the two ever disagreed, the customer would see one number and be charged
 * another — so the rule lives in exactly one place.
 */

import type { IAppliedPromotion } from "@/lib/types/order";

/**
 * Add the automatic promotions that are still allowed alongside the codes the
 * customer entered. `automatic` must already be ordered by descending priority.
 *
 * Codes win. A customer who typed a code chose it deliberately, and having a
 * store-wide rule silently push it aside would be impossible to explain on
 * screen — so a non-stackable code blocks every automatic promotion, and a
 * non-stackable automatic promotion is only taken when nothing else applies.
 */
export function mergeAutomaticPromotions(
  codeApplied: IAppliedPromotion[],
  automatic: IAppliedPromotion[]
): IAppliedPromotion[] {
  if (codeApplied.some((p) => !p.stackable)) return [...codeApplied];

  const merged = [...codeApplied];
  for (const promo of automatic ?? []) {
    if (promo.stackable) {
      merged.push(promo);
      continue;
    }
    // Priority-ordered, so the first non-stackable one that fits wins.
    if (merged.length === 0) {
      merged.push(promo);
      break;
    }
  }
  return merged;
}
