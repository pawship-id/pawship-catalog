import { generateSlug } from "@/lib/helpers";
import ResellerCategory from "@/lib/models/ResellerCategory";
import dbConnect from "@/lib/mongodb";
import { ResellerCategoryData } from "@/lib/types/reseller-category";
import { NextRequest, NextResponse } from "next/server";

interface Context {
  params: Promise<{ id: string }>;
}

// GET: read reseller category by ID
export async function GET(req: NextRequest, { params }: Context) {
  await dbConnect();
  try {
    const { id } = await params;

    const resellerCategory = await ResellerCategory.findById(id);

    if (!resellerCategory) {
      return NextResponse.json(
        { success: false, message: "Reseller category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: resellerCategory,
        message: "Data reseller category has been fetch",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(
      error,
      "function GET /api/admin/reseller-categories/[id]/route.ts"
    );

    return NextResponse.json(
      { success: false, message: "Failed to fetch reseller category by ID" },
      { status: 400 }
    );
  }
}

// PUT/PATCH: update reseller category by ID
export async function PUT(req: NextRequest, { params }: Context) {
  await dbConnect();
  try {
    const { id } = await params;

    const findResellerCategory: ResellerCategoryData | null =
      await ResellerCategory.findById(id);

    if (!findResellerCategory) {
      return NextResponse.json(
        { success: false, message: "Reseller category not found" },
        { status: 404 }
      );
    }

    const body = await req.json();

    body.slug = generateSlug(body.resellerCategoryName);

    const resellerCategory = await ResellerCategory.findByIdAndUpdate(
      id,
      body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!resellerCategory) {
      return NextResponse.json(
        { success: false, message: "Reseller category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: resellerCategory,
        message: `Reseller category successfully updated`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log(
      error,
      "function PUT /api/admin/reseller-categories/[id]/route.ts"
    );

    let errorMsg: string | string[];

    if (error.name === "ValidationError") {
      errorMsg = Object.values(error.errors).map((err: any) => err.message);
    } else if (error.name === "MongooseError") {
      errorMsg = error.message;
    } else {
      errorMsg = "Failed to update reseller category";
    }

    return NextResponse.json(
      { success: false, message: errorMsg },
      { status: 400 }
    );
  }
}

// PATCH: update status deleted reseller category by ID
export async function PATCH(req: NextRequest, { params }: Context) {
  await dbConnect();
  try {
    const { id } = await params;

    const deletedResellerCategory = await ResellerCategory.findByIdAndUpdate(
      id,
      {
        deleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (deletedResellerCategory.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Reseller category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: deletedResellerCategory,
        message: `Reseller category successfully deleted`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(
      error,
      "function PATCH /api/admin/reseller-categories/[id]/route.ts"
    );

    return NextResponse.json(
      { success: false, message: "Failed to delete reseller category" },
      { status: 400 }
    );
  }
}
