import axios from 'axios';
import type {
  NotificationItem,
  NotificationListResponse,
  NotificationStats,
  NotificationActionResponse,
} from '../types/notification';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://fastapi-sandbox-ee3p.onrender.com/api/v1';

// Helper to get auth token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Notification Service - API layer for notification management
 */
export const notificationService = {
  /**
   * Get paginated list of notifications
   */
  async getNotifications(
    userId: string,
    skip: number = 0,
    limit: number = 20,
    isRead?: boolean
  ): Promise<NotificationListResponse> {
    try {
      const params: Record<string, string | number> = {
        user_id: userId,
        skip,
        limit,
      };

      if (isRead !== undefined) {
        params.is_read = isRead;
      }

      const response = await axios.get<NotificationListResponse>(
        `${API_BASE_URL}/notifications`,
        {
          params,
          headers: getAuthHeaders(),
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new Error('Falha ao carregar notificações');
    }
  },

  /**
   * Get notification statistics (unread/total counts)
   */
  async getStats(userId: string): Promise<NotificationStats> {
    try {
      const response = await axios.get<NotificationStats>(
        `${API_BASE_URL}/notifications/stats`,
        {
          params: { user_id: userId },
          headers: getAuthHeaders(),
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw new Error('Falha ao carregar estatísticas');
    }
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<NotificationActionResponse> {
    try {
      const response = await axios.put<NotificationActionResponse>(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        null,
        {
          params: { user_id: userId },
          headers: getAuthHeaders(),
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Falha ao marcar notificação como lida');
    }
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<NotificationActionResponse> {
    try {
      const response = await axios.put<NotificationActionResponse>(
        `${API_BASE_URL}/notifications/read-all`,
        null,
        {
          params: { user_id: userId },
          headers: getAuthHeaders(),
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw new Error('Falha ao marcar todas como lidas');
    }
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<NotificationActionResponse> {
    try {
      const response = await axios.delete<NotificationActionResponse>(
        `${API_BASE_URL}/notifications/${notificationId}`,
        {
          params: { user_id: userId },
          headers: getAuthHeaders(),
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error('Falha ao deletar notificação');
    }
  },
};
