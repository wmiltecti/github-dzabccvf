import React, { useState, useEffect } from 'react';
import { PessoasJuridicasService } from '../services/pessoasJuridicasService';
import { toast } from 'react-toastify';
import PessoaJuridicaDetailsModal from '../components/PessoaJuridicaDetailsModal';

interface PessoaJuridica {
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
  cnpj: string | null;
  razaosocial: string | null;
  nomefantasia: string | null;
  inscricaoestadual: string | null;
  fkufinscricaoestadual: number | null;
  datainicioatividade: string | null;
  inscricaomunicipal: string | null;
  cnaefiscal: string | null;
  simplesnacional: string | null;
  crccontador: string | null;
  fknaturezajuridica: number | null;
  fkporte: number | null;
  identificacaoestrangeira: string | null;
  tipoidentificacaoestrangeira: string | null;
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
  statusregimeespecial: string | null;
  dataregimeespecial: string | null;
  periodoregimeespecial: string | null;
  periodopagamentoregimeespecial: string | null;
  fkcentroinformacao: number | null;
  datacadastro: string | null;
  dtype: number | null;
  numeroconselhoprofissional: string | null;
  fkconselhoprofissional: number | null;
  fkestadoemissorconselhoprofissional: number | null;
  caixapostal: string | null;
  endereco: string | null;
  profissao: string | null;
  situacaopessoajuridica: string | null;
  porteempresa: string | null;
  filiacaomae: string | null;
  filiacaopai: string | null;
  conjuge_id: number | null;
  matricula: string | null;
  nomepessoa: string | null;
  numeroidentificacao: string | null;
  nomerazao: string | null;
  permitirvercarscadastrante: string | null;
  cargo: string | null;
  dataultimaalteracao: string | null;
  permitirvercarrt: string | null;
}

export default function PessoasJuridicas() {
  const [pessoas, setPessoas] = useState<PessoaJuridica[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPessoa, setSelectedPessoa] = useState<PessoaJuridica | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPessoas();
  }, []);

  const loadPessoas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await PessoasJuridicasService.getPessoasJuridicas();
      setPessoas(data);
    } catch (error: any) {
      console.error('Erro ao carregar pessoas jurídicas:', error);
      const errorMessage = error?.message || 'Erro ao carregar dados das pessoas jurídicas';
      setError(errorMessage);
      toast.error(errorMessage);
      setPessoas([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCNPJ = (cnpj: string | null) => {
    if (!cnpj) return '';
    const cleaned = cnpj.replace(/\D/g, '');
    if (cleaned.length !== 14) return cnpj;
    return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const getEstadoUF = (fkestado: number | null) => {
    if (!fkestado) return '';
    const estados: { [key: number]: string } = {
      1: 'AC', 2: 'AL', 3: 'AP', 4: 'AM', 5: 'BA',
      6: 'CE', 7: 'DF', 8: 'ES', 9: 'GO', 10: 'MA',
      11: 'MT', 12: 'MS', 13: 'MG', 14: 'PA', 15: 'PB',
      16: 'PR', 17: 'PE', 18: 'PI', 19: 'RJ', 20: 'RN',
      21: 'RS', 22: 'RO', 23: 'RR', 24: 'SC', 25: 'SP',
      26: 'SE', 27: 'TO'
    };
    return estados[fkestado] || '';
  };

  const formatMunicipioUF = (pessoa: PessoaJuridica) => {
    const cidade = pessoa.cidade || '';
    const uf = getEstadoUF(pessoa.fkestado);

    if (!cidade && !uf) {
      return '';
    }

    if (uf && cidade) {
      return `${cidade} (${uf})`;
    }

    return cidade || uf;
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        PESSOAS JURÍDICAS
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
                      Razão Social
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 uppercase">
                      CNPJ
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
                        <td>{pessoa.razaosocial || pessoa.nome || ''}</td>
                        <td>{formatCNPJ(pessoa.cnpj)}</td>
                        <td>{formatMunicipioUF(pessoa)}</td>
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
        <PessoaJuridicaDetailsModal
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
