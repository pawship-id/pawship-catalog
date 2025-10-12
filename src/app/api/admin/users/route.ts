import User from "@/lib/models/User";
import dbConnect from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

// GET: read all user
export async function GET() {
  await dbConnect();

  try {
    const users = await User.find({})
      .select("fullName email phoneNumber role deleted")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, data: users, message: "Data users has been fetch" },
      { status: 200 }
    );
  } catch (error) {
    console.log(error, "function GET /api/users/route.ts");

    return NextResponse.json(
      { success: false, message: "Failed to retrieve user data" },
      { status: 500 }
    );
  }
}

// POST: create new user
export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();

    const user = await User.create(body);

    return NextResponse.json(
      {
        success: true,
        data: user,
        message: `User with email ${user.email} successfully created`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.log(error, "function POST /api/users/route.ts");

    let errorMsg: string | string[];

    if (error.name === "ValidationError") {
      errorMsg = Object.values(error.errors).map((err: any) => err.message);
    } else if (error.name === "MongooseError") {
      errorMsg = error.message;
    } else {
      errorMsg = "Failed to create user";
    }

    return NextResponse.json(
      { success: false, message: errorMsg },
      { status: 400 }
    );
  }
}
