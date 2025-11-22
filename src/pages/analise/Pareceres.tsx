import React, { useState } from 'react';
import { ArrowLeft, FileText, Plus, Eye, Edit, Trash2, X, Upload, Download } from 'lucide-react';
import { toast } from 'react-toastify';

interface Parecer {
  id: string;
  autor: string;
  tipo: 'Técnico' | 'Jurídico' | 'Vistoria';
  dataCriacao: string;
  arquivo: string;
  publico: boolean;
  nomeArquivo: string;
}

interface PareceresProp {
  processoId: string;
  numeroProcesso: string;
  onVoltar: () => void;
}

export default function Pareceres({ processoId, numeroProcesso, onVoltar }: PareceresProp) {
  const [pareceres, setPareceres] = useState<Parecer[]>([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [parecerSelecionado, setParecerSelecionado] = useState<Parecer | null>(null);

  const [tipo, setTipo] = useState<'Técnico' | 'Jurídico' | 'Vistoria'>('Técnico');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [publico, setPublico] = useState(true);

  const autorMock = 'João Silva - Analista Técnico';

  const handleNovo = () => {
    setModoEdicao(false);
    setParecerSelecionado(null);
    setTipo('Técnico');
    setArquivo(null);
    setPublico(true);
    setShowFormModal(true);
  };

  const handleEditar = (parecer: Parecer) => {
    setModoEdicao(true);
    setParecerSelecionado(parecer);
    setTipo(parecer.tipo);
    setPublico(parecer.publico);
    setArquivo(null);
    setShowFormModal(true);
  };

  const handleDetalhes = (parecer: Parecer) => {
    setParecerSelecionado(parecer);
    setShowDetalhesModal(true);
  };

  const handleExcluir = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este parecer?')) {
      setPareceres(pareceres.filter(p => p.id !== id));
      toast.success('Parecer excluído com sucesso!');
    }
  };

  const handleSalvar = () => {
    if (!arquivo && !modoEdicao) {
      toast.error('Por favor, selecione um arquivo PDF.');
      return;
    }

    if (modoEdicao && parecerSelecionado) {
      const parecerAtualizado: Parecer = {
        ...parecerSelecionado,
        tipo,
        publico,
        ...(arquivo && {
          arquivo: URL.createObjectURL(arquivo),
          nomeArquivo: arquivo.name
        })
      };

      setPareceres(pareceres.map(p => p.id === parecerSelecionado.id ? parecerAtualizado : p));
      toast.success('Parecer atualizado com sucesso!');
    } else if (arquivo) {
      const novoParecer: Parecer = {
        id: Date.now().toString(),
        autor: autorMock,
        tipo,
        dataCriacao: new Date().toISOString(),
        arquivo: URL.createObjectURL(arquivo),
        publico,
        nomeArquivo: arquivo.name
      };

      setPareceres([...pareceres, novoParecer]);
      toast.success('Parecer adicionado com sucesso!');
    }

    handleCancelar();
  };

  const handleCancelar = () => {
    setShowFormModal(false);
    setModoEdicao(false);
    setParecerSelecionado(null);
    setTipo('Técnico');
    setArquivo(null);
    setPublico(true);
  };

  const getTipoColor = (tipo: Parecer['tipo']) => {
    switch (tipo) {
      case 'Técnico':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Jurídico':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'Vistoria':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={onVoltar}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para análise
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Pareceres</h2>
              <p className="text-sm text-gray-600 mt-1">Processo: {numeroProcesso}</p>
            </div>

            <button
              onClick={handleNovo}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Novo
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Listagem de Pareceres</h3>

            {pareceres.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Nenhum parecer cadastrado</p>
                <p className="text-sm mt-1">Clique em "Novo" para adicionar um parecer</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-white">
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Autor
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Tipo
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Data de Criação
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Arquivo
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pareceres.map((parecer) => (
                      <tr key={parecer.id} className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                          {parecer.autor}
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <span
                            className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${getTipoColor(
                              parecer.tipo
                            )}`}
                          >
                            {parecer.tipo}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                          {new Date(parecer.dataCriacao).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(parecer.dataCriacao).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <button
                            onClick={() => toast.info('Download em desenvolvimento')}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                          >
                            <Download className="w-4 h-4" />
                            {parecer.nomeArquivo}
                          </button>
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDetalhes(parecer)}
                              className="text-blue-600 hover:text-blue-700 p-1"
                              title="Detalhes"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditar(parecer)}
                              className="text-green-600 hover:text-green-700 p-1"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleExcluir(parecer.id)}
                              className="text-red-600 hover:text-red-700 p-1"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
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

          <div className="flex justify-end mt-6">
            <button
              onClick={onVoltar}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>

      {showFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {modoEdicao ? 'Editar Parecer' : 'Novo Parecer'}
              </h3>
              <button
                onClick={handleCancelar}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo <span className="text-red-600">*</span>
                </label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as 'Técnico' | 'Jurídico' | 'Vistoria')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Técnico">Técnico</option>
                  <option value="Jurídico">Jurídico</option>
                  <option value="Vistoria">Vistoria</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Arquivo <span className="text-red-600">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Selecionar PDF
                    <input
                      type="file"
                      onChange={(e) => setArquivo(e.target.files?.[0] || null)}
                      className="hidden"
                      accept=".pdf"
                    />
                  </label>
                  {arquivo && (
                    <span className="text-sm text-gray-600">{arquivo.name}</span>
                  )}
                  {modoEdicao && !arquivo && parecerSelecionado && (
                    <span className="text-sm text-gray-600">
                      Arquivo atual: {parecerSelecionado.nomeArquivo}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Apenas arquivos PDF são permitidos
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Público <span className="text-red-600">*</span>
                </label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="publico"
                      checked={publico === true}
                      onChange={() => setPublico(true)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Sim</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="publico"
                      checked={publico === false}
                      onChange={() => setPublico(false)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Não</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Define se o parecer será visível para o requerente do processo
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={handleCancelar}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvar}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetalhesModal && parecerSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Detalhes do Parecer</h3>
              <button
                onClick={() => setShowDetalhesModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-semibold text-gray-500">AUTOR:</span>
                  <p className="text-sm text-gray-900">{parecerSelecionado.autor}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500">TIPO:</span>
                  <div className="mt-1">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${getTipoColor(
                        parecerSelecionado.tipo
                      )}`}
                    >
                      {parecerSelecionado.tipo}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-semibold text-gray-500">DATA DE CRIAÇÃO:</span>
                  <p className="text-sm text-gray-900">
                    {new Date(parecerSelecionado.dataCriacao).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(parecerSelecionado.dataCriacao).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500">PÚBLICO:</span>
                  <p className="text-sm text-gray-900">
                    {parecerSelecionado.publico ? (
                      <span className="text-green-600 font-semibold">Sim</span>
                    ) : (
                      <span className="text-red-600 font-semibold">Não</span>
                    )}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-gray-500">ARQUIVO:</span>
                <div className="mt-1 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-gray-900">{parecerSelecionado.nomeArquivo}</span>
                  <button
                    onClick={() => toast.info('Download em desenvolvimento')}
                    className="ml-auto text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    Baixar
                  </button>
                </div>
              </div>

              {!parecerSelecionado.publico && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Atenção:</strong> Este parecer é confidencial e não será visível para o requerente do processo.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setShowDetalhesModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
