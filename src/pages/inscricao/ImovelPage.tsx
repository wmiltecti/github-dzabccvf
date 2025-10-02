import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInscricaoStore } from '../../lib/store/inscricao';
import { createProperty, createAddress } from '../../lib/api/property';
import { Home, MapPin, ArrowLeft, ArrowRight, Plus, Trash2, AlertTriangle, Zap } from 'lucide-react';
import { X } from 'lucide-react';
import type { Property, Address, PropertyTitle } from '../../types/inscription';

export default function ImovelPage() {
  const navigate = useNavigate();
  const { 
    property, 
    setProperty, 
    setPropertyId,
    titles,
    addTitle,
    removeTitle,
    isStepComplete,
    canProceedToStep
  } = useInscricaoStore();
  
  const [loading, setLoading] = useState(false);
  const [showTitleForm, setShowTitleForm] = useState(false);
  const [newTitle, setNewTitle] = useState<PropertyTitle>({});

  const [propertyData, setPropertyData] = useState<Property>(property || {
    kind: 'URBANO',
    municipio_sede: '',
    roteiro_acesso: '',
    utm_lat: '',
    utm_long: '',
    utm_zona: '',
    dms_lat: '',
    dms_long: '',
    car_codigo: '',
    address: {
      cep: '',
      logradouro: '',
      numero: '',
      bairro: '',
      complemento: '',
      ponto_referencia: '',
      uf: '',
      municipio: ''
    }
  });

  // Mock data for testing
  const mockPropertyData = {
    kind: 'RURAL',
    municipio_sede: 'Campinas',
    roteiro_acesso: 'Rodovia Dom Pedro I, km 143, seguir pela estrada rural por 2km até a porteira azul. Propriedade fica à direita.',
    utm_lat: '7456789.50',
    utm_long: '345678.25',
    utm_zona: '23K',
    dms_lat: '22°54\'32.5"S',
    dms_long: '47°03\'38.2"W',
    car_codigo: 'SP-3201234-A1B2C3D4E5F6789012345678901234',
    address: {
      cep: '13087-534',
      logradouro: 'Estrada Municipal João Batista',
      numero: '1250',
      bairro: 'Zona Rural',
      complemento: 'Fazenda Santa Maria',
      ponto_referencia: 'Próximo ao posto de gasolina Shell',
      uf: 'SP',
      municipio: 'Campinas'
    }
  };

  const mockTitleData = {
    tipo_cartorio: 'Registro de Imóveis',
    nome_cartorio: '1º Cartório de Registro de Imóveis de Campinas',
    comarca: 'Campinas',
    uf: 'SP',
    matricula: '45.678',
    livro: '2-A',
    folha: '123',
    area_total_ha: 25.5
  };

  const fillMockData = () => {
    setPropertyData(mockPropertyData);
    // Also add a mock title
    if (titles.length === 0) {
      addTitle(mockTitleData);
    }
  };
  const handlePropertyChange = (field: string, value: any) => {
    setPropertyData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setPropertyData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
  };

  const handleSaveProperty = async () => {
    setLoading(true);
    try {
      // Validate coordinates
      const hasUTM = propertyData.utm_lat && propertyData.utm_long;
      const hasDMS = propertyData.dms_lat && propertyData.dms_long;
      
      if (!hasUTM && !hasDMS) {
        throw new Error('Informe ao menos um par de coordenadas (UTM ou DMS)');
      }

      if (propertyData.kind === 'RURAL' && !propertyData.car_codigo) {
        throw new Error('Imóvel rural exige código do CAR');
      }

      // Create property
      const { data: propertyResult, error: propertyError } = await createProperty(propertyData);
      
      if (propertyError) {
        throw new Error(propertyError.message);
      }

      if (propertyResult) {
        setProperty(propertyData);
        setPropertyId(propertyResult.id);
        alert('Imóvel salvo com sucesso!');
      }
    } catch (error) {
      console.error('Error saving property:', error);
      alert('Erro ao salvar imóvel: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTitle = () => {
    if (!newTitle.matricula) {
      alert('Matrícula é obrigatória');
      return;
    }
    
    addTitle(newTitle);
    setNewTitle({});
    setShowTitleForm(false);
  };

  const handleNext = () => {
    if (canProceedToStep(3)) {
      navigate('/inscricao/empreendimento');
    }
  };

  const handleBack = () => {
    navigate('/inscricao/participantes');
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dados do Imóvel</h2>
        <p className="text-gray-600">
          Informe a localização e características do imóvel onde será desenvolvido o empreendimento.
        </p>
        </div>
        <button
          type="button"
          onClick={fillMockData}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          title="Preencher com dados de exemplo"
        >
          <Zap className="w-5 h-5" />
          Dados de Exemplo
        </button>
      </div>

      <div className="space-y-8">
        {/* Property Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tipo de Imóvel *
          </label>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: 'URBANO', label: 'Urbano', description: 'Imóvel em área urbana' },
              { value: 'RURAL', label: 'Rural', description: 'Imóvel em área rural' },
              { value: 'LINEAR', label: 'Linear', description: 'Empreendimento linear (rodovia, ferrovia, etc.)' }
            ].map((option) => (
              <label
                key={option.value}
                className={`flex flex-col p-4 border rounded-lg cursor-pointer transition-colors ${
                  propertyData.kind === option.value
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name="propertyKind"
                  value={option.value}
                  checked={propertyData.kind === option.value}
                  onChange={(e) => handlePropertyChange('kind', e.target.value)}
                  className="sr-only"
                />
                <span className="font-medium text-gray-900">{option.label}</span>
                <span className="text-sm text-gray-500 mt-1">{option.description}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Address */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Endereço
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CEP</label>
              <input
                type="text"
                value={propertyData.address?.cep || ''}
                onChange={(e) => handleAddressChange('cep', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="00000-000"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Logradouro</label>
              <input
                type="text"
                value={propertyData.address?.logradouro || ''}
                onChange={(e) => handleAddressChange('logradouro', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Rua, Avenida, etc."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
              <input
                type="text"
                value={propertyData.address?.numero || ''}
                onChange={(e) => handleAddressChange('numero', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="123"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bairro</label>
              <input
                type="text"
                value={propertyData.address?.bairro || ''}
                onChange={(e) => handleAddressChange('bairro', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Nome do bairro"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">UF *</label>
              <select
                value={propertyData.address?.uf || ''}
                onChange={(e) => handleAddressChange('uf', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="">Selecione...</option>
                <option value="AC">AC</option>
                <option value="AL">AL</option>
                <option value="AP">AP</option>
                <option value="AM">AM</option>
                <option value="BA">BA</option>
                <option value="CE">CE</option>
                <option value="DF">DF</option>
                <option value="ES">ES</option>
                <option value="GO">GO</option>
                <option value="MA">MA</option>
                <option value="MT">MT</option>
                <option value="MS">MS</option>
                <option value="MG">MG</option>
                <option value="PA">PA</option>
                <option value="PB">PB</option>
                <option value="PR">PR</option>
                <option value="PE">PE</option>
                <option value="PI">PI</option>
                <option value="RJ">RJ</option>
                <option value="RN">RN</option>
                <option value="RS">RS</option>
                <option value="RO">RO</option>
                <option value="RR">RR</option>
                <option value="SC">SC</option>
                <option value="SP">SP</option>
                <option value="SE">SE</option>
                <option value="TO">TO</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Município *</label>
              <input
                type="text"
                value={propertyData.address?.municipio || ''}
                onChange={(e) => handleAddressChange('municipio', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Nome do município"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Complemento</label>
              <input
                type="text"
                value={propertyData.address?.complemento || ''}
                onChange={(e) => handleAddressChange('complemento', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Apto, sala, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ponto de Referência</label>
              <input
                type="text"
                value={propertyData.address?.ponto_referencia || ''}
                onChange={(e) => handleAddressChange('ponto_referencia', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Próximo a..."
              />
            </div>
          </div>
        </div>

        {/* Coordinates */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Coordenadas Geográficas *</h3>
          <p className="text-sm text-gray-600">Informe pelo menos um sistema de coordenadas (UTM ou DMS)</p>
          
          {/* UTM Coordinates */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-3">Coordenadas UTM</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Latitude UTM</label>
                <input
                  type="text"
                  value={propertyData.utm_lat || ''}
                  onChange={(e) => handlePropertyChange('utm_lat', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 7456789"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Longitude UTM</label>
                <input
                  type="text"
                  value={propertyData.utm_long || ''}
                  onChange={(e) => handlePropertyChange('utm_long', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 345678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Zona UTM</label>
                <input
                  type="text"
                  value={propertyData.utm_zona || ''}
                  onChange={(e) => handlePropertyChange('utm_zona', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 23K"
                />
              </div>
            </div>
          </div>

          {/* DMS Coordinates */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-3">Coordenadas DMS (Graus, Minutos, Segundos)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Latitude DMS</label>
                <input
                  type="text"
                  value={propertyData.dms_lat || ''}
                  onChange={(e) => handlePropertyChange('dms_lat', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Ex: 23°32'15''S"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Longitude DMS</label>
                <input
                  type="text"
                  value={propertyData.dms_long || ''}
                  onChange={(e) => handlePropertyChange('dms_long', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Ex: 46°38'10''W"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Rural specific fields */}
        {propertyData.kind === 'RURAL' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código CAR *
            </label>
            <input
              type="text"
              value={propertyData.car_codigo || ''}
              onChange={(e) => handlePropertyChange('car_codigo', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Código do Cadastro Ambiental Rural"
              required
            />
          </div>
        )}

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Município Sede
            </label>
            <input
              type="text"
              value={propertyData.municipio_sede || ''}
              onChange={(e) => handlePropertyChange('municipio_sede', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Município sede do empreendimento"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Roteiro de Acesso
            </label>
            <textarea
              value={propertyData.roteiro_acesso || ''}
              onChange={(e) => handlePropertyChange('roteiro_acesso', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              rows={3}
              placeholder="Descreva como chegar ao local"
            />
          </div>
        </div>

        {/* Property Titles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Títulos de Propriedade</h3>
            <button
              onClick={() => setShowTitleForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Título
            </button>
          </div>

          {titles.length > 0 ? (
            <div className="space-y-3">
              {titles.map((title, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Matrícula: {title.matricula}
                      </p>
                      <p className="text-sm text-gray-600">
                        {title.nome_cartorio} - {title.comarca}/{title.uf}
                      </p>
                      {title.area_total_ha && (
                        <p className="text-sm text-gray-500">
                          Área: {title.area_total_ha} hectares
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeTitle(index)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum título de propriedade adicionado</p>
              <p className="text-sm text-gray-400 mt-1">Adicione pelo menos um título para continuar</p>
            </div>
          )}
        </div>

        {/* Save Property Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSaveProperty}
            disabled={loading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Home className="w-4 h-4" />
            )}
            {loading ? 'Salvando...' : 'Salvar Imóvel'}
          </button>
        </div>

        {/* Validation Messages */}
        {propertyData.kind === 'RURAL' && !propertyData.car_codigo && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900">CAR obrigatório</h4>
                <p className="text-sm text-yellow-800 mt-1">
                  Imóveis rurais devem informar o código do Cadastro Ambiental Rural (CAR).
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={handleBack}
          className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar: Participantes
        </button>
        
        <button
          onClick={handleNext}
          disabled={!isStepComplete(2)}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          Próximo: Empreendimento
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Title Form Modal */}
      {showTitleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Adicionar Título de Propriedade</h3>
              <button
                onClick={() => setShowTitleForm(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Cartório
                  </label>
                  <select
                    value={newTitle.tipo_cartorio || ''}
                    onChange={(e) => setNewTitle(prev => ({ ...prev, tipo_cartorio: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Selecione...</option>
                    <option value="Registro de Imóveis">Registro de Imóveis</option>
                    <option value="Cartório de Títulos">Cartório de Títulos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Cartório
                  </label>
                  <input
                    type="text"
                    value={newTitle.nome_cartorio || ''}
                    onChange={(e) => setNewTitle(prev => ({ ...prev, nome_cartorio: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Nome do cartório"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comarca
                  </label>
                  <input
                    type="text"
                    value={newTitle.comarca || ''}
                    onChange={(e) => setNewTitle(prev => ({ ...prev, comarca: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Comarca"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    UF
                  </label>
                  <select
                    value={newTitle.uf || ''}
                    onChange={(e) => setNewTitle(prev => ({ ...prev, uf: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Selecione...</option>
                    <option value="SP">SP</option>
                    <option value="RJ">RJ</option>
                    <option value="MG">MG</option>
                    {/* Add other states as needed */}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Matrícula *
                  </label>
                  <input
                    type="text"
                    value={newTitle.matricula || ''}
                    onChange={(e) => setNewTitle(prev => ({ ...prev, matricula: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Número da matrícula"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Livro
                  </label>
                  <input
                    type="text"
                    value={newTitle.livro || ''}
                    onChange={(e) => setNewTitle(prev => ({ ...prev, livro: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Livro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Folha
                  </label>
                  <input
                    type="text"
                    value={newTitle.folha || ''}
                    onChange={(e) => setNewTitle(prev => ({ ...prev, folha: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Folha"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Área Total (hectares)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newTitle.area_total_ha || ''}
                  onChange={(e) => setNewTitle(prev => ({ ...prev, area_total_ha: parseFloat(e.target.value) }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="0.00"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowTitleForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddTitle}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Adicionar Título
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}