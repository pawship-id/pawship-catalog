import Order from "@/lib/models/Order";
import dbConnect from "@/lib/mongodb";
import { NextResponse } from "next/server";

// GET: read all orders
export async function GET() {
  await dbConnect();

  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        data: orders,
        message: "Data orders has been fetch",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error, "function GET /api/admin/orders/route.ts");

    return NextResponse.json(
      { success: false, message: "Failed to retrieve orders data" },
      { status: 500 }
    );
  }
}
