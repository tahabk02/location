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
import paymentRoutes, { handleWebhook } from "./routes/paymentRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root
dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();
const port = process.env.PORT ?? 4000;

// Simple test route for Vercel diagnostic
app.get("/api/ping", (req, res) => {
  res.json({ message: "pong", timestamp: new Date().toISOString() });
});

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

// Stricter Rate Limiting for Auth
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 requests per hour
  message: "Trop de tentatives. Veuillez réessayer dans une heure."
});
app.use("/api/auth/forgot-password", authLimiter);

// Webhook MUST be before express.json()
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), handleWebhook);

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" })); // Reduced limit for better security, adjust if necessary
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Middleware to ensure DB is connected
app.use(async (req, res, next) => {
  try {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    await connectDB();
    next();
  } catch (error) {
    console.error("❌ Database connection error during request:", error.message);
    res.status(500).json({ 
      message: "Database connection error", 
      error: error.message // Show error even in production for now to debug Vercel
    });
  }
});

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

app.get("/api/health", async (_req, res) => {
  try {
    await connectDB();
    res.json({ 
      status: "ok", 
      message: "AVENIR KAMIL CAR Backend is running.",
      env: {
        node_env: process.env.NODE_ENV,
        has_mongo: !!process.env.MONGODB_URI,
        has_stripe: !!process.env.STRIPE_SECRET_KEY
      }
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
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
