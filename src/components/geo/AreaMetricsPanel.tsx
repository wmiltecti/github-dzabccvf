import { X, BarChart3, Ruler, Calculator } from 'lucide-react';
import type { LayerMetrics } from '../../lib/geo/bufferCalculations';

interface AreaMetricsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: LayerMetrics | null;
  layerName?: string;
}

export default function AreaMetricsPanel({
  isOpen,
  onClose,
  metrics,
  layerName = 'Camada'
}: AreaMetricsPanelProps) {
  if (!isOpen || !metrics) return null;

  const formatNumber = (num: number, decimals: number = 2): string => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Métricas de Área e Perímetro</h3>
              <p className="text-sm text-gray-600">{layerName}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700">Área Total</span>
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {formatNumber(metrics.totalAreaHa)} ha
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {formatNumber(metrics.totalAreaM2, 0)} m²
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-4 border border-cyan-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-cyan-700">Perímetro Total</span>
                <Ruler className="w-5 h-5 text-cyan-600" />
              </div>
              <div className="text-2xl font-bold text-cyan-900">
                {formatNumber(metrics.totalPerimetroKm)} km
              </div>
              <div className="text-xs text-cyan-600 mt-1">
                {formatNumber(metrics.totalPerimetroKm * 1000, 0)} metros
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-700">Total de Features</span>
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-900">
                {metrics.features.length}
              </div>
              <div className="text-xs text-green-600 mt-1">
                {formatNumber(metrics.totalAreaHa / metrics.features.length)} ha/feature
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-gray-100">
              <h4 className="text-sm font-semibold text-gray-900">Detalhamento por Feature</h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Área (ha)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Área (m²)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Perímetro (km)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                      % do Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {metrics.features.map((feature, index) => {
                    const percentual = (feature.areaHa / metrics.totalAreaHa) * 100;
                    return (
                      <tr key={feature.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {feature.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                          {formatNumber(feature.areaHa)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">
                          {formatNumber(feature.areaM2, 0)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">
                          {formatNumber(feature.perimetroKm)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 transition-all"
                                style={{ width: `${Math.min(percentual, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">{formatNumber(percentual, 1)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                  <tr className="font-bold">
                    <td colSpan={2} className="px-4 py-3 text-sm text-gray-900">
                      TOTAL
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {formatNumber(metrics.totalAreaHa)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {formatNumber(metrics.totalAreaM2, 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {formatNumber(metrics.totalPerimetroKm)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      100%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Informações sobre os cálculos:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Áreas calculadas usando projeção WGS84 (EPSG:4326)</li>
                  <li>1 hectare (ha) = 10.000 m²</li>
                  <li>Perímetros calculados seguindo os contornos das geometrias</li>
                  <li>Valores arredondados para 2 casas decimais</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
