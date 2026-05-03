import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the root directory (two levels up from backend/config)
dotenv.config({ path: path.join(__dirname, "../../.env") });

const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB ?? "location_db";

console.log("Connecting to MongoDB at:", uri.split("@")[1] || "localhost");

const client = new MongoClient(uri);

let db;

export async function connectDB() {
  if (db) return db;
  try {
    await client.connect();
    console.log("✅ Successfully connected to MongoDB Database:", dbName);
    db = client.db(dbName);
    return db;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    // Instead of exiting, we might want to try to continue if it's just a connection blip
    // but for this project, let's keep the exit to know it failed.
    process.exit(1);
  }
}

export function getCollection(name) {
  if (!db) {
    throw new Error("Database not initialized. Ensure connectDB was called and awaited.");
  }
  return db.collection(name);
}
