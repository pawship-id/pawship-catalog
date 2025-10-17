import { generateSlug } from "@/lib/helpers";
import ResellerCategory from "@/lib/models/ResellerCategory";
import dbConnect from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

// GET: read all reseller category
export async function GET() {
  await dbConnect();

  try {
    const resellerCategories = await ResellerCategory.find({})
      .select("resellerCategoryName slug currency isActive")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        data: resellerCategories,
        message: "Data reseller categories has been fetch",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error, "function GET /api/admin/reseller-categories/route.ts");

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve reseller categories data",
      },
      { status: 500 }
    );
  }
}

// POST: create new reseller category
export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();

    body.slug = generateSlug(body.resellerCategoryName);

    const resellerCategory = await ResellerCategory.create(body);

    return NextResponse.json(
      {
        success: true,
        data: resellerCategory,
        message: `Reseller category successfully created`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.log(error, "function POST /api/admin/reseller-categories/route.ts");

    let errorMsg: string | string[];

    if (error.name === "ValidationError") {
      errorMsg = Object.values(error.errors).map((err: any) => err.message);
    } else if (error.name === "MongooseError") {
      errorMsg = error.message;
    } else {
      errorMsg = "Failed to create reseller category";
    }

    return NextResponse.json(
      { success: false, message: errorMsg },
      { status: 400 }
    );
  }
}
