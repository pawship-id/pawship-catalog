import Product from "@/lib/models/Product";
import dbConnect from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    let products = await Product.find()
      .populate([
        {
          path: "productVariantsData",
        },
        {
          path: "tags",
          select: "_id tagName",
        },
        {
          path: "categoryDetail",
          select: "_id name",
        },
      ])
      .lean();

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.log(error, "function GET /api/public/products/route.ts");

    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 400 }
    );
  }
}
