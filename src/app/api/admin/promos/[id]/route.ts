import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Promo from "@/lib/models/Promo";

// GET - Fetch single promo by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const promo = await Promo.findById(params.id);

    if (!promo || promo.deleted) {
      return NextResponse.json(
        {
          success: false,
          message: "Promo not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: promo,
      message: "Promo fetched successfully",
    });
  } catch (error: any) {
    console.error("Error fetching promo:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch promo",
      },
      { status: 500 }
    );
  }
}

// PUT - Update promo
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { promoName, startDate, endDate, products, isActive } = body;

    // Validate dates if provided
    if (startDate && endDate) {
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
    }

    const promo = await Promo.findByIdAndUpdate(
      params.id,
      {
        promoName,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        products,
        isActive,
      },
      { new: true, runValidators: true }
    );

    if (!promo || promo.deleted) {
      return NextResponse.json(
        {
          success: false,
          message: "Promo not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: promo,
      message: "Promo updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating promo:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update promo",
      },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete promo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const promo = await Promo.findById(params.id);

    if (!promo || promo.deleted) {
      return NextResponse.json(
        {
          success: false,
          message: "Promo not found",
        },
        { status: 404 }
      );
    }

    // Soft delete using mongoose-delete plugin
    await promo.delete();

    return NextResponse.json({
      success: true,
      message: "Promo deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting promo:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete promo",
      },
      { status: 500 }
    );
  }
}
