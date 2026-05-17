import { getCollection } from "./db.js";
import bcrypt from "bcryptjs";

const defaultCars = [
  {
    "agencyId": "default",
    "brand": "Tesla",
    "model": "Model 3",
    "category": "Electrique",
    "pricePerDay": 120,
    "seats": 5,
    "fuel": "Électrique",
    "speed": "225 km/h",
    "image": "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80",
    "available": true
  },
  {
    "agencyId": "default",
    "brand": "BMW",
    "model": "X5",
    "category": "SUV",
    "pricePerDay": 180,
    "seats": 5,
    "fuel": "Diesel",
    "speed": "235 km/h",
    "image": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    "available": true
  },
  {
    "agencyId": "default",
    "brand": "Audi",
    "model": "A6",
    "category": "Luxe",
    "pricePerDay": 150,
    "seats": 5,
    "fuel": "Essence",
    "speed": "250 km/h",
    "image": "https://images.unsplash.com/photo-1549921296-3c08606f4f25?auto=format&fit=crop&w=1200&q=80",
    "available": true
  },
  {
    "agencyId": "default",
    "brand": "Mercedes",
    "model": "GLE",
    "category": "SUV",
    "pricePerDay": 190,
    "seats": 5,
    "fuel": "Diesel",
    "speed": "225 km/h",
    "image": "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1200&q=80",
    "available": true
  },
  {
    "agencyId": "default",
    "brand": "Volkswagen",
    "model": "Passat",
    "category": "Luxe",
    "pricePerDay": 90,
    "seats": 5,
    "fuel": "Diesel",
    "speed": "210 km/h",
    "image": "https://images.unsplash.com/photo-1517448202560-8f6bf0d0ece4?auto=format&fit=crop&w=1200&q=80",
    "available": true
  }
];

export async function autoSeed() {
  console.log("🔍 Auto-seed check started...");
  try {
    const carsCollection = getCollection("cars");
    const carCount = await carsCollection.countDocuments();
    console.log(`📊 Current car count in DB: ${carCount}`);
    
    if (carCount === 0) {
      console.log("🌱 Cars collection is EMPTY. Seeding cars...");
      await carsCollection.insertMany(defaultCars);
      console.log("✅ Default cars inserted.");
    }

    // Seed default admin user if missing (ALWAYS CHECK INDEPENDENTLY)
    const usersCollection = getCollection("users");
    const userCount = await usersCollection.countDocuments();
    console.log(`📊 Current user count in DB: ${userCount}`);

    if (userCount === 0) {
      console.log("👤 No users found. Seeding admin user...");
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await usersCollection.insertOne({
        name: "Admin",
        email: "admin@test.com",
        password: hashedPassword,
        role: "admin",
        agencyId: "default",
        createdAt: new Date()
      });
      console.log("✅ Admin user seeded (admin@test.com / admin123).");
    }

    // Also seed default settings if missing
    const settingsCollection = getCollection("settings");
    const settingsCount = await settingsCollection.countDocuments();
    if (settingsCount === 0) {

      // Also seed default settings if missing
      const settingsCollection = getCollection("settings");
      const settingsCount = await settingsCollection.countDocuments();
      if (settingsCount === 0) {
         await settingsCollection.insertOne({
          agencyId: "default",
          name: "AVENIR KAMIL CAR",
          email: "contact@avenirkamilcar.ma",
          phone: "+212 661 000 000",
          address: "Casablanca, Maroc",
          currency: "DH",
          taxRate: "20",
          logoUrl: "",
          primaryColor: "#2563eb",
          galleryImages: [
            "https://images.pexels.com/photos/1237116/pexels-photo-1237116.jpeg",
            "https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg",
            "https://images.pexels.com/photos/vehicle-road-driving-speed-1000768.jpeg",
            "https://images.pexels.com/photos/981129/pexels-photo-981129.jpeg"
          ],
          galleryVideoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        });
        console.log("✅ Seeded default settings.");
      }
    }
  } catch (error) {
    console.error("⚠️ Auto-seed failed:", error.message);
  }
}
