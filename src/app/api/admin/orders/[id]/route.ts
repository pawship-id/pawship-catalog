import { calculateRevenueInIDR } from "@/lib/helpers/currency-helper";
import Order from "@/lib/models/Order";
import ProductVariant from "@/lib/models/ProductVariant";
import dbConnect from "@/lib/mongodb";
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
    const body = await req.json();

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

    // Calculate revenue
    const revenue = calculateRevenueInIDR(
      body.totalAmount,
      body.shippingCost - body.discountShipping,
      body.currency
    );

    // Update order
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        status: body.status,
        shippingCost: body.shippingCost,
        discountShipping: body.discountShipping,
        shippingAddress: body.shippingAddress,
        orderDetails: body.orderDetails,
        totalAmount: body.totalAmount,
        revenue,
      },
      { new: true, runValidators: true }
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
