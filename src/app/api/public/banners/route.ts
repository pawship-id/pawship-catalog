import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Banner from "@/lib/models/Banner";

// GET - Fetch active banners for public pages
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "home";

    // Fetch active banners for the specified page
    const banners = await Banner.find({
      page: page,
      isActive: true,
    })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: banners,
        message: "Banners fetched successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching public banners:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch banners",
      },
      { status: 500 }
    );
  }
}
