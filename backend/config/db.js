import mongoose from "mongoose";

/**
 * Global cache for Mongoose connection.
 * Essential for Vercel Serverless Functions to reuse connections.
 */
let cached = globalThis.mongoose;

if (!cached) {
  cached = globalThis.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("FATAL: MONGODB_URI is not defined");
    throw new Error("Base de données non configurée (MONGODB_URI manquante)");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 1, // Keep pool small for serverless
    };

    console.log("📡 Connecting to MongoDB Atlas...");
    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log("✅ MongoDB Connected");
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // Clear promise on error
    console.error("❌ MongoDB connection failed:", e.message);
    throw e;
  }

  return cached.conn;
}

/**
 * Helper to get collection (compatible with original controllers)
 */
export const getCollection = (name) => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error(`DB not ready (readyState: ${mongoose.connection.readyState})`);
  }
  return mongoose.connection.collection(name);
};
