import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { getEmployeeById, updateUser, uploadAvatar } from "../controllers/userController.js";
const router = Router();

router.get("/:employeeId", getEmployeeById);
router.put("/update", authenticate, updateUser);
router.post("/avatar", authenticate, uploadAvatar);

export default router;
