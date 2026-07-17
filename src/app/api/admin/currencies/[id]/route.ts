import Currency from "@/lib/models/Currency";
import dbConnect from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

interface Context {
  params: Promise<{ id: string }>;
}

// GET: read currency by ID
export async function GET(req: NextRequest, { params }: Context) {
  await dbConnect();
  try {
    const { id } = await params;

    const currency = await Currency.findById(id);

    if (!currency) {
      return NextResponse.json(
        { success: false, message: "Currency not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: currency,
        message: "Data currency has been fetch",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error, "function GET /api/admin/currencies/[id]/route.ts");

    return NextResponse.json(
      { success: false, message: "Failed to fetch currency by ID" },
      { status: 400 }
    );
  }
}

// PUT: update currency by ID
export async function PUT(req: NextRequest, { params }: Context) {
  await dbConnect();
  try {
    const { id } = await params;

    const findCurrency = await Currency.findById(id);

    if (!findCurrency) {
      return NextResponse.json(
        { success: false, message: "Currency not found" },
        { status: 404 }
      );
    }

    const body = await req.json();

    const name = String(body.name || "")
      .trim()
      .toUpperCase();

    // prevent duplicate currency name on another document
    const existingCurrency = await Currency.findOne({
      name,
      _id: { $ne: id },
    });

    if (existingCurrency) {
      return NextResponse.json(
        { success: false, message: `Currency ${name} already exists` },
        { status: 400 }
      );
    }

    const currency = await Currency.findByIdAndUpdate(
      id,
      { name, baseRupiah: body.baseRupiah },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!currency) {
      return NextResponse.json(
        { success: false, message: "Currency not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: currency,
        message: `Currency successfully updated`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log(error, "function PUT /api/admin/currencies/[id]/route.ts");

    let errorMsg: string | string[];

    if (error.name === "ValidationError") {
      errorMsg = Object.values(error.errors).map((err: any) => err.message);
    } else if (error.name === "MongooseError") {
      errorMsg = error.message;
    } else {
      errorMsg = "Failed to update currency";
    }

    return NextResponse.json(
      { success: false, message: errorMsg },
      { status: 400 }
    );
  }
}

// PATCH: soft delete currency by ID
export async function PATCH(req: NextRequest, { params }: Context) {
  await dbConnect();
  try {
    const { id } = await params;

    const deletedCurrency = await Currency.findByIdAndUpdate(
      id,
      {
        deleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (!deletedCurrency) {
      return NextResponse.json(
        { success: false, message: "Currency not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: deletedCurrency,
        message: `Currency successfully deleted`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error, "function PATCH /api/admin/currencies/[id]/route.ts");

    return NextResponse.json(
      { success: false, message: "Failed to delete currency" },
      { status: 400 }
    );
  }
}
