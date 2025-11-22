import React from 'react';
import { X, Plus, Home } from 'lucide-react';

interface NewPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  propertyType: 'RURAL' | 'URBANO' | 'LINEAR' | '';
  onPropertyTypeChange: (type: 'RURAL' | 'URBANO' | 'LINEAR' | '') => void;
  ruralData: {
    nome: string;
    car_codigo: string;
    car_situacao: string;
    municipio: string;
    uf: string;
    area_total: string;
    sistema_referencia: string;
    coordenadas_utm_lat: string;
    coordenadas_utm_long: string;
  };
  urbanoData: {
    nome: string;
    cep: string;
    logradouro: string;
    numero: string;
    bairro: string;
    complemento: string;
    municipio: string;
    uf: string;
    matricula: string;
    area_total: string;
    sistema_referencia: string;
    coordenadas_utm_lat: string;
    coordenadas_utm_long: string;
  };
  linearData: {
    nome: string;
    municipio_inicio: string;
    uf_inicio: string;
    municipio_final: string;
    uf_final: string;
    extensao_km: string;
    sistema_referencia: string;
  };
  onRuralChange: (field: string, value: string) => void;
  onUrbanoChange: (field: string, value: string) => void;
  onLinearChange: (field: string, value: string) => void;
}

const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function NewPropertyModal({
  isOpen,
  onClose,
  onSave,
  propertyType,
  onPropertyTypeChange,
  ruralData,
  urbanoData,
  linearData,
  onRuralChange,
  onUrbanoChange,
  onLinearChange
}: NewPropertyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-green-600" />
            Cadastrar Novo Imóvel
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Seleção de Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Imóvel <span className="text-red-500">*</span>
              </label>
              <select
                value={propertyType}
                onChange={(e) => onPropertyTypeChange(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">Selecione o tipo...</option>
                <option value="RURAL">🌾 Rural (com CAR)</option>
                <option value="URBANO">🏙️ Urbano</option>
                <option value="LINEAR">🛣️ Linear (rodovia, ferrovia, gasoduto, etc)</option>
              </select>
            </div>

            {/* Formulário RURAL */}
            {propertyType === 'RURAL' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Imóvel <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={ruralData.nome}
                      onChange={(e) => onRuralChange('nome', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Ex: Fazenda Santa Maria"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código CAR <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={ruralData.car_codigo}
                      onChange={(e) => onRuralChange('car_codigo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-mono text-sm"
                      placeholder="XX-XXXXXXX-XXXXXXXX..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Situação CAR
                    </label>
                    <select
                      value={ruralData.car_situacao}
                      onChange={(e) => onRuralChange('car_situacao', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Pendente">Pendente</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Área Total (ha) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={ruralData.area_total}
                      onChange={(e) => onRuralChange('area_total', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Município <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={ruralData.municipio}
                      onChange={(e) => onRuralChange('municipio', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Nome do município"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UF <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={ruralData.uf}
                      onChange={(e) => onRuralChange('uf', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Selecione...</option>
                      {UFS.map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sistema de Referência
                    </label>
                    <select
                      value={ruralData.sistema_referencia}
                      onChange={(e) => onRuralChange('sistema_referencia', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="SIRGAS 2000">SIRGAS 2000</option>
                      <option value="WGS 84">WGS 84</option>
                      <option value="SAD 69">SAD 69</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Coordenadas UTM (opcional)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={ruralData.coordenadas_utm_lat}
                        onChange={(e) => onRuralChange('coordenadas_utm_lat', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Latitude"
                      />
                      <input
                        type="text"
                        value={ruralData.coordenadas_utm_long}
                        onChange={(e) => onRuralChange('coordenadas_utm_long', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Longitude"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Formulário URBANO */}
            {propertyType === 'URBANO' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Imóvel <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={urbanoData.nome}
                      onChange={(e) => onUrbanoChange('nome', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Ex: Terreno Comercial Centro"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CEP
                    </label>
                    <input
                      type="text"
                      value={urbanoData.cep}
                      onChange={(e) => onUrbanoChange('cep', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="00000-000"
                      maxLength={9}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Matrícula
                    </label>
                    <input
                      type="text"
                      value={urbanoData.matricula}
                      onChange={(e) => onUrbanoChange('matricula', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Número da matrícula"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Logradouro <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={urbanoData.logradouro}
                      onChange={(e) => onUrbanoChange('logradouro', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Rua, Avenida, etc"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número
                    </label>
                    <input
                      type="text"
                      value={urbanoData.numero}
                      onChange={(e) => onUrbanoChange('numero', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bairro
                    </label>
                    <input
                      type="text"
                      value={urbanoData.bairro}
                      onChange={(e) => onUrbanoChange('bairro', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Nome do bairro"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Complemento
                    </label>
                    <input
                      type="text"
                      value={urbanoData.complemento}
                      onChange={(e) => onUrbanoChange('complemento', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Apt, Bloco, Sala, etc"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Município <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={urbanoData.municipio}
                      onChange={(e) => onUrbanoChange('municipio', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Nome do município"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UF <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={urbanoData.uf}
                      onChange={(e) => onUrbanoChange('uf', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Selecione...</option>
                      {UFS.map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Área Total (m²)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={urbanoData.area_total}
                      onChange={(e) => onUrbanoChange('area_total', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Formulário LINEAR */}
            {propertyType === 'LINEAR' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Empreendimento <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={linearData.nome}
                      onChange={(e) => onLinearChange('nome', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Ex: Rodovia BR-364, Trecho X"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <h4 className="font-medium text-gray-900 mb-2">📍 Ponto de Início</h4>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Município Início <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={linearData.municipio_inicio}
                      onChange={(e) => onLinearChange('municipio_inicio', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Município de origem"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UF Início <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={linearData.uf_inicio}
                      onChange={(e) => onLinearChange('uf_inicio', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Selecione...</option>
                      {UFS.map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <h4 className="font-medium text-gray-900 mb-2">🏁 Ponto Final</h4>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Município Final <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={linearData.municipio_final}
                      onChange={(e) => onLinearChange('municipio_final', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Município de destino"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UF Final <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={linearData.uf_final}
                      onChange={(e) => onLinearChange('uf_final', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Selecione...</option>
                      {UFS.map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Extensão (km)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={linearData.extensao_km}
                      onChange={(e) => onLinearChange('extensao_km', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sistema de Referência
                    </label>
                    <select
                      value={linearData.sistema_referencia}
                      onChange={(e) => onLinearChange('sistema_referencia', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="SIRGAS 2000">SIRGAS 2000</option>
                      <option value="WGS 84">WGS 84</option>
                      <option value="SAD 69">SAD 69</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Mensagem se nenhum tipo selecionado */}
            {!propertyType && (
              <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                <Home className="w-16 h-16 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Selecione o tipo de imóvel acima para começar</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={!propertyType}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Imóvel
          </button>
        </div>
      </div>
    </div>
  );
}
