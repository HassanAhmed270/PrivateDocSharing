import api from './api.js';

function normalizeDocument(document) {
  if (!document) return null;
  return {
    ...document,
    id: document._id ?? document.id,
    uploadedBy:
      document.uploadedBy?.name ??
      document.uploadedBy?.email ??
      document.uploadedBy ??
      'Unknown',
    createdAt: document.createdAt,
  };
}

export async function getDocuments() {
  const { data } = await api.get('/api/documents');
  return (data?.data?.documents ?? data?.documents ?? []).map(normalizeDocument);
}

export async function getDocumentById(id) {
  const { data } = await api.get(`/api/documents/${id}`);
  return normalizeDocument(data?.data?.document ?? data?.document ?? data);
}

export async function uploadDocument({ file, name, description }) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', name);
  formData.append('description', description || '');

  const { data } = await api.post('/api/documents', formData, {
    headers: {
      'Content-Type': undefined,
    },
  });
  return data?.data?.document ?? data?.document ?? data;
}

export async function archiveDocument(id) {
  const { data } = await api.patch(`/api/documents/${id}/archive`);
  return data?.data?.document ?? data?.document ?? data;
}

export async function downloadDocument(id, fileName = 'document') {
  const { data } = await api.get(`/api/documents/${id}?download=true`, {
    responseType: 'blob',
  });

  const blobUrl = URL.createObjectURL(data);
  const anchor = document.createElement('a');
  anchor.href = blobUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(blobUrl);
}
