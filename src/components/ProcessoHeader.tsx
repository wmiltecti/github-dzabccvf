import { FileText } from 'lucide-react';

interface ProcessoHeaderProps {
  protocoloInterno?: string;
  numeroProcessoExterno?: string | null;
}

export default function ProcessoHeader({ protocoloInterno, numeroProcessoExterno }: ProcessoHeaderProps) {
  if (!protocoloInterno) return null;

  return (
    <div className="bg-blue-900 text-white px-6 py-4 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        <FileText className="w-6 h-6 flex-shrink-0" />
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium opacity-90">Protocolo:</span>
            <span className="text-lg font-bold">{protocoloInterno}</span>
          </div>
          {numeroProcessoExterno && (
            <>
              <div className="hidden sm:block w-px h-6 bg-white/30" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium opacity-90">Processo Externo:</span>
                <span className="text-base font-semibold">{numeroProcessoExterno}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
