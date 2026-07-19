import Promotion from "@/lib/models/Promotion";
import dbConnect from "@/lib/mongodb";
import { validatePromotionPayload } from "@/lib/helpers/promotion-validation";
import { NextRequest, NextResponse } from "next/server";

interface Context {
  params: Promise<{ id: string }>;
}

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

// GET: read one promotion
export async function GET(req: NextRequest, { params }: Context) {
  await dbConnect();
  try {
    const { id } = await params;

    const promotion = await Promotion.findById(id);
    if (!promotion) {
      return NextResponse.json(
        { success: false, message: "Promotion not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: promotion, message: "Data promotion has been fetch" },
      { status: 200 }
    );
  } catch (error) {
    console.log(error, "function GET /api/admin/promotions/[id]/route.ts");
    return NextResponse.json(
      { success: false, message: "Failed to fetch promotion by ID" },
      { status: 400 }
    );
  }
}

// PUT: update a promotion
export async function PUT(req: NextRequest, { params }: Context) {
  await dbConnect();
  try {
    const { id } = await params;

    const findPromotion = await Promotion.findById(id);
    if (!findPromotion) {
      return NextResponse.json(
        { success: false, message: "Promotion not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const payload = pickPromotionFields(body);

    const errors = validatePromotionPayload(payload);
    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, message: errors },
        { status: 400 }
      );
    }

    // unique code on another document
    const existing = await Promotion.findOne({
      code: payload.code,
      _id: { $ne: id },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, message: `Promotion code ${payload.code} already exists` },
        { status: 400 }
      );
    }

    const promotion = await Promotion.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json(
      { success: true, data: promotion, message: "Promotion successfully updated" },
      { status: 200 }
    );
  } catch (error: any) {
    console.log(error, "function PUT /api/admin/promotions/[id]/route.ts");

    let errorMsg: string | string[];
    if (error.name === "ValidationError") {
      errorMsg = Object.values(error.errors).map((err: any) => err.message);
    } else if (error.code === 11000) {
      errorMsg = "Promotion code already exists";
    } else if (error.name === "MongooseError") {
      errorMsg = error.message;
    } else {
      errorMsg = "Failed to update promotion";
    }

    return NextResponse.json(
      { success: false, message: errorMsg },
      { status: 400 }
    );
  }
}

// PATCH: soft delete a promotion
export async function PATCH(req: NextRequest, { params }: Context) {
  await dbConnect();
  try {
    const { id } = await params;

    const deletedPromotion = await Promotion.findByIdAndUpdate(
      id,
      { deleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!deletedPromotion) {
      return NextResponse.json(
        { success: false, message: "Promotion not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: deletedPromotion, message: "Promotion successfully deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.log(error, "function PATCH /api/admin/promotions/[id]/route.ts");
    return NextResponse.json(
      { success: false, message: "Failed to delete promotion" },
      { status: 400 }
    );
  }
}
