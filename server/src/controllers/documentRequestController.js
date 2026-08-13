import crypto from "crypto";
import DocumentRequest from "../models/DocumentRequest.js";
import Document from "../models/Document.js";
import User from "../models/User.js";
import ExternalRecipient from "../models/ExternalRecipient.js";
import DocumentRequestAudit from "../models/DocumentRequestAudit.js";
import Notification from "../models/Notification.js";
import { createInternalDocumentRequest } from "../services/documentRequestService.js";
import {
  getDecryptedDocumentText,
} from "../services/documentStorageService.js";

import {
  answerDocumentQuestion,
} from "../services/agentService.js";

import {
  extractRelevantText,
} from "../services/agentGuardrailService.js";
const generateExternalAccessToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const hashExternalAccessToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const findExternalRequestByToken = async (token) => {
  if (!token) return null;

  const tokenHash = hashExternalAccessToken(token);

  const request = await DocumentRequest.findOne({
    externalAccessTokenHash: tokenHash,
    recipientType: "external",
    externalRecipient: { $ne: null },
  });

  if (!request) return null;

  if (
    !request.externalAccessTokenExpiresAt ||
    request.externalAccessTokenExpiresAt.getTime() < Date.now()
  ) {
    return null;
  }

  return request;
};

const createRequestAudit = async ({
  request,
  action,
  actorType,
  actor = null,
  actorModel = null,
  metadata = {},
}) => {
  return DocumentRequestAudit.create({
    organization: request.organization,
    documentRequest: request._id,
    action,
    actorType,
    actor,
    actorModel,
    metadata,
  });
};

const createNotification = async ({
  request,
  recipientType,
  recipient,
  recipientModel,
  type,
  title,
  message,
  actionUrl = null,
}) => {
  return Notification.create({
    organization: request.organization,
    recipientType,
    recipient,
    recipientModel,
    type,
    title,
    message,
    documentRequest: request._id,
    actionUrl,
  });
};

export const createDocumentRequest = async (req, res) => {
  try {
    const {
      documentId,
      recipientType,
      recipientId,
      externalRecipientId,
      message,
    } = req.body;

    if (!documentId || !recipientType) {
      return res.status(400).json({
        success: false,
        message: "documentId and recipientType are required.",
      });
    }

    if (!["internal", "external"].includes(recipientType)) {
      return res.status(400).json({
        success: false,
        message: "recipientType must be internal or external.",
      });
    }

    if (recipientType === "internal") {
      try {
        const request = await createInternalDocumentRequest({
          organizationId: req.organizationId,
          requestedBy: req.user._id,
          documentId,
          recipientId,
          message: message?.trim() || "",
        });

        return res.status(201).json({
          success: true,
          message: "Document request created successfully.",
          data: { request },
        });
      } catch (error) {
        return res.status(error.status || 500).json({
          success: false,
          message: error.status
            ? error.message
            : "Server error while creating document request.",
        });
      }
    }

    const document = await Document.findOne({
      _id: documentId,
      organization: req.organizationId,
      status: "active",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    if (!externalRecipientId) {
      return res.status(400).json({
        success: false,
        message: "externalRecipientId is required for external requests.",
      });
    }

    const externalRecipient = await ExternalRecipient.findOne({
      _id: externalRecipientId,
      organization: req.organizationId,
      status: "active",
    });

    if (!externalRecipient) {
      return res.status(404).json({
        success: false,
        message: "External recipient not found.",
      });
    }

    const existingRequest = await DocumentRequest.findOne({
      organization: req.organizationId,
      document: documentId,
      recipientType: "external",
      externalRecipient: externalRecipientId,
      status: {
        $in: ["pending", "opened", "in_review", "discussion"],
      },
    });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: "An active request already exists for this recipient.",
      });
    }

    const request = await DocumentRequest.create({
      organization: req.organizationId,
      document: documentId,
      requestedBy: req.user._id,
      recipientType: "external",
      recipient: null,
      externalRecipient: externalRecipientId,
      message: message?.trim() || "",
      status: "pending",
    });

    await createNotification({
      request,
      recipientType: "external_recipient",
      recipient: externalRecipient._id,
      recipientModel: "ExternalRecipient",
      type: "document_request",
      title: "New document request",
      message: "You have received a new document request for review.",
    });

    await createRequestAudit({
      request,
      action: "created",
      actorType: "internal_user",
      actor: req.user._id,
      actorModel: "User",
    });

    const populatedRequest = await DocumentRequest.findById(request._id)
      .populate("document", "name fileName mimeType fileSize")
      .populate("requestedBy", "name email role")
      .populate(
        "externalRecipient",
        "name email company phone status"
      );

    return res.status(201).json({
      success: true,
      message: "Document request created successfully.",
      data: { request: populatedRequest },
    });
  } catch (error) {
    console.error("Create document request error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating document request.",
    });
  }
};

