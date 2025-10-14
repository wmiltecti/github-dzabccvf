import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface CalculationProgressProps {
  isCalculating: boolean;
  currentStep: string;
  progress: number;
  error?: string;
  success?: boolean;
}

export default function CalculationProgress({
  isCalculating,
  currentStep,
  progress,
  error,
  success
}: CalculationProgressProps) {
  if (!isCalculating && !error && !success) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[1000] animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden max-w-md">
        {error ? (
          <div className="p-4 flex items-start space-x-3 bg-red-50">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 mb-1">Erro no Cálculo</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        ) : success ? (
          <div className="p-4 flex items-start space-x-3 bg-green-50">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-green-900 mb-1">Cálculo Concluído!</h4>
              <p className="text-sm text-green-700">A zona de amortecimento foi calculada com sucesso.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 flex items-start space-x-3">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Calculando Zona de Amortecimento</h4>
                <p className="text-sm text-gray-600 mb-3">{currentStep}</p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Progresso</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
