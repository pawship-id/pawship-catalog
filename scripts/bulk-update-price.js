/**
 * Bulk update harga variant produk dari file Excel, dicocokkan berdasarkan SKU.
 *
 * Script membaca file Excel penyesuaian harga, mengambil kolom "Variant SKU Code"
 * beserta "Price IDR", "Price USD", "Price SGD", "Price HKD", lalu meng-update
 * field `price.<CURRENCY>` pada collection `product_variants`.
 *
 * Aturan:
 *   - Kolom harga yang KOSONG tidak menimpa nilai yang sudah ada di database.
 *   - SKU yang tidak ada di database dilewati dan dilaporkan (skip not found).
 *   - SKU yang muncul lebih dari sekali dengan harga BERBEDA dianggap konflik,
 *     tidak diupdate, dan dilaporkan supaya file Excel-nya bisa diperbaiki dulu.
 *
 * Dry run (default, tidak menulis apa pun):
 *   npm run price:bulk-update
 *
 * Simpan ke database:
 *   npm run price:bulk-update -- --apply
 *
 * Pakai file lain:
 *   npm run price:bulk-update -- --file="path/ke/file.xlsx"
 *
 * Pembulatan harga memakai roundMoney() dari currency-helper.ts — helper yang sama
 * dengan yang dipakai API, supaya presisi tiap currency tidak pernah berbeda.
 */

const path = require("path");
const fs = require("fs");

// --- 1. Load .env before anything reads process.env -----------------------
try {
  const envPath = path.join(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    envContent.split("\n").forEach((line) => {
      if (line.trim().startsWith("#") || !line.trim()) return;
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = value;
      }
    });
  } else {
    console.log("⚠️  .env file not found at:", envPath);
  }
} catch (error) {
  console.log("⚠️  Error loading .env file:", error.message);
}

// --- 2. Resolve the "@/..." alias, then enable TypeScript ------------------
const Module = require("module");
const SRC = path.join(__dirname, "../src");
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith("@/")) {
    return originalResolve.call(this, path.join(SRC, request.slice(2)), ...rest);
  }
  return originalResolve.call(this, request, ...rest);
};

require("ts-node").register({
  transpileOnly: true,
  compilerOptions: {
    module: "commonjs",
    target: "ES2019",
    moduleResolution: "node",
    esModuleInterop: true,
  },
});

const XLSX = require("xlsx");
const mongoose = require("mongoose");
const { roundMoney } = require("@/lib/helpers/currency-helper");
const dbConnect = require("@/lib/mongodb").default;

// ---------------------------------------------------------------------------

const APPLY = process.argv.includes("--apply");
const BATCH_SIZE = 500;
const CURRENCIES = ["IDR", "USD", "SGD", "HKD"];
const DEFAULT_FILE = "Penyesuaian Harga - 27 Juli 2026.xlsx";

