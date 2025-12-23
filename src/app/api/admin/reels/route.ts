import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Reel from "@/lib/models/Reel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  uploadFileToCloudinary,
  deleteFileFromCloudinary,
} from "@/lib/helpers/cloudinary";

// GET - Fetch all reels
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "25");
    const skip = (page - 1) * limit;

    const totalCount = await Reel.countDocuments();
    const reels = await Reel.find()
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json(
      {
        success: true,
        data: reels,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching reels:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch reels",
      },
      { status: 500 }
    );
  }
}

// POST - Create new reel
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const formData = await req.formData();
    const thumbnail = formData.get("thumbnail") as File;
    const link = formData.get("link") as string;
    const show = formData.get("show") === "true";
    const order = parseInt(formData.get("order") as string) || 0;
    const likes = parseInt(formData.get("likes") as string) || 0;
    const views = parseInt(formData.get("views") as string) || 0;

    // Validation
    if (!thumbnail || !link) {
      return NextResponse.json(
        { success: false, message: "Thumbnail and link are required" },
        { status: 400 }
      );
    }

    // Upload thumbnail to Cloudinary
    const uploadResult = await uploadFileToCloudinary(thumbnail, "reels");

    const reel = await Reel.create({
      thumbnailUrl: uploadResult.secureUrl,
      thumbnailPublicId: uploadResult.publicId,
      link,
      show: show ?? true,
      order: order ?? 0,
      likes: likes ?? 0,
      views: views ?? 0,
    });

    return NextResponse.json(
      {
        success: true,
        data: reel,
        message: "Reel created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating reel:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create reel",
      },
      { status: 500 }
    );
  }
}
