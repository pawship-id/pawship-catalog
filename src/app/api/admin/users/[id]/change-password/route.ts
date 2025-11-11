import User from "@/lib/models/User";
import dbConnect from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

interface Context {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: Context) {
  await dbConnect();

  try {
    const { id } = await params;
    const body = await req.json();

    const { newPassword, confirmNewPassword } = body;

    // Validation
    if (!newPassword || !confirmNewPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "New password and confirmation are required",
        },
        { status: 400 }
      );
    }

    if (newPassword !== confirmNewPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Passwords do not match",
        },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters long",
        },
        { status: 400 }
      );
    }

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password directly using updateOne to bypass pre-save validation
    await User.updateOne({ _id: id }, { $set: { password: hashedPassword } });

    return NextResponse.json(
      {
        success: true,
        message: "Password updated successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log(
      error,
      "function PUT /api/admin/users/[id]/change-password/route.ts"
    );

    let errorMsg: string | string[];

    if (error.name === "ValidationError") {
      errorMsg = Object.values(error.errors).map((err: any) => err.message);
    } else if (error.name === "MongooseError") {
      errorMsg = error.message;
    } else {
      errorMsg = "Failed to update password";
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
