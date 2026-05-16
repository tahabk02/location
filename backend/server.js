import dotenv from "dotenv";
import path from "path";
dotenv.config(); // Standard load
dotenv.config({ path: path.resolve(process.cwd(), ".env") }); // Absolute load for safety

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
const port = process.env.PORT || 4000;

app.use(helmet({ contentSecurityPolicy: false })); // Disable CSP to avoid client issues for now
app.use(mongoSanitize());
app.use(compression());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Simple middleware
app.use(async (req, res, next) => {
  if (req.path.startsWith("/api/health")) return next();
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ error: "Connection Failed", details: error.message });
  }
});

const apiRouter = express.Router();
apiRouter.use("/auth", authRoutes);
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

app.get("/api/debug", (req, res) => {
  res.json({
    env: {
      has_uri: !!process.env.MONGODB_URI,
      db_name: process.env.MONGODB_DB,
      node_env: process.env.NODE_ENV
    },
    time: new Date().toISOString()
  });
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(port, () => console.log(`🚀 Server on ${port}`));
}

export default app;
