import { evaluateByCode } from "@/lib/helpers/promotion-service";
import { PROMOTION_CHANNELS, type PromotionChannel } from "@/lib/types/promotion";
import { NextRequest, NextResponse } from "next/server";

/** See the available route — admin defaults to WhatsApp, edit passes the order's channel. */
function resolveAdminChannel(value: unknown): PromotionChannel {
  return PROMOTION_CHANNELS.includes(value as PromotionChannel)
    ? (value as PromotionChannel)
    : "WHATSAPP";
}

/**
 * POST: run the Promotion Engine for a single code (the Apply / manual-code
 * path). The engine only evaluates — it never mutates the cart. The caller
 * decides what to do with the returned discount / shipping / free gift.
 *
 * Body: { code, cart, customer, currency }
 * Returns `data` = the engine result:
 *   { valid: true, promotion, discount, shippingDiscount, freeGift, messages }
 *   { valid: false, reason }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, cart, customer, currency, channel } = body ?? {};

    if (!cart || !currency) {
      return NextResponse.json(
        { success: false, message: "cart and currency are required" },
        { status: 400 }
      );
    }

    const { result } = await evaluateByCode(code, {
      cart,
      customer: customer ?? { type: "RETAIL" },
      currency,
      channel: resolveAdminChannel(channel),
    });

    return NextResponse.json(
      { success: true, data: result, message: "Promotion evaluated" },
      { status: 200 }
    );
  } catch (error) {
    console.log(error, "function POST /api/admin/promotions/evaluate/route.ts");
    return NextResponse.json(
      { success: false, message: "Failed to evaluate promotion" },
      { status: 500 }
    );
  }
}
