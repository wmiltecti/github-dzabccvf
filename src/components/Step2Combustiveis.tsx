import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, Info, Fuel, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

interface Step2CombustiveisProps {
  data: any;
  onChange: (data: any) => void;
}

type TipoFonte = 'ENERGIA_ELETRICA' | 'OLEO' | 'GLP' | 'OUTROS';
type Unidade = 'J' | 'KWH' | 'KG' | 'MWH' | 'KCAL' | 'OUTROS';

interface Combustivel {
  id: string;
  tipoFonte: TipoFonte;
  equipamento: string;
  quantidade: number;
  unidade: Unidade;
}

const tiposFonte: { value: TipoFonte; label: string }[] = [
  { value: 'ENERGIA_ELETRICA', label: 'Energia Elétrica' },
  { value: 'OLEO', label: 'Óleo' },
  { value: 'GLP', label: 'GLP' },
  { value: 'OUTROS', label: 'Outros' }
];

const unidades: { value: Unidade; label: string }[] = [
  { value: 'J', label: 'Joule' },
  { value: 'KWH', label: 'Quilowatt-hora' },
  { value: 'KG', label: 'Kg' },
  { value: 'MWH', label: 'Megawatt-hora' },
  { value: 'KCAL', label: 'Kcal' },
  { value: 'OUTROS', label: 'Outros' }
];

const tiposFonteMap: Record<TipoFonte, string> = {
  ENERGIA_ELETRICA: 'Energia Elétrica',
  OLEO: 'Óleo',
  GLP: 'GLP',
  OUTROS: 'Outros'
};

const unidadesMap: Record<Unidade, string> = {
  J: 'Joule',
  KWH: 'Quilowatt-hora',
  KG: 'Kg',
  MWH: 'Megawatt-hora',
  KCAL: 'Kcal',
  OUTROS: 'Outros'
};

