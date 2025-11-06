import Papa from "papaparse";

/**
 * Interface untuk data CSV yang di-parse
 */
export interface CSVRowData {
  sku: string;
  stock: number;
}

/**
 * Interface untuk hasil parsing CSV
 */
export interface ParseCSVResult {
  success: boolean;
  data: CSVRowData[];
  errors: string[];
}

/**
 * Helper function untuk parse CSV file menjadi array of objects
 * Server-side version (Node.js)
 *
 * @param file - File CSV yang akan di-parse
 * @returns Promise dengan hasil parsing
 *
 * Expected CSV format:
 * ```csv
 * sku,stock
 * SKU001,100
 * SKU002,50
 * ```
 */
export async function parseCSVFile(file: File): Promise<ParseCSVResult> {
  try {
    const errors: string[] = [];
    const validData: CSVRowData[] = [];

    // Convert File to text (Node.js way)
    const text = await file.text();

    // Parse CSV menggunakan PapaParse (synchronous)
    return new Promise((resolve) => {
      Papa.parse(text, {
        header: true, // Parse dengan header (baris pertama jadi key)
        skipEmptyLines: true, // Skip baris kosong
        transformHeader: (header) => header.trim().toLowerCase(), // Normalize header
        complete: (results) => {
          // Validasi setiap baris
          results.data.forEach((row: any, index: number) => {
            const rowNumber = index + 2; // +2 karena header di baris 1, data mulai baris 2

            // Validasi field sku
            if (
              !row.sku ||
              typeof row.sku !== "string" ||
              row.sku.trim() === ""
            ) {
              errors.push(
                `Row ${rowNumber}: SKU is required and must be a string`
              );
              return;
            }

            // Validasi field stock
            const stock = parseInt(row.stock);
            if (isNaN(stock)) {
              errors.push(`Row ${rowNumber}: Stock must be a valid number`);
              return;
            }

            if (stock < 0) {
              errors.push(`Row ${rowNumber}: Stock cannot be negative`);
              return;
            }

            // Data valid, tambahkan ke array
            validData.push({
              sku: row.sku.trim(),
              stock: stock,
            });
          });

          // Return hasil
          resolve({
            success: errors.length === 0,
            data: validData,
            errors: errors,
          });
        },
        error: (error: any) => {
          resolve({
            success: false,
            data: [],
            errors: [`Failed to parse CSV: ${error.message}`],
          });
        },
      });
    });
  } catch (error: any) {
    return {
      success: false,
      data: [],
      errors: [`Failed to read file: ${error.message}`],
    };
  }
}

/**
 * Helper function untuk validasi file CSV sebelum di-parse
 *
 * @param file - File yang akan divalidasi
 * @returns Object dengan status valid dan error message (jika ada)
 */
export function validateCSVFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check file type
  const validTypes = ["text/csv", "application/vnd.ms-excel", "text/plain"];
  if (!validTypes.includes(file.type) && !file.name.endsWith(".csv")) {
    return {
      valid: false,
      error: "Invalid file type. Please upload a CSV file",
    };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: "File size exceeds 5MB limit",
    };
  }

  // Check if file is empty
  if (file.size === 0) {
    return {
      valid: false,
      error: "File is empty",
    };
  }

  return { valid: true };
}
