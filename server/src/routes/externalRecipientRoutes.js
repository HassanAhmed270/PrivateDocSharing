import express from "express";

import {
  createExternalRecipient,
  getExternalRecipients,
  getExternalRecipientById,
  deactivateExternalRecipient,
} from "../controllers/externalRecipientController.js";

import { protect } from "../middleware/authMiddleware.js";
import { requireOrganization } from "../middleware/tenantMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(requireOrganization);

router.post("/", createExternalRecipient);

router.get("/", getExternalRecipients);

router.get("/:id", getExternalRecipientById);

router.patch("/:id/deactivate", deactivateExternalRecipient);

export default router;