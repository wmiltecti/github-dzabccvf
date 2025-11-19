import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationItem from './NotificationItem';
import type { NotificationItem as NotificationItemType } from '../../types/notification';

interface NotificationCenterProps {
  userId: string;
}

type FilterTab = 'all' | 'unread' | 'read';

export default function NotificationCenter({ userId }: NotificationCenterProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [page, setPage] = useState(0);
  const navigate = useNavigate();

  const {
    notifications,
    stats,
    loading,
    error,
    fetchNotifications,
    fetchStats,
    markAsRead,
    deleteNotification,
  } = useNotifications(userId);

  // Load notifications when tab changes
  useEffect(() => {
    const isReadFilter = activeTab === 'all' ? undefined : activeTab === 'read';
    fetchNotifications(isReadFilter);
    fetchStats();
    setPage(0); // Reset pagination
  }, [activeTab, fetchNotifications, fetchStats]);

  const handleNotificationClick = async (notification: NotificationItemType) => {
    // Mark as read if unread
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Navigate if action_url exists
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    await fetchStats();
  };

  const tabs = [
    { id: 'all' as FilterTab, label: 'Todas', count: stats.total_count },
    { id: 'unread' as FilterTab, label: 'Não lidas', count: stats.unread_count },
    { id: 'read' as FilterTab, label: 'Lidas', count: stats.total_count - stats.unread_count },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Central de Notificações
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Gerencie suas notificações e mantenha-se atualizado
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 px-6 py-4 text-sm font-medium transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                {tab.label}
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <span className="font-medium">Erro:</span> {error}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Notifications List */}
        {!loading && (
          <div className="space-y-3">
            {notifications.length === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <span className="text-6xl mb-4 block">🔔</span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma notificação
                </h3>
                <p className="text-sm text-gray-600">
                  {activeTab === 'unread'
                    ? 'Você não tem notificações não lidas'
                    : activeTab === 'read'
                    ? 'Você não tem notificações lidas'
                    : 'Você não tem notificações ainda'}
                </p>
              </div>
            ) : (
              /* Notifications */
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={handleDelete}
                  onClick={handleNotificationClick}
                />
              ))
            )}
          </div>
        )}

        {/* Pagination (placeholder for future implementation) */}
        {!loading && notifications.length > 0 && (
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="px-4 py-2 text-sm text-gray-700">
              Página {page + 1}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={notifications.length < 20}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
