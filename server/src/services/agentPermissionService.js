import Document from "../models/Document.js";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function checkAgentPermission(
  user,
  intent
) {
  if (!user || !intent) {
    return {
      allowed: false,
      reason: "User and intent are required.",
    };
  }

  const allowedActions = [
    "SEND_DOCUMENT",
    "SHOW_PENDING_REQUESTS",
    "SHOW_DOCUMENT_STATUS",
    "FIND_DOCUMENTS_UNDER_DISCUSSION",
    "VIEW_DOCUMENT_FOR_DISCUSSION",
  ];

  if (!allowedActions.includes(intent.action)) {
    return {
      allowed: false,
      reason: "Action is not permitted.",
    };
  }

  if (intent.action !== "SEND_DOCUMENT") {
    return {
      allowed: true,
      reason: "Permission granted.",
    };
  }

  if (
    !intent.documentName ||
    typeof intent.documentName !== "string"
  ) {
    return {
      allowed: false,
      reason:
        "A document name is required to send a document.",
    };
  }

  if (
    !intent.recipientName ||
    typeof intent.recipientName !== "string"
  ) {
    return {
      allowed: false,
      reason:
        "A recipient name is required to send a document.",
    };
  }

  // Administrators can send active documents
  // belonging to their organization.
  if (user.role === "admin") {
    return {
      allowed: true,
      reason: "Permission granted.",
    };
  }

  const cleanDocumentName =
    intent.documentName.trim();

  const document =
    await Document.findOne({
      organization: user.organization,
      status: "active",
      $or: [
        {
          name: {
            $regex: `^${escapeRegex(
              cleanDocumentName
            )}$`,
            $options: "i",
          },
        },
        {
          fileName: {
            $regex: `^${escapeRegex(
              cleanDocumentName
            )}$`,
            $options: "i",
          },
        },
      ],
    }).select("uploadedBy");

  if (!document) {
    return {
      allowed: false,
      reason:
        "The requested document was not found in your organization.",
    };
  }

  if (
    String(document.uploadedBy) !==
    String(user._id)
  ) {
    return {
      allowed: false,
      reason:
        "Only the document owner or an administrator may send this document.",
    };
  }

  return {
    allowed: true,
    reason: "Permission granted.",
  };
}