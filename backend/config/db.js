import mongoose from "mongoose";

/**
 * Global cache for Mongoose connection.
 * Essential for Vercel Serverless Functions to reuse connections and avoid 500 errors.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not defined. Please add it to Vercel Environment Variables.");
  }

  // If connection is already established, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If no connection promise exists, create one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 1, // Keep pool small for serverless
    };

    console.log("📡 Initiating new MongoDB connection...");
    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log("✅ MongoDB Connection Successful");
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // Reset promise on failure
    console.error("❌ MongoDB Connection Error:", e.message);
    throw e;
  }

  return cached.conn;
}

/**
 * Helper to get a native MongoDB collection from Mongoose.
 * Compatible with existing controller logic.
 */
export const getCollection = (name) => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error(`Database not connected (readyState: ${mongoose.connection.readyState}). Cannot get collection ${name}.`);
  }
  return mongoose.connection.collection(name);
};
