import DocumentRequest from "../models/DocumentRequest.js";
import Document from "../models/Document.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import DocumentRequestAudit from "../models/DocumentRequestAudit.js";

async function createRequestAudit({
  request,
  action,
  actorType,
  actor = null,
  actorModel = null,
  metadata = {},
}) {
  return DocumentRequestAudit.create({
    organization: request.organization,
    documentRequest: request._id,
    action,
    actorType,
    actor,
    actorModel,
    metadata,
  });
}

async function createNotification({
  request,
  recipientType,
  recipient,
  recipientModel,
  type,
  title,
  message,
  actionUrl = null,
}) {
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
}

export async function createInternalDocumentRequest({
  organizationId,
  requestedBy,
  documentId,
  recipientId,
  message = "",
}) {
  const document = await Document.findOne({
    _id: documentId,
    organization: organizationId,
    status: "active",
  });

  if (!document) {
    const error = new Error("Document not found.");
    error.status = 404;
    throw error;
  }

  const recipient = await User.findOne({
    _id: recipientId,
    organization: organizationId,
  });

  if (!recipient) {
    const error = new Error("Internal recipient not found.");
    error.status = 404;
    throw error;
  }

  if (recipient._id.toString() === requestedBy.toString()) {
    const error = new Error("You cannot send a request to yourself.");
    error.status = 400;
    throw error;
  }

  const existingRequest = await DocumentRequest.findOne({
    organization: organizationId,
    document: documentId,
    recipientType: "internal",
    recipient: recipientId,
    status: {
      $in: ["pending", "in_review", "discussion"],
    },
  });

  if (existingRequest) {
    const error = new Error(
      "An active request already exists for this recipient."
    );
    error.status = 409;
    throw error;
  }

  const request = await DocumentRequest.create({
    organization: organizationId,
    document: documentId,
    requestedBy,
    recipientType: "internal",
    recipient: recipientId,
    externalRecipient: null,
    message: message.trim(),
    status: "pending",
  });

  await createNotification({
    request,
    recipientType: "internal_user",
    recipient: recipient._id,
    recipientModel: "User",
    type: "document_request",
    title: "New document request",
    message: "You have received a new document request for review.",
  });

  await createRequestAudit({
    request,
    action: "created",
    actorType: "internal_user",
    actor: requestedBy,
    actorModel: "User",
  });

  return DocumentRequest.findById(request._id)
    .populate("document", "name fileName mimeType fileSize")
    .populate("requestedBy", "name email role")
    .populate("recipient", "name email role");
}
