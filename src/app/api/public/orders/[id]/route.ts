import Order from "@/lib/models/Order";
import dbConnect from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
interface Context {
  params: Promise<{ id: string }>;
}

// GET: read order by ID
export async function GET(req: NextRequest, { params }: Context) {
  await dbConnect();
  try {
    const identifier = (await params).id;

    let order = await Order.findById(identifier);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: order,
        message: "Data order has been fetch",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error, "function GET /api/public/orders/[id]/route.ts");

    return NextResponse.json(
      { success: false, message: "Failed to fetch order by ID" },
      { status: 400 }
    );
  }
}
