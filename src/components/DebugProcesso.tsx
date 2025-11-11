import React from 'react';

interface DebugProcessoProps {
  processoId?: string | null;
}

/**
 * Componente de debug para informações do processo
 * Exibe informações do localStorage e contexto relacionadas ao processo
 * Para uso futuro - atualmente não utilizado
 */
export default function DebugProcesso({ processoId }: DebugProcessoProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white text-xs py-2 px-4 border-t border-gray-700 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-green-400">🔍 DEBUG PROCESSO:</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Process ID:</span>
            <span className="font-mono text-yellow-300">
              {localStorage.getItem('processId') || 'null'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">User ID:</span>
            <span className="font-mono text-yellow-300">
              {localStorage.getItem('userId') || 'null'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Processo ID (Context):</span>
            <span className="font-mono text-orange-300">
              {processoId || 'null'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Auth Token:</span>
            <span className="font-mono text-yellow-300">
              {localStorage.getItem('auth_token') ? '✓ Present' : '✗ Missing'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-[10px]">
            {new Date().toLocaleTimeString('pt-BR')}
          </span>
        </div>
      </div>
    </div>
  );
}
