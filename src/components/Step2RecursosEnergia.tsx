import React, { useState } from 'react';
import { Flame, Trash2, Edit2, Plus, Info, AlertCircle } from 'lucide-react';

interface Step2RecursosEnergiaProps {
  data: any;
  onChange: (data: any) => void;
}

interface Combustivel {
  id: string;
  tipoFonte: string;
  equipamento: string;
  quantidade: string;
  unidade: string;
}

const tiposFonte = [
  'Lenha',
  'Carvão Mineral',
  'Carvão Vegetal',
  'Gás Natural',
  'GLP',
  'Óleo Diesel',
  'Óleo BPF',
  'Eletricidade',
  'Biomassa',
  'Solar',
  'Eólica'
];

const unidades = ['m³', 'kg', 'L', 'MW', 'kW', 'MWh', 'kWh', 't'];

export default function Step2RecursosEnergia({ data, onChange }: Step2RecursosEnergiaProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentCombustivel, setCurrentCombustivel] = useState<Combustivel>({
    id: '',
    tipoFonte: '',
    equipamento: '',
    quantidade: '',
    unidade: 'm³'
  });

  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleAddCombustivel = () => {
    if (!currentCombustivel.tipoFonte || !currentCombustivel.equipamento || !currentCombustivel.quantidade) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const combustiveis = data?.combustiveis || [];

    if (editingId) {
      const updated = combustiveis.map((c: Combustivel) =>
        c.id === editingId ? { ...currentCombustivel, id: editingId } : c
      );
      handleChange('combustiveis', updated);
      setEditingId(null);
    } else {
      const newCombustivel = {
        ...currentCombustivel,
        id: Date.now().toString()
      };
      handleChange('combustiveis', [...combustiveis, newCombustivel]);
    }

    setCurrentCombustivel({
      id: '',
      tipoFonte: '',
      equipamento: '',
      quantidade: '',
      unidade: 'm³'
    });
    setIsAdding(false);
  };

  const handleEditCombustivel = (combustivel: Combustivel) => {
    setCurrentCombustivel(combustivel);
    setEditingId(combustivel.id);
    setIsAdding(true);
  };

  const handleDeleteCombustivel = (id: string) => {
    const combustiveis = data?.combustiveis || [];
    handleChange('combustiveis', combustiveis.filter((c: Combustivel) => c.id !== id));
  };

  const handleCancelEdit = () => {
    setCurrentCombustivel({
      id: '',
      tipoFonte: '',
      equipamento: '',
      quantidade: '',
      unidade: 'm³'
    });
    setIsAdding(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Uso de Lenha */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">Uso de Lenha</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Utiliza lenha como combustível?
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="usaLenha"
                  value="sim"
                  checked={data?.usaLenha === 'sim'}
                  onChange={(e) => handleChange('usaLenha', e.target.value)}
                  className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Sim</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="usaLenha"
                  value="nao"
                  checked={data?.usaLenha === 'nao'}
                  onChange={(e) => handleChange('usaLenha', e.target.value)}
                  className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Não</span>
              </label>
            </div>
          </div>

          {data?.usaLenha === 'sim' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantidade Mensal (m³)
                </label>
                <input
                  type="number"
                  value={data?.lenhaQuantidade || ''}
                  onChange={(e) => handleChange('lenhaQuantidade', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nº CEPROF
                </label>
                <input
                  type="text"
                  value={data?.lenhaCeprof || ''}
                  onChange={(e) => handleChange('lenhaCeprof', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Digite o número CEPROF"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Caldeira */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">Caldeira</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Possui caldeira?
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="possuiCaldeira"
                  value="sim"
                  checked={data?.possuiCaldeira === 'sim'}
                  onChange={(e) => handleChange('possuiCaldeira', e.target.value)}
                  className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Sim</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="possuiCaldeira"
                  value="nao"
                  checked={data?.possuiCaldeira === 'nao'}
                  onChange={(e) => handleChange('possuiCaldeira', e.target.value)}
                  className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Não</span>
              </label>
            </div>
          </div>

          {data?.possuiCaldeira === 'sim' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Altura da Chaminé (metros)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={data?.caldeiraAlturaChamine || ''}
                  onChange={(e) => handleChange('caldeiraAlturaChamine', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  metros
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fornos */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">Fornos</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Possui fornos?
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="possuiFornos"
                  value="sim"
                  checked={data?.possuiFornos === 'sim'}
                  onChange={(e) => handleChange('possuiFornos', e.target.value)}
                  className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Sim</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="possuiFornos"
                  value="nao"
                  checked={data?.possuiFornos === 'nao'}
                  onChange={(e) => handleChange('possuiFornos', e.target.value)}
                  className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Não</span>
              </label>
            </div>
          </div>

          {data?.possuiFornos === 'sim' && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sistema de Captação
              </label>
              <textarea
                value={data?.fornosSistemaCaptacao || ''}
                onChange={(e) => handleChange('fornosSistemaCaptacao', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Descreva o sistema de captação utilizado nos fornos"
                rows={3}
              />
            </div>
          )}
        </div>
      </div>

      {/* Tabela de Combustíveis */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Combustíveis e Energia</h3>
            <div className="relative group">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-xs rounded-lg z-10">
                Informe todos os tipos de combustíveis e fontes de energia utilizados no empreendimento.
                Unidades comuns: m³ (volume), MW/kW (potência), MWh/kWh (energia), t/kg (massa).
              </div>
            </div>
          </div>

          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          )}
        </div>

        {/* Formulário de adição/edição */}
        {isAdding && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tipo de Fonte <span className="text-red-500">*</span>
                </label>
                <select
                  value={currentCombustivel.tipoFonte}
                  onChange={(e) => setCurrentCombustivel({ ...currentCombustivel, tipoFonte: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  {tiposFonte.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Equipamento <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={currentCombustivel.equipamento}
                  onChange={(e) => setCurrentCombustivel({ ...currentCombustivel, equipamento: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: Caldeira 1"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Quantidade <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={currentCombustivel.quantidade}
                  onChange={(e) => setCurrentCombustivel({ ...currentCombustivel, quantidade: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Unidade
                </label>
                <select
                  value={currentCombustivel.unidade}
                  onChange={(e) => setCurrentCombustivel({ ...currentCombustivel, unidade: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {unidades.map(unidade => (
                    <option key={unidade} value={unidade}>{unidade}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddCombustivel}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                {editingId ? 'Atualizar' : 'Adicionar'}
              </button>
            </div>
          </div>
        )}

        {/* Tabela */}
        {data?.combustiveis && data.combustiveis.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Tipo de Fonte
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Equipamento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Unidade
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.combustiveis.map((combustivel: Combustivel) => (
                  <tr key={combustivel.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{combustivel.tipoFonte}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{combustivel.equipamento}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{combustivel.quantidade}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{combustivel.unidade}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditCombustivel(combustivel)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCombustivel(combustivel.id)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
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
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Flame className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Nenhum combustível adicionado</p>
            <p className="text-xs mt-1">Clique em "Adicionar" para incluir um novo item</p>
          </div>
        )}
      </div>

      {/* Informações */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-gray-900">Dica</h3>
            <p className="text-sm text-gray-600 mt-1">
              Certifique-se de incluir todos os combustíveis e fontes de energia utilizados no empreendimento.
              Informações precisas são essenciais para o licenciamento ambiental.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
