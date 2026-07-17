/**
 * Utility bersama untuk fitur export Excel (orders & products).
 */

// Tanggal melewati JSON, jadi tiba sebagai ISO string walau tipenya Date.
// Dikembalikan sebagai objek Date agar jadi date cell asli di Excel.
export const toDateCell = (value: unknown): Date | string => {
  if (!value) return "";
  const date = new Date(value as string);
  return isNaN(date.getTime()) ? "" : date;
};

/**
 * Harga di aplikasi ini disimpan sebagai map per-currency
 * ({ IDR: 75000, SGD: 6.5 }), bukan angka — baik `price` di ProductVariant
 * maupun `originalPrice`/`discountedPrice` di Order. Semuanya bertipe `any`
 * sehingga bentuk aslinya tidak terlihat dari signature.
 */
export const priceIn = (price: any, currency: string): number | "" => {
  if (price === null || price === undefined) return "";
  if (typeof price === "number") return price; // jaga-jaga kalau ada data lama
  const value = price[currency];
  return typeof value === "number" ? value : "";
};

// Membersihkan teks bebas (search query, nama kategori) agar aman jadi nama file
export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Terapkan number format per kolom ke seluruh baris data (baris 0 = header).
 * `formats` dipetakan dari indeks kolom (0-based) ke format Excel.
 */
export const applyNumberFormats = (
  XLSX: typeof import("xlsx"),
  worksheet: import("xlsx").WorkSheet,
  formats: Record<number, string>,
) => {
  const range = XLSX.utils.decode_range(worksheet["!ref"]!);

  for (let row = 1; row <= range.e.r; row++) {
    for (const [column, format] of Object.entries(formats)) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: row, c: +column })];
      if (cell && cell.v !== "") cell.z = format;
    }
  }
};
