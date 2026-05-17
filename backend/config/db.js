import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

/**
 * Global cache for Mongoose connection.
 * Essential for Vercel Serverless Functions to reuse connections.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  // 1. Check if we already have a cached connection
  if (cached.conn) {
    return cached.conn;
  }

  // 2. Check if the existing connection is ready (extra safety)
  if (mongoose.connection.readyState === 1) {
    cached.conn = mongoose.connection;
    return cached.conn;
  }

  // 3. Create a new connection promise if one doesn't exist
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 1, // Minimize connections in serverless
    };

    console.log("📡 Connecting to MongoDB Atlas...");
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("✅ MongoDB Connected Successfully");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("❌ MongoDB Connection Failed:", e.message);
    throw e;
  }

  return cached.conn;
}

// Helper to get collection (compatible with original logic)
export const getCollection = (name) => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error("Database not connected. Call connectDB() first.");
  }
  return mongoose.connection.collection(name);
};
