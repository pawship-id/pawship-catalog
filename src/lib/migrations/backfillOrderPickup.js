/**
 * Backfill: give every order created before the pickup feature an explicit
 * `isPickup: false`. Those orders were always delivered, so `false` is not a
 * guess — it is what actually happened.
 *
 * Why a script and not just `default: false` on the schema: Mongoose only
 * applies a default when it hydrates a document, and `/api/public/orders/my-orders`
 * queries with `.lean()`, which skips hydration entirely. Without this backfill
 * those orders come back with `isPickup: undefined`.
 *
 * Dry run (default, writes nothing):
 *   npm run backfill:pickup
 *
 * Apply for real:
 *   npm run backfill:pickup -- --apply
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

async function backfill() {
  await dbConnect();
  console.log(`✅ Connected (db: ${process.env.MONGODB_DATABASE_NAME})`);

  const collection = mongoose.connection.collection("orders");

  const total = await collection.countDocuments({});
  // Only documents that have no value at all — an order already marked
  // `isPickup: true` must never be flipped back to a delivery.
  const filter = { isPickup: { $exists: false } };
  const missing = await collection.countDocuments(filter);

  console.log(`📦 ${total} order ditemukan`);
  console.log(`🔎 ${missing} order belum punya field isPickup\n`);

  if (missing > 0) {
    const sample = await collection
      .find(filter)
      .project({ invoiceNumber: 1, orderDate: 1 })
      .limit(8)
      .toArray();

    console.log("Contoh order yang akan diisi isPickup: false");
    sample.forEach((o) =>
      console.log(
        `  ${o.invoiceNumber || o._id}${
          o.orderDate ? ` (${new Date(o.orderDate).toLocaleDateString("id-ID")})` : ""
        }`
      )
    );
    console.log("");
  }

  let modified = 0;
  if (APPLY && missing > 0) {
    const result = await collection.updateMany(filter, {
      $set: { isPickup: false },
    });
    modified = result.modifiedCount;
  }

  console.log("=".repeat(58));
  console.log(APPLY ? "📊 HASIL BACKFILL" : "📊 DRY RUN — tidak ada yang ditulis");
  console.log("=".repeat(58));
  console.log(
    `${APPLY ? "✅ Diupdate    " : "✏️  Akan diupdate"}: ${APPLY ? modified : missing}`
  );
  console.log(`⏭️  Sudah punya  : ${total - missing}`);
  console.log("=".repeat(58));

  if (!APPLY) {
    console.log("\n💡 Jalankan dengan --apply untuk menyimpan:");
    console.log("   npm run backfill:pickup -- --apply\n");
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
