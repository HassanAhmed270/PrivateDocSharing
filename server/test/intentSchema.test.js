import assert from 'assert';
import { validateIntent, ACTIONS } from '../src/agent/intentSchema.js';

function shouldBeValid(intent) {
  const res = validateIntent(intent);
  assert.strictEqual(res.valid, true, `Expected valid but got ${JSON.stringify(res)}`);
}

function shouldBeInvalid(intent, reasonSubstring) {
  const res = validateIntent(intent);
  assert.strictEqual(res.valid, false, `Expected invalid but got valid`);
  if (reasonSubstring) {
    assert.ok(res.reason && res.reason.includes(reasonSubstring), `Reason didn't include '${reasonSubstring}': ${res.reason}`);
  }
}

// Tests
Deno = undefined; // guard in case environment sets Deno

// SEND_DOCUMENT valid
shouldBeValid({
  action: ACTIONS.SEND_DOCUMENT,
  params: {
    documentName: 'NDA.pdf',
    recipientName: 'Alice',
    requiresReview: false,
    requiresSignature: true,
  },
});

// SEND_DOCUMENT missing field
shouldBeInvalid(
  {
    action: ACTIONS.SEND_DOCUMENT,
    params: { documentName: 'NDA.pdf', recipientName: 'Alice', requiresReview: false },
  },
  'missing required param: requiresSignature'
);

// SEND_DOCUMENT extra field
shouldBeInvalid(
  {
    action: ACTIONS.SEND_DOCUMENT,
    params: {
      documentName: 'NDA.pdf',
      recipientName: 'Alice',
      requiresReview: false,
      requiresSignature: true,
      foo: 'bar',
    },
  },
  'extraneous param: foo'
);

// SHOW_PENDING_REQUESTS valid
shouldBeValid({ action: ACTIONS.SHOW_PENDING_REQUESTS, params: {} });
shouldBeValid({ action: ACTIONS.SHOW_PENDING_REQUESTS });

// SHOW_DOCUMENT_STATUS valid
shouldBeValid({ action: ACTIONS.SHOW_DOCUMENT_STATUS, params: { documentName: 'NDA.pdf' } });
// SHOW_DOCUMENT_STATUS missing
shouldBeInvalid({ action: ACTIONS.SHOW_DOCUMENT_STATUS, params: {} }, 'missing required param: documentName');

// FIND_DOCUMENTS_UNDER_DISCUSSION valid
shouldBeValid({ action: ACTIONS.FIND_DOCUMENTS_UNDER_DISCUSSION });

// VIEW_DOCUMENT_FOR_DISCUSSION valid
shouldBeValid({ action: ACTIONS.VIEW_DOCUMENT_FOR_DISCUSSION, params: { requestId: 'req-123' } });
// VIEW_DOCUMENT_FOR_DISCUSSION wrong type
shouldBeInvalid({ action: ACTIONS.VIEW_DOCUMENT_FOR_DISCUSSION, params: { requestId: 123 } }, 'expected type string');

// Unknown action
shouldBeInvalid({ action: 'DO_SOMETHING_ELSE', params: {} }, 'unknown action');

// Intent shape wrong
shouldBeInvalid(null, 'intent must be a non-null object');
shouldBeInvalid({ action: '' }, 'action must be a non-empty string');
shouldBeInvalid({ action: ACTIONS.SEND_DOCUMENT, params: 'not-object' }, 'params must be an object');

console.log('All intent schema tests passed');
