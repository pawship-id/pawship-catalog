import Product from "@/lib/models/Product";
import dbConnect from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "10");

    // If query is empty, return empty results
    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Search products by name using regex (case-insensitive)
    let products = await Product.find({
      productName: { $regex: query, $options: "i" },
      deleted: { $ne: true },
    })
      .select("_id productName slug productMedia categoryDetail tags")
      .populate([
        {
          path: "productVariantsData",
          select: "_id variantName price discountPrice",
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
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.log(error, "function GET /api/public/search/route.ts");

    return NextResponse.json(
      { success: false, message: "Failed to search products" },
      { status: 400 },
    );
  }
}
