import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInscricaoStore } from '../../lib/store/inscricao';
import { useInscricaoContext } from '../../contexts/InscricaoContext';
import { Building, ArrowRight, AlertTriangle, Search, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { completeStep } from '../../services/workflowApi';

// Tipo temporário - substituir pela integração real com o novo fluxo
interface EmpreendimentoCadastrado {
  id: string;
  nome: string;
  tipo: string;
  endereco: string;
  status: string;
}

export default function EmpreendimentoPageNew() {
  const navigate = useNavigate();
  const { 
    workflowInstanceId,
    currentStepId,
    currentStepKey
  } = useInscricaoContext();
  const { setCurrentStep } = useInscricaoStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmpreendimento, setSelectedEmpreendimento] = useState<EmpreendimentoCadastrado | null>(null);
  const [empreendimentos, setEmpreendimentos] = useState<EmpreendimentoCadastrado[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // TODO: Substituir por busca real na API/Store de empreendimentos
  const handleSearch = async () => {
    if (!searchTerm || searchTerm.length < 3) {
      toast.error('Digite pelo menos 3 caracteres para buscar');
      return;
    }

    setIsSearching(true);
    
    try {
      // Simulação - substituir por chamada real à API
      // const results = await buscarEmpreendimentos(searchTerm);
      
      // Mock de dados para desenvolvimento
      const mockEmpreendimentos: EmpreendimentoCadastrado[] = [
        {
          id: '1',
          nome: 'Complexo Industrial XYZ',
          tipo: 'Industrial',
          endereco: 'Rodovia BR-101, Km 50 - São Paulo/SP',
          status: 'ativo'
        },
        {
          id: '2',
          nome: 'Fazenda Santa Maria',
          tipo: 'Agropecuário',
          endereco: 'Zona Rural - Goiânia/GO',
          status: 'ativo'
        }
      ];

      setEmpreendimentos(mockEmpreendimentos);
      
      if (mockEmpreendimentos.length === 0) {
        toast.info('Nenhum empreendimento encontrado');
      }
    } catch (error: any) {
      console.error('Erro ao buscar empreendimentos:', error);
      toast.error('Erro ao buscar empreendimentos');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectEmpreendimento = (emp: EmpreendimentoCadastrado) => {
    setSelectedEmpreendimento(emp);
    toast.success(`Empreendimento "${emp.nome}" selecionado`);
  };

  const handleNext = async () => {
    if (!selectedEmpreendimento) {
      toast.error('Selecione um empreendimento para continuar');
      return;
    }

    try {
      // Se estiver usando workflow engine
      if (workflowInstanceId && currentStepId) {
        await completeStep(workflowInstanceId, currentStepId, {
          empreendimento_id: selectedEmpreendimento.id,
          empreendimento_nome: selectedEmpreendimento.nome
        });
        
        toast.success('Empreendimento vinculado ao processo!');
        setCurrentStep(2); // Avança para Partícipes
      } else {
        // Modo local
        toast.success('Empreendimento selecionado!');
        setCurrentStep(2);
      }
    } catch (error: any) {
      console.error('Erro ao avançar:', error);
      toast.error('Erro ao salvar: ' + (error.message || 'Erro desconhecido'));
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Building className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">Empreendimento</h2>
        </div>
        <p className="text-gray-600">
          Busque um empreendimento previamente cadastrado
        </p>
      </div>

      {/* Informação importante */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-yellow-900 mb-1">Empreendimento Pré-Cadastrado</h4>
            <p className="text-sm text-yellow-800">
              Este fluxo requer que o empreendimento já esteja cadastrado no sistema.
              Caso o empreendimento não exista, cadastre-o primeiro através do menu 
              <strong> "Empreendimento" → "Novo Empreendimento"</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Busca */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Buscar Empreendimento
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Digite o nome do empreendimento..."
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            {isSearching ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </div>

      {/* Empreendimento Selecionado */}
      {selectedEmpreendimento && (
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Empreendimento Selecionado
                </h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium text-gray-700">Nome:</span>{' '}
                    <span className="text-gray-900">{selectedEmpreendimento.nome}</span>
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">Tipo:</span>{' '}
                    <span className="text-gray-900">{selectedEmpreendimento.tipo}</span>
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">Endereço:</span>{' '}
                    <span className="text-gray-900">{selectedEmpreendimento.endereco}</span>
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">Status:</span>{' '}
                    <span className="inline-block px-2 py-0.5 bg-green-200 text-green-800 text-xs rounded">
                      {selectedEmpreendimento.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedEmpreendimento(null)}
              className="ml-4 px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
            >
              Remover
            </button>
          </div>
        </div>
      )}

      {/* Lista de Resultados */}
      {!selectedEmpreendimento && empreendimentos.length > 0 && (
        <div className="space-y-3 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Resultados da Busca ({empreendimentos.length})
          </h3>
          {empreendimentos.map((emp) => (
            <div
              key={emp.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-green-500 hover:shadow-md transition-all cursor-pointer"
              onClick={() => handleSelectEmpreendimento(emp)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{emp.nome}</h4>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Tipo:</span> {emp.tipo}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Endereço:</span> {emp.endereco}
                  </p>
                </div>
                <span className="ml-4 px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                  {emp.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mensagem de lista vazia */}
      {!selectedEmpreendimento && empreendimentos.length === 0 && searchTerm && !isSearching && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Nenhum empreendimento encontrado</p>
          <p className="text-sm text-gray-500 mt-1">
            Tente buscar com outros termos ou cadastre um novo empreendimento
          </p>
        </div>
      )}

      {/* Botões de Navegação */}
      <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
        <button
          onClick={handleNext}
          disabled={!selectedEmpreendimento}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          Próximo
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
