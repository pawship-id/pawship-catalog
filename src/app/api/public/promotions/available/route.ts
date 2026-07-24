import { listAvailablePromotions } from "@/lib/helpers/promotion-service";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST: promotions eligible for the public customer cart (ACTIVE, CODE trigger,
 * checkout date within the promo window). Mirrors the Admin selector endpoint —
 * evaluation is a pure, read-only run of the Promotion Engine, so this is safe
 * to expose to the storefront. When a `cart` + `currency` are given each
 * promotion is annotated with an `evaluation` (enabled vs. disabled-with-reason).
 *
 * Body: { cart?, customer?, currency? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { cart, customer, currency } = body ?? {};

    const promotions = await listAvailablePromotions({ cart, customer, currency });

    return NextResponse.json(
      {
        success: true,
        data: promotions,
        message: "Available promotions has been fetch",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error, "function POST /api/public/promotions/available/route.ts");
    return NextResponse.json(
      { success: false, message: "Failed to retrieve available promotions" },
      { status: 500 }
    );
  }
}
