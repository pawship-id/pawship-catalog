import Order from "@/lib/models/Order";
import dbConnect from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST: Upload payment proof from public (without login required)
export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;
    const orderInvoice = formData.get("orderInvoice") as string;
    const note = formData.get("note") as string;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // If orderInvoice provided, try to find the order
    let order = null;
    if (orderInvoice && orderInvoice.trim() !== "") {
      order = await Order.findOne({ invoiceNumber: orderInvoice.trim() });
      
      if (!order) {
        return NextResponse.json(
          {
            success: false,
            message: `Order with invoice number "${orderInvoice}" not found. Please check your invoice number or contact support.`,
          },
          { status: 404 }
        );
      }
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64File = buffer.toString("base64");
    const dataURI = `data:${file.type};base64,${base64File}`;

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(dataURI, {
      folder: "pawship/payment-proofs/public",
      resource_type: "auto",
    });

    // Create payment proof object
    const newPaymentProof = {
      imageUrl: uploadResponse.secure_url,
      imagePublicId: uploadResponse.public_id,
      orderInvoice: orderInvoice || undefined,
      note: note || "",
      uploadedAt: new Date(),
      uploadedBy: "Public Upload",
    };

    // If order found, add payment proof to the order
    if (order) {
      const updatedOrder = await Order.findByIdAndUpdate(
        order._id,
        {
          $push: { paymentProofs: newPaymentProof },
        },
        { new: true }
      );

      return NextResponse.json(
        {
          success: true,
          data: updatedOrder,
          message: `Payment proof uploaded successfully and linked to order ${orderInvoice}`,
        },
        { status: 200 }
      );
    }

    // If no order found or no invoice provided, just confirm receipt
    // Admin will manually link it later
    return NextResponse.json(
      {
        success: true,
        data: {
          imageUrl: uploadResponse.secure_url,
          orderInvoice: orderInvoice || "Not provided",
          note: note || "No note",
        },
        message:
          "Payment proof received. Our team will verify and update your order status soon. Please keep your invoice number for reference.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error uploading payment proof:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to upload payment proof",
      },
      { status: 500 }
    );
  }
}
