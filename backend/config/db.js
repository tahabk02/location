import { MongoClient } from "mongodb";

let client;
let db;

export async function connectDB() {
  if (db) return db;

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "location_db";

  if (!uri) {
    console.error("❌ MONGODB_URI is missing from process.env");
    throw new Error("MONGODB_URI is not defined. Please set it in Vercel Dashboard.");
  }

  try {
    if (!client) {
      console.log("Creating new MongoClient...");
      client = new MongoClient(uri, {
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
    }
    
    await client.connect();
    db = client.db(dbName);
    console.log("✅ Database Connected successfully:", dbName);
    return db;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    throw error;
  }
}

export function getCollection(name) {
  if (!db) {
    throw new Error("Database not initialized. Ensure connectDB() is called and awaited.");
  }
  return db.collection(name);
}
