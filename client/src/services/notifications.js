import api from './api.js';

export async function getNotifications() {
  try {
    const { data } = await api.get('/api/notifications');
    return data?.data ?? data?.notifications ?? (Array.isArray(data) ? data : []);
  } catch (error) {
    if (!error.response) {
      return [
        { id: 'notif-1', title: 'New Request Assigned', message: 'You have a pending document review.', read: false, createdAt: '2026-08-12T11:00:00Z', requestId: 'req-3' },
        { id: 'notif-2', title: 'Document Signed', message: 'Alice completed Q3 Financial Audit.', read: true, createdAt: '2026-08-10T14:30:00Z', requestId: 'req-1' },
      ];
    }
    throw error;
  }
}

export async function markNotificationRead(id) {
  try {
    const { data } = await api.patch(`/api/notifications/${id}/read`);
    return data?.data ?? data;
  } catch (error) {
    if (!error.response) {
      return { success: true, id, read: true };
    }
    throw error;
  }
}
