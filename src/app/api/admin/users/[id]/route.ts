import User from "@/lib/models/User";
import dbConnect from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

interface Context {
  params: Promise<{ id: string }>;
}

// GET: read user by ID
export async function GET(req: NextRequest, { params }: Context) {
  await dbConnect();
  try {
    const { id } = await params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: user, message: "Data user has been fetch" },
      { status: 200 }
    );
  } catch (error) {
    console.log(error, "function GET /api/users/[id]/route.ts");

    return NextResponse.json(
      { success: false, message: "Failed to fetch user by ID" },
      { status: 400 }
    );
  }
}

// PUT/PATCH: update user by ID
export async function PUT(req: NextRequest, { params }: Context) {
  await dbConnect();
  try {
    const { id } = await params;

    const body = await req.json();

    const user = await User.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

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
        message: `User with email ${user.email} successfully updated`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log(error, "function PUT /api/users/[id]/route.ts");

    let errorMsg: string | string[];

    if (error.name === "ValidationError") {
      errorMsg = Object.values(error.errors).map((err: any) => err.message);
    } else if (error.name === "MongooseError") {
      errorMsg = error.message;
    } else {
      errorMsg = "Failed to update user";
    }

    return NextResponse.json(
      { success: false, message: errorMsg },
      { status: 400 }
    );
  }
}

// PATCH: update status deleted user by ID
export async function PATCH(req: NextRequest, { params }: Context) {
  await dbConnect();
  try {
    const { id } = await params;

    const deletedUser = await User.findByIdAndUpdate(
      id,
      {
        deleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (deletedUser.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: deletedUser,
        message: `User with email ${deletedUser.email} successfully deleted`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error, "function PATCH /api/users/[id]/route.ts");

    return NextResponse.json(
      { success: false, message: "Failed to delete user" },
      { status: 400 }
    );
  }
}
