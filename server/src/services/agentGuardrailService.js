const BLOCKED_ACTIONS = new Set([
  "MARK_REQUEST_SIGNED",
  "CREATE_REQUEST",
  "INVITE_USER",
  "REGISTER_USER",
  "CHANGE_ROLE",
  "CHANGE_PERMISSION",
  "DELETE_DOCUMENT",
  "DELETE_REQUEST",
  "FORWARD_DOCUMENT",
  "SEND_DOCUMENT_CONTENT",
  "GENERATE_DOWNLOAD_LINK",
  "VIEW_AUDIT_LOGS",
  "EXPOSE_PRIVATE_USER_DATA",
]);

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /ignore\s+(the\s+)?system\s+prompt/i,
  /reveal\s+(the\s+)?system\s+prompt/i,
  /show\s+(me\s+)?your\s+system\s+prompt/i,
  /reveal\s+(your\s+)?instructions/i,
  /bypass\s+(your\s+)?rules/i,
];

export const MAX_AGENT_OUTPUT_LENGTH = 4000;

export function checkAgentGuardrails({
  user,
  intent = {},
  message = "",
  documentMetadata = {},
  contextRequestId = null,
}) {
  const violations = [];

  if (
    intent.action === "VIEW_DOCUMENT_FOR_DISCUSSION" &&
    !intent.requestId
  ) {
    violations.push("DOCUMENT_REQUEST_LINK_REQUIRED");
  }

  if (
    documentMetadata.organizationId &&
    (user?.organizationId || user?.organization) &&
    String(documentMetadata.organizationId) !==
      String(user.organizationId || user.organization)
  ) {
    violations.push("CROSS_ORGANIZATION_ACCESS");
  }

  if (
    ["completed", "rejected"].includes(
      String(documentMetadata.requestStatus || "").toLowerCase()
    ) &&
    ["VIEW_DOCUMENT_FOR_DISCUSSION"].includes(intent.action)
  ) {
    violations.push("COMPLETED_REQUEST_CONTENT_ACCESS");
  }

  if (
    contextRequestId &&
    intent.requestId &&
    String(contextRequestId) !== String(intent.requestId)
  ) {
    violations.push("REQUEST_CONTEXT_MISMATCH");
  }

  if (Array.isArray(intent.actions) && intent.actions.length > 1) {
    violations.push("MULTIPLE_ACTIONS_FORBIDDEN");
  }

  if (BLOCKED_ACTIONS.has(intent.action)) {
    violations.push(`FORBIDDEN_ACTION:${intent.action}`);
  }

  if (
    intent.action === "VIEW_AUDIT_LOGS" &&
    user?.role !== "admin"
  ) {
    violations.push("AUDIT_LOG_ADMIN_ONLY");
  }

  if (containsPromptInjection(message)) {
    violations.push("PROMPT_INJECTION_BLOCKED");
  }

  return {
    allowed: violations.length === 0,
    violations,
  };
}

export function sanitizeDocumentMetadata(metadata = {}) {
  return {
    documentId: metadata.documentId,
    requestId: metadata.requestId,
    organizationId: metadata.organizationId,
    requestStatus: metadata.requestStatus,
  };
}

export function extractRelevantText(text, maxLength = MAX_AGENT_OUTPUT_LENGTH) {
  if (!text || typeof text !== "string") {
    return "";
  }

  return text.slice(0, maxLength);
}

function containsPromptInjection(message = "") {
  return PROMPT_INJECTION_PATTERNS.some((pattern) => pattern.test(message));
}
