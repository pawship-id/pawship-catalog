import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Banner from "@/lib/models/Banner";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface Context {
  params: Promise<{ id: string }>;
}

// PATCH - Update banner status (active/inactive)
export async function PATCH(req: NextRequest, { params }: Context) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const { id } = await params;
    const { isActive } = await req.json();

    // Validate isActive is boolean
    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { success: false, message: "isActive must be a boolean value" },
        { status: 400 }
      );
    }

    // Find and update banner
    const banner = await Banner.findById(id);

    if (!banner) {
      return NextResponse.json(
        { success: false, message: "Banner not found" },
        { status: 404 }
      );
    }

    // Update only the isActive field
    banner.isActive = isActive;
    await banner.save();

    return NextResponse.json(
      {
        success: true,
        data: banner,
        message: `Banner ${isActive ? "activated" : "deactivated"} successfully`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating banner status:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update banner status",
      },
      { status: 500 }
    );
  }
}
