import Order from "@/lib/models/Order";
import dbConnect from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

interface Context {
  params: Promise<{ id: string }>;
}

// PATCH: update status deleted user by ID
export async function PATCH(req: NextRequest, { params }: Context) {
  await dbConnect();
  try {
    const { id } = await params;

    const body = await req.json();

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        status: body.status,
      },
      { new: true }
    );

    if (updatedOrder.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: updatedOrder,
        message: `Order ${updatedOrder.invoiceNumber} status updated to ${body.status}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(
      error,
      "function PATCH /api/admin/orders/update-status/[id]/route.ts"
    );

    return NextResponse.json(
      { success: false, message: "Failed to update status order" },
      { status: 400 }
    );
  }
}
