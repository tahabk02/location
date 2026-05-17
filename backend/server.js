import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import compression from "compression";
import { connectDB } from "./config/db.js";

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

// Initialize environment variables for local dev
if (!process.env.VERCEL) {
  dotenv.config();
}

const app = express();

/**
 * PRODUCTION VISIBILITY PATCH & SERVERLESS OPTIMIZATION
 */
try {
  // 1. Webhook (Must be before body-parser)
  app.post("/api/payments/webhook", express.raw({ type: "application/json" }), handleWebhook);

  // 2. Global Middleware
  app.use(helmet({ contentSecurityPolicy: false })); 
  app.use(mongoSanitize());
  app.use(compression());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  // 3. Database Connection Middleware (Awaited for each request)
  app.use(async (req, res, next) => {
    // Skip DB for health checks
    if (req.path === "/api/health" || req.path === "/api/ping") return next();
    
    try {
      await connectDB();
      next();
    } catch (dbError) {
      console.error("🔥 FATAL DB ERROR:", dbError.message);
      res.status(500).json({ 
        success: false, 
        message: "DATABASE_CONNECTION_FAILED", 
        error: dbError.message,
        stack: process.env.NODE_ENV === "development" ? dbError.stack : undefined
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

  // 5. Health Check Endpoints
  app.get("/api/health", (req, res) => res.json({ status: "ok", env: process.env.NODE_ENV }));
  app.get("/", (req, res) => res.send("Backend Live and Operational"));

  // 6. Global Error Handler (Reveals exact errors in JSON)
  app.use((err, req, res, next) => {
    console.error("🔥 UNHANDLED EXCEPTION:", err);
    res.status(500).json({
      success: false,
      message: "FATAL_SERVER_ERROR",
      error: err.message,
      stack: err.stack,
      path: req.path
    });
  });

} catch (initError) {
  console.error("❌ SERVER INITIALIZATION FAILED:", initError);
}

// 7. Local Startup (Disabled on Vercel)
if (!process.env.VERCEL) {
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`🚀 Development server running at http://localhost:${port}`);
  });
}

// 8. EXPORT FOR VERCEL HANDLER
export default app;
