import Document from "../models/Document.js";

export async function checkAgentPermission(user, intent) {
  if (!user || !intent) {
    return { allowed: false, reason: "User and intent are required." };
  }

  if (
    ![
      "SEND_DOCUMENT",
      "SHOW_PENDING_REQUESTS",
      "SHOW_DOCUMENT_STATUS",
      "FIND_DOCUMENTS_UNDER_DISCUSSION",
      "VIEW_DOCUMENT_FOR_DISCUSSION",
    ].includes(intent.action)
  ) {
    return { allowed: false, reason: "Action is not permitted." };
  }

  if (intent.action !== "SEND_DOCUMENT") {
    return { allowed: true, reason: "Permission granted." };
  }

  // The current backend roles are admin/user. An admin may send documents,
  // while a regular user may send only documents they uploaded.
  if (user.role === "admin") {
    return { allowed: true, reason: "Permission granted." };
  }

  const document = await Document.findOne({
    organization: user.organization,
    name: {
      $regex: `^${escapeRegex(intent.documentName.trim())}$`,
      $options: "i",
    },
    status: "active",
  }).select("uploadedBy");

  if (!document) {
    return {
      allowed: false,
      reason: "The requested document was not found in your organization.",
    };
  }

  if (String(document.uploadedBy) !== String(user._id)) {
    return {
      allowed: false,
      reason: "Only the document owner or an administrator may send this document.",
    };
  }

  return { allowed: true, reason: "Permission granted." };
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
