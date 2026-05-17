import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env or Vercel dashboard");
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development and function invocations in serverless environments.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("✅ New Mongoose connection established");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("❌ Mongoose connection error:", e.message);
    throw e;
  }

  return cached.conn;
}

export default connectDB;

// Keep original function names for compatibility with other files if they use them
export { connectDB as connect };
export const getCollection = (name) => mongoose.connection.collection(name);
