/**
 * EnterpriseSearch.tsx
 * Componente de pesquisa de empreendimentos
 * Permite buscar empresas (PF e PJ) por CNPJ, CPF, nome ou razão social
 */

import React, { useState } from 'react';
import { Search, Building2, User, CheckCircle, Loader, AlertCircle, X } from 'lucide-react';
import { 
  searchEnterprises, 
  Enterprise, 
  getEnterpriseName, 
  getEnterpriseDocument,
  formatDocument,
  getFullAddress 
} from '../../services/enterpriseService';
import { useEnterprise } from '../../contexts/EnterpriseContext';
import { toast } from 'react-toastify';

interface EnterpriseSearchProps {
  onEnterpriseSelected?: (enterprise: Enterprise) => void;
  allowSelection?: boolean;
}

export default function EnterpriseSearch({ 
  onEnterpriseSelected,
  allowSelection = true 
}: EnterpriseSearchProps) {
  const { 
    selectedEnterprise, 
    selectEnterprise, 
    clearEnterprise, 
    markSearchPerformed 
  } = useEnterprise();

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Enterprise[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  /**
   * Manipula a pesquisa
   */
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      toast.warning('Digite um termo de busca');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResults([]);
      setSearchPerformed(false);

      console.log('[EnterpriseSearch] Buscando:', searchQuery);

      const foundEnterprises = await searchEnterprises(searchQuery.trim());

      setResults(foundEnterprises);
      setSearchPerformed(true);
      markSearchPerformed(); // Marca no contexto que a pesquisa foi feita

      if (foundEnterprises.length === 0) {
        toast.info('Nenhum empreendimento encontrado', {
          icon: <AlertCircle className="w-5 h-5 text-blue-600" />,
        });
      } else {
        toast.success(`${foundEnterprises.length} empreendimento(s) encontrado(s)!`);
      }
    } catch (err: any) {
      console.error('[EnterpriseSearch] Erro na busca:', err);
      setError(err.message || 'Erro ao buscar empreendimentos');
      setSearchPerformed(true);
      toast.error(err.message || 'Erro ao buscar empreendimentos');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Seleciona um empreendimento
   */
  const handleSelectEnterprise = (enterprise: Enterprise) => {
    if (!allowSelection) return;

    selectEnterprise(enterprise);
    
    if (onEnterpriseSelected) {
      onEnterpriseSelected(enterprise);
    }

    toast.success('Empreendimento selecionado com sucesso!', {
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
    });
  };

  /**
   * Remove seleção
   */
  const handleClearSelection = () => {
    clearEnterprise();
    toast.info('Seleção removida');
  };

  /**
   * Limpa a pesquisa
   */
  const handleClearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setError(null);
    setSearchPerformed(false);
  };

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Search className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Pesquisar Empreendimento
          </h3>
          <p className="text-sm text-gray-600">
            Busque por CNPJ, CPF, Razão Social ou Nome Fantasia
          </p>
        </div>
      </div>

      {/* Empreendimento Selecionado */}
      {selectedEnterprise && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 bg-green-100 rounded-lg">
                {selectedEnterprise.tipo_pessoa === 'juridica' ? (
                  <Building2 className="w-5 h-5 text-green-700" />
                ) : (
                  <User className="w-5 h-5 text-green-700" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-green-900">
                    {getEnterpriseName(selectedEnterprise)}
                  </h4>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-sm text-green-700">
                  <strong>Documento:</strong> {getEnterpriseDocument(selectedEnterprise)}
                </p>
                {selectedEnterprise.tipo_pessoa === 'juridica' && selectedEnterprise.razao_social && (
                  <p className="text-sm text-green-700">
                    <strong>Razão Social:</strong> {selectedEnterprise.razao_social}
                  </p>
                )}
                <p className="text-sm text-green-700">
                  <strong>Endereço:</strong> {getFullAddress(selectedEnterprise)}
                </p>
              </div>
            </div>
            {allowSelection && (
              <button
                onClick={handleClearSelection}
                className="p-1 hover:bg-green-200 rounded transition-colors"
                title="Remover seleção"
              >
                <X className="w-4 h-4 text-green-700" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Formulário de Busca */}
      {!selectedEnterprise && (
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Digite CNPJ, CPF, nome ou razão social..."
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Buscar
                </>
              )}
            </button>
            {searchPerformed && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                title="Limpar pesquisa"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      )}

      {/* Mensagem de Erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 mb-1">Erro na Busca</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Resultados da Busca */}
      {!selectedEnterprise && searchPerformed && results.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">
            {results.length} resultado(s) encontrado(s):
          </h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.map((enterprise) => (
              <div
                key={enterprise.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
                onClick={() => allowSelection && handleSelectEnterprise(enterprise)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${
                    enterprise.tipo_pessoa === 'juridica' 
                      ? 'bg-blue-50' 
                      : 'bg-purple-50'
                  }`}>
                    {enterprise.tipo_pessoa === 'juridica' ? (
                      <Building2 className={`w-5 h-5 ${
                        enterprise.tipo_pessoa === 'juridica' 
                          ? 'text-blue-600' 
                          : 'text-purple-600'
                      }`} />
                    ) : (
                      <User className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-gray-900 truncate">
                      {getEnterpriseName(enterprise)}
                    </h5>
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Documento:</strong> {getEnterpriseDocument(enterprise)}
                    </p>
                    {enterprise.tipo_pessoa === 'juridica' && enterprise.razao_social && (
                      <p className="text-sm text-gray-600">
                        <strong>Razão Social:</strong> {enterprise.razao_social}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      {getFullAddress(enterprise)}
                    </p>
                  </div>
                  {allowSelection && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectEnterprise(enterprise);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Selecionar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensagem "Nenhum resultado" */}
      {!selectedEnterprise && searchPerformed && results.length === 0 && !error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900 mb-1">
                Nenhum empreendimento encontrado
              </h4>
              <p className="text-sm text-yellow-700">
                Não encontramos empreendimentos com o termo "{searchQuery}". 
                Verifique se digitou corretamente ou tente outro termo de busca.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
