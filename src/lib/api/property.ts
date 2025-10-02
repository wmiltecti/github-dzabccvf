import { supabase } from '../supabaseClient';
import { Address, ID, PropertyPayload, PropertyTitlePayload } from './types';
import { friendlyError, err } from './errors';
import { createAddress } from './address';

// helpers
const hasUTM = (p: PropertyPayload) => !!(p.utm_lat && p.utm_long);
const hasDMS = (p: PropertyPayload) => !!(p.dms_lat && p.dms_long);

async function requireProfileId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw err('Usuário não autenticado', 'AUTH');
  return user.id;
}

export async function createProperty(p: PropertyPayload) {
  if (!(hasUTM(p) || hasDMS(p))) return { data: null, error: err('Informe ao menos um par de coordenadas (UTM ou DMS).') };
  if (p.kind === 'RURAL' && !p.car_codigo) return { data: null, error: err('Imóvel rural exige código do CAR.') };

  const created_by = await requireProfileId();

  let address_id: ID | null = null;
  if (typeof p.address === 'object' && p.address) {
    const { data, error } = await createAddress(p.address as Address);
    if (error) return { data: null, error };
    address_id = (data as any).id;
  } else if (typeof p.address === 'number') {
    address_id = p.address;
  }

  const { data, error } = await supabase.from('properties')
    .insert({
      kind: p.kind,
      municipio_sede: p.municipio_sede || null,
      roteiro_acesso: p.roteiro_acesso || null,
      utm_lat: p.utm_lat || null,
      utm_long: p.utm_long || null,
      utm_zona: p.utm_zona || null,
      dms_lat: p.dms_lat || null,
      dms_long: p.dms_long || null,
      car_codigo: p.car_codigo || null,
      address_id,
      created_by,
    })
    .select()
    .single();

  if (error) return { data: null, error: friendlyError(error) };
  return { data, error: null };
}

export async function addTitle(propertyId: ID, t: PropertyTitlePayload) {
  const { data, error } = await supabase.from('property_titles')
    .insert({
      property_id: propertyId,
      tipo_cartorio: t.tipo_cartorio || null,
      nome_cartorio: t.nome_cartorio || null,
      comarca: t.comarca || null,
      uf: t.uf || null,
      matricula: t.matricula || null,
      livro: t.livro || null,
      folha: t.folha || null,
      area_total_ha: t.area_total_ha ?? null,
      created_by: (await supabase.auth.getUser()).data.user?.id!,
    })
    .select()
    .single();
  if (error) return { data: null, error: friendlyError(error) };
  return { data, error: null };
}

export async function listTitles(propertyId: ID) {
  const { data, error } = await supabase.from('property_titles').select('*').eq('property_id', propertyId).order('id');
  if (error) return { data: null, error: friendlyError(error) };
  return { data, error: null };
}
