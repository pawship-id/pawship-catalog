import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import Collection from "@/lib/models/Collection";
import { isNewArrival } from "@/lib/helpers/product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import User from "@/lib/models/User";
import ResellerCategory from "@/lib/models/ResellerCategory";

// GET - Fetch products for homepage slider with collections
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

    // Fetch all products (max 20 for All tab)
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
      .limit(20)
      .lean();

    // Add resellerPricing if user is reseller
    const enrichedAllProducts =
      isReseller && resellerTierDiscount.tiers.length
        ? allProducts.map((product: any) => {
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
          })
        : allProducts;

    // Fetch new arrivals (products created <= 30 days ago, max 20)
    const allProductsForNewArrivals = await Product.find()
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

    const newArrivals = allProductsForNewArrivals
      .filter((product) => isNewArrival(product.createdAt))
      .slice(0, 20);

    // Add resellerPricing if user is reseller
    const enrichedNewArrivals =
      isReseller && resellerTierDiscount.tiers.length
        ? newArrivals.map((product: any) => {
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
          })
        : newArrivals;

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
            .limit(20)
            .lean();
        } else if (collection.rules === "tag") {
          // Find products by tag IDs (tags is an array field)
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
            .limit(20)
            .lean();
        } else if (collection.rules === "custom") {
          // Find products by specific product IDs
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

        // Add resellerPricing if user is reseller
        const enrichedProducts =
          isReseller && resellerTierDiscount.tiers.length
            ? products.slice(0, 20).map((product: any) => {
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
              })
            : products.slice(0, 20);

        return {
          _id: collection._id,
          name: collection.name,
          rules: collection.rules,
          products: enrichedProducts,
          slug: collection.slug || "",
        };
      })
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          allProducts: enrichedAllProducts,
          newArrivals: enrichedNewArrivals,
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
