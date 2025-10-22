import React, { useState } from 'react';
import { Trash2, Plus, Edit2, AlertCircle, Info } from 'lucide-react';

interface Step4ResiduosProps {
  data: any;
  onChange: (data: any) => void;
}

interface ResiduoGrupo {
  id: string;
  tipo: string;
  quantidade: string;
  destino: string;
}

interface ResiduoGeral {
  id: string;
  categoria: string;
  tipo: string;
  origem: string;
  tratamento: string;
  destino: string;
  quantidade: string;
}

const tiposGrupoA = [
  'Resíduos Infectantes',
  'Culturas e Estoques de Microrganismos',
  'Resíduos de Laboratórios',
  'Bolsas de Sangue',
  'Tecidos e Órgãos',
  'Materiais Perfurocortantes',
  'Resíduos de Animais Contaminados'
];

const tiposGrupoB = [
  'Medicamentos Vencidos',
  'Resíduos Químicos Perigosos',
  'Resíduos Quimioterápicos',
  'Produtos Hormonais',
  'Antimicrobianos',
  'Reagentes de Laboratório',
  'Efluentes de Processamento de Imagens'
];

const destinosResiduos = [
  'Autoclave',
  'Incineração',
  'Aterro Sanitário',
  'Aterro Industrial',
  'Tratamento Químico',
  'Reciclagem',
  'Empresa Especializada',
  'Outro'
];

const tiposResiduosSolidos = [
  'Papel e Papelão',
  'Plástico',
  'Metal',
  'Vidro',
  'Orgânico',
  'Eletrônico',
  'Entulho',
  'Outro'
];

const tiposResiduosLiquidos = [
  'Efluente Industrial',
  'Efluente Sanitário',
  'Óleo Usado',
  'Solvente',
  'Tinta',
  'Outro'
];

const tratamentos = [
  'Não possui tratamento',
  'Tratamento Físico',
  'Tratamento Químico',
  'Tratamento Biológico',
  'Tratamento Térmico',
  'ETE',
  'Outro'
];

