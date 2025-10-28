import React, { useState, useEffect } from 'react';
import { PessoasFisicasService } from '../services/pessoasFisicasService';
import { toast } from 'react-toastify';
import PessoaFisicaDetailsModal from '../components/PessoaFisicaDetailsModal';

interface PessoaFisica {
  pkpessoa: number;
  fkuser: number | null;
  tipo: string | number | null;
  status: string | null;
  cpf: string | null;
  nome: string;
  datanascimento: string | null;
  naturalidade: string | null;
  nacionalidade: string | null;
  estadocivil: string | number | null;
  sexo: string | number | null;
  rg: string | null;
  orgaoemissor: string | null;
  fkestadoemissor: number | null;
  fkprofissao: number | null;
  passaporte: string | null;
  datapassaporte: string | null;
  telefone: string | null;
  telefonealternativo1: string | null;
  telefonealternativo2: string | null;
  email: string | null;
  emailalternativo: string | null;
  fax: string | null;
  faxalternativo: string | null;
  complemento: string | null;
  cep: string | null;
  cidade: string | null;
  provincia: string | null;
  fkmunicipio: number | null;
  fkestado: number | null;
  fkpais: number | null;
  numeroconselhoprofissional: string | null;
  fkconselhoprofissional: number | null;
  endereco: string | null;
  profissao: string | null;
  filiacaomae: string | null;
  filiacaopai: string | null;
  conjuge_id: number | null;
  matricula: string | null;
  cargo: string | null;
  dataultimaalteracao: string | null;
}

export default function PessoasFisicas() {
  const [pessoas, setPessoas] = useState<PessoaFisica[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPessoa, setSelectedPessoa] = useState<PessoaFisica | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPessoas();
  }, []);

  const loadPessoas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await PessoasFisicasService.getPessoas();
      setPessoas(data);
    } catch (error: any) {
      console.error('Erro ao carregar pessoas físicas:', error);
      const errorMessage = error?.message || 'Erro ao carregar dados das pessoas físicas';
      setError(errorMessage);
      toast.error(errorMessage);
      setPessoas([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCpfPassaporte = (pessoa: PessoaFisica) => {
    if (pessoa.cpf) {
      return pessoa.cpf;
    }
    if (pessoa.passaporte) {
      return pessoa.passaporte;
    }
    return '';
  };

  const formatMunicipio = (pessoa: PessoaFisica) => {
    if (pessoa.cidade) {
      return pessoa.cidade;
    }
    return '';
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        PESSOAS FÍSICAS
      </div>

      <div className="button-toolbar">
        <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm">
          Novo
        </button>
        <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm">
          Editar
        </button>
        <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm">
          Excluir
        </button>
        <button
          className={`px-4 py-2 text-white rounded transition-colors text-sm ${
            selectedPessoa ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-400 cursor-not-allowed'
          }`}
          disabled={!selectedPessoa}
          onClick={() => {
            if (selectedPessoa) {
              setShowDetailsModal(true);
            }
          }}
        >
          Detalhes
        </button>
        <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm">
          Localizar
        </button>
        <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm">
          Reenviar Senha
        </button>
        <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm">
          Criar Técnico
        </button>
      </div>

      <div className="glass-effect rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
              <p className="text-red-800 font-semibold mb-2">Erro ao carregar dados</p>
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <button
                onClick={loadPessoas}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        ) : (
          <div className="table-container">
            <div className="table-header-wrapper">
              <table className="data-table">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase">
                      Nome
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 uppercase">
                      CPF/Passaporte
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 uppercase">
                      Município (UF)
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className="table-body-wrapper">
              <table className="data-table">
                <tbody>
                  {pessoas.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                        Nenhum registro encontrado
                      </td>
                    </tr>
                  ) : (
                    pessoas.map((pessoa) => (
                      <tr
                        key={pessoa.pkpessoa}
                        onClick={() => setSelectedPessoa(pessoa)}
                        className={`cursor-pointer hover:bg-gray-50 ${
                          selectedPessoa?.pkpessoa === pessoa.pkpessoa ? 'bg-green-50' : ''
                        }`}
                      >
                        <td>{pessoa.nome}</td>
                        <td>{formatCpfPassaporte(pessoa)}</td>
                        <td>{formatMunicipio(pessoa)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showDetailsModal && selectedPessoa && (
        <PessoaFisicaDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
          }}
          pessoa={selectedPessoa}
        />
      )}
    </div>
  );
}
