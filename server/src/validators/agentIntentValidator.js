const ACTIONS = {
  SEND_DOCUMENT: {
    requiredFields: [
      "documentName",
      "recipientName",
      "requiresReview",
      "requiresSignature",
    ],
  },
  SHOW_PENDING_REQUESTS: { requiredFields: [] },
  SHOW_DOCUMENT_STATUS: { requiredFields: ["documentName"] },
  FIND_DOCUMENTS_UNDER_DISCUSSION: { requiredFields: [] },
  VIEW_DOCUMENT_FOR_DISCUSSION: { requiredFields: ["requestId"] },
};

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

export function validateAgentIntent(intent) {
  if (!intent || typeof intent !== "object" || Array.isArray(intent)) {
    return { valid: false, reason: "Intent must be a JSON object." };
  }

  if (!isNonEmptyString(intent.action)) {
    return { valid: false, reason: "Intent must contain a valid action." };
  }

  const definition = ACTIONS[intent.action];

  if (!definition) {
    return {
      valid: false,
      reason: `Action '${intent.action}' is not allowed.`,
    };
  }

  for (const field of definition.requiredFields) {
    if (!(field in intent)) {
      return {
        valid: false,
        reason: `Missing required field: ${field}.`,
      };
    }
  }

  if (
    intent.action === "SEND_DOCUMENT" &&
    (!isNonEmptyString(intent.documentName) ||
      !isNonEmptyString(intent.recipientName) ||
      typeof intent.requiresReview !== "boolean" ||
      typeof intent.requiresSignature !== "boolean")
  ) {
    return {
      valid: false,
      reason:
        "SEND_DOCUMENT requires documentName, recipientName, requiresReview and requiresSignature with valid types.",
    };
  }

  if (
    intent.action === "SHOW_DOCUMENT_STATUS" &&
    !isNonEmptyString(intent.documentName)
  ) {
    return {
      valid: false,
      reason: "documentName must be a non-empty string.",
    };
  }

  if (
    intent.action === "VIEW_DOCUMENT_FOR_DISCUSSION" &&
    !isNonEmptyString(intent.requestId)
  ) {
    return {
      valid: false,
      reason: "requestId must be a non-empty string.",
    };
  }

  return { valid: true, reason: "Intent is valid." };
}

export { ACTIONS };
