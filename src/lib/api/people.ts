import { supabase } from '../supabaseClient';
import { friendlyError, err, ServiceError } from './errors';
import { ID, PersonPF, PersonPJ } from './types';

// helpers
const onlyDigits = (s?: string | null) => (s || '').replace(/\D+/g, '');
const isCPF = (v?: string | null) => onlyDigits(v).length === 11;
const isCNPJ = (v?: string | null) => onlyDigits(v).length === 14;

async function requireProfileId(): Promise<string> {
  const { data: { user }, error: e1 } = await supabase.auth.getUser();
  if (e1 || !user) throw err('Usuário não autenticado', 'AUTH');
  const uid = user.id;

  const { data, error } = await supabase.from('profiles').select('id').eq('id', uid).single();
  if (error) throw friendlyError(error);
  return data.id as string;
}

export async function getByCpfCnpj(cpfOrCnpj: string) {
  const key = onlyDigits(cpfOrCnpj);
  const { data, error } = await supabase
    .from('people')
    .select('*')
    .eq('cpf_cnpj', key)
    .maybeSingle();
  if (error) return { data: null, error: friendlyError(error) };
  return { data, error: null as ServiceError | null };
}

export async function createPF(payload: PersonPF) {
  if (!isCPF(payload.cpf)) return { data: null, error: err('CPF inválido.') };
  const created_by = await requireProfileId();

  const { data, error } = await supabase
    .from('people')
    .insert({
      type: 'PF',
      cpf_cnpj: onlyDigits(payload.cpf),
      nome_razao: payload.nome.trim(),
      sexo: payload.sexo || null,
      estado_civil: payload.estado_civil || null,
      nacionalidade: payload.nacionalidade || null,
      profissao: payload.profissao || null,
      celular: payload.celular || null,
      email: payload.email || null,
      created_by,
    })
    .select()
    .single();

  if (error) return { data: null, error: friendlyError(error) };
  return { data, error: null };
}

export async function createPJ(payload: PersonPJ) {
  if (!isCNPJ(payload.cnpj)) return { data: null, error: err('CNPJ inválido.') };
  const created_by = await requireProfileId();

  const { data, error } = await supabase
    .from('people')
    .insert({
      type: 'PJ',
      cpf_cnpj: onlyDigits(payload.cnpj),
      nome_razao: payload.razao_social.trim(),
      inscricao_estadual: payload.inscricao_estadual || null,
      celular: payload.celular || null,
      email: payload.email || null,
      created_by,
    })
    .select()
    .single();

  if (error) return { data: null, error: friendlyError(error) };
  return { data, error: null };
}

export async function updatePerson(id: ID, patch: Partial<Record<string, any>>) {
  const { data, error } = await supabase.from('people').update(patch).eq('id', id).select().single();
  if (error) return { data: null, error: friendlyError(error) };
  return { data, error: null };
}
