import React, { useState, useEffect } from 'react';
import { FileText, ArrowRight, ArrowLeft, Upload, Wand2, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import { useEmpreendimentoStore, SituacaoEmpreendimento, EmpreendimentoParticipe } from '../../lib/store/empreendimento';
import ParticipesManager, { Participe } from '../../components/ParticipesManager';
import GeoUpload from '../../components/geo/GeoUpload';

interface DadosGeraisEmpreendimentoPageProps {
  onNext: (data?: any) => void;
  onPrevious?: () => void;
}

export default function DadosGeraisEmpreendimentoPage({
  onNext,
  onPrevious
}: DadosGeraisEmpreendimentoPageProps) {
  const {
    empreendimentoId,
    dadosGerais,
    participes,
    setDadosGerais,
    setParticipes,
    addParticipe,
    removeParticipe
  } = useEmpreendimentoStore();

  const [formData, setFormData] = useState({
    tipo_pessoa: dadosGerais?.tipo_pessoa || 'juridica',
    cnpj_cpf: dadosGerais?.cnpj_cpf || '',
    razao_social: dadosGerais?.razao_social || '',
    nome_fantasia: dadosGerais?.nome_fantasia || '',
    nome_empreendimento: dadosGerais?.nome_empreendimento || '',
    situacao: dadosGerais?.situacao || ('' as SituacaoEmpreendimento | ''),
    numero_empregados: dadosGerais?.numero_empregados || 0,
    horario_funcionamento: dadosGerais?.horario_funcionamento || '',
    descricao: dadosGerais?.descricao || '',
    endereco: dadosGerais?.endereco || '',
    cidade: dadosGerais?.cidade || '',
    estado: dadosGerais?.estado || '',
    cep: dadosGerais?.cep || '',
    telefone: dadosGerais?.telefone || '',
    email: dadosGerais?.email || '',
    prazo_implantacao: dadosGerais?.prazo_implantacao || '',
    area_construida: dadosGerais?.area_construida || '',
    capacidade_producao: dadosGerais?.capacidade_producao || ''
  });

  const [showGeoUpload, setShowGeoUpload] = useState(false);
  const [uploadedGeoFiles, setUploadedGeoFiles] = useState<string[]>([]);
  const [showGeoFrontIframe, setShowGeoFrontIframe] = useState(false);

  // ✨ Atualiza formData quando dados do store mudarem (modo edição)
  useEffect(() => {
    console.log('🔄 [DADOS GERAIS] useEffect disparado');
    console.log('📦 [DADOS GERAIS] dadosGerais do store:', dadosGerais);
    console.log('📦 [DADOS GERAIS] dadosGerais type:', typeof dadosGerais);
    console.log('📦 [DADOS GERAIS] dadosGerais keys:', dadosGerais ? Object.keys(dadosGerais) : 'null/undefined');
    console.log('👥 [DADOS GERAIS] participes do store:', participes);
    console.log('👥 [DADOS GERAIS] participes length:', participes?.length);
    
    // Carrega dados do store independente se está vazio ou não
    // Isso garante que sempre sincroniza com o store
    console.log('📝 [DADOS GERAIS] dadosGerais.nome_empreendimento:', dadosGerais?.nome_empreendimento);
    console.log('📝 [DADOS GERAIS] dadosGerais.razao_social:', dadosGerais?.razao_social);
    
    const newFormData = {
      tipo_pessoa: dadosGerais?.tipo_pessoa || 'juridica',
      cnpj_cpf: dadosGerais?.cnpj_cpf || '',
      razao_social: dadosGerais?.razao_social || '',
      nome_fantasia: dadosGerais?.nome_fantasia || '',
      nome_empreendimento: dadosGerais?.nome_empreendimento || '',
      situacao: dadosGerais?.situacao || ('' as SituacaoEmpreendimento | ''),
      numero_empregados: dadosGerais?.numero_empregados || 0,
      horario_funcionamento: dadosGerais?.horario_funcionamento || '',
      descricao: dadosGerais?.descricao || '',
      endereco: dadosGerais?.endereco || '',
      cidade: dadosGerais?.cidade || '',
      estado: dadosGerais?.estado || '',
      cep: dadosGerais?.cep || '',
      telefone: dadosGerais?.telefone || '',
      email: dadosGerais?.email || '',
      prazo_implantacao: dadosGerais?.prazo_implantacao || '',
      area_construida: dadosGerais?.area_construida || '',
      capacidade_producao: dadosGerais?.capacidade_producao || ''
    };
    
    console.log('📝 [DADOS GERAIS] Aplicando formData:', newFormData);
    setFormData(newFormData);
  }, [dadosGerais, participes]);

  const handleChange = (field: string, value: any) => {
    console.log('📝 [DADOS GERAIS] Campo alterado:', field, '=', value);
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
  };

  // ✅ Salva no store automaticamente após 1 segundo de inatividade
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('💾 [DADOS GERAIS] Auto-save - Atualizando store com formData');
      setDadosGerais(formData);
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData]);

  const handleAddParticipe = async (participe: Participe): Promise<void> => {
    const empreendimentoParticipe: EmpreendimentoParticipe = {
      id: participe.id,
      pessoa_id: participe.pessoa_id,
      pessoa_nome: participe.pessoa_nome,
      pessoa_cpf_cnpj: participe.pessoa_cpf_cnpj,
      pessoa_tipo: participe.pessoa_tipo,
      papel: participe.papel,
      pessoa_email: participe.pessoa_email,
      pessoa_telefone: participe.pessoa_telefone
    };

    addParticipe(empreendimentoParticipe);
  };

  const handleRemoveParticipe = async (participeId: string): Promise<void> => {
    removeParticipe(participeId);
  };

  const handleGeoUpload = (data: any[], fileName: string) => {
    setUploadedGeoFiles(prev => [...prev, fileName]);
    toast.success(`Arquivo ${fileName} carregado com sucesso! ${data.length} registros processados.`);
    setShowGeoUpload(false);
  };

  const handleRemoveGeoFile = (fileName: string) => {
    setUploadedGeoFiles(prev => prev.filter(f => f !== fileName));
    toast.info(`Arquivo ${fileName} removido.`);
  };

  const preencherDadosAutomaticamente = () => {
    // Dados de exemplo para preenchimento automático
    const dadosExemplo = {
      nome_empreendimento: 'Complexo Industrial Mineração ABC',
      situacao: 'Planejado' as SituacaoEmpreendimento,
      numero_empregados: 150,
      horario_funcionamento: '07:00 às 17:00',
      descricao: 'Empreendimento voltado para extração e beneficiamento de minérios, com capacidade de produção mensal de 10.000 toneladas. Inclui infraestrutura de apoio, áreas de processamento e escritórios administrativos.',
      prazo_implantacao: '24 meses',
      area_construida: '5000 m²',
      capacidade_producao: '10.000 ton/mês'
    };

    setFormData(dadosExemplo);

    // Adicionar participe de exemplo se não houver nenhum
    if (participes.length === 0) {
      const participeExemplo: EmpreendimentoParticipe = {
        id: `temp-${Date.now()}`,
        pessoa_id: 'exemplo-pessoa-id',
        pessoa_nome: 'Empresa Mineração ABC Ltda',
        pessoa_cpf_cnpj: '12.345.678/0001-90',
        pessoa_tipo: 'Jurídica',
        papel: 'Requerente',
        pessoa_email: 'contato@mineracaoabc.com.br',
        pessoa_telefone: '(11) 98765-4321'
      };
      addParticipe(participeExemplo);
    }

    toast.success('Dados preenchidos automaticamente! ✨');
  };

  const validateForm = (): boolean => {
    if (!formData.nome_empreendimento?.trim()) {
      toast.error('Nome do Empreendimento é obrigatório');
      return false;
    }

    if (!formData.situacao) {
      toast.error('Situação do Empreendimento é obrigatória');
      return false;
    }

    if (formData.numero_empregados < 0) {
      toast.error('Número de Empregados deve ser maior ou igual a zero');
      return false;
    }

    const hasRequerente = participes.some(p => p.papel === 'Requerente');
    if (!hasRequerente) {
      toast.error('É necessário adicionar pelo menos um Requerente');
      return false;
    }

    return true;
  };

  const handleSaveDraft = async () => {
    console.log('💾 [DADOS GERAIS] Salvando rascunho...');
    
    // Atualiza o store
    setDadosGerais(formData);
    
    // Importa as funções necessárias
    const { buildEnterpriseJSON, saveMockEnterprise } = await import('../../services/mockupService');
    const store = useEmpreendimentoStore.getState();
    
    // Monta JSON completo
    const completeStoreData = {
      property: store.property,
      basic_info: formData,
      participants: participes,
      activities: store.atividades,
      characterization: store.caracterizacao
    };
    
    const enterpriseJSON = buildEnterpriseJSON(completeStoreData);
    
    // Detecta se é edição ou criação
    const currentId = store.empreendimentoId;
    const isCreating = !currentId || String(currentId).startsWith('emp_');
    const existingId = isCreating ? null : currentId;
    
    // Salva
    const savedId = saveMockEnterprise(enterpriseJSON, true, existingId);
    
    toast.success(`Rascunho ${isCreating ? 'salvo' : 'atualizado'} com sucesso! ID: ${savedId}`);
    console.log('✅ [DADOS GERAIS] Rascunho salvo:', savedId);
  };

  const handleNext = () => {
    if (!validateForm()) {
      return;
    }

    setDadosGerais(formData);

    toast.success('Dados gerais salvos com sucesso!');
    onNext({ dadosGerais: formData, participes });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-bold text-gray-800">Dados Gerais do Empreendimento</h2>
          </div>
          <button
            onClick={preencherDadosAutomaticamente}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            title="Preencher dados de exemplo para teste"
          >
            <Wand2 className="w-4 h-4" />
            Preencher Dados
          </button>
        </div>
        <p className="text-gray-600 text-sm">
          Informe os dados básicos do empreendimento e os partícipes envolvidos
        </p>
      </div>

      <div className="space-y-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Identificação</h3>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Pessoa <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.tipo_pessoa}
                  onChange={(e) => handleChange('tipo_pessoa', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="juridica">Pessoa Jurídica</option>
                  <option value="fisica">Pessoa Física</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.tipo_pessoa === 'juridica' ? 'CNPJ' : 'CPF'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.cnpj_cpf}
                  onChange={(e) => handleChange('cnpj_cpf', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder={formData.tipo_pessoa === 'juridica' ? 'Ex: 12.345.678/0001-90' : 'Ex: 123.456.789-00'}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.tipo_pessoa === 'juridica' ? 'Razão Social' : 'Nome Completo'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.razao_social}
                  onChange={(e) => handleChange('razao_social', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder={formData.tipo_pessoa === 'juridica' ? 'Ex: Empresa ABC Ltda' : 'Ex: João Silva'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.tipo_pessoa === 'juridica' ? 'Nome Fantasia' : 'Nome Social'}
                </label>
                <input
                  type="text"
                  value={formData.nome_fantasia}
                  onChange={(e) => handleChange('nome_fantasia', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder={formData.tipo_pessoa === 'juridica' ? 'Ex: ABC Indústria' : ''}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Empreendimento <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nome_empreendimento}
                onChange={(e) => handleChange('nome_empreendimento', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: Complexo Industrial XYZ"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Situação <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.situacao}
                  onChange={(e) => handleChange('situacao', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Selecione...</option>
                  <option value="Planejado">Planejado</option>
                  <option value="Operando">Operando</option>
                  <option value="Instalado">Instalado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nº de Empregados
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.numero_empregados}
                  onChange={(e) => handleChange('numero_empregados', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: 50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horário de Funcionamento
              </label>
              <input
                type="text"
                value={formData.horario_funcionamento}
                onChange={(e) => handleChange('horario_funcionamento', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: 08:00 às 18:00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => handleChange('descricao', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Descreva o empreendimento..."
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Endereço e Contato</h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço Completo
              </label>
              <input
                type="text"
                value={formData.endereco}
                onChange={(e) => handleChange('endereco', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: Rua das Flores, 123"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  value={formData.cidade}
                  onChange={(e) => handleChange('cidade', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: Florianópolis"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <input
                  type="text"
                  value={formData.estado}
                  onChange={(e) => handleChange('estado', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: SC"
                  maxLength={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CEP
                </label>
                <input
                  type="text"
                  value={formData.cep}
                  onChange={(e) => handleChange('cep', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: 88000-000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="text"
                  value={formData.telefone}
                  onChange={(e) => handleChange('telefone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: (48) 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: contato@empresa.com.br"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Complementares</h3>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horário de Funcionamento
                </label>
                <input
                  type="text"
                  value={formData.horario_funcionamento}
                  onChange={(e) => handleChange('horario_funcionamento', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: 08:00 às 18:00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prazo de Implantação
                </label>
                <input
                  type="text"
                  value={formData.prazo_implantacao}
                  onChange={(e) => handleChange('prazo_implantacao', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: 24 meses"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Área Construída
                </label>
                <input
                  type="text"
                  value={formData.area_construida}
                  onChange={(e) => handleChange('area_construida', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: 5000.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacidade de Produção
              </label>
              <input
                type="text"
                value={formData.capacidade_producao}
                onChange={(e) => handleChange('capacidade_producao', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: 1000 ton/mês"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Dados Georreferenciados</h3>
            <button
              onClick={() => setShowGeoFrontIframe(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Ver no Mapa
            </button>
          </div>

          {/* Área de arquivos - oculta por enquanto */}
          <div className="hidden">
            {uploadedGeoFiles.length > 0 ? (
              <div className="space-y-2">
                {uploadedGeoFiles.map((fileName, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">{fileName}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveGeoFile(fileName)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">
                  Nenhum arquivo georreferenciado carregado
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Clique no botão acima para fazer upload de arquivos CSV, JSON, GeoJSON ou KML
                </p>
              </div>
            )}
          </div>
        </div>

        {/* GeoFront Iframe */}
        {showGeoFrontIframe && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">GeoFront - Editor de Mapas</h3>
              <button
                onClick={() => setShowGeoFrontIframe(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Fechar
              </button>
            </div>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <iframe 
                src="https://geofront-frontend.onrender.com/index-refactored-ro.html?processo=PROC-2024-002&context=empreendimento"
                width="100%" 
                height="800px" 
                style={{ border: 'none' }}
                title="GeoFront Editor"
              />
            </div>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <ParticipesManager
            participes={participes}
            onAdd={handleAddParticipe}
            onRemove={handleRemoveParticipe}
          />
        </div>
      </div>

      <GeoUpload
        isOpen={showGeoUpload}
        onClose={() => setShowGeoUpload(false)}
        onUpload={handleGeoUpload}
      />

      <div className="flex justify-between pt-6 mt-6 border-t border-gray-200">
        <button
          onClick={onPrevious}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        
        <div className="flex gap-3">
          <button
            onClick={handleSaveDraft}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Salvar Rascunho
          </button>
          
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            Próximo
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
