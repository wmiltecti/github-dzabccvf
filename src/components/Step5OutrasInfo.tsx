import React from 'react';
import { Info, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface Step5OutrasInfoProps {
  data: any;
  onChange: (data: any) => void;
}

interface Pergunta {
  id: string;
  texto: string;
  categoria?: string;
}

const perguntas: Pergunta[] = [
  {
    id: 'usaRecursosNaturais',
    texto: 'Há previsão de supressão de vegetação nativa na área do empreendimento?',
    categoria: 'Recursos Naturais'
  },
  {
    id: 'geraEfluentesLiquidos',
    texto: 'Há previsão de impacto ambiental (direto ou indireto) à grupos quilombolas, nos temos da legislação vigente?',
    categoria: 'Efluentes'
  },
  {
    id: 'geraEmissoesAtmosfericas',
    texto: 'Há previsão de impacto ambiental (direto ou indireto) à bens culturais acautelados, nos termos da legislação vigente?',
    categoria: 'Emissões'
  },
  {
    id: 'geraResiduosSolidos',
    texto: 'Haverá utilização de agrotóxicos ou defensivos agrícolas?',
    categoria: 'Resíduos'
  },
  {
    id: 'geraRuidosVibracao',
    texto: 'Há previsão de implantação da atividade em áreas de APP?',
    categoria: 'Poluição Sonora'
  },
  {
    id: 'localizadoAreaProtegida',
    texto: 'O empreendimento está localizado em área de proteção ambiental ou unidade de conservação?',
    categoria: 'Localização'
  },
  {
    id: 'necessitaSupressaoVegetacao',
    texto: 'O empreendimento necessita de supressão de vegetação?',
    categoria: 'Vegetação'
  },
  {
    id: 'interfereCursoAgua',
    texto: 'O empreendimento interfere em cursos d\'água ou nascentes?',
    categoria: 'Recursos Hídricos'
  },
  {
    id: 'armazenaSubstanciaPerigosa',
    texto: 'O empreendimento armazena substâncias perigosas ou produtos químicos?',
    categoria: 'Substâncias Perigosas'
  },
  {
    id: 'possuiPlanoEmergencia',
    texto: 'O empreendimento possui plano de emergência ambiental?',
    categoria: 'Gestão'
  }
];

export default function Step5OutrasInfo({ data, onChange }: Step5OutrasInfoProps) {
  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handlePerguntaChange = (perguntaId: string, resposta: boolean) => {
    const respostas = data?.respostas || {};
    handleChange('respostas', {
      ...respostas,
      [perguntaId]: resposta
    });
  };

  const handleOutrasInfoChange = (value: string) => {
    handleChange('outrasInformacoes', value);
  };

  const getRespostaPergunta = (perguntaId: string): boolean | null => {
    return data?.respostas?.[perguntaId] ?? null;
  };

  const contarRespostas = () => {
    const respostas = data?.respostas || {};
    const respondidas = perguntas.filter(p => respostas[p.id] !== null && respostas[p.id] !== undefined).length;
    return { respondidas, total: perguntas.length };
  };

  const todasRespondidas = () => {
    const { respondidas, total } = contarRespostas();
    return respondidas === total;
  };

  const { respondidas, total } = contarRespostas();

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Info className="w-6 h-6 text-blue-600 mt-1" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Outras Informações</h2>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">
            Respondidas: {respondidas}/{total}
          </span>
          {todasRespondidas() ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-orange-500" />
          )}
        </div>
      </div>

      {/* Alerta de validação */}
      {!todasRespondidas() && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-gray-900">Atenção</h3>
              <p className="text-sm text-gray-600 mt-1">
                Todas as perguntas devem ser respondidas antes de avançar para a próxima etapa.
                Faltam {total - respondidas} {total - respondidas === 1 ? 'resposta' : 'respostas'}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Perguntas */}
      <div className="border border-gray-200 rounded-lg bg-white divide-y divide-gray-200">
        {perguntas.map((pergunta, index) => {
          const resposta = getRespostaPergunta(pergunta.id);
          const respondida = resposta !== null;

          return (
            <div key={pergunta.id} className={`p-5 transition-colors ${!respondida ? 'bg-gray-50' : ''}`}>
              <div className="flex items-start gap-4">
                {/* Número da pergunta */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  respondida
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  {/* Categoria */}
                  {pergunta.categoria && (
                    <span className="inline-block px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded mb-2">
                      {pergunta.categoria}
                    </span>
                  )}

                  {/* Pergunta */}
                  <p className="text-sm font-medium text-gray-900 mb-3">
                    {pergunta.texto}
                  </p>

                  {/* Opções de resposta */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handlePerguntaChange(pergunta.id, true)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                        resposta === true
                          ? 'bg-green-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Sim
                    </button>

                    <button
                      onClick={() => handlePerguntaChange(pergunta.id, false)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                        resposta === false
                          ? 'bg-red-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      Não
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Campo de Outras Informações Relevantes */}
      <div className="border border-gray-200 rounded-lg p-5 bg-white">
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Outras Informações Relevantes
        </label>
        <p className="text-xs text-gray-600 mb-3">
          Utilize este campo para incluir informações complementares que possam ser relevantes para a análise do licenciamento ambiental.
        </p>
        <textarea
          value={data?.outrasInformacoes || ''}
          onChange={(e) => handleOutrasInfoChange(e.target.value)}
          className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={6}
          placeholder="Ex: Medidas mitigadoras já implementadas, certificações ambientais, estudos em andamento, compromissos assumidos..."
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500">
            {data?.outrasInformacoes?.length || 0} caracteres
          </span>
          {data?.outrasInformacoes && data.outrasInformacoes.length > 500 && (
            <span className="text-xs text-blue-600 font-medium">
              Texto extenso - informações detalhadas
            </span>
          )}
        </div>
      </div>

      {/* Informações */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-gray-900">Dica</h3>
            <p className="text-sm text-gray-600 mt-1">
              Responda todas as perguntas com atenção. Estas informações são essenciais para a avaliação
              do impacto ambiental do empreendimento e podem influenciar o tipo de licença necessária.
            </p>
          </div>
        </div>
      </div>

      {/* Resumo das respostas */}
      {todasRespondidas() && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-gray-900">Todas as perguntas foram respondidas</h3>
              <p className="text-sm text-gray-600 mt-1">
                Você pode avançar para a próxima etapa do formulário.
              </p>

              {/* Resumo visual */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-gray-700">
                    {perguntas.filter(p => getRespostaPergunta(p.id) === true).length} respostas "Sim"
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-medium text-gray-700">
                    {perguntas.filter(p => getRespostaPergunta(p.id) === false).length} respostas "Não"
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
