import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import compression from "compression";
import { connectDB } from "./config/db.js";
import { autoSeed } from "./config/autoSeed.js";

// Load environment variables locally
if (!process.env.VERCEL) {
  dotenv.config();
}

// Routes Imports
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
 * ABSOLUTE VISIBILITY PATCH
 */
try {
  // 1. Webhook - Early processing
  app.post("/api/payments/webhook", express.raw({ type: "application/json" }), handleWebhook);

  // 2. Global Middleware
  app.use(helmet({ contentSecurityPolicy: false })); 
  app.use(mongoSanitize());
  app.use(compression());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  // 3. Database Connection Middleware (With detailed error reveal)
  app.use(async (req, res, next) => {
    // Health check bypass
    if (req.path === "/api/health" || req.path === "/api/reveal-error") return next();
    
    try {
      await connectDB();
      // Auto-seed if database is empty (Runs once per cold start/request if empty)
      await autoSeed();
      next();
    } catch (dbError) {
      console.error("🔥 DATABASE CONNECTION FAILED:", dbError.message);
      res.status(500).json({ 
        success: false, 
        message: "DATABASE_CONNECTION_ERROR", 
        error: dbError.message,
        stack: dbError.stack 
      });
    }
  });

  // 4. API Routes
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

  // 5. Base & Debug Routes
  app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));
  app.get("/api/debug", async (req, res) => {
    try {
      await connectDB();
      res.json({ 
        status: "connected", 
        env_db_key: process.env.MONGODB_DB ? "set" : "missing",
        env_uri_key: process.env.MONGODB_URI ? "set" : "missing"
      });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  });
  app.get("/api/reveal-error", (req, res) => {
    throw new Error("Visibility Test: Error reveal middleware is operational.");
  });
  app.get("/", (req, res) => res.send("Backend Live"));

  // 6. Global Exception Catcher (The Ultimate Reveal)
  app.use((err, req, res, next) => {
    console.error("🔥 UNHANDLED FATAL ERROR:", err);
    res.status(500).json({
      success: false,
      message: "FATAL_SERVER_EXCEPTION",
      error: err.message,
      stack: err.stack,
      path: req.path
    });
  });

} catch (initError) {
  console.error("❌ CRITICAL INITIALIZATION FAILURE:", initError);
}

// 7. Local Dev Startup
if (!process.env.VERCEL) {
  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`🚀 Development server at http://localhost:${port}`));
}

// 8. SERVERLESS EXPORT
export default app;
