import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInscricaoStore } from '../../lib/store/inscricao';
import { Building, ArrowLeft, ArrowRight, Upload, MapPin, AlertTriangle, FileText } from 'lucide-react';
import { toast } from 'react-toastify';

export default function EmpreendimentoPage() {
  const navigate = useNavigate();
  const { setCurrentStep } = useInscricaoStore();
  
  const [formData, setFormData] = useState({
    tipo_empreendimento: '',
    tipo_licenca: '',
    situacao: '',
    possui_licenca_anterior: 'nao',
    licenca_tipo: '',
    licenca_numero: '',
    licenca_ano: '',
    licenca_validade: '',
    arquivo_projeto: null as File | null,
    sistema_referencia: 'SIRGAS 2000',
    area_total: ''
  });

  const tiposEmpreendimento = [
    'Selecione',
    'Mineração',
    'Indústria',
    'Infraestrutura',
    'Agropecuária',
    'Saneamento',
    'Energia',
    'Turismo'
  ];

  const tiposLicenca = [
    'Selecione',
    'Licença Prévia (LP)',
    'Licença de Instalação (LI)',
    'Licença de Operação (LO)',
    'Autorização Ambiental (AA)',
    'Licença Única (LU)'
  ];

  const situacoes = [
    'Selecione',
    'PLANEJADO',
    'OPERANDO',
    'INSTALADO'
  ];

  const sistemasReferencia = [
    'SIRGAS 2000',
    'WGS 84',
    'SAD 69',
    'Córrego Alegre'
  ];

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.zip')) {
        setFormData(prev => ({ ...prev, arquivo_projeto: file }));
        toast.success(`Arquivo ${file.name} anexado com sucesso!`);
      } else {
        toast.error('Por favor, selecione um arquivo ZIP.');
      }
    }
  };

  const handleProcessar = () => {
    if (!formData.arquivo_projeto) {
      toast.error('Anexe o arquivo ZIP do projeto antes de processar.');
      return;
    }
    toast.info('Processando arquivo...');
  };

  const handleNext = () => {
    if (!formData.tipo_empreendimento || formData.tipo_empreendimento === 'Selecione') {
      toast.error('Selecione o tipo de empreendimento');
      return;
    }
    if (!formData.tipo_licenca || formData.tipo_licenca === 'Selecione') {
      toast.error('Selecione o tipo de licença');
      return;
    }
    if (!formData.situacao || formData.situacao === 'Selecione') {
      toast.error('Selecione a situação');
      return;
    }

    if (window.location.pathname.includes('/inscricao/')) {
      navigate('/inscricao/formulario');
    } else {
      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    if (window.location.pathname.includes('/inscricao/')) {
      navigate('/inscricao/imovel');
    } else {
      setCurrentStep(2);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Empreendimento</h2>
        <p className="text-gray-600">
          Preencha os dados do empreendimento para licenciamento ambiental.
        </p>
      </div>

      <div className="space-y-6">
        {/* Seção 1: Dados do Empreendimento */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            Dados do Empreendimento
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Empreendimento/Atividade <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.tipo_empreendimento}
                onChange={(e) => handleFieldChange('tipo_empreendimento', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {tiposEmpreendimento.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Licença <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.tipo_licenca}
                onChange={(e) => handleFieldChange('tipo_licenca', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {tiposLicenca.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Situação <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.situacao}
                onChange={(e) => handleFieldChange('situacao', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {situacoes.map(sit => (
                  <option key={sit} value={sit}>{sit}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Seção 2: Licença ou Autorização Anterior */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            O Empreendimento possui Licença ou Autorização anterior?
          </h3>
          
          <div className="space-y-4">
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="possui_licenca"
                  value="nao"
                  checked={formData.possui_licenca_anterior === 'nao'}
                  onChange={(e) => handleFieldChange('possui_licenca_anterior', e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">Não</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="possui_licenca"
                  value="sim"
                  checked={formData.possui_licenca_anterior === 'sim'}
                  onChange={(e) => handleFieldChange('possui_licenca_anterior', e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">Sim</span>
              </label>
            </div>

            {formData.possui_licenca_anterior === 'sim' && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Se sim, informe:</p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Tipo</label>
                    <input
                      type="text"
                      value={formData.licenca_tipo}
                      onChange={(e) => handleFieldChange('licenca_tipo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">N°</label>
                    <input
                      type="text"
                      value={formData.licenca_numero}
                      onChange={(e) => handleFieldChange('licenca_numero', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Ano</label>
                    <input
                      type="text"
                      value={formData.licenca_ano}
                      onChange={(e) => handleFieldChange('licenca_ano', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="YYYY"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Validade</label>
                    <input
                      type="text"
                      value={formData.licenca_validade}
                      onChange={(e) => handleFieldChange('licenca_validade', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="DD/MM/AAAA"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Seção 3: Geoprocessamento */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            Geoprocessamento
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arquivo Zip do Projeto
                </label>
                <div className="flex gap-2">
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>{formData.arquivo_projeto ? formData.arquivo_projeto.name : 'Anexar'}</span>
                    </div>
                    <input
                      type="file"
                      accept=".zip"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <div className="w-16 h-16 flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-blue-500" />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sistema de Referência/Projeção
                </label>
                <select
                  value={formData.sistema_referencia}
                  onChange={(e) => handleFieldChange('sistema_referencia', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                >
                  {sistemasReferencia.map(sistema => (
                    <option key={sistema} value={sistema}>{sistema}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleProcessar}
              className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
            >
              PROCESSAR
            </button>
          </div>
        </div>

        {/* Seção 4: Área Total */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Área Total do Empreendimento (ha)
            </label>
            <input
              type="text"
              value={formData.area_total}
              onChange={(e) => handleFieldChange('area_total', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="256.2265"
            />
          </div>
        </div>

        {/* Seção 5: Consultas */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Consultas</h3>
          
          <div className="space-y-6">
            {/* Unidades de Conservação ICMBio */}
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Unidades de Conservação ICMBio</h4>
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm">Nome</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm">Grupo</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm">Área de Sobreposição</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-50">
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-500" colSpan={3}>
                      Nada Encontrado
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Unidades de Conservação Estaduais */}
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Unidades de Conservação Estaduais</h4>
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm">Nome</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm">Grupo</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm">Área de Sobreposição</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-50">
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-500" colSpan={3}>
                      Nada Encontrado
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Zonas de Amortecimento */}
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Zonas de Amortecimento de Unidades de Conservação Estaduais</h4>
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm">Nome</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm">Área de Sobreposição</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-50">
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-500" colSpan={2}>
                      Nada Encontrado
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Unidades de Conservação Municipais */}
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Unidades de Conservação Municipais</h4>
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm">Nome</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm">Grupo</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm">Área de Sobreposição</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-50">
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-500" colSpan={3}>
                      Nada Encontrado
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Embargos IBAMA */}
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Embargos IBAMA</h4>
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm">Descrição da Infração</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm">Área de Sobreposição</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm">Data do Embargo</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-50">
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-500" colSpan={3}>
                      Nada Encontrado
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Embargos ICMBio */}
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Embargos ICMBio</h4>
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm">Descrição da Infração</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm">Área de Sobreposição</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm">Data do Embargo</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-50">
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-500" colSpan={3}>
                      Nada Encontrado
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Embargos Estaduais */}
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Embargos Estaduais</h4>
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm">Área de Sobreposição</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm">Data do Embargo</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-50">
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-500" colSpan={2}>
                      Nada Encontrado
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Terras Indígenas */}
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Terras Indígenas</h4>
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm">Nome</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm">Área de Sobreposição</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-50">
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-500" colSpan={2}>
                      Nada Encontrado
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Desmatamento PRODES */}
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Desmatamento PRODES</h4>
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm">Data da Deteção</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm">Área de Sobreposição</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-50">
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-500" colSpan={2}>
                      Nada Encontrado
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Seção 6: Ações */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-700">Ações</span>
          </div>
        </div>
      </div>

      {/* Mensagem de alerta */}
      {(!formData.tipo_empreendimento || !formData.tipo_licenca || !formData.situacao) && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900">Campos obrigatórios</h4>
              <p className="text-sm text-yellow-800 mt-1">
                Preencha todos os campos obrigatórios (*) para continuar.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={handleBack}
          className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          Avançar
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}