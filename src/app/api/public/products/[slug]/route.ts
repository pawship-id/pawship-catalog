import Product from "@/lib/models/Product";
import dbConnect from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import User from "@/lib/models/User";

interface Context {
  params: Promise<{ slug: string }>;
}

// GET: read product by ID
export async function GET(req: NextRequest, { params }: Context) {
  await dbConnect();
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);

    console.log(session?.user.id);
    if (!session) {
      return NextResponse.json(
        {
          success: true,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    let product = await Product.findOne({ slug }).populate([
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

    const user = await User.findById({ _id: session.user.id }).populate({
      path: "resellerSchema",
    });

    console.log(user.resellerSchema, "<<<<");

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
    console.log(error, "function GET /api/public/products/[slug]/route.ts");

    return NextResponse.json(
      { success: false, message: "Failed to fetch product by ID" },
      { status: 400 }
    );
  }
}
