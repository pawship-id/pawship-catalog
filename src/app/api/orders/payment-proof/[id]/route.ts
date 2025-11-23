import Order from "@/lib/models/Order";
import dbConnect from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface Context {
  params: Promise<{ id: string }>;
}

// POST: Upload payment proof
export async function POST(req: NextRequest, { params }: Context) {
  await dbConnect();
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const formData = await req.formData();

    const file = formData.get("file") as File;
    const note = formData.get("note") as string;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    // Get current order
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Check if user owns this order or is admin
    if (order.userId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized to upload proof for this order",
        },
        { status: 403 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64File = buffer.toString("base64");
    const dataURI = `data:${file.type};base64,${base64File}`;

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(dataURI, {
      folder: "pawship/payment-proofs",
      resource_type: "auto",
    });

    // Add payment proof to order
    const newPaymentProof = {
      imageUrl: uploadResponse.secure_url,
      imagePublicId: uploadResponse.public_id,
      note: note || "",
      uploadedAt: new Date(),
      uploadedBy: session.user.name || session.user.email || "User",
    };

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        $push: { paymentProofs: newPaymentProof },
      },
      { new: true }
    );

    return NextResponse.json(
      {
        success: true,
        data: updatedOrder,
        message: "Payment proof uploaded successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log(error, "function POST /api/orders/payment-proof/[id]/route.ts");

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to upload payment proof",
      },
      { status: 400 }
    );
  }
}

// DELETE: Remove payment proof
export async function DELETE(req: NextRequest, { params }: Context) {
  await dbConnect();
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin only." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const imagePublicId = searchParams.get("imagePublicId");

    if (!imagePublicId) {
      return NextResponse.json(
        { success: false, message: "Image public ID is required" },
        { status: 400 }
      );
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(imagePublicId);

    // Remove from order
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        $pull: { paymentProofs: { imagePublicId } },
      },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: updatedOrder,
        message: "Payment proof deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log(
      error,
      "function DELETE /api/orders/payment-proof/[id]/route.ts"
    );

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete payment proof",
      },
      { status: 400 }
    );
  }
}
