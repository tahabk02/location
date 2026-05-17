import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import compression from "compression";
import { connectDB } from "./config/db.js";

// Routes
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

// Webhook
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), handleWebhook);

// Middleware
app.use(helmet({ contentSecurityPolicy: false })); 
app.use(mongoSanitize());
app.use(compression());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// DB Connection Middleware
app.use(async (req, res, next) => {
  if (req.path === "/api/health" || req.path === "/api/ping") return next();
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("DB connection error:", error.message);
    res.status(500).json({ success: false, message: "Database connection failed" });
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

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.get("/", (req, res) => res.send("Backend Live"));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Fatal Error:", err);
  res.status(500).json({ success: false, message: err.message, stack: err.stack });
});

// Start locally
if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`🚀 Server on http://localhost:${port}`));
}

export default app;
