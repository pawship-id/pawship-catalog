import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Favorite from "@/lib/models/Favorite";

// GET - Get all favorites for the logged-in user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const favorites = await Favorite.find({ userId: session.user.id })
      .populate({
        path: "productId",
        populate: [
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
        ],
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: favorites,
    });
  } catch (error: any) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST - Toggle favorite (add or remove)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if favorite already exists
    const existingFavorite = await Favorite.findOne({
      userId: session.user.id,
      productId,
    });

    if (existingFavorite) {
      // Remove from favorites
      await Favorite.deleteOne({ _id: existingFavorite._id });
      return NextResponse.json({
        success: true,
        message: "Removed from favorites",
        isFavorite: false,
      });
    } else {
      // Add to favorites
      await Favorite.create({
        userId: session.user.id,
        productId,
      });
      return NextResponse.json({
        success: true,
        message: "Added to favorites",
        isFavorite: true,
      });
    }
  } catch (error: any) {
    console.error("Error toggling favorite:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
