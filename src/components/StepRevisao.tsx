import React, { useState } from 'react';
import {
  CheckCircle,
  Edit2,
  FileText,
  Zap,
  Droplet,
  Fuel,
  Trash2,
  Info,
  Save,
  AlertCircle,
  ExternalLink,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StepRevisaoProps {
  formData: any;
  onNavigateToStep: (step: number) => void;
  onFinish: () => void;
}

export default function StepRevisao({ formData, onNavigateToStep, onFinish }: StepRevisaoProps) {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleFinish = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setShowSuccessModal(true);
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    onFinish();
  };

  const sections = [
    {
      step: 1,
      title: 'Características do Empreendimento',
      icon: FileText,
      color: 'blue',
      data: formData.step1 || {},
      renderContent: (data: any) => (
        <div className="space-y-2">
          {data.nomeEmpreendimento && (
            <div>
              <span className="text-xs font-medium text-gray-500">Nome do Empreendimento:</span>
              <p className="text-sm text-gray-900">{data.nomeEmpreendimento}</p>
            </div>
          )}
          {data.atividade && (
            <div>
              <span className="text-xs font-medium text-gray-500">Atividade:</span>
              <p className="text-sm text-gray-900">{data.atividade}</p>
            </div>
          )}
          {data.area && (
            <div>
              <span className="text-xs font-medium text-gray-500">Área:</span>
              <p className="text-sm text-gray-900">{data.area} m²</p>
            </div>
          )}
          {data.endereco && (
            <div>
              <span className="text-xs font-medium text-gray-500">Endereço:</span>
              <p className="text-sm text-gray-900">{data.endereco}</p>
            </div>
          )}
        </div>
      )
    },
    {
      step: 2,
      title: 'Uso de Recursos e Energia',
      icon: Zap,
      color: 'yellow',
      data: formData.step2 || {},
      renderContent: (data: any) => (
        <div className="space-y-2">
          {data.recursosEnergia && data.recursosEnergia.length > 0 ? (
            <div>
              <span className="text-xs font-medium text-gray-500">Recursos cadastrados:</span>
              <ul className="mt-1 space-y-1">
                {data.recursosEnergia.map((item: any, idx: number) => (
                  <li key={idx} className="text-sm text-gray-900 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                    {item.tipo} - {item.potencia} ({item.unidade})
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">Nenhum recurso cadastrado</p>
          )}
        </div>
      )
    },
    {
      step: 3,
      title: 'Uso de Água',
      icon: Droplet,
      color: 'blue',
      data: formData.step3 || {},
      renderContent: (data: any) => (
        <div className="space-y-2">
          {data.usoAgua && data.usoAgua.length > 0 ? (
            <div>
              <span className="text-xs font-medium text-gray-500">Usos cadastrados:</span>
              <ul className="mt-1 space-y-1">
                {data.usoAgua.map((item: any, idx: number) => (
                  <li key={idx} className="text-sm text-gray-900 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    {item.finalidade} - {item.vazao} m³/h ({item.origem})
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">Nenhum uso cadastrado</p>
          )}
        </div>
      )
    },
    {
      step: 4,
      title: 'Combustíveis',
      icon: Fuel,
      color: 'orange',
      data: formData.step4 || {},
      renderContent: (data: any) => (
        <div className="space-y-2">
          {data.combustiveis && data.combustiveis.length > 0 ? (
            <div>
              <span className="text-xs font-medium text-gray-500">Combustíveis cadastrados:</span>
              <ul className="mt-1 space-y-1">
                {data.combustiveis.map((item: any, idx: number) => (
                  <li key={idx} className="text-sm text-gray-900 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                    {item.tipoFonte.replace(/_/g, ' ')} - {item.equipamento} ({item.quantidade.toFixed(2)} {item.unidade})
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">Nenhum combustível cadastrado</p>
          )}
        </div>
      )
    },
    {
      step: 5,
      title: 'Resíduos',
      icon: Trash2,
      color: 'red',
      data: formData.step5 || {},
      renderContent: (data: any) => {
        const totalGrupoA = data.residuosGrupoA?.length || 0;
        const totalGrupoB = data.residuosGrupoB?.length || 0;
        const totalGerais = data.residuosGerais?.length || 0;
        const total = totalGrupoA + totalGrupoB + totalGerais;

        return (
          <div className="space-y-2">
            {total > 0 ? (
              <div>
                <span className="text-xs font-medium text-gray-500">Resíduos cadastrados:</span>
                <div className="mt-1 grid grid-cols-3 gap-2">
                  <div className="bg-red-50 rounded p-2">
                    <p className="text-xs text-gray-600">Grupo A</p>
                    <p className="text-lg font-semibold text-red-700">{totalGrupoA}</p>
                  </div>
                  <div className="bg-orange-50 rounded p-2">
                    <p className="text-xs text-gray-600">Grupo B</p>
                    <p className="text-lg font-semibold text-orange-700">{totalGrupoB}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs text-gray-600">Gerais</p>
                    <p className="text-lg font-semibold text-gray-700">{totalGerais}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Nenhum resíduo cadastrado</p>
            )}
          </div>
        );
      }
    },
    {
      step: 6,
      title: 'Outras Informações',
      icon: Info,
      color: 'purple',
      data: formData.step6 || {},
      renderContent: (data: any) => {
        const respostas = data.respostas || {};
        const totalPerguntas = 10;
        const respondidas = Object.keys(respostas).length;
        const respostasPositivas = Object.values(respostas).filter(r => r === true).length;

        return (
          <div className="space-y-3">
            {respondidas > 0 ? (
              <>
                <div className="flex items-center gap-4">
                  <div className="bg-green-50 rounded px-3 py-1">
                    <p className="text-xs text-gray-600">Respondidas</p>
                    <p className="text-lg font-semibold text-green-700">{respondidas}/{totalPerguntas}</p>
                  </div>
                  <div className="bg-blue-50 rounded px-3 py-1">
                    <p className="text-xs text-gray-600">Respostas "Sim"</p>
                    <p className="text-lg font-semibold text-blue-700">{respostasPositivas}</p>
                  </div>
                </div>
                {data.outrasInformacoes && (
                  <div>
                    <span className="text-xs font-medium text-gray-500">Informações Adicionais:</span>
                    <p className="text-sm text-gray-900 mt-1 line-clamp-3">{data.outrasInformacoes}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500 italic">Nenhuma informação cadastrada</p>
            )}
          </div>
        );
      }
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: any = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
      red: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Revisão Final</h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Revise todas as informações antes de finalizar
          </p>
        </div>
      </div>

      {/* Cards de Revisão */}
      <div className="space-y-4">
        {sections.map((section) => {
          const colorClasses = getColorClasses(section.color);
          const Icon = section.icon;
          const hasData = section.data && Object.keys(section.data).length > 0;

          return (
            <motion.div
              key={section.step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: section.step * 0.1 }}
              className={`border ${colorClasses.border} rounded-lg bg-white overflow-hidden`}
            >
              {/* Cabeçalho da Seção */}
              <div className={`${colorClasses.bg} px-4 py-3 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-white flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${colorClasses.text}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{section.title}</h3>
                    <p className="text-xs text-gray-600">Etapa {section.step}</p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigateToStep(section.step)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
              </div>

              {/* Conteúdo da Seção */}
              <div className="px-4 py-4">
                {hasData ? (
                  section.renderContent(section.data)
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <AlertCircle className="w-4 h-4" />
                    Nenhum dado cadastrado nesta etapa
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Informações Finais */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-gray-900">Antes de finalizar</h3>
            <p className="text-sm text-gray-600 mt-1">
              Revise todas as informações com atenção. Após finalizar, o formulário será enviado para análise.
              Você poderá editar qualquer etapa clicando no botão "Editar" correspondente.
            </p>
          </div>
        </div>
      </div>

      {/* Botão de Finalização */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleFinish}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg"
        >
          {isSaving ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Save className="w-5 h-5" />
              </motion.div>
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Salvar e Finalizar
            </>
          )}
        </button>
      </div>

      {/* Modal de Sucesso */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Ícone de Sucesso Animado */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
                >
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </motion.div>
              </motion.div>

              {/* Título */}
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
                Formulário Concluído com Sucesso!
              </h2>

              {/* Descrição */}
              <p className="text-sm text-gray-600 text-center mb-6">
                Todas as informações foram salvas e o formulário foi enviado para análise.
                Você receberá notificações sobre o andamento do processo.
              </p>

              {/* Detalhes */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Protocolo:</span>
                  <span className="font-mono font-semibold text-gray-900">
                    {Math.random().toString(36).substring(2, 10).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Data:</span>
                  <span className="font-medium text-gray-900">
                    {new Date().toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Etapas concluídas:</span>
                  <span className="font-medium text-gray-900">6/6</span>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-3">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Fechar
                </button>
                <button
                  onClick={handleCloseModal}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ver Protocolo
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
