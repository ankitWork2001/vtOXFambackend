import { Router } from "express";
import { authenticate, checkAdmin } from "../middleware/authMiddleware.js";
import { createInvestmentPlan, getAllTransactions, getAllUsers, getDashboardStats, toggleUserStatus,getSpinLogs, getReferralStats } from "../controllers/adminController.js";


const router = Router();

router.post('/investment/plan',authenticate,checkAdmin,createInvestmentPlan);


router.get('/users', authenticate, checkAdmin, getAllUsers);

router.get('/dashboard', authenticate, checkAdmin, getDashboardStats);

router.post('/user/:id/ban', authenticate, checkAdmin,toggleUserStatus );


router.get('/wallet/transactions', authenticate, checkAdmin,getAllTransactions);



router.get('/spins/logs', authenticate, checkAdmin, getSpinLogs);


router.get('/referrals', authenticate, checkAdmin,getReferralStats );

export default router;
