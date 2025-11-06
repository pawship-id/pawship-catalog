import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import ProductVariant from "@/lib/models/ProductVariant";
import BackInStockLog from "@/lib/models/BackInStockLog";
import {
  parseCSVFile,
  validateCSVFile,
  CSVRowData,
} from "@/lib/helpers/csv-parser";

/**
 * POST /api/admin/stock/bulk-update
 *
 * Endpoint untuk bulk update stock produk melalui CSV upload
 *
 * Request Body (FormData):
 * - file: File CSV dengan kolom [sku, stock]
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
          message: "No file uploaded. Please provide a CSV file",
        },
        { status: 400 }
      );
    }

    // 4. VALIDATE FILE
    const validation = validateCSVFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error,
        },
        { status: 400 }
      );
    }

    // 5. PARSE CSV FILE
    const parseResult = await parseCSVFile(file);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to parse CSV file",
          errors: parseResult.errors,
        },
        { status: 400 }
      );
    }

    if (parseResult.data.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "CSV file is empty or has no valid data",
        },
        { status: 400 }
      );
    }

    // 6. PROCESS EACH ROW
    const csvData = parseResult.data;
    const skipped: string[] = [];
    const logsToInsert: any[] = [];
    const bulkOperations: any[] = [];

    // Loop through each CSV row
    for (const row of csvData) {
      const { sku, stock } = row;

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
