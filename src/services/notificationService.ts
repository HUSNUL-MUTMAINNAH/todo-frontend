import api from './api';

export interface NotificationLog {
  id: number;
  user_id: number;
  task_id: number | null;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const notificationService = {
  async getNotifications(): Promise<NotificationLog[]> {
    const response = await api.get<{ notifications: NotificationLog[] }>('/notifications');
    return response.data.notifications;
  },

  async markAsRead(id: number | string): Promise<{ message: string }> {
    const response = await api.put<{ message: string }>(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead(): Promise<{ message: string }> {
    const response = await api.put<{ message: string }>('/notifications/read-all');
    return response.data;
  },

  async deleteNotification(id: number | string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/notifications/${id}`);
    return response.data;
  },

  async deleteAllNotifications(): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>('/notifications');
    return response.data;
  },

  async createNotificationLog(task_id: number | null, title: string, message: string): Promise<NotificationLog> {
    const response = await api.post<{ notification: NotificationLog }>('/notifications', { task_id, title, message });
    return response.data.notification;
  }
};
