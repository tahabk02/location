import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "location_db";

let client;
let db;

export async function connectDB() {
  if (db) return db;
  
  if (!uri) {
    throw new Error("MONGODB_URI is not defined f environment variables");
  }

  try {
    if (!client) {
      client = new MongoClient(uri);
    }
    await client.connect();
    db = client.db(dbName);
    console.log("✅ MongoDB Connected successfully");
    return db;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    throw error;
  }
}

export function getCollection(name) {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB first.");
  }
  return db.collection(name);
}
