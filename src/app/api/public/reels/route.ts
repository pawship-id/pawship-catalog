import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Reel from "@/lib/models/Reel";

// GET - Fetch all visible reels for public
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const reels = await Reel.find({ show: true }).sort({ order: 1, createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        data: reels,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching public reels:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch reels",
      },
      { status: 500 }
    );
  }
}
