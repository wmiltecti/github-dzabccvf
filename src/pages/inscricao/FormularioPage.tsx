import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useInscricaoContext } from '../../contexts/InscricaoContext';
import FormWizard from '../../components/FormWizard';

export default function FormularioPage() {
  const navigate = useNavigate();
  const { processoId } = useInscricaoContext();

  const handleComplete = () => {
    console.log('📝 Formulário completado, navegando para Documentação');
    navigate('/inscricao/documentacao');
  };

  const handleBack = () => {
    navigate('/inscricao/empreendimento');
  };

  // Mostra loading enquanto aguarda processoId
  if (!processoId) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900">Inicializando processo...</h3>
          <p className="text-gray-600">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header com botão voltar */}
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Atividade
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Formulário de Licenciamento</h2>
        <p className="text-gray-600">
          Preencha as informações detalhadas sobre recursos, energia, água, resíduos e outras informações.
        </p>
      </div>

      {/* FormWizard integrado */}
      <FormWizard 
        processoId={processoId}
        onComplete={handleComplete}
      />
    </div>
  );
}