export const getDocumentRequests = async (req, res) => {
  try {
    const requests = await DocumentRequest.find({
      organization: req.organizationId,
    })
      .populate("document", "name fileName mimeType fileSize")
      .populate("requestedBy", "name email role")
      .populate("recipient", "name email role")
      .populate(
        "externalRecipient",
        "name email company phone status"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: { requests },
    });
  } catch (error) {
    console.error("Get document requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching document requests.",
    });
  }
};

export const getDocumentRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await DocumentRequest.findOne({
      _id: id,
      organization: req.organizationId,
    })
      .populate("document", "name fileName mimeType fileSize")
      .populate("requestedBy", "name email role")
      .populate("recipient", "name email role")
      .populate(
        "externalRecipient",
        "name email company phone status"
      );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Document request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: { request },
    });
  } catch (error) {
    console.error("Get document request error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching document request.",
    });
  }
};

export const reviewDocumentRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await DocumentRequest.findOne({
      _id: id,
      organization: req.organizationId,
      recipient: req.user._id,
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Pending document request not found.",
      });
    }

    request.status = "in_review";
    await request.save();

    return res.status(200).json({
      success: true,
      message: "Document request moved to review.",
      data: { request },
    });
  } catch (error) {
    console.error("Review document request error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while reviewing document request.",
    });
  }
};

export const discussDocumentRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (
      !comment ||
      typeof comment !== "string" ||
      !comment.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Comment is required.",
      });
    }

    const request = await DocumentRequest.findOne({
      _id: id,
      organization: req.organizationId,
      recipient: req.user._id,
      status: {
        $in: ["pending", "in_review", "discussion"],
      },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Document request not found.",
      });
    }

    const document = await Document.findOne({
      _id: request.document,
      organization: req.organizationId,
      status: "active",
    }).select(
      "+encryptionIv +encryptionAuthTag"
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "The document linked to this request was not found.",
      });
    }

    if (!document.isEncrypted) {
      return res.status(409).json({
        success: false,
        message:
          "This document is not stored in the required encrypted format.",
      });
    }

    const cleanComment = comment.trim();

    /*
     * The request enters discussion mode.
     */
    request.status = "discussion";
    request.recipientComment = cleanComment;

    /*
     * Decrypt the document only inside this authenticated
     * discussion request.
     *
     * The decrypted content is never saved back to MongoDB,
     * never returned to the frontend, and never exposed as a URL.
     */
    const extracted = await getDecryptedDocumentText(
      document
    );

    if (!extracted.supported) {
      await request.save();

      await createRequestAudit({
        request,
        action: "discussed",
        actorType: "internal_user",
        actor: req.user._id,
        actorModel: "User",
        metadata: {
          comment: cleanComment,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Discussion started successfully.",
        data: {
          request,
          discussion: {
            userMessage: cleanComment,
            agentResponse: extracted.reason,
          },
        },
      });
    }

    /*
     * Bound the decrypted document before passing it to Gemini.
     */
    const relevantText = extractRelevantText(
      extracted.text,
      12000
    );

    /*
     * Gemini receives:
     *   1. The user's current review question.
     *   2. The decrypted content of the authorized document.
     *
     * It does not receive unrelated documents or requests.
     */
    const agentResponse = await answerDocumentQuestion(
      cleanComment,
      relevantText
    );

    await request.save();

    await createRequestAudit({
      request,
      action: "discussed",
      actorType: "internal_user",
      actor: req.user._id,
      actorModel: "User",
      metadata: {
        comment: cleanComment,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Discussion processed successfully.",
      data: {
        request,
        discussion: {
          userMessage: cleanComment,
          agentResponse,
        },
      },
    });
  } catch (error) {
    console.error(
      "Discuss document request error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while processing document discussion.",
    });
  }
};

