import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const user = await User.findById(session.user.id).select("-password");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Get first address if exists
    const address =
      user.addresses && user.addresses.length > 0 ? user.addresses[0] : null;

    return NextResponse.json({
      success: true,
      data: {
        _id: user._id,
        name: user.fullName,
        email: user.email,
        phone: user.phoneNumber,
        role: user.role,
        accountType: user.role === "reseller" ? "B2B" : "B2C",
        businessName: user.resellerProfile?.businessName,
        businessType: user.resellerProfile?.businessType,
        taxId: user.resellerProfile?.taxLegalInfo,
        address: address,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    await dbConnect();

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Update basic fields
    user.fullName = body.name;
    user.phoneNumber = body.phone;

    // Update B2B fields if account type is B2B
    if (body.accountType === "B2B" && user.role === "reseller") {
      if (!user.resellerProfile) {
        user.resellerProfile = {};
      }
      user.resellerProfile.businessName = body.businessName;
      user.resellerProfile.businessType = body.businessType;
      user.resellerProfile.taxLegalInfo = body.taxId;
    }

    // Update address
    if (body.address) {
      if (!user.addresses || user.addresses.length === 0) {
        user.addresses = [body.address];
      } else {
        user.addresses[0] = body.address;
      }
    }

    await user.save({ validateBeforeSave: false });

    const updatedUser = await User.findById(session.user.id).select(
      "-password"
    );

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
