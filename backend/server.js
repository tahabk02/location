import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import carRoutes from "./routes/carRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import promoRoutes from "./routes/promoRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root
dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();
const port = process.env.PORT ?? 4000;

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "50mb" })); // Increase limit for Base64 images
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", authRoutes); // Shares the same router, /api/users/all will work
app.use("/api/cars", carRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/promos", promoRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "LuxeDrive Backend is running." });
});

// Start Server
const start = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`🚀 LuxeDrive Backend listening at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

start();
