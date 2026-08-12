import { ALLOWED_ROLES } from '../models/Document.js';
import { createHttpError } from '../utils/httpError.js';

function requireString(value, field) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw createHttpError(400, `${field} is required`);
  }
  return value.trim();
}

function optionalString(value) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

export function getActorId(req) {
  return optionalString(req.header('x-user-id')) || optionalString(req.body?.actorId) || optionalString(req.query?.actorId);
}

export function requireActorId(req) {
  const actorId = getActorId(req);
  if (!actorId) {
    throw createHttpError(401, 'x-user-id header or actorId is required');
  }
  return actorId;
}

export function validateCreateDocument(body) {
  return {
    title: requireString(body.title, 'title'),
    description: optionalString(body.description),
    ownerId: optionalString(body.ownerId),
    storageKey: optionalString(body.storageKey),
    mimeType: optionalString(body.mimeType),
    size: typeof body.size === 'number' ? body.size : undefined,
  };
}

export function validateRole(role, field = 'role') {
  const normalized = requireString(role, field);
  if (!ALLOWED_ROLES.includes(normalized)) {
    throw createHttpError(400, `${field} must be one of: ${ALLOWED_ROLES.join(', ')}`);
  }
  return normalized;
}

export function validateAccessRequest(body) {
  return {
    userId: requireString(body.userId, 'userId'),
    requestedRole: validateRole(body.requestedRole || 'viewer', 'requestedRole'),
    message: optionalString(body.message),
  };
}

export function validateReviewRequest(body) {
  const status = requireString(body.status, 'status');
  if (!['approved', 'rejected'].includes(status)) {
    throw createHttpError(400, 'status must be approved or rejected');
  }
  return {
    status,
    role: status === 'approved' ? validateRole(body.role || body.requestedRole || 'viewer') : undefined,
  };
}
