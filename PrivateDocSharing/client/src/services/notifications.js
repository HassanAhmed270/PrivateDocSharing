import api from './api.js';

export async function getNotifications() {
  const { data } = await api.get('/api/notifications');
  return (data?.data?.notifications ?? []).map((notification) => ({
    ...notification,
    id: notification._id ?? notification.id,
    read: Boolean(notification.isRead),
    requestId:
      notification.documentRequest?._id ??
      notification.documentRequest?.id ??
      notification.requestId ??
      null,
  }));
}

export async function markNotificationRead(id) {
  const { data } = await api.patch(`/api/notifications/${id}/read`);
  return data?.data?.notification ?? data;
}
