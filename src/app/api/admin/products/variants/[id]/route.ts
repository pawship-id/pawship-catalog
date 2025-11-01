import ProductVariant from "@/lib/models/ProductVariant";
import dbConnect from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

interface Context {
  params: Promise<{ id: string }>;
}

// GET: read variant product by ID
export async function GET(req: NextRequest, { params }: Context) {
  await dbConnect();
  try {
    const { id } = await params;

    const productVariant = await ProductVariant.findById(id);

    if (!productVariant) {
      return NextResponse.json(
        { success: false, message: "Product variant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: productVariant,
        message: "Data product variant has been fetch",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(
      error,
      "function GET /api/admin/products/variant/[id]/route.ts"
    );

    return NextResponse.json(
      { success: false, message: "Failed to fetch product variant by ID" },
      { status: 400 }
    );
  }
}
