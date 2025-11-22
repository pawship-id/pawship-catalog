import Product from "@/lib/models/Product";
import dbConnect from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import User from "@/lib/models/User";

interface Context {
  params: Promise<{ slug: string }>;
}

// GET: read product by ID
export async function GET(req: NextRequest, { params }: Context) {
  await dbConnect();
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);

    // Determine if the param is a valid MongoDB ObjectId or a slug
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug);

    let product = await Product.findOne(isObjectId ? { _id: slug } : { slug })
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
          select: "_id name",
        },
      ])
      .lean();

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Initialize variables for reseller discount
    let applicableTierDiscounts: any[] = [];
    let resellerInfo = null;

    // Check if user is logged in and has reseller schema
    if (session) {
      const user = await User.findById(session.user.id).populate({
        path: "resellerSchema",
      });

      if (user && user.resellerSchema) {
        resellerInfo = user.resellerSchema;

        // Get product category ID
        const productCategoryId = (
          product as any
        ).categoryDetail?._id?.toString();

        if (productCategoryId && resellerInfo.tierDiscount) {
          // Filter tier discounts that include this product's category
          applicableTierDiscounts = resellerInfo.tierDiscount.filter(
            (tier: any) => {
              // Check if categoryProduct is an array or string
              if (Array.isArray(tier.categoryProduct)) {
                // Check if the array includes the product's category
                return tier.categoryProduct.some(
                  (catId: string) => catId.toString() === productCategoryId
                );
              } else if (tier.categoryProduct) {
                // If it's a string, do direct comparison
                return tier.categoryProduct.toString() === productCategoryId;
              }
              return false;
            }
          );

          // Sort by minimum quantity (ascending) for easier tier selection
          applicableTierDiscounts.sort(
            (a, b) => (a.minimumQuantity || 0) - (b.minimumQuantity || 0)
          );

          console.log("Product Category:", productCategoryId);
          console.log("Applicable Tier Discounts:", applicableTierDiscounts);
        }
      }
    }

    // Convert Map to plain object for attrs in productVariantsData
    const productData = product as any;
    if (
      productData.productVariantsData &&
      Array.isArray(productData.productVariantsData)
    ) {
      productData.productVariantsData = productData.productVariantsData.map(
        (variant: any) => {
          if (variant.attrs && typeof variant.attrs === "object") {
            // If attrs is a Map, convert to plain object
            const attrsObj =
              variant.attrs instanceof Map
                ? Object.fromEntries(variant.attrs)
                : { ...variant.attrs };
            return { ...variant, attrs: attrsObj };
          }
          return variant;
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          ...productData,
          // Add reseller pricing info if available
          resellerPricing:
            applicableTierDiscounts.length > 0
              ? {
                  currency: resellerInfo?.currency,
                  tiers: applicableTierDiscounts,
                }
              : null,
        },
        message: "Data product has been fetch",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error, "function GET /api/public/products/[slug]/route.ts");

    return NextResponse.json(
      { success: false, message: "Failed to fetch product by ID" },
      { status: 400 }
    );
  }
}
