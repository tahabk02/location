import express from "express";
import { 
  getFinancialSummary, 
  getMonthlyStats, 
  getCarPerformance, 
  getExpenseBreakdown 
} from "../controllers/analyticsController.js";
import { authorize } from "../middleware/auth.js";

const router = express.Router();

// Apply protection and admin middleware
router.use(authorize(["admin", "superadmin"]));

router.get("/summary", getFinancialSummary);
router.get("/monthly", getMonthlyStats);
router.get("/car-performance", getCarPerformance);
router.get("/expense-breakdown", getExpenseBreakdown);

export default router;
