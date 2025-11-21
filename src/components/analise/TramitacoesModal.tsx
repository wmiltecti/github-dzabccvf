import React from 'react';
import { X, ArrowRightLeft, User, Building2, Calendar, FileText } from 'lucide-react';

interface TramitacoesModalProps {
  processoId: string;
  numeroProcesso: string;
  onClose: () => void;
}

interface Tramitacao {
  id: string;
  tecnico: string;
  setor: string;
  dataHora: string;
  etapaOrigem: string;
  etapaDestino: string;
  texto?: string;
}

const mockTramitacoes: Tramitacao[] = [
  {
    id: '1',
    tecnico: 'Maria Santos - CREA 67890',
    setor: 'Setor de Análise Ambiental',
    dataHora: '2025-11-10T10:30:00',
    etapaOrigem: 'Pré-processo',
    etapaDestino: 'Análise Técnica',
    texto: 'Processo formalizado e encaminhado para análise técnica. Documentação inicial está completa.'
  },
  {
    id: '2',
    tecnico: 'João Silva - CREA 12345',
    setor: 'Setor de Análise Ambiental',
    dataHora: '2025-11-15T14:20:00',
    etapaOrigem: 'Análise Técnica',
    etapaDestino: 'Análise Documental',
    texto: 'Encaminhado para análise documental. Verificar pendências relacionadas aos documentos do imóvel.'
  },
  {
    id: '3',
    tecnico: 'Carlos Oliveira - CRMV 11223',
    setor: 'Setor de Vistoria',
    dataHora: '2025-11-18T09:15:00',
    etapaOrigem: 'Análise Documental',
    etapaDestino: 'Vistoria Técnica',
    texto: 'Documentação aprovada. Processo encaminhado para agendamento de vistoria técnica in loco.'
  },
  {
    id: '4',
    tecnico: 'Ana Costa - CREA 33445',
    setor: 'Coordenação Técnica',
    dataHora: '2025-11-20T16:45:00',
    etapaOrigem: 'Vistoria Técnica',
    etapaDestino: 'Análise Final'
  }
];

export default function TramitacoesModal({
  processoId,
  numeroProcesso,
  onClose
}: TramitacoesModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <ArrowRightLeft className="w-6 h-6 text-amber-700" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Histórico de Tramitações</h3>
              <p className="text-sm text-gray-600">Processo: {numeroProcesso}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {mockTramitacoes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ArrowRightLeft className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">Nenhuma tramitação registrada para este processo</p>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline vertical */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                {mockTramitacoes.map((tramitacao, index) => (
                  <div key={tramitacao.id} className="relative pl-20 pb-8 last:pb-0">
                    {/* Círculo do timeline */}
                    <div className="absolute left-6 w-5 h-5 bg-amber-700 rounded-full border-4 border-white shadow-md"></div>

                    {/* Card da tramitação */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-5">
                        {/* Header do Card */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <ArrowRightLeft className="w-5 h-5 text-amber-700" />
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900">
                                {tramitacao.etapaOrigem} → {tramitacao.etapaDestino}
                              </h4>
                              <p className="text-xs text-gray-500">Tramitação #{index + 1}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              {new Date(tramitacao.dataHora).toLocaleDateString('pt-BR')}{' '}
                              {new Date(tramitacao.dataHora).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Informações do responsável */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <span className="text-xs text-gray-500">Técnico:</span>
                              <p className="text-sm text-gray-900">{tramitacao.tecnico}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <div>
                              <span className="text-xs text-gray-500">Setor:</span>
                              <p className="text-sm text-gray-900">{tramitacao.setor}</p>
                            </div>
                          </div>
                        </div>

                        {/* Texto/Parecer da tramitação */}
                        {tramitacao.texto && (
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-start gap-2">
                              <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="text-xs text-gray-500 block mb-1">Parecer:</span>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {tramitacao.texto}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
