import { NextRequest, NextResponse } from "next/server";
import { uploadFileToCloudinary, UploadResult } from "@/lib/helpers/cloudinary";
import { writeFile } from "fs/promises";
import Category from "@/lib/models/Category";
import dbConnect from "@/lib/mongodb";
import path from "path";
import os from "os";
import { generateSlug } from "@/lib/helpers";

// GET: read all category
export async function GET() {
  await dbConnect();

  try {
    const categories = await Category.find({})
      .select("name slug imageUrl isDisplayed")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        data: categories,
        message: "Data categories has been fetch",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error, "function GET /api/admin/categories/route.ts");

    return NextResponse.json(
      { success: false, message: "Failed to retrieve categories data" },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

// POST: create new category
export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const formData = await req.formData();

    // extract data
    const name = formData.get("name") as string;
    const isDisplayed = formData.get("isDisplayed") as string;
    const isSubCategory = formData.get("isSubCategory") as string;
    const parentCategoryId =
      (formData.get("parentCategoryId") as string) || null;
    const isNewImage = formData.get("isNewImage") as string;
    const image = formData.get("image") as File | null;

    let body: any = {
      name,
      isDisplayed,
      isSubCategory,
      parentCategoryId,
    };

    // if there is a new image and image is not null
    if (isNewImage && image) {
      const buffer = Buffer.from(await image.arrayBuffer());
      const filename = `${Date.now()}-${image.name.replace(/\s/g, "_")}`;
      let tempFilePath = path.join(os.tmpdir(), filename);

      await writeFile(tempFilePath, buffer);

      let uploadResult: UploadResult = await uploadFileToCloudinary(
        tempFilePath,
        "category"
      );

      body.imageUrl = uploadResult.secureUrl;
      body.imagePublicId = uploadResult.publicId;
    }

    body.slug = generateSlug(name);

    const category = await Category.create(body);

    return NextResponse.json(
      {
        success: true,
        data: category,
        message: `Category successfully created`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.log(error, "function POST /api/admin/categories/route.ts");

    let errorMsg: string | string[];

    if (error.name === "ValidationError") {
      errorMsg = Object.values(error.errors).map((err: any) => err.message);
    } else if (error.name === "MongooseError") {
      errorMsg = error.message;
    } else {
      errorMsg = "Failed to create category";
    }

    return NextResponse.json(
      { success: false, message: errorMsg },
      { status: 400 }
    );
  }
}
