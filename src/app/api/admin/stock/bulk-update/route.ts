import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import ProductVariant from "@/lib/models/ProductVariant";
import BackInStockLog from "@/lib/models/BackInStockLog";
import * as XLSX from "xlsx";

/**
 * POST /api/admin/stock/bulk-update
 *
 * Endpoint untuk bulk update stock produk melalui Excel upload
 *
 * Request Body (FormData):
 * - file: File Excel dengan kolom [sku, stock]
 *
 * Response:
 * {
 *   "success": true,
 *   "updatedCount": 10,
 *   "skippedCount": 2,
 *   "skipped": ["SKU404", "SKU777"],
 *   "message": "Stock updated successfully"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // 1. AUTHENTICATION CHECK
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

    const adminEmail = session.user.email || session.user.name || "unknown";

    // 2. DATABASE CONNECTION
    await dbConnect();

    // 3. EXTRACT FILE FROM FORM DATA
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "No file uploaded. Please provide an Excel file",
        },
        { status: 400 }
      );
    }

    // 4. VALIDATE FILE
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid file type. Please upload an Excel file (.xlsx or .xls)",
        },
        { status: 400 }
      );
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          message: "File too large. Maximum file size is 5MB",
        },
        { status: 400 }
      );
    }

    // 5. PARSE EXCEL FILE
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const workbook = XLSX.read(buffer, { type: "buffer" });

    // Get first worksheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (jsonData.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Excel file is empty",
        },
        { status: 400 }
      );
    }

    // Parse data rows
    const headers = jsonData[0] as string[];
    const skuIndex = headers.findIndex((h) => h?.toLowerCase() === "sku");
    const stockIndex = headers.findIndex((h) => h?.toLowerCase() === "stock");

    if (skuIndex === -1 || stockIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Excel format. Required columns: sku, stock",
        },
        { status: 400 }
      );
    }

    const csvData: { sku: string; stock: number }[] = [];
    const errors: string[] = [];

    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];

      // Check if row is completely empty (all cells are empty/undefined)
      const isEmptyRow =
        !row ||
        row.length === 0 ||
        row.every((cell) => cell === undefined || cell === null || cell === "");

      // Stop processing if we encounter an empty row
      if (isEmptyRow) {
        break;
      }

      const sku = row[skuIndex];
      const stock = row[stockIndex];

      if (!sku || String(sku).trim() === "") {
        errors.push(`Row ${i + 1}: SKU is required`);
        continue;
      }

      if (stock === undefined || stock === null || stock === "") {
        errors.push(`Row ${i + 1}: Stock is required`);
        continue;
      }

      const stockNumber = Number(stock);
      if (isNaN(stockNumber) || stockNumber < 0) {
        errors.push(`Row ${i + 1}: Stock must be a non-negative number`);
        continue;
      }

      csvData.push({
        sku: String(sku).trim(),
        stock: stockNumber,
      });
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation errors found in Excel file",
          errors: errors,
        },
        { status: 400 }
      );
    }

    if (csvData.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Excel file has no valid data rows",
        },
        { status: 400 }
      );
    }

    // 6. PROCESS EACH ROW
    const skipped: string[] = [];
    const logsToInsert: any[] = [];
    const bulkOperations: any[] = [];

    // Loop through each CSV row
    for (const row of csvData) {
      const { sku, stock } = row;

      // Skip if stock is 0
      if (stock === 0) {
        skipped.push(sku);
        continue;
      }

      // Find variant by SKU
      const variant = await ProductVariant.findOne({ sku }).populate(
        "productId"
      );

      if (!variant) {
        // SKU tidak ditemukan, skip
        skipped.push(sku);
        continue;
      }

      // Get old stock value
      const oldStock = variant.stock || 0;

      // Jumlah oldStock + stock
      const newStock = stock + oldStock;

      // Prepare bulk update operation (update even if stock is the same)
      bulkOperations.push({
        updateOne: {
          filter: { _id: variant._id },
          update: { $set: { stock: newStock } },
        },
      });

      // Prepare log entry (log all updates, even if stock unchanged)
      logsToInsert.push({
        productId: variant.productId,
        variantId: variant._id,
        sku: variant.sku,
        oldStock: oldStock,
        newStock: newStock,
        updatedBy: adminEmail,
        updatedAt: new Date(),
      });
    }

    // 7. BULK UPDATE STOCK
    let updatedCount = 0;
    if (bulkOperations.length > 0) {
      const bulkResult = await ProductVariant.bulkWrite(bulkOperations);
      updatedCount = bulkResult.modifiedCount;
    }

    // 8. INSERT LOGS
    if (logsToInsert.length > 0) {
      await BackInStockLog.insertMany(logsToInsert);
    }

    // 9. RETURN SUCCESS RESPONSE
    return NextResponse.json(
      {
        success: true,
        updatedCount: updatedCount,
        skippedCount: skipped.length,
        skipped: skipped,
        totalProcessed: csvData.length,
        message: `Successfully updated ${updatedCount} variants. ${skipped.length} SKUs were skipped.`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in bulk stock update:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update stock",
      },
      { status: 500 }
    );
  }
}
