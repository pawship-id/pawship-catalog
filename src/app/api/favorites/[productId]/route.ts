import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Favorite from "@/lib/models/Favorite";

interface Context {
  params: Promise<{ productId: string }>;
}

// GET - Check if a product is favorited by the user
export async function GET(req: NextRequest, { params }: Context) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: true, isFavorite: false },
        { status: 200 }
      );
    }

    await dbConnect();
    const { productId } = await params;

    const favorite = await Favorite.findOne({
      userId: session.user.id,
      productId: productId,
    });

    return NextResponse.json({
      success: true,
      isFavorite: !!favorite,
    });
  } catch (error: any) {
    console.error("Error checking favorite:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
