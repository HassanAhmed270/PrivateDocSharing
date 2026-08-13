import api from './api.js';

function normalizeRequest(request) {
  if (!request) return null;

  const document = request.document && typeof request.document === 'object'
    ? request.document
    : null;
  const sender = request.requestedBy && typeof request.requestedBy === 'object'
    ? request.requestedBy
    : null;
  const recipient = request.recipient && typeof request.recipient === 'object'
    ? request.recipient
    : null;
  const external = request.externalRecipient && typeof request.externalRecipient === 'object'
    ? request.externalRecipient
    : null;

  return {
    ...request,
    id: request._id ?? request.id,
    title: document?.name ?? request.title ?? `Request #${request._id ?? request.id}`,
    documentId: document?._id ?? request.documentId ?? request.document,
    sender: sender?.name ?? request.sender ?? 'Unknown',
    recipient: recipient?.name ?? external?.name ?? request.recipientName ?? 'External recipient',
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    document,
  };
}

export async function getRequests() {
  const { data } = await api.get('/api/document-requests');
  const requests = data?.data?.requests ?? data?.requests ?? [];
  return requests.map(normalizeRequest);
}

export async function getRequestById(id) {
  const { data } = await api.get(`/api/document-requests/${id}`);
  return normalizeRequest(data?.data?.request ?? data?.request ?? data);
}

export async function createRequest(payload) {
  const { data } = await api.post('/api/document-requests', payload);
  return normalizeRequest(data?.data?.request ?? data?.request ?? data);
}

export async function reviewRequest(id) {
  const { data } = await api.patch(`/api/document-requests/${id}/review`);
  return normalizeRequest(data?.data?.request ?? data?.request ?? data);
}


export async function acceptRequest(id) {
  const { data } = await api.patch(`/api/document-requests/${id}/accept`);
  return normalizeRequest(data?.data?.request ?? data?.request ?? data);
}

export async function rejectRequest(id, comment = '') {
  const { data } = await api.patch(`/api/document-requests/${id}/reject`, { comment });
  return normalizeRequest(data?.data?.request ?? data?.request ?? data);
}

export async function signRequest(id, signature) {
  const { data } = await api.patch(
    `/api/document-requests/${id}/sign`,
    { signature }
  );

  return normalizeRequest(
    data?.data?.request ?? data?.request ?? data
  );
}
export async function discussRequest(id, comment) {
  if (!comment?.trim()) {
    throw new Error("Discussion message is required.");
  }

  const { data } = await api.patch(
    `/api/document-requests/${id}/discuss`,
    {
      comment: comment.trim(),
    }
  );

  return {
    request: normalizeRequest(
      data?.data?.request ?? data?.request ?? data
    ),
    discussion: data?.data?.discussion ?? null,
  };
}
export async function completeRequest(id) {
  const { data } = await api.patch(`/api/document-requests/${id}/complete`);
  return normalizeRequest(data?.data?.request ?? data?.request ?? data);
}

export async function cancelRequest(id) {
  const { data } = await api.patch(`/api/document-requests/${id}/cancel`);
  return normalizeRequest(data?.data?.request ?? data?.request ?? data);
}

export async function getRequestHistory(id) {
  const { data } = await api.get(`/api/document-requests/${id}/history`);
  return data?.data?.history ?? data?.history ?? [];
}

export async function generateExternalAccess(id) {
  const { data } = await api.post(`/api/document-requests/${id}/external-access`);
  return data?.data ?? data;
}
