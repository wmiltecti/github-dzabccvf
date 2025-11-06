import { supabase } from '../supabase';
import { Address, ID, PropertyPayload, PropertyTitlePayload } from './types';
import { friendlyError, err, ServiceError } from './errors';
import { createAddress } from './address';
import http from './http';

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

// Interface para resultado de busca de imóveis
export interface SearchImovelResult {
  id: number;
  kind: 'URBANO' | 'RURAL' | 'LINEAR';
  nome?: string;
  areatotal?: number;
  car_codigo?: string;
  matricula?: string;
  municipio_sede?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
  utm_lat?: string;
  utm_long?: string;
  dms_lat?: string;
  dms_long?: string;
  arquivogeorreferenciamento?: string;
}

// Função de busca de imóveis
export async function searchImoveis(query: string) {
  try {
    if (!query || query.trim().length < 3) {
      return { data: null, error: err('Digite pelo menos 3 caracteres para buscar', 'VALIDATION') };
    }

    const cleanQuery = query.trim();
    
    // Busca via API HTTP (assumindo que existe endpoint /imoveis/buscar)
    try {
      const { data } = await http.get(`/imoveis/buscar?q=${encodeURIComponent(cleanQuery)}`);
      return { data: data || [], error: null as ServiceError | null };
    } catch (apiError: any) {
      // Se a API HTTP não existir, usa Supabase como fallback
      console.warn('API HTTP não disponível, usando Supabase:', apiError.message);
      
      const { data, error } = await supabase
        .from('properties')
        .select(`
          id,
          kind,
          car_codigo,
          municipio_sede,
          utm_lat,
          utm_long,
          dms_lat,
          dms_long,
          address:addresses!address_id (
            logradouro,
            numero,
            bairro,
            municipio,
            uf,
            cep
          ),
          titles:property_titles (
            matricula
          )
        `)
        .or(`car_codigo.ilike.%${cleanQuery}%,municipio_sede.ilike.%${cleanQuery}%`)
        .limit(50);

      if (error) {
        return { data: null, error: friendlyError(error) };
      }

      // Transforma os dados do Supabase para o formato esperado
      const formattedData = (data || []).map((imovel: any) => ({
  id: imovel.id,
  kind: imovel.kind,
  car_codigo: imovel.car_codigo,
  matricula: imovel.titles?.[0]?.matricula,
  municipio_sede: imovel.municipio_sede,
  logradouro: imovel.address?.logradouro,
  numero: imovel.address?.numero,
  bairro: imovel.address?.bairro,
  municipio: imovel.address?.municipio,
  uf: imovel.address?.uf,
  cep: imovel.address?.cep,
  utm_lat: imovel.utm_lat,
  utm_long: imovel.utm_long,
  dms_lat: imovel.dms_lat,
  dms_long: imovel.dms_long,
  arquivogeorreferenciamento: imovel.arquivogeorreferenciamento,
      }));

      return { data: formattedData, error: null as ServiceError | null };
    }
  } catch (error: any) {
    const status = error?.response?.status;
    const detail = error?.response?.data?.detail;
    const message = error?.response?.data?.message || error?.message;

    if (status === 400) {
      const errorMessage = detail || 'Parâmetros de busca inválidos. Verifique e tente novamente.';
      return { data: null, error: err(errorMessage, 'VALIDATION') };
    } else if (status === 404) {
      return { data: [], error: null as ServiceError | null };
    } else if (status === 500) {
      const errorMessage = detail || 'Erro interno no servidor ao buscar imóveis. Tente novamente mais tarde.';
      return { data: null, error: err(errorMessage, 'SERVER_ERROR') };
    } else if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
      return { data: null, error: err('Tempo de resposta excedido. Verifique sua conexão e tente novamente.', 'TIMEOUT') };
    } else if (!error?.response) {
      return { data: null, error: err('Não foi possível conectar ao servidor. Verifique sua conexão com a internet.', 'NETWORK_ERROR') };
    }

    const fallbackMessage = detail || message || 'Erro ao buscar imóveis. Tente novamente.';
    return { data: null, error: err(fallbackMessage, 'UNKNOWN') };
  }
}
