/**
 * Backfill: nomori ulang `position` setiap variant menjadi 1..N per produk.
 *
 * Kenapa perlu: sebelum perbaikan ini, `position` hanya diisi saat baris baru
 * dibuat di form (`value.length + 1`) dan tidak pernah ikut ter-update saat
 * produk disimpan. Akibatnya banyak produk lama punya position duplikat
 * (mis. dua variant sama-sama position 2) atau meloncat (1, 2, 2, 3, 6, 7).
 * Selama nilainya masih bentrok, urutan variant di form edit ikut bergantung
 * pada urutan natural MongoDB — yaitu urutan yang bikin variant tampil acak.
 *
 * Urutan baru mengikuti apa yang sudah tampil sekarang (`position` lalu `_id`
 * sebagai tie-breaker) — jadi backfill ini merapikan penomorannya saja, bukan
 * menebak-nebak urutan yang diinginkan admin. Setelah ini, urutan bisa disusun
 * manual lewat drag handle di tabel varian pada form edit produk.
 *
 * Variant yang sudah dihapus (soft delete) tetap dinomori juga supaya tidak ada
 * position kosong, tapi diletakkan setelah variant aktif.
 *
 * Dry run (default, tidak menulis apa pun):
 *   npm run backfill:variant-position
 *
 * Simpan ke database:
 *   npm run backfill:variant-position -- --apply
 */

const path = require("path");
const fs = require("fs");

// --- 1. Load .env before anything reads process.env -----------------------
try {
  const envPath = path.join(__dirname, "../../../.env");
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
const SRC = path.join(__dirname, "../..");
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

const mongoose = require("mongoose");
const dbConnect = require("@/lib/mongodb").default;

// ---------------------------------------------------------------------------

const APPLY = process.argv.includes("--apply");
const BATCH_SIZE = 500;

// Urutan tampil saat ini: position dulu (yang kosong dianggap paling belakang),
// lalu _id sebagai tie-breaker — persis seperti sort pada virtual populate
// `productVariantsData`.
function compareVariants(a, b) {
  const aDeleted = a.deleted ? 1 : 0;
  const bDeleted = b.deleted ? 1 : 0;
  if (aDeleted !== bDeleted) return aDeleted - bDeleted;

  const aPos = typeof a.position === "number" ? a.position : Number.MAX_SAFE_INTEGER;
  const bPos = typeof b.position === "number" ? b.position : Number.MAX_SAFE_INTEGER;
  if (aPos !== bPos) return aPos - bPos;

  return a._id.toString().localeCompare(b._id.toString());
}

async function backfill() {
  await dbConnect();
  console.log(`✅ Connected (db: ${process.env.MONGODB_DATABASE_NAME})`);

  const products = mongoose.connection.collection("products");
  const variants = mongoose.connection.collection("product_variants");

  const productList = await products
    .find({})
    .project({ productName: 1 })
    .toArray();

  console.log(`📦 ${productList.length} produk ditemukan\n`);

  let ops = [];
  let productsTouched = 0;
  let variantsTouched = 0;
  let variantsTotal = 0;
  const samples = [];

  for (const product of productList) {
    const rows = await variants.find({ productId: product._id }).toArray();
    if (rows.length === 0) continue;

    variantsTotal += rows.length;
    rows.sort(compareVariants);

    const changed = [];
    rows.forEach((row, index) => {
      const nextPosition = index + 1;
      if (row.position === nextPosition) return;

      changed.push({ row, from: row.position, to: nextPosition });
      ops.push({
        updateOne: {
          filter: { _id: row._id },
          update: { $set: { position: nextPosition } },
        },
      });
    });

    if (changed.length === 0) continue;

    productsTouched += 1;
    variantsTouched += changed.length;

    if (samples.length < 5) {
      samples.push({
        productName: product.productName,
        order: rows.map((row, index) => ({
          name: row.name || row.sku,
          from: row.position,
          to: index + 1,
        })),
      });
    }

    if (APPLY && ops.length >= BATCH_SIZE) {
      await variants.bulkWrite(ops, { ordered: false });
      ops = [];
    }
  }

  if (APPLY && ops.length > 0) {
    await variants.bulkWrite(ops, { ordered: false });
  }

  if (samples.length > 0) {
    console.log("Contoh penomoran ulang:");
    samples.forEach((sample) => {
      console.log(`\n  ${sample.productName}`);
      sample.order.forEach((item) =>
        console.log(
          `    ${String(item.from ?? "-").padStart(3)} → ${String(item.to).padStart(3)}  ${item.name}`,
        ),
      );
    });
    console.log("");
  }

  console.log("=".repeat(58));
  console.log(
    APPLY ? "📊 HASIL BACKFILL" : "📊 DRY RUN — tidak ada yang ditulis",
  );
  console.log("=".repeat(58));
  console.log(`📦 Produk terdampak : ${productsTouched}`);
  console.log(
    `${APPLY ? "✅ Variant diupdate " : "✏️  Variant akan diupdate"}: ${variantsTouched}`,
  );
  console.log(`⏭️  Sudah benar      : ${variantsTotal - variantsTouched}`);
  console.log("=".repeat(58));

  if (!APPLY) {
    console.log("\n💡 Jalankan dengan --apply untuk menyimpan:");
    console.log("   npm run backfill:variant-position -- --apply\n");
  }
}

(async () => {
  try {
    await backfill();
    await mongoose.disconnect();
    console.log("🎉 Selesai!");
    process.exit(0);
  } catch (error) {
    console.error("💥 Backfill gagal:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
})();
