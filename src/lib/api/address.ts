import { supabase } from '../supabaseClient';
import { Address, ID } from './types';
import { friendlyError } from './errors';

async function requireProfileId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Auth');
  return user.id;
}

export async function createAddress(a: Address) {
  const created_by = await requireProfileId();
  const { data, error } = await supabase.from('addresses')
    .insert({
      cep: a.cep || null,
      logradouro: a.logradouro || null,
      numero: a.numero || null,
      bairro: a.bairro || null,
      complemento: a.complemento || null,
      ponto_referencia: a.ponto_referencia || null,
      uf: a.uf || null,
      municipio: a.municipio || null,
      created_by,
    })
    .select()
    .single();
  if (error) return { data: null, error: friendlyError(error) };
  return { data, error: null };
}

export async function getAddressById(id: ID) {
  const { data, error } = await supabase.from('addresses').select('*').eq('id', id).single();
  if (error) return { data: null, error: friendlyError(error) };
  return { data, error: null };
}
