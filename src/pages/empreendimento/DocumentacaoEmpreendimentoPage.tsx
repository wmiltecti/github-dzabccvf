import React, { useState } from 'react';
import { Upload, ArrowRight, ArrowLeft, FileText, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

interface DocumentacaoEmpreendimentoPageProps {
  onNext: (data?: any) => void;
  onPrevious?: () => void;
}

interface Documento {
  id: string;
  nome: string;
  tipo: string;
  tamanho?: string;
  arquivo?: File;
  obrigatorio: boolean;
}

/**
 * Página 5: Documentação do Empreendimento
 */
export default function DocumentacaoEmpreendimentoPage({ 
  onNext, 
  onPrevious 
}: DocumentacaoEmpreendimentoPageProps) {
  
  const [documentos, setDocumentos] = useState<Documento[]>([
    { id: '1', nome: 'Planta de Localização', tipo: 'planta_localizacao', obrigatorio: true },
    { id: '2', nome: 'Memorial Descritivo', tipo: 'memorial_descritivo', obrigatorio: true },
    { id: '3', nome: 'Projeto Técnico', tipo: 'projeto_tecnico', obrigatorio: false },
    { id: '4', nome: 'ART/TRT', tipo: 'art_trt', obrigatorio: true },
    { id: '5', nome: 'Procuração (se aplicável)', tipo: 'procuracao', obrigatorio: false },
    { id: '6', nome: 'Certidão de Matrícula do Imóvel', tipo: 'certidao_imovel', obrigatorio: true }
  ]);

  const handleFileUpload = (documentoId: string, file: File) => {
    setDocumentos(prev => prev.map(doc => {
      if (doc.id === documentoId) {
        return {
          ...doc,
          arquivo: file,
          tamanho: (file.size / 1024 / 1024).toFixed(2) + ' MB'
        };
      }
      return doc;
    }));
    toast.success(`Arquivo ${file.name} adicionado!`);
  };

  const handleRemoveFile = (documentoId: string) => {
    setDocumentos(prev => prev.map(doc => {
      if (doc.id === documentoId) {
        return {
          ...doc,
          arquivo: undefined,
          tamanho: undefined
        };
      }
      return doc;
    }));
    toast.info('Arquivo removido');
  };

  const handleNext = () => {
    // Verifica se todos os documentos obrigatórios foram enviados
    const documentosObrigatoriosFaltando = documentos.filter(
      doc => doc.obrigatorio && !doc.arquivo
    );

    if (documentosObrigatoriosFaltando.length > 0) {
      toast.error('Envie todos os documentos obrigatórios');
      return;
    }

    // Coleta os arquivos enviados
    const arquivos = documentos
      .filter(doc => doc.arquivo)
      .map(doc => ({
        tipo: doc.tipo,
        arquivo: doc.arquivo
      }));

    onNext({ documentos: arquivos });
  };

  const documentosEnviados = documentos.filter(doc => doc.arquivo).length;
  const documentosObrigatorios = documentos.filter(doc => doc.obrigatorio).length;
  const documentosObrigatoriosEnviados = documentos.filter(
    doc => doc.obrigatorio && doc.arquivo
  ).length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Upload className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-bold text-gray-800">Documentação</h2>
        </div>
        <p className="text-gray-600 text-sm">
          Envie os documentos necessários para o empreendimento
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-600 font-medium">Total de Documentos</p>
          <p className="text-2xl font-bold text-blue-700">{documentos.length}</p>
        </div>

        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <p className="text-sm text-orange-600 font-medium">Obrigatórios</p>
          <p className="text-2xl font-bold text-orange-700">
            {documentosObrigatoriosEnviados} / {documentosObrigatorios}
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-green-600 font-medium">Total Enviados</p>
          <p className="text-2xl font-bold text-green-700">{documentosEnviados}</p>
        </div>
      </div>

      {/* Lista de Documentos */}
      <div className="space-y-4 mb-6">
        {documentos.map((documento) => (
          <div 
            key={documento.id}
            className={`bg-white rounded-lg p-4 border-2 ${
              documento.arquivo 
                ? 'border-green-300 bg-green-50' 
                : documento.obrigatorio 
                ? 'border-orange-300' 
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {documento.arquivo ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800">{documento.nome}</h3>
                    {documento.obrigatorio && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                        Obrigatório
                      </span>
                    )}
                  </div>
                  
                  {documento.arquivo ? (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Arquivo:</span> {documento.arquivo.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Tamanho:</span> {documento.tamanho}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-1">
                      Nenhum arquivo enviado
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                {!documento.arquivo ? (
                  <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                    Enviar
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(documento.id, file);
                        }
                      }}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </label>
                ) : (
                  <>
                    <label className="cursor-pointer px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors">
                      Substituir
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(documento.id, file);
                          }
                        }}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                    </label>
                    <button
                      onClick={() => handleRemoveFile(documento.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Remover arquivo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Informações */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-2">Informações Importantes:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Formatos aceitos: PDF, DOC, DOCX, JPG, JPEG, PNG</li>
          <li>• Tamanho máximo por arquivo: 10 MB</li>
          <li>• Todos os documentos obrigatórios devem ser enviados</li>
          <li>• Certifique-se de que os documentos estão legíveis</li>
        </ul>
      </div>

      {/* Botões de Navegação */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          onClick={onPrevious}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <button
          onClick={handleNext}
          disabled={documentosObrigatoriosEnviados < documentosObrigatorios}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          Finalizar
          <CheckCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
