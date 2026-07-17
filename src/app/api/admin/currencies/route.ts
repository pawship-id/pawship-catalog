import Currency from "@/lib/models/Currency";
import dbConnect from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

// GET: read all currencies
export async function GET() {
  await dbConnect();

  try {
    const currencies = await Currency.find({})
      .select("name baseRupiah createdAt updatedAt")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        data: currencies,
        message: "Data currencies has been fetch",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error, "function GET /api/admin/currencies/route.ts");

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve currencies data",
      },
      { status: 500 }
    );
  }
}

// POST: create new currency
export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();

    const name = String(body.name || "")
      .trim()
      .toUpperCase();

    // prevent duplicate currency name (soft deleted ones are excluded by mongoose-delete)
    const existingCurrency = await Currency.findOne({ name });

    if (existingCurrency) {
      return NextResponse.json(
        { success: false, message: `Currency ${name} already exists` },
        { status: 400 }
      );
    }

    const currency = await Currency.create({
      name,
      baseRupiah: body.baseRupiah,
    });

    return NextResponse.json(
      {
        success: true,
        data: currency,
        message: `Currency successfully created`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.log(error, "function POST /api/admin/currencies/route.ts");

    let errorMsg: string | string[];

    if (error.name === "ValidationError") {
      errorMsg = Object.values(error.errors).map((err: any) => err.message);
    } else if (error.name === "MongooseError") {
      errorMsg = error.message;
    } else {
      errorMsg = "Failed to create currency";
    }

    return NextResponse.json(
      { success: false, message: errorMsg },
      { status: 400 }
    );
  }
}