export const acceptDocumentRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await DocumentRequest.findOne({
      _id: id,
      organization: req.organizationId,
      recipient: req.user._id,
      status: {
        $in: ["pending", "in_review", "discussion"],
      },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Document request not found.",
      });
    }

    request.status = "accepted";
    await request.save();

    return res.status(200).json({
      success: true,
      message: "Document request accepted.",
      data: { request },
    });
  } catch (error) {
    console.error("Accept document request error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while accepting document request.",
    });
  }
};

export const rejectDocumentRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    const request = await DocumentRequest.findOne({
      _id: id,
      organization: req.organizationId,
      recipient: req.user._id,
      status: {
        $in: ["pending", "in_review", "discussion"],
      },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Document request not found.",
      });
    }

    request.status = "rejected";

    if (comment?.trim()) {
      request.recipientComment = comment.trim();
    }

    await request.save();

    return res.status(200).json({
      success: true,
      message: "Document request rejected.",
      data: { request },
    });
  } catch (error) {
    console.error("Reject document request error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while rejecting document request.",
    });
  }
};

/*
 * INTERNAL SIGN
 *
 * Receives:
 * {
 *   "signature": "data:image/png;base64,..."
 * }
 *
 * The signature is stored directly on the request.
 */
export const signDocumentRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { signature } = req.body;

    if (!signature || typeof signature !== "string") {
      return res.status(400).json({
        success: false,
        message: "Signature is required.",
      });
    }

    const request = await DocumentRequest.findOne({
      _id: id,
      organization: req.organizationId,
      recipient: req.user._id,
      status: "accepted",
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Accepted document request not found.",
      });
    }

    request.signature = signature;
    request.status = "signed";
    request.signedAt = new Date();

    await request.save();

    await createRequestAudit({
      request,
      action: "signed",
      actorType: "internal_user",
      actor: req.user._id,
      actorModel: "User",
    });

    await createNotification({
      request,
      recipientType: "internal_user",
      recipient: request.requestedBy,
      recipientModel: "User",
      type: "document_request_signed",
      title: "Document request signed",
      message: "The recipient has signed the document request.",
    });

    return res.status(200).json({
      success: true,
      message: "Document request signed successfully.",
      data: {
        request,
      },
    });
  } catch (error) {
    console.error("Sign document request error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while signing document request.",
    });
  }
};

export const completeDocumentRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await DocumentRequest.findOne({
      _id: id,
      organization: req.organizationId,
      requestedBy: req.user._id,
      status: "signed",
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Signed document request not found.",
      });
    }

    request.status = "completed";
    request.completedAt = new Date();

    await request.save();

    return res.status(200).json({
      success: true,
      message: "Document request completed successfully.",
      data: { request },
    });
  } catch (error) {
    console.error("Complete document request error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while completing document request.",
    });
  }
};

export const cancelDocumentRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await DocumentRequest.findOne({
      _id: id,
      organization: req.organizationId,
      requestedBy: req.user._id,
      status: {
        $in: ["pending", "in_review", "discussion"],
      },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Active document request not found.",
      });
    }

    request.status = "cancelled";

    await request.save();

    return res.status(200).json({
      success: true,
      message: "Document request cancelled successfully.",
      data: { request },
    });
  } catch (error) {
    console.error("Cancel document request error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while cancelling document request.",
    });
  }
};

