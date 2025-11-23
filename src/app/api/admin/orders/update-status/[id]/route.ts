import Order from "@/lib/models/Order";
import dbConnect from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface Context {
  params: Promise<{ id: string }>;
}

// PATCH: update status deleted user by ID
export async function PATCH(req: NextRequest, { params }: Context) {
  await dbConnect();
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    // Get current order to access statusLog
    const currentOrder = await Order.findById(id);
    if (!currentOrder) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Add new status to statusLog
    const newStatusLog = {
      status: body.status,
      date: new Date(),
      username: session.user.name || session.user.email || "Admin",
    };

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        status: body.status,
        $push: { statusLog: newStatusLog },
      },
      { new: true }
    );

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
