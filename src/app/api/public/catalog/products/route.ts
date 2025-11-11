import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import Collection from "@/lib/models/Collection";
import { isNewArrival } from "@/lib/helpers/product";
import Category from "@/lib/models/Category";

// GET - Fetch products for catalog page with various filters
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter"); // e.g., "new-arrivals"
    const categorySlug = searchParams.get("category");
    const collectionSlug = searchParams.get("collection");

    let products: any[] = [];
    let pageTitle = "All Products";
    let pageDescription = "Browse our complete collection";

    // Handle different filter types
    if (filter === "new-arrivals") {
      // Fetch new arrivals (products created <= 30 days ago)
      const allProducts = await Product.find()
        .populate("productVariantsData")
        .populate({
          path: "categoryDetail",
          select: "_id name",
        })
        .populate("tags")
        .sort({ createdAt: -1 })
        .lean();

      products = allProducts.filter((product) =>
        isNewArrival(product.createdAt)
      );

      pageTitle = "New Arrivals";
      pageDescription = "Check out our latest products";
    } else if (categorySlug) {
      const findCategory = await Category.findOne({ slug: categorySlug });

      if (!findCategory) {
        return NextResponse.json(
          {
            success: false,
            message: "Category not found",
          },
          { status: 404 }
        );
      }

      // Fetch products by category
      products = await Product.find({
        categoryId: findCategory._id,
      })
        .populate("productVariantsData")
        .populate("categoryId")
        .populate("tags")
        .sort({ createdAt: -1 })
        .lean();

      // Get category name for title
      if (products.length > 0 && products[0].categoryId) {
        const categoryName = (products[0].categoryId as any).name || "Category";
        pageTitle = categoryName;
        pageDescription = `Browse products in ${categoryName}`;
      }
    } else if (collectionSlug) {
      // Fetch products by collection
      const collection = await Collection.findOne({ slug: collectionSlug });

      if (!collection) {
        return NextResponse.json(
          {
            success: false,
            message: "Collection not found",
          },
          { status: 404 }
        );
      }

      // Fetch products based on collection rules
      if (collection.rules === "category") {
        products = await Product.find({
          categoryId: { $in: collection.ruleIds },
        })
          .populate("productVariantsData")
          .populate({
            path: "categoryDetail",
            select: "_id name",
          })
          .populate("tags")
          .sort({ createdAt: -1 })
          .lean();
      } else if (collection.rules === "tag") {
        products = await Product.find({
          tags: { $in: collection.ruleIds },
        })
          .populate("productVariantsData")
          .populate({
            path: "categoryDetail",
            select: "_id name",
          })
          .populate("tags")
          .sort({ createdAt: -1 })
          .lean();
      } else if (collection.rules === "custom") {
        products = await Product.find({
          _id: { $in: collection.ruleIds },
        })
          .populate("productVariantsData")
          .populate({
            path: "categoryDetail",
            select: "_id name",
          })
          .populate("tags")
          .lean();
      }

      pageTitle = collection.name;
      pageDescription = `Browse products in ${collection.name} collection`;

      // Add collection banner images to response
      return NextResponse.json(
        {
          success: true,
          data: {
            products,
            pageTitle,
            pageDescription,
            banner: {
              desktop: collection.desktopImageUrl,
              mobile: collection.mobileImageUrl || collection.desktopImageUrl,
            },
          },
          message: "Products fetched successfully",
        },
        { status: 200 }
      );
    } else {
      // Default: Fetch all products
      products = await Product.find()
        .populate("productVariantsData")
        .populate({
          path: "categoryDetail",
          select: "_id name",
        })
        .populate("tags")
        .sort({ createdAt: -1 })
        .lean();

      pageTitle = "All Products";
      pageDescription = "Browse our complete collection";
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          products,
          pageTitle,
          pageDescription,
        },
        message: "Products fetched successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching catalog products:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}
