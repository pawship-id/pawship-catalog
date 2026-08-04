import { resolveAutomaticPromotions } from "@/lib/helpers/promotion-service";
import { PROMOTION_CHANNELS, type PromotionChannel } from "@/lib/types/promotion";
import { NextRequest, NextResponse } from "next/server";

/** See the available route — admin defaults to WhatsApp, edit passes the order's channel. */
function resolveAdminChannel(value: unknown): PromotionChannel {
  return PROMOTION_CHANNELS.includes(value as PromotionChannel)
    ? (value as PromotionChannel)
    : "WHATSAPP";
}

/**
 * POST: the automatic promotions that currently apply to this cart, for the
 * admin order screens. Mirrors the public endpoint; the order routes call the
 * same `resolveAutomaticPromotions`, so preview and persisted result agree.
 *
 * Body: { cart, customer?, currency, channel? }
 * Returns `data` = IAppliedPromotion[]
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cart, customer, currency, channel } = body ?? {};

    if (!cart || !currency) {
      return NextResponse.json(
        { success: false, message: "cart and currency are required" },
        { status: 400 }
      );
    }

    const promotions = await resolveAutomaticPromotions({
      cart,
      customer: customer ?? { type: "RETAIL" },
      currency,
      channel: resolveAdminChannel(channel),
    });

    return NextResponse.json(
      {
        success: true,
        data: promotions,
        message: "Automatic promotions resolved",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error, "function POST /api/admin/promotions/automatic/route.ts");
    return NextResponse.json(
      { success: false, message: "Failed to resolve automatic promotions" },
      { status: 500 }
    );
  }
}
