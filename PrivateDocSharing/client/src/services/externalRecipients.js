import api from './api.js';

export async function getExternalRecipients() {
  const { data } = await api.get('/api/external-recipients');
  return data?.data?.recipients ?? [];
}

export async function createExternalRecipient(payload) {
  const { data } = await api.post('/api/external-recipients', payload);
  return data?.data?.recipient ?? data;
}

export async function deactivateExternalRecipient(id) {
  const { data } = await api.patch(`/api/external-recipients/${id}/deactivate`);
  return data?.data?.recipient ?? data;
}
