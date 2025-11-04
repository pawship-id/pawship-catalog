import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Collection from "@/lib/models/Collection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  uploadFileToCloudinary,
  deleteFileFromCloudinary,
} from "@/lib/helpers/cloudinary";
import { generateSlug } from "@/lib/helpers";
import { writeFile } from "fs/promises";
import path from "path";
import os from "os";

interface Context {
  params: Promise<{ id: string }>;
}

// GET - Fetch single collection by ID
export async function GET(req: NextRequest, { params }: Context) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const collection = await Collection.findById(id);

    if (!collection) {
      return NextResponse.json(
        { message: "Collection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Collection fetched successfully",
        data: collection,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching collection:", error);
    return NextResponse.json(
      { message: "Failed to fetch collection", error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update collection
export async function PUT(req: NextRequest, { params }: Context) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const displayOnHomepage = formData.get("displayOnHomepage") === "true";
    const rules = formData.get("rules") as string;
    const ruleIds = JSON.parse(formData.get("ruleIds") as string);
    const desktopImage = formData.get("desktopImage") as File | null;
    const mobileImage = formData.get("mobileImage") as File | null;
    const isNewDesktopImage = formData.get("isNewDesktopImage") === "true";
    const isNewMobileImage = formData.get("isNewMobileImage") === "true";
    const removeMobileImage = formData.get("removeMobileImage") === "true";

    // Validation
    if (!name || !rules || !ruleIds || ruleIds.length === 0) {
      return NextResponse.json(
        { message: "Name, rules, and ruleIds are required" },
        { status: 400 }
      );
    }

    // Find existing collection
    const existingCollection = await Collection.findById(id);
    if (!existingCollection) {
      return NextResponse.json(
        { message: "Collection not found" },
        { status: 404 }
      );
    }

    // Validate image file types if new images are uploaded
    const validImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];
    if (
      isNewDesktopImage &&
      desktopImage &&
      !validImageTypes.includes(desktopImage.type)
    ) {
      return NextResponse.json(
        {
          message:
            "Desktop image must be a valid image file (JPEG, JPG, PNG, WEBP)",
        },
        { status: 400 }
      );
    }

    if (
      isNewMobileImage &&
      mobileImage &&
      !validImageTypes.includes(mobileImage.type)
    ) {
      return NextResponse.json(
        {
          message:
            "Mobile image must be a valid image file (JPEG, JPG, PNG, WEBP)",
        },
        { status: 400 }
      );
    }

    // Generate slug if name changed
    const slug =
      name !== existingCollection.name
        ? generateSlug(name)
        : existingCollection.slug;

    const updateData: any = {
      name,
      slug,
      displayOnHomepage,
      rules,
      ruleIds,
    };

    // Handle desktop image upload
    if (isNewDesktopImage && desktopImage) {
      // Delete old desktop image from Cloudinary
      if (existingCollection.desktopImagePublicId) {
        await deleteFileFromCloudinary(existingCollection.desktopImagePublicId);
      }

      // Upload new desktop image
      const desktopBytes = await desktopImage.arrayBuffer();
      const desktopBuffer = Buffer.from(desktopBytes);
      const desktopTempPath = path.join(os.tmpdir(), desktopImage.name);
      await writeFile(desktopTempPath, desktopBuffer);

      const desktopUploadResult = await uploadFileToCloudinary(
        desktopTempPath,
        "hero-banner"
      );

      updateData.desktopImageUrl = desktopUploadResult.secureUrl;
      updateData.desktopImagePublicId = desktopUploadResult.publicId;
    }

    // Handle mobile image upload or removal
    if (removeMobileImage) {
      // Delete mobile image from Cloudinary
      if (existingCollection.mobileImagePublicId) {
        await deleteFileFromCloudinary(existingCollection.mobileImagePublicId);
      }
      updateData.mobileImageUrl = null;
      updateData.mobileImagePublicId = null;
    } else if (isNewMobileImage && mobileImage) {
      // Delete old mobile image from Cloudinary if exists
      if (existingCollection.mobileImagePublicId) {
        await deleteFileFromCloudinary(existingCollection.mobileImagePublicId);
      }

      // Upload new mobile image
      const mobileBytes = await mobileImage.arrayBuffer();
      const mobileBuffer = Buffer.from(mobileBytes);
      const mobileTempPath = path.join(os.tmpdir(), mobileImage.name);
      await writeFile(mobileTempPath, mobileBuffer);

      const mobileUploadResult = await uploadFileToCloudinary(
        mobileTempPath,
        "hero-banner"
      );

      updateData.mobileImageUrl = mobileUploadResult.secureUrl;
      updateData.mobileImagePublicId = mobileUploadResult.publicId;
    }

    const updatedCollection = await Collection.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      {
        message: "Collection updated successfully",
        data: updatedCollection,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating collection:", error);
    return NextResponse.json(
      { message: "Failed to update collection", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete collection
export async function DELETE(req: NextRequest, { params }: Context) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const deletedCollection = await Collection.findByIdAndUpdate(
      id,
      {
        deleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (deletedCollection.deletedCount === 0) {
      return NextResponse.json(
        { message: "Collection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Collection deleted successfully",
        data: deletedCollection,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting collection:", error);
    return NextResponse.json(
      { message: "Failed to delete collection", error: error.message },
      { status: 500 }
    );
  }
}
