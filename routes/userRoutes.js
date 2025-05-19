import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { getEmployeeById } from "../controllers/userController.js";
const router = Router();

router.get("/:employeeId", getEmployeeById);
router.put("/", authenticate);
router.post("/avatar", authenticate);

export default router;