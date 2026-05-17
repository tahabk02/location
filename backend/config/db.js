import mongoose from "mongoose";

/**
 * Global cache for Mongoose connection.
 * Essential for Vercel Serverless Functions to reuse connections.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI || process.env.MONGODB_DB;

  if (!uri) {
    console.error("❌ ERROR: MONGODB_URI/MONGODB_DB is NOT defined in Vercel settings");
    throw new Error("Base de données non configurée (Variables d'environnement manquantes)");
  }

  // Log a masked version of the URI for debugging
  const maskedUri = uri.replace(/\/\/(.*):(.*)@/, "//***:***@");
  console.log(`🔌 Attempting to connect to: ${maskedUri}`);

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
