import { useState, useEffect } from 'react';
import { X, Layers, Circle } from 'lucide-react';

interface GeoLayer {
  id: string;
  name: string;
  featureCount: number;
  visible: boolean;
}

interface BufferZoneSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  layers: GeoLayer[];
  onConfirm: (baseLayerId: string, referenceLayerId: string) => void;
}

export default function BufferZoneSelector({
  isOpen,
  onClose,
  layers,
  onConfirm
}: BufferZoneSelectorProps) {
  const [selectedBaseLayer, setSelectedBaseLayer] = useState<string>('');
  const [selectedReferenceLayer, setSelectedReferenceLayer] = useState<string>('');

  useEffect(() => {
    if (isOpen && layers.length > 0) {
      const visibleLayers = layers.filter(l => l.visible);
      if (visibleLayers.length >= 1) {
        setSelectedBaseLayer(visibleLayers[0].id);
      }
      if (visibleLayers.length >= 2) {
        setSelectedReferenceLayer(visibleLayers[1].id);
      }
    }
  }, [isOpen, layers]);

  const handleConfirm = () => {
    if (!selectedBaseLayer) {
      alert('Por favor, selecione a camada base');
      return;
    }
    if (!selectedReferenceLayer) {
      alert('Por favor, selecione a camada de referência');
      return;
    }
    if (selectedBaseLayer === selectedReferenceLayer) {
      alert('As camadas base e de referência devem ser diferentes');
      return;
    }
    onConfirm(selectedBaseLayer, selectedReferenceLayer);
  };

  if (!isOpen) return null;

  const visibleLayers = layers.filter(l => l.visible);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <Circle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Zona de Amortecimento</h3>
              <p className="text-sm text-gray-600">Selecione as camadas para cálculo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {visibleLayers.length < 2 ? (
            <div className="text-center py-12">
              <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Camadas Insuficientes</h4>
              <p className="text-gray-600 mb-4">
                É necessário ter pelo menos 2 camadas visíveis para calcular a zona de amortecimento.
              </p>
              <p className="text-sm text-gray-500">
                Carregue e torne visíveis pelo menos 2 camadas georreferenciadas.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">i</span>
                  </div>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Como funciona:</p>
                    <ol className="list-decimal list-inside space-y-1 text-blue-700">
                      <li>Selecione a <strong>camada base</strong> onde será aplicado o buffer (zona de amortecimento)</li>
                      <li>Selecione a <strong>camada de referência</strong> que será usada para subtração geométrica</li>
                      <li>O sistema calculará o buffer e subtrairá as áreas de sobreposição</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Circle className="w-4 h-4 text-green-600" />
                      <span>1. Camada Base (para aplicar buffer)</span>
                    </div>
                  </label>
                  <select
                    value={selectedBaseLayer}
                    onChange={(e) => setSelectedBaseLayer(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  >
                    <option value="">Selecione uma camada...</option>
                    {visibleLayers.map((layer) => (
                      <option key={layer.id} value={layer.id}>
                        {layer.name} ({layer.featureCount} feature{layer.featureCount !== 1 ? 's' : ''})
                      </option>
                    ))}
                  </select>
                  {selectedBaseLayer && (
                    <p className="mt-2 text-xs text-gray-500">
                      Buffer será aplicado nas geometrias desta camada
                    </p>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-blue-600" />
                      <span>2. Camada de Referência (para subtração)</span>
                    </div>
                  </label>
                  <select
                    value={selectedReferenceLayer}
                    onChange={(e) => setSelectedReferenceLayer(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="">Selecione uma camada...</option>
                    {visibleLayers
                      .filter(layer => layer.id !== selectedBaseLayer)
                      .map((layer) => (
                        <option key={layer.id} value={layer.id}>
                          {layer.name} ({layer.featureCount} feature{layer.featureCount !== 1 ? 's' : ''})
                        </option>
                      ))}
                  </select>
                  {selectedReferenceLayer && (
                    <p className="mt-2 text-xs text-gray-500">
                      Áreas desta camada serão subtraídas do buffer
                    </p>
                  )}
                </div>
              </div>

              {selectedBaseLayer && selectedReferenceLayer && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-green-900 mb-2">Resumo da Operação:</h4>
                  <div className="space-y-2 text-sm text-green-800">
                    <div className="flex items-start space-x-2">
                      <span className="text-green-600 mt-0.5">→</span>
                      <span>
                        <strong>Base:</strong> {visibleLayers.find(l => l.id === selectedBaseLayer)?.name}
                      </span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-green-600 mt-0.5">→</span>
                      <span>
                        <strong>Referência:</strong> {visibleLayers.find(l => l.id === selectedReferenceLayer)?.name}
                      </span>
                    </div>
                    <div className="flex items-start space-x-2 mt-3 pt-3 border-t border-green-300">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Pronto para calcular zona de amortecimento</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedBaseLayer || !selectedReferenceLayer || visibleLayers.length < 2}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
          >
            <Circle className="w-4 h-4" />
            <span>Calcular Zona de Amortecimento</span>
          </button>
        </div>
      </div>
    </div>
  );
}
