import Document from "../models/Document.js";
import DocumentRequest from "../models/DocumentRequest.js";
import User from "../models/User.js";
import {
  createInternalDocumentRequest,
} from "./documentRequestService.js";
import { getDecryptedDocumentText } from "./documentStorageService.js";
import { canUserAccessDocument } from "./documentAccessService.js";
import {
  answerDocumentQuestion,
} from "./agentService.js";
import { extractRelevantText } from "./agentGuardrailService.js";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function findDocumentByName(user, documentName) {
  return Document.findOne({
    organization: user.organization,
    name: {
      $regex: `^${escapeRegex(documentName.trim())}$`,
      $options: "i",
    },
    status: "active",
  }).select("+encryptionIv +encryptionAuthTag");
}

export async function executeAgentIntent(intent, user, originalMessage) {
  switch (intent.action) {
    case "SEND_DOCUMENT":
      return executeSendDocument(intent, user);

    case "SHOW_PENDING_REQUESTS":
      return executeShowPendingRequests(user);

    case "SHOW_DOCUMENT_STATUS":
      return executeShowDocumentStatus(intent, user);

    case "FIND_DOCUMENTS_UNDER_DISCUSSION":
      return executeFindDocumentsUnderDiscussion(user);

    case "VIEW_DOCUMENT_FOR_DISCUSSION":
      return executeViewDocumentForDiscussion(
        intent,
        user,
        originalMessage
      );

    default:
      throw Object.assign(
        new Error(`Unsupported action: ${intent.action}`),
        { status: 400 }
      );
  }
}

async function executeSendDocument(intent, user) {
  const document = await findDocumentByName(user, intent.documentName);

  if (!document) {
    throw Object.assign(
      new Error(`No active document named "${intent.documentName}" was found.`),
      { status: 404 }
    );
  }

  const recipient = await User.findOne({
    organization: user.organization,
    name: {
      $regex: `^${escapeRegex(intent.recipientName.trim())}$`,
      $options: "i",
    },
  }).select("_id name email role organization");

  if (!recipient) {
    throw Object.assign(
      new Error(
        `No internal recipient named "${intent.recipientName}" was found in your organization.`
      ),
      { status: 404 }
    );
  }

  const request = await createInternalDocumentRequest({
    organizationId: user.organization,
    requestedBy: user._id,
    documentId: document._id,
    recipientId: recipient._id,
    message: [
      "Created by PrivateAI Agent.",
      `Requires review: ${intent.requiresReview ? "yes" : "no"}.`,
      `Requires signature: ${intent.requiresSignature ? "yes" : "no"}.`,
    ].join(" "),
  });

  return {
    action: "SEND_DOCUMENT",
    request,
  };
}

async function executeShowPendingRequests(user) {
  const requests = await DocumentRequest.find({
    organization: user.organization,
    recipient: user._id,
    status: "pending",
  })
    .populate("document", "name fileName mimeType fileSize")
    .populate("requestedBy", "name role")
    .sort({ createdAt: -1 });

  return {
    action: "SHOW_PENDING_REQUESTS",
    requests,
  };
}

async function executeShowDocumentStatus(intent, user) {
  const document = await findDocumentByName(user, intent.documentName);

  if (!document) {
    return {
      action: "SHOW_DOCUMENT_STATUS",
      found: false,
      message: `No active document named "${intent.documentName}" was found.`,
    };
  }

  const hasAccess = await canUserAccessDocument({
    document,
    userId: user._id,
    organizationId: user.organization,
  });

  if (!hasAccess) {
    return {
      action: "SHOW_DOCUMENT_STATUS",
      found: false,
      message: `No accessible document named "${intent.documentName}" was found.`,
    };
  }

  const latestRequest = await DocumentRequest.findOne({
    organization: user.organization,
    document: document._id,
    $or: [
      { requestedBy: user._id },
      { recipient: user._id },
    ],
  })
    .sort({ createdAt: -1 })
    .select("status createdAt updatedAt");

  return {
    action: "SHOW_DOCUMENT_STATUS",
    found: true,
    document: {
      id: document._id,
      name: document.name,
      status: document.status,
      isEncrypted: document.isEncrypted,
      latestRequestStatus: latestRequest?.status || null,
      updatedAt: document.updatedAt,
    },
  };
}

async function executeFindDocumentsUnderDiscussion(user) {
  const requests = await DocumentRequest.find({
    organization: user.organization,
    status: "discussion",
    $or: [
      { requestedBy: user._id },
      { recipient: user._id },
    ],
  })
    .populate("document", "name fileName mimeType fileSize")
    .sort({ updatedAt: -1 });

  return {
    action: "FIND_DOCUMENTS_UNDER_DISCUSSION",
    documents: requests.map((request) => ({
      requestId: request._id,
      status: request.status,
      document: request.document,
    })),
  };
}

async function executeViewDocumentForDiscussion(
  intent,
  user,
  originalMessage
) {
  const request = await DocumentRequest.findOne({
    _id: intent.requestId,
    organization: user.organization,
    recipient: user._id,
    status: {
      $in: ["in_review", "discussion"],
    },
  }).populate("document");

  if (!request) {
    throw Object.assign(
      new Error(
        "The discussion request was not found, is outside your organization, or is not currently available for discussion."
      ),
      { status: 403 }
    );
  }

  if (!request.document) {
    throw Object.assign(
      new Error("The document linked to this request was not found."),
      { status: 404 }
    );
  }

  const document = await Document.findOne({
    _id: request.document._id,
    organization: user.organization,
    status: "active",
  }).select("+encryptionIv +encryptionAuthTag");

  if (!document) {
    throw Object.assign(
      new Error("The document linked to this request was not found."),
      { status: 404 }
    );
  }

  if (!document.isEncrypted) {
    throw Object.assign(
      new Error("This document is not stored in the required encrypted format."),
      { status: 409 }
    );
  }

  const extracted = await getDecryptedDocumentText(document);

  if (!extracted.supported) {
    return {
      action: "VIEW_DOCUMENT_FOR_DISCUSSION",
      requestId: request._id,
      found: true,
      answer: extracted.reason,
    };
  }

  const relevantText = extractRelevantText(extracted.text, 4000);

  // The decrypted buffer/text is used only in this call path and is not
  // persisted, cached, logged, or returned to the client.
  const answer = await answerDocumentQuestion(
    originalMessage,
    relevantText
  );

  return {
    action: "VIEW_DOCUMENT_FOR_DISCUSSION",
    requestId: request._id,
    found: true,
    answer,
  };
}
