import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// 1. Initialize dotenv at the absolute top
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import compression from "compression";
import { connectDB } from "./config/db.js";

// Import Routes
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
import paymentRoutes, { handleWebhook } from "./routes/paymentRoutes.js";

const app = express();
const port = process.env.PORT || 4000;

// Security Middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(compression());

// Middleware to ensure DB is connected for every request (Serverless robust)
app.use(async (req, res, next) => {
  // Skip DB for health/ping if needed, but for now we want it everywhere
  if (req.path === "/api/ping") return next();
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Critical DB Middleware Error:", error.message);
    res.status(500).json({ 
      error: "Internal Server Error", 
      message: "Database connection failed",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

// Webhook MUST be before express.json()
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), handleWebhook);

// Basic Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Routes
const apiRouter = express.Router();
apiRouter.use("/auth", authRoutes);
apiRouter.use("/users", authRoutes);
apiRouter.use("/cars", carRoutes);
apiRouter.use("/bookings", bookingRoutes);
apiRouter.use("/expenses", expenseRoutes);
apiRouter.use("/settings", settingsRoutes);
apiRouter.use("/promos", promoRoutes);
apiRouter.use("/agencies", agencyRoutes);
apiRouter.use("/services", serviceRoutes);
apiRouter.use("/reviews", reviewRoutes);
apiRouter.use("/notifications", notificationRoutes);
apiRouter.use("/analytics", analyticsRoutes);
apiRouter.use("/inventory", inventoryRoutes);
apiRouter.use("/payments", paymentRoutes);

app.use("/api", apiRouter);

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.get("/api/ping", (req, res) => {
  res.send("pong");
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err);
  res.status(500).json({ 
    message: "Something went wrong on the server",
    error: process.env.NODE_ENV === "development" ? err.message : "Internal Server Error"
  });
});

// Start Server for local development
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  connectDB().then(() => {
    app.listen(port, () => {
      console.log(`🚀 Server listening at http://localhost:${port}`);
    });
  }).catch(err => {
    console.error("Startup failed:", err);
  });
}

export default app;
