import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import compression from "compression";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import carRoutes from "./routes/carRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import promoRoutes from "./routes/promoRoutes.js";
import agencyRoutes from "./routes/agencyRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root
dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();
const port = process.env.PORT ?? 4000;

// Security Middleware
app.use(helmet()); // Basic security headers
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(compression()); // Compress responses for better performance

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (high for development, adjust for production)
  message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use("/api", limiter);

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" })); // Reduced limit for better security, adjust if necessary
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Middleware to ensure DB is connected
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ message: "Database connection error" });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", authRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/promos", promoRoutes);
app.use("/api/agencies", agencyRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/inventory", inventoryRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "AVENIR KAMIL CAR Backend is running." });
});

// Start Server (only if not running on Vercel)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const start = async () => {
    try {
      await connectDB();
      app.listen(port, () => {
        console.log(`🚀 AVENIR KAMIL CAR Backend listening at http://localhost:${port}`);
      });
    } catch (error) {
      console.error("Failed to start server:", error);
    }
  };
  start();
}

export default app;
