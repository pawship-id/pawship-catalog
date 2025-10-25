import Tag from "@/lib/models/Tag";
import dbConnect from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

// GET: read all tag
export async function GET() {
  await dbConnect();

  try {
    const tags = await Tag.find({}).select("tagName").sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, data: tags, message: "Data tags has been fetch" },
      { status: 200 }
    );
  } catch (error) {
    console.log(error, "function GET /api/tags/route.ts");

    return NextResponse.json(
      { success: false, message: "Failed to retrieve tag data" },
      { status: 500 }
    );
  }
}

// POST: create new tag
export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();

    const tags = await Tag.create(body);

    return NextResponse.json(
      {
        success: true,
        data: tags,
        message: `Tag successfully created`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.log(error, "function POST /api/admin/tags/route.ts");

    let errorMsg: string | string[];

    if (error.name === "ValidationError") {
      errorMsg = Object.values(error.errors).map((err: any) => err.message);
    } else if (error.name === "MongooseError") {
      errorMsg = error.message;
    } else {
      errorMsg = "Failed to create product";
    }

    return NextResponse.json(
      { success: false, message: errorMsg },
      { status: 400 }
    );
  }
}
