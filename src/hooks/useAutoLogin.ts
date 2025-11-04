import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook para processar auto-login via URL parameters
 * 
 * Suporta os seguintes parâmetros:
 * - token: JWT token de autenticação
 * - nome: Nome do usuário
 * - userId: ID do usuário
 * - email: Email do usuário (opcional)
 * 
 * Exemplo de URL:
 * https://app.com?token=eyJhbG...&nome=João&userId=123&email=joao@email.com
 */
export function useAutoLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    const processAutoLogin = () => {
      try {
        // Só executa se não foi processado antes (evita loop)
        const alreadyProcessed = sessionStorage.getItem('auto_login_processed');
        if (alreadyProcessed) {
          console.log('[Auto-Login] Já processado anteriormente, pulando...');
          return;
        }

        // Log da URL completa para debug
        console.log('[Auto-Login] URL completa:', window.location.href);
        console.log('[Auto-Login] Query string:', window.location.search);
        
        // Captura parâmetros da URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const nome = urlParams.get('nome');
        const userId = urlParams.get('userId');
        const email = urlParams.get('email');

        // Log dos parâmetros capturados
        console.log('[Auto-Login] Parâmetros capturados:', {
          token: token ? `${token.substring(0, 20)}...` : 'null',
          userId: userId || 'null',
          nome: nome || 'null',
          email: email || 'null'
        });

        // Verifica se tem os parâmetros mínimos necessários
        if (!token || !userId) {
          console.warn('[Auto-Login] ❌ Parâmetros insuficientes na URL');
          console.warn('[Auto-Login] Token presente:', !!token);
          console.warn('[Auto-Login] UserId presente:', !!userId);
          return;
        }

        console.log('[Auto-Login] ✅ Detectados parâmetros de login automático');
        console.log('[Auto-Login] UserId:', userId);
        console.log('[Auto-Login] Nome:', nome);
        console.log('[Auto-Login] Email:', email);

        // 1. Salva o token no localStorage (FastAPI format)
        localStorage.setItem('auth_token', token);
        console.log('[Auto-Login] ✓ Token armazenado em auth_token');

        // 2. Salva dados do usuário (formato esperado pelo sistema)
        const authUser = {
          userId: userId,
          id: userId,
          nome: nome || '',
          email: email || '',
          token: token,
          autoLogin: true,
          loginTimestamp: new Date().toISOString()
        };

        localStorage.setItem('auth_user', JSON.stringify(authUser));
        console.log('[Auto-Login] ✓ Dados do usuário armazenados em auth_user');

        // 3. Salva em userData (compatibilidade com Dashboard)
        const userData = {
          token: token,
          userId: userId,
          nome: nome || '',
          email: email || ''
        };

        localStorage.setItem('userData', JSON.stringify(userData));
        console.log('[Auto-Login] ✓ Dados salvos em userData (compatibilidade)');

        // 4. Marca flag de auto-login
        sessionStorage.setItem('auto_login_processed', 'true');

        // 5. Remove parâmetros da URL (limpa a barra de endereço)
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        console.log('[Auto-Login] ✓ URL limpa');

        // 6. Dispara evento customizado para notificar componentes
        const autoLoginEvent = new CustomEvent('auto-login', {
          detail: { userId, nome, email }
        });
        window.dispatchEvent(autoLoginEvent);
        console.log('[Auto-Login] ✓ Evento auto-login disparado');

        // 7. Força atualização da página para carregar com autenticação
        console.log('[Auto-Login] ✓ Recarregando aplicação autenticada...');
        
        // Redireciona imediatamente para a raiz sem delay
        window.location.replace('/');

      } catch (error) {
        console.error('[Auto-Login] Erro ao processar auto-login:', error);
        // Em caso de erro, limpa os dados parciais
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('userData');
        sessionStorage.removeItem('auto_login_processed');
      }
    };

    // Executa o processamento
    processAutoLogin();
  }, [navigate]);
}

/**
 * Verifica se o usuário está autenticado via auto-login
 */
export function isAutoLoginActive(): boolean {
  const authToken = localStorage.getItem('auth_token');
  const authUser = localStorage.getItem('auth_user');
  
  return !!(authToken && authUser);
}

/**
 * Limpa dados de auto-login
 */
export function clearAutoLogin(): void {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  localStorage.removeItem('userData');
  sessionStorage.removeItem('auto_login_processed');
  console.log('[Auto-Login] Dados limpos');
}

/**
 * Obtém informações do usuário auto-logado
 */
export function getAutoLoginUser(): any | null {
  try {
    const authUserStr = localStorage.getItem('auth_user');
    if (!authUserStr) return null;
    
    const user = JSON.parse(authUserStr);
    return user.autoLogin ? user : null;
  } catch (error) {
    console.error('[Auto-Login] Erro ao recuperar usuário:', error);
    return null;
  }
}
