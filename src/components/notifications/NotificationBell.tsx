import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationItem from './NotificationItem';
import type { NotificationItem as NotificationItemType } from '../../types/notification';

interface NotificationBellProps {
  userId: string;
}

export default function NotificationBell({ userId }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const {
    notifications,
    stats,
    fetchNotifications,
    fetchStats,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    startPolling,
    stopPolling,
  } = useNotifications(userId);

  // Initial load and auto-refresh
  useEffect(() => {
    fetchNotifications();
    startPolling(30000); // 30 seconds

    return () => {
      stopPolling();
    };
  }, [fetchNotifications, startPolling, stopPolling]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Refresh notifications when opening
      fetchNotifications();
    }
  };

  const handleNotificationClick = async (notification: NotificationItemType) => {
    // Mark as read if unread
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Navigate if action_url exists
    if (notification.action_url) {
      navigate(notification.action_url);
    }

    // Close dropdown
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    await fetchStats();
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate('/notificacoes');
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    await fetchStats();
  };

  // Get last 5 notifications
  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon with Badge */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notificações"
      >
        <span className="text-2xl">🔔</span>
        
        {stats.unread_count > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {stats.unread_count > 99 ? '99+' : stats.unread_count}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Notificações
            </h3>
            {stats.unread_count > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <span className="text-4xl mb-2">🔔</span>
                <p className="text-sm">Nenhuma notificação</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentNotifications.map((notification) => (
                  <div key={notification.id} className="p-2">
                    <NotificationItem
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onDelete={handleDelete}
                      onClick={handleNotificationClick}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {recentNotifications.length > 0 && (
            <div className="border-t border-gray-200 p-3">
              <button
                onClick={handleViewAll}
                className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 font-medium hover:bg-blue-50 rounded transition-colors"
              >
                Ver todas as notificações
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
