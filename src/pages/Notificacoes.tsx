import React from 'react';
import { Bell } from 'lucide-react';

export default function Notificacoes() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Notificações</h1>
      </div>

      <div className="glass-effect rounded-lg p-8 sm:p-12">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-50 rounded-full">
              <Bell className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Central de Notificações
          </h2>
          <p className="text-gray-600">
            Esta seção está em desenvolvimento e em breve exibirá todas as suas notificações e alertas do sistema.
          </p>
        </div>
      </div>
    </div>
  );
}
