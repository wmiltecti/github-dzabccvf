import React, { useState } from 'react';
import { FileText, Search, Filter, Eye, Award, CheckCircle, ArrowRightLeft, FileCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import EmissaoLicenca from './EmissaoLicenca';
import TramitarModal from '../../components/analise/TramitarModal';
import Pareceres from './Pareceres';

interface Processo {
  id: string;
  numero: string;
  requerente: string;
  tipo: string;
  status: string;
  dataAnalise: string;
  analista: string;
}

const processosMock: Processo[] = [
  {
    id: '1',
    numero: 'LO/001/2025',
    requerente: 'Curtume Industrial São João Ltda',
    tipo: 'Licença de Operação',
    status: 'Análise Concluída',
    dataAnalise: '20/11/2025',
    analista: 'João Silva'
  },
  {
    id: '2',
    numero: 'LP/001/2025',
    requerente: 'Mineradora Roraima S.A.',
    tipo: 'Licença Prévia',
    status: 'Análise Concluída',
    dataAnalise: '18/11/2025',
    analista: 'Maria Santos'
  },
  {
    id: '3',
    numero: 'LI/001/2025',
    requerente: 'Frigorífico Regional Ltda',
    tipo: 'Licença de Instalação',
    status: 'Análise Concluída',
    dataAnalise: '15/11/2025',
    analista: 'Pedro Oliveira'
  }
];

export default function AssinaturaDigital() {
  const [searchTerm, setSearchTerm] = useState('');
  const [processos] = useState<Processo[]>(processosMock);
  const [processoSelecionado, setProcessoSelecionado] = useState<Processo | null>(null);
  const [showEmissaoLicenca, setShowEmissaoLicenca] = useState(false);
  const [showTramitarModal, setShowTramitarModal] = useState(false);
  const [mostrandoAnalise, setMostrandoAnalise] = useState(false);

  const processosFiltrados = processos.filter(processo =>
    processo.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    processo.requerente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    processo.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssinarDigitalmente = (processo: Processo) => {
    setProcessoSelecionado(processo);
    setShowEmissaoLicenca(true);
  };

  const handleTramitar = (processo: Processo) => {
    setProcessoSelecionado(processo);
    setShowTramitarModal(true);
  };

  const handleAnalise = (processo: Processo) => {
    setProcessoSelecionado(processo);
    setMostrandoAnalise(true);
  };

  if (showEmissaoLicenca && processoSelecionado) {
    return (
      <EmissaoLicenca
        processoId={processoSelecionado.id}
        numeroProcesso={processoSelecionado.numero}
        onVoltar={() => {
          setShowEmissaoLicenca(false);
          setProcessoSelecionado(null);
        }}
      />
    );
  }

  if (mostrandoAnalise && processoSelecionado) {
    return (
      <Pareceres
        processoId={processoSelecionado.id}
        numeroProcesso={processoSelecionado.numero}
        onVoltar={() => {
          setMostrandoAnalise(false);
          setProcessoSelecionado(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Award className="w-7 h-7 text-blue-600" />
                  Assinatura Digital
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Processos analisados aguardando assinatura digital para emissão de licença
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por número, requerente ou tipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="p-6">
            {processosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">Nenhum processo encontrado</p>
                <p className="text-gray-400 text-sm mt-2">
                  {searchTerm
                    ? 'Tente ajustar os filtros de busca'
                    : 'Não há processos aguardando assinatura digital no momento'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Número do Processo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Requerente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Data Análise
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Analista
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {processosFiltrados.map((processo) => (
                      <tr key={processo.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{processo.numero}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">{processo.requerente}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-700">{processo.tipo}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-300">
                            <CheckCircle className="w-3 h-3" />
                            {processo.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-700">{processo.dataAnalise}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-700">{processo.analista}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleTramitar(processo)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white text-sm rounded-lg transition-colors"
                              title="Tramitar processo"
                            >
                              <ArrowRightLeft className="w-4 h-4" />
                              Tramitar
                            </button>
                            <button
                              onClick={() => handleAnalise(processo)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                              title="Analisar processo"
                            >
                              <FileCheck className="w-4 h-4" />
                              Análise
                            </button>
                            <button
                              onClick={() => handleAssinarDigitalmente(processo)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                              title="Assinar Digitalmente e Emitir Licença"
                            >
                              <Award className="w-4 h-4" />
                              Assinar Digitalmente
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <span>
              <strong>Atenção:</strong> Apenas processos com análise concluída e aprovada aparecem nesta listagem.
              Ao clicar em "Assinar Digitalmente", você será direcionado para a tela de emissão de licença.
            </span>
          </p>
        </div>
      </div>

      {showTramitarModal && processoSelecionado && (
        <TramitarModal
          processo={processoSelecionado}
          onClose={() => {
            setShowTramitarModal(false);
            setProcessoSelecionado(null);
          }}
          onTramitar={(dados) => {
            console.log('Tramitando processo:', dados);
            toast.success('Processo tramitado com sucesso!');
            setShowTramitarModal(false);
            setProcessoSelecionado(null);
          }}
        />
      )}
    </div>
  );
}
