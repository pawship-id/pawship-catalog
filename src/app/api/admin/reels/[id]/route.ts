import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Reel from "@/lib/models/Reel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  uploadFileToCloudinary,
  deleteFileFromCloudinary,
} from "@/lib/helpers/cloudinary";

interface Context {
  params: Promise<{ id: string }>;
}

// GET - Fetch single reel
export async function GET(req: NextRequest, { params }: Context) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const { id } = await params;
    const reel = await Reel.findById(id);

    if (!reel) {
      return NextResponse.json(
        { success: false, message: "Reel not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: reel,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching reel:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch reel",
      },
      { status: 500 }
    );
  }
}

// PUT - Update reel
export async function PUT(req: NextRequest, { params }: Context) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const { id } = await params;
    const formData = await req.formData();

    const thumbnail = formData.get("thumbnail") as File | null;
    const link = formData.get("link") as string;
    const show = formData.get("show") === "true";
    const order = parseInt(formData.get("order") as string) || 0;
    const likes = parseInt(formData.get("likes") as string) || 0;
    const views = parseInt(formData.get("views") as string) || 0;
    const isNewThumbnail = formData.get("isNewThumbnail") === "true";

    // Get existing reel
    const existingReel = await Reel.findById(id);
    if (!existingReel) {
      return NextResponse.json(
        { success: false, message: "Reel not found" },
        { status: 404 }
      );
    }

    // Validation
    if (!link) {
      return NextResponse.json(
        { success: false, message: "Link is required" },
        { status: 400 }
      );
    }

    const updateData: any = {
      link,
      show,
      order: order ?? 0,
      likes: likes ?? 0,
      views: views ?? 0,
    };

    // Handle thumbnail update
    if (isNewThumbnail && thumbnail instanceof File) {
      // Delete old thumbnail from Cloudinary
      if (existingReel.thumbnailPublicId) {
        await deleteFileFromCloudinary(existingReel.thumbnailPublicId);
      }

      // Upload new thumbnail
      const uploadResult = await uploadFileToCloudinary(thumbnail, "reels");
      updateData.thumbnailUrl = uploadResult.secureUrl;
      updateData.thumbnailPublicId = uploadResult.publicId;
    }

    const reel = await Reel.findByIdAndUpdate(id, updateData, { new: true });

    if (!reel) {
      return NextResponse.json(
        { success: false, message: "Reel not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: reel,
        message: "Reel updated successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating reel:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update reel",
      },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete reel
export async function PATCH(req: NextRequest, { params }: Context) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const { id } = await params;
    const reel = await Reel.findById(id);

    if (!reel) {
      return NextResponse.json(
        { success: false, message: "Reel not found" },
        { status: 404 }
      );
    }

    // Delete thumbnail from Cloudinary
    if (reel.thumbnailPublicId) {
      await deleteFileFromCloudinary(reel.thumbnailPublicId);
    }

    // Soft delete using mongoose-delete
    const deletedReel = await Reel.findByIdAndUpdate(
      id,
      {
        deleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (deletedReel.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Reel not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Reel deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting reel:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete reel",
      },
      { status: 500 }
    );
  }
}
