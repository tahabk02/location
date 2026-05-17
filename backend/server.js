import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// 1. FATAL ERROR REVEALER - MUST BE FIRST
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure env is loaded
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import compression from "compression";
import { connectDB } from "./config/db.js";

// Import Routes using absolute-like paths
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

/**
 * PRODUCTION-READY ERROR WRAPPER
 */
try {
  // Webhook (Must be before body-parser)
  app.post("/api/payments/webhook", express.raw({ type: "application/json" }), handleWebhook);

  // Security & Optimization
  app.use(helmet({ contentSecurityPolicy: false })); 
  app.use(mongoSanitize());
  app.use(compression());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  // Database connection middleware with debug output
  app.use(async (req, res, next) => {
    if (req.path === "/api/health" || req.path === "/api/ping" || req.path === "/api/reveal-error") return next();
    try {
      await connectDB();
      next();
    } catch (error) {
      return res.status(500).json({ 
        success: false,
        message: "CRITICAL: Database connection failed in middleware",
        error: error.message,
        stack: error.stack
      });
    }
  });

  // API Routes
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

  // Base Routes
  app.get("/api/health", (req, res) => res.json({ status: "ok", message: "API is online" }));
  app.get("/", (req, res) => res.send("Backend Live"));

  // Debug Route to trigger a test error
  app.get("/api/reveal-error", (req, res) => {
    throw new Error("Visibility Test: If you see this, error catching is working.");
  });

  // 404 Handler for API
  app.use("/api/*", (req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
  });

  // GLOBAL ERROR MIDDLEWARE - THE VISIBILITY PATCH
  app.use((err, req, res, next) => {
    console.error("🔥 EXCEPTION CAUGHT:", err);
    res.status(500).json({
      success: false,
      message: "FATAL SERVER ERROR",
      error: err.message,
      stack: err.stack,
      path: req.path
    });
  });

} catch (initializationError) {
  console.error("❌ SERVER INITIALIZATION FAILED:", initializationError);
  // This might not even send a response if the app didn't start, 
  // but we try to define a fallback route.
  app.use((req, res) => {
    res.status(500).json({
      success: false,
      message: "SERVER FAILED TO INITIALIZE",
      error: initializationError.message,
      stack: initializationError.stack
    });
  });
}

// Local Development Server
if (!process.env.VERCEL) {
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`🚀 Debug server listening at http://localhost:${port}`);
  });
}

// EXPORT FOR VERCEL
export default app;
