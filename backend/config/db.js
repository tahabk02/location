import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "location_db";

if (!uri) {
  console.warn("⚠️ MONGODB_URI is not defined. Defaulting to localhost (will fail on Vercel).");
}

let client;
let db;

export async function connectDB() {
  if (db) return db;
  try {
    if (!client) {
      const connectionUri = uri || "mongodb://127.0.0.1:27017";
      client = new MongoClient(connectionUri, {
        connectTimeoutMS: 5000, // Reduced to 5s for faster failure
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
      });
    }
    await client.connect();
    db = client.db(dbName);
    console.log("✅ Connected to MongoDB:", dbName);
    return db;
  } catch (error) {
    console.error("❌ MongoDB Error:", error.message);
    throw error;
  }
}

export function getCollection(name) {
  if (!db) {
    throw new Error("Database not initialized. Call and await connectDB() first.");
  }
  return db.collection(name);
}
