import express from "express";

import {
  getNotifications,
  markNotificationAsRead,
} from "../controllers/notificationController.js";

import { protect } from "../middleware/authMiddleware.js";
import { requireOrganization } from "../middleware/tenantMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(requireOrganization);

router.get("/", getNotifications);

router.patch(
  "/:id/read",
  markNotificationAsRead
);

export default router;