import React, { useState } from 'react';
import { X, ArrowRightLeft, Building2, User } from 'lucide-react';

interface ProcessoData {
  id: string;
  numero: string;
  etapa: string;
  requerente: string;
  dataSolicitacao: string;
  responsavelTecnico?: string;
  empreendimento?: {
    numero: string;
    nome: string;
    atividades: string[];
  };
}

interface TramitarModalProps {
  processo: ProcessoData;
  onClose: () => void;
  onTramitar: (dados: TramitacaoData) => void;
}

interface TramitacaoData {
  processoId: string;
  proximaEtapa: string;
  proximoSetor: string;
  proximoResponsavel: string;
  parecer: string;
  exibirParecer: boolean;
}

const mockEtapas = [
  'Análise Técnica',
  'Análise Documental',
  'Vistoria Técnica',
  'Parecer Jurídico',
  'Análise Final'
];

const mockSetores = [
  'Setor de Análise Ambiental',
  'Setor de Vistoria',
  'Setor Jurídico',
  'Coordenação Técnica',
  'Diretoria'
];

const mockResponsaveis = [
  'João Silva - CREA 12345',
  'Maria Santos - CREA 67890',
  'Carlos Oliveira - CRMV 11223',
  'Ana Costa - CREA 33445',
  'Pedro Alves - CREA 55667'
];

export default function TramitarModal({ processo, onClose, onTramitar }: TramitarModalProps) {
  const [proximaEtapa, setProximaEtapa] = useState('');
  const [proximoSetor, setProximoSetor] = useState('');
  const [proximoResponsavel, setProximoResponsavel] = useState('');
  const [parecer, setParecer] = useState('');
  const [exibirParecer, setExibirParecer] = useState(false);

  const handleSubmit = () => {
    if (!proximaEtapa || !proximoSetor || !proximoResponsavel) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    onTramitar({
      processoId: processo.id,
      proximaEtapa,
      proximoSetor,
      proximoResponsavel,
      parecer,
      exibirParecer
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <ArrowRightLeft className="w-6 h-6 text-amber-700" />
            <h3 className="text-xl font-semibold text-gray-900">Tramitar Processo</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Cabeçalho - Informações do Processo */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 border-b border-gray-300 pb-2">
              Informações do Processo
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500">Número do Processo:</span>
                <p className="text-sm font-medium text-gray-900">{processo.numero}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Etapa Atual:</span>
                <p className="text-sm font-medium text-gray-900">{processo.etapa}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Setor Atual:</span>
                <p className="text-sm font-medium text-gray-900">Setor de Análise Ambiental</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Responsável Atual:</span>
                <p className="text-sm font-medium text-gray-900">
                  {processo.responsavelTecnico || 'Não informado'}
                </p>
              </div>
            </div>
          </div>

          {/* Dados da Tramitação */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 border-b border-gray-300 pb-2">
              Dados da Tramitação
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Próxima Etapa <span className="text-red-600">*</span>
                </label>
                <select
                  value={proximaEtapa}
                  onChange={(e) => setProximaEtapa(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="">Selecione uma etapa</option>
                  {mockEtapas.map((etapa) => (
                    <option key={etapa} value={etapa}>
                      {etapa}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Próximo Setor <span className="text-red-600">*</span>
                </label>
                <select
                  value={proximoSetor}
                  onChange={(e) => setProximoSetor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="">Selecione um setor</option>
                  {mockSetores.map((setor) => (
                    <option key={setor} value={setor}>
                      {setor}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Próximo Responsável <span className="text-red-600">*</span>
                </label>
                <select
                  value={proximoResponsavel}
                  onChange={(e) => setProximoResponsavel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="">Selecione um responsável</option>
                  {mockResponsaveis.map((resp) => (
                    <option key={resp} value={resp}>
                      {resp}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Parecer da Tramitação */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 border-b border-gray-300 pb-2">
              Parecer da Tramitação
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parecer
                </label>
                <textarea
                  value={parecer}
                  onChange={(e) => setParecer(e.target.value)}
                  rows={4}
                  placeholder="Descreva seu parecer sobre esta tramitação..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Deseja exibir seu parecer para os partícipes do processo?
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="exibirParecer"
                      checked={exibirParecer === true}
                      onChange={() => setExibirParecer(true)}
                      className="w-4 h-4 text-amber-700 focus:ring-amber-500"
                    />
                    <span className="text-sm text-gray-700">Sim</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="exibirParecer"
                      checked={exibirParecer === false}
                      onChange={() => setExibirParecer(false)}
                      className="w-4 h-4 text-amber-700 focus:ring-amber-500"
                    />
                    <span className="text-sm text-gray-700">Não</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Tramitar
          </button>
        </div>
      </div>
    </div>
  );
}
