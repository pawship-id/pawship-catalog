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

interface Context {
  params: Promise<{ id: string }>;
}

// GET - Fetch single banner
export async function GET(req: NextRequest, { params }: Context) {
  try {
    await dbConnect();

    const { id } = await params;
    const banner = await Banner.findById(id);

    if (!banner) {
      return NextResponse.json(
        { success: false, message: "Banner not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: banner,
        message: "Banner fetched successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching banner:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch banner",
      },
      { status: 500 }
    );
  }
}

// PUT - Update banner
export async function PUT(req: NextRequest, { params }: Context) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const { id } = await params;
    const banner = await Banner.findById(id);

    if (!banner) {
      return NextResponse.json(
        { success: false, message: "Banner not found" },
        { status: 404 }
      );
    }

    const formData = await req.formData();

    // Extract simple fields
    const title = (formData.get("title") as string) || banner.title || "";
    const description =
      (formData.get("description") as string) || banner.description || "";
    const page = (formData.get("page") as string) || banner.page || "home";
    const isActive =
      formData.get("isActive") === "true" ? true : !!banner.isActive;
    const order =
      parseInt((formData.get("order") as string) || "") || banner.order;

    // Parse nested JSON for button and style
    let buttonObj: any = null;
    const buttonRaw = formData.get("button") as string | null;
    if (buttonRaw) {
      try {
        buttonObj = JSON.parse(buttonRaw);
      } catch (err) {
        console.warn("Failed to parse button JSON", err);
      }
    }

    let styleObj: any = null;
    const styleRaw = formData.get("style") as string | null;
    if (styleRaw) {
      try {
        styleObj = JSON.parse(styleRaw);
      } catch (err) {
        console.warn("Failed to parse style JSON", err);
      }
    }

    // Check if new images uploaded
    const desktopImage = formData.get("desktopImage") as File | null;
    const mobileImage = formData.get("mobileImage") as File | null;
    const isNewDesktopImage = formData.get("isNewDesktopImage") === "true";
    const isNewMobileImage = formData.get("isNewMobileImage") === "true";
    const removeMobileImage = formData.get("removeMobileImage") === "true";

    // Update data
    const updateData: any = {
      title,
      description,
      page,
      isActive,
      order,
    };

    // Set style if provided, else leave as-is
    if (styleObj && typeof styleObj === "object") {
      updateData.style = styleObj;
    }

    // Handle button update: if provided use it, if explicitly null/undefined then unset
    if (buttonObj === null) {
      // do nothing (no change)
    } else if (buttonObj) {
      updateData.button = buttonObj;
    } else {
      // if parsed as falsy but present, remove
      updateData.button = undefined;
    }

    // Validate and upload new desktop image if provided
    if (isNewDesktopImage && desktopImage) {
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

      // Delete old desktop image
      if (banner.desktopImagePublicId) {
        await deleteFileFromCloudinary(banner.desktopImagePublicId);
      }

      // Upload new desktop image
      const desktopBytes = await desktopImage.arrayBuffer();
      const desktopBuffer = Buffer.from(desktopBytes);
      const desktopPath = join("/tmp", desktopImage.name);
      await writeFile(desktopPath, desktopBuffer);

      const desktopUploadResult = await uploadFileToCloudinary(
        desktopPath,
        "pawship-catalog/banners"
      );

      updateData.desktopImageUrl = desktopUploadResult.secureUrl;
      updateData.desktopImagePublicId = desktopUploadResult.publicId;
    }

    // Handle mobile image
    if (removeMobileImage) {
      // Remove mobile image
      if (banner.mobileImagePublicId) {
        await deleteFileFromCloudinary(banner.mobileImagePublicId);
      }
      updateData.mobileImageUrl = null;
      updateData.mobileImagePublicId = null;
    } else if (isNewMobileImage && mobileImage) {
      // Upload new mobile image
      const validImageTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!validImageTypes.includes(mobileImage.type)) {
        return NextResponse.json(
          { success: false, message: "Invalid mobile image type" },
          { status: 400 }
        );
      }

      // Delete old mobile image if exists
      if (banner.mobileImagePublicId) {
        await deleteFileFromCloudinary(banner.mobileImagePublicId);
      }

      const mobileBytes = await mobileImage.arrayBuffer();
      const mobileBuffer = Buffer.from(mobileBytes);
      const mobilePath = join("/tmp", mobileImage.name);
      await writeFile(mobilePath, mobileBuffer);

      const mobileUploadResult = await uploadFileToCloudinary(
        mobilePath,
        "pawship-catalog/banners"
      );

      updateData.mobileImageUrl = mobileUploadResult.secureUrl;
      updateData.mobileImagePublicId = mobileUploadResult.publicId;
    }

    const updatedBanner = await Banner.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return NextResponse.json(
      {
        success: true,
        data: updatedBanner,
        message: "Banner updated successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating banner:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update banner",
      },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete banner
export async function DELETE(req: NextRequest, { params }: Context) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const { id } = await params;
    const banner = await Banner.findById(id);

    if (!banner) {
      return NextResponse.json(
        { success: false, message: "Banner not found" },
        { status: 404 }
      );
    }

    // Soft delete
    await (banner as any).delete();

    return NextResponse.json(
      {
        success: true,
        message: "Banner deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting banner:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete banner",
      },
      { status: 500 }
    );
  }
}
