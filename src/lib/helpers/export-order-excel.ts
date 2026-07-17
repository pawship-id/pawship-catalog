import { IOrderDetail, OrderData } from "@/lib/types/order";

export interface ExportFilters {
  orderType: string; // "all" | "B2C" | "B2B"
  status: string; // "all" | OrderData["status"]
  search: string;
}

// Satu order = satu baris per variant. Kolom order-level di-merge vertikal
// melintasi baris-baris variant miliknya.
const HEADERS = [
  // --- order level (merged) ---
  "Invoice Number",
  "Order Date",
  "Created Date",
  "Order Type",
  "Status",
  "Customer Name",
  "Email",
  "Phone",
  "Country",
  "City",
  "District",
  "Zip Code",
  "Address",
  // --- variant level (per baris) ---
  "Product Name",
  "Variant Name",
  "SKU",
  "Quantity",
  "Unit Price",
  "Discount (%)",
  "Unit Price After Discount",
  "Item Subtotal",
  // --- order level (merged) ---
  "Order Subtotal",
  "Shipping Cost",
  "Shipping Discount",
  "Grand Total",
  "Currency",
  "Revenue (IDR)",
];

const COL_WIDTHS = [
  22, 12, 12, 10, 20, 22, 26, 16, 14, 16, 16, 10, 40, 28, 18, 18, 10, 14, 12,
  22, 14, 16, 14, 16, 14, 10, 16,
].map((wch) => ({ wch }));

// Indeks kolom order-level — nilainya hanya ditulis di baris pertama tiap order,
// lalu di-merge ke bawah. Sisanya (13-20) diisi per variant.
const MERGED_COLUMNS = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 21, 22, 23, 24, 25, 26,
];

const NUMBER_FORMATS: Record<number, string> = {
  1: "yyyy-mm-dd",
  2: "yyyy-mm-dd",
  16: "#,##0",
  17: "#,##0.00",
  18: "#,##0.##",
  19: "#,##0.00",
  20: "#,##0.00",
  21: "#,##0.00",
  22: "#,##0.00",
  23: "#,##0.00",
  24: "#,##0.00",
  26: "#,##0",
};

// orderDate melewati JSON, jadi tiba sebagai ISO string walau tipenya Date
const toDateCell = (value: unknown): Date | string => {
  if (!value) return "";
  const date = new Date(value as string);
  return isNaN(date.getTime()) ? "" : date;
};

// originalPrice/discountedPrice adalah map per-currency ({ IDR: 75000, SGD: 6.5 }),
// bukan angka — tipenya `any` di OrderData sehingga tidak ketahuan dari signature.
const priceIn = (price: any, currency: string): number | "" => {
  if (price === null || price === undefined) return "";
  if (typeof price === "number") return price; // jaga-jaga kalau ada data lama
  const value = price[currency];
  return typeof value === "number" ? value : "";
};

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const buildFileName = (
  filters: ExportFilters,
  now: Date = new Date(),
): string => {
  const parts = ["orders"];

  if (filters.orderType && filters.orderType !== "all") {
    parts.push(filters.orderType);
  }
  if (filters.status && filters.status !== "all") {
    parts.push(slug(filters.status));
  }

  const query = slug(filters.search ?? "").slice(0, 20);
  if (query) parts.push(`search-${query}`);

  parts.push(now.toLocaleDateString("en-CA"));

  return `${parts.join("-")}.xlsx`;
};

/**
 * Export daftar order ke file Excel (.xlsx) dan trigger download di browser.
 *
 * Satu order menghasilkan satu baris per variant produk; kolom order-level
 * di-merge vertikal melintasi baris-baris variant tersebut. Nilai order-level
 * hanya ditulis sekali (di sel kiri-atas merge), sehingga SUM kolom Grand Total
 * tidak menghitung ganda order yang punya banyak variant.
 *
 * Data yang dikirim harus sudah terfilter — helper ini tidak memfilter apa pun.
 * Mengembalikan nama file yang dihasilkan.
 */
export async function exportOrdersToExcel(
  orders: OrderData[],
  filters: ExportFilters,
): Promise<string> {
  if (!orders?.length) {
    throw new Error("No orders to export.");
  }

  // Import dinamis supaya xlsx (~450KB) tidak ikut masuk bundle halaman
  const XLSX = await import("xlsx");

  const rows: (string | number | Date | null)[][] = [];
  const merges: { s: { r: number; c: number }; e: { r: number; c: number } }[] =
    [];

  orders.forEach((order) => {
    // Order tanpa orderDetails tetap dapat satu baris — jangan sampai hilang
    const details: (IOrderDetail | undefined)[] = order.orderDetails?.length
      ? order.orderDetails
      : [undefined];

    const firstRow = rows.length + 1; // +1 karena baris 0 adalah header
    const currency = order.currency ?? "";

    // Harus identik dengan table-order.tsx:89 agar angka di file cocok dengan layar
    const grandTotal =
      (order.totalAmount ?? 0) +
      ((order.shippingCost ?? 0) - (order.discountShipping ?? 0));

    details.forEach((detail, index) => {
      const isFirst = index === 0;

      // null -> tidak dibuatkan sel sama sekali, sesuai kebutuhan area merge
      const orderCell = <T>(value: T) => (isFirst ? value : null);

      rows.push([
        orderCell(order.invoiceNumber ?? ""),
        orderCell(toDateCell(order.orderDate)),
        orderCell(toDateCell(order.createdAt)),
        orderCell(order.orderType ?? ""),
        orderCell(order.status ?? ""),
        orderCell(order.shippingAddress?.fullName ?? ""),
        orderCell(order.shippingAddress?.email ?? ""),
        orderCell(order.shippingAddress?.phone ?? ""),
        orderCell(order.shippingAddress?.country ?? ""),
        orderCell(order.shippingAddress?.city ?? ""),
        orderCell(order.shippingAddress?.district ?? ""),
        orderCell(order.shippingAddress?.zipCode ?? ""),
        orderCell(order.shippingAddress?.address ?? ""),

        detail?.productName ?? "",
        detail?.variantName ?? "",
        detail?.sku ?? "",
        detail?.quantity ?? "",
        priceIn(detail?.originalPrice, currency),
        typeof detail?.discountPercentage === "number"
          ? detail.discountPercentage
          : "",
        priceIn(detail?.discountedPrice, currency),
        typeof detail?.subTotal === "number" ? detail.subTotal : "",

        orderCell(order.totalAmount ?? 0),
        orderCell(order.shippingCost ?? 0),
        orderCell(order.discountShipping ?? 0),
        orderCell(grandTotal),
        orderCell(currency),
        // "" bukan 0 — revenue kosong yang diisi 0 merusak AVERAGE()
        orderCell(typeof order.revenue === "number" ? order.revenue : ""),
      ]);
    });

    // Merge hanya kalau order benar-benar punya >1 variant
    if (details.length > 1) {
      const lastRow = firstRow + details.length - 1;
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

  const range = XLSX.utils.decode_range(worksheet["!ref"]!);

  for (let row = 1; row <= range.e.r; row++) {
    for (const [column, format] of Object.entries(NUMBER_FORMATS)) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: row, c: +column })];
      if (cell && cell.v !== "") cell.z = format;
    }
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

  const fileName = buildFileName(filters);
  XLSX.writeFile(workbook, fileName);

  return fileName;
}
