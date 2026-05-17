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
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "location";

  if (!uri) {
    console.error("❌ ERROR: MONGODB_URI is NOT defined in Vercel settings");
    throw new Error("Base de données non configurée (MONGODB_URI manquante)");
  }

  // Check if we have a valid connection already
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If we are already connecting, wait for the existing promise
  if (cached.promise) {
    return cached.promise;
  }

  const opts = {
    bufferCommands: true,
    maxPoolSize: 1,
    dbName: dbName, // Use MONGODB_DB as the database name
    serverSelectionTimeoutMS: 10000,
  };

  console.log(`📡 Connecting to MongoDB Atlas (DB: ${dbName})...`);
  cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
    console.log("✅ MongoDB Connected Successfully");
    return mongooseInstance;
  }).catch(err => {
    cached.promise = null;
    throw err;
  });

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("❌ MongoDB connection failed:", e.message);
    throw e;
  }

  return cached.conn;
}

/**
 * Helper to get collection (compatible with original controllers)
 */
export const getCollection = (name) => {
  // If not ready, but connecting, Mongoose will buffer if bufferCommands is true.
  // But for safety with direct collection access, we check readyState.
  if (mongoose.connection.readyState !== 1) {
    console.warn(`⚠️ Warning: Collection '${name}' requested but DB state is ${mongoose.connection.readyState}`);
    // We try to return it anyway, Mongoose might handle the buffering
  }
  return mongoose.connection.collection(name);
};
