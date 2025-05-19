import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
const router = Router();

router.get("/free", authenticate);
router.post("/play", authenticate);
router.get("/logs", authenticate);

export default router;