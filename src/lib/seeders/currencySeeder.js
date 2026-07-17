const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

// Load environment variables from .env file
try {
  const envPath = path.join(__dirname, "../../../.env");

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");

    envContent.split("\n").forEach((line) => {
      // Skip comments and empty lines
      if (line.trim().startsWith("#") || !line.trim()) return;

      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();

        // Remove quotes if present
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  } else {
    console.log("⚠️  .env file not found at:", envPath);
  }
} catch (error) {
  console.log("⚠️  Error loading .env file:", error.message);
}

// Default rates, kept the same as the previously hardcoded currencyRates
// so existing revenue calculations stay unchanged after the migration.
const DEFAULT_CURRENCIES = [
  { name: "IDR", baseRupiah: 1 },
  { name: "USD", baseRupiah: 16000 },
  { name: "SGD", baseRupiah: 11000 },
  { name: "HKD", baseRupiah: 2000 },
];

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DATABASE_NAME,
  });

  console.log("✅ Connected to MongoDB");
}

async function seedCurrencies() {
  const collection = mongoose.connection.collection("currencies");

  let insertedCount = 0;
  let skippedCount = 0;

  for (const currency of DEFAULT_CURRENCIES) {
    // only insert when the currency does not exist yet, so a rate that has
    // already been edited by an admin is never overwritten
    const existing = await collection.findOne({
      name: currency.name,
      deleted: { $ne: true },
    });

    if (existing) {
      console.log(
        `⏭️  ${currency.name} already exists (Rp${existing.baseRupiah}), skipped`
      );
      skippedCount++;
      continue;
    }

    await collection.insertOne({
      ...currency,
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0,
    });

    console.log(`✅ ${currency.name} inserted (Rp${currency.baseRupiah})`);
    insertedCount++;
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 CURRENCY SEEDING SUMMARY");
  console.log("=".repeat(50));
  console.log(`✅ Inserted: ${insertedCount}`);
  console.log(`⏭️  Skipped : ${skippedCount}`);
  console.log("=".repeat(50) + "\n");
}

async function run() {
  try {
    await connectDB();
    await seedCurrencies();
    console.log("🎉 Currency seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("💥 Currency seeding failed:", error);
    process.exit(1);
  }
}

run();
