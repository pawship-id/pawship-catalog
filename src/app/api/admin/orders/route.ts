import Order from "@/lib/models/Order";
import ProductVariant from "@/lib/models/ProductVariant";
import dbConnect from "@/lib/mongodb";
import { OrderForm } from "@/lib/types/order";
import { NextRequest, NextResponse } from "next/server";
import { generateInvoiceNumber } from "@/lib/helpers/invoice";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { calculateRevenueInIDR } from "@/lib/helpers/currency-helper";

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 },
      );
    }

    const body: OrderForm = await req.json();

    // Calculate revenue in IDR before saving to database
    const revenue = calculateRevenueInIDR(
      body.totalAmount,
      body.shippingCost,
      body.currency,
    );

    // NOTE: For admin-created orders, use customerId from body if provided
    // Otherwise fall back to session user ID (for backward compatibility)
    const userIdForOrder = (body as any).userId || session.user.id;

    // Add userId from session and revenue
    const orderData = {
      ...body,
      userId: userIdForOrder,
      revenue,
      discountShipping: body.discountShipping || 0, // Set default 0 if not provided
    };

    // Generate unique invoice number based on shipping address country
    const invoiceNumber = await generateInvoiceNumber(
      body.shippingAddress.country,
    );
    orderData.invoiceNumber = invoiceNumber;

    // Initialize status log with first entry
    (orderData as any).statusLog = [
      {
        status: body.status || "pending confirmation",
        date: new Date(),
        username: session.user.name || session.user.email || "User",
      },
    ];

    // Initialize empty payment proofs array
    (orderData as any).paymentProofs = [];

    // orderData.orderDetails.forEach((el: IOrderDetail) => {
    //   delete el.stock;
    // });

    const order = await Order.create(orderData);

    for (const detail of order.orderDetails) {
      const variantProduct = await ProductVariant.findById(detail.variantId);
      if (variantProduct) {
        variantProduct.stock = Math.max(
          0,
          variantProduct.stock - detail.quantity,
        );
        await variantProduct.save();
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: order,
        message: `Order successfully created`,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.log(error, "function POST /api/public/orders/route.ts");

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
      { status: 400 },
    );
  }
}

// GET: read all orders
export async function GET() {
  await dbConnect();

  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        data: orders,
        message: "Data orders has been fetch",
      },
      { status: 200 },
    );
  } catch (error) {
    console.log(error, "function GET /api/admin/orders/route.ts");

    return NextResponse.json(
      { success: false, message: "Failed to retrieve orders data" },
      { status: 500 },
    );
  }
}
