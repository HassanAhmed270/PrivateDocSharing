import express from "express";
import { command } from "../controllers/agentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireOrganization } from "../middleware/tenantMiddleware.js";
import { agentRateLimit } from "../middleware/agentRateLimit.js";

const router = express.Router();

router.use(protect);
router.use(requireOrganization);
router.use(agentRateLimit);

router.post("/command", command);

export default router;