const fileArg = process.argv.find((a) => a.startsWith("--file="));
const EXCEL_PATH = path.resolve(
  fileArg
    ? fileArg.slice("--file=".length).replace(/^["']|["']$/g, "")
    : path.join(__dirname, "..", DEFAULT_FILE)
);

/** Kunci pencocokan SKU: trim, buang spasi di dalam, case-insensitive. */
const normalizeSku = (sku) =>
  String(sku ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");

const normalizeHeader = (h) =>
  String(h ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const fmt = (n) =>
  typeof n === "number" && Number.isFinite(n)
    ? n.toLocaleString("id-ID", { maximumFractionDigits: 2 })
    : String(n);

/**
 * Ubah isi cell menjadi angka.
 *
 * Excel menyimpan Price USD/SGD sebagai teks dengan koma desimal ("12,75", "19,10"),
 * sementara Price IDR/HKD berupa angka biasa. Kembalikan `null` kalau cell kosong —
 * artinya currency tersebut tidak ikut diupdate.
 */
function parsePrice(raw, currency) {
  if (raw === null || raw === undefined) return null;

  let value;
  if (typeof raw === "number") {
    value = raw;
  } else {
    const text = String(raw).trim();
    if (!text) return null;

    const cleaned = text.replace(/[^\d.,-]/g, "");
    if (!cleaned || !/\d/.test(cleaned)) return NaN;

    const lastDot = cleaned.lastIndexOf(".");
    const lastComma = cleaned.lastIndexOf(",");
    let normalized;
    if (lastDot >= 0 && lastComma >= 0) {
      // Separator yang muncul paling akhir adalah desimal, sisanya pemisah ribuan.
      const decimalSep = lastDot > lastComma ? "." : ",";
      const thousandSep = decimalSep === "." ? "," : ".";
      normalized = cleaned
        .split(thousandSep)
        .join("")
        .replace(decimalSep, ".");
    } else {
      normalized = cleaned.replace(",", ".");
    }

    value = Number(normalized);
  }

  if (!Number.isFinite(value)) return NaN;
  return roundMoney(value, currency);
}

function readExcel() {
  if (!fs.existsSync(EXCEL_PATH)) {
    throw new Error(`File Excel tidak ditemukan: ${EXCEL_PATH}`);
  }

  const workbook = XLSX.readFile(EXCEL_PATH);
  const sheetName = workbook.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    header: 1,
    defval: "",
  });

  if (!rows.length) throw new Error(`Sheet "${sheetName}" kosong.`);

  const headers = rows[0].map(normalizeHeader);
  const skuCol = headers.findIndex(
    (h) => h === "variant sku code" || h === "sku"
  );
  if (skuCol < 0) {
    throw new Error(
      `Kolom SKU tidak ditemukan. Header yang terbaca:\n  ${rows[0].join(" | ")}`
    );
  }

  const priceCols = {};
  for (const currency of CURRENCIES) {
    const idx = headers.findIndex((h) => h === `price ${currency.toLowerCase()}`);
    if (idx >= 0) priceCols[currency] = idx;
    else console.log(`⚠️  Kolom "Price ${currency}" tidak ada di file, dilewati.`);
  }
  if (!Object.keys(priceCols).length) {
    throw new Error("Tidak ada satu pun kolom harga (Price IDR/USD/SGD/HKD).");
  }

  return { sheetName, rows: rows.slice(1), skuCol, priceCols };
}

async function run() {
  const { sheetName, rows, skuCol, priceCols } = readExcel();
  console.log(`📄 File   : ${path.basename(EXCEL_PATH)} (sheet "${sheetName}")`);
  console.log(`📄 Baris  : ${rows.length}\n`);

  const entries = new Map(); // normalizedSku -> { sku, productName, prices, rowNumber }
  const conflicts = [];
  const invalidValues = [];
  const noPriceRows = [];

  // Nama produk hanya ditulis di baris pertama tiap grup varian, jadi dibawa turun.
  let currentProductName = "";

  rows.forEach((row, i) => {
    const rowNumber = i + 2; // +1 header, +1 karena Excel mulai dari 1
    const nameCell = String(row[0] ?? "").trim();
    if (nameCell) currentProductName = nameCell;

    const sku = String(row[skuCol] ?? "").trim();
    if (!sku) return;

    const prices = {};
    for (const [currency, col] of Object.entries(priceCols)) {
      const parsed = parsePrice(row[col], currency);
      if (parsed === null) continue;
      if (Number.isNaN(parsed) || parsed <= 0) {
        invalidValues.push({
          rowNumber,
          sku,
          currency,
          raw: String(row[col]),
        });
        continue;
      }
      prices[currency] = parsed;
    }

    if (!Object.keys(prices).length) {
      noPriceRows.push({ rowNumber, sku, productName: currentProductName });
      return;
    }

    const key = normalizeSku(sku);
    const existing = entries.get(key);
    if (!existing) {
      entries.set(key, {
        sku,
        productName: currentProductName,
        prices,
        rowNumber,
      });
      return;
    }

    const same =
      CURRENCIES.every((c) => existing.prices[c] === prices[c]) &&
      Object.keys(existing.prices).length === Object.keys(prices).length;

    if (!same) {
      existing.conflict = true;
      conflicts.push({
        sku,
        firstRow: existing.rowNumber,
        firstPrices: existing.prices,
        secondRow: rowNumber,
        secondPrices: prices,
      });
    }
  });

  const conflictKeys = new Set();
  for (const [key, entry] of entries) if (entry.conflict) conflictKeys.add(key);

  console.log(`🔑 SKU unik: ${entries.size}\n`);

  // --- Ambil semua variant sekali, cocokkan di memory ----------------------
  await dbConnect();
  console.log(`✅ Connected (db: ${process.env.MONGODB_DATABASE_NAME})\n`);

  const variants = mongoose.connection.collection("product_variants");

  const allVariants = await variants
    .find({ deleted: { $ne: true } })
    .project({ sku: 1, name: 1, price: 1, productId: 1 })
    .toArray();

  const bySku = new Map();
  const ambiguousDbSkus = new Set();
  for (const doc of allVariants) {
    const key = normalizeSku(doc.sku);
    if (!key) continue;
    if (bySku.has(key)) ambiguousDbSkus.add(key);
    bySku.set(key, doc);
  }

  const stats = {
    updated: 0,
    alreadyUpToDate: 0,
    notFound: 0,
    conflict: conflictKeys.size,
    ambiguous: 0,
  };
  const notFoundRows = [];
  const ambiguousRows = [];

  let operations = [];

  for (const [key, entry] of entries) {
    if (conflictKeys.has(key)) continue;

    if (ambiguousDbSkus.has(key)) {
      stats.ambiguous++;
      ambiguousRows.push(entry);
      continue;
    }

    const doc = bySku.get(key);
    if (!doc) {
      stats.notFound++;
      notFoundRows.push(entry);
      console.log(
        `⏭️  Product ${
          entry.productName || "(tidak diketahui)"
        } dengan SKU ${entry.sku} skip not found`
      );
      continue;
    }

    const oldPrice =
      doc.price && typeof doc.price === "object" && !Array.isArray(doc.price)
        ? doc.price
        : null;

    const changes = [];
    for (const [currency, value] of Object.entries(entry.prices)) {
      const before = oldPrice ? oldPrice[currency] : undefined;
      if (before !== value) changes.push({ currency, before, after: value });
    }

    if (!changes.length) {
      stats.alreadyUpToDate++;
      continue;
    }

    let update;
    if (oldPrice) {
      // Set per-field supaya currency lain yang ada di DB tapi tidak ada di Excel tetap utuh.
      const $set = {};
      for (const { currency, after } of changes) $set[`price.${currency}`] = after;
      update = { $set };
    } else {
      // price lama bukan object (legacy number / kosong) → tulis ulang seluruh map.
      update = { $set: { price: { ...entry.prices } } };
    }

    operations.push({ updateOne: { filter: { _id: doc._id }, update } });
    stats.updated++;

    console.log(
      `✏️  ${doc.sku}  ` +
        changes
          .map(
            (c) =>
              `${c.currency} ${
                c.before === undefined ? "-" : fmt(c.before)
              } → ${fmt(c.after)}`
          )
          .join(" | ")
    );

    if (APPLY && operations.length >= BATCH_SIZE) {
      await variants.bulkWrite(operations, { ordered: false });
      operations = [];
    }
  }

  if (APPLY && operations.length) {
    await variants.bulkWrite(operations, { ordered: false });
  }

  // --- Ringkasan ----------------------------------------------------------
  const line = "=".repeat(58);
  console.log(`\n${line}`);
  console.log(APPLY ? "📊 HASIL UPDATE" : "📊 DRY RUN — tidak ada yang ditulis");
  console.log(line);
  console.log(`📄 Baris Excel dibaca   : ${rows.length}`);
  console.log(`🔑 SKU unik             : ${entries.size}`);
  console.log(
    `${APPLY ? "✅ Diupdate            " : "✏️  Akan diupdate       "}: ${
      stats.updated
    }`
  );
  console.log(`⏭️  Harga sudah sama     : ${stats.alreadyUpToDate}`);
  console.log(`❌ SKU tidak ditemukan  : ${stats.notFound}`);
  console.log(`⚠️  SKU duplikat konflik : ${stats.conflict}`);
  console.log(`🚫 Baris tanpa harga    : ${noPriceRows.length}`);
  console.log(`🚫 Nilai harga invalid  : ${invalidValues.length}`);
  if (stats.ambiguous) {
    console.log(`⚠️  SKU ambigu di DB     : ${stats.ambiguous}`);
  }

  if (notFoundRows.length) {
    console.log(`\n❌ SKU tidak ditemukan di database (${notFoundRows.length}):`);
    notFoundRows.forEach((e) =>
      console.log(
        `   Product ${e.productName || "(tidak diketahui)"} dengan SKU ${
          e.sku
        } skip not found  [baris ${e.rowNumber}]`
      )
    );
  }

  if (conflicts.length) {
    console.log(
      `\n⚠️  SKU duplikat dengan harga berbeda — TIDAK diupdate (${conflicts.length}):`
    );
    conflicts.forEach((c) => {
      const show = (p) =>
        CURRENCIES.filter((x) => p[x] !== undefined)
          .map((x) => `${x} ${fmt(p[x])}`)
          .join(", ");
      console.log(`   ${c.sku}`);
      console.log(`     baris ${c.firstRow} : ${show(c.firstPrices)}`);
      console.log(`     baris ${c.secondRow} : ${show(c.secondPrices)}`);
    });
    console.log("   → perbaiki dulu di Excel, lalu jalankan ulang script ini.");
  }

  if (noPriceRows.length) {
    console.log(`\n🚫 Baris tanpa harga sama sekali (${noPriceRows.length}):`);
    noPriceRows.forEach((e) =>
      console.log(
        `   ${e.sku} — ${e.productName || "(tidak diketahui)"} [baris ${
          e.rowNumber
        }]`
      )
    );
  }

  if (invalidValues.length) {
    console.log(`\n🚫 Nilai harga tidak valid (${invalidValues.length}):`);
    invalidValues.forEach((v) =>
      console.log(
        `   ${v.sku} — Price ${v.currency} = "${v.raw}" [baris ${v.rowNumber}]`
      )
    );
  }

  if (ambiguousRows.length) {
    console.log(
      `\n⚠️  SKU yang cocok ke lebih dari satu variant di DB (${ambiguousRows.length}):`
    );
    ambiguousRows.forEach((e) => console.log(`   ${e.sku}`));
  }

  console.log(line);
  if (!APPLY) {
    console.log("\n💡 Jalankan dengan --apply untuk menyimpan:");
    console.log("   npm run price:bulk-update -- --apply\n");
  }
}

(async () => {
  try {
    await run();
    await mongoose.disconnect();
    console.log("🎉 Selesai!");
    process.exit(0);
  } catch (error) {
    console.error("💥 Bulk update harga gagal:", error);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
})();
