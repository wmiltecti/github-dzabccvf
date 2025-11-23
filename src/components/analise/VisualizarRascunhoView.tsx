import React from 'react';
import { ArrowLeft, Download, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

interface ProcessoMock {
  requerente: string;
  endereco: string;
  municipio: string;
  atividadePrimaria: string;
  atividadesSecundarias: string[];
  areaTotal: string;
}

interface VisualizarRascunhoViewProps {
  numeroProcesso: string;
  onVoltar: () => void;
}

const processoMockData: ProcessoMock = {
  requerente: 'Curtume Industrial São João Ltda',
  endereco: 'Rua das Indústrias, 1250, Bairro Industrial',
  municipio: 'Porto Velho - RO',
  atividadePrimaria: 'Curtimento de Couros e Peles',
  atividadesSecundarias: ['Tratamento de Efluentes Industriais', 'Estação de Tratamento de Águas'],
  areaTotal: '25.000 m²'
};

export default function VisualizarRascunhoView({ numeroProcesso, onVoltar }: VisualizarRascunhoViewProps) {
  const tipoLicenca = numeroProcesso.startsWith('LP') ? 'LP' :
                      numeroProcesso.startsWith('LI') ? 'LI' : 'LO';

  const handleBaixarPDF = () => {
    toast.info('Funcionalidade de download em desenvolvimento');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={onVoltar}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para análise
        </button>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Este é apenas um rascunho de visualização</p>
              <p>Para emitir a licença oficialmente, acesse: <strong>Assinatura Digital → Assinar Digitalmente</strong></p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-xl font-semibold text-gray-900">Visualização do Rascunho</h3>
            <button
              onClick={handleBaixarPDF}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Baixar PDF
            </button>
          </div>

          <div className="p-8 relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
              <span className="text-8xl font-bold text-gray-500 rotate-[-45deg]">RASCUNHO</span>
            </div>

            <div className="relative z-10 space-y-6">
              <div className="text-center border-b border-gray-300 pb-6">
                <p className="text-sm font-semibold text-gray-900 leading-relaxed">
                  GOVERNO DO ESTADO DE RONDÔNIA<br />
                  SECRETÁRIA DO ESTADO DE DESENVOLVIMENTO AMBIENTAL<br />
                  COORDENADORIA DE LICENCIAMENTO E MONITORAMENTO AMBIENTAL
                </p>
              </div>

              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {tipoLicenca === 'LO' ? 'LICENÇA DE OPERAÇÃO' :
                   tipoLicenca === 'LP' ? 'LICENÇA PRÉVIA' :
                   tipoLicenca === 'LI' ? 'LICENÇA DE INSTALAÇÃO' : 'LICENÇA'} Nº {numeroProcesso}
                </h2>
                <p className="text-sm text-gray-600">
                  Data de Emissão: {new Date().toLocaleDateString('pt-BR')}
                </p>
                <p className="text-sm text-gray-600">
                  Validade: {new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toLocaleDateString('pt-BR')}
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 leading-relaxed text-justify">
                  A Secretaria do Estado de Desenvolvimento Ambiental (SEDAM), no uso das suas atribuições
                  que lhe são conferidas pela Lei Estadual n° 3.686 de 08 de Dezembro de 2015, expede a
                  presente <strong>{tipoLicenca === 'LO' ? 'Licença de Operação' :
                   tipoLicenca === 'LP' ? 'Licença Prévia' :
                   tipoLicenca === 'LI' ? 'Licença de Instalação' : 'Licença'}</strong>.
                </p>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-semibold text-gray-500">REQUERENTE:</span>
                    <p className="text-sm text-gray-900">{processoMockData.requerente}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-500">MUNICÍPIO:</span>
                    <p className="text-sm text-gray-900">{processoMockData.municipio}</p>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-gray-500">ENDEREÇO DO IMÓVEL:</span>
                  <p className="text-sm text-gray-900">{processoMockData.endereco}</p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-gray-500">ATIVIDADE PRIMÁRIA:</span>
                  <p className="text-sm text-gray-900">{processoMockData.atividadePrimaria}</p>
                </div>

                {processoMockData.atividadesSecundarias.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-gray-500">ATIVIDADES SECUNDÁRIAS:</span>
                    <ul className="text-sm text-gray-900 list-disc list-inside">
                      {processoMockData.atividadesSecundarias.map((ativ, idx) => (
                        <li key={idx}>{ativ}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <span className="text-xs font-semibold text-gray-500">ÁREA TOTAL DO EMPREENDIMENTO:</span>
                  <p className="text-sm text-gray-900">{processoMockData.areaTotal}</p>
                </div>
              </div>

              <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                <h4 className="text-sm font-bold text-gray-900 mb-3">CONDICIONANTES:</h4>
                <ul className="space-y-2">
                  <li className="text-sm text-gray-700">
                    1. O empreendimento deverá manter sistema de tratamento de efluentes em perfeito funcionamento.
                  </li>
                  <li className="text-sm text-gray-700">
                    2. Realizar monitoramento trimestral da qualidade das águas residuárias.
                  </li>
                  <li className="text-sm text-gray-700">
                    3. Implementar programa de gerenciamento de resíduos sólidos conforme PNRS.
                  </li>
                </ul>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-xs text-blue-800">
                    <strong>Nota:</strong> As condicionantes específicas deste processo devem ser cadastradas em:
                    Opções → Condicionantes
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-300 pt-6 mt-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="border-t border-gray-400 pt-2 mt-16">
                      <p className="text-xs text-gray-600">Coordenador</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="border-t border-gray-400 pt-2 mt-16">
                      <p className="text-xs text-gray-600">Secretário</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center text-xs text-gray-500 mt-6">
                <p>Código de Validação: ABC123XYZ789</p>
                <p className="mt-2">QR Code: [QR CODE PLACEHOLDER]</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
