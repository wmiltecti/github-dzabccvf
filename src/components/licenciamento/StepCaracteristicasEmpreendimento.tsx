import React, { useState } from 'react';
import { Search, Info, AlertCircle } from 'lucide-react';

interface LicencaAnterior {
  tipo: string;
  numero: string;
  ano: string;
  validade: string;
}

interface CaracteristicasData {
  porte?: string;
  potencialPoluidor?: string;
  codigoCNAE?: string;
  descricaoCNAE?: string;
  possuiLicencaAnterior?: 'sim' | 'nao' | '';
  licencaAnterior?: LicencaAnterior;
  numeroEmpregados?: number;
}

interface StepCaracteristicasEmpreendimentoProps {
  data?: CaracteristicasData;
  onChange?: (data: CaracteristicasData) => void;
}

const cnaesExemplo = [
  { codigo: '0111-3/01', descricao: 'Cultivo de arroz' },
  { codigo: '0111-3/02', descricao: 'Cultivo de milho' },
  { codigo: '1011-2/01', descricao: 'Frigorífico - abate de bovinos' },
  { codigo: '1011-2/02', descricao: 'Frigorífico - abate de suínos' },
  { codigo: '1012-1/01', descricao: 'Abate de aves' },
  { codigo: '2330-3/01', descricao: 'Fabricação de estruturas pré-moldadas de concreto' },
  { codigo: '2342-7/01', descricao: 'Fabricação de cerâmica' },
  { codigo: '3600-6/01', descricao: 'Captação, tratamento e distribuição de água' },
  { codigo: '3701-1/00', descricao: 'Gestão de redes de esgoto' },
  { codigo: '4120-4/00', descricao: 'Construção de edifícios' },
];

