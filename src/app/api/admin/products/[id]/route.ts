import Product from "@/lib/models/Product";
import dbConnect from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
interface Context {
  params: Promise<{ id: string }>;
}

// GET: read category by ID
export async function GET(req: NextRequest, { params }: Context) {
  await dbConnect();
  try {
    const { id } = await params;

    const product = await Product.findById(id)
      .populate("productVariantsData")
      .populate({
        path: "categoryDetail",
        select: "name",
      })
      .exec();

    const categoryObject = product.categoryId;

    delete product.categoryId;

    product.category = categoryObject;

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
