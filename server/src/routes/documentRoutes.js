import express from "express";

import {
  createDocument,
  getDocuments,
  getDocumentById,
  archiveDocument,
} from "../controllers/documentController.js";

import { protect } from "../middleware/authMiddleware.js";
import { requireOrganization } from "../middleware/tenantMiddleware.js";
import { uploadDocumentFile } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(requireOrganization);

router.post("/", uploadDocumentFile, createDocument);

router.get("/", getDocuments);
router.get("/:id", getDocumentById);
router.patch("/:id/archive", archiveDocument);

export default router;
