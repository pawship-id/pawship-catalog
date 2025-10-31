import Order from "@/lib/models/Order";
import dbConnect from "@/lib/mongodb";
import { IOrderDetail, OrderForm } from "@/lib/types/order";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body: OrderForm = await req.json();

    body.orderDetails.forEach((el: IOrderDetail) => {
      delete el.stock;
    });

    const order = await Order.create(body);

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
