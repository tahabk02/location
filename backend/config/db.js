import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the root directory (two levels up from backend/config)
dotenv.config({ path: path.join(__dirname, "../../.env") });

const rawUri = process.env.MONGODB_URI;
if (!rawUri) {
  console.error("❌ FATAL: MONGODB_URI is not defined in environment variables!");
}
const uri = rawUri?.includes("w=majori") ? rawUri.replace("w=majori", "w=majority") : (rawUri ?? "mongodb://127.0.0.1:27017");
const dbName = process.env.MONGODB_DB ?? "location_db";

console.log("Connecting to MongoDB at:", uri.split("@")[1] || "localhost");

let client;
let db;

export async function connectDB() {
  if (db) return db;
  try {
    if (!client) {
      client = new MongoClient(uri, {
        connectTimeoutMS: 10000, // 10 seconds
        socketTimeoutMS: 45000,  // 45 seconds
        maxPoolSize: 10,
      });
    }
    await client.connect();
    console.log("✅ Successfully connected to MongoDB Database:", dbName);
    db = client.db(dbName);
    return db;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    // On Vercel, we want to know if it's an IP whitelist issue
    if (error.message.includes("DSRS") || error.message.includes("IP")) {
      console.error("HINT: Check your MongoDB Atlas Network Access (Whitelist 0.0.0.0/0)");
    }
    throw error;
  }
}

export function getCollection(name) {
  if (!db) {
    throw new Error("Database not initialized. Call and await connectDB() first.");
  }
  return db.collection(name);
}
