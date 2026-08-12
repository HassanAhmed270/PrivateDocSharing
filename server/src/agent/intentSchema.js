export const ACTIONS = Object.freeze({
  SEND_DOCUMENT: 'SEND_DOCUMENT',
  SHOW_PENDING_REQUESTS: 'SHOW_PENDING_REQUESTS',
  SHOW_DOCUMENT_STATUS: 'SHOW_DOCUMENT_STATUS',
  FIND_DOCUMENTS_UNDER_DISCUSSION: 'FIND_DOCUMENTS_UNDER_DISCUSSION',
  VIEW_DOCUMENT_FOR_DISCUSSION: 'VIEW_DOCUMENT_FOR_DISCUSSION',
});

const schemas = {
  [ACTIONS.SEND_DOCUMENT]: {
    required: [
      { name: 'documentName', type: 'string' },
      { name: 'recipientName', type: 'string' },
      { name: 'requiresReview', type: 'boolean' },
      { name: 'requiresSignature', type: 'boolean' },
    ],
    optional: [],
  },
  [ACTIONS.SHOW_PENDING_REQUESTS]: {
    required: [],
    optional: [],
  },
  [ACTIONS.SHOW_DOCUMENT_STATUS]: {
    required: [{ name: 'documentName', type: 'string' }],
    optional: [],
  },
  [ACTIONS.FIND_DOCUMENTS_UNDER_DISCUSSION]: {
    required: [],
    optional: [],
  },
  [ACTIONS.VIEW_DOCUMENT_FOR_DISCUSSION]: {
    required: [{ name: 'requestId', type: 'string' }],
    optional: [],
  },
};

function typeOf(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

/**
 * Pure validator for agent intents.
 * Expect intent: { action: string, params?: object }
 * Returns: { valid: boolean, reason?: string }
 */
export function validateIntent(intent) {
  if (typeof intent !== 'object' || intent === null || Array.isArray(intent)) {
    return { valid: false, reason: 'intent must be a non-null object' };
  }

  const { action, params = {} } = intent;
  if (typeof action !== 'string' || action.trim() === '') {
    return { valid: false, reason: 'action must be a non-empty string' };
  }

  if (!Object.values(ACTIONS).includes(action)) {
    return { valid: false, reason: `unknown action: ${action}` };
  }

  const schema = schemas[action];
  if (!schema) return { valid: false, reason: `no schema for action: ${action}` };

  if (typeOf(params) !== 'object') {
    return { valid: false, reason: 'params must be an object' };
  }

  // Check required fields
  for (const req of schema.required) {
    if (!(req.name in params)) {
      return { valid: false, reason: `missing required param: ${req.name}` };
    }
    const actualType = typeOf(params[req.name]);
    if (actualType !== req.type) {
      return {
        valid: false,
        reason: `param ${req.name} expected type ${req.type} but got ${actualType}`,
      };
    }
  }

  // Check there are no extra fields beyond required+optional
  const allowed = new Set([
    ...schema.required.map((r) => r.name),
    ...schema.optional.map((r) => r.name),
  ]);

  for (const key of Object.keys(params)) {
    if (!allowed.has(key)) {
      return { valid: false, reason: `extraneous param: ${key}` };
    }
  }

  return { valid: true };
}
