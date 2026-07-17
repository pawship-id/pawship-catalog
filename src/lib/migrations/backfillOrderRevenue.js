/**
 * Backfill `baseRupiah`, `grossRevenue`, and `netRevenue` for orders created
 * before those fields existed.
 *
 * Dry run (default, writes nothing):
 *   npm run backfill:revenue
 *
 * Apply for real:
 *   npm run backfill:revenue -- --apply
 *
 * The revenue math is imported from src/lib/helpers/currency-helper.ts — the
 * exact same code the API uses — so this script can never drift from it.
 */

const path = require("path");
const fs = require("fs");

// ---------------------------------------------------------------------------
// 1. Load .env BEFORE requiring anything that reads process.env at import time
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// 2. Teach require() about the "@/..." alias, then enable TypeScript
// ---------------------------------------------------------------------------
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
const { calculateOrderRevenue } = require("@/lib/helpers/currency-helper");

// Reuse the app's own connection helper so this script and the helper share a
// single connection instead of racing to open two
const dbConnect = require("@/lib/mongodb").default;

// ---------------------------------------------------------------------------

const APPLY = process.argv.includes("--apply");
const BATCH_SIZE = 500;

/**
 * Rate yang berlaku SEBELUM currency dikelola di database, diambil dari
 * konstanta `currencyRates` yang dulu di-hardcode di currency-helper.ts.
 *
 * Order lama dinilai dengan angka inilah, jadi inilah rate historisnya.
 * JANGAN pakai rate terbaru dari collection `currencies` di sini — itu akan
 * menilai ulang order lama dengan kurs hari ini dan menaikkan revenue masa lalu,
 * persis hal yang ingin dicegah oleh mekanisme snapshot.
 */
const LEGACY_RATES = {
  IDR: 1,
  USD: 16000,
  SGD: 11000,
  HKD: 2000,
};

const isValidRate = (n) =>
  typeof n === "number" && Number.isFinite(n) && n > 0;

/**
 * Rate historis sebuah order: snapshot kalau sudah ada, kalau belum pakai rate
 * legacy sesuai currency-nya. Currency di luar tabel legacy tidak bisa ditebak.
 */
function resolveHistoricalRate(order) {
  if (isValidRate(order.baseRupiah)) {
    return { rate: order.baseRupiah, source: "snapshot" };
  }

  const code = String(order.currency || "")
    .trim()
    .toUpperCase();

  if (isValidRate(LEGACY_RATES[code])) {
    return { rate: LEGACY_RATES[code], source: "legacy" };
  }

  return null;
}

const rupiah = (n) =>
  typeof n === "number" && Number.isFinite(n)
    ? "Rp" + n.toLocaleString("id-ID")
    : String(n);

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
  }

  await dbConnect();

  console.log(
    `✅ Connected to MongoDB (db: ${process.env.MONGODB_DATABASE_NAME})`
  );
}

