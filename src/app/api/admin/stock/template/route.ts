import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * GET /api/admin/stock/template
 *
 * Endpoint untuk download template CSV stock update
 * Template ini bisa digunakan admin sebagai referensi format CSV
 */
export async function GET() {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Admin access required",
        },
        { status: 401 }
      );
    }

    // CSV template content
    const csvContent = `sku,stock
SKU-EXAMPLE-001,100
SKU-EXAMPLE-002,200
SKU-EXAMPLE-003,150`;

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=stock-update-template.csv",
      },
    });
  } catch (error: any) {
    console.error("Error generating CSV template:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to generate template",
      },
      { status: 500 }
    );
  }
}
