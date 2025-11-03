import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Banner from "@/lib/models/Banner";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  uploadFileToCloudinary,
  deleteFileFromCloudinary,
} from "@/lib/helpers/cloudinary";
import { writeFile } from "fs/promises";
import { join } from "path";

// GET - Fetch all banners
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page");
    const isActive = searchParams.get("isActive");

    let query: any = {};

    if (page) {
      query.page = page;
    }

    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    const banners = await Banner.find(query).sort({ order: 1, createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        data: banners,
        message: "Banners fetched successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching banners:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch banners",
      },
      { status: 500 }
    );
  }
}

// POST - Create new banner
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const formData = await req.formData();

    // Extract form fields
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const page = formData.get("page") as string;
    const buttonText = formData.get("buttonText") as string;
    const buttonUrl = formData.get("buttonUrl") as string;
    const buttonColor = formData.get("buttonColor") as string;
    const buttonPosition = formData.get("buttonPosition") as string;
    const textColor = formData.get("textColor") as string;
    const overlayColor = formData.get("overlayColor") as string;
    const textPosition = formData.get("textPosition") as string;
    const isActive = formData.get("isActive") === "true";
    const order = parseInt(formData.get("order") as string) || 0;

    // Get images
    const desktopImage = formData.get("desktopImage") as File;
    const mobileImage = formData.get("mobileImage") as File | null;

    if (!desktopImage) {
      return NextResponse.json(
        { success: false, message: "Desktop image is required" },
        { status: 400 }
      );
    }

    // Validate image types
    const validImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];
    if (!validImageTypes.includes(desktopImage.type)) {
      return NextResponse.json(
        { success: false, message: "Invalid desktop image type" },
        { status: 400 }
      );
    }

    if (mobileImage && !validImageTypes.includes(mobileImage.type)) {
      return NextResponse.json(
        { success: false, message: "Invalid mobile image type" },
        { status: 400 }
      );
    }

    // Upload desktop image
    const desktopBytes = await desktopImage.arrayBuffer();
    const desktopBuffer = Buffer.from(desktopBytes);
    const desktopPath = join("/tmp", desktopImage.name);
    await writeFile(desktopPath, desktopBuffer);

    const desktopUploadResult = await uploadFileToCloudinary(
      desktopPath,
      "pawship-catalog/banners"
    );

    // Upload mobile image if exists
    let mobileUploadResult = null;
    if (mobileImage) {
      const mobileBytes = await mobileImage.arrayBuffer();
      const mobileBuffer = Buffer.from(mobileBytes);
      const mobilePath = join("/tmp", mobileImage.name);
      await writeFile(mobilePath, mobileBuffer);

      mobileUploadResult = await uploadFileToCloudinary(
        mobilePath,
        "pawship-catalog/banners"
      );
    }

    // Create banner data
    const bannerData: any = {
      title,
      description,
      page,
      desktopImageUrl: desktopUploadResult.secureUrl,
      desktopImagePublicId: desktopUploadResult.publicId,
      style: {
        textColor: textColor || "#FFFFFF",
        overlayColor: overlayColor || "",
        textPosition: textPosition || "center",
      },
      order,
      isActive,
    };

    if (mobileUploadResult) {
      bannerData.mobileImageUrl = mobileUploadResult.secureUrl;
      bannerData.mobileImagePublicId = mobileUploadResult.publicId;
    }

    if (buttonText && buttonUrl) {
      bannerData.button = {
        text: buttonText,
        url: buttonUrl,
        color: buttonColor || "#FF6B35",
        position: buttonPosition || "center",
      };
    }

    const banner = await Banner.create(bannerData);

    return NextResponse.json(
      {
        success: true,
        data: banner,
        message: "Banner created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating banner:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create banner",
      },
      { status: 500 }
    );
  }
}

// PATCH - Update banner order (for drag & drop)
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const { banners } = await req.json();

    // Update order for each banner
    const updatePromises = banners.map((banner: any) => {
      return Banner.findByIdAndUpdate(banner._id, { order: banner.order });
    });

    await Promise.all(updatePromises);

    return NextResponse.json(
      {
        success: true,
        message: "Banner order updated successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating banner order:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update banner order",
      },
      { status: 500 }
    );
  }
}
