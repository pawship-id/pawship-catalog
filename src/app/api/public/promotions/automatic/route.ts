import { resolveAutomaticPromotions } from "@/lib/helpers/promotion-service";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST: the automatic promotions that currently apply to this cart.
 *
 * Preview only — the cart needs to show the discount before the customer
 * submits. The order route calls the SAME `resolveAutomaticPromotions`, so what
 * is shown here and what gets persisted cannot drift apart. Nothing about the
 * result is trusted on the way back in: the order route rediscovers it.
 *
 * Body: { cart, customer?, currency }
 * Returns `data` = IAppliedPromotion[]
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cart, customer, currency } = body ?? {};

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
      channel: "WEB", // fixed by the route, never taken from the body
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
    console.log(error, "function POST /api/public/promotions/automatic/route.ts");
    return NextResponse.json(
      { success: false, message: "Failed to resolve automatic promotions" },
      { status: 500 }
    );
  }
}
