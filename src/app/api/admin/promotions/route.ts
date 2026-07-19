import Promotion from "@/lib/models/Promotion";
import dbConnect from "@/lib/mongodb";
import { validatePromotionPayload } from "@/lib/helpers/promotion-validation";
import { NextRequest, NextResponse } from "next/server";

/** Whitelist the fields a client may set — avoids mass-assigning usedCount etc. */
function pickPromotionFields(body: any) {
  return {
    name: body.name,
    code: String(body.code || "").trim().toUpperCase(),
    description: body.description,
    trigger: body.trigger,
    status: body.status,
    priority: body.priority,
    stackable: body.stackable,
    startAt: body.startAt,
    endAt: body.endAt,
    appliesTo: body.appliesTo,
    conditions: body.conditions,
    rewards: body.rewards,
    tiers: body.tiers,
    customerRules: body.customerRules,
    limits: body.limits,
  };
}

// GET: list all promotions
export async function GET() {
  await dbConnect();

  try {
    const promotions = await Promotion.find({ deleted: { $ne: true } }).sort({
      priority: -1,
      createdAt: -1,
    });

    return NextResponse.json(
      {
        success: true,
        data: promotions,
        message: "Data promotions has been fetch",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error, "function GET /api/admin/promotions/route.ts");

    return NextResponse.json(
      { success: false, message: "Failed to retrieve promotions data" },
      { status: 500 }
    );
  }
}

// POST: create a promotion
export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    const payload = pickPromotionFields(body);

    // 1. Business validation (dates, percentages, per-type config, quota, ...)
    const errors = validatePromotionPayload(payload);
    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, message: errors },
        { status: 400 }
      );
    }

    // 2. Unique code (soft-deleted ones are excluded by mongoose-delete)
    const existing = await Promotion.findOne({ code: payload.code });
    if (existing) {
      return NextResponse.json(
        { success: false, message: `Promotion code ${payload.code} already exists` },
        { status: 400 }
      );
    }

    const promotion = await Promotion.create(payload);

    return NextResponse.json(
      {
        success: true,
        data: promotion,
        message: "Promotion successfully created",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.log(error, "function POST /api/admin/promotions/route.ts");

    let errorMsg: string | string[];
    if (error.name === "ValidationError") {
      errorMsg = Object.values(error.errors).map((err: any) => err.message);
    } else if (error.code === 11000) {
      errorMsg = "Promotion code already exists";
    } else if (error.name === "MongooseError") {
      errorMsg = error.message;
    } else {
      errorMsg = "Failed to create promotion";
    }

    return NextResponse.json(
      { success: false, message: errorMsg },
      { status: 400 }
    );
  }
}