export default function StepCaracteristicasEmpreendimento({
  data = {},
  onChange
}: StepCaracteristicasEmpreendimentoProps) {
  const [searchCNAE, setSearchCNAE] = useState('');
  const [showCNAEResults, setShowCNAEResults] = useState(false);

  const handleChange = (field: string, value: any) => {
    const newData = { ...data, [field]: value };
    onChange?.(newData);
  };

  const handleLicencaAnteriorChange = (field: keyof LicencaAnterior, value: string) => {
    const newLicenca = { ...data.licencaAnterior, [field]: value } as LicencaAnterior;
    handleChange('licencaAnterior', newLicenca);
  };

  const handleSelectCNAE = (cnae: typeof cnaesExemplo[0]) => {
    handleChange('codigoCNAE', cnae.codigo);
    handleChange('descricaoCNAE', cnae.descricao);
    setSearchCNAE(cnae.codigo);
    setShowCNAEResults(false);

    // Simula cálculo de porte e potencial poluidor baseado no CNAE
    calcularPorteEPotencial(cnae.codigo);
  };

  const calcularPorteEPotencial = (cnae: string) => {
    // Simulação de cálculo baseado no CNAE
    // Em produção, isso viria de uma API ou tabela de classificação
    let porte = 'Médio';
    let potencial = 'Médio';

    if (cnae.startsWith('1011') || cnae.startsWith('1012')) {
      porte = 'Grande';
      potencial = 'Alto';
    } else if (cnae.startsWith('0111')) {
      porte = 'Pequeno';
      potencial = 'Baixo';
    } else if (cnae.startsWith('3600') || cnae.startsWith('3701')) {
      porte = 'Grande';
      potencial = 'Alto';
    }

    handleChange('porte', porte);
    handleChange('potencialPoluidor', potencial);
  };

  const filteredCNAEs = searchCNAE.length >= 2
    ? cnaesExemplo.filter(
        cnae =>
          cnae.codigo.toLowerCase().includes(searchCNAE.toLowerCase()) ||
          cnae.descricao.toLowerCase().includes(searchCNAE.toLowerCase())
      )
    : cnaesExemplo;

  const getPorteColor = (porte?: string) => {
    switch (porte) {
      case 'Pequeno':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Médio':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Grande':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPotencialColor = (potencial?: string) => {
    switch (potencial) {
      case 'Baixo':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Médio':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Alto':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Informação importante</p>
            <p>
              O porte e potencial poluidor serão calculados automaticamente após a seleção do código CNAE
              e preenchimento das demais informações do empreendimento.
            </p>
          </div>
        </div>
      </div>

      {/* Código CNAE - Searchable */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Código CNAE <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchCNAE}
              onChange={(e) => {
                setSearchCNAE(e.target.value);
                setShowCNAEResults(true);
              }}
              onFocus={() => setShowCNAEResults(true)}
              placeholder="Buscar por código ou descrição..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Search Results Dropdown */}
          {showCNAEResults && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowCNAEResults(false)}
              />
              <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-auto">
                {filteredCNAEs.length > 0 ? (
                  <div className="py-1">
                    {filteredCNAEs.map((cnae) => (
                      <button
                        key={cnae.codigo}
                        onClick={() => handleSelectCNAE(cnae)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                      >
                        <div className="font-medium text-gray-900">{cnae.codigo}</div>
                        <div className="text-sm text-gray-600 mt-0.5">{cnae.descricao}</div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    Nenhum CNAE encontrado
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {data.codigoCNAE && data.descricaoCNAE && (
          <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-sm">
              <span className="font-medium text-gray-900">{data.codigoCNAE}</span>
              <span className="text-gray-600"> - {data.descricaoCNAE}</span>
            </div>
          </div>
        )}
      </div>

      {/* Porte e Potencial Poluidor - Read Only */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Porte do Empreendimento
          </label>
          <div
            className={`px-4 py-3 border rounded-lg font-medium text-center ${getPorteColor(
              data.porte
            )}`}
          >
            {data.porte || 'Não calculado'}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Calculado automaticamente
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Potencial Poluidor
          </label>
          <div
            className={`px-4 py-3 border rounded-lg font-medium text-center ${getPotencialColor(
              data.potencialPoluidor
            )}`}
          >
            {data.potencialPoluidor || 'Não calculado'}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Calculado automaticamente
          </p>
        </div>
      </div>

      {/* Número de Empregados */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Número de Empregados <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min="0"
          value={data.numeroEmpregados === undefined ? '' : data.numeroEmpregados}
          onChange={(e) => {
            const value = e.target.value;
            handleChange('numeroEmpregados', value === '' ? undefined : parseInt(value));
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="0"
        />
      </div>

      {/* Licença Anterior */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Possui Licença Ambiental Anterior? <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="possuiLicencaAnterior"
                value="sim"
                checked={data.possuiLicencaAnterior === 'sim'}
                onChange={(e) => handleChange('possuiLicencaAnterior', e.target.value)}
                className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Sim</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="possuiLicencaAnterior"
                value="nao"
                checked={data.possuiLicencaAnterior === 'nao'}
                onChange={(e) => {
                  handleChange('possuiLicencaAnterior', e.target.value);
                  handleChange('licencaAnterior', undefined);
                }}
                className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Não</span>
            </label>
          </div>
        </div>

        {/* Conditional Fields - Licença Anterior */}
        {data.possuiLicencaAnterior === 'sim' && (
          <div className="ml-6 p-4 bg-gray-50 border-l-4 border-green-600 rounded-r-lg space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-gray-900">Dados da Licença Anterior</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Licença <span className="text-red-500">*</span>
                </label>
                <select
                  value={data.licencaAnterior?.tipo || ''}
                  onChange={(e) => handleLicencaAnteriorChange('tipo', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  <option value="LP">LP - Licença Prévia</option>
                  <option value="LI">LI - Licença de Instalação</option>
                  <option value="LO">LO - Licença de Operação</option>
                  <option value="LAS">LAS - Licença Ambiental Simplificada</option>
                  <option value="LAU">LAU - Licença Ambiental Única</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número da Licença <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.licencaAnterior?.numero || ''}
                  onChange={(e) => handleLicencaAnteriorChange('numero', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: 123456/2023"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ano de Emissão <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={data.licencaAnterior?.ano || ''}
                  onChange={(e) => handleLicencaAnteriorChange('ano', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Validade <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={data.licencaAnterior?.validade || ''}
                  onChange={(e) => handleLicencaAnteriorChange('validade', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Card */}
      {data.codigoCNAE && data.numeroEmpregados && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
          <h3 className="font-medium text-green-900 mb-3">Resumo das Características</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-green-700">CNAE:</span>
              <span className="ml-2 font-medium text-green-900">{data.codigoCNAE}</span>
            </div>
            <div>
              <span className="text-green-700">Empregados:</span>
              <span className="ml-2 font-medium text-green-900">{data.numeroEmpregados}</span>
            </div>
            <div>
              <span className="text-green-700">Porte:</span>
              <span className="ml-2 font-medium text-green-900">{data.porte || 'N/A'}</span>
            </div>
            <div>
              <span className="text-green-700">Potencial:</span>
              <span className="ml-2 font-medium text-green-900">{data.potencialPoluidor || 'N/A'}</span>
            </div>
            {data.possuiLicencaAnterior === 'sim' && data.licencaAnterior?.numero && (
              <div className="col-span-2">
                <span className="text-green-700">Licença Anterior:</span>
                <span className="ml-2 font-medium text-green-900">
                  {data.licencaAnterior.tipo} - {data.licencaAnterior.numero}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
