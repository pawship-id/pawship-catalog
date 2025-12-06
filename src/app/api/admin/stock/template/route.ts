import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import * as XLSX from "xlsx";

/**
 * GET /api/admin/stock/template
 *
 * Endpoint untuk download template Excel stock update
 * Template ini bisa digunakan admin sebagai referensi format Excel
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

    // Create Excel workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheetData = [
      ["sku", "stock"], // Header
      ["SKU-EXAMPLE-001", 100],
      ["SKU-EXAMPLE-002", 200],
      ["SKU-EXAMPLE-003", 150],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    worksheet["!cols"] = [{ wch: 20 }, { wch: 10 }];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Template");

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    // Return Excel file
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          "attachment; filename=stock-update-template.xlsx",
      },
    });
  } catch (error: any) {
    console.error("Error generating Excel template:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to generate template",
      },
      { status: 500 }
    );
  }
}
