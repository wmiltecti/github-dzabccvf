import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationService } from '../services/notificationService';
import type { NotificationItem, NotificationStats } from '../types/notification';

interface UseNotificationsReturn {
  notifications: NotificationItem[];
  stats: NotificationStats;
  loading: boolean;
  error: string | null;
  
  fetchNotifications: (isRead?: boolean) => Promise<void>;
  fetchStats: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  
  startPolling: (intervalMs?: number) => void;
  stopPolling: () => void;
}

/**
 * Custom hook for managing notifications state and operations
 */
export function useNotifications(userId: string): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    unread_count: 0,
    total_count: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch notifications with optional filter
   */
  const fetchNotifications = useCallback(async (isRead?: boolean) => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await notificationService.getNotifications(userId, 0, 20, isRead);
      setNotifications(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Fetch notification statistics
   */
  const fetchStats = useCallback(async () => {
    if (!userId) return;
    
    try {
      const data = await notificationService.getStats(userId);
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [userId]);

  /**
   * Mark notification as read (optimistic update)
   */
  const markAsRead = useCallback(async (id: string) => {
    if (!userId) return;
    
    // Optimistic update
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
    );
    setStats(prev => ({
      ...prev,
      unread_count: Math.max(0, prev.unread_count - 1),
    }));
    
    try {
      await notificationService.markAsRead(id, userId);
    } catch (err) {
      // Rollback on error
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: false } : n))
      );
      setStats(prev => ({
        ...prev,
        unread_count: prev.unread_count + 1,
      }));
      setError(err instanceof Error ? err.message : 'Erro ao marcar como lida');
    }
  }, [userId]);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    
    // Optimistic update
    setNotifications(prev =>
      prev.map(n => ({ ...n, is_read: true }))
    );
    const previousUnreadCount = stats.unread_count;
    setStats(prev => ({
      ...prev,
      unread_count: 0,
    }));
    
    try {
      await notificationService.markAllAsRead(userId);
    } catch (err) {
      // Rollback on error
      setStats(prev => ({
        ...prev,
        unread_count: previousUnreadCount,
      }));
      setError(err instanceof Error ? err.message : 'Erro ao marcar todas como lidas');
    }
  }, [userId, stats.unread_count]);

  /**
   * Delete notification (optimistic update)
   */
  const deleteNotification = useCallback(async (id: string) => {
    if (!userId) return;
    
    // Store for rollback
    const notificationToDelete = notifications.find(n => n.id === id);
    
    // Optimistic update
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (notificationToDelete && !notificationToDelete.is_read) {
      setStats(prev => ({
        unread_count: Math.max(0, prev.unread_count - 1),
        total_count: Math.max(0, prev.total_count - 1),
      }));
    } else {
      setStats(prev => ({
        ...prev,
        total_count: Math.max(0, prev.total_count - 1),
      }));
    }
    
    try {
      await notificationService.deleteNotification(id, userId);
    } catch (err) {
      // Rollback on error
      if (notificationToDelete) {
        setNotifications(prev => [...prev, notificationToDelete]);
        setStats(prev => ({
          unread_count: !notificationToDelete.is_read ? prev.unread_count + 1 : prev.unread_count,
          total_count: prev.total_count + 1,
        }));
      }
      setError(err instanceof Error ? err.message : 'Erro ao deletar notificação');
    }
  }, [userId, notifications]);

  /**
   * Start polling for stats updates
   */
  const startPolling = useCallback((intervalMs: number = 30000) => {
    stopPolling(); // Clear any existing interval
    
    // Initial fetch
    fetchStats();
    
    // Set up polling
    pollingIntervalRef.current = setInterval(() => {
      fetchStats();
    }, intervalMs);
  }, [fetchStats]);

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    notifications,
    stats,
    loading,
    error,
    fetchNotifications,
    fetchStats,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    startPolling,
    stopPolling,
  };
}
