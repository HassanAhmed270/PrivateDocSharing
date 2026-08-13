import assert from "node:assert/strict";
import test from "node:test";
import { validateAgentIntent } from "./agentIntentValidator.js";

test("validates every allowed action", () => {
  const intents = [
    {
      action: "SEND_DOCUMENT",
      documentName: "contract.pdf",
      recipientName: "Ahmed",
      requiresReview: true,
      requiresSignature: true,
    },
    { action: "SHOW_PENDING_REQUESTS" },
    {
      action: "SHOW_DOCUMENT_STATUS",
      documentName: "contract.pdf",
    },
    { action: "FIND_DOCUMENTS_UNDER_DISCUSSION" },
    {
      action: "VIEW_DOCUMENT_FOR_DISCUSSION",
      requestId: "request-id",
    },
  ];

  for (const intent of intents) {
    assert.equal(validateAgentIntent(intent).valid, true);
  }
});

test("rejects unknown actions", () => {
  assert.equal(
    validateAgentIntent({ action: "DELETE_DOCUMENT" }).valid,
    false
  );
});

test("rejects malformed required fields", () => {
  assert.equal(
    validateAgentIntent({
      action: "SEND_DOCUMENT",
      documentName: "doc",
      recipientName: "user",
      requiresReview: "true",
      requiresSignature: true,
    }).valid,
    false
  );
});