async function backfill() {
  const collection = mongoose.connection.collection("orders");
  const total = await collection.countDocuments({});

  console.log(`📦 ${total} order ditemukan\n`);

  const stats = {
    updated: 0,
    alreadyCorrect: 0,
    skipped: 0,
    usedLegacyRate: 0,
    rateMismatch: 0,
  };
  const skippedRows = [];
  const mismatchRows = [];
  const sample = [];

  // Revenue yang dibaca dashboard sebelum vs sesudah, untuk melihat dampaknya.
  // Harus identik dengan filter di src/app/api/admin/dashboard/stats/route.ts
  const DASHBOARD_STATUSES = ["payment confirmed", "processing", "shipped"];
  let revenueBefore = 0;
  let revenueAfter = 0;

  let operations = [];
  const cursor = collection.find({});

  while (await cursor.hasNext()) {
    const order = await cursor.next();
    const label = order.invoiceNumber || String(order._id);

    try {
      const resolved = resolveHistoricalRate(order);

      if (!resolved) {
        stats.skipped++;
        skippedRows.push({
          label,
          reason: `currency "${order.currency}" tidak ada di tabel rate legacy — rate historisnya tidak bisa ditentukan`,
        });
        continue;
      }

      const baseRupiah = resolved.rate;
      const hadSnapshot = resolved.source === "snapshot";

      // Cek silang: kalau rate legacy benar, `revenue` lama harus bisa
      // direproduksi dari totalAmount/shippingCost. Kalau tidak cocok, asumsi
      // rate-nya meleset dan angkanya perlu dilihat manual.
      if (!hadSnapshot && typeof order.revenue === "number") {
        const total = Number(order.totalAmount) || 0;
        const ship = Number(order.shippingCost) || 0;
        const disc = Number(order.discountShipping) || 0;

        const expectedFromCreate = Math.round((total + ship) * baseRupiah);
        const expectedFromEdit = Math.round((total + ship - disc) * baseRupiah);
        const tolerance = 2; // toleransi pembulatan

        const matches =
          Math.abs(order.revenue - expectedFromCreate) <= tolerance ||
          Math.abs(order.revenue - expectedFromEdit) <= tolerance;

        if (!matches) {
          stats.rateMismatch++;
          mismatchRows.push({
            label,
            currency: order.currency,
            storedRevenue: order.revenue,
            expectedFromCreate,
            baseRupiah,
          });
        }
      }

      const { grossRevenue, netRevenue } = calculateOrderRevenue({
        orderDetails: order.orderDetails || [],
        currency: order.currency,
        totalAmount: order.totalAmount,
        shippingCost: order.shippingCost,
        discountShipping: order.discountShipping,
        baseRupiah,
      });

      // Angka tidak masuk akal -> lewati, jangan sampai merusak data
      if (
        !Number.isFinite(grossRevenue) ||
        !Number.isFinite(netRevenue) ||
        grossRevenue < 0 ||
        netRevenue < 0
      ) {
        stats.skipped++;
        skippedRows.push({
          label,
          reason: `perhitungan tidak valid (gross=${grossRevenue}, net=${netRevenue})`,
        });
        continue;
      }

      // Gross tidak mungkin lebih kecil dari net — kalau terjadi berarti datanya
      // tidak konsisten (mis. orderDetails kosong tapi totalAmount terisi).
      // Lebih baik dilewati dan dilaporkan daripada menulis angka yang ngawur.
      if (grossRevenue < netRevenue) {
        stats.skipped++;
        skippedRows.push({
          label,
          reason: `gross (${rupiah(grossRevenue)}) < net (${rupiah(
            netRevenue
          )}) — orderDetails tidak konsisten dengan totalAmount`,
        });
        continue;
      }

      const oldRead = order.netRevenue ?? order.revenue ?? 0;

      if (DASHBOARD_STATUSES.includes(order.status)) {
        revenueBefore += oldRead;
        revenueAfter += netRevenue;
      }

      const unchanged =
        order.baseRupiah === baseRupiah &&
        order.grossRevenue === grossRevenue &&
        order.netRevenue === netRevenue;

      if (unchanged) {
        stats.alreadyCorrect++;
        continue;
      }

      if (!hadSnapshot) stats.usedLegacyRate++;

      if (sample.length < 5) {
        sample.push({ label, oldRead, netRevenue, grossRevenue, baseRupiah });
      }

      operations.push({
        updateOne: {
          filter: { _id: order._id },
          update: { $set: { baseRupiah, grossRevenue, netRevenue } },
        },
      });

      stats.updated++;

      if (APPLY && operations.length >= BATCH_SIZE) {
        await collection.bulkWrite(operations, { ordered: false });
        operations = [];
      }
    } catch (err) {
      stats.skipped++;
      skippedRows.push({ label, reason: err.message });
    }
  }

  if (APPLY && operations.length) {
    await collection.bulkWrite(operations, { ordered: false });
  }

  // -------------------------------------------------------------------------
  console.log("=".repeat(58));
  console.log(APPLY ? "📊 HASIL BACKFILL" : "📊 DRY RUN — tidak ada yang ditulis");
  console.log("=".repeat(58));
  console.log(`${APPLY ? "✅ Diupdate       " : "✏️  Akan diupdate  "}: ${stats.updated}`);
  console.log(`⏭️  Sudah benar    : ${stats.alreadyCorrect}`);
  console.log(`⚠️  Dilewati       : ${stats.skipped}`);
  console.log(`🕒 Pakai rate legacy (tanpa snapshot): ${stats.usedLegacyRate}`);

  if (stats.rateMismatch) {
    console.log(
      `\n❗ ${stats.rateMismatch} order revenue lamanya tidak cocok dengan rate legacy.`
    );
    console.log(
      "   Artinya order itu dulu dinilai dengan rate lain — mohon dicek manual:"
    );
    mismatchRows.slice(0, 10).forEach((m) => {
      console.log(
        `  ${m.label} (${m.currency}): tersimpan ${rupiah(
          m.storedRevenue
        )}, dari rate ${m.baseRupiah} harusnya ${rupiah(m.expectedFromCreate)}`
      );
    });
    if (mismatchRows.length > 10) {
      console.log(`  ... dan ${mismatchRows.length - 10} lainnya`);
    }
  }

  if (sample.length) {
    console.log("\nContoh perubahan:");
    sample.forEach((s) => {
      const delta = s.netRevenue - s.oldRead;
      const sign = delta > 0 ? "+" : "";
      console.log(
        `  ${s.label}: revenue ${rupiah(s.oldRead)} → net ${rupiah(
          s.netRevenue
        )} (${sign}${rupiah(delta)}), gross ${rupiah(
          s.grossRevenue
        )}, rate ${s.baseRupiah}`
      );
    });
  }

  if (skippedRows.length) {
    console.log("\nOrder yang dilewati:");
    skippedRows.slice(0, 20).forEach((s) => {
      console.log(`  ${s.label}: ${s.reason}`);
    });
    if (skippedRows.length > 20) {
      console.log(`  ... dan ${skippedRows.length - 20} lainnya`);
    }
  }

  console.log(
    `\nDampak ke Total Revenue dashboard (status: ${DASHBOARD_STATUSES.join(", ")}):`
  );
  console.log(`  sebelum : ${rupiah(revenueBefore)}`);
  console.log(`  sesudah : ${rupiah(revenueAfter)}`);
  const diff = revenueAfter - revenueBefore;
  console.log(`  selisih : ${diff >= 0 ? "+" : ""}${rupiah(diff)}`);
  console.log("=".repeat(58));

  if (!APPLY) {
    console.log("\n💡 Jalankan dengan --apply untuk menyimpan perubahan:");
    console.log("   npm run backfill:revenue -- --apply\n");
  }
}

async function run() {
  try {
    await connectDB();
    await backfill();
    await mongoose.disconnect();
    console.log("🎉 Selesai!");
    process.exit(0);
  } catch (error) {
    console.error("💥 Backfill gagal:", error);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

run();
