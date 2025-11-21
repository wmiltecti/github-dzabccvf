import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Home, Building2, FileText, FolderOpen, AlertCircle, Menu } from 'lucide-react';
import { toast } from 'react-toastify';
import PendenciaManager from './PendenciaManager';
import NotificacoesPendenciaModal from './NotificacoesPendenciaModal';
import TramitacoesModal from './TramitacoesModal';

interface ProcessoData {
  id: string;
  numero: string;
  requerente: string;
  atividade: string;
  situacao: string;
  etapa: string;
  dataSolicitacao: string;
  responsavelTecnico?: string;
  tipoProcesso?: string;
  empreendimento?: {
    numero: string;
    nome: string;
    atividades: string[];
  };
}

interface AnaliseModalProps {
  processo: ProcessoData;
  onClose: () => void;
}

type Etapa = 'imovel' | 'empreendimento' | 'caracterizacao' | 'documentacao';

const etapas: { id: Etapa; label: string; icon: React.ReactNode }[] = [
  { id: 'imovel', label: 'Imóvel', icon: <Home className="w-5 h-5" /> },
  { id: 'empreendimento', label: 'Empreendimento', icon: <Building2 className="w-5 h-5" /> },
  { id: 'caracterizacao', label: 'Caracterização', icon: <FileText className="w-5 h-5" /> },
  { id: 'documentacao', label: 'Documentação', icon: <FolderOpen className="w-5 h-5" /> }
];

