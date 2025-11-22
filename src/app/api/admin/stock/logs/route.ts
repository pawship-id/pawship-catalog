import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import BackInStockLog from "@/lib/models/BackInStockLog";

/**
 * GET /api/admin/stock/logs
 *
 * Endpoint untuk get history stock updates
 * Support filtering dan pagination
 *
 * Query Params:
 * - page: number (default: 1)
 * - limit: number (default: 50)
 * - sku: string (optional - filter by SKU)
 * - startDate: string (optional - ISO date)
 * - endDate: string (optional - ISO date)
 */
export async function GET(req: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Admin access required",
        },
        { status: 401 }
      );
    }

    // Database connection
    await dbConnect();

    // Extract query params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const sku = searchParams.get("sku");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build query filter
    const filter: any = {};

    if (sku) {
      filter.sku = { $regex: sku, $options: "i" }; // Case-insensitive search
    }

    if (startDate || endDate) {
      filter.updatedAt = {};
      if (startDate) {
        filter.updatedAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.updatedAt.$lte = new Date(endDate);
      }
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Get logs with pagination
    const logs = await BackInStockLog.find(filter)
      .populate("product", "productName slug") // Populate product name
      .populate("variantProduct", "name sku") // Populate variant name
      .sort({ updatedAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalCount = await BackInStockLog.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json(
      {
        success: true,
        data: logs,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        message: "Stock logs fetched successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching stock logs:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch stock logs",
      },
      { status: 500 }
    );
  }
}
