import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useInscricaoContext } from '../../contexts/InscricaoContext';
import { useInscricaoStore } from '../../lib/store/inscricao';
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  X,
  Download
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  required: boolean;
  description: string;
  file?: File;
  uploaded?: boolean;
}

const REQUIRED_DOCUMENTS: Document[] = [
  {
    id: 'requerimento',
    name: 'Requerimento de Licença',
    required: true,
    description: 'Formulário de requerimento preenchido e assinado'
  },
  {
    id: 'cpf_cnpj',
    name: 'CPF/CNPJ',
    required: true,
    description: 'Cópia do CPF do requerente ou CNPJ da empresa'
  },
  {
    id: 'comprovante_endereco',
    name: 'Comprovante de Endereço',
    required: true,
    description: 'Comprovante de endereço atualizado (últimos 3 meses)'
  },
  {
    id: 'aet',
    name: 'AET - Análise de Efeito ao Trânsito',
    required: false,
    description: 'Quando aplicável conforme legislação'
  },
  {
    id: 'outorga',
    name: 'Outorga de Uso de Água',
    required: false,
    description: 'Quando houver captação ou lançamento de efluentes'
  },
  {
    id: 'plano_residuos',
    name: 'Plano de Gerenciamento de Resíduos',
    required: false,
    description: 'Para atividades geradoras de resíduos'
  }
];

export default function DocumentacaoPage() {
  const navigate = useNavigate();
  const { processoId } = useInscricaoContext();
  const { isStepComplete, setCurrentStep } = useInscricaoStore();

  const [documents, setDocuments] = useState<Document[]>(REQUIRED_DOCUMENTS);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (docId: string, file: File | null) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === docId 
          ? { ...doc, file, uploaded: !!file }
          : doc
      )
    );
  };

  const handleRemoveFile = (docId: string) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === docId
          ? { ...doc, file: undefined, uploaded: false }
          : doc
      )
    );
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      // TODO: Implementar upload real para Supabase Storage ou API
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Documentos enviados com sucesso!');
    } catch (error) {
      toast.error('Erro ao enviar documentos');
    } finally {
      setUploading(false);
    }
  };

  const handleBack = () => {
    if (window.location.pathname.includes('/inscricao/')) {
      navigate('/inscricao/formulario');
    } else {
      setCurrentStep(4);
    }
  };

  const handleNext = () => {
    if (window.location.pathname.includes('/inscricao/')) {
      navigate('/inscricao/revisao');
    } else {
      setCurrentStep(6);
    }
  };

  const requiredDocsComplete = documents
    .filter(doc => doc.required)
    .every(doc => doc.uploaded);

  const uploadedCount = documents.filter(doc => doc.uploaded).length;
  const requiredCount = documents.filter(doc => doc.required).length;

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
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Documentação</h2>
        <p className="text-gray-600">
          Faça upload dos documentos necessários para análise do processo de licenciamento.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Documentos enviados: {uploadedCount} / {documents.length}
          </span>
          <span className="text-sm text-gray-500">
            {requiredCount} obrigatórios
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(uploadedCount / documents.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-4 mb-6">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-900">{doc.name}</h3>
                  {doc.required && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded">
                      Obrigatório
                    </span>
                  )}
                  {doc.uploaded && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <p className="text-sm text-gray-600">{doc.description}</p>
              </div>
            </div>

            {doc.file ? (
              <div className="flex items-center justify-between mt-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{doc.file.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(doc.file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveFile(doc.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="mt-3">
                <label className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm font-medium">Selecionar arquivo</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileSelect(doc.id, file);
                      }
                    }}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </label>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Warning */}
      {!requiredDocsComplete && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900">Documentos obrigatórios pendentes</h4>
              <p className="text-sm text-yellow-800 mt-1">
                É necessário enviar todos os documentos obrigatórios para prosseguir.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload All Button */}
      {uploadedCount > 0 && (
        <div className="mb-6">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Enviando documentos...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Enviar todos os documentos
              </>
            )}
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={handleBack}
          className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar: Formulário
        </button>

        <button
          onClick={handleNext}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          Próximo: Revisão
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
