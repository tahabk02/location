import { MongoClient } from "mongodb";

// Cache the connection in a global variable for serverless environments
let cachedClient = null;
let cachedDb = null;

export async function connectDB() {
  // If we have a cached connection, use it
  if (cachedDb) return cachedDb;

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "location_db";

  if (!uri) {
    console.error("❌ MONGODB_URI environment variable is missing!");
    throw new Error("Base de données non configurée (MONGODB_URI manquante)");
  }

  try {
    // If no client exists, create one
    if (!cachedClient) {
      console.log("Creating new MongoClient for serverless...");
      cachedClient = new MongoClient(uri, {
        // Optimized for serverless
        maxPoolSize: 1,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
    }

    // Connect to the server
    await cachedClient.connect();
    cachedDb = cachedClient.db(dbName);
    
    console.log("✅ MongoDB connected successfully to", dbName);
    return cachedDb;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    // Reset cache on error to force a new connection next time
    cachedClient = null;
    cachedDb = null;
    throw error;
  }
}

export function getCollection(name) {
  if (!cachedDb) {
    throw new Error("Database not initialized. Call connectDB first.");
  }
  return cachedDb.collection(name);
}
