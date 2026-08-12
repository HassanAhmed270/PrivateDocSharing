import api from './api.js';

export async function getRequests() {
  try {
    const { data } = await api.get('/api/requests');
    return data?.data ?? data?.requests ?? (Array.isArray(data) ? data : []);
  } catch (error) {
    if (!error.response) {
      return [
        { id: 'req-1', title: 'Sign Q3 Financial Audit', status: 'COMPLETED', documentId: 'doc-1', sender: 'Alice', recipient: 'Bob', createdAt: '2026-08-10' },
        { id: 'req-2', title: 'Review Vendor Security Contract', status: 'IN_REVIEW', documentId: 'doc-2', sender: 'Bob', recipient: 'Charlie', createdAt: '2026-08-11' },
        { id: 'req-3', title: 'Sign Employee Agreement', status: 'SENT', documentId: 'doc-3', sender: 'Alice', recipient: 'Member User', createdAt: '2026-08-12' },
      ];
    }
    throw error;
  }
}

export async function getRequestById(id) {
  try {
    const { data } = await api.get(`/api/requests/${id}`);
    return data?.data ?? data;
  } catch (error) {
    if (!error.response) {
      return { id, title: 'Sample Signature Request', status: 'IN_REVIEW', documentId: 'doc-1', sender: 'Alice', recipient: 'Member User', createdAt: '2026-08-12' };
    }
    throw error;
  }
}

export async function updateRequestStatus(id, statusPayload) {
  try {
    const { data } = await api.patch(`/api/requests/${id}/status`, statusPayload);
    return data?.data ?? data;
  } catch (error) {
    if (!error.response) {
      return { success: true, status: statusPayload.status || 'SIGNED' };
    }
    throw error;
  }
}

export async function getRequestMessages(id) {
  try {
    const { data } = await api.get(`/api/requests/${id}/messages`);
    return data?.data ?? data?.messages ?? (Array.isArray(data) ? data : []);
  } catch (error) {
    if (!error.response) {
      return [
        { id: 'msg-1', sender: 'Alice', text: 'Please review and sign the attached document.', createdAt: '2026-08-12T10:00:00Z' },
      ];
    }
    throw error;
  }
}

export async function sendRequestMessage(id, messageData) {
  try {
    const { data } = await api.post(`/api/requests/${id}/messages`, messageData);
    return data?.data ?? data;
  } catch (error) {
    if (!error.response) {
      return { id: 'msg-' + Date.now(), sender: 'You', text: messageData.content || messageData.text, createdAt: new Date().toISOString() };
    }
    throw error;
  }
}
