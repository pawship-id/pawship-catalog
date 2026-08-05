import Order from "@/lib/models/Order";
import ProductVariant from "@/lib/models/ProductVariant";
import dbConnect from "@/lib/mongodb";
import { IOrderDetail, OrderForm } from "@/lib/types/order";
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
import type { EvaluationCart, PromotionChannel } from "@/lib/types/promotion";

/** Every order placed through this route comes from the public storefront. */
const ORDER_CHANNEL: PromotionChannel = "WEB";

export async function POST(req: NextRequest) {
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

    const body: OrderForm = await req.json();

    // Delivery vs pickup. Only a literal `true` counts, so a truthy string from
    // a hand-rolled request can never turn a delivery into a pickup and skip
    // the address requirement below.
    const isPickup = body.isPickup === true;

    // The schema deliberately leaves the street-level fields optional (a pickup
    // order has none), so the "a delivery needs a full address" rule is enforced
    // here — the client-side check is a convenience, not a guarantee.
    if (!isPickup) {
      const missing = (
        ["city", "district", "zipCode", "address"] as const
      ).filter((field) => !(body.shippingAddress?.[field] ?? "").trim());

      if (missing.length > 0) {
        return NextResponse.json(
          {
            success: false,
            message: `A delivery order requires a complete address. Missing: ${missing.join(
              ", "
            )}`,
          },
          { status: 400 }
        );
      }
    }

    // Never store a delivery address on an order nobody is going to deliver.
    // `country` is kept either way: it drives the invoice number.
    const shippingAddress = isPickup
      ? {
          ...body.shippingAddress,
          city: "",
          district: "",
          zipCode: "",
          address: "",
        }
      : body.shippingAddress;

    // Round monetary fields to the currency's precision so what is stored is
    // exactly what the UI displays (no 3.8949999 / 1450.8000000000002)
    const { orderDetails, totalAmount } = normalizeOrderMoney(
      body.orderDetails,
      body.currency
    );

    // Re-evaluate promotions server-side from the submitted CODES only — never
    // trust the client's discount numbers. Reject the checkout if any code is
    // no longer valid (expired / quota exhausted / cart no longer qualifies).
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
    const {
      appliedPromotions,
      promotionDiscount,
      invalid,
    } = await resolveAppliedPromotions({
      // Only code-driven promotions are read from the request. Automatic ones
      // are rediscovered server-side, so passing their internal code here would
      // just be rejected as "not found" and fail the whole order.
      codes: ((body as any).appliedPromotions ?? [])
        .filter((p: any) => p?.trigger !== "AUTOMATIC")
        .map((p: any) => p.code),
      cart: evaluationCart,
      customer: {
        userId: session.user.id,
        type: body.orderType === "B2B" ? "RESELLER" : "RETAIL",
      },
      currency: body.currency,
      channel: ORDER_CHANNEL,
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
        { status: 400 }
      );
    }

    // Snapshot the rupiah rate at order time, so a later rate change never
    // moves the revenue of this order
    const baseRupiah = await getRateToIDR(body.currency);

    // Calculate revenue in IDR from the normalized amounts. The promotion
    // discount (product + shipping benefit) is recomputed above and subtracted
    // from net revenue here.
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
      isPickup, // coerced above
      shippingAddress, // stripped of street-level fields when picking up
      userId: session.user.id,
      baseRupiah,
      grossRevenue,
      netRevenue,
      discountShipping: body.discountShipping || 0, // Set default 0 if not provided
      channel: ORDER_CHANNEL, // recorded so an admin edit re-evaluates on the same channel
      promotionDiscount, // server-recomputed
      appliedPromotions, // server-recomputed
    };

    // Generate unique invoice number based on shipping address country
    const invoiceNumber = await generateInvoiceNumber(
      shippingAddress.country
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
          variantProduct.stock - detail.quantity
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
      { status: 201 }
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
      { status: 400 }
    );
  }
}
