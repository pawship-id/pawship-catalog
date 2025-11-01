import Product from "@/lib/models/Product";
import dbConnect from "@/lib/mongodb";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
interface Context {
  params: Promise<{ id: string }>;
}

// GET: read category by ID
export async function GET(req: NextRequest, { params }: Context) {
  await dbConnect();
  try {
    const identifier = (await params).id;

    let product;

    if (isValidObjectId(identifier)) {
      product = await Product.findById(identifier); // by ID
    } else {
      product = await Product.findOne({ slug: identifier }); // by Slug
    }

    if (product) {
      product = await product.populate([
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
      ]);
    }

    // const categoryObject = product.categoryId;

    // delete product.categoryId;

    // product.category = categoryObject;

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: product,
        message: "Data product has been fetch",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error, "function GET /api/admin/products/[id]/route.ts");

    return NextResponse.json(
      { success: false, message: "Failed to fetch product by ID" },
      { status: 400 }
    );
  }
}
