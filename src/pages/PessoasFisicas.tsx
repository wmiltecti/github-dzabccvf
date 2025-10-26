import React, { useState, useEffect } from 'react';
import { PessoasFisicasService } from '../services/pessoasFisicasService';
import { toast } from 'react-toastify';

interface PessoaFisica {
  pkpessoa: number;
  nome: string;
  cpf: string | null;
  passaporte: string | null;
  cidade: string | null;
  fkestado: number | null;
  fkmunicipio: number | null;
}

export default function PessoasFisicas() {
  const [pessoas, setPessoas] = useState<PessoaFisica[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPessoas();
  }, []);

  const loadPessoas = async () => {
    try {
      setLoading(true);
      const data = await PessoasFisicasService.getPessoas();
      setPessoas(data);
    } catch (error) {
      console.error('Erro ao carregar pessoas físicas:', error);
      toast.error('Erro ao carregar dados das pessoas físicas');
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
    return 'N/A';
  };

  const formatMunicipio = (pessoa: PessoaFisica) => {
    if (pessoa.cidade) {
      return pessoa.cidade;
    }
    return 'N/A';
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
        <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm">
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
        ) : (
          <div className="overflow-x-auto">
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
              <tbody>
                {pessoas.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                      Nenhum registro encontrado
                    </td>
                  </tr>
                ) : (
                  pessoas.map((pessoa) => (
                    <tr key={pessoa.pkpessoa}>
                      <td>{pessoa.nome}</td>
                      <td>{formatCpfPassaporte(pessoa)}</td>
                      <td>{formatMunicipio(pessoa)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
