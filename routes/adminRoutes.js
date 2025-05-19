import { Router } from "express";
import { authenticate, checkAdmin } from "../middleware/authMiddleware.js";
import { createInvestmentPlan } from "../controllers/adminController.js";

const router = Router();

router.post('/investment/plan',authenticate,checkAdmin,createInvestmentPlan);

export default router;