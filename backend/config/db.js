import { MongoClient } from "mongodb";

let client = null;
let db = null;

export async function connectDB() {
  if (db) return db;

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "location_db";

  if (!uri) {
    console.error("MONGODB_URI is missing");
    throw new Error("Missing MONGODB_URI");
  }

  try {
    if (!client) {
      client = new MongoClient(uri);
    }
    await client.connect();
    db = client.db(dbName);
    return db;
  } catch (error) {
    console.error("DB Connection Error:", error.message);
    throw error;
  }
}

export function getCollection(name) {
  if (!db) {
    throw new Error("DB not connected");
  }
  return db.collection(name);
}
