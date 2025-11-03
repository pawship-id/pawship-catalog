import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Collection from "@/lib/models/Collection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - Fetch all collections
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const collections = await Collection.find().sort({ createdAt: -1 });

    return NextResponse.json(
      {
        message: "Collections fetched successfully",
        data: collections,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching collections:", error);
    return NextResponse.json(
      { message: "Failed to fetch collections", error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new collection
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const { name, displayOnHomepage, rules, ruleIds } = body;

    // Validation
    if (!name || !rules || !ruleIds || ruleIds.length === 0) {
      return NextResponse.json(
        { message: "Name, rules, and ruleIds are required" },
        { status: 400 }
      );
    }

    // Create new collection
    const newCollection = await Collection.create({
      name,
      displayOnHomepage: displayOnHomepage || false,
      rules,
      ruleIds,
    });

    return NextResponse.json(
      {
        message: "Collection created successfully",
        data: newCollection,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating collection:", error);
    return NextResponse.json(
      { message: "Failed to create collection", error: error.message },
      { status: 500 }
    );
  }
}
