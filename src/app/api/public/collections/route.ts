import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Collection from "@/lib/models/Collection";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const collections = await Collection.find({ deleted: false })
      .select("name slug description displayOnNavbar")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: collections,
    });
  } catch (error: any) {
    console.error("Error fetching collections:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch collections",
      },
      { status: 500 }
    );
  }
}
