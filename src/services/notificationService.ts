import apiClient from './api';

export interface Notification {
  id: string;
  userId: string;
  type:
    | 'EVENT_INVITATION'
    | 'EVENT_UPDATE'
    | 'CLUB_INVITATION'
    | 'CLUB_UPDATE'
    | 'FRIEND_REQUEST'
    | 'SYSTEM';
  title: string;
  message: string;
  data: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  totalCount: number;
  unreadCount: number;
  page: number;
  limit: number;
}

class NotificationService {
  // Bildirimleri listele
  async getNotifications(
    page = 1,
    limit = 20,
  ): Promise<NotificationListResponse> {
    try {
      const response = await apiClient.get('/notifications', {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Bildirimi okundu olarak işaretle
  async markAsRead(notificationId: string): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.patch(
        `/notifications/${notificationId}/read`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Tüm bildirimleri okundu olarak işaretle
  async markAllAsRead(): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.patch('/notifications/read-all');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Bildirimi sil
  async deleteNotification(
    notificationId: string,
  ): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.delete(
        `/notifications/${notificationId}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Tüm bildirimleri sil
  async deleteAllNotifications(): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.delete('/notifications');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Okunmamış bildirimlerin sayısını getir
  async getUnreadCount(): Promise<{ count: number }> {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Bildirim ayarlarını getir
  async getNotificationSettings(): Promise<{
    pushNotifications: boolean;
    emailNotifications: boolean;
    eventNotifications: boolean;
    clubNotifications: boolean;
    friendNotifications: boolean;
  }> {
    try {
      const response = await apiClient.get('/user/notification-settings');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Bildirim ayarlarını güncelle
  async updateNotificationSettings(settings: {
    pushNotifications?: boolean;
    emailNotifications?: boolean;
    eventNotifications?: boolean;
    clubNotifications?: boolean;
    friendNotifications?: boolean;
  }): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.patch(
        '/user/notification-settings',
        settings,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // OneSignal oyuncu kimliğini güncelle
  async updateOneSignalPlayerId(
    playerId: string,
  ): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.put('/user/onesignal-id', {
        oneSignalPlayerId: playerId,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new NotificationService();
