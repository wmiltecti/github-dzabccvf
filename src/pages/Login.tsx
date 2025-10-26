import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { checkSystemHealth, getHealthStatusMessage } from '../lib/systemHealth';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, isSupabaseReady, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<string | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      setCheckingHealth(true);
      const health = await checkSystemHealth();
      const statusMessage = getHealthStatusMessage(health);

      if (health.overall === 'offline') {
        setSystemStatus(statusMessage);
      } else {
        setSystemStatus(null);
      }

      setCheckingHealth(false);
    };

    checkHealth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isConfigured) {
      setError('Sistema não configurado. Entre em contato com o administrador.');
      return;
    }

    if (!isSupabaseReady) {
      setError('Sistema temporariamente indisponível. Tente novamente em alguns instantes.');
      return;
    }

    setLoading(true);

    try {
      await signIn(email, senha);
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

          {checkingHealth ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-slate-600">Verificando sistema...</p>
            </div>
          ) : (
            <>
              {systemStatus && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                  <p className="text-yellow-800 text-sm font-medium">{systemStatus}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                    disabled={!isConfigured || !isSupabaseReady}
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
                    disabled={!isConfigured || !isSupabaseReady}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !isConfigured || !isSupabaseReady}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 px-6 rounded-xl transition shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
