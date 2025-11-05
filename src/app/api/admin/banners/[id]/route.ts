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
    const page = (formData.get("page") as string) || banner.page || "home";
    const isActive =
      formData.get("isActive") === "true" ? true : !!banner.isActive;
    const order =
      parseInt((formData.get("order") as string) || "") || banner.order;

    // Check if button should be removed
    const removeButton = formData.get("removeButton") === "true";

    // Parse button JSON
    let buttonObj: any = null;
    if (!removeButton) {
      const buttonRaw = formData.get("button") as string | null;
      if (buttonRaw) {
        try {
          buttonObj = JSON.parse(buttonRaw);

          // Validate button structure
          if (buttonObj) {
            if (!buttonObj.text || !buttonObj.url) {
              return NextResponse.json(
                { success: false, message: "Button text and URL are required" },
                { status: 400 }
              );
            }

            if (
              !buttonObj.position?.desktop?.horizontal ||
              !buttonObj.position?.desktop?.vertical
            ) {
              return NextResponse.json(
                {
                  success: false,
                  message: "Desktop button position is required",
                },
                { status: 400 }
              );
            }
          }
        } catch (err) {
          console.warn("Failed to parse button JSON", err);
        }
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
      page,
      isActive,
      order,
    };

    // Handle button update
    if (removeButton) {
      updateData.button = undefined;
    } else if (buttonObj && typeof buttonObj === "object") {
      updateData.button = buttonObj;
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
        "hero-banner"
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
        "hero-banner"
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
