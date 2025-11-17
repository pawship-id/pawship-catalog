import { NextResponse } from "next/server";
import Promo from "@/lib/models/Promo";
import dbConnect from "@/lib/mongodb";

// GET - Fetch all active promos (public endpoint for applying discounts)
export async function GET() {
  try {
    await dbConnect();

    const now = new Date();

    // Find promos that are:
    // 1. Not soft deleted
    // 2. isActive = true
    // 3. Current date is between startDate and endDate
    const activePromos = await Promo.find({
      deleted: { $ne: true },
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).select("promoName startDate endDate products isActive");

    return NextResponse.json({
      success: true,
      data: activePromos,
      message: "Active promos fetched successfully",
    });
  } catch (error: any) {
    console.error("Error fetching active promos:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch active promos",
      },
      { status: 500 }
    );
  }
}
