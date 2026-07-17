import { ProductData, TCurrency, VariantRow } from "@/lib/types/product";
import {
  applyNumberFormats,
  priceIn,
  slugify,
  toDateCell,
} from "@/lib/helpers/excel-helper";

export interface ExportProductFilters {
  category: string; // "all" | categoryId
  search: string;
}

// Produk tidak punya field currency (beda dgn Order) — satu variant menyimpan
// keempat mata uang sekaligus, jadi semuanya diberi kolom sendiri.
const CURRENCIES: TCurrency[] = ["IDR", "USD", "SGD", "HKD"];

// Satu product = satu baris per variant. Kolom product-level di-merge vertikal
// melintasi baris-baris variant miliknya.
const HEADERS = [
  // --- product level (merged) ---
  "Product Name",
  "Category",
  "Description",
  "Tags",
  "Pre-Order",
  "Lead Time",
  "Variant Count",
  "Total Stock",
  "Created Date",
  "Slug",
  // --- variant level (per baris) ---
  "SKU",
  "Variant Name",
  "Attributes",
  "Stock",
  ...CURRENCIES.map((currency) => `Price ${currency}`),
];

const COL_WIDTHS = [
  30, 18, 50, 22, 10, 14, 13, 12, 12, 30, 22, 24, 30, 10, 14, 12, 12, 12,
].map((wch) => ({ wch }));

// Indeks kolom product-level — nilainya hanya ditulis di baris pertama tiap
// product, lalu di-merge ke bawah. Sisanya (10+) diisi per variant.
const MERGED_COLUMNS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const NUMBER_FORMATS: Record<number, string> = {
  6: "#,##0", // Variant Count
  7: "#,##0", // Total Stock
  8: "yyyy-mm-dd", // Created Date
  13: "#,##0", // Stock
  14: "#,##0.00", // Price IDR
  15: "#,##0.00", // Price USD
  16: "#,##0.00", // Price SGD
  17: "#,##0.00", // Price HKD
};

// Kolom harga yang tidak terisi ditampilkan sebagai 0, bukan sel kosong.
const priceOrZero = (price: any, currency: string): number => {
  const value = priceIn(price, currency);
  return value === "" ? 0 : value;
};

// attrs adalah Mongoose Map -> plain object di JSON, mis. { Size: "500g" }
const formatAttrs = (attrs?: Record<string, string>): string => {
  if (!attrs) return "";
  return Object.entries(attrs)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");
};

export const buildProductFileName = (
  filters: ExportProductFilters,
  categoryName: string,
  now: Date = new Date(),
): string => {
  const parts = ["products"];

  if (filters.category && filters.category !== "all" && categoryName) {
    parts.push(slugify(categoryName));
  }

  const query = slugify(filters.search ?? "").slice(0, 20);
  if (query) parts.push(`search-${query}`);

  parts.push(now.toLocaleDateString("en-CA"));

  return `${parts.join("-")}.xlsx`;
};

/**
 * Export daftar product ke file Excel (.xlsx) dan trigger download di browser.
 *
 * Satu product menghasilkan satu baris per variant; kolom product-level di-merge
 * vertikal melintasi baris-baris variant tersebut. Nilai product-level hanya
 * ditulis sekali (di sel kiri-atas merge), sehingga SUM kolom Total Stock tidak
 * menghitung ganda product yang punya banyak variant.
 *
 * Data yang dikirim harus sudah terfilter — helper ini tidak memfilter apa pun.
 * Mengembalikan nama file yang dihasilkan.
 */
export async function exportProductsToExcel(
  products: ProductData[],
  filters: ExportProductFilters,
): Promise<string> {
  if (!products?.length) {
    throw new Error("No products to export.");
  }

  // Import dinamis supaya xlsx (~450KB) tidak ikut masuk bundle halaman
  const XLSX = await import("xlsx");

  const rows: (string | number | Date | null)[][] = [];
  const merges: { s: { r: number; c: number }; e: { r: number; c: number } }[] =
    [];

  products.forEach((product) => {
    // Product tanpa variant tetap dapat satu baris — jangan sampai hilang
    const variants: (VariantRow | undefined)[] = product.productVariantsData
      ?.length
      ? product.productVariantsData
      : [undefined];

    const firstRow = rows.length + 1; // +1 karena baris 0 adalah header

    const totalStock = (product.productVariantsData ?? []).reduce(
      (sum, variant) => sum + (variant.stock ?? 0),
      0,
    );

    variants.forEach((variant, index) => {
      const isFirst = index === 0;

      // null -> tidak dibuatkan sel sama sekali, sesuai kebutuhan area merge
      const productCell = <T>(value: T) => (isFirst ? value : null);

      rows.push([
        productCell(product.productName ?? ""),
        productCell(product.categoryDetail?.name ?? "-"),
        productCell(product.productDescription ?? ""),
        productCell((product.tags ?? []).map((tag) => tag.tagName).join(", ")),
        productCell(product.preOrder?.enabled ? "Yes" : "No"),
        productCell(product.preOrder?.leadTime ?? ""),
        productCell(product.productVariantsData?.length ?? 0),
        productCell(totalStock),
        productCell(toDateCell(product.createdAt)),
        productCell(product.slug ?? ""),

        variant?.sku ?? "",
        variant?.name ?? "",
        formatAttrs(variant?.attrs),
        typeof variant?.stock === "number" ? variant.stock : "",
        ...CURRENCIES.map((currency) => priceOrZero(variant?.price, currency)),
      ]);
    });

    // Merge hanya kalau product benar-benar punya >1 variant
    if (variants.length > 1) {
      const lastRow = firstRow + variants.length - 1;
      MERGED_COLUMNS.forEach((column) => {
        merges.push({
          s: { r: firstRow, c: column },
          e: { r: lastRow, c: column },
        });
      });
    }
  });

  const worksheet = XLSX.utils.aoa_to_sheet([HEADERS, ...rows], {
    cellDates: true,
  });
  worksheet["!cols"] = COL_WIDTHS;
  worksheet["!merges"] = merges;

  applyNumberFormats(XLSX, worksheet, NUMBER_FORMATS);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

  // Saat filter kategori aktif semua product punya kategori yang sama,
  // jadi namanya bisa diambil dari baris pertama tanpa fetch tambahan.
  const categoryName = products[0]?.categoryDetail?.name ?? "";
  const fileName = buildProductFileName(filters, categoryName);
  XLSX.writeFile(workbook, fileName);

  return fileName;
}
