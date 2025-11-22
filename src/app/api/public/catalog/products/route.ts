import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import Collection from "@/lib/models/Collection";
import { isNewArrival } from "@/lib/helpers/product";
import Category from "@/lib/models/Category";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import User from "@/lib/models/User";

// GET - Fetch products for catalog page with various filters
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

    // Helper function to enrich products with reseller pricing
    const enrichProductsWithResellerPricing = (products: any[]) => {
      if (!isReseller || !resellerTierDiscount) {
        return products;
      }

      return products.map((product: any) => {
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

        return {
          ...product,
          resellerPricing: {
            currency: resellerTierDiscount.currency,
            tiers: applicableTiers,
          },
        };
      });
    };

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
        .sort({ createdAt: -1 })
        .lean();

      products = allProducts.filter((product) =>
        isNewArrival(product.createdAt)
      );

      // Enrich with reseller pricing
      products = enrichProductsWithResellerPricing(products);

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
        .sort({ createdAt: -1 })
        .lean();

      // Enrich with reseller pricing
      products = enrichProductsWithResellerPricing(products);

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
          .sort({ createdAt: -1 })
          .lean();
      } else if (collection.rules === "tag") {
        products = await Product.find({
          tags: { $in: collection.ruleIds },
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
          .sort({ createdAt: -1 })
          .lean();
      } else if (collection.rules === "custom") {
        products = await Product.find({
          _id: { $in: collection.ruleIds },
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
      }

      // Enrich with reseller pricing
      products = enrichProductsWithResellerPricing(products);

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

      // Enrich with reseller pricing
      products = enrichProductsWithResellerPricing(products);

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
