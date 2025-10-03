// src/lib/api/process.ts
import { supabase } from '../supabaseClient'; // 🔧 use SEMPRE o mesmo client
import { friendlyError, err } from './errors';
import { ID, ParticipantRole } from './types';

/** Garante usuário logado e retorna o UUID (auth.users.id / profiles.id) */
async function requireProfileId(): Promise<string> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw err('Usuário não autenticado', 'AUTH');
  return user.id; // UUID
}

/** Cria rascunho de processo na TABELA CORRETA (public.processes) */
export async function createRascunho() {
  const created_by = await requireProfileId(); // UUID
  const { data, error } = await supabase
    .from('processes') // ✅ tabela certa
    .insert({
      status: 'RASCUNHO',      // ✅ padronizado
      created_by,              // ✅ uuid de quem criou
      // opcionalmente já marque a origem:
      // created_via: 'INSCRICAO'
    })
    .select()
    .single();

  if (error) return { data: null, error: friendlyError(error) };
  return { data, error: null };
}

/** Vincula imóvel ao processo (processes.id é bigint) */
export async function linkProperty(processId: number, propertyId: number) {
  const { data, error } = await supabase
    .from('processes')
    .update({ property_id: propertyId })
    .eq('id', processId) // ✅ bigint
    .select()
    .single();

  if (error) return { data: null, error: friendlyError(error) };
  return { data, error: null };
}

type UpsertParticipantInput = {
  personId: ID; // normalmente bigint
  role: ParticipantRole;
  procuracao_file_id?: string | null;
};

/**
 * Vincula/atualiza participante do processo.
 * Regras:
 * - Apenas 1 REQUERENTE por processo (unique no BD).
 * - PROCURADOR exige procuracao_file_id.
 */
export async function upsertParticipant(processId: ID, input: UpsertParticipantInput) {
  if (input.role === 'PROCURADOR' && !input.procuracao_file_id) {
    return { data: null, error: err('Procurador exige upload da procuração.') };
  }

  const payload: any = {
    process_id: processId,
    person_id: input.personId,
    role: input.role,
    procuracao_file_id: input.procuracao_file_id ?? null,
  };

  const ins = await supabase.from('process_participants').insert(payload).select().maybeSingle();

  if (ins.error) {
    const msg = String(ins.error.message || '');
    if (ins.error.code === '23505' || /unique/i.test(msg)) {
      if (input.role === 'REQUERENTE') {
        return { data: null, error: err('Somente um requerente pode ser vinculado por processo.', 'UNIQUE') };
      }
      // Atualiza o mesmo par (process/person/role)
      const upd = await supabase.from('process_participants')
        .update(payload)
        .match({ process_id: processId, person_id: input.personId, role: input.role })
        .select()
        .single();
      if (upd.error) return { data: null, error: friendlyError(upd.error) };
      return { data: upd.data, error: null };
    }
    return { data: null, error: friendlyError(ins.error) };
  }

  return { data: ins.data, error: null };
}

/** Lista participantes do processo (process_id = bigint) */
export async function getParticipants(processId: ID) {
  const { data, error } = await supabase
    .from('process_participants')
    .select('*, people(*)')
    .eq('process_id', processId); // ✅ bigint

  if (error) return { data: null, error: friendlyError(error) };
  return { data, error: null };
}

/** Remove participante do processo */
export async function removeParticipant(processId: ID, personId: ID, role: ParticipantRole) {
  const { data, error } = await supabase
    .from('process_participants')
    .delete()
    .match({ process_id: processId, person_id: personId, role });

  if (error) return { data: null, error: friendlyError(error) };
  return { data, error: null };
}

/** Vincula atividade ao processo */
export async function linkActivity(processId: number, atividadeId: number) {
  const { data, error } = await supabase
    .from('processes') // ✅ tabela certa (antes estava em license_processes)
    .update({ atividade_id: atividadeId })
    .eq('id', processId) // ✅ bigint
    .select()
    .single();

  if (error) return { data: null, error: friendlyError(error) };
  return { data, error: null };
}

/**
 * Retorna um "snapshot" do processo com dados auxiliares.
 * Evita joins frágeis; busca em chamadas separadas e compõe.
 */
export async function getFull(processId: ID) {
  // Processo básico
  const proc = await supabase
    .from('processes')
    .select('id, status, created_by, property_id, atividade_id, created_via, inserted_at, updated_at')
    .eq('id', processId)
    .single();

  if (proc.error) return { data: null, error: friendlyError(proc.error) };

  // Participantes (com dados da pessoa)
  const participants = await supabase
    .from('process_participants')
    .select('id, role, procuracao_file_id, person_id, people(*)')
    .eq('process_id', processId);

  if (participants.error) return { data: null, error: friendlyError(participants.error) };

  // Imóvel (se houver)
  let propertyData: any = null;
  if (proc.data?.property_id) {
    const property = await supabase
      .from('properties')
      .select('*')
      .eq('id', proc.data.property_id)
      .single();
    if (property.error) return { data: null, error: friendlyError(property.error) };
    propertyData = property.data;
  }

  // Títulos do imóvel (se houver)
  let titlesData: any[] = [];
  if (proc.data?.property_id) {
    const titles = await supabase
      .from('property_titles')
      .select('*')
      .eq('property_id', proc.data.property_id);
    if (titles.error) return { data: null, error: friendlyError(titles.error) };
    titlesData = titles.data ?? [];
  }

  return {
    data: {
      process: proc.data,
      participants: participants.data ?? [],
      property: propertyData,
      titles: titlesData,
    },
    error: null,
  };
}
