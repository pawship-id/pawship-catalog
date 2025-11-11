import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import BackInStockLog from "@/lib/models/BackInStockLog";
import Product from "@/lib/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import User from "@/lib/models/User";
import ResellerCategory from "@/lib/models/ResellerCategory";

// GET - Fetch back in stock products (last 30 days, distinct by productId and variantId)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Get session to check if user is reseller
    const session = await getServerSession(authOptions);
    const isReseller = session?.user?.role === "reseller";

    let resellerTierDiscount = {
      currency: "",
      tiers: [],
    };

    // If user is reseller, fetch their tier discount from ResellerCategory
    if (isReseller && session?.user?.id) {
      const user: any = await User.findById(session.user.id)
        .populate("resellerCategoryId")
        .lean();

      if (user?.resellerCategoryId) {
        const resellerCategory = user.resellerCategoryId as any;
        resellerTierDiscount.tiers = resellerCategory.tierDiscount || null;
        resellerTierDiscount.currency = user.currency;
      }
    }

    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch logs from last 30 days with distinct productId and variantId
    const backInStockLogs = await BackInStockLog.aggregate([
      {
        // Filter: only logs from last 30 days
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          // Only show items that actually restocked (newStock > oldStock)
          $expr: { $gt: ["$newStock", "$oldStock"] },
        },
      },
      {
        // Sort by createdAt descending to get latest update first
        $sort: { createdAt: -1 },
      },
      {
        // Group by productId and variantId to get distinct combinations
        $group: {
          _id: {
            productId: "$productId",
            variantId: "$variantId",
          },
          productId: { $first: "$productId" },
          variantId: { $first: "$variantId" },
          sku: { $first: "$sku" },
          oldStock: { $first: "$oldStock" },
          newStock: { $first: "$newStock" },
          updatedBy: { $first: "$updatedBy" },
          createdAt: { $first: "$createdAt" },
        },
      },
      {
        // Sort again after grouping
        $sort: { createdAt: -1 },
      },
    ]);

    // Extract unique product IDs
    const productIds = backInStockLogs.map((log) => log.productId);

    // Fetch full product details
    const products = await Product.find({
      _id: { $in: productIds },
    })
      .populate([
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
      ])
      .lean();

    // Map products with back in stock info and reseller pricing
    const enrichedProducts = products.map((product: any) => {
      // Find corresponding log entry
      const logEntry = backInStockLogs.find(
        (log) => log.productId.toString() === product._id.toString()
      );

      // Add reseller pricing if user is reseller
      let resellerPricing = null;
      if (isReseller && resellerTierDiscount.tiers.length) {
        // Filter tier discount based on product's categoryId
        const applicableTiers = resellerTierDiscount.tiers.filter(
          (tier: any) => {
            if (Array.isArray(tier.categoryProduct)) {
              return tier.categoryProduct.some(
                (catId: string) =>
                  catId.toString() === product.categoryId?.toString()
              );
            }
            return (
              tier.categoryProduct?.toString() ===
              product.categoryId?.toString()
            );
          }
        );

        resellerPricing = {
          currency: resellerTierDiscount.currency,
          tiers: applicableTiers,
        };
      }

      return {
        ...product,
        backInStockInfo: {
          variantId: logEntry?.variantId,
          sku: logEntry?.sku,
          oldStock: logEntry?.oldStock,
          newStock: logEntry?.newStock,
          restockedAt: logEntry?.createdAt,
        },
        resellerPricing,
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: enrichedProducts.slice(0, 21), // limit 20 products
        message: "Back in stock products fetched successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching back in stock products:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch back in stock products",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
