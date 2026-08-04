import { listAvailablePromotions } from "@/lib/helpers/promotion-service";
import { PROMOTION_CHANNELS, type PromotionChannel } from "@/lib/types/promotion";
import { NextRequest, NextResponse } from "next/server";

/**
 * Admin surfaces default to the WhatsApp channel (an admin keying in an order
 * on a customer's behalf), but the edit screen passes the channel stored on the
 * order so re-opening a web order still shows the promotions it was placed
 * with. Unrecognised values fall back to the default rather than disabling the
 * filter, so a typo can never widen what is on offer.
 */
function resolveAdminChannel(value: unknown): PromotionChannel {
  return PROMOTION_CHANNELS.includes(value as PromotionChannel)
    ? (value as PromotionChannel)
    : "WHATSAPP";
}

/**
 * POST: promotions eligible for the Admin Order selector (ACTIVE, CODE trigger,
 * checkout date within the promo window). When a `cart` + `currency` are given,
 * each promotion is annotated with an `evaluation` so the UI can render enabled
 * vs. disabled-with-reason cards in a single round-trip.
 *
 * Body: { cart?, customer?, currency? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { cart, customer, currency, channel } = body ?? {};

    const promotions = await listAvailablePromotions({
      cart,
      customer,
      currency,
      channel: resolveAdminChannel(channel),
    });

    return NextResponse.json(
      {
        success: true,
        data: promotions,
        message: "Available promotions has been fetch",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error, "function POST /api/admin/promotions/available/route.ts");
    return NextResponse.json(
      { success: false, message: "Failed to retrieve available promotions" },
      { status: 500 }
    );
  }
}
