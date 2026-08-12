import Document from '../models/Document.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createHttpError } from '../utils/httpError.js';
import {
  requireActorId,
  validateAccessRequest,
  validateCreateDocument,
  validateReviewRequest,
} from '../validators/documentValidators.js';

async function findDocumentOr404(id) {
  const document = await Document.findById(id);
  if (!document) {
    throw createHttpError(404, 'Document not found');
  }
  return document;
}

function assertOwner(document, actorId) {
  if (document.ownerId !== actorId) {
    throw createHttpError(403, 'Only the document owner can perform this action');
  }
}

export const listDocuments = asyncHandler(async (req, res) => {
  const actorId = requireActorId(req);
  const documents = await Document.find({
    $or: [{ ownerId: actorId }, { 'access.userId': actorId }],
  }).sort({ updatedAt: -1 });
  res.json({ success: true, data: documents });
});

export const createDocument = asyncHandler(async (req, res) => {
  const actorId = requireActorId(req);
  const payload = validateCreateDocument(req.body);
  const document = await Document.create({ ...payload, ownerId: payload.ownerId || actorId });
  res.status(201).json({ success: true, data: document });
});

export const getDocument = asyncHandler(async (req, res) => {
  const actorId = requireActorId(req);
  const document = await findDocumentOr404(req.params.id);
  if (!document.hasAccess(actorId)) {
    throw createHttpError(403, 'You do not have access to this document');
  }
  res.json({ success: true, data: document });
});

export const requestDocumentAccess = asyncHandler(async (req, res) => {
  const document = await findDocumentOr404(req.params.id);
  const payload = validateAccessRequest(req.body);

  if (document.hasAccess(payload.userId)) {
    throw createHttpError(409, 'User already has access to this document');
  }

  const existing = document.accessRequests.find(
    (request) => request.userId === payload.userId && request.status === 'pending',
  );
  if (existing) {
    existing.requestedRole = payload.requestedRole;
    existing.message = payload.message;
  } else {
    document.accessRequests.push(payload);
  }

  await document.save();
  res.status(201).json({ success: true, data: document.accessRequests });
});

export const reviewAccessRequest = asyncHandler(async (req, res) => {
  const actorId = requireActorId(req);
  const document = await findDocumentOr404(req.params.id);
  assertOwner(document, actorId);

  const review = validateReviewRequest(req.body);
  const request = document.accessRequests.id(req.params.requestId);
  if (!request) {
    throw createHttpError(404, 'Access request not found');
  }
  if (request.status !== 'pending') {
    throw createHttpError(409, 'Access request has already been reviewed');
  }

  request.status = review.status;
  request.reviewedBy = actorId;
  request.reviewedAt = new Date();

  if (review.status === 'approved') {
    document.upsertAccess(request.userId, review.role || request.requestedRole);
  }

  await document.save();
  res.json({ success: true, data: document });
});
