import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Collection from "@/lib/models/Collection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - Fetch single collection by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const collection = await Collection.findById(params.id);

    if (!collection) {
      return NextResponse.json(
        { message: "Collection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Collection fetched successfully",
        data: collection,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching collection:", error);
    return NextResponse.json(
      { message: "Failed to fetch collection", error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update collection
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const updatedCollection = await Collection.findByIdAndUpdate(
      params.id,
      {
        name,
        displayOnHomepage,
        rules,
        ruleIds,
      },
      { new: true, runValidators: true }
    );

    if (!updatedCollection) {
      return NextResponse.json(
        { message: "Collection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Collection updated successfully",
        data: updatedCollection,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating collection:", error);
    return NextResponse.json(
      { message: "Failed to update collection", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete collection
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const deletedCollection = await Collection.findByIdAndUpdate(
      params.id,
      {
        deleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (deletedCollection.deletedCount === 0) {
      return NextResponse.json(
        { message: "Collection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Collection deleted successfully",
        data: deletedCollection,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting collection:", error);
    return NextResponse.json(
      { message: "Failed to delete collection", error: error.message },
      { status: 500 }
    );
  }
}
