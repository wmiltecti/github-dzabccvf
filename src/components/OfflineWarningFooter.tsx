import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface OfflineWarningFooterProps {
  isOffline: boolean;
  onRetry?: () => void;
}

export default function OfflineWarningFooter({ isOffline, onRetry }: OfflineWarningFooterProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  if (!isOffline) return null;

  const handleRetry = async () => {
    if (onRetry) {
      setIsRetrying(true);
      try {
        await onRetry();
      } finally {
        setIsRetrying(false);
      }
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-orange-500 text-white px-6 py-4 shadow-lg z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 flex-shrink-0" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="font-semibold">Modo Offline:</span>
            <span className="text-sm">
              Dados sendo salvos localmente. Serão sincronizados automaticamente quando conexão for restabelecida.
            </span>
          </div>
        </div>
        {onRetry && (
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="flex items-center gap-2 px-4 py-2 bg-white text-orange-600 rounded-lg font-medium hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Sincronizando...' : 'Tentar Sincronizar'}
          </button>
        )}
      </div>
    </div>
  );
}