export const openExternalDocumentRequest = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Access token is required.",
      });
    }

    const request = await findExternalRequestByToken(token);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired access link.",
      });
    }

    if (!["pending", "opened"].includes(request.status)) {
      return res.status(409).json({
        success: false,
        message:
          "This document request cannot be opened from its current status.",
      });
    }

    const wasPending = request.status === "pending";

    request.status = "opened";

    if (!request.externalAccessUsedAt) {
      request.externalAccessUsedAt = new Date();
    }

    await request.save();

    if (wasPending) {
      await createRequestAudit({
        request,
        action: "opened",
        actorType: "external_recipient",
        actor: request.externalRecipient,
        actorModel: "ExternalRecipient",
      });
    }

    return res.status(200).json({
      success: true,
      message: "External document request opened.",
      data: { request },
    });
  } catch (error) {
    console.error("Open external document request error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while opening document request.",
    });
  }
};

export const generateExternalAccess = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await DocumentRequest.findOne({
      _id: id,
      organization: req.organizationId,
      recipientType: "external",
      externalRecipient: { $ne: null },
      status: {
        $in: [
          "pending",
          "opened",
          "in_review",
          "discussion",
        ],
      },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "External document request not found.",
      });
    }

    const rawToken = generateExternalAccessToken();
    const tokenHash = hashExternalAccessToken(rawToken);

    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    request.externalAccessTokenHash = tokenHash;
    request.externalAccessTokenExpiresAt = expiresAt;
    request.externalAccessUsedAt = null;

    await request.save();

    const accessUrl =
      `${req.protocol}://${req.get("host")}` +
      `/api/public/document-requests/${rawToken}`;

    return res.status(200).json({
      success: true,
      message: "External access link generated successfully.",
      data: {
        accessUrl,
        expiresAt,
      },
    });
  } catch (error) {
    console.error("Generate external access error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while generating external access.",
    });
  }
};

export const accessExternalDocumentRequest = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Access token is required.",
      });
    }

    const tokenHash = hashExternalAccessToken(token);

    const request = await DocumentRequest.findOne({
      externalAccessTokenHash: tokenHash,
      recipientType: "external",
      externalRecipient: { $ne: null },
    })
      .populate(
        "document",
        "name fileName mimeType fileSize description"
      )
      .populate(
        "externalRecipient",
        "name email company phone"
      );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Invalid document access link.",
      });
    }

    if (
      !request.externalAccessTokenExpiresAt ||
      request.externalAccessTokenExpiresAt.getTime() < Date.now()
    ) {
      return res.status(410).json({
        success: false,
        message: "Document access link has expired.",
      });
    }

    if (
      ![
        "pending",
        "opened",
        "in_review",
        "discussion",
        "accepted",
      ].includes(request.status)
    ) {
      return res.status(409).json({
        success: false,
        message: "This document request is no longer available.",
      });
    }

    if (!request.externalAccessUsedAt) {
      request.externalAccessUsedAt = new Date();
    }

    if (request.status === "pending") {
      request.status = "opened";
    }

    await request.save();

    return res.status(200).json({
      success: true,
      data: {
        request: {
          id: request._id,
          status: request.status,
          message: request.message,
          document: request.document,
          externalRecipient: request.externalRecipient,
          expiresAt: request.externalAccessTokenExpiresAt,
        },
      },
    });
  } catch (error) {
    console.error("Access external document request error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while accessing document request.",
    });
  }
};

export const externalReviewDocumentRequest = async (req, res) => {
  try {
    const { token } = req.params;

    const request = await findExternalRequestByToken(token);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired access link.",
      });
    }

    if (!["opened", "pending"].includes(request.status)) {
      return res.status(409).json({
        success: false,
        message: "This document request cannot be moved to review.",
      });
    }

    request.status = "in_review";

    await createRequestAudit({
      request,
      action: "reviewed",
      actorType: "external_recipient",
      actor: request.externalRecipient,
      actorModel: "ExternalRecipient",
    });

    await request.save();

    return res.status(200).json({
      success: true,
      message: "Document request is now under review.",
      data: { request },
    });
  } catch (error) {
    console.error("External review document request error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while reviewing document request.",
    });
  }
};

