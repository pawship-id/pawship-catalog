import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      dbName: process.env.MONGODB_DATABASE_NAME,
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;

  await import("@/lib/models/User");
  await import("@/lib/models/ResellerCategory");
  await import("@/lib/models/Tag");
  await import("@/lib/models/ProductVariant");
  await import("@/lib/models/Product");
  await import("@/lib/models/Order");
  await import("@/lib/models/Collection");
  await import("@/lib/models/Category");
  await import("@/lib/models/Banner");
  await import("@/lib/models/BackInStockLog");

  return cached.conn;
}

export default dbConnect;
