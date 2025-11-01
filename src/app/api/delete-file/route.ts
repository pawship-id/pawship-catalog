import { deleteFileFromCloudinary } from "@/lib/helpers/cloudinary";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.publicId) {
      return NextResponse.json(
        { success: false, message: "Missing publicId in request body." },
        { status: 400 }
      );
    }

    await deleteFileFromCloudinary(body.publicId);

    return NextResponse.json(
      {
        success: true,
        message: `Delete file successfully`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error, "function POST /api/delet-file/route.ts");

    return NextResponse.json(
      { success: false, message: "Internal Server Error." },
      { status: 500 }
    );
  }
}
