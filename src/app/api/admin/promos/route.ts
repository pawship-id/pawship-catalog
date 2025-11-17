import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Promo from "@/lib/models/Promo";

// GET - Fetch all promos
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const promos = await Promo.find({ deleted: { $ne: true } }).sort({
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      data: promos,
      message: "Promos fetched successfully",
    });
  } catch (error: any) {
    console.error("Error fetching promos:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch promos",
      },
      { status: 500 }
    );
  }
}

// POST - Create new promo
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { promoName, startDate, endDate, products, isActive } = body;

    // Validation
    if (!promoName || !startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Promo name, start date, and end date are required",
        },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return NextResponse.json(
        {
          success: false,
          message: "End date must be after start date",
        },
        { status: 400 }
      );
    }

    const promo = await Promo.create({
      promoName,
      startDate: start,
      endDate: end,
      products: products || [],
      isActive: isActive !== undefined ? isActive : true,
    });

    return NextResponse.json(
      {
        success: true,
        data: promo,
        message: "Promo created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating promo:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create promo",
      },
      { status: 500 }
    );
  }
}
