import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "location_db";

let client = null;
let db = null;

export async function connectDB() {
  if (db) return db;

  if (!uri) {
    throw new Error("MONGODB_URI is missing f environment variables");
  }

  try {
    if (!client) {
      client = new MongoClient(uri);
    }
    await client.connect();
    db = client.db(dbName);
    console.log("Connected to DB");
    return db;
  } catch (error) {
    console.error("DB Connection Error:", error.message);
    // Reset so next request tries again
    client = null;
    db = null;
    throw new Error(`Connection failed: ${error.message}`);
  }
}

export function getCollection(name) {
  if (!db) {
    throw new Error("DB not initialized");
  }
  return db.collection(name);
}
