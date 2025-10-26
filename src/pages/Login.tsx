import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../lib/api/auth';
import { PessoaTipo } from '../types/auth';

export default function Login() {
  const navigate = useNavigate();
  const [pessoaTipo, setPessoaTipo] = useState<PessoaTipo>('PF');
  const [tipoDeIdentificacao, setTipoDeIdentificacao] = useState<"CPF" | "CNPJ" | "PASSAPORTE" | "ID_ESTRANGEIRA">('CPF');
  const [numeroIdentificacao, setNumeroIdentificacao] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPlaceholder = () => {
    if (pessoaTipo === 'ESTRANGEIRO') {
      switch (tipoDeIdentificacao) {
        case 'CPF':
          return 'Digite o CPF';
        case 'CNPJ':
          return 'Digite o CNPJ';
        case 'PASSAPORTE':
          return 'Digite o número do passaporte';
        case 'ID_ESTRANGEIRA':
          return 'Digite o ID estrangeiro';
      }
    }
    switch (pessoaTipo) {
      case 'PF':
        return 'Digite o CPF';
      case 'PJ':
        return 'Digite o CNPJ';
      case 'PASSAPORTE':
        return 'Digite o número do passaporte';
      default:
        return 'Digite sua identificação';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const credenciais = {
        numeroIdentificacao,
        senha,
        ...(pessoaTipo === 'ESTRANGEIRO' && { tipoDeIdentificacao }),
      };

      const result = await login(pessoaTipo, credenciais);
      console.log('✅ Login OK - Resultado:', result);
      console.log('📦 Verificando localStorage após login:');
      console.log('  - auth_token:', localStorage.getItem('auth_token'));
      console.log('  - auth_user:', localStorage.getItem('auth_user'));
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Bem-vindo</h1>
            <p className="text-slate-600">Faça login para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo de Pessoa
              </label>
              <select
                value={pessoaTipo}
                onChange={(e) => setPessoaTipo(e.target.value as PessoaTipo)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="PF">Pessoa Física (CPF)</option>
                <option value="PJ">Pessoa Jurídica (CNPJ)</option>
                <option value="PASSAPORTE">Passaporte</option>
                <option value="ESTRANGEIRO">Estrangeiro</option>
              </select>
            </div>

            {pessoaTipo === 'ESTRANGEIRO' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tipo de Identificação
                </label>
                <select
                  value={tipoDeIdentificacao}
                  onChange={(e) => setTipoDeIdentificacao(e.target.value as "CPF" | "CNPJ" | "PASSAPORTE" | "ID_ESTRANGEIRA")}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="CPF">CPF</option>
                  <option value="CNPJ">CNPJ</option>
                  <option value="PASSAPORTE">Passaporte</option>
                  <option value="ID_ESTRANGEIRA">ID Estrangeira</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Identificação
              </label>
              <input
                type="text"
                value={numeroIdentificacao}
                onChange={(e) => setNumeroIdentificacao(e.target.value)}
                placeholder={getPlaceholder()}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 px-6 rounded-xl transition shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