export const externalAcceptDocumentRequest = async (req, res) => {
  try {
    const { token } = req.params;

    const request = await findExternalRequestByToken(token);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired access link.",
      });
    }

    if (!["in_review", "discussion"].includes(request.status)) {
      return res.status(409).json({
        success: false,
        message:
          "Document request cannot be accepted from its current status.",
      });
    }

    request.status = "accepted";

    await createNotification({
      request,
      recipientType: "internal_user",
      recipient: request.requestedBy,
      recipientModel: "User",
      type: "document_request_accepted",
      title: "Document request accepted",
      message:
        "The external recipient has accepted your document request.",
    });

    await createRequestAudit({
      request,
      action: "accepted",
      actorType: "external_recipient",
      actor: request.externalRecipient,
      actorModel: "ExternalRecipient",
    });

    await request.save();

    return res.status(200).json({
      success: true,
      message: "Document request accepted successfully.",
      data: { request },
    });
  } catch (error) {
    console.error("External accept document request error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while accepting document request.",
    });
  }
};

export const externalRejectDocumentRequest = async (req, res) => {
  try {
    const { token } = req.params;

    const request = await findExternalRequestByToken(token);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired access link.",
      });
    }

    if (
      !["opened", "in_review", "discussion"].includes(
        request.status
      )
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Document request cannot be rejected from its current status.",
      });
    }

    request.status = "rejected";

    await createNotification({
      request,
      recipientType: "internal_user",
      recipient: request.requestedBy,
      recipientModel: "User",
      type: "document_request_rejected",
      title: "Document request rejected",
      message:
        "The external recipient has rejected your document request.",
    });

    await createRequestAudit({
      request,
      action: "rejected",
      actorType: "external_recipient",
      actor: request.externalRecipient,
      actorModel: "ExternalRecipient",
    });

    await request.save();

    return res.status(200).json({
      success: true,
      message: "Document request rejected successfully.",
      data: { request },
    });
  } catch (error) {
    console.error("External reject document request error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while rejecting document request.",
    });
  }
};

/*
 * EXTERNAL SIGN
 *
 * Receives:
 * {
 *   "signature": "data:image/png;base64,..."
 * }
 */
export const externalSignDocumentRequest = async (req, res) => {
  try {
    const { token } = req.params;
    const { signature } = req.body;

    if (!signature || typeof signature !== "string") {
      return res.status(400).json({
        success: false,
        message: "Signature is required.",
      });
    }

    const request = await findExternalRequestByToken(token);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired access link.",
      });
    }

    if (request.status !== "accepted") {
      return res.status(409).json({
        success: false,
        message: "Document must be accepted before signing.",
      });
    }

    request.signature = signature;
    request.status = "signed";
    request.signedAt = new Date();

    await createNotification({
      request,
      recipientType: "internal_user",
      recipient: request.requestedBy,
      recipientModel: "User",
      type: "document_request_signed",
      title: "Document request signed",
      message:
        "The external recipient has signed the document request.",
    });

    await createRequestAudit({
      request,
      action: "signed",
      actorType: "external_recipient",
      actor: request.externalRecipient,
      actorModel: "ExternalRecipient",
    });

    await request.save();

    return res.status(200).json({
      success: true,
      message: "Document request signed successfully.",
      data: { request },
    });
  } catch (error) {
    console.error("External sign document request error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while signing document request.",
    });
  }
};

export const externalCompleteDocumentRequest = async (req, res) => {
  try {
    const { token } = req.params;

    const request = await findExternalRequestByToken(token);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired access link.",
      });
    }

    if (request.status !== "signed") {
      return res.status(409).json({
        success: false,
        message: "Document request must be signed before completion.",
      });
    }

    request.status = "completed";

    await createNotification({
      request,
      recipientType: "internal_user",
      recipient: request.requestedBy,
      recipientModel: "User",
      type: "document_request_completed",
      title: "Document request completed",
      message:
        "The external document request has been completed.",
    });

    await createRequestAudit({
      request,
      action: "completed",
      actorType: "external_recipient",
      actor: request.externalRecipient,
      actorModel: "ExternalRecipient",
    });

    await request.save();

    return res.status(200).json({
      success: true,
      message: "Document request completed successfully.",
      data: { request },
    });
  } catch (error) {
    console.error("External complete document request error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while completing document request.",
    });
  }
};