import Order from "@/lib/models/Order";
import ProductVariant from "@/lib/models/ProductVariant";
import dbConnect from "@/lib/mongodb";
import { OrderForm } from "@/lib/types/order";
import { NextRequest, NextResponse } from "next/server";
import { generateInvoiceNumber } from "@/lib/helpers/invoice";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getRateToIDR,
  calculateOrderRevenue,
  normalizeOrderMoney,
} from "@/lib/helpers/currency-helper";
import {
  recordOrderPromotionUsages,
  resolveAppliedPromotions,
} from "@/lib/helpers/promotion-service";
import {
  PROMOTION_CHANNELS,
  type EvaluationCart,
  type PromotionChannel,
} from "@/lib/types/promotion";

/**
 * An order keyed in by an admin is a WhatsApp order unless the request says
 * otherwise (the create screen may be used to record a web order). Unknown
 * values fall back to the default so a bad payload cannot widen eligibility.
 */
function resolveOrderChannel(value: unknown): PromotionChannel {
  return PROMOTION_CHANNELS.includes(value as PromotionChannel)
    ? (value as PromotionChannel)
    : "WHATSAPP";
}

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

    // The street-level address fields are optional on the schema because a
    // pickup order has none, so a delivery order's address is enforced here.
    // Admin-created orders are always deliveries — this form has no pickup
    // option — hence no `isPickup` branch.
    const missingAddress = (
      ["city", "district", "zipCode", "address"] as const
    ).filter((field) => !(body.shippingAddress?.[field] ?? "").trim());

    if (missingAddress.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `A delivery order requires a complete address. Missing: ${missingAddress.join(
            ", ",
          )}`,
        },
        { status: 400 },
      );
    }

    // Round monetary fields to the currency's precision so what is stored is
    // exactly what the UI displays (no 3.8949999 / 1450.8000000000002)
    const { orderDetails, totalAmount } = normalizeOrderMoney(
      body.orderDetails,
      body.currency,
    );

    // NOTE: For admin-created orders the buyer may be supplied in the body.
    const userIdForOrder = (body as any).userId || session.user.id;

    // Re-evaluate promotions server-side from the submitted CODES only — never
    // trust the client's discount numbers. Reject the create if any code is no
    // longer valid (expired / quota exhausted / cart no longer qualifies).
    const evaluationCart: EvaluationCart = {
      items: orderDetails.map((i: any) => ({
        productId: i.productId,
        variantId: i.variantId,
        categoryId: i.categoryId,
        quantity: i.quantity,
        unitPrice:
          (i.discountedPrice?.[body.currency] ??
            i.originalPrice?.[body.currency]) || 0,
        subTotal: i.subTotal,
      })),
      subtotal: totalAmount,
      shippingCost: body.shippingCost || 0,
    };
    const orderChannel = resolveOrderChannel((body as any).channel);
    const {
      appliedPromotions,
      promotionDiscount,
      invalid,
    } = await resolveAppliedPromotions({
      // See the public route: automatic promotions are rediscovered server-side.
      codes: ((body as any).appliedPromotions ?? [])
        .filter((p: any) => p?.trigger !== "AUTOMATIC")
        .map((p: any) => p.code),
      cart: evaluationCart,
      customer: {
        userId: userIdForOrder,
        type: body.orderType === "B2B" ? "RESELLER" : "RETAIL",
      },
      currency: body.currency,
      channel: orderChannel,
    });
    if (invalid.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Promotion no longer valid: ${invalid
            .map((i) => `${i.code} (${i.reason})`)
            .join(", ")}`,
          invalidCodes: invalid,
        },
        { status: 400 },
      );
    }

    // Snapshot the rupiah rate at order time, so a later rate change never
    // moves the revenue of this order
    const baseRupiah = await getRateToIDR(body.currency);

    // Calculate revenue in IDR from the normalized amounts
    const { grossRevenue, netRevenue } = calculateOrderRevenue({
      orderDetails,
      currency: body.currency,
      totalAmount,
      shippingCost: body.shippingCost,
      discountShipping: body.discountShipping || 0,
      baseRupiah,
      promotionDiscount,
    });

    // `revenue` is legacy and derived — never trust a client supplied value
    const { revenue: _ignoredRevenue, ...safeBody } = body as any;

    // Add userId from session and revenue
    const orderData = {
      ...safeBody,
      orderDetails,
      totalAmount,
      userId: userIdForOrder,
      baseRupiah,
      grossRevenue,
      netRevenue,
      discountShipping: body.discountShipping || 0, // Set default 0 if not provided
      channel: orderChannel, // normalised, so a later edit re-evaluates on the same channel
      promotionDiscount, // server-recomputed
      appliedPromotions, // server-recomputed
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

    // Record promotion usage (audit + quota) for any applied promotions
    await recordOrderPromotionUsages(order);

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
