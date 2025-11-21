import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import Order from "@/lib/models/Order";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all";
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    // Calculate date range based on filter
    let dateFilter: { $gte?: Date; $lte?: Date } | undefined;
    const now = new Date();

    if (filter === "custom" && fromParam && toParam) {
      // Custom date range
      dateFilter = {
        $gte: new Date(fromParam),
        $lte: new Date(toParam),
      };
    } else {
      // Predefined filters
      let startDate: Date | undefined;

      switch (filter) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case "week":
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "month":
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case "year":
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = undefined;
      }

      if (startDate) {
        dateFilter = { $gte: startDate };
      }
    }

    // Build query for orders
    const orderQuery: any = {};
    if (dateFilter) {
      orderQuery.createdAt = dateFilter;
    }

    // Get total products count
    const totalProducts = await Product.countDocuments({ status: "active" });

    // Get orders data
    const orders = await Order.find(orderQuery).select("status totalAmount");

    // Calculate total revenue (from awaiting payment, payment confirmed, processing, and shipped orders)
    const totalRevenue = orders
      .filter(
        (order) =>
          order.status === "awaiting payment" ||
          order.status === "payment confirmed" ||
          order.status === "processing" ||
          order.status === "shipped"
      )
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Count orders by status
    const ordersByStatus = {
      pending_confirmation: 0,
      awaiting_payment: 0,
      payment_confirmed: 0,
      processing: 0,
      shipped: 0,
    };

    orders.forEach((order) => {
      // Map status with spaces to underscores for consistency
      const status = order.status.replace(
        / /g,
        "_"
      ) as keyof typeof ordersByStatus;
      if (status in ordersByStatus) {
        ordersByStatus[status]++;
      }
    });

    const totalOrders = orders.length;

    return NextResponse.json({
      success: true,
      data: {
        totalProducts,
        totalRevenue,
        totalOrders,
        ordersByStatus,
      },
    });
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch dashboard statistics",
      },
      { status: 500 }
    );
  }
}
