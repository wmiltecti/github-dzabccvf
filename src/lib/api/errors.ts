export type ServiceError = { code: string; message: string; details?: unknown };

export function friendlyError(e: any): ServiceError {
  const code = e?.code || e?.error?.code || e?.status || 'UNKNOWN';

  // Postgres error codes mais comuns
  if (code === '23505' || /unique/i.test(e?.message)) {
    return { code: 'UNIQUE', message: 'Registro duplicado. Já existe um item com esses dados.' };
  }
  if (code === '23514' || /check violation/i.test(e?.message)) {
    // Mensagens específicas que colocamos nos CHECKs
    if (/procurador/.test(e?.message)) {
      return { code: 'CHECK', message: 'Procurador exige upload da procuração.' };
    }
    if (/rural/i.test(e?.message) && /car/.test(e?.message)) {
      return { code: 'CHECK', message: 'Imóvel rural exige o código do CAR.' };
    }
    if (/coords|utm|dms/i.test(e?.message)) {
      return { code: 'CHECK', message: 'Informe ao menos um par de coordenadas (UTM ou DMS).' };
    }
    return { code: 'CHECK', message: 'Regra de negócio violada.' };
  }
  if (code === '42501' || /permission/i.test(e?.message)) {
    return { code: 'RLS', message: 'Permissão negada. Verifique se você tem acesso a este recurso.' };
  }
  if (code === '404') {
    return { code: 'NOT_FOUND', message: 'Recurso não encontrado.' };
  }

  // Storage
  if (/storage/i.test(e?.message) && /bucket/i.test(e?.message)) {
    return { code: 'STORAGE', message: 'Erro de armazenamento de arquivos.' };
  }

  // Fallback
  return { code: String(code), message: e?.message || 'Erro desconhecido', details: e };
}

export function err(message: string, code = 'APP'): ServiceError {
  return { code, message };
}
