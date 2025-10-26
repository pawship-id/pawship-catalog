import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import Category from "@/lib/models/Category";
import path from "path";
import dbConnect from "@/lib/mongodb";
import os from "os";
import {
  deleteFileFromCloudinary,
  uploadFileToCloudinary,
  UploadResult,
} from "@/lib/helpers/cloudinary";
import { CategoryData } from "@/lib/types/category";
import { generateSlug } from "@/lib/helpers";
import { isValidObjectId } from "mongoose";

interface Context {
  params: Promise<{ id: string }>;
}

// GET: read category by ID
export async function GET(req: NextRequest, { params }: Context) {
  await dbConnect();
  try {
    const identifier = (await params).id;

    let category;

    if (isValidObjectId(identifier)) {
      category = await Category.findById(identifier); // by ID
    } else {
      category = await Category.findOne({ slug: identifier }); // by Slug
    }

    category = await category.populate({
      path: "products",
      match: { deleted: { $ne: true } },
      populate: [
        {
          path: "productVariantsData",
        },
        {
          path: "tags",
          select: "_id tagName",
        },
        {
          path: "categoryDetail",
          select: "name",
        },
      ],
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: category,
        message: "Data category has been fetch",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error, "function GET /api/admin/categories/[id]/route.ts");

    return NextResponse.json(
      { success: false, message: "Failed to fetch category by ID" },
      { status: 400 }
    );
  }
}

// PUT/PATCH: update category by ID
export async function PUT(req: NextRequest, { params }: Context) {
  await dbConnect();
  try {
    const { id } = await params;

    const findCategory: CategoryData | null = await Category.findById(id);

    if (!findCategory) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    const formData = await req.formData();

    const name = formData.get("name") as string;
    const isDisplayed = formData.get("isDisplayed") as string;
    const isSubCategory = formData.get("isSubCategory") === "true";
    const parentCategoryId =
      (formData.get("parentCategoryId") as string) || null;
    const isNewImage = formData.get("isNewImage") === "true";
    const image = formData.get("image") as File | null;
    const description = formData.get("description") as string;

    let body: any = {
      name,
      isDisplayed,
      isSubCategory,
      parentCategoryId,
      description,
    };

    if (isNewImage && image instanceof File) {
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

    // if updating image and there was already an existing image, delete the old image
    if (findCategory.imageUrl && findCategory.imagePublicId && isNewImage) {
      await deleteFileFromCloudinary(findCategory.imagePublicId);
    }

    body.slug = generateSlug(name);

    const category = await Category.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: category,
        message: `Category successfully updated`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log(error, "function PUT /api/admin/categories/[id]/route.ts");

    let errorMsg: string | string[];

    if (error.name === "ValidationError") {
      errorMsg = Object.values(error.errors).map((err: any) => err.message);
    } else if (error.name === "MongooseError") {
      errorMsg = error.message;
    } else {
      errorMsg = "Failed to update category";
    }

    return NextResponse.json(
      { success: false, message: errorMsg },
      { status: 400 }
    );
  }
}

// PATCH: update status deleted category by ID
export async function PATCH(req: NextRequest, { params }: Context) {
  await dbConnect();
  try {
    const { id } = await params;

    const deletedCategory = await Category.findByIdAndUpdate(
      id,
      {
        deleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (deletedCategory.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: deletedCategory,
        message: `Category successfully deleted`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error, "function PATCH /api/admin/categories/[id]/route.ts");

    return NextResponse.json(
      { success: false, message: "Failed to delete category" },
      { status: 400 }
    );
  }
}
