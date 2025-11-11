import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Collection from "@/lib/models/Collection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { uploadFileToCloudinary } from "@/lib/helpers/cloudinary";
import { generateSlug } from "@/lib/helpers";
import { writeFile } from "fs/promises";
import path from "path";
import os from "os";

// GET - Fetch all collections
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const collections = await Collection.find().sort({ createdAt: -1 });

    return NextResponse.json(
      {
        message: "Collections fetched successfully",
        data: collections,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching collections:", error);
    return NextResponse.json(
      { message: "Failed to fetch collections", error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new collection
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

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

    // Validation
    if (!name || !rules || !ruleIds || ruleIds.length === 0) {
      return NextResponse.json(
        { message: "Name, rules, and ruleIds are required" },
        { status: 400 }
      );
    }

    if (!desktopImage) {
      return NextResponse.json(
        { message: "Desktop image is required" },
        { status: 400 }
      );
    }

    // Validate image file types
    const validImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];
    if (!validImageTypes.includes(desktopImage.type)) {
      return NextResponse.json(
        {
          message:
            "Desktop image must be a valid image file (JPEG, JPG, PNG, WEBP)",
        },
        { status: 400 }
      );
    }

    if (mobileImage && !validImageTypes.includes(mobileImage.type)) {
      return NextResponse.json(
        {
          message:
            "Mobile image must be a valid image file (JPEG, JPG, PNG, WEBP)",
        },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = generateSlug(name);

    // Upload desktop image to Cloudinary
    const desktopBytes = await desktopImage.arrayBuffer();
    const desktopBuffer = Buffer.from(desktopBytes);
    const desktopTempPath = path.join(os.tmpdir(), desktopImage.name);
    await writeFile(desktopTempPath, desktopBuffer);

    const desktopUploadResult = await uploadFileToCloudinary(
      desktopTempPath,
      "hero-banner"
    );

    let mobileUploadResult = null;
    if (mobileImage) {
      // Upload mobile image to Cloudinary
      const mobileBytes = await mobileImage.arrayBuffer();
      const mobileBuffer = Buffer.from(mobileBytes);
      const mobileTempPath = path.join(os.tmpdir(), mobileImage.name);
      await writeFile(mobileTempPath, mobileBuffer);

      mobileUploadResult = await uploadFileToCloudinary(
        mobileTempPath,
        "hero-banner"
      );
    }

    // Create new collection
    const collectionData: any = {
      name,
      slug,
      displayOnHomepage,
      rules,
      ruleIds,
      desktopImageUrl: desktopUploadResult.secureUrl,
      desktopImagePublicId: desktopUploadResult.publicId,
    };

    if (mobileUploadResult) {
      collectionData.mobileImageUrl = mobileUploadResult.secureUrl;
      collectionData.mobileImagePublicId = mobileUploadResult.publicId;
    }

    const newCollection = await Collection.create(collectionData);

    return NextResponse.json(
      {
        message: "Collection created successfully",
        data: newCollection,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating collection:", error);
    return NextResponse.json(
      { message: "Failed to create collection", error: error.message },
      { status: 500 }
    );
  }
}