export default function AnaliseModal({ processo, onClose }: AnaliseModalProps) {
  const [etapaAtual, setEtapaAtual] = useState<Etapa>('imovel');
  const [showPendenciaManager, setShowPendenciaManager] = useState(false);
  const [showNotificacoes, setShowNotificacoes] = useState(false);
  const [showTramitacoes, setShowTramitacoes] = useState(false);
  const [showOpcoes, setShowOpcoes] = useState(false);

  const etapaIndex = etapas.findIndex(e => e.id === etapaAtual);

  const handleProxima = () => {
    if (etapaIndex < etapas.length - 1) {
      setEtapaAtual(etapas[etapaIndex + 1].id);
    }
  };

  const handleAnterior = () => {
    if (etapaIndex > 0) {
      setEtapaAtual(etapas[etapaIndex - 1].id);
    }
  };

  const handleConcluir = () => {
    toast.success(`Etapa ${etapas[etapaIndex].label} concluída com sucesso!`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Análise de Processo</h3>
              <p className="text-sm text-gray-600">
                {processo.numero} - {processo.requerente}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informações do Cabeçalho */}
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-xs text-gray-500">Número:</span>
              <p className="text-sm font-medium text-gray-900">{processo.numero}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Tipo de Processo:</span>
              <p className="text-sm font-medium text-gray-900">{processo.tipoProcesso || 'N/A'}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Situação:</span>
              <p className="text-sm font-medium text-gray-900">{processo.situacao}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Etapa:</span>
              <p className="text-sm font-medium text-gray-900">{processo.etapa}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Requerente:</span>
              <p className="text-sm font-medium text-gray-900">{processo.requerente}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Data da Solicitação:</span>
              <p className="text-sm font-medium text-gray-900">
                {new Date(processo.dataSolicitacao).toLocaleDateString('pt-BR')}
              </p>
            </div>
            {processo.empreendimento && (
              <>
                <div>
                  <span className="text-xs text-gray-500">Empreendimento:</span>
                  <p className="text-sm font-medium text-gray-900">{processo.empreendimento.nome}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Nº Empreendimento:</span>
                  <p className="text-sm font-medium text-gray-900">{processo.empreendimento.numero}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Menu de Opções */}
        <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {etapas.map((etapa, idx) => (
              <button
                key={etapa.id}
                onClick={() => setEtapaAtual(etapa.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  etapaAtual === etapa.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {etapa.icon}
                <span className="text-sm font-medium">{etapa.label}</span>
              </button>
            ))}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowOpcoes(!showOpcoes)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <Menu className="w-4 h-4" />
              Opções
            </button>
            {showOpcoes && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <button
                  onClick={() => {
                    setShowTramitacoes(true);
                    setShowOpcoes(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-200"
                >
                  Tramitações
                </button>
                <button
                  onClick={() => {
                    setShowNotificacoes(true);
                    setShowOpcoes(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Notificações de Pendência
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo da Etapa */}
        <div className="flex-1 overflow-y-auto p-6">
          <EtapaConteudo etapa={etapaAtual} processo={processo} />
        </div>

        {/* Footer com Botões */}
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleAnterior}
                disabled={etapaIndex === 0}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  etapaIndex === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
              <button
                onClick={handleProxima}
                disabled={etapaIndex === etapas.length - 1}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  etapaIndex === etapas.length - 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                }`}
              >
                Próxima
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPendenciaManager(true)}
                className="flex items-center gap-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
              >
                <AlertCircle className="w-4 h-4" />
                Registro de Pendência
              </button>
              <button
                onClick={handleConcluir}
                className="flex items-center gap-1 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg transition-colors"
              >
                <Check className="w-4 h-4" />
                Concluir
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPendenciaManager && (
        <PendenciaManager
          processoId={processo.id}
          etapaAtual={etapas[etapaIndex].label}
          onClose={() => setShowPendenciaManager(false)}
        />
      )}

      {showNotificacoes && (
        <NotificacoesPendenciaModal
          processoId={processo.id}
          numeroProcesso={processo.numero}
          onClose={() => setShowNotificacoes(false)}
        />
      )}

      {showTramitacoes && (
        <TramitacoesModal
          processoId={processo.id}
          numeroProcesso={processo.numero}
          onClose={() => setShowTramitacoes(false)}
        />
      )}
    </div>
  );
}

function EtapaConteudo({ etapa, processo }: { etapa: Etapa; processo: ProcessoData }) {
  switch (etapa) {
    case 'imovel':
      return (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Dados do Imóvel</h4>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <p className="text-sm text-gray-600">
              Aqui serão exibidos todos os campos do cadastro de imóvel do processo.
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500">Endereço:</span>
                <p className="text-sm text-gray-900">Rua Exemplo, 123</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Município:</span>
                <p className="text-sm text-gray-900">Cidade Exemplo</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Área Total:</span>
                <p className="text-sm text-gray-900">10.000 m²</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Matrícula:</span>
                <p className="text-sm text-gray-900">12345</p>
              </div>
            </div>
          </div>
        </div>
      );

    case 'empreendimento':
      return (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Dados do Empreendimento</h4>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h5 className="text-sm font-semibold text-gray-700 mb-3">Dados Gerais</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-500">Nome:</span>
                  <p className="text-sm text-gray-900">{processo.empreendimento?.nome || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Número:</span>
                  <p className="text-sm text-gray-900">{processo.empreendimento?.numero || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h5 className="text-sm font-semibold text-gray-700 mb-3">Atividades</h5>
              <div className="flex flex-wrap gap-2">
                {processo.empreendimento?.atividades.map((ativ, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full border border-blue-300"
                  >
                    {ativ}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h5 className="text-sm font-semibold text-gray-700 mb-3">Shapes e Mapas</h5>
              <p className="text-sm text-gray-600">
                Visualização de shapes, mapas e consultas espaciais será implementada aqui.
              </p>
            </div>
          </div>
        </div>
      );

    case 'caracterizacao':
      return (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Caracterização</h4>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-4">
              Informações dos formulários de caracterização do empreendimento.
            </p>
            <div className="space-y-4">
              <div className="border-b border-gray-300 pb-3">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Recursos e Energia</h5>
                <p className="text-sm text-gray-600">Dados sobre consumo energético e recursos utilizados.</p>
              </div>
              <div className="border-b border-gray-300 pb-3">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Uso de Água</h5>
                <p className="text-sm text-gray-600">Informações sobre captação e uso de recursos hídricos.</p>
              </div>
              <div className="border-b border-gray-300 pb-3">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Resíduos</h5>
                <p className="text-sm text-gray-600">Dados sobre geração e destinação de resíduos.</p>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Outras Informações</h5>
                <p className="text-sm text-gray-600">Informações complementares do empreendimento.</p>
              </div>
            </div>
          </div>
        </div>
      );

    case 'documentacao':
      return (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Documentação</h4>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h5 className="text-sm font-semibold text-gray-700 mb-3">Documentos do Processo</h5>
              <p className="text-sm text-gray-600">
                Listagem de todos os documentos anexados ao processo.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h5 className="text-sm font-semibold text-gray-700 mb-3">Documentos dos Partícipes</h5>
              <p className="text-sm text-gray-600">
                Listagem dos partícipes e seus respectivos documentos.
              </p>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}
