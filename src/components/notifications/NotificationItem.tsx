import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { NotificationItem as NotificationItemType, NotificationSeverity } from '../../types/notification';

interface NotificationItemProps {
  notification: NotificationItemType;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: (notification: NotificationItemType) => void;
}

const severityConfig: Record<
  NotificationSeverity,
  {
    bgColor: string;
    textColor: string;
    borderColor: string;
    icon: string;
  }
> = {
  INFO: {
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-300',
    icon: 'ℹ️',
  },
  SUCCESS: {
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-300',
    icon: '✅',
  },
  WARNING: {
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-300',
    icon: '⚠️',
  },
  ERROR: {
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-300',
    icon: '❌',
  },
};

export default function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
}: NotificationItemProps) {
  const config = severityConfig[notification.severity];
  const isRead = notification.is_read;

  const handleClick = () => {
    if (onClick) {
      onClick(notification);
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead(notification.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Deseja realmente deletar esta notificação?')) {
      onDelete(notification.id);
    }
  };

  const relativeTime = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border transition-all
        ${isRead ? 'bg-white opacity-60' : 'bg-gray-50'}
        ${onClick ? 'cursor-pointer hover:shadow-md' : ''}
      `}
      onClick={handleClick}
    >
      {/* Severity Icon */}
      <div
        className={`
          flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
          ${config.bgColor} ${config.borderColor} border-2
        `}
      >
        <span className="text-xl">{config.icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-gray-900 text-sm">
            {notification.title}
          </h4>
          {!isRead && (
            <span className="flex-shrink-0 inline-block px-2 py-0.5 text-xs font-medium bg-blue-500 text-white rounded-full">
              Nova
            </span>
          )}
        </div>
        
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
          {notification.message}
        </p>
        
        <p className="mt-1 text-xs text-gray-400">
          {relativeTime}
        </p>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex gap-2">
        {!isRead && (
          <button
            onClick={handleMarkAsRead}
            className="p-1.5 rounded hover:bg-gray-200 transition-colors"
            title="Marcar como lida"
          >
            <span className="text-green-600 text-lg">✓</span>
          </button>
        )}
        
        <button
          onClick={handleDelete}
          className="p-1.5 rounded hover:bg-gray-200 transition-colors"
          title="Deletar"
        >
          <span className="text-red-600 text-lg">🗑️</span>
        </button>
      </div>
    </div>
  );
}
