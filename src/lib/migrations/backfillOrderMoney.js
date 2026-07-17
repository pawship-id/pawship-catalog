/**
 * Backfill: round the monetary fields of existing orders to their currency's
 * precision, so the value stored in the database matches what the UI displays
 * (kills leftovers like 3.8949999999999996 and 1450.8000000000002).
 *
 * Because `totalAmount` may change, gross/net revenue are recomputed from the
 * baseRupiah already stored on each order, keeping everything consistent.
 *
 * Dry run (default, writes nothing):
 *   npm run backfill:money
 *
 * Apply for real:
 *   npm run backfill:money -- --apply
 *
 * The rounding and revenue math are imported from currency-helper.ts — the same
 * code the API uses — so this script can never drift from it.
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
const {
  normalizeOrderMoney,
  calculateOrderRevenue,
} = require("@/lib/helpers/currency-helper");
const dbConnect = require("@/lib/mongodb").default;

// ---------------------------------------------------------------------------

const APPLY = process.argv.includes("--apply");
const BATCH_SIZE = 500;

const money = (n) =>
  typeof n === "number" && Number.isFinite(n)
    ? n.toLocaleString("id-ID")
    : String(n);

// deep-ish equality good enough for numbers / small price maps
const sameNumber = (a, b) => {
  const na = typeof a === "number" ? a : NaN;
  const nb = typeof b === "number" ? b : NaN;
  if (Number.isNaN(na) && Number.isNaN(nb)) return true;
  return na === nb;
};

const samePriceMap = (a, b) => {
  const ka = Object.keys(a || {});
  const kb = Object.keys(b || {});
  if (ka.length !== kb.length) return false;
  return ka.every((k) => sameNumber(a[k], b[k]));
};

async function backfill() {
  await dbConnect();
  console.log(`✅ Connected (db: ${process.env.MONGODB_DATABASE_NAME})`);

  const collection = mongoose.connection.collection("orders");
  const total = await collection.countDocuments({});
  console.log(`📦 ${total} order ditemukan\n`);

  const stats = { updated: 0, alreadyClean: 0, skipped: 0 };
  const skippedRows = [];
  const sample = [];

  let operations = [];
  const cursor = collection.find({});

  while (await cursor.hasNext()) {
    const order = await cursor.next();
    const label = order.invoiceNumber || String(order._id);

    try {
      const currency = order.currency;

      const { orderDetails, totalAmount } = normalizeOrderMoney(
        order.orderDetails || [],
        currency
      );

      // Recompute revenue from the (unchanged) stored rate so it stays in sync
      // with the rounded totalAmount. If the order has no baseRupiah yet, leave
      // revenue as-is — that is the revenue backfill's job, not this one.
      let revenueSet = {};
      if (
        typeof order.baseRupiah === "number" &&
        Number.isFinite(order.baseRupiah) &&
        order.baseRupiah > 0
      ) {
        const { grossRevenue, netRevenue } = calculateOrderRevenue({
          orderDetails,
          currency,
          totalAmount,
          shippingCost: order.shippingCost,
          discountShipping: order.discountShipping,
          baseRupiah: order.baseRupiah,
        });

        if (
          !Number.isFinite(grossRevenue) ||
          !Number.isFinite(netRevenue) ||
          grossRevenue < 0 ||
          netRevenue < 0 ||
          grossRevenue < netRevenue
        ) {
          stats.skipped++;
          skippedRows.push({
            label,
            reason: `revenue tidak valid (gross=${grossRevenue}, net=${netRevenue})`,
          });
          continue;
        }

        revenueSet = { grossRevenue, netRevenue };
      }

      // Did anything actually change?
      const totalChanged = !sameNumber(order.totalAmount, totalAmount);
      const detailsChanged = orderDetails.some((d, i) => {
        const o = (order.orderDetails || [])[i] || {};
        return (
          !sameNumber(o.subTotal, d.subTotal) ||
          !samePriceMap(o.originalPrice, d.originalPrice) ||
          !samePriceMap(o.discountedPrice, d.discountedPrice)
        );
      });
      const revenueChanged =
        revenueSet.grossRevenue !== undefined &&
        (!sameNumber(order.grossRevenue, revenueSet.grossRevenue) ||
          !sameNumber(order.netRevenue, revenueSet.netRevenue));

      if (!totalChanged && !detailsChanged && !revenueChanged) {
        stats.alreadyClean++;
        continue;
      }

      if (sample.length < 8) {
        sample.push({
          label,
          currency,
          oldTotal: order.totalAmount,
          newTotal: totalAmount,
        });
      }

      operations.push({
        updateOne: {
          filter: { _id: order._id },
          update: { $set: { orderDetails, totalAmount, ...revenueSet } },
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

  console.log("=".repeat(58));
  console.log(APPLY ? "📊 HASIL BACKFILL" : "📊 DRY RUN — tidak ada yang ditulis");
  console.log("=".repeat(58));
  console.log(`${APPLY ? "✅ Diupdate    " : "✏️  Akan diupdate"}: ${stats.updated}`);
  console.log(`⏭️  Sudah bersih : ${stats.alreadyClean}`);
  console.log(`⚠️  Dilewati     : ${stats.skipped}`);

  if (sample.length) {
    console.log("\nContoh perubahan totalAmount:");
    sample.forEach((s) =>
      console.log(
        `  ${s.label} (${s.currency}): ${money(s.oldTotal)} → ${money(s.newTotal)}`
      )
    );
  }

  if (skippedRows.length) {
    console.log("\nOrder yang dilewati:");
    skippedRows.slice(0, 15).forEach((s) =>
      console.log(`  ${s.label}: ${s.reason}`)
    );
    if (skippedRows.length > 15) {
      console.log(`  ... dan ${skippedRows.length - 15} lainnya`);
    }
  }

  console.log("=".repeat(58));
  if (!APPLY) {
    console.log("\n💡 Jalankan dengan --apply untuk menyimpan:");
    console.log("   npm run backfill:money -- --apply\n");
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
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
})();
