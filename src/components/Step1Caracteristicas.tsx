import React, { useState, useEffect } from 'react';
import { Search, Clock, Users, Building2, AlertCircle, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import { useProcessoAPI } from '../hooks/useProcessoAPI';
import { useFormWizardStore } from '../store/formWizardStore';
import { DadosGeraisPayload } from '../lib/api/processos';
import ProcessoHeader from './ProcessoHeader';
import OfflineWarningFooter from './OfflineWarningFooter';

interface Step1CaracteristicasProps {
  data: any;
  onChange: (data: any) => void;
  unidadeMedida?: string;
}

interface CNAEOption {
  code: string;
  description: string;
}

const cnaeMockData: CNAEOption[] = [
  { code: '0111-3/01', description: 'Cultivo de arroz' },
  { code: '0111-3/02', description: 'Cultivo de milho' },
  { code: '0111-3/03', description: 'Cultivo de trigo' },
  { code: '0113-0/00', description: 'Cultivo de cana-de-açúcar' },
  { code: '0115-6/00', description: 'Cultivo de soja' },
  { code: '1011-2/01', description: 'Frigorífico - abate de bovinos' },
  { code: '1012-1/01', description: 'Frigorífico - abate de suínos' },
  { code: '1013-9/01', description: 'Frigorífico - abate de aves' },
  { code: '2330-3/01', description: 'Fabricação de estruturas pré-moldadas de concreto armado' },
  { code: '2341-9/00', description: 'Fabricação de produtos cerâmicos refratários' },
];

export default function Step1Caracteristicas({ data, onChange, unidadeMedida = 'm²' }: Step1CaracteristicasProps) {
  const [cnaeSearch, setCnaeSearch] = useState(data?.cnaeDescricao || '');
  const [showCnaeDropdown, setShowCnaeDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const { upsertDadosGerais, isOfflineMode, loading } = useProcessoAPI();
  const {
    processoId,
    protocoloInterno,
    numeroProcessoExterno,
    setProtocoloInterno,
    setNumeroProcessoExterno,
    setOfflineMode,
  } = useFormWizardStore();

  useEffect(() => {
    setOfflineMode(isOfflineMode);
  }, [isOfflineMode, setOfflineMode]);

  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCnaeSearch = (searchValue: string) => {
    setCnaeSearch(searchValue);
    setShowCnaeDropdown(searchValue.length > 0);
    handleChange('cnaeDescricao', searchValue);
  };

  const handleCnaeSelect = (cnae: CNAEOption) => {
    setCnaeSearch(cnae.description);
    handleChange('cnaeCodigo', cnae.code);
    handleChange('cnaeDescricao', cnae.description);
    setShowCnaeDropdown(false);
  };

  const filteredCnaes = cnaeMockData.filter(
    cnae =>
      cnae.code.toLowerCase().includes(cnaeSearch.toLowerCase()) ||
      cnae.description.toLowerCase().includes(cnaeSearch.toLowerCase())
  );

  const validateField = (field: string) => {
    const newErrors = { ...errors };

    if (field === 'area' && !data?.area) {
      newErrors.area = 'Área é obrigatória';
    }
    if (field === 'cnaeCodigo' && !data?.cnaeCodigo) {
      newErrors.cnaeCodigo = 'CNAE é obrigatório';
    }
    if (field === 'numeroEmpregados' && !data?.numeroEmpregados) {
      newErrors.numeroEmpregados = 'Número de empregados é obrigatório';
    }
    if (field === 'horarioInicio' && !data?.horarioInicio) {
      newErrors.horarioInicio = 'Horário de início é obrigatório';
    }
    if (field === 'horarioFim' && !data?.horarioFim) {
      newErrors.horarioFim = 'Horário de fim é obrigatório';
    }

    setErrors(newErrors);
  };

  const mapFormDataToPayload = (): DadosGeraisPayload => {
    const payload: DadosGeraisPayload = {
      area: data?.area ? parseFloat(data.area) : undefined,
      porte: data?.porte || undefined,
      potencial_poluidor: data?.potencialPoluidor || undefined,
      cnae_codigo: data?.cnaeCodigo || undefined,
      cnae_descricao: data?.cnaeDescricao || undefined,
      numero_empregados: data?.numeroEmpregados ? parseInt(data.numeroEmpregados) : undefined,
      horario_inicio: data?.horarioInicio || undefined,
      horario_fim: data?.horarioFim || undefined,
    };

    if (data?.possuiLicencaAnterior === 'sim') {
      payload.possui_licenca_anterior = true;
      payload.licenca_tipo = data?.licencaTipo || undefined;
      payload.licenca_numero = data?.licencaNumero || undefined;
      payload.licenca_ano = data?.licencaAno ? parseInt(data.licencaAno) : undefined;
      payload.licenca_validade = data?.licencaValidade || undefined;
    } else if (data?.possuiLicencaAnterior === 'nao') {
      payload.possui_licenca_anterior = false;
    }

    return payload;
  };

  const saveStepToAPI = async () => {
    if (!processoId) {
      toast.error('Processo não inicializado');
      return;
    }

    setIsSaving(true);
    try {
      const payload = mapFormDataToPayload();
      const response = await upsertDadosGerais(processoId, payload);

      if (response) {
        setProtocoloInterno(response.protocolo_interno);
        if (response.numero_processo_externo) {
          setNumeroProcessoExterno(response.numero_processo_externo);
        }

        if (isOfflineMode) {
          toast.warning('Dados salvos offline - Protocolo: OFFLINE');
        } else {
          toast.success(`Dados salvos com sucesso! Protocolo: ${response.protocolo_interno}`);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar dados');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndContinue = () => {
    const requiredFields = ['area', 'cnaeCodigo', 'numeroEmpregados', 'horarioInicio', 'horarioFim'];
    const newErrors: Record<string, string> = {};

    requiredFields.forEach(field => {
      if (!data?.[field]) {
        newErrors[field] = 'Campo obrigatório';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    saveStepToAPI();
  };

  return (
    <>
      <ProcessoHeader
        protocoloInterno={protocoloInterno}
        numeroProcessoExterno={numeroProcessoExterno}
      />
      <div className="space-y-6 pb-24">
      {/* Cabeçalho */}
      <div className="flex items-start gap-3 mb-2">
        <div className="flex-shrink-0">
          <FileText className="w-6 h-6 text-blue-600 mt-1" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Características do Empreendimento</h2>
      </div>

      {/* Unidade de Medida e Área */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unidade de Medida
          </label>
          <input
            type="text"
            value={unidadeMedida}
            readOnly
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Área Total <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={data?.area || ''}
              onChange={(e) => handleChange('area', e.target.value)}
              onBlur={() => validateField('area')}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.area ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
              {unidadeMedida}
            </span>
          </div>
          {errors.area && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.area}
            </p>
          )}
        </div>
      </div>

      {/* Porte e Potencial Poluidor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Porte do Empreendimento
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={data?.porte || 'Médio Porte'}
              readOnly
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Potencial Poluidor
          </label>
          <input
            type="text"
            value={data?.potencialPoluidor || 'Médio'}
            readOnly
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
          />
        </div>
      </div>

      {/* CNAE com busca */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          CNAE <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={cnaeSearch}
            onChange={(e) => handleCnaeSearch(e.target.value)}
            onFocus={() => cnaeSearch && setShowCnaeDropdown(true)}
            onBlur={() => {
              setTimeout(() => setShowCnaeDropdown(false), 200);
              validateField('cnaeCodigo');
            }}
            className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.cnaeCodigo ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Digite o código ou descrição do CNAE"
          />
          {showCnaeDropdown && filteredCnaes.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredCnaes.map((cnae) => (
                <div
                  key={cnae.code}
                  onClick={() => handleCnaeSelect(cnae)}
                  className="px-4 py-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">{cnae.code}</div>
                  <div className="text-sm text-gray-600">{cnae.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        {data?.cnaeCodigo && (
          <div className="mt-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
            <span className="text-sm font-medium text-green-800">
              Selecionado: {data.cnaeCodigo} - {data.cnaeDescricao}
            </span>
          </div>
        )}
        {errors.cnaeCodigo && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.cnaeCodigo}
          </p>
        )}
      </div>

      {/* Licença Anterior */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Possui Licença Anterior? <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="possuiLicencaAnterior"
              value="sim"
              checked={data?.possuiLicencaAnterior === 'sim'}
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
              checked={data?.possuiLicencaAnterior === 'nao'}
              onChange={(e) => handleChange('possuiLicencaAnterior', e.target.value)}
              className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">Não</span>
          </label>
        </div>
      </div>

      {/* Campos condicionais da licença */}
      {data?.possuiLicencaAnterior === 'sim' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Licença
            </label>
            <select
              value={data?.licencaTipo || ''}
              onChange={(e) => handleChange('licencaTipo', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Selecione...</option>
              <option value="LP">LP - Licença Prévia</option>
              <option value="LI">LI - Licença de Instalação</option>
              <option value="LO">LO - Licença de Operação</option>
              <option value="LAC">LAC - Licença Ambiental de Construção</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número da Licença
            </label>
            <input
              type="text"
              value={data?.licencaNumero || ''}
              onChange={(e) => handleChange('licencaNumero', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ex: 12345/2023"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ano de Emissão
            </label>
            <input
              type="number"
              value={data?.licencaAno || ''}
              onChange={(e) => handleChange('licencaAno', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="2024"
              min="1900"
              max="2100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Validade
            </label>
            <input
              type="date"
              value={data?.licencaValidade || ''}
              onChange={(e) => handleChange('licencaValidade', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Número de Empregados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número de Empregados <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="number"
              value={data?.numeroEmpregados || ''}
              onChange={(e) => handleChange('numeroEmpregados', e.target.value)}
              onBlur={() => validateField('numeroEmpregados')}
              className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.numeroEmpregados ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
              min="0"
            />
          </div>
          {errors.numeroEmpregados && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.numeroEmpregados}
            </p>
          )}
        </div>
      </div>

      {/* Horário de Funcionamento */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Horário de Funcionamento <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-2">Início</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="time"
                value={data?.horarioInicio || ''}
                onChange={(e) => handleChange('horarioInicio', e.target.value)}
                onBlur={() => validateField('horarioInicio')}
                className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.horarioInicio ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.horarioInicio && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.horarioInicio}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-2">Término</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="time"
                value={data?.horarioFim || ''}
                onChange={(e) => handleChange('horarioFim', e.target.value)}
                onBlur={() => validateField('horarioFim')}
                className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.horarioFim ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.horarioFim && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.horarioFim}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Informações adicionais */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-gray-900">Informações sobre o formulário</h3>
            <p className="text-sm text-gray-600 mt-1">
              Os campos marcados com <span className="text-red-500">*</span> são obrigatórios.
              Certifique-se de preencher todos os dados corretamente antes de avançar.
            </p>
          </div>
        </div>
      </div>

      {/* Botão de Salvar */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSaveAndContinue}
          disabled={isSaving || loading}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaving || loading ? 'Salvando...' : 'Salvar e Continuar'}
        </button>
      </div>
    </div>
    <OfflineWarningFooter isOffline={isOfflineMode} onRetry={saveStepToAPI} />
    </>
  );
}
