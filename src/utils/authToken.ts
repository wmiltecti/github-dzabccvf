export function getAuthToken(): string | null {
  const fastapiToken = localStorage.getItem('auth_token');
  if (fastapiToken) {
    return fastapiToken;
  }

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
  return user?.userId || user?.id || null;
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}