export default function Step4Residuos({ data, onChange }: Step4ResiduosProps) {
  const [isAddingGrupoA, setIsAddingGrupoA] = useState(false);
  const [isAddingGrupoB, setIsAddingGrupoB] = useState(false);
  const [isAddingGeral, setIsAddingGeral] = useState(false);

  const [editingGrupoAId, setEditingGrupoAId] = useState<string | null>(null);
  const [editingGrupoBId, setEditingGrupoBId] = useState<string | null>(null);
  const [editingGeralId, setEditingGeralId] = useState<string | null>(null);

  const [currentGrupoA, setCurrentGrupoA] = useState<ResiduoGrupo>({
    id: '',
    tipo: '',
    quantidade: '',
    destino: ''
  });

  const [currentGrupoB, setCurrentGrupoB] = useState<ResiduoGrupo>({
    id: '',
    tipo: '',
    quantidade: '',
    destino: ''
  });

  const [currentGeral, setCurrentGeral] = useState<ResiduoGeral>({
    id: '',
    categoria: '',
    tipo: '',
    origem: '',
    tratamento: '',
    destino: '',
    quantidade: ''
  });

  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleAddGrupoA = () => {
    if (!currentGrupoA.tipo || !currentGrupoA.quantidade || !currentGrupoA.destino) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const residuosGrupoA = data?.residuosGrupoA || [];

    if (editingGrupoAId) {
      const updated = residuosGrupoA.map((r: ResiduoGrupo) =>
        r.id === editingGrupoAId ? { ...currentGrupoA, id: editingGrupoAId } : r
      );
      handleChange('residuosGrupoA', updated);
      setEditingGrupoAId(null);
    } else {
      const newResiduo = {
        ...currentGrupoA,
        id: Date.now().toString()
      };
      handleChange('residuosGrupoA', [...residuosGrupoA, newResiduo]);
    }

    setCurrentGrupoA({ id: '', tipo: '', quantidade: '', destino: '' });
    setIsAddingGrupoA(false);
  };

  const handleEditGrupoA = (residuo: ResiduoGrupo) => {
    setCurrentGrupoA(residuo);
    setEditingGrupoAId(residuo.id);
    setIsAddingGrupoA(true);
  };

  const handleDeleteGrupoA = (id: string) => {
    const residuosGrupoA = data?.residuosGrupoA || [];
    handleChange('residuosGrupoA', residuosGrupoA.filter((r: ResiduoGrupo) => r.id !== id));
  };

  const handleCancelGrupoA = () => {
    setCurrentGrupoA({ id: '', tipo: '', quantidade: '', destino: '' });
    setIsAddingGrupoA(false);
    setEditingGrupoAId(null);
  };

  const handleAddGrupoB = () => {
    if (!currentGrupoB.tipo || !currentGrupoB.quantidade || !currentGrupoB.destino) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const residuosGrupoB = data?.residuosGrupoB || [];

    if (editingGrupoBId) {
      const updated = residuosGrupoB.map((r: ResiduoGrupo) =>
        r.id === editingGrupoBId ? { ...currentGrupoB, id: editingGrupoBId } : r
      );
      handleChange('residuosGrupoB', updated);
      setEditingGrupoBId(null);
    } else {
      const newResiduo = {
        ...currentGrupoB,
        id: Date.now().toString()
      };
      handleChange('residuosGrupoB', [...residuosGrupoB, newResiduo]);
    }

    setCurrentGrupoB({ id: '', tipo: '', quantidade: '', destino: '' });
    setIsAddingGrupoB(false);
  };

  const handleEditGrupoB = (residuo: ResiduoGrupo) => {
    setCurrentGrupoB(residuo);
    setEditingGrupoBId(residuo.id);
    setIsAddingGrupoB(true);
  };

  const handleDeleteGrupoB = (id: string) => {
    const residuosGrupoB = data?.residuosGrupoB || [];
    handleChange('residuosGrupoB', residuosGrupoB.filter((r: ResiduoGrupo) => r.id !== id));
  };

  const handleCancelGrupoB = () => {
    setCurrentGrupoB({ id: '', tipo: '', quantidade: '', destino: '' });
    setIsAddingGrupoB(false);
    setEditingGrupoBId(null);
  };

  const handleAddGeral = () => {
    if (!currentGeral.categoria || !currentGeral.tipo || !currentGeral.origem ||
        !currentGeral.tratamento || !currentGeral.destino || !currentGeral.quantidade) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const residuosGerais = data?.residuosGerais || [];

    if (editingGeralId) {
      const updated = residuosGerais.map((r: ResiduoGeral) =>
        r.id === editingGeralId ? { ...currentGeral, id: editingGeralId } : r
      );
      handleChange('residuosGerais', updated);
      setEditingGeralId(null);
    } else {
      const newResiduo = {
        ...currentGeral,
        id: Date.now().toString()
      };
      handleChange('residuosGerais', [...residuosGerais, newResiduo]);
    }

    setCurrentGeral({
      id: '',
      categoria: '',
      tipo: '',
      origem: '',
      tratamento: '',
      destino: '',
      quantidade: ''
    });
    setIsAddingGeral(false);
  };

  const handleEditGeral = (residuo: ResiduoGeral) => {
    setCurrentGeral(residuo);
    setEditingGeralId(residuo.id);
    setIsAddingGeral(true);
  };

  const handleDeleteGeral = (id: string) => {
    const residuosGerais = data?.residuosGerais || [];
    handleChange('residuosGerais', residuosGerais.filter((r: ResiduoGeral) => r.id !== id));
  };

  const handleCancelGeral = () => {
    setCurrentGeral({
      id: '',
      categoria: '',
      tipo: '',
      origem: '',
      tratamento: '',
      destino: '',
      quantidade: ''
    });
    setIsAddingGeral(false);
    setEditingGeralId(null);
  };

  const getTiposPorCategoria = () => {
    if (currentGeral.categoria === 'Sólidos') {
      return tiposResiduosSolidos;
    } else if (currentGeral.categoria === 'Líquidos') {
      return tiposResiduosLiquidos;
    }
    return [];
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-2 mb-2">
        <Trash2 className="w-6 h-6 text-red-600" />
        <h2 className="text-2xl font-bold text-gray-900">Resíduos</h2>
      </div>

      {/* Grupo A - Resíduos Infectantes */}
      <div className="border border-red-300 rounded-lg p-4 bg-red-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Grupo A - Resíduos Infectantes</h3>
            <div className="relative group">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-xs rounded-lg z-10">
                Resíduos com possível presença de agentes biológicos que podem apresentar risco de infecção.
              </div>
            </div>
          </div>

          {!isAddingGrupoA && (
            <button
              onClick={() => setIsAddingGrupoA(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          )}
        </div>

        {isAddingGrupoA && (
          <div className="mb-4 p-4 bg-white border border-red-300 rounded-lg space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tipo <span className="text-red-500">*</span>
                </label>
                <select
                  value={currentGrupoA.tipo}
                  onChange={(e) => setCurrentGrupoA({ ...currentGrupoA, tipo: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  {tiposGrupoA.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Quantidade (kg/mês) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={currentGrupoA.quantidade}
                  onChange={(e) => setCurrentGrupoA({ ...currentGrupoA, quantidade: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Destino <span className="text-red-500">*</span>
                </label>
                <select
                  value={currentGrupoA.destino}
                  onChange={(e) => setCurrentGrupoA({ ...currentGrupoA, destino: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  {destinosResiduos.map(destino => (
                    <option key={destino} value={destino}>{destino}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancelGrupoA}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddGrupoA}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                {editingGrupoAId ? 'Atualizar' : 'Adicionar'}
              </button>
            </div>
          </div>
        )}

        {data?.residuosGrupoA && data.residuosGrupoA.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Quantidade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Destino</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.residuosGrupoA.map((residuo: ResiduoGrupo) => (
                  <tr key={residuo.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{residuo.tipo}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{residuo.quantidade} kg/mês</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{residuo.destino}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditGrupoA(residuo)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGrupoA(residuo.id)}
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
          <div className="text-center py-8 text-gray-500 bg-white rounded-lg">
            <Trash2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Nenhum resíduo do Grupo A cadastrado</p>
          </div>
        )}
      </div>

      {/* Grupo B - Resíduos Químicos */}
      <div className="border border-yellow-300 rounded-lg p-4 bg-yellow-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">Grupo B - Resíduos Químicos</h3>
            <div className="relative group">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-xs rounded-lg z-10">
                Resíduos contendo substâncias químicas que podem apresentar risco à saúde pública ou ao meio ambiente.
              </div>
            </div>
          </div>

          {!isAddingGrupoB && (
            <button
              onClick={() => setIsAddingGrupoB(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          )}
        </div>

        {isAddingGrupoB && (
          <div className="mb-4 p-4 bg-white border border-yellow-300 rounded-lg space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tipo <span className="text-red-500">*</span>
                </label>
                <select
                  value={currentGrupoB.tipo}
                  onChange={(e) => setCurrentGrupoB({ ...currentGrupoB, tipo: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  {tiposGrupoB.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Quantidade (kg/mês) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={currentGrupoB.quantidade}
                  onChange={(e) => setCurrentGrupoB({ ...currentGrupoB, quantidade: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Destino <span className="text-red-500">*</span>
                </label>
                <select
                  value={currentGrupoB.destino}
                  onChange={(e) => setCurrentGrupoB({ ...currentGrupoB, destino: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  {destinosResiduos.map(destino => (
                    <option key={destino} value={destino}>{destino}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancelGrupoB}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddGrupoB}
                className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                {editingGrupoBId ? 'Atualizar' : 'Adicionar'}
              </button>
            </div>
          </div>
        )}

        {data?.residuosGrupoB && data.residuosGrupoB.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Quantidade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Destino</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.residuosGrupoB.map((residuo: ResiduoGrupo) => (
                  <tr key={residuo.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{residuo.tipo}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{residuo.quantidade} kg/mês</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{residuo.destino}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditGrupoB(residuo)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGrupoB(residuo.id)}
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
          <div className="text-center py-8 text-gray-500 bg-white rounded-lg">
            <Trash2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Nenhum resíduo do Grupo B cadastrado</p>
          </div>
        )}
      </div>

      {/* Resíduos Gerais */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Resíduos Gerais</h3>
            <div className="relative group">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-xs rounded-lg z-10">
                Resíduos sólidos e líquidos gerados nas atividades do empreendimento.
              </div>
            </div>
          </div>

          {!isAddingGeral && (
            <button
              onClick={() => setIsAddingGeral(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          )}
        </div>

        {isAddingGeral && (
          <div className="mb-4 p-4 bg-gray-50 border border-gray-300 rounded-lg space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Categoria <span className="text-red-500">*</span>
                </label>
                <select
                  value={currentGeral.categoria}
                  onChange={(e) => setCurrentGeral({ ...currentGeral, categoria: e.target.value, tipo: '' })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  <option value="Sólidos">Sólidos</option>
                  <option value="Líquidos">Líquidos</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tipo <span className="text-red-500">*</span>
                </label>
                <select
                  value={currentGeral.tipo}
                  onChange={(e) => setCurrentGeral({ ...currentGeral, tipo: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={!currentGeral.categoria}
                >
                  <option value="">Selecione a categoria primeiro...</option>
                  {getTiposPorCategoria().map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Origem <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={currentGeral.origem}
                  onChange={(e) => setCurrentGeral({ ...currentGeral, origem: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: Setor de produção"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tratamento <span className="text-red-500">*</span>
                </label>
                <select
                  value={currentGeral.tratamento}
                  onChange={(e) => setCurrentGeral({ ...currentGeral, tratamento: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  {tratamentos.map(trat => (
                    <option key={trat} value={trat}>{trat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Destino <span className="text-red-500">*</span>
                </label>
                <select
                  value={currentGeral.destino}
                  onChange={(e) => setCurrentGeral({ ...currentGeral, destino: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  {destinosResiduos.map(dest => (
                    <option key={dest} value={dest}>{dest}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Quantidade (kg/mês) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={currentGeral.quantidade}
                  onChange={(e) => setCurrentGeral({ ...currentGeral, quantidade: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancelGeral}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddGeral}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                {editingGeralId ? 'Atualizar' : 'Adicionar'}
              </button>
            </div>
          </div>
        )}

        {data?.residuosGerais && data.residuosGerais.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Categoria</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Origem</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Tratamento</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Destino</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Quantidade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.residuosGerais.map((residuo: ResiduoGeral) => (
                  <tr key={residuo.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{residuo.categoria}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{residuo.tipo}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{residuo.origem}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{residuo.tratamento}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{residuo.destino}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{residuo.quantidade} kg/mês</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditGeral(residuo)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGeral(residuo.id)}
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
            <Trash2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Nenhum resíduo geral cadastrado</p>
          </div>
        )}
      </div>

      {/* Informações */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-gray-900">Informação</h3>
            <p className="text-sm text-gray-600 mt-1">
              Cadastre todos os resíduos gerados pelo empreendimento. Grupo A são resíduos infectantes,
              Grupo B são resíduos químicos, e os Resíduos Gerais incluem sólidos e líquidos comuns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
