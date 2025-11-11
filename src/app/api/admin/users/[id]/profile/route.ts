import User from "@/lib/models/User";
import dbConnect from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const { id } = params;
    const body = await req.json();

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Update profile based on role
    if (user.role === "reseller") {
      user.resellerProfile = body.resellerProfile;
    } else if (user.role === "retail") {
      user.retailProfile = body.retailProfile;
    } else {
      return NextResponse.json(
        { success: false, message: "Admin role does not have profile" },
        { status: 400 }
      );
    }

    await user.save();

    return NextResponse.json(
      {
        success: true,
        data: user,
        message: "Profile updated successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log(error, "function PUT /api/admin/users/[id]/profile/route.ts");

    let errorMsg: string | string[];

    if (error.name === "ValidationError") {
      errorMsg = Object.values(error.errors).map((err: any) => err.message);
    } else if (error.name === "MongooseError") {
      errorMsg = error.message;
    } else {
      errorMsg = "Failed to update profile";
    }

    return NextResponse.json(
      {
        success: false,
        message: errorMsg,
      },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const { id } = params;

    const user = await User.findById(id).select(
      "fullName email role resellerProfile retailProfile"
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log(error, "function GET /api/admin/users/[id]/profile/route.ts");

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch user profile",
      },
      { status: 500 }
    );
  }
}
