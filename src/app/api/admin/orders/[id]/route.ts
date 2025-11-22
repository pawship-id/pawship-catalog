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
    const { id } = await params;

    let order = await Order.findById(id);

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
    console.log(error, "function GET /api/admin/orders/[id]/route.ts");

    return NextResponse.json(
      { success: false, message: "Failed to fetch order by ID" },
      { status: 400 }
    );
  }
}

// PUT: update order by ID
export async function PUT(req: NextRequest, { params }: Context) {
  await dbConnect();
  try {
    const { id } = await params;
    const body = await req.json();

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        status: body.status,
        shippingCost: body.shippingCost,
        shippingAddress: body.shippingAddress,
        orderDetails: body.orderDetails,
        totalAmount: body.totalAmount,
      },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: updatedOrder,
        message: "Order has been updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error, "function PUT /api/admin/orders/[id]/route.ts");

    return NextResponse.json(
      { success: false, message: "Failed to update order" },
      { status: 400 }
    );
  }
}
