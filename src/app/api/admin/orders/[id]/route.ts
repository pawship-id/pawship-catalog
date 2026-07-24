import {
  resolveBaseRupiah,
  calculateOrderRevenue,
  normalizeOrderMoney,
} from "@/lib/helpers/currency-helper";
import { OrderForm } from "@/lib/types/order";
import Order from "@/lib/models/Order";
import ProductVariant from "@/lib/models/ProductVariant";
import dbConnect from "@/lib/mongodb";
import {
  clearOrderPromotionUsages,
  recordOrderPromotionUsages,
  resolveAppliedPromotions,
} from "@/lib/helpers/promotion-service";
import type { EvaluationCart } from "@/lib/types/promotion";
import { NextRequest, NextResponse } from "next/server";

interface Context {
  params: Promise<{ id: string }>;
}

// GET: read order by ID
export async function GET(req: NextRequest, { params }: Context) {
  await dbConnect();
  try {
    const { id } = await params;

    let order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: order,
        message: "Data order has been fetch",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error, "function GET /api/admin/orders/[id]/route.ts");

    return NextResponse.json(
      { success: false, message: "Failed to fetch order by ID" },
      { status: 400 }
    );
  }
}

// PUT: update order by ID
export async function PUT(req: NextRequest, { params }: Context) {
  await dbConnect();
  try {
    const { id } = await params;
    const body: OrderForm = await req.json();

    // Get original order to compare quantities
    const originalOrder = await Order.findById(id);
    if (!originalOrder) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Calculate stock updates needed
    const stockUpdates: Map<
      string,
      { productId: string; variantId: string; qtyDifference: number }
    > = new Map();

    // Compare original and new order details
    const originalItems = originalOrder.orderDetails || [];
    const newItems = body.orderDetails || [];

    // Check for quantity changes in existing items
    for (const newItem of newItems) {
      const originalItem = originalItems.find(
        (item: any) => item.variantId === newItem.variantId
      );

      if (originalItem) {
        // Item exists, check if quantity changed
        const qtyDifference = newItem.quantity - originalItem.quantity;
        if (qtyDifference !== 0) {
          stockUpdates.set(newItem.variantId, {
            productId: newItem.productId,
            variantId: newItem.variantId,
            qtyDifference,
          });
        }
      } else {
        // New item added to order
        stockUpdates.set(newItem.variantId, {
          productId: newItem.productId,
          variantId: newItem.variantId,
          qtyDifference: newItem.quantity, // All quantity is new
        });
      }
    }

    // Check for deleted items (items in original but not in new)
    for (const originalItem of originalItems) {
      const stillExists = newItems.find(
        (item: any) => item.variantId === originalItem.variantId
      );

      if (!stillExists) {
        // Item was deleted, restore stock
        stockUpdates.set(originalItem.variantId, {
          productId: originalItem.productId,
          variantId: originalItem.variantId,
          qtyDifference: -originalItem.quantity, // Negative to restore stock
        });
      }
    }

    // Update product stocks
    for (const [, update] of stockUpdates) {
      try {
        const variant = await ProductVariant.findById(update.variantId);
        if (variant) {
          // If qty increased (positive diff), decrease stock
          // If qty decreased (negative diff), increase stock
          const currentStock = variant.stock || 0;
          const newStock = Math.max(0, currentStock - update.qtyDifference);

          variant.stock = newStock;
          await variant.save();
        }
      } catch (error) {
        console.error(
          `Failed to update stock for variant ${update.variantId}:`,
          error
        );
      }
    }

    // Round monetary fields to the currency's precision so what is stored is
    // exactly what the UI displays (no 3.8949999 / 1450.8000000000002)
    const { orderDetails, totalAmount } = normalizeOrderMoney(
      body.orderDetails,
      originalOrder.currency
    );

    // Keep the rate this order was placed with. Orders created before the
    // snapshot existed fall back to the current rate and get backfilled here.
    const baseRupiah = await resolveBaseRupiah(
      originalOrder.currency,
      originalOrder.baseRupiah
    );

    // Re-evaluate promotions server-side from the submitted CODES only — never
    // trust the client's discount numbers. Two edit-specific adjustments so the
    // engine sees the world *without this order*: (1) clear this order's own
    // usage rows first, so a limited-quota promo it already consumed isn't
    // counted against itself; (2) exclude this order from the customer's order
    // count, so first-purchase/new-customer rules still hold.
    const originalApplied = (originalOrder.appliedPromotions ??
      []) as OrderForm["appliedPromotions"];
    await clearOrderPromotionUsages(id);

    const orderCountExcludingSelf = await Order.countDocuments({
      userId: originalOrder.userId,
      _id: { $ne: id },
    });

    const evaluationCart: EvaluationCart = {
      items: orderDetails.map((i: any) => ({
        productId: i.productId,
        variantId: i.variantId,
        categoryId: i.categoryId,
        quantity: i.quantity,
        unitPrice:
          (i.discountedPrice?.[originalOrder.currency] ??
            i.originalPrice?.[originalOrder.currency]) || 0,
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
      codes: ((body as any).appliedPromotions ?? []).map((p: any) => p.code),
      cart: evaluationCart,
      customer: {
        userId: originalOrder.userId,
        type: originalOrder.orderType === "B2B" ? "RESELLER" : "RETAIL",
        orderCount: orderCountExcludingSelf,
      },
      currency: originalOrder.currency,
    });
    if (invalid.length > 0) {
      // Restore the order's original usage rows before bailing out.
      await recordOrderPromotionUsages({
        _id: originalOrder._id,
        userId: originalOrder.userId,
        invoiceNumber: originalOrder.invoiceNumber,
        currency: originalOrder.currency,
        appliedPromotions: originalApplied,
      });
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

    // Calculate revenue from the normalized amounts
    const { grossRevenue, netRevenue } = calculateOrderRevenue({
      orderDetails,
      currency: originalOrder.currency,
      totalAmount,
      shippingCost: body.shippingCost,
      discountShipping: body.discountShipping,
      baseRupiah,
      promotionDiscount,
    });

    // Update order
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        status: body.status,
        shippingCost: body.shippingCost,
        discountShipping: body.discountShipping,
        shippingAddress: body.shippingAddress,
        orderDetails,
        totalAmount,
        baseRupiah,
        grossRevenue,
        netRevenue,
        promotionDiscount, // server-recomputed
        appliedPromotions, // server-recomputed
      },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Usage for this order was cleared above; record the fresh set.
    await recordOrderPromotionUsages(updatedOrder);

    return NextResponse.json(
      {
        success: true,
        data: updatedOrder,
        message: "Order has been updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error, "function PUT /api/admin/orders/[id]/route.ts");

    return NextResponse.json(
      { success: false, message: "Failed to update order" },
      { status: 400 }
    );
  }
}
