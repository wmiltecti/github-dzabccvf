export function getAuthToken(): string | null {
  // Primeiro tenta auth_token (FastAPI)
  const fastapiToken = localStorage.getItem('auth_token');
  if (fastapiToken) {
    return fastapiToken;
  }

  // Fallback: tentar pegar do userData.token (Dashboard)
  try {
    const userData = localStorage.getItem('userData') || localStorage.getItem('userdata');
    if (userData) {
      const parsed = JSON.parse(userData);
      if (parsed?.token) return parsed.token;
    }
  } catch (e) {
    console.error('Erro ao fazer parse de userData para pegar token:', e);
  }

  // Último fallback: Supabase JWT
  const supabaseJwt = localStorage.getItem('supabase_jwt');
  if (supabaseJwt) {
    return supabaseJwt;
  }

  return null;
}

export function getAuthUser(): any | null {
  try {
    const authUserStr = localStorage.getItem('auth_user');
    if (!authUserStr) {
      return null;
    }

    const authUser = JSON.parse(authUserStr);
    return authUser;
  } catch (error) {
    console.error('Erro ao fazer parse de auth_user:', error);
    return null;
  }
}

export function getUserId(): string | null {
  const user = getAuthUser();
  
  // Tenta pegar de várias formas possíveis
  if (user?.userId) return user.userId;
  if (user?.id) return user.id;
  if (user?.pkpessoa) return user.pkpessoa;
  
  // Fallback: tentar pegar diretamente do userData (Dashboard)
  try {
    const userData = localStorage.getItem('userData') || localStorage.getItem('userdata');
    if (userData) {
      const parsed = JSON.parse(userData);
      if (parsed?.userId) return parsed.userId;
      if (parsed?.id) return parsed.id;
    }
  } catch (e) {
    console.error('Erro ao fazer parse de userData:', e);
  }
  
  return null;
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}
