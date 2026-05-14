import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "location_db";

async function check() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collections = ["users", "cars", "bookings", "expenses", "settings"];
    for (const col of collections) {
      const count = await db.collection(col).countDocuments();
      console.log(`Collection ${col}: ${count} documents`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}
check();
