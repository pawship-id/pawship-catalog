import { uploadFileToCloudinary, UploadResult } from "@/lib/helpers/cloudinary";
import { NextRequest, NextResponse } from "next/server";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // extract data
    const image = formData.get("image") as File | string;
    const folder = formData.get("folder") as string;

    // Validate file size - should not exceed 1MB after compression
    const MAX_COMPRESSED_SIZE = 1 * 1024 * 1024; // 1MB
    if (image instanceof File && image.size > MAX_COMPRESSED_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: `File size exceeds limit. File: ${image.name} (${(image.size / 1024 / 1024).toFixed(2)}MB), Max allowed: 1MB`,
        },
        { status: 400 },
      );
    }

    // upload to cloudinary
    let uploadResult: UploadResult = await uploadFileToCloudinary(
      image,
      folder,
    );

    return NextResponse.json(
      {
        success: true,
        data: uploadResult,
        message: `Upload file successfully`,
      },
      { status: 201 },
    );
  } catch (error) {
    console.log(error, "function POST /api/uploaded-file/route.ts");

    return NextResponse.json(
      { success: false, message: "Internal Server Error." },
      { status: 500 },
    );
  }
}
