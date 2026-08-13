import express from "express";
import {getDocumentRequestAuditHistory,} from "../controllers/documentRequestAuditController.js";
import {
  createDocumentRequest,
  getDocumentRequests,
  getDocumentRequestById,
  reviewDocumentRequest,
  discussDocumentRequest,
  acceptDocumentRequest,
  rejectDocumentRequest,
  signDocumentRequest,
  completeDocumentRequest,
  cancelDocumentRequest,
  openExternalDocumentRequest,
  generateExternalAccess,
  accessExternalDocumentRequest,
  externalReviewDocumentRequest,
  externalAcceptDocumentRequest,
  externalRejectDocumentRequest,
  externalSignDocumentRequest,
  externalCompleteDocumentRequest,
} from "../controllers/documentRequestController.js";

import { protect } from "../middleware/authMiddleware.js";
import { requireOrganization } from "../middleware/tenantMiddleware.js";

const router = express.Router();

/*
 * Public external access
 * No JWT required.
 */
router.get(
  "/public/:token",
  accessExternalDocumentRequest
);

router.patch(
  "/public/:token/review",
  externalReviewDocumentRequest
);

router.patch(
  "/public/:token/accept",
  externalAcceptDocumentRequest
);

router.patch(
  "/public/:token/reject",
  externalRejectDocumentRequest
);

router.patch(
  "/public/:token/sign",
  externalSignDocumentRequest
);

router.patch(
  "/public/:token/complete",
  externalCompleteDocumentRequest
);
/*
 * Authenticated organization routes
 */
router.use(protect);
router.use(requireOrganization);
router.get("/:id/history", getDocumentRequestAuditHistory);

router.post("/", createDocumentRequest);

router.get("/", getDocumentRequests);

router.get("/:id", getDocumentRequestById);

router.patch(
  "/public/:token",
  openExternalDocumentRequest
);

router.post(
  "/:id/external-access",
  generateExternalAccess
);

router.patch(
  "/:id/review",
  reviewDocumentRequest
);

router.patch(
  "/:id/discuss",
  discussDocumentRequest
);

router.patch(
  "/:id/accept",
  acceptDocumentRequest
);

router.patch(
  "/:id/reject",
  rejectDocumentRequest
);

router.patch(
  "/:id/sign",
  signDocumentRequest
);

router.patch(
  "/:id/complete",
  completeDocumentRequest
);

router.patch(
  "/:id/cancel",
  cancelDocumentRequest
);

export default router;