export default function Step2Combustiveis({ data, onChange }: Step2CombustiveisProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  const [novoItem, setNovoItem] = useState<Omit<Combustivel, 'id'>>({
    tipoFonte: '' as TipoFonte,
    equipamento: '',
    quantidade: 0,
    unidade: '' as Unidade
  });

  const [itemEditando, setItemEditando] = useState<Combustivel | null>(null);

  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const getCombustiveis = (): Combustivel[] => {
    return data?.combustiveis || [];
  };

  const validarCampos = (item: Omit<Combustivel, 'id'>): boolean => {
    if (!item.tipoFonte) {
      toast.error('Tipo de Fonte é obrigatório');
      return false;
    }
    if (!item.equipamento || item.equipamento.trim() === '') {
      toast.error('Equipamento Consumidor é obrigatório');
      return false;
    }
    if (item.quantidade === null || item.quantidade === undefined || item.quantidade < 0) {
      toast.error('Quantidade deve ser maior ou igual a zero');
      return false;
    }
    if (!item.unidade) {
      toast.error('Unidade de Medida é obrigatória');
      return false;
    }
    return true;
  };

  const verificarDuplicata = (item: Omit<Combustivel, 'id'>, ignorarId?: string): boolean => {
    const combustiveis = getCombustiveis();
    return combustiveis.some(
      c => c.id !== ignorarId &&
           c.tipoFonte === item.tipoFonte &&
           c.equipamento.toLowerCase() === item.equipamento.toLowerCase() &&
           c.unidade === item.unidade
    );
  };

  const handleAdicionar = () => {
    if (!validarCampos(novoItem)) return;

    if (verificarDuplicata(novoItem)) {
      toast.warning('Já existe um item com a mesma fonte, equipamento e unidade. Considere editar o existente.');
      return;
    }

    const novoCombustivel: Combustivel = {
      id: crypto.randomUUID(),
      ...novoItem
    };

    const combustiveis = getCombustiveis();
    handleChange('combustiveis', [...combustiveis, novoCombustivel]);

    setNovoItem({
      tipoFonte: '' as TipoFonte,
      equipamento: '',
      quantidade: 0,
      unidade: '' as Unidade
    });

    toast.success('Combustível adicionado com sucesso');
  };

  const handleIniciarEdicao = (combustivel: Combustivel) => {
    setEditingId(combustivel.id);
    setItemEditando({ ...combustivel });
  };

  const handleSalvarEdicao = () => {
    if (!itemEditando) return;

    if (!validarCampos(itemEditando)) return;

    if (verificarDuplicata(itemEditando, itemEditando.id)) {
      toast.warning('Já existe um item com a mesma fonte, equipamento e unidade. Considere editar o existente.');
      return;
    }

    const combustiveis = getCombustiveis();
    const updated = combustiveis.map(c =>
      c.id === itemEditando.id ? itemEditando : c
    );

    handleChange('combustiveis', updated);
    setEditingId(null);
    setItemEditando(null);
    toast.success('Combustível atualizado com sucesso');
  };

  const handleCancelarEdicao = () => {
    setEditingId(null);
    setItemEditando(null);
  };

  const handleExcluir = (id: string) => {
    setShowDeleteModal(id);
  };

  const confirmarExclusao = () => {
    if (!showDeleteModal) return;

    const combustiveis = getCombustiveis();
    const updated = combustiveis.filter(c => c.id !== showDeleteModal);

    handleChange('combustiveis', updated);
    setShowDeleteModal(null);
    toast.success('Combustível removido com sucesso');
  };

  const formatarQuantidade = (valor: number): string => {
    return valor.toFixed(2);
  };

  const combustiveis = getCombustiveis();

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-2">
        <Fuel className="w-6 h-6 text-orange-600" />
        <h2 className="text-2xl font-bold text-gray-900">Combustíveis</h2>
      </div>

      {/* Linha de Inclusão */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-orange-50 to-yellow-50">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Adicionar Novo Combustível</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Tipo de Fonte <span className="text-red-500">*</span>
            </label>
            <select
              value={novoItem.tipoFonte}
              onChange={(e) => setNovoItem({ ...novoItem, tipoFonte: e.target.value as TipoFonte })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Selecione...</option>
              {tiposFonte.map(tipo => (
                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
              Equipamento Consumidor <span className="text-red-500">*</span>
              <div className="relative group">
                <Info className="w-3 h-3 text-gray-400 cursor-help" />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-xs rounded-lg z-10">
                  Especificar a potência em MW, se for o caso
                </div>
              </div>
            </label>
            <input
              type="text"
              value={novoItem.equipamento}
              onChange={(e) => setNovoItem({ ...novoItem, equipamento: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Ex: Motor 500 MW"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Quantidade <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={novoItem.quantidade}
              onChange={(e) => setNovoItem({ ...novoItem, quantidade: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Unidade de Medida <span className="text-red-500">*</span>
            </label>
            <select
              value={novoItem.unidade}
              onChange={(e) => setNovoItem({ ...novoItem, unidade: e.target.value as Unidade })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Selecione...</option>
              {unidades.map(unidade => (
                <option key={unidade.value} value={unidade.value}>{unidade.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleAdicionar}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </div>
        </div>
      </div>

      {/* Tabela de Combustíveis */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        {combustiveis.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Tipo de Fonte
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Equipamento Consumidor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Unidade de Medida
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {combustiveis.map((combustivel) => (
                  <tr key={combustivel.id} className="hover:bg-gray-50">
                    {editingId === combustivel.id && itemEditando ? (
                      <>
                        <td className="px-4 py-3">
                          <select
                            value={itemEditando.tipoFonte}
                            onChange={(e) => setItemEditando({ ...itemEditando, tipoFonte: e.target.value as TipoFonte })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          >
                            {tiposFonte.map(tipo => (
                              <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={itemEditando.equipamento}
                            onChange={(e) => setItemEditando({ ...itemEditando, equipamento: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={itemEditando.quantidade}
                            onChange={(e) => setItemEditando({ ...itemEditando, quantidade: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={itemEditando.unidade}
                            onChange={(e) => setItemEditando({ ...itemEditando, unidade: e.target.value as Unidade })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          >
                            {unidades.map(unidade => (
                              <option key={unidade.value} value={unidade.value}>{unidade.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={handleSalvarEdicao}
                              className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                              title="Salvar"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={handleCancelarEdicao}
                              className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                              title="Cancelar"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {tiposFonteMap[combustivel.tipoFonte]}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {combustivel.equipamento}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatarQuantidade(combustivel.quantidade)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {unidadesMap[combustivel.unidade]}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleIniciarEdicao(combustivel)}
                              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleExcluir(combustivel.id)}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Fuel className="w-16 h-16 mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium">Nenhum combustível cadastrado</p>
            <p className="text-xs mt-1">Utilize o formulário acima para adicionar um novo item</p>
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirmar Exclusão</h3>
                <p className="text-sm text-gray-600">Deseja realmente remover este item de combustível?</p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarExclusao}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Informações */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-gray-900">Dica</h3>
            <p className="text-sm text-gray-600 mt-1">
              Cadastre todos os combustíveis utilizados no empreendimento. Evite duplicatas com a mesma
              fonte, equipamento e unidade - neste caso, edite o item existente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
