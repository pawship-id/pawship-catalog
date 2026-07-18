import Order from "@/lib/models/Order";
import dbConnect from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { calculateOrderRevenue } from "@/lib/helpers/currency-helper";

interface Context {
  params: Promise<{ id: string }>;
}

/**
 * PATCH: override the snapshotted `baseRupiah` of a single order.
 *
 * Dedicated endpoint that ONLY touches the rate and the fields derived from it:
 * - on the FIRST override, keeps the rate the order was placed with in
 *   `snapshoot_baserupiah`; later overrides leave that snapshot untouched,
 * - replaces `baseRupiah` with the admin-supplied value,
 * - recalculates `grossRevenue` / `netRevenue` in IDR from the new rate.
 *
 * Order items, totals, shipping and status are left untouched.
 */
export async function PATCH(req: NextRequest, { params }: Context) {
  await dbConnect();
  try {
    // Only admins may override a recorded rate
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const newBaseRupiah = Number(body.baseRupiah);
    if (!Number.isFinite(newBaseRupiah) || newBaseRupiah <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Base rupiah must be a number greater than 0",
        },
        { status: 400 }
      );
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Recalculate the IDR revenue with the new rate. Everything that feeds the
    // calculation (items, totals, shipping) stays exactly as it was.
    const { grossRevenue, netRevenue } = calculateOrderRevenue({
      orderDetails: order.orderDetails,
      currency: order.currency,
      totalAmount: order.totalAmount,
      shippingCost: order.shippingCost,
      discountShipping: order.discountShipping,
      baseRupiah: newBaseRupiah,
    });

    // Snapshot only on the FIRST override, so `snapshoot_baserupiah` always keeps
    // the rupiah rate the order was placed with — no matter how many times the
    // rate is corrected afterwards. Later overrides only move `baseRupiah`.
    if (
      order.snapshoot_baserupiah == null &&
      typeof order.baseRupiah === "number"
    ) {
      order.snapshoot_baserupiah = order.baseRupiah;
    }
    order.baseRupiah = newBaseRupiah;
    order.grossRevenue = grossRevenue;
    order.netRevenue = netRevenue;

    await order.save();

    return NextResponse.json(
      {
        success: true,
        data: order,
        message: "Base rupiah has been overridden successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(
      error,
      "function PATCH /api/admin/orders/override-base-rupiah/[id]/route.ts"
    );

    return NextResponse.json(
      { success: false, message: "Failed to override base rupiah" },
      { status: 400 }
    );
  }
}
