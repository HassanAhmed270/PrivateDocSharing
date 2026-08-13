import express from "express";

import {
  createOrganization,
  getMyOrganization,
  getOrganizationMembers,
} from "../controllers/organizationController.js";

import { protect } from "../middleware/authMiddleware.js";
import { requireOrganization } from "../middleware/tenantMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrganization);

router.get(
  "/",
  protect,
  requireOrganization,
  getMyOrganization
);

router.get(
  "/members",
  protect,
  requireOrganization,
  getOrganizationMembers
);

export default router;