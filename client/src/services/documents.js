import api from './api.js';

export async function getDocuments() {
  try {
    const { data } = await api.get('/api/documents');
    return data?.data ?? data?.documents ?? (Array.isArray(data) ? data : []);
  } catch (error) {
    if (!error.response) {
      return [
        { id: 'doc-1', name: 'Q3 Financial Audit.pdf', status: 'COMPLETED', uploadedBy: 'Alice', createdAt: '2026-08-10' },
        { id: 'doc-2', name: 'Vendor Security Review.pdf', status: 'IN_REVIEW', uploadedBy: 'Bob', createdAt: '2026-08-11' },
        { id: 'doc-3', name: 'Employee Agreement.pdf', status: 'PENDING', uploadedBy: 'Alice', createdAt: '2026-08-12' },
      ];
    }
    throw error;
  }
}

export async function getDocumentById(id) {
  try {
    const { data } = await api.get(`/api/documents/${id}`);
    return data?.data ?? data;
  } catch (error) {
    if (!error.response) {
      return { id, name: 'Sample Document.pdf', status: 'IN_REVIEW', uploadedBy: 'Alice', createdAt: '2026-08-12' };
    }
    throw error;
  }
}

export async function uploadDocument(formData) {
  try {
    const { data } = await api.post('/api/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (error) {
    if (!error.response) {
      return { success: true, message: 'Document uploaded (Demo Mode)', id: 'doc-' + Date.now() };
    }
    throw error;
  }
}
