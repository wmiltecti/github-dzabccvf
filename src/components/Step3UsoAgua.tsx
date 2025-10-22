import React, { useState, useEffect } from 'react';
import { Droplet, Info, AlertCircle, CheckCircle, Plus, Trash2, Edit2 } from 'lucide-react';

interface Step3UsoAguaProps {
  data: any;
  onChange: (data: any) => void;
  onValidation?: (isValid: boolean) => void;
}

interface Outorga {
  id: string;
  tipo: string;
  numero: string;
  validade: string;
  vazao: string;
}

const origensAgua = [
  'Rede Pública',
  'Poço Artesiano',
  'Poço Cacimba',
  'Captação Superficial',
  'Captação Pluvial',
  'Caminhão Pipa',
  'Outro'
];

const destinosFinais = [
  'Rede Pública de Esgoto',
  'Fossa Séptica + Sumidouro',
  'Fossa Séptica + Filtro',
  'ETE Própria',
  'Corpo Receptor',
  'Outro'
];

export default function Step3UsoAgua({ data, onChange, onValidation }: Step3UsoAguaProps) {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isAddingOutorga, setIsAddingOutorga] = useState(false);
  const [editingOutorgaId, setEditingOutorgaId] = useState<string | null>(null);
  const [currentOutorga, setCurrentOutorga] = useState<Outorga>({
    id: '',
    tipo: '',
    numero: '',
    validade: '',
    vazao: ''
  });

  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const toggleOrigem = (origem: string) => {
    const origens = data?.origens || [];
    const newOrigens = origens.includes(origem)
      ? origens.filter((o: string) => o !== origem)
      : [...origens, origem];
    handleChange('origens', newOrigens);
  };

  const needsOutorga = (): boolean => {
    const origens = data?.origens || [];
    const destinoFinal = data?.destinoFinal || '';

    const temOrigemNaoPublica = origens.some(
      (o: string) => o !== 'Rede Pública' && o !== 'Caminhão Pipa'
    );
    const temDestinoCorpoReceptor = destinoFinal === 'Corpo Receptor';

    return temOrigemNaoPublica || temDestinoCorpoReceptor;
  };

  const validarOutorga = (): boolean => {
    const errors: string[] = [];

    if (!data?.origens || data.origens.length === 0) {
      errors.push('Selecione ao menos uma origem de água');
    }

    if (!data?.consumoHumano) {
      errors.push('Informe o consumo para uso humano');
    }

    if (!data?.consumoOutros) {
      errors.push('Informe o consumo para outros usos');
    }

    if (!data?.volumeDespejo) {
      errors.push('Informe o volume de despejo');
    }

    if (!data?.destinoFinal) {
      errors.push('Selecione o destino final do efluente');
    }

    if (needsOutorga()) {
      const outorgas = data?.outorgas || [];
      if (outorgas.length === 0) {
        errors.push('É obrigatório cadastrar ao menos uma outorga para as condições selecionadas');
      } else {
        const outorgasIncompletas = outorgas.filter(
          (o: Outorga) => !o.tipo || !o.numero || !o.validade || !o.vazao
        );
        if (outorgasIncompletas.length > 0) {
          errors.push('Existem outorgas com campos incompletos');
        }
      }
    }

    setValidationErrors(errors);
    const isValid = errors.length === 0;

    if (onValidation) {
      onValidation(isValid);
    }

    return isValid;
  };

  useEffect(() => {
    validarOutorga();
  }, [data]);

  const handleAddOutorga = () => {
    if (!currentOutorga.tipo || !currentOutorga.numero || !currentOutorga.validade || !currentOutorga.vazao) {
      alert('Preencha todos os campos da outorga');
      return;
    }

    const outorgas = data?.outorgas || [];

    if (editingOutorgaId) {
      const updated = outorgas.map((o: Outorga) =>
        o.id === editingOutorgaId ? { ...currentOutorga, id: editingOutorgaId } : o
      );
      handleChange('outorgas', updated);
      setEditingOutorgaId(null);
    } else {
      const newOutorga = {
        ...currentOutorga,
        id: Date.now().toString()
      };
      handleChange('outorgas', [...outorgas, newOutorga]);
    }

    setCurrentOutorga({
      id: '',
      tipo: '',
      numero: '',
      validade: '',
      vazao: ''
    });
    setIsAddingOutorga(false);
  };

  const handleEditOutorga = (outorga: Outorga) => {
    setCurrentOutorga(outorga);
    setEditingOutorgaId(outorga.id);
    setIsAddingOutorga(true);
  };

  const handleDeleteOutorga = (id: string) => {
    const outorgas = data?.outorgas || [];
    handleChange('outorgas', outorgas.filter((o: Outorga) => o.id !== id));
  };

  const handleCancelEditOutorga = () => {
    setCurrentOutorga({
      id: '',
      tipo: '',
      numero: '',
      validade: '',
      vazao: ''
    });
    setIsAddingOutorga(false);
    setEditingOutorgaId(null);
  };

  return (
    <div className="space-y-6">
      {/* Validação de erros */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-red-900 mb-2">Atenção! Existem campos obrigatórios não preenchidos:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {validationErrors.length === 0 && (data?.origens?.length > 0 || data?.consumoHumano) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800 font-medium">Todos os campos estão preenchidos corretamente</p>
          </div>
        </div>
      )}

      {/* Origem da Água */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <Droplet className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Origem da Água</h3>
          <span className="text-red-500">*</span>
          <div className="relative group">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-xs rounded-lg z-10">
              Selecione todas as origens de água utilizadas no empreendimento. Você pode marcar múltiplas opções.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {origensAgua.map((origem) => (
            <label
              key={origem}
              className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                data?.origens?.includes(origem)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={data?.origens?.includes(origem) || false}
                onChange={() => toggleOrigem(origem)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">{origem}</span>
            </label>
          ))}
        </div>

        {data?.origens?.includes('Outro') && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Especifique a outra origem
            </label>
            <input
              type="text"
              value={data?.origemOutroTexto || ''}
              onChange={(e) => handleChange('origemOutroTexto', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descreva a origem"
            />
          </div>
        )}
      </div>

      {/* Consumo de Água */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <Droplet className="w-5 h-5 text-cyan-600" />
          <h3 className="text-lg font-semibold text-gray-900">Consumo de Água</h3>
          <div className="relative group">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-xs rounded-lg z-10">
              Informe o consumo diário de água em metros cúbicos (m³/dia). Separe entre consumo humano e outros usos.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Consumo para Uso Humano <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={data?.consumoHumano || ''}
                onChange={(e) => handleChange('consumoHumano', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                m³/dia
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Consumo para Outros Usos <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={data?.consumoOutros || ''}
                onChange={(e) => handleChange('consumoOutros', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                m³/dia
              </span>
            </div>
          </div>
        </div>

        {(data?.consumoHumano || data?.consumoOutros) && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Consumo Total:</strong>{' '}
              {(parseFloat(data?.consumoHumano || '0') + parseFloat(data?.consumoOutros || '0')).toFixed(2)} m³/dia
            </p>
          </div>
        )}
      </div>

      {/* Despejo e Destino Final */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <Droplet className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Efluentes</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Volume de Despejo Diário <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={data?.volumeDespejo || ''}
                onChange={(e) => handleChange('volumeDespejo', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                m³/dia
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destino Final do Efluente <span className="text-red-500">*</span>
            </label>
            <select
              value={data?.destinoFinal || ''}
              onChange={(e) => handleChange('destinoFinal', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecione...</option>
              {destinosFinais.map((destino) => (
                <option key={destino} value={destino}>
                  {destino}
                </option>
              ))}
            </select>
          </div>

          {data?.destinoFinal === 'Outro' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especifique o destino final
              </label>
              <input
                type="text"
                value={data?.destinoFinalOutroTexto || ''}
                onChange={(e) => handleChange('destinoFinalOutroTexto', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descreva o destino final"
              />
            </div>
          )}
        </div>
      </div>

      {/* Outorgas */}
      {needsOutorga() && (
        <div className="border border-orange-300 rounded-lg p-4 bg-orange-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Outorgas <span className="text-red-500">*</span>
              </h3>
              <div className="relative group">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-80 p-2 bg-gray-800 text-white text-xs rounded-lg z-10">
                  Outorgas são obrigatórias quando a origem não é apenas rede pública ou quando o destino final é corpo receptor.
                  Cadastre todas as outorgas relacionadas ao uso da água.
                </div>
              </div>
            </div>

            {!isAddingOutorga && (
              <button
                onClick={() => setIsAddingOutorga(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adicionar Outorga
              </button>
            )}
          </div>

          <div className="mb-4 p-3 bg-orange-100 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-900">
              <strong>Atenção:</strong> É obrigatório cadastrar ao menos uma outorga para as condições selecionadas.
            </p>
          </div>

          {/* Formulário de adição/edição */}
          {isAddingOutorga && (
            <div className="mb-4 p-4 bg-white border border-orange-300 rounded-lg space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Tipo de Outorga <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={currentOutorga.tipo}
                    onChange={(e) => setCurrentOutorga({ ...currentOutorga, tipo: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Selecione...</option>
                    <option value="Captação Superficial">Captação Superficial</option>
                    <option value="Captação Subterrânea">Captação Subterrânea</option>
                    <option value="Lançamento de Efluentes">Lançamento de Efluentes</option>
                    <option value="Barragem">Barragem</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Número da Outorga <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={currentOutorga.numero}
                    onChange={(e) => setCurrentOutorga({ ...currentOutorga, numero: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Ex: OUT-123456/2024"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Validade <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={currentOutorga.validade}
                    onChange={(e) => setCurrentOutorga({ ...currentOutorga, validade: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Vazão Outorgada (m³/dia) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={currentOutorga.vazao}
                    onChange={(e) => setCurrentOutorga({ ...currentOutorga, vazao: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancelEditOutorga}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddOutorga}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  {editingOutorgaId ? 'Atualizar' : 'Adicionar'}
                </button>
              </div>
            </div>
          )}

          {/* Tabela de Outorgas */}
          {data?.outorgas && data.outorgas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Número
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Validade
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Vazão
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.outorgas.map((outorga: Outorga) => (
                    <tr key={outorga.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{outorga.tipo}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{outorga.numero}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(outorga.validade).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{outorga.vazao} m³/dia</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditOutorga(outorga)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOutorga(outorga.id)}
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
              <Droplet className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Nenhuma outorga cadastrada</p>
              <p className="text-xs mt-1">É obrigatório adicionar ao menos uma outorga</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
