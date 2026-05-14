import fs from "fs";
import path from "path";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "location_db";

if (!uri) {
  console.error("❌ MONGODB_URI missing in .env");
  process.exit(1);
}

const client = new MongoClient(uri);

async function seed() {
  try {
    console.log("⏳ Connecting to MongoDB Atlas...");
    await client.connect();
    const db = client.db(dbName);

    // Seed Admin User
    const adminUser = {
      name: "Administrateur AVENIR KAMIL CAR",
      email: "admin@test.com",
      password: "admin123", // In production, use hashed passwords
      role: "admin"
    };

    await db.collection("users").deleteMany({ email: adminUser.email });
    await db.collection("users").insertOne(adminUser);
    console.log("✅ Admin user seeded: admin@test.com / admin123");

    // Seed Cars
    const carsData = JSON.parse(fs.readFileSync(path.resolve("data/cars.json"), "utf8"));
    await db.collection("cars").deleteMany({});
    await db.collection("cars").insertMany(carsData);
    console.log(`✅ Seeded ${carsData.length} cars`);

    console.log("🚀 Database fully migrated and seeded!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
  } finally {
    await client.close();
  }
}

seed();
