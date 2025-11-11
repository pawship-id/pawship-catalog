import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import Collection from "@/lib/models/Collection";
import { isNewArrival } from "@/lib/helpers/product";

// GET - Fetch products for homepage slider with collections
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Fetch all products (max 20 for All tab)
    const allProducts = await Product.find()
      .populate("productVariantsData")
      .populate("categoryId")
      .populate("tags")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // Fetch new arrivals (products created <= 30 days ago, max 20)
    const allProductsForNewArrivals = await Product.find()
      .populate("productVariantsData")
      .populate("categoryId")
      .populate("tags")
      .sort({ createdAt: -1 })
      .lean();

    const newArrivals = allProductsForNewArrivals
      .filter((product) => isNewArrival(product.createdAt))
      .slice(0, 20);

    // Fetch collections that should display on homepage
    const collections = await Collection.find({
      displayOnHomepage: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    // For each collection, fetch products based on its rules
    const collectionsWithProducts = await Promise.all(
      collections.map(async (collection) => {
        let products: any[] = [];

        if (collection.rules === "category") {
          // Find products by category IDs
          products = await Product.find({
            categoryId: { $in: collection.ruleIds },
          })
            .populate("productVariantsData")
            .populate("categoryId")
            .populate("tags")
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();
        } else if (collection.rules === "tag") {
          // Find products by tag IDs (tags is an array field)
          products = await Product.find({
            tags: { $in: collection.ruleIds },
          })
            .populate("productVariantsData")
            .populate("categoryId")
            .populate("tags")
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();
        } else if (collection.rules === "custom") {
          // Find products by specific product IDs
          products = await Product.find({
            _id: { $in: collection.ruleIds },
          })
            .populate("productVariantsData")
            .populate("categoryId")
            .populate("tags")
            .lean();
        }

        return {
          _id: collection._id,
          name: collection.name,
          rules: collection.rules,
          products: products.slice(0, 20), // Limit to 20 products
          slug: collection.slug || "",
        };
      })
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          allProducts,
          newArrivals,
          collections: collectionsWithProducts,
        },
        message: "Products and collections fetched successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching homepage products:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch homepage products",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
