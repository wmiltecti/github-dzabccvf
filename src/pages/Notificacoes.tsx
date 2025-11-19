import React from 'react';
import NotificationCenter from '../components/notifications/NotificationCenter';
import { getUserId } from '../utils/authToken';

export default function Notificacoes() {
  const userId = getUserId();

  if (!userId) {
    return (
      <div className="space-y-6">
        <div className="glass-effect rounded-lg p-8 text-center">
          <p className="text-gray-600">Você precisa estar autenticado para ver as notificações.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <NotificationCenter userId={userId} />
    </div>
  );
}